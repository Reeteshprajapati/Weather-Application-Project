import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Wind
} from 'lucide-react';

/**
 * Returns the appropriate Lucide React icon based on condition name or code iconType
 * Uses understated, nature-inspired colors
 * @param {string} condition - Weather condition text or iconType key
 * @param {object} props - Additional props like className, size, isDay
 */
export function getWeatherIcon(condition = '', props = {}) {
  const norm = String(condition || '').toLowerCase().trim();
  const defaultSize = props.size || 22;
  const defaultClass = props.className || 'w-5 h-5';
  const isNight = props.isDay === false || norm.includes('night') || norm === 'clear-night' || norm === 'cloud-moon';

  if (norm.includes('thunder') || norm.includes('lightning') || norm.includes('storm')) {
    return <CloudLightning size={defaultSize} className={`text-charcoal ${defaultClass}`} />;
  }
  if (norm.includes('heavy rain') || norm.includes('violent') || norm.includes('downpour')) {
    return <CloudRain size={defaultSize} className={`text-forest ${defaultClass}`} />;
  }
  if (norm.includes('rain') || norm.includes('shower')) {
    return <CloudRain size={defaultSize} className={`text-forest ${defaultClass}`} />;
  }
  if (norm.includes('drizzle')) {
    return <CloudDrizzle size={defaultSize} className={`text-stone ${defaultClass}`} />;
  }
  if (norm.includes('snow') || norm.includes('blizzard') || norm.includes('ice') || norm.includes('grain')) {
    return <Snowflake size={defaultSize} className={`text-stone ${defaultClass}`} />;
  }
  if (norm.includes('fog') || norm.includes('mist') || norm.includes('haze') || norm.includes('rime')) {
    return <CloudFog size={defaultSize} className={`text-stone ${defaultClass}`} />;
  }
  if (norm.includes('wind') || norm.includes('breez')) {
    return <Wind size={defaultSize} className={`text-forest ${defaultClass}`} />;
  }
  if (norm.includes('partly') || norm.includes('mainly') || norm.includes('scattered')) {
    if (isNight) {
      return <CloudMoon size={defaultSize} className={`text-stone ${defaultClass}`} />;
    }
    return <CloudSun size={defaultSize} className={`text-terracotta ${defaultClass}`} />;
  }
  if (norm.includes('cloud') || norm.includes('overcast')) {
    return <Cloud size={defaultSize} className={`text-stone ${defaultClass}`} />;
  }
  if (norm.includes('clear') || norm.includes('sun') || norm === 'clear') {
    if (isNight) {
      return <Moon size={defaultSize} className={`text-stone ${defaultClass}`} />;
    }
    return <Sun size={defaultSize} className={`text-terracotta ${defaultClass}`} />;
  }

  // Default fallback
  return isNight ? (
    <Moon size={defaultSize} className={`text-stone ${defaultClass}`} />
  ) : (
    <Sun size={defaultSize} className={`text-terracotta ${defaultClass}`} />
  );
}
