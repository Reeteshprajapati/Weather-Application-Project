import React from 'react';
import {
  Umbrella,
  Sun,
  Wind,
  Footprints,
  Snowflake,
  ShieldAlert,
  Info,
  ShieldCheck
} from 'lucide-react';

function getRecommendationIcon(iconType) {
  const norm = String(iconType || '').toLowerCase();
  switch (norm) {
    case 'umbrella':
      return <Umbrella className="w-5 h-5 text-blue-600" />;
    case 'sun':
      return <Sun className="w-5 h-5 text-amber-600" />;
    case 'wind':
      return <Wind className="w-5 h-5 text-teal-600" />;
    case 'snowflake':
      return <Snowflake className="w-5 h-5 text-sky-600" />;
    case 'activity':
      return <Footprints className="w-5 h-5 text-indigo-600" />;
    default:
      return <ShieldAlert className="w-5 h-5 text-amber-600" />;
  }
}

function getCardStyle(level) {
  switch (level) {
    case 'WARNING':
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        card: 'border-2 border-amber-200 bg-amber-50/50 hover:border-amber-400'
      };
    case 'DANGER':
      return {
        badge: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
        card: 'border-2 border-rose-200 bg-rose-50/50 hover:border-rose-400'
      };
    case 'SUCCESS':
      return {
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
        card: 'border-2 border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
      };
    case 'INFO':
    default:
      return {
        badge: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
        card: 'border-2 border-blue-200 bg-blue-50/40 hover:border-blue-400'
      };
  }
}

export default function WeatherRecommendations({ recommendations }) {
  const hasRecommendations = Array.isArray(recommendations) && recommendations.length > 0;

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-card p-6 sm:p-7">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-navy">
              Smart Weather Guidance
            </h2>
            <p className="text-xs text-muted font-medium">Deterministic rules evaluated from actual meteorological conditions</p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid or Empty State */}
      {hasRecommendations ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const styles = getCardStyle(rec.level);
            return (
              <div
                key={`${rec.category}-${index}`}
                className={`p-4 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md flex items-start gap-3.5 ${styles.card}`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex-shrink-0">
                  {getRecommendationIcon(rec.iconType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold text-navy truncate">
                      {rec.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-wide uppercase border ${styles.badge}`}>
                      {rec.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {rec.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center rounded-2xl bg-slate-50 border-2 border-slate-200">
          <div className="inline-flex p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 mb-2 shadow-xs">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-bold text-navy">
            No special weather precautions needed at this time.
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Atmospheric conditions are mild and well within standard comfortable ranges.
          </p>
        </div>
      )}

    </div>
  );
}
