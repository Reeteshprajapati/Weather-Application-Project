/**
 * Utility functions for temperature and weather formatting
 */

/**
 * Converts Celsius to Fahrenheit
 * @param {number} celsius
 * @returns {number}
 */
export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Converts km/h to mph
 * @param {number} kmh
 * @returns {number}
 */
export function kmhToMph(kmh) {
  return Math.round(kmh * 0.621371);
}

/**
 * Formats a temperature value according to selected unit
 * @param {number|null|undefined} celsiusValue 
 * @param {'C' | 'F'} unit 
 * @returns {string} e.g. "24°C" or "N/A"
 */
export function formatTemperature(celsiusValue, unit = 'C') {
  if (celsiusValue === undefined || celsiusValue === null || Number.isNaN(Number(celsiusValue))) {
    return 'N/A';
  }
  const temp = unit === 'F' ? celsiusToFahrenheit(celsiusValue) : Math.round(celsiusValue);
  return `${temp}°${unit}`;
}

/**
 * Formats speed according to selected unit
 * @param {number|null|undefined} speedKmh 
 * @param {'C' | 'F'} unit 
 * @returns {string} e.g. "18 km/h" or "N/A"
 */
export function formatWindSpeed(speedKmh, unit = 'C') {
  if (speedKmh === undefined || speedKmh === null || Number.isNaN(Number(speedKmh))) {
    return 'N/A';
  }
  if (unit === 'F') {
    return `${kmhToMph(speedKmh)} mph`;
  }
  return `${Math.round(speedKmh)} km/h`;
}

/**
 * Formats full current date nicely
 * @param {Date} [date]
 * @returns {string} e.g. "Wednesday, Oct 28, 2026"
 */
export function formatCurrentDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
