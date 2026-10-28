package com.weatherapp.dto;

/**
 * Hourly weather forecast data point.
 */
public class HourlyForecastDto {

    private String time;
    private Double temperature;
    private Integer weatherCode;

    public HourlyForecastDto() {
    }

    public HourlyForecastDto(String time, Double temperature, Integer weatherCode) {
        this.time = time;
        this.temperature = temperature;
        this.weatherCode = weatherCode;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getWeatherCode() {
        return weatherCode;
    }

    public void setWeatherCode(Integer weatherCode) {
        this.weatherCode = weatherCode;
    }
}
