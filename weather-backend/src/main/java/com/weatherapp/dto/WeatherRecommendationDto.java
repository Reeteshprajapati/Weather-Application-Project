package com.weatherapp.dto;

/**
 * DTO representing an actionable, rule-based weather recommendation.
 */
public class WeatherRecommendationDto {

    private String category;
    private String title;
    private String reason;
    private String iconType;
    private String level; // "INFO", "NOTICE", "WARNING", "SUCCESS"

    public WeatherRecommendationDto() {
    }

    public WeatherRecommendationDto(String category, String title, String reason, String iconType, String level) {
        this.category = category;
        this.title = title;
        this.reason = reason;
        this.iconType = iconType;
        this.level = level;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getIconType() {
        return iconType;
    }

    public void setIconType(String iconType) {
        this.iconType = iconType;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}
