import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import RecentSearches from './components/RecentSearches';
import FavoriteCities from './components/FavoriteCities';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorAlert from './components/ErrorAlert';
import WeatherRecommendations from './components/WeatherRecommendations';
import { fetchWeatherFromBackend } from './services/weatherService';

const RECENT_SEARCHES_STORAGE_KEY = 'skypulse_user_recent_searches_v5';
const FAVORITES_STORAGE_KEY = 'skypulse_favorite_cities_v1';
const TEMP_UNIT_STORAGE_KEY = 'skypulse_temp_unit';
const DEFAULT_CITY = 'Indore';

export default function App() {
  // State management
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem(TEMP_UNIT_STORAGE_KEY) || 'C';
  });

  // Favorite / Pinned Cities stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return ['Indore', 'London'];
    } catch {
      return ['Indore', 'London'];
    }
  });

  // Recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  // Race condition protection: sequence counter & abort controller
  const activeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Unit toggle handler
  const handleToggleUnit = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem(TEMP_UNIT_STORAGE_KEY, newUnit);
  };

  // Toggle favorite / pinned city
  const handleToggleFavorite = (cityName) => {
    if (!cityName) return;
    setFavorites((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === cityName.toLowerCase());
      let updated;
      if (exists) {
        updated = prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
      } else {
        updated = [cityName, ...prev].slice(0, 6);
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorites', e);
      }
      return updated;
    });
  };

  // Remove single favorite
  const handleRemoveFavorite = (cityName) => {
    setFavorites((prev) => {
      const updated = prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update favorites', e);
      }
      return updated;
    });
  };

  // Add city to recent searches
  const saveToRecentSearches = (cityName) => {
    if (!cityName) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => {
        const name = typeof item === 'string' ? item : item.name;
        return name.toLowerCase() !== cityName.toLowerCase();
      });

      const updated = [cityName, ...filtered].slice(0, 6);

      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches', e);
      }

      return updated;
    });
  };

  // Fetch weather for a city from Spring Boot backend using real API data
  const handleSearch = async (queryInput) => {
    const cityName = typeof queryInput === 'string' ? queryInput.trim() : queryInput?.name?.trim();
    if (!cityName) return;

    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);
    setError(null);
    setLastQuery(cityName);

    try {
      const data = await fetchWeatherFromBackend(cityName, signal);

      // Verify request is still current
      if (requestId !== activeRequestIdRef.current) return;

      setWeatherData(data);
      saveToRecentSearches(data.city || cityName);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (requestId !== activeRequestIdRef.current) return;

      setError(err.message || `Unable to fetch weather data for "${cityName}".`);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Remove single city from history
  const handleRemoveRecentCity = (itemToRemove) => {
    const targetName = typeof itemToRemove === 'string' ? itemToRemove : itemToRemove.name;
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => {
        const name = typeof item === 'string' ? item : item.name;
        return name.toLowerCase() !== targetName.toLowerCase();
      });
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update recent searches', e);
      }
      return updated;
    });
  };

  // Clear all recent searches
  const handleClearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches', e);
    }
  };

  // On mount: Load last searched city, or first favorite, or default to Indore
  useEffect(() => {
    let initialCity = DEFAULT_CITY;
    const savedRecent = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (savedRecent) {
      try {
        const parsed = JSON.parse(savedRecent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].name;
          if (first) initialCity = first;
        }
      } catch (e) {
        console.error('Error reading saved searches', e);
      }
    } else if (savedFavs) {
      try {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          initialCity = parsed[0];
        }
      } catch (e) {
        console.error('Error reading favorites', e);
      }
    }

    Promise.resolve().then(() => {
      handleSearch(initialCity);
    });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isCurrentFavorite = weatherData?.city
    ? favorites.some((f) => f.toLowerCase() === weatherData.city.toLowerCase())
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-navy font-sans antialiased">
      
      {/* Navigation & Unit Switcher */}
      <Navbar unit={unit} onToggleUnit={handleToggleUnit} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Advanced Search, Pinned Favorites, & Recent History Card */}
        <section className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-card p-5 sm:p-6 space-y-3.5">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {/* Pinned Favorites Quick Bar */}
          <FavoriteCities
            favorites={favorites}
            onSelectCity={handleSearch}
            onRemoveFavorite={handleRemoveFavorite}
            currentCity={weatherData?.city}
          />

          {/* Recent Searches */}
          <RecentSearches
            recentSearches={recentSearches}
            onSelectCity={handleSearch}
            onRemoveCity={handleRemoveRecentCity}
            onClearAll={handleClearAllRecent}
            currentCity={weatherData?.city}
          />
        </section>

        {/* Error Notification */}
        {error && (
          <ErrorAlert
            message={error}
            searchedCity={lastQuery}
            onRetry={() => lastQuery && handleSearch(lastQuery)}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Loading State or Real Weather Dashboard */}
        {isLoading && !weatherData ? (
          <LoadingSkeleton />
        ) : weatherData ? (
          <div className="space-y-6">
            
            {/* Main Current Weather Hero Card */}
            <CurrentWeather
              weatherData={weatherData}
              unit={unit}
              isFavorite={isCurrentFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Smart Rule-Based Weather Recommendations */}
            <WeatherRecommendations recommendations={weatherData.recommendations} />

            {/* Live Air Quality Index (AQI) Meter & Health Guidance Card */}
            {weatherData.airQuality && (
              <AirQualityCard airQuality={weatherData.airQuality} />
            )}

            {/* Forecast Sections */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* 24-Hour Forecast */}
              <HourlyForecast hourlyData={weatherData.hourly} unit={unit} />

              {/* 7-Day Extended Forecast */}
              <DailyForecast forecastData={weatherData.forecast} unit={unit} />

            </div>
          </div>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-slate-200 bg-white py-6 text-center text-xs font-semibold text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkyPulse • React + Java 21 Spring Boot REST Architecture</span>
          <span>Live Open-Meteo Weather & Air Quality Observations</span>
        </div>
      </footer>

    </div>
  );
}
