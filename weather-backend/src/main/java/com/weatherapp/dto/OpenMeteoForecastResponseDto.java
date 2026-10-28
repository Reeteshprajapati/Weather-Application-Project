package com.weatherapp.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO matching Open-Meteo Forecast API response payload.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenMeteoForecastResponseDto {

    private Double latitude;
    private Double longitude;
    private String timezone;

    @JsonProperty("current")
    private CurrentWeather current;

    @JsonProperty("hourly")
    private HourlyWeather hourly;

    @JsonProperty("daily")
    private DailyWeather daily;

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

    public CurrentWeather getCurrent() {
        return current;
    }

    public void setCurrent(CurrentWeather current) {
        this.current = current;
    }

    public HourlyWeather getHourly() {
        return hourly;
    }

    public void setHourly(HourlyWeather hourly) {
        this.hourly = hourly;
    }

    public DailyWeather getDaily() {
        return daily;
    }

    public void setDaily(DailyWeather daily) {
        this.daily = daily;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CurrentWeather {
        private String time;

        @JsonProperty("temperature_2m")
        private Double temperature2m;

        @JsonProperty("apparent_temperature")
        private Double apparentTemperature;

        @JsonProperty("relative_humidity_2m")
        private Integer relativeHumidity2m;

        @JsonProperty("wind_speed_10m")
        private Double windSpeed10m;

        @JsonProperty("surface_pressure")
        private Double surfacePressure;

        @JsonProperty("weather_code")
        private Integer weatherCode;

        @JsonProperty("is_day")
        private Integer isDay;

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public Double getTemperature2m() {
            return temperature2m;
        }

        public void setTemperature2m(Double temperature2m) {
            this.temperature2m = temperature2m;
        }

        public Double getApparentTemperature() {
            return apparentTemperature;
        }

        public void setApparentTemperature(Double apparentTemperature) {
            this.apparentTemperature = apparentTemperature;
        }

        public Integer getRelativeHumidity2m() {
            return relativeHumidity2m;
        }

        public void setRelativeHumidity2m(Integer relativeHumidity2m) {
            this.relativeHumidity2m = relativeHumidity2m;
        }

        public Double getWindSpeed10m() {
            return windSpeed10m;
        }

        public void setWindSpeed10m(Double windSpeed10m) {
            this.windSpeed10m = windSpeed10m;
        }

        public Double getSurfacePressure() {
            return surfacePressure;
        }

        public void setSurfacePressure(Double surfacePressure) {
            this.surfacePressure = surfacePressure;
        }

        public Integer getWeatherCode() {
            return weatherCode;
        }

        public void setWeatherCode(Integer weatherCode) {
            this.weatherCode = weatherCode;
        }

        public Integer getIsDay() {
            return isDay;
        }

        public void setIsDay(Integer isDay) {
            this.isDay = isDay;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HourlyWeather {
        private List<String> time;

        @JsonProperty("temperature_2m")
        private List<Double> temperature2m;

        @JsonProperty("weather_code")
        private List<Integer> weatherCode;

        public List<String> getTime() {
            return time;
        }

        public void setTime(List<String> time) {
            this.time = time;
        }

        public List<Double> getTemperature2m() {
            return temperature2m;
        }

        public void setTemperature2m(List<Double> temperature2m) {
            this.temperature2m = temperature2m;
        }

        public List<Integer> getWeatherCode() {
            return weatherCode;
        }

        public void setWeatherCode(List<Integer> weatherCode) {
            this.weatherCode = weatherCode;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyWeather {
        private List<String> time;

        @JsonProperty("temperature_2m_max")
        private List<Double> temperature2mMax;

        @JsonProperty("temperature_2m_min")
        private List<Double> temperature2mMin;

        @JsonProperty("weather_code")
        private List<Integer> weatherCode;

        @JsonProperty("precipitation_probability_max")
        private List<Integer> precipitationProbabilityMax;

        @JsonProperty("sunrise")
        private List<String> sunrise;

        @JsonProperty("sunset")
        private List<String> sunset;

        @JsonProperty("uv_index_max")
        private List<Double> uvIndexMax;

        public List<String> getTime() {
            return time;
        }

        public void setTime(List<String> time) {
            this.time = time;
        }

        public List<Double> getTemperature2mMax() {
            return temperature2mMax;
        }

        public void setTemperature2mMax(List<Double> temperature2mMax) {
            this.temperature2mMax = temperature2mMax;
        }

        public List<Double> getTemperature2mMin() {
            return temperature2mMin;
        }

        public void setTemperature2mMin(List<Double> temperature2mMin) {
            this.temperature2mMin = temperature2mMin;
        }

        public List<Integer> getWeatherCode() {
            return weatherCode;
        }

        public void setWeatherCode(List<Integer> weatherCode) {
            this.weatherCode = weatherCode;
        }

        public List<Integer> getPrecipitationProbabilityMax() {
            return precipitationProbabilityMax;
        }

        public void setPrecipitationProbabilityMax(List<Integer> precipitationProbabilityMax) {
            this.precipitationProbabilityMax = precipitationProbabilityMax;
        }

        public List<String> getSunrise() {
            return sunrise;
        }

        public void setSunrise(List<String> sunrise) {
            this.sunrise = sunrise;
        }

        public List<String> getSunset() {
            return sunset;
        }

        public void setSunset(List<String> sunset) {
            this.sunset = sunset;
        }

        public List<Double> getUvIndexMax() {
            return uvIndexMax;
        }

        public void setUvIndexMax(List<Double> uvIndexMax) {
            this.uvIndexMax = uvIndexMax;
        }
    }
}
