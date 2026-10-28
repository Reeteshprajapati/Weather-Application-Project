import React from 'react';
import { Wind, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AirQualityCard({ airQuality }) {
  if (!airQuality || airQuality.usAqi == null) return null;

  const { usAqi, category, guidance, pm25, pm10, ozone, no2, badgeClass } = airQuality;

  // Percentage for the visual meter bar (0 to 300 scale)
  const meterPercent = Math.min(Math.round((usAqi / 300) * 100), 100);

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-card p-6 sm:p-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-navy">
              Live Air Quality Index (AQI)
            </h2>
            <p className="text-xs text-muted font-medium">Real-time particulate matter & ambient air pollution</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full text-xs font-bold border ${badgeClass}`}>
          {category}
        </div>
      </div>

      {/* Main AQI Value & Visual Gauge */}
      <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black text-navy tracking-tight">
              {usAqi}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">US AQI Index</span>
              <span className="text-sm font-bold text-slate-800">{category}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-md leading-relaxed">
            {guidance}
          </p>

        </div>

        {/* Visual Color Meter Bar */}
        <div className="mt-4">
          <div className="h-3 w-full bg-slate-200 rounded-full relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-rose-600"
              style={{ width: `${meterPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mt-1 px-1">
            <span>0 Good</span>
            <span>50</span>
            <span>100 Moderate</span>
            <span>150</span>
            <span>200+ Hazardous</span>
          </div>
        </div>
      </div>

      {/* Pollutant Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* PM2.5 */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>PM 2.5</span>
            <Wind className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-lg font-black text-navy">
            {pm25 != null ? `${pm25} μg/m³` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fine inhalable particles</p>
        </div>

        {/* PM10 */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>PM 10</span>
            <Wind className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-lg font-black text-navy">
            {pm10 != null ? `${pm10} μg/m³` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Coarse dust & pollen</p>
        </div>

        {/* Ozone */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Ozone (O₃)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-navy">
            {ozone != null ? `${ozone} μg/m³` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ground-level ozone</p>
        </div>

        {/* NO2 */}
        <div className="p-3.5 rounded-xl bg-white border-2 border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>NO₂</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-black text-navy">
            {no2 != null ? `${no2} μg/m³` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Nitrogen dioxide</p>
        </div>

      </div>

    </div>
  );
}
