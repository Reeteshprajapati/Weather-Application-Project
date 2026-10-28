package com.weatherapp.client;

import com.weatherapp.dto.GeocodingResponseDto;
import com.weatherapp.dto.OpenMeteoForecastResponseDto;
import com.weatherapp.exception.WeatherServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * Synchronous HTTP client communicating directly with Open-Meteo Web APIs.
 */
@Component
public class OpenMeteoClient {

    private static final Logger logger = LoggerFactory.getLogger(OpenMeteoClient.class);

    private final RestClient restClient;
    private final String geocodingUrl;
    private final String forecastUrl;

    public OpenMeteoClient(RestClient restClient,
                           @Value("${openmeteo.geocoding.url}") String geocodingUrl,
                           @Value("${openmeteo.forecast.url}") String forecastUrl) {
        this.restClient = restClient;
        this.geocodingUrl = geocodingUrl;
        this.forecastUrl = forecastUrl;
    }

    /**
     * Search for a city by name via Open-Meteo Geocoding API.
     * Safely encodes the city name.
     *
     * @param cityName the name of the city
     * @return GeocodingResponseDto containing matching results
     */
    public GeocodingResponseDto searchCity(String cityName) {
        URI uri = UriComponentsBuilder.fromUriString(geocodingUrl)
                .queryParam("name", cityName)
                .queryParam("count", 5)
                .queryParam("language", "en")
                .queryParam("format", "json")
                .build()
                .encode()
                .toUri();

        logger.debug("Calling Open-Meteo Geocoding API: {}", uri);

        try {
            GeocodingResponseDto response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GeocodingResponseDto.class);

            return response != null ? response : new GeocodingResponseDto();
        } catch (RestClientException ex) {
            logger.error("Error communicating with Geocoding API for city '{}': {}", cityName, ex.getMessage());
            throw new WeatherServiceException("Unable to contact geocoding service: " + ex.getMessage(), ex);
        }
    }

    /**
     * Fetch current weather, hourly forecast, and 7-day daily forecast for coordinates.
     *
     * @param latitude  the latitude
     * @param longitude the longitude
     * @param timezone  the timezone string (e.g. "auto" or "Asia/Kolkata")
     * @return OpenMeteoForecastResponseDto
     */
    public OpenMeteoForecastResponseDto fetchForecast(double latitude, double longitude, String timezone) {
        URI uri = UriComponentsBuilder.fromUriString(forecastUrl)
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure")
                .queryParam("hourly", "temperature_2m,weather_code")
                .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max")
                .queryParam("timezone", (timezone != null && !timezone.isBlank()) ? timezone : "auto")
                .queryParam("forecast_days", 7)
                .build()
                .encode()
                .toUri();

        logger.debug("Calling Open-Meteo Forecast API: {}", uri);

        try {
            OpenMeteoForecastResponseDto response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(OpenMeteoForecastResponseDto.class);

            if (response == null) {
                throw new WeatherServiceException("External forecast service returned an empty response.");
            }
            return response;
        } catch (RestClientException ex) {
            logger.error("Error communicating with Forecast API: {}", ex.getMessage());
            throw new WeatherServiceException("Unable to contact weather forecast service: " + ex.getMessage(), ex);
        }
    }

    /**
     * Test connectivity to Open-Meteo service.
     */
    public boolean checkProviderHealth() {
        try {
            URI testUri = UriComponentsBuilder.fromUriString(geocodingUrl)
                    .queryParam("name", "London")
                    .queryParam("count", 1)
                    .build()
                    .encode()
                    .toUri();

            GeocodingResponseDto response = restClient.get()
                    .uri(testUri)
                    .retrieve()
                    .body(GeocodingResponseDto.class);

            return response != null && response.getResults() != null;
        } catch (Exception ex) {
            logger.warn("Health check call to Open-Meteo failed: {}", ex.getMessage());
            return false;
        }
    }
}
