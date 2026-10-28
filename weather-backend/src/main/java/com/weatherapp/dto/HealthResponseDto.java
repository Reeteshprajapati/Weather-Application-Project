package com.weatherapp.dto;

import java.time.LocalDateTime;

/**
 * Health check response returned by /api/weather/health.
 */
public class HealthResponseDto {

    private String status;
    private String service;
    private String message;
    private String externalProvider;
    private LocalDateTime timestamp;

    public HealthResponseDto() {
        this.timestamp = LocalDateTime.now();
    }

    public HealthResponseDto(String status, String service, String message, String externalProvider) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.service = service;
        this.message = message;
        this.externalProvider = externalProvider;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getExternalProvider() {
        return externalProvider;
    }

    public void setExternalProvider(String externalProvider) {
        this.externalProvider = externalProvider;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
