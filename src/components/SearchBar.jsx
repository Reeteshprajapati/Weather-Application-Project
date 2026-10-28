import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, Navigation, Compass, Globe, Mic } from 'lucide-react';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Voice Search (Web Speech API)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLocationError('Voice recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setLocationError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          // Remove trailing periods or conversational words if any
          const cleanCity = transcript.replace(/\.$/, '');
          setQuery(cleanCity);
          onSearch(cleanCity);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setLocationError('Microphone access was denied. Please allow microphone permission.');
        } else {
          setLocationError('Could not understand audio. Please try searching manually.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition exception:', e);
      setIsListening(false);
    }
  };

  // Global keyboard shortcut: Press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live autocomplete suggestions with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      Promise.resolve().then(() => {
        setSuggestions([]);
        setIsDropdownOpen(false);
      });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            setSuggestions(data.results);
            setIsDropdownOpen(true);
            setSelectedIndex(-1);
          } else {
            setSuggestions([]);
            setIsDropdownOpen(false);
          }
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Handle direct form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectSuggestion(suggestions[selectedIndex]);
      return;
    }
    if (!query.trim()) return;
    setIsDropdownOpen(false);
    onSearch(query.trim());
  };

  // Handle selection from dropdown
  const handleSelectSuggestion = (city) => {
    const selectedName = city.name;
    setQuery(selectedName);
    setIsDropdownOpen(false);
    setSuggestions([]);
    onSearch(selectedName);
  };

  // Keyboard navigation within suggestions
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  // "Detect My Location" via GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode with BigDataCloud (free client-side API)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (res.ok) {
            const data = await res.json();
            const cityName = data.city || data.locality || data.principalSubdivision;
            if (cityName) {
              setQuery(cityName);
              onSearch(cityName);
            } else {
              // Fallback to coordinates
              onSearch(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          }
        } catch {
          onSearch('Indore');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Please search manually.');
        } else {
          setLocationError('Unable to detect location. Please search manually.');
        }
      },
      { timeout: 8000 }
    );
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Quick popular city chips
  const POPULAR_CITIES = ['Indore', 'Mumbai', 'Delhi', 'London', 'New York', 'Tokyo'];

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center rounded-2xl bg-white border-2 border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 shadow-sm transition-all duration-150">

          {/* Search icon */}
          <div className="pl-4 pr-2 text-slate-500 pointer-events-none flex items-center justify-center">
            {isSearchingSuggestions ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-500" />
            )}
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder="Search town, city or region (e.g. London, Indore, Tokyo)..."
            className="w-full py-3.5 pr-20 text-sm sm:text-base text-navy font-semibold placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-none"
            disabled={isLoading}
            autoComplete="off"
            aria-label="Search city name"
          />

          {/* Right Controls inside search bar */}
          <div className="flex items-center gap-1 pr-2">

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-navy rounded-lg hover:bg-slate-100 transition-colors"
                title="Clear input"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search Microphone Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2 rounded-xl transition-all duration-150 ${isListening
                  ? 'bg-rose-100 text-rose-600 animate-pulse ring-2 ring-rose-400'
                  : 'text-slate-600 hover:text-primary hover:bg-blue-50'
                }`}
              title={isListening ? 'Listening... speak city name' : 'Voice Search (Speak city name)'}
              aria-label="Voice search"
            >
              {isListening ? (
                <Mic className="w-4 h-4 text-rose-600 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* GPS Detect Location Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating || isLoading}
              className="p-2 text-slate-600 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-150 disabled:opacity-50"
              title="Use current location (GPS)"
              aria-label="Detect current location"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </button>

            {/* Keyboard shortcut hint */}
            <span className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded">
              /
            </span>

            {/* Primary Search Button - ALWAYS VISIBLE & BOLD */}
            <button
              id="city-search-button"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-Black bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:hidden" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Autocomplete Dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                Matching Locations
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Use ↑ ↓ to navigate, Enter to select</span>
            </div>

            <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {suggestions.map((city, idx) => {
                const region = [city.admin1, city.country].filter(Boolean).join(', ');
                const isSelected = idx === selectedIndex;

                return (
                  <li key={`${city.id}-${city.latitude}-${city.longitude}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(city)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${isSelected ? 'bg-blue-50 text-primary' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-50 text-primary flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-sm font-bold text-navy block truncate">
                            {city.name}
                          </span>
                          <span className="text-xs text-muted block truncate">
                            {region || 'Location'}
                          </span>
                        </div>
                      </div>

                      {city.country_code && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {city.country_code}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </form>

      {/* Location error message if GPS failed */}
      {locationError && (
        <p className="text-xs font-semibold text-rose-accent bg-rose-light border border-rose-200 rounded-lg px-3 py-1.5 animate-in fade-in">
          {locationError}
        </p>
      )}

      {/* Quick City Discovery Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-primary" />
          Popular:
        </span>
        {POPULAR_CITIES.map((cityName) => (
          <button
            key={cityName}
            type="button"
            onClick={() => {
              setQuery(cityName);
              onSearch(cityName);
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-primary border border-slate-200 hover:border-primary/40 transition-all duration-150 shadow-2xs"
          >
            {cityName}
          </button>
        ))}
      </div>
    </div>
  );
}
