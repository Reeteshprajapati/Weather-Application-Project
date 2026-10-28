package com.weatherapp.exception;

/**
 * Exception thrown when the city parameter is blank or invalid.
 */
public class InvalidCityException extends RuntimeException {

    public InvalidCityException(String message) {
        super(message);
    }
}
