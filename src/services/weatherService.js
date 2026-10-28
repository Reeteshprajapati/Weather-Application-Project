import { getWeatherCodeInfo, generateWeatherSummary } from '../utils/weatherCodes.js';

// Base URL for the Spring Boot backend REST API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Simple in-memory cache to avoid repeated duplicate API requests
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Formats an ISO date-time string (e.g. "2026-10-28T06:28") into local 12-hour format "6:28 AM"
 */
function formatLocalTimeString(isoStr) {
  if (!isoStr || !isoStr.includes('T')) return isoStr || null;
  try {
    const timePart = isoStr.split('T')[1];
    const [rawHour, rawMinute] = timePart.split(':');
    const hour = parseInt(rawHour, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${rawMinute} ${ampm}`;
  } catch {
    return isoStr;
  }
}

/**
 * Formats "YYYY-MM-DD" into short month and day "Oct 28"
 */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${month} ${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns human-readable day name ("Today", "Tomorrow", "Thu", etc.)
 */
function getDayOfWeekName(dateStr, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return 'Day';
  }
}

/**
 * Evaluates US AQI value into category, level, color and health guidance
 */
function evaluateAqiLevel(aqi) {
  if (aqi == null) return null;
  if (aqi <= 50) {
    return {
      category: 'Good',
      level: 'GOOD',
      color: '#10B981',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      guidance: 'Air quality is satisfactory and poses little or no risk to health.'
    };
  } else if (aqi <= 100) {
    return {
      category: 'Moderate',
      level: 'MODERATE',
      color: '#F59E0B',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      guidance: 'Air quality is acceptable. Sensitive individuals should consider reducing heavy outdoor exertion.'
    };
  } else if (aqi <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      level: 'SENSITIVE',
      color: '#F97316',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
      guidance: 'Children, the elderly, and individuals with respiratory conditions should limit prolonged outdoor exertion.'
    };
  } else if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      level: 'UNHEALTHY',
      color: '#EF4444',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      guidance: 'Everyone may begin to experience adverse health effects. Avoid prolonged outdoor exertion.'
    };
  } else {
    return {
      category: 'Very Unhealthy / Hazardous',
      level: 'HAZARDOUS',
      color: '#8B5CF6',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
      guidance: 'Health warning of emergency conditions. The entire population is likely to be affected. Stay indoors.'
    };
  }
}

/**
 * Fetches real air quality metrics (PM2.5, PM10, AQI, Ozone, NO2) from Open-Meteo Air Quality API
 */
async function fetchAirQualityData(latitude, longitude, signal) {
  if (latitude == null || longitude == null) return null;
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const curr = data.current;
    if (!curr) return null;

    const usAqi = curr.us_aqi ?? curr.european_aqi ?? null;
    const evaluation = evaluateAqiLevel(usAqi);

    return {
      usAqi,
      category: evaluation ? evaluation.category : 'N/A',
      level: evaluation ? evaluation.level : 'MODERATE',
      color: evaluation ? evaluation.color : '#F59E0B',
      badgeClass: evaluation ? evaluation.badgeClass : 'bg-slate-100 text-slate-800 border-slate-200',
      guidance: evaluation ? evaluation.guidance : 'Air quality observation unavailable.',
      pm25: curr.pm2_5 != null ? Math.round(curr.pm2_5 * 10) / 10 : null,
      pm10: curr.pm10 != null ? Math.round(curr.pm10 * 10) / 10 : null,
      ozone: curr.ozone != null ? Math.round(curr.ozone * 10) / 10 : null,
      no2: curr.nitrogen_dioxide != null ? Math.round(curr.nitrogen_dioxide * 10) / 10 : null
    };
  } catch (e) {
    console.warn('Air quality data unavailable:', e?.message);
    return null;
  }
}

/**
 * Checks connectivity and status of the Spring Boot backend
 * @returns {Promise<{status: string, message: string}>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/weather/health`);
    if (!response.ok) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Backend health check error:', error);
    throw new Error('Unable to connect to the Spring Boot backend server on port 8080.');
  }
}

/**
 * Fetches real weather data for a city from the Spring Boot backend API
 * GET /api/weather?city={cityName}
 *
 * @param {string} cityName - Name of the city to query (e.g. "Indore")
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<object>} Real API-driven weather presentation model with AQI
 */
