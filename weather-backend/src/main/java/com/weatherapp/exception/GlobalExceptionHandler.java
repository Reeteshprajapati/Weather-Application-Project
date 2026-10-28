package com.weatherapp.exception;

import com.weatherapp.dto.ErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized exception handler to return clean JSON error payloads
 * without exposing internal stack traces to clients.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleCityNotFound(CityNotFoundException ex, HttpServletRequest request) {
        logger.warn("City not found: {}", ex.getMessage());
        ErrorResponseDto errorDto = new ErrorResponseDto(
                HttpStatus.NOT_FOUND.value(),
                HttpStatus.NOT_FOUND.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDto);
    }

    @ExceptionHandler(InvalidCityException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidCity(InvalidCityException ex, HttpServletRequest request) {
        logger.warn("Invalid city input: {}", ex.getMessage());
        ErrorResponseDto errorDto = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest request) {
        String message = String.format("Required request parameter '%s' is missing.", ex.getParameterName());
        logger.warn("Missing parameter: {}", message);
        ErrorResponseDto errorDto = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto);
    }

    @ExceptionHandler(WeatherServiceException.class)
    public ResponseEntity<ErrorResponseDto> handleWeatherServiceException(WeatherServiceException ex, HttpServletRequest request) {
        logger.error("Weather service integration error: {}", ex.getMessage());
        ErrorResponseDto errorDto = new ErrorResponseDto(
                HttpStatus.BAD_GATEWAY.value(),
                "External Service Error",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorDto);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex, HttpServletRequest request) {
        logger.error("Unhandled server exception occurred: ", ex);
        ErrorResponseDto errorDto = new ErrorResponseDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "An unexpected server error occurred while retrieving weather data.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDto);
    }
}
