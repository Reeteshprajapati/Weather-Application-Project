/**
 * Rule-based weather advice and precautions generator.
 * JavaScript port of backend WeatherRecommendationService.java.
 * Uses deterministic, transparent rules based on actual meteorological thresholds.
 */

export const THRESHOLDS = {
  HIGH_PRECIPITATION: 50.0,
  MODERATE_PRECIPITATION: 30.0,
  VERY_HIGH_UV: 6.0,
  MODERATE_UV: 3.0,
  HIGH_WIND_KMH: 30.0,
  BREEZY_WIND_KMH: 20.0,
  HOT_TEMP_C: 34.0,
  CHILLY_TEMP_C: 5.0,
  FREEZING_TEMP_C: 0.0
};

function isPrecipitationWeatherCode(code) {
  if (code == null) return false;
  return (
    (code >= 51 && code <= 67) ||
    (code >= 71 && code <= 77) ||
    (code >= 80 && code <= 86) ||
    (code >= 95 && code <= 99)
  );
}

function isHeavyPrecipitationCode(code) {
  if (code == null) return false;
  return (
    code === 65 ||
    code === 67 ||
    code === 75 ||
    code === 82 ||
    code === 86 ||
    code === 95 ||
    code === 96 ||
    code === 99
  );
}

function isSevereWeatherCode(code) {
  if (code == null) return false;
  return code === 95 || code === 96 || code === 99;
}

/**
 * Generates a list of actionable recommendation cards from weather metrics.
 *
 * @param {number|null} precipitationProb - Max precipitation probability (%) or null
 * @param {number|null} uvIndex - Max UV index or null
 * @param {number|null} windSpeed - Wind speed in km/h or null
 * @param {number|null} temperature - Temperature in Celsius or null
 * @param {number|null} weatherCode - WMO weather code or null
 * @returns {Array<object>} List of recommendation objects
 */
export function generateRecommendations(
  precipitationProb,
  uvIndex,
  windSpeed,
  temperature,
  weatherCode
) {
  const recommendations = [];

  // 1. Umbrella / Precipitation Recommendation
  const isRainCode = isPrecipitationWeatherCode(weatherCode);
  if (precipitationProb != null || isRainCode) {
    const prob = precipitationProb != null ? precipitationProb : 0.0;
    if (prob >= THRESHOLDS.HIGH_PRECIPITATION || isHeavyPrecipitationCode(weatherCode)) {
      recommendations.push({
        category: 'UMBRELLA',
        title: 'Carry an Umbrella',
        message: `High rain likelihood (${Math.round(prob)}% chance or wet conditions). Keep an umbrella or waterproof jacket handy.`,
        iconType: 'umbrella',
        level: 'WARNING'
      });
    } else if (prob >= THRESHOLDS.MODERATE_PRECIPITATION || isRainCode) {
      recommendations.push({
        category: 'UMBRELLA',
        title: 'Umbrella Recommended',
        message: `Moderate precipitation probability (${Math.round(prob)}%). An umbrella may be useful today.`,
        iconType: 'umbrella',
        level: 'INFO'
      });
    }
  }

  // 2. Sun Protection / UV Index Recommendation
  if (uvIndex != null) {
    if (uvIndex >= THRESHOLDS.VERY_HIGH_UV) {
      recommendations.push({
        category: 'SUN_PROTECTION',
        title: 'Sun Protection Advised',
        message: `High UV index (${uvIndex.toFixed(1)}). Wear sunscreen (SPF 30+), sunglasses, and seek shade during midday hours.`,
        iconType: 'sun',
        level: 'WARNING'
      });
    } else if (uvIndex >= THRESHOLDS.MODERATE_UV) {
      recommendations.push({
        category: 'SUN_PROTECTION',
        title: 'Moderate Sun Exposure',
        message: `Moderate UV index (${uvIndex.toFixed(1)}). Consider applying sunscreen and wearing a hat during peak daylight hours.`,
        iconType: 'sun',
        level: 'INFO'
      });
    }
  }

  // 3. Wind Precaution Recommendation
  if (windSpeed != null) {
    if (windSpeed >= THRESHOLDS.HIGH_WIND_KMH) {
      recommendations.push({
        category: 'WIND_ALERT',
        title: 'High Wind Alert',
        message: `Strong winds up to ${windSpeed.toFixed(1)} km/h. Secure loose outdoor objects and exercise caution while driving or cycling.`,
        iconType: 'wind',
        level: 'WARNING'
      });
    } else if (windSpeed >= THRESHOLDS.BREEZY_WIND_KMH) {
      recommendations.push({
        category: 'WIND_ALERT',
        title: 'Breezy Conditions',
        message: `Moderate breeze reaching ${windSpeed.toFixed(1)} km/h. A light windbreaker jacket is recommended.`,
        iconType: 'wind',
        level: 'NOTICE'
      });
    }
  }

  // 4. Outdoor Activity Guidance Recommendation
  if (isSevereWeatherCode(weatherCode)) {
    recommendations.push({
      category: 'OUTDOOR_ACTIVITY',
      title: 'Indoor Activities Advised',
      message: 'Thunderstorm or severe weather conditions detected. Stay indoors and avoid open outdoor areas.',
      iconType: 'activity',
      level: 'WARNING'
    });
  } else if (temperature != null) {
    if (temperature <= THRESHOLDS.FREEZING_TEMP_C) {
      recommendations.push({
        category: 'OUTDOOR_ACTIVITY',
        title: 'Freezing Weather Caution',
        message: `Sub-zero cold (${temperature.toFixed(1)}°C). Dress in heavy thermal layers, gloves, and watch for icy patches.`,
        iconType: 'snowflake',
        level: 'WARNING'
      });
    } else if (temperature <= THRESHOLDS.CHILLY_TEMP_C) {
      recommendations.push({
        category: 'OUTDOOR_ACTIVITY',
        title: 'Chilly Conditions',
        message: `Cold temperatures (${temperature.toFixed(1)}°C). Warm winter clothing and warm beverages recommended.`,
        iconType: 'snowflake',
        level: 'NOTICE'
      });
    } else if (temperature >= THRESHOLDS.HOT_TEMP_C) {
      recommendations.push({
        category: 'OUTDOOR_ACTIVITY',
        title: 'Extreme Heat Caution',
        message: `High temperature (${temperature.toFixed(1)}°C). Stay well hydrated, avoid strenuous workouts under direct sun, and rest in cool areas.`,
        iconType: 'activity',
        level: 'WARNING'
      });
    } else {
      const isMild = temperature >= 16.0 && temperature <= 26.0;
      const isDry = precipitationProb == null || precipitationProb < 25.0;
      const isCalm = windSpeed == null || windSpeed < THRESHOLDS.BREEZY_WIND_KMH;
      const isClearOrPartlyCloudy = weatherCode == null || weatherCode <= 2;

      if (isMild && isDry && isCalm && isClearOrPartlyCloudy) {
        recommendations.push({
          category: 'OUTDOOR_ACTIVITY',
          title: 'Ideal Outdoor Weather',
          message: `Pleasant temperature (${temperature.toFixed(1)}°C) with calm conditions. Perfect for walking, running, or outdoor exercise.`,
          iconType: 'activity',
          level: 'SUCCESS'
        });
      } else {
        recommendations.push({
          category: 'OUTDOOR_ACTIVITY',
          title: 'Favorable Daily Conditions',
          message: `Current temperature is ${temperature.toFixed(1)}°C. Comfortable for standard daily routines and commutes.`,
          iconType: 'activity',
          level: 'INFO'
        });
      }
    }
  }

  return recommendations;
}