export async function fetchWeatherFromBackend(cityName, signal) {
  const trimmedCity = String(cityName || '').trim();
  if (!trimmedCity) {
    throw new Error('City name cannot be empty or blank.');
  }

  // Check in-memory cache first to avoid duplicate requests
  const cacheKey = trimmedCity.toLowerCase();
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const requestUrl = `${API_BASE_URL}/weather?city=${encodeURIComponent(trimmedCity)}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal
    });

    // Handle non-2xx HTTP responses according to backend's ErrorResponseDto contract
    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 404) {
        throw new Error(errorMessage.startsWith('City not found') ? errorMessage : `City not found: "${trimmedCity}"`);
      } else if (response.status === 400) {
        throw new Error(errorMessage);
      } else if (response.status >= 500) {
        throw new Error(errorMessage || 'Weather service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(errorMessage);
      }
    }

    // Parse WeatherResponseDto from backend
    const dto = await response.json();

    // Map backend DTO into frontend's presentation model safely without fake values
    const conditionText = dto.weatherDescription || getWeatherCodeInfo(dto.weatherCode, dto.isDay).label;
    const tempCelsius = typeof dto.temperature === 'number' ? dto.temperature : null;
    const feelsLikeCelsius = typeof dto.feelsLike === 'number' ? dto.feelsLike : tempCelsius;
    const windKmh = typeof dto.windSpeed === 'number' ? dto.windSpeed : null;

    // Fetch real air quality data concurrently
    const airQualityData = await fetchAirQualityData(dto.latitude, dto.longitude, signal);

    // Build hourly forecast points from actual API data
    const hourlyList = Array.isArray(dto.hourlyForecast)
      ? dto.hourlyForecast.map((item, index) => {
          const code = item.weatherCode ?? dto.weatherCode ?? 0;
          const codeInfo = getWeatherCodeInfo(code, 1);
          return {
            time: index === 0 ? 'Now' : formatLocalTimeString(item.time),
            temp: typeof item.temperature === 'number' ? Math.round(item.temperature) : null,
            condition: codeInfo.label,
            weatherCode: code,
            pop: null
          };
        })
      : [];

    // Build 7-day daily forecast points from actual API data
    const dailyList = Array.isArray(dto.dailyForecast)
      ? dto.dailyForecast.map((item, index) => {
          const code = item.weatherCode ?? dto.weatherCode ?? 0;
          const codeInfo = getWeatherCodeInfo(code, 1);
          return {
            day: getDayOfWeekName(item.date, index),
            date: formatShortDate(item.date),
            condition: codeInfo.label,
            weatherCode: code,
            minTemp: typeof item.minTemperature === 'number' ? Math.round(item.minTemperature) : null,
            maxTemp: typeof item.maxTemperature === 'number' ? Math.round(item.maxTemperature) : null,
            pop: null
          };
        })
      : [];

    const weatherPayload = {
      city: dto.cityName || trimmedCity,
      country: dto.country || '',
      latitude: dto.latitude,
      longitude: dto.longitude,
      timezone: dto.timezone || null,
      current: {
        temp: tempCelsius != null ? Math.round(tempCelsius) : null,
        feelsLike: feelsLikeCelsius != null ? Math.round(feelsLikeCelsius) : null,
        condition: conditionText,
        weatherCode: dto.weatherCode ?? 0,
        isDay: Boolean(dto.isDay),
        humidity: typeof dto.humidity === 'number' ? dto.humidity : null,
        windSpeed: windKmh != null ? Math.round(windKmh) : null,
        uvIndex: dto.uvIndex != null ? Math.round(dto.uvIndex * 10) / 10 : null,
        pressure: dto.pressure != null ? Math.round(dto.pressure) : null,
        sunrise: dto.sunrise ? formatLocalTimeString(dto.sunrise) : null,
        sunset: dto.sunset ? formatLocalTimeString(dto.sunset) : null,
        summary: tempCelsius != null && windKmh != null
          ? generateWeatherSummary(conditionText, tempCelsius, windKmh, dto.isDay)
          : `Currently ${conditionText}.`
      },
      airQuality: airQualityData,
      hourly: hourlyList,
      forecast: dailyList,
      recommendations: Array.isArray(dto.recommendations) ? dto.recommendations : []
    };

    // Store in cache
    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherPayload });
    return weatherPayload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error(`Error fetching weather for '${trimmedCity}':`, error);

    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error(
        `Cannot reach the Spring Boot backend at ${API_BASE_URL}. Ensure the backend is running on port 8080.`
      );
    }
    throw error;
  }
}
