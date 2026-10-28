package com.weatherapp.service;

import com.weatherapp.dto.WeatherRecommendationDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service providing rule-based weather advice and precautions.
 * Uses transparent, deterministic rules without external AI dependencies.
 */
@Service
public class WeatherRecommendationService {

    // Configurable, easy-to-understand threshold constants
    public static final double HIGH_PRECIPITATION_THRESHOLD = 50.0;
    public static final double MODERATE_PRECIPITATION_THRESHOLD = 30.0;

    public static final double VERY_HIGH_UV_THRESHOLD = 6.0;
    public static final double MODERATE_UV_THRESHOLD = 3.0;

    public static final double HIGH_WIND_THRESHOLD_KMH = 30.0;
    public static final double BREEZY_WIND_THRESHOLD_KMH = 20.0;

    public static final double HOT_TEMPERATURE_THRESHOLD_C = 34.0;
    public static final double CHILLY_TEMPERATURE_THRESHOLD_C = 5.0;
    public static final double FREEZING_TEMPERATURE_THRESHOLD_C = 0.0;

    /**
     * Generates a list of actionable recommendations based on available weather metrics.
     * If a metric is null or unavailable, that recommendation is omitted.
     *
     * @param precipitationProb Max precipitation probability (%) or null
     * @param uvIndex           UV index level or null
     * @param windSpeed         Current wind speed in km/h or null
     * @param temperature       Current temperature in Celsius or null
     * @param weatherCode       WMO weather code or null
     * @return List of WeatherRecommendationDto
     */
    public List<WeatherRecommendationDto> generateRecommendations(
            Double precipitationProb,
            Double uvIndex,
            Double windSpeed,
            Double temperature,
            Integer weatherCode
    ) {
        List<WeatherRecommendationDto> recommendations = new ArrayList<>();

        // 1. Umbrella / Precipitation Recommendation
        WeatherRecommendationDto umbrellaRec = evaluateUmbrellaNeed(precipitationProb, weatherCode);
        if (umbrellaRec != null) {
            recommendations.add(umbrellaRec);
        }

        // 2. Sun Protection / UV Index Recommendation
        WeatherRecommendationDto uvRec = evaluateSunProtection(uvIndex);
        if (uvRec != null) {
            recommendations.add(uvRec);
        }

        // 3. Wind Precaution Recommendation
        WeatherRecommendationDto windRec = evaluateWindConditions(windSpeed);
        if (windRec != null) {
            recommendations.add(windRec);
        }

        // 4. Outdoor Activity Guidance Recommendation
        WeatherRecommendationDto activityRec = evaluateOutdoorActivity(temperature, weatherCode, precipitationProb, windSpeed);
        if (activityRec != null) {
            recommendations.add(activityRec);
        }

        return recommendations;
    }

    /**
     * Evaluates whether an umbrella or rain gear is advisable.
     */
    private WeatherRecommendationDto evaluateUmbrellaNeed(Double precipitationProb, Integer weatherCode) {
        boolean isRainCode = isPrecipitationWeatherCode(weatherCode);

        if (precipitationProb == null && !isRainCode) {
            return null; // Metric not available and no rain code
        }

        double prob = precipitationProb != null ? precipitationProb : 0.0;

        if (prob >= HIGH_PRECIPITATION_THRESHOLD || isHeavyPrecipitationCode(weatherCode)) {
            return new WeatherRecommendationDto(
                    "UMBRELLA",
                    "Carry an Umbrella",
                    String.format("High rain likelihood (%.0f%% chance or wet conditions). Keep an umbrella or waterproof jacket handy.", prob),
                    "umbrella",
                    "WARNING"
            );
        } else if (prob >= MODERATE_PRECIPITATION_THRESHOLD || isRainCode) {
            return new WeatherRecommendationDto(
                    "UMBRELLA",
                    "Umbrella Recommended",
                    String.format("Moderate chance of scattered showers (%.0f%% chance). Rain gear may be helpful.", prob),
                    "umbrella",
                    "NOTICE"
            );
        }

        return null; // Low precipitation; no umbrella recommendation needed
    }

    /**
     * Evaluates sun protection based on the UV index metric.
     */
    private WeatherRecommendationDto evaluateSunProtection(Double uvIndex) {
        if (uvIndex == null) {
            return null; // Omit if metric is unavailable
        }

        if (uvIndex >= VERY_HIGH_UV_THRESHOLD) {
            return new WeatherRecommendationDto(
                    "SUN_PROTECTION",
                    "Sun Protection Required",
                    String.format("Very high UV radiation (level %.1f). Apply SPF 30+ sunscreen, wear UV sunglasses, and seek shade midday.", uvIndex),
                    "sun",
                    "WARNING"
            );
        } else if (uvIndex >= MODERATE_UV_THRESHOLD) {
            return new WeatherRecommendationDto(
                    "SUN_PROTECTION",
                    "Moderate Sun Exposure",
                    String.format("UV index is moderate (level %.1f). Sunscreen and a hat are advisable for prolonged outdoor stays.", uvIndex),
                    "sun",
                    "INFO"
            );
        }

        return null;
    }

