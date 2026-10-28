import React from 'react';
import {
  Droplets,
  Wind,
  SunMedium,
  Gauge,
  Sunrise,
  Sunset,
  MapPin,
  Sparkles,
  Heart
} from 'lucide-react';
import { formatTemperature, formatWindSpeed, formatCurrentDate } from '../utils/formatters';
import { getWeatherIcon } from '../utils/weatherIcons';

export default function CurrentWeather({ weatherData, unit, isFavorite, onToggleFavorite }) {
  if (!weatherData) return null;

  const { city, country, admin1, timezone, current } = weatherData;
  const locationSubtitle = [admin1, country].filter(Boolean).join(', ');

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-card hover:shadow-cardhover transition-all duration-300 overflow-hidden">
      
      {/* Top Hero Card: Premium High-Contrast Midnight Navy */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2 text-sky-300 text-xs sm:text-sm font-semibold mb-1">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{locationSubtitle || 'Location'}</span>
              {timezone && (
                <>
                  <span className="text-slate-500">•</span>
                  <span>{timezone}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {city}
              </h1>
              <button
                type="button"
                onClick={() => onToggleFavorite && onToggleFavorite(city)}
                className={`p-2 rounded-xl transition-all duration-150 ${
                  isFavorite
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 hover:bg-rose-600 scale-105'
                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                }`}
                title={isFavorite ? 'Remove from pinned favorites' : 'Pin to favorites'}
                aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              {formatCurrentDate()}
            </p>
          </div>

          {/* Condition Badge */}
          <div className="flex sm:flex-col items-start sm:items-end gap-1.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/15 text-sky-200 border border-white/20 backdrop-blur-md shadow-sm">
              {getWeatherIcon(current.condition, { size: 18, className: "w-4 h-4 text-sky-300", isDay: current.isDay })}
              <span>{current.condition}</span>
            </div>
            <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
              Feels like {formatTemperature(current.feelsLike, unit)}
            </span>
          </div>

        </div>

        {/* Hero Temperature & Summary */}
        <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-7xl sm:text-8xl lg:text-9xl font-black text-white tracking-tighter">
              {formatTemperature(current.temp, unit).replace(`°${unit}`, '')}
            </span>
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-extrabold text-sky-400">
                °{unit}
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-semibold sm:hidden mt-1">
                Feels like {formatTemperature(current.feelsLike, unit)}
              </span>
            </div>
          </div>

          {/* Real-time Summary Box */}
          {current.summary && (
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shadow-sm max-w-sm">
              <div className="p-3 bg-white/15 rounded-xl text-sky-300 flex-shrink-0">
                {getWeatherIcon(current.condition, { size: 32, className: "w-8 h-8 text-sky-300", isDay: current.isDay })}
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                {current.summary}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Metrics Grid: 4 Crisp High-Visibility White Cards */}
      <div className="p-6 sm:p-8 bg-slate-50/70 grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Humidity */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span>Humidity</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy">
            {current.humidity != null ? `${current.humidity}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {current.humidity != null
              ? (current.humidity > 70 ? 'High moisture' : current.humidity < 30 ? 'Dry air' : 'Comfortable')
              : 'Atmospheric measurement'}
          </p>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-emerald-400 transition-colors">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-2">
            <Wind className="w-4 h-4 text-emerald-600" />
            <span>Wind Speed</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy">
            {formatWindSpeed(current.windSpeed, unit)}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {current.windSpeed != null
              ? (current.windSpeed > 25 ? 'Strong breeze' : 'Light breeze')
              : 'Surface observation'}
          </p>
        </div>

        {/* UV Index */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-amber-400 transition-colors">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-2">
            <SunMedium className="w-4 h-4 text-amber-600" />
            <span>UV Radiation</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy">
            {current.uvIndex != null ? current.uvIndex : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {current.uvIndex != null
              ? (current.uvIndex >= 6 ? 'High (SPF recommended)' : 'Moderate exposure')
              : 'Solar measurement'}
          </p>
        </div>

        {/* Air Pressure */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-2">
            <Gauge className="w-4 h-4 text-indigo-600" />
            <span>Barometric Pressure</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy">
            {current.pressure != null ? `${current.pressure} hPa` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atmospheric pressure
          </p>
        </div>

      </div>

      {/* Footer bar with Sunrise & Sunset */}
      {(current.sunrise || current.sunset) && (
        <div className="px-6 py-4 bg-white border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-6">
            {current.sunrise && (
              <div className="flex items-center gap-2">
                <Sunrise className="w-4 h-4 text-amber-600" />
                <span className="text-slate-500">Sunrise:</span>
                <span className="font-bold text-navy">{current.sunrise}</span>
              </div>
            )}
            {current.sunset && (
              <div className="flex items-center gap-2">
                <Sunset className="w-4 h-4 text-amber-600" />
                <span className="text-slate-500">Sunset:</span>
                <span className="font-bold text-navy">{current.sunset}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time Live Provider Sync</span>
          </div>
        </div>
      )}

    </div>
  );
}
