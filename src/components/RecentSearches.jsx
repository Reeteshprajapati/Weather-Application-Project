import React from 'react';
import { History, X, Trash2 } from 'lucide-react';

export default function RecentSearches({
  recentSearches,
  onSelectCity,
  onRemoveCity,
  onClearAll,
  currentCity
}) {
  const hasHistory = Array.isArray(recentSearches) && recentSearches.length > 0;

  return (
    <div className="w-full pt-1">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1.5 text-navy font-bold">
          <History className="w-3.5 h-3.5 text-primary" />
          <span>Recent Searches:</span>
        </div>

        {hasHistory && (
          <button
            id="clear-recent-searches-btn"
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-accent font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1"
            title="Clear all recent searches"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Real Recent Searches Only */}
      {hasHistory ? (
        <div className="flex flex-wrap items-center gap-2">
          {recentSearches.map((item) => {
            const cityName = typeof item === 'string' ? item : item.name;
            const itemKey = typeof item === 'string' ? item : `${item.name}-${item.latitude || ''}`;
            const isSelected = currentCity?.toLowerCase() === cityName?.toLowerCase();

            return (
              <div
                key={itemKey}
                className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl text-xs font-bold border-2 transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-blue-50 border-primary text-primary'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-primary hover:text-primary'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectCity(cityName)}
                  className="hover:underline flex items-center gap-1"
                >
                  <span>{cityName}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCity(item);
                  }}
                  className="p-0.5 rounded text-slate-400 hover:text-rose-accent hover:bg-slate-100 transition-colors"
                  title={`Remove ${cityName} from history`}
                  aria-label={`Remove ${cityName} from history`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 font-medium">
          No recent searches. Search a city to build your history.
        </p>
      )}
    </div>
  );
}
