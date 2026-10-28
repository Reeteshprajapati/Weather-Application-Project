package com.weatherapp.controller;

import com.weatherapp.dto.HealthResponseDto;
import com.weatherapp.dto.WeatherResponseDto;
import com.weatherapp.exception.CityNotFoundException;
import com.weatherapp.service.WeatherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(WeatherController.class)
class WeatherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WeatherService weatherService;

    @Test
    void testGetHealth_ReturnsOk() throws Exception {
        HealthResponseDto healthDto = new HealthResponseDto(
                "UP",
                "weather-backend",
                "Weather Backend API is up and running.",
                "Open-Meteo reachable"
        );
        when(weatherService.checkHealth()).thenReturn(healthDto);

        mockMvc.perform(get("/api/weather/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("weather-backend"))
                .andExpect(jsonPath("$.message").isNotEmpty());

        verify(weatherService, times(1)).checkHealth();
    }

    @Test
    void testGetWeather_ValidCity_ReturnsOk() throws Exception {
        WeatherResponseDto responseDto = new WeatherResponseDto();
        responseDto.setCityName("Indore");
        responseDto.setCountry("India");
        responseDto.setTemperature(28.0);
        responseDto.setHumidity(55);

        when(weatherService.getWeatherForCity("Indore")).thenReturn(responseDto);

        mockMvc.perform(get("/api/weather").param("city", "Indore"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.cityName").value("Indore"))
                .andExpect(jsonPath("$.country").value("India"))
                .andExpect(jsonPath("$.temperature").value(28.0))
                .andExpect(jsonPath("$.humidity").value(55));

        verify(weatherService, times(1)).getWeatherForCity("Indore");
    }

    @Test
    void testGetWeather_CityNotFound_Returns404() throws Exception {
        when(weatherService.getWeatherForCity("UnknownPlace"))
                .thenThrow(new CityNotFoundException("City not found: UnknownPlace"));

        mockMvc.perform(get("/api/weather").param("city", "UnknownPlace"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("City not found: UnknownPlace"));

        verify(weatherService, times(1)).getWeatherForCity("UnknownPlace");
    }

    @Test
    void testGetWeather_MissingCityParam_Returns400() throws Exception {
        mockMvc.perform(get("/api/weather"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));

        verify(weatherService, never()).getWeatherForCity(anyString());
    }
}
