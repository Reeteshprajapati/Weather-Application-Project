import React from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

export default function ErrorAlert({ message, searchedCity, onRetry, onDismiss }) {
  const isNetworkError = message?.toLowerCase().includes('network') || message?.toLowerCase().includes('connection');

  return (
    <div className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-200 text-rose-800 mt-0.5 flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose-950">
              {isNetworkError ? 'Connection Issue' : 'Unable to Retrieve Weather Data'}
            </h3>
            <p className="text-xs sm:text-sm text-rose-900 mt-1 font-semibold leading-relaxed">
              {message || `No weather data available for "${searchedCity}".`}
            </p>

            {/* Retry Button */}
            {onRetry && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-rose-700 text-white hover:bg-rose-800 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Search</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-900 hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Dismiss notification"
            aria-label="Dismiss error notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}

      </div>
    </div>
  );
}
