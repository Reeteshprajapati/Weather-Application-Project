import React from 'react';
import { Heart, X } from 'lucide-react';

export default function FavoriteCities({
  favorites,
  onSelectCity,
  onRemoveFavorite,
  currentCity
}) {
  const hasFavorites = Array.isArray(favorites) && favorites.length > 0;

  if (!hasFavorites) return null;

  return (
    <div className="w-full pt-1 pb-1">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-navy">
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
        <span>Pinned Favorites:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {favorites.map((cityName) => {
          const isSelected = currentCity?.toLowerCase() === cityName.toLowerCase();
          return (
            <div
              key={cityName}
              className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl text-xs font-bold border-2 transition-all shadow-xs ${
                isSelected
                  ? 'bg-rose-50 border-rose-400 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-rose-400 hover:text-rose-600'
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
                  onRemoveFavorite(cityName);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                title={`Unpin ${cityName}`}
                aria-label={`Unpin ${cityName}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
