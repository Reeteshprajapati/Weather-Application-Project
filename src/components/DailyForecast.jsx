import React from 'react';
import { CalendarDays } from 'lucide-react';
import { formatTemperature } from '../utils/formatters';
import { getWeatherIcon } from '../utils/weatherIcons';

export default function DailyForecast({ forecastData, unit }) {
  if (!Array.isArray(forecastData) || forecastData.length === 0) return null;

  // Calculate absolute min & max across the 7 days for the temperature bar ratio
  const validMinTemps = forecastData.map(d => d.minTemp).filter(t => typeof t === 'number');
  const validMaxTemps = forecastData.map(d => d.maxTemp).filter(t => typeof t === 'number');
  const globalMin = validMinTemps.length > 0 ? Math.min(...validMinTemps) : 0;
  const globalMax = validMaxTemps.length > 0 ? Math.max(...validMaxTemps) : 30;
  const tempRange = Math.max(globalMax - globalMin, 1);

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-card p-6 sm:p-7">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-primary">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-navy">
              7-Day Extended Outlook
            </h2>
            <p className="text-xs text-muted font-medium">Daily temperature ranges and expected weather</p>
          </div>
        </div>
      </div>

      {/* Forecast Rows */}
      <div className="divide-y-2 divide-slate-100">
        {forecastData.map((item, index) => {
          const isToday = index === 0;

          const hasNumbers = typeof item.minTemp === 'number' && typeof item.maxTemp === 'number';
          const minPercent = hasNumbers ? ((item.minTemp - globalMin) / tempRange) * 100 : 0;
          const maxPercent = hasNumbers ? ((item.maxTemp - globalMin) / tempRange) * 100 : 100;
          const barWidth = Math.max(maxPercent - minPercent, 12);

          return (
            <div
              key={`${item.day}-${item.date}`}
              className="py-4 flex items-center justify-between gap-3 sm:gap-6 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors"
            >
              
              {/* Day & Date */}
              <div className="w-24 sm:w-28 flex-shrink-0">
                <span className={`text-sm block ${isToday ? 'font-black text-primary' : 'font-bold text-navy'}`}>
                  {item.day}
                </span>
                <span className="text-xs font-semibold text-slate-500">{item.date}</span>
              </div>

              {/* Icon & Condition */}
              <div className="flex items-center gap-2.5 flex-1 min-w-[130px]">
                {getWeatherIcon(item.condition, { size: 22, className: "w-5 h-5 flex-shrink-0 text-primary" })}
                <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate hidden sm:inline">
                  {item.condition}
                </span>
              </div>

              {/* Temperature Bar & Values */}
              <div className="flex items-center justify-end gap-3 w-40 sm:w-56 flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-500 w-10 text-right">
                  {formatTemperature(item.minTemp, unit)}
                </span>

                {/* Horizontal gradient temperature bar */}
                <div className="hidden sm:block flex-1 h-2.5 bg-slate-100 border border-slate-200 rounded-full relative overflow-hidden">
                  {hasNumbers && (
                    <div
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        width: `${barWidth}%`
                      }}
                    />
                  )}
                </div>

                <span className="text-xs sm:text-sm font-black text-navy w-10 text-right">
                  {formatTemperature(item.maxTemp, unit)}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
