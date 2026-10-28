package com.weatherapp.service;

import com.weatherapp.client.OpenMeteoClient;
import com.weatherapp.dto.*;
import com.weatherapp.exception.CityNotFoundException;
import com.weatherapp.exception.InvalidCityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service orchestrating weather retrieval, data mapping, and validation.
 */
@Service
public class WeatherService {

    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);

    private final OpenMeteoClient openMeteoClient;
    private final WeatherRecommendationService recommendationService;

    public WeatherService(OpenMeteoClient openMeteoClient, WeatherRecommendationService recommendationService) {
        this.openMeteoClient = openMeteoClient;
        this.recommendationService = recommendationService;
    }

    /**
     * Retrieves complete weather information for the specified city.
     *
     * @param cityName Name of the city (e.g. "Indore")
     * @return WeatherResponseDto
     */
    public WeatherResponseDto getWeatherForCity(String cityName) {
        if (cityName == null || cityName.trim().isEmpty()) {
            throw new InvalidCityException("City name parameter cannot be empty or blank.");
        }

        String cleanedCity = cityName.trim();
        logger.info("Fetching weather for city: '{}'", cleanedCity);

        // 1. Geocoding search
        GeocodingResponseDto geocodingResponse = openMeteoClient.searchCity(cleanedCity);
        List<GeocodingResponseDto.Location> results = geocodingResponse.getResults();

        if (results == null || results.isEmpty()) {
            logger.warn("No geocoding match found for city: '{}'", cleanedCity);
            throw new CityNotFoundException("City not found: " + cleanedCity);
        }

        GeocodingResponseDto.Location primaryLocation = results.get(0);
        double latitude = primaryLocation.getLatitude();
        double longitude = primaryLocation.getLongitude();
        String timezone = primaryLocation.getTimezone();

        // 2. Forecast retrieval
        OpenMeteoForecastResponseDto forecast = openMeteoClient.fetchForecast(latitude, longitude, timezone);

        // 3. Assemble response DTO
        WeatherResponseDto responseDto = new WeatherResponseDto();
        responseDto.setCityName(primaryLocation.getName());
        responseDto.setCountry(primaryLocation.getCountry());
        responseDto.setLatitude(latitude);
        responseDto.setLongitude(longitude);
        responseDto.setTimezone(forecast.getTimezone() != null ? forecast.getTimezone() : timezone);

        // Current weather
        OpenMeteoForecastResponseDto.CurrentWeather current = forecast.getCurrent();
        if (current != null) {
            responseDto.setTemperature(current.getTemperature2m());
            responseDto.setFeelsLike(current.getApparentTemperature());
            responseDto.setHumidity(current.getRelativeHumidity2m());
            responseDto.setWindSpeed(current.getWindSpeed10m());
            responseDto.setPressure(current.getSurfacePressure());
            responseDto.setWeatherCode(current.getWeatherCode());
            responseDto.setWeatherDescription(mapWeatherCodeToDescription(current.getWeatherCode()));
            responseDto.setIsDay(current.getIsDay() != null && current.getIsDay() == 1);
        }

        // Hourly forecast (next 24 hours)
        OpenMeteoForecastResponseDto.HourlyWeather hourly = forecast.getHourly();
        if (hourly != null && hourly.getTime() != null && !hourly.getTime().isEmpty()) {
            List<HourlyForecastDto> hourlyList = new ArrayList<>();
            int maxHourly = Math.min(24, hourly.getTime().size());
            for (int i = 0; i < maxHourly; i++) {
                String time = hourly.getTime().get(i);
                Double temp = (hourly.getTemperature2m() != null && i < hourly.getTemperature2m().size())
                        ? hourly.getTemperature2m().get(i) : null;
                Integer code = (hourly.getWeatherCode() != null && i < hourly.getWeatherCode().size())
                        ? hourly.getWeatherCode().get(i) : null;

                hourlyList.add(new HourlyForecastDto(time, temp, code));
            }
            responseDto.setHourlyForecast(hourlyList);
        }

        // Daily forecast (7 days)
        OpenMeteoForecastResponseDto.DailyWeather daily = forecast.getDaily();
        if (daily != null && daily.getTime() != null && !daily.getTime().isEmpty()) {
            List<DailyForecastDto> dailyList = new ArrayList<>();
            int maxDaily = Math.min(7, daily.getTime().size());
            for (int i = 0; i < maxDaily; i++) {
                String date = daily.getTime().get(i);
                Double min = (daily.getTemperature2mMin() != null && i < daily.getTemperature2mMin().size())
                        ? daily.getTemperature2mMin().get(i) : null;
                Double max = (daily.getTemperature2mMax() != null && i < daily.getTemperature2mMax().size())
                        ? daily.getTemperature2mMax().get(i) : null;
                Integer code = (daily.getWeatherCode() != null && i < daily.getWeatherCode().size())
                        ? daily.getWeatherCode().get(i) : null;

                dailyList.add(new DailyForecastDto(date, min, max, code));
            }
            responseDto.setDailyForecast(dailyList);

            if (daily.getUvIndexMax() != null && !daily.getUvIndexMax().isEmpty()) {
                responseDto.setUvIndex(daily.getUvIndexMax().get(0));
            }
            if (daily.getSunrise() != null && !daily.getSunrise().isEmpty()) {
                responseDto.setSunrise(daily.getSunrise().get(0));
            }
            if (daily.getSunset() != null && !daily.getSunset().isEmpty()) {
                responseDto.setSunset(daily.getSunset().get(0));
            }
        }

        // 4. Generate rule-based weather recommendations
        Double maxPrecipProb = null;
        if (daily != null && daily.getPrecipitationProbabilityMax() != null && !daily.getPrecipitationProbabilityMax().isEmpty()) {
            Integer rawProb = daily.getPrecipitationProbabilityMax().get(0);
            maxPrecipProb = rawProb != null ? rawProb.doubleValue() : null;
        }

        List<WeatherRecommendationDto> recommendations = recommendationService.generateRecommendations(
                maxPrecipProb,
                responseDto.getUvIndex(),
                responseDto.getWindSpeed(),
                responseDto.getTemperature(),
                responseDto.getWeatherCode()
        );
        responseDto.setRecommendations(recommendations);

        logger.info("Successfully assembled weather data for '{}', current temp: {}°C, recommendations count: {}",
                primaryLocation.getName(), responseDto.getTemperature(), recommendations.size());

        return responseDto;
    }

    /**
     * Checks service health and external provider connectivity.
     */
    public HealthResponseDto checkHealth() {
        boolean providerOnline = openMeteoClient.checkProviderHealth();
        String providerStatus = providerOnline ? "Open-Meteo reachable" : "Open-Meteo unreachable or timed out";
        return new HealthResponseDto(
                "UP",
                "weather-backend",
                "Weather Backend API is up and running.",
                providerStatus
        );
    }

    /**
     * Translates WMO weather interpretation codes into human-readable descriptions.
     */
    public static String mapWeatherCodeToDescription(Integer code) {
        if (code == null) return "Unknown";
        return switch (code) {
            case 0 -> "Clear Sky";
            case 1 -> "Mainly Clear";
            case 2 -> "Partly Cloudy";
            case 3 -> "Overcast";
            case 45 -> "Foggy";
            case 48 -> "Depositing Rime Fog";
            case 51 -> "Light Drizzle";
            case 53 -> "Moderate Drizzle";
            case 55 -> "Dense Drizzle";
            case 56, 57 -> "Freezing Drizzle";
            case 61 -> "Slight Rain";
            case 63 -> "Moderate Rain";
            case 65 -> "Heavy Rain";
            case 66, 67 -> "Freezing Rain";
            case 71 -> "Slight Snow Fall";
            case 73 -> "Moderate Snow Fall";
            case 75 -> "Heavy Snow Fall";
            case 77 -> "Snow Grains";
            case 80, 81, 82 -> "Rain Showers";
            case 85, 86 -> "Snow Showers";
            case 95 -> "Thunderstorm";
            case 96, 99 -> "Thunderstorm with Hail";
            default -> "Clear Sky";
        };
    }
}
