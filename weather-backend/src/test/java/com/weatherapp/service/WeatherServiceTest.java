package com.weatherapp.service;

import com.weatherapp.client.OpenMeteoClient;
import com.weatherapp.dto.GeocodingResponseDto;
import com.weatherapp.dto.OpenMeteoForecastResponseDto;
import com.weatherapp.dto.WeatherResponseDto;
import com.weatherapp.exception.CityNotFoundException;
import com.weatherapp.exception.InvalidCityException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private OpenMeteoClient openMeteoClient;

    @Spy
    private WeatherRecommendationService recommendationService = new WeatherRecommendationService();

    @InjectMocks
    private WeatherService weatherService;

    private GeocodingResponseDto mockGeocodingResponse;
    private OpenMeteoForecastResponseDto mockForecastResponse;

    @BeforeEach
    void setUp() {
        // Setup mock geocoding location
        GeocodingResponseDto.Location loc = new GeocodingResponseDto.Location();
        loc.setId(12345L);
        loc.setName("Indore");
        loc.setCountry("India");
        loc.setLatitude(22.7196);
        loc.setLongitude(75.8577);
        loc.setTimezone("Asia/Kolkata");

        mockGeocodingResponse = new GeocodingResponseDto();
        mockGeocodingResponse.setResults(List.of(loc));

        // Setup mock forecast
        mockForecastResponse = new OpenMeteoForecastResponseDto();
        mockForecastResponse.setLatitude(22.7196);
        mockForecastResponse.setLongitude(75.8577);
        mockForecastResponse.setTimezone("Asia/Kolkata");

        OpenMeteoForecastResponseDto.CurrentWeather current = new OpenMeteoForecastResponseDto.CurrentWeather();
        current.setTemperature2m(28.5);
        current.setApparentTemperature(29.0);
        current.setRelativeHumidity2m(60);
        current.setWindSpeed10m(12.0);
        current.setWeatherCode(0);
        current.setIsDay(1);
        mockForecastResponse.setCurrent(current);

        OpenMeteoForecastResponseDto.HourlyWeather hourly = new OpenMeteoForecastResponseDto.HourlyWeather();
        hourly.setTime(List.of("2026-10-28T12:00", "2026-10-28T13:00"));
        hourly.setTemperature2m(List.of(28.5, 29.0));
        hourly.setWeatherCode(List.of(0, 0));
        mockForecastResponse.setHourly(hourly);

        OpenMeteoForecastResponseDto.DailyWeather daily = new OpenMeteoForecastResponseDto.DailyWeather();
        daily.setTime(List.of("2026-10-28"));
        daily.setTemperature2mMin(List.of(19.0));
        daily.setTemperature2mMax(List.of(31.0));
        daily.setWeatherCode(List.of(0));
        mockForecastResponse.setDaily(daily);
    }

    @Test
    void testGetWeatherForCity_Success() {
        when(openMeteoClient.searchCity("Indore")).thenReturn(mockGeocodingResponse);
        when(openMeteoClient.fetchForecast(eq(22.7196), eq(75.8577), eq("Asia/Kolkata"))).thenReturn(mockForecastResponse);

        WeatherResponseDto result = weatherService.getWeatherForCity("Indore");

        assertNotNull(result);
        assertEquals("Indore", result.getCityName());
        assertEquals("India", result.getCountry());
        assertEquals(28.5, result.getTemperature());
        assertEquals(29.0, result.getFeelsLike());
        assertEquals(60, result.getHumidity());
        assertEquals(12.0, result.getWindSpeed());
        assertEquals(0, result.getWeatherCode());
        assertEquals("Clear Sky", result.getWeatherDescription());
        assertTrue(result.getIsDay());
        assertEquals(2, result.getHourlyForecast().size());
        assertEquals(1, result.getDailyForecast().size());

        verify(openMeteoClient, times(1)).searchCity("Indore");
        verify(openMeteoClient, times(1)).fetchForecast(eq(22.7196), eq(75.8577), anyString());
    }

    @Test
    void testGetWeatherForCity_CityNotFound_ThrowsException() {
        GeocodingResponseDto emptyResponse = new GeocodingResponseDto();
        emptyResponse.setResults(List.of());
        when(openMeteoClient.searchCity("UnknownCityXYZ")).thenReturn(emptyResponse);

        CityNotFoundException ex = assertThrows(CityNotFoundException.class, () ->
                weatherService.getWeatherForCity("UnknownCityXYZ")
        );

        assertTrue(ex.getMessage().contains("UnknownCityXYZ"));
        verify(openMeteoClient, times(1)).searchCity("UnknownCityXYZ");
        verify(openMeteoClient, never()).fetchForecast(anyDouble(), anyDouble(), anyString());
    }

    @Test
    void testGetWeatherForCity_BlankCity_ThrowsException() {
        InvalidCityException ex1 = assertThrows(InvalidCityException.class, () ->
                weatherService.getWeatherForCity("")
        );
        assertTrue(ex1.getMessage().contains("cannot be empty or blank"));

        InvalidCityException ex2 = assertThrows(InvalidCityException.class, () ->
                weatherService.getWeatherForCity("   ")
        );
        assertTrue(ex2.getMessage().contains("cannot be empty or blank"));

        verify(openMeteoClient, never()).searchCity(anyString());
    }
}
