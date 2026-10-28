import React from 'react';
import { MapPin, ArrowRight, X } from 'lucide-react';

export default function CityResultsList({ cities, onSelectCity, onClose }) {
  if (!Array.isArray(cities) || cities.length <= 1) return null;

  return (
    <div className="w-full bg-card rounded-xl border border-line shadow-card p-4">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-line">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-sage-light text-forest">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-forest">
            Multiple locations found — choose yours:
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone hover:text-charcoal hover:bg-page transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            title="Close selection"
            aria-label="Close selection list"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {cities.map((city) => {
          const regionText = [city.admin1, city.country].filter(Boolean).join(', ');
          return (
            <button
              key={`${city.id}-${city.latitude}-${city.longitude}`}
              type="button"
              onClick={() => onSelectCity(city)}
              className="flex items-center justify-between p-3 rounded-lg border border-line bg-[#FAF8F5] hover:border-forest text-left transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest"
            >
              <div>
                <span className="text-sm font-semibold text-charcoal group-hover:text-forest block">
                  {city.name}
                </span>
                <span className="text-xs text-stone">
                  {regionText || 'Location'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
