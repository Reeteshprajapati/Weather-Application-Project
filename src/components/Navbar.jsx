import React from 'react';
import { CloudSun } from 'lucide-react';

export default function Navbar({ unit, onToggleUnit }) {
  return (
    <header className="w-full bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25">
            <CloudSun className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-navy">
                SkyPulse
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Live
              </span>
            </div>
            <p className="text-xs text-muted font-medium hidden sm:block">Full-Stack Meteorological Intelligence</p>
          </div>
        </div>

        {/* Right side controls: Temperature Unit Toggle */}
        <div className="flex items-center gap-3">
          <div
            role="group"
            aria-label="Temperature unit selector"
            className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300"
          >
            <button
              id="celsius-toggle-btn"
              type="button"
              aria-pressed={unit === 'C'}
              onClick={() => onToggleUnit('C')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${unit === 'C'
                ? 'bg-primary text-Black shadow-sm'
                : 'text-slate-600 hover:text-navy font-semibold'
                }`}
              title="Display temperature in Celsius"
            >
              °C
            </button>
            <button
              id="fahrenheit-toggle-btn"
              type="button"
              aria-pressed={unit === 'F'}
              onClick={() => onToggleUnit('F')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${unit === 'F'
                ? 'bg-primary text-Black shadow-sm'
                : 'text-slate-600 hover:text-navy font-semibold'
                }`}
              title="Display temperature in Fahrenheit"
            >
              °F
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
