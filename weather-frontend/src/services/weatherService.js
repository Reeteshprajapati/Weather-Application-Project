import { getWeatherCodeInfo, generateWeatherSummary } from '../utils/weatherCodes.js';
import { generateRecommendations } from '../utils/recommendations.js';

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
 * Direct client-side fetch from Open-Meteo Web APIs.
 * Used when the frontend is deployed statically (e.g. on Vercel) and the Spring Boot
 * backend is either not running locally, sleeping on Render free tier, or blocked by Mixed Content.
 */
async function fetchWeatherDirectFromOpenMeteo(cityName, signal) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl, { signal });
  if (!geoRes.ok) {
    throw new Error(`Geocoding service unavailable (${geoRes.status})`);
  }

  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City not found: "${cityName}"`);
  }

  const location = geoData.results[0];
  const { latitude, longitude, name, country, timezone } = location;

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=${encodeURIComponent(timezone || 'auto')}&forecast_days=7`;

  const [forecastRes, airQualityData] = await Promise.all([
    fetch(forecastUrl, { signal }),
    fetchAirQualityData(latitude, longitude, signal)
  ]);

  if (!forecastRes.ok) {
    throw new Error(`Forecast service unavailable (${forecastRes.status})`);
  }

  const forecastData = await forecastRes.json();
  const current = forecastData.current || {};
  const hourly = forecastData.hourly || {};
  const daily = forecastData.daily || {};

  const weatherCode = current.weather_code ?? 0;
  const isDay = current.is_day === 1;
  const conditionInfo = getWeatherCodeInfo(weatherCode, isDay);
  const conditionText = conditionInfo.label;
  const tempCelsius = current.temperature_2m;
  const feelsLikeCelsius = current.apparent_temperature ?? tempCelsius;
  const windKmh = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;
  const pressure = current.surface_pressure;

  const uvIndex = Array.isArray(daily.uv_index_max) && daily.uv_index_max.length > 0 ? daily.uv_index_max[0] : null;
  const sunrise = Array.isArray(daily.sunrise) && daily.sunrise.length > 0 ? daily.sunrise[0] : null;
  const sunset = Array.isArray(daily.sunset) && daily.sunset.length > 0 ? daily.sunset[0] : null;
  const maxPrecipProb = Array.isArray(daily.precipitation_probability_max) && daily.precipitation_probability_max.length > 0
    ? daily.precipitation_probability_max[0]
    : null;

  // Hourly forecast (next 24 hours)
  const hourlyList = Array.isArray(hourly.time)
    ? hourly.time.slice(0, 24).map((timeStr, index) => {
        const code = hourly.weather_code ? hourly.weather_code[index] : 0;
        const info = getWeatherCodeInfo(code, 1);
        const temp = hourly.temperature_2m ? Math.round(hourly.temperature_2m[index]) : null;
        return {
          time: index === 0 ? 'Now' : formatLocalTimeString(timeStr),
          temp,
          condition: info.label,
          weatherCode: code,
          pop: null
        };
      })
    : [];

  // Daily forecast (7 days)
  const dailyList = Array.isArray(daily.time)
    ? daily.time.slice(0, 7).map((dateStr, index) => {
        const code = daily.weather_code ? daily.weather_code[index] : 0;
        const info = getWeatherCodeInfo(code, 1);
        const minTemp = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[index]) : null;
        const maxTemp = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[index]) : null;
        return {
          day: getDayOfWeekName(dateStr, index),
          date: formatShortDate(dateStr),
          condition: info.label,
          weatherCode: code,
          minTemp,
          maxTemp,
          pop: null
        };
      })
    : [];

  // Rule-based smart recommendations (identical logic to backend)
  const recommendations = generateRecommendations(
    maxPrecipProb,
    uvIndex,
    windKmh,
    tempCelsius,
    weatherCode
  );

  return {
    city: name,
    country: country || '',
    latitude,
    longitude,
    timezone: forecastData.timezone || timezone || null,
    current: {
      temp: tempCelsius != null ? Math.round(tempCelsius) : null,
      feelsLike: feelsLikeCelsius != null ? Math.round(feelsLikeCelsius) : null,
      condition: conditionText,
      weatherCode,
      isDay,
      humidity: typeof humidity === 'number' ? humidity : null,
      windSpeed: windKmh != null ? Math.round(windKmh) : null,
      uvIndex: uvIndex != null ? Math.round(uvIndex * 10) / 10 : null,
      pressure: pressure != null ? Math.round(pressure) : null,
      sunrise: sunrise ? formatLocalTimeString(sunrise) : null,
      sunset: sunset ? formatLocalTimeString(sunset) : null,
      summary: tempCelsius != null && windKmh != null
        ? generateWeatherSummary(conditionText, tempCelsius, windKmh, isDay)
        : `Currently ${conditionText}.`
    },
    airQuality: airQualityData,
    hourly: hourlyList,
    forecast: dailyList,
    recommendations,
    source: 'direct'
  };
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
 * Fetches real weather data for a city.
 * Attempts the Spring Boot REST backend first; if unreachable (e.g. running on HTTPS Vercel,
 * backend offline, or sleeping on Render free-tier), gracefully falls back to direct Open-Meteo
 * APIs with full deterministic recommendation rules and air quality evaluation.
 *
 * @param {string} cityName - Name of the city to query (e.g. "Indore")
 * @param {AbortSignal} [signal] - Optional AbortController signal
 * @returns {Promise<object>} Complete weather presentation model with AQI & recommendations
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

  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalBackend = !API_BASE_URL || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');

  // If on an HTTPS deployment (e.g. Vercel) and backend URL points to localhost, browsers strictly block
  // mixed content requests. Skip the impossible localhost call and immediately use direct Open-Meteo.
  if (isHttpsPage && isLocalBackend) {
    const directPayload = await fetchWeatherDirectFromOpenMeteo(trimmedCity, signal);
    weatherCache.set(cacheKey, { timestamp: Date.now(), data: directPayload });
    return directPayload;
  }

  // Attempt backend with an explicit 4-second timeout controller so UI never hangs indefinitely
  const requestUrl = `${API_BASE_URL}/weather?city=${encodeURIComponent(trimmedCity)}`;
  const backendTimeoutController = new AbortController();
  const timeoutId = setTimeout(() => backendTimeoutController.abort(), 4000);

  // Link caller signal to timeout controller
  if (signal) {
    signal.addEventListener('abort', () => backendTimeoutController.abort(), { once: true });
  }

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: backendTimeoutController.signal
    });
    clearTimeout(timeoutId);

    // If city not found (404) or invalid (400), honor backend's business error
    if (response.status === 404) {
      let errorMessage = `City not found: "${trimmedCity}"`;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) errorMessage = errorBody.message;
      } catch {
        // use default message
      }
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`);
    }

    // Parse WeatherResponseDto from backend
    const dto = await response.json();

    // Map backend DTO into frontend presentation model
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
      recommendations: Array.isArray(dto.recommendations) ? dto.recommendations : [],
      source: 'backend'
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherPayload });
    return weatherPayload;
  } catch (error) {
    clearTimeout(timeoutId);

    // If request was aborted by user typing a new city, rethrow abort
    if (signal?.aborted) {
      throw error;
    }

    // If city not found was explicitly returned, throw it
    if (error.message?.includes('City not found')) {
      throw error;
    }

    console.warn('Backend unavailable, falling back to direct Open-Meteo observations:', error.message);

    // Smooth fallback to client direct Open-Meteo
    const fallbackPayload = await fetchWeatherDirectFromOpenMeteo(trimmedCity, signal);
    weatherCache.set(cacheKey, { timestamp: Date.now(), data: fallbackPayload });
    return fallbackPayload;
  }
}
