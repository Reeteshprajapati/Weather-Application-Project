package com.weatherapp.controller;

import com.weatherapp.dto.HealthResponseDto;
import com.weatherapp.dto.WeatherResponseDto;
import com.weatherapp.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing weather queries and service health checks.
 */
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private static final Logger logger = LoggerFactory.getLogger(WeatherController.class);

    private final WeatherService weatherService;

    // Constructor injection
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /**
     * GET /api/weather?city=Indore
     * Returns consolidated current weather and forecast.
     *
     * @param city Name of the city to query
     * @return 200 OK with WeatherResponseDto
     */
    @GetMapping
    public ResponseEntity<WeatherResponseDto> getWeather(@RequestParam("city") String city) {
        logger.info("Received request for city: {}", city);
        WeatherResponseDto response = weatherService.getWeatherForCity(city);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/weather/health
     * Returns backend health and provider connectivity status.
     *
     * @return 200 OK with HealthResponseDto
     */
    @GetMapping("/health")
    public ResponseEntity<HealthResponseDto> getHealth() {
        HealthResponseDto health = weatherService.checkHealth();
        return ResponseEntity.ok(health);
    }
}
