/**
 * WMO Weather interpretation codes (WW) reference from Open-Meteo
 * https://open-meteo.com/en/docs
 */

export const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', iconType: 'clear' },
  1: { label: 'Mainly Clear', iconType: 'partly-cloudy' },
  2: { label: 'Partly Cloudy', iconType: 'partly-cloudy' },
  3: { label: 'Overcast', iconType: 'overcast' },
  45: { label: 'Foggy', iconType: 'fog' },
  48: { label: 'Rime Fog', iconType: 'fog' },
  51: { label: 'Light Drizzle', iconType: 'drizzle' },
  53: { label: 'Moderate Drizzle', iconType: 'drizzle' },
  55: { label: 'Dense Drizzle', iconType: 'drizzle' },
  56: { label: 'Freezing Drizzle', iconType: 'drizzle' },
  57: { label: 'Dense Freezing Drizzle', iconType: 'drizzle' },
  61: { label: 'Slight Rain', iconType: 'rain' },
  63: { label: 'Moderate Rain', iconType: 'rain' },
  65: { label: 'Heavy Rain', iconType: 'heavy-rain' },
  66: { label: 'Freezing Rain', iconType: 'rain' },
  67: { label: 'Heavy Freezing Rain', iconType: 'heavy-rain' },
  71: { label: 'Slight Snow', iconType: 'snow' },
  73: { label: 'Moderate Snow', iconType: 'snow' },
  75: { label: 'Heavy Snow', iconType: 'snow' },
  77: { label: 'Snow Grains', iconType: 'snow' },
  80: { label: 'Slight Showers', iconType: 'rain' },
  81: { label: 'Moderate Showers', iconType: 'rain' },
  82: { label: 'Violent Showers', iconType: 'heavy-rain' },
  85: { label: 'Snow Showers', iconType: 'snow' },
  86: { label: 'Heavy Snow Showers', iconType: 'snow' },
  95: { label: 'Thunderstorm', iconType: 'thunderstorm' },
  96: { label: 'Thunderstorm with Hail', iconType: 'thunderstorm' },
  99: { label: 'Severe Thunderstorm', iconType: 'thunderstorm' },
};

/**
 * Returns weather description and metadata for a given WMO code
 * @param {number} code - WMO weather code
 * @param {number|boolean} [isDay=1] - 1 for day, 0 for night
 * @returns {{ label: string, iconType: string, isDay: boolean }}
 */
export function getWeatherCodeInfo(code, isDay = 1) {
  const isDayBool = isDay === 1 || isDay === true;
  const entry = WMO_WEATHER_CODES[code];

  if (!entry) {
    return {
      label: isDayBool ? 'Clear Sky' : 'Clear Night',
      iconType: isDayBool ? 'clear' : 'clear-night',
      isDay: isDayBool
    };
  }

  let label = entry.label;
  let iconType = entry.iconType;

  // Enhance label & icon for clear / partly cloudy night
  if (!isDayBool) {
    if (code === 0) {
      label = 'Clear Night';
      iconType = 'clear-night';
    } else if (code === 1 || code === 2) {
      label = 'Partly Cloudy Night';
      iconType = 'cloud-moon';
    }
  }

  return {
    label,
    iconType,
    isDay: isDayBool
  };
}

/**
 * Generates a helpful weather summary sentence based on condition, temp, and wind
 * @param {string} conditionLabel
 * @param {number} temp
 * @param {number} windSpeed
 * @param {boolean} isDay
 * @returns {string}
 */
export function generateWeatherSummary(conditionLabel, temp, windSpeed, isDay) {
  const timeContext = isDay ? 'day' : 'night';
  let windText = 'with a gentle breeze';
  if (windSpeed > 30) {
    windText = 'with strong gusty winds';
  } else if (windSpeed > 18) {
    windText = 'with moderate winds';
  }

  let tempText = 'mild';
  if (temp >= 30) tempText = 'hot';
  else if (temp >= 23) tempText = 'warm and pleasant';
  else if (temp >= 15) tempText = 'comfortable';
  else if (temp >= 5) tempText = 'cool';
  else tempText = 'chilly';

  return `Currently ${conditionLabel.toLowerCase()} and ${tempText} ${windText}. Have a great ${timeContext}!`;
}