    /**
     * Evaluates precautions needed for wind speeds.
     */
    private WeatherRecommendationDto evaluateWindConditions(Double windSpeed) {
        if (windSpeed == null) {
            return null; // Omit if wind speed is unavailable
        }

        if (windSpeed >= HIGH_WIND_THRESHOLD_KMH) {
            return new WeatherRecommendationDto(
                    "WIND_ALERT",
                    "High Wind Alert",
                    String.format("Strong winds up to %.1f km/h. Secure loose outdoor objects and exercise caution while driving or cycling.", windSpeed),
                    "wind",
                    "WARNING"
            );
        } else if (windSpeed >= BREEZY_WIND_THRESHOLD_KMH) {
            return new WeatherRecommendationDto(
                    "WIND_ALERT",
                    "Breezy Conditions",
                    String.format("Moderate breeze reaching %.1f km/h. A light windbreaker jacket is recommended.", windSpeed),
                    "wind",
                    "NOTICE"
            );
        }

        return null;
    }

    /**
     * Provides general outdoor activity and attire recommendations based on comfort.
     */
    private WeatherRecommendationDto evaluateOutdoorActivity(
            Double temperature,
            Integer weatherCode,
            Double precipitationProb,
            Double windSpeed
    ) {
        // Severe weather takes priority
        if (isSevereWeatherCode(weatherCode)) {
            return new WeatherRecommendationDto(
                    "OUTDOOR_ACTIVITY",
                    "Indoor Activities Advised",
                    "Thunderstorm or severe weather conditions detected. Stay indoors and avoid open outdoor areas.",
                    "activity",
                    "WARNING"
            );
        }

        if (temperature == null) {
            return null; // Omit if temperature is missing
        }

        if (temperature <= FREEZING_TEMPERATURE_THRESHOLD_C) {
            return new WeatherRecommendationDto(
                    "OUTDOOR_ACTIVITY",
                    "Freezing Weather Caution",
                    String.format("Sub-zero cold (%.1f°C). Dress in heavy thermal layers, gloves, and watch for icy patches.", temperature),
                    "snowflake",
                    "WARNING"
            );
        } else if (temperature <= CHILLY_TEMPERATURE_THRESHOLD_C) {
            return new WeatherRecommendationDto(
                    "OUTDOOR_ACTIVITY",
                    "Chilly Conditions",
                    String.format("Cold temperatures (%.1f°C). Warm winter clothing and warm beverages recommended.", temperature),
                    "snowflake",
                    "NOTICE"
            );
        } else if (temperature >= HOT_TEMPERATURE_THRESHOLD_C) {
            return new WeatherRecommendationDto(
                    "OUTDOOR_ACTIVITY",
                    "Extreme Heat Caution",
                    String.format("High temperature (%.1f°C). Stay well hydrated, avoid strenuous workouts under direct sun, and rest in cool areas.", temperature),
                    "activity",
                    "WARNING"
            );
        }

        // Check if conditions are great for exercise / walking
        boolean isMild = temperature >= 16.0 && temperature <= 26.0;
        boolean isDry = precipitationProb == null || precipitationProb < 25.0;
        boolean isCalm = windSpeed == null || windSpeed < BREEZY_WIND_THRESHOLD_KMH;
        boolean isClearOrPartlyCloudy = weatherCode == null || weatherCode <= 2;

        if (isMild && isDry && isCalm && isClearOrPartlyCloudy) {
            return new WeatherRecommendationDto(
                    "OUTDOOR_ACTIVITY",
                    "Ideal Outdoor Weather",
                    String.format("Pleasant temperature (%.1f°C) with calm conditions. Perfect for walking, running, or outdoor exercise.", temperature),
                    "activity",
                    "SUCCESS"
            );
        }

        return new WeatherRecommendationDto(
                "OUTDOOR_ACTIVITY",
                "Favorable Daily Conditions",
                String.format("Current temperature is %.1f°C. Comfortable for standard daily routines and commutes.", temperature),
                "activity",
                "INFO"
        );
    }

    private boolean isPrecipitationWeatherCode(Integer code) {
        if (code == null) return false;
        // WMO drizzle (51-57), rain (61-67), snow (71-77), showers (80-86), thunderstorm (95-99)
        return (code >= 51 && code <= 67) || (code >= 71 && code <= 77) || (code >= 80 && code <= 86) || (code >= 95 && code <= 99);
    }

    private boolean isHeavyPrecipitationCode(Integer code) {
        if (code == null) return false;
        return code == 65 || code == 67 || code == 75 || code == 82 || code == 86 || code == 95 || code == 96 || code == 99;
    }

    private boolean isSevereWeatherCode(Integer code) {
        if (code == null) return false;
        return code == 95 || code == 96 || code == 99;
    }
}
