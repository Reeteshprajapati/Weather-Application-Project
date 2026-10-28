package com.weatherapp.exception;

/**
 * Exception thrown when Open-Meteo Geocoding returns no matching results for a city.
 */
public class CityNotFoundException extends RuntimeException {

    public CityNotFoundException(String message) {
        super(message);
    }
}
