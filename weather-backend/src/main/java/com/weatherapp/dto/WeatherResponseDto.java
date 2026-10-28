package com.weatherapp.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Main consolidated weather response payload returned by /api/weather?city=...
 */
public class WeatherResponseDto {

    private String cityName;
    private String country;
    private Double latitude;
    private Double longitude;
    private String timezone;
    private Double temperature;
    private Double feelsLike;
    private Integer humidity;
    private Double windSpeed;
    private Integer weatherCode;
    private String weatherDescription;
    private Boolean isDay;
    private Double pressure;
    private Double uvIndex;
    private String sunrise;
    private String sunset;
    private List<HourlyForecastDto> hourlyForecast = new ArrayList<>();
    private List<DailyForecastDto> dailyForecast = new ArrayList<>();
    private List<WeatherRecommendationDto> recommendations = new ArrayList<>();

    public WeatherResponseDto() {
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getFeelsLike() {
        return feelsLike;
    }

    public void setFeelsLike(Double feelsLike) {
        this.feelsLike = feelsLike;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Integer getWeatherCode() {
        return weatherCode;
    }

    public void setWeatherCode(Integer weatherCode) {
        this.weatherCode = weatherCode;
    }

    public String getWeatherDescription() {
        return weatherDescription;
    }

    public void setWeatherDescription(String weatherDescription) {
        this.weatherDescription = weatherDescription;
    }

    public Boolean getIsDay() {
        return isDay;
    }

    public void setIsDay(Boolean day) {
        isDay = day;
    }

    public Double getPressure() {
        return pressure;
    }

    public void setPressure(Double pressure) {
        this.pressure = pressure;
    }

    public Double getUvIndex() {
        return uvIndex;
    }

    public void setUvIndex(Double uvIndex) {
        this.uvIndex = uvIndex;
    }

    public String getSunrise() {
        return sunrise;
    }

    public void setSunrise(String sunrise) {
        this.sunrise = sunrise;
    }

    public String getSunset() {
        return sunset;
    }

    public void setSunset(String sunset) {
        this.sunset = sunset;
    }

    public List<HourlyForecastDto> getHourlyForecast() {
        return hourlyForecast;
    }

    public void setHourlyForecast(List<HourlyForecastDto> hourlyForecast) {
        this.hourlyForecast = hourlyForecast;
    }

    public List<DailyForecastDto> getDailyForecast() {
        return dailyForecast;
    }

    public void setDailyForecast(List<DailyForecastDto> dailyForecast) {
        this.dailyForecast = dailyForecast;
    }

    public List<WeatherRecommendationDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<WeatherRecommendationDto> recommendations) {
        this.recommendations = recommendations;
    }
}
