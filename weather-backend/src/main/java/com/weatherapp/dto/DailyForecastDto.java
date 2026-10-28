package com.weatherapp.dto;

/**
 * Daily forecast minimum and maximum temperature data point.
 */
public class DailyForecastDto {

    private String date;
    private Double minTemperature;
    private Double maxTemperature;
    private Integer weatherCode;

    public DailyForecastDto() {
    }

    public DailyForecastDto(String date, Double minTemperature, Double maxTemperature, Integer weatherCode) {
        this.date = date;
        this.minTemperature = minTemperature;
        this.maxTemperature = maxTemperature;
        this.weatherCode = weatherCode;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Double getMinTemperature() {
        return minTemperature;
    }

    public void setMinTemperature(Double minTemperature) {
        this.minTemperature = minTemperature;
    }

    public Double getMaxTemperature() {
        return maxTemperature;
    }

    public void setMaxTemperature(Double maxTemperature) {
        this.maxTemperature = maxTemperature;
    }

    public Integer getWeatherCode() {
        return weatherCode;
    }

    public void setWeatherCode(Integer weatherCode) {
        this.weatherCode = weatherCode;
    }
}
