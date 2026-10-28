import React from 'react';
import { Clock } from 'lucide-react';
import { formatTemperature } from '../utils/formatters';
import { getWeatherIcon } from '../utils/weatherIcons';

export default function HourlyForecast({ hourlyData, unit }) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-card p-6 sm:p-7">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-navy">
              24-Hour Forecast
            </h2>
            <p className="text-xs text-muted font-medium">Hourly meteorological observations</p>
          </div>
        </div>
      </div>

      {/* Horizontally scrollable list */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 custom-scrollbar -mx-2 px-2">
        {hourlyData.map((item, index) => {
          const isNow = index === 0;
          return (
            <div
              key={`${item.time}-${index}`}
              className={`flex-shrink-0 w-28 flex flex-col items-center py-4 px-2.5 rounded-2xl border-2 transition-all shadow-xs ${
                isNow
                  ? 'bg-blue-50 border-primary text-primary font-bold shadow-md'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <span className={`text-xs font-bold ${isNow ? 'text-primary' : 'text-slate-600'}`}>
                {item.time}
              </span>

              <div className="my-3">
                {getWeatherIcon(item.condition, { size: 28, className: "w-7 h-7 text-primary" })}
              </div>

              <span className="text-base font-black text-navy">
                {formatTemperature(item.temp, unit)}
              </span>

              <span className="text-[11px] text-slate-500 font-semibold mt-1 truncate max-w-[85px]">
                {item.condition}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
