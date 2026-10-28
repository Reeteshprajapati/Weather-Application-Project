# 🌤️ Full-Stack Weather Application

A modern, responsive, portfolio-ready weather application built with a **React (Vite) frontend** and a **Java Spring Boot backend**, featuring **rule-based smart weather recommendations** and real-time data powered by the Open-Meteo API.

---

## 🏛️ Architecture Overview

```
                      +-----------------------------+
                      |   Browser / React Client    |
                      |  (Vite + Tailwind CSS v4)   |
                      |    http://localhost:5173    |
                      +--------------+--------------+
                                     |
                          REST API   |  VITE_API_BASE_URL
                          Requests   |  http://localhost:8080/api
                                     v
                      +-----------------------------+
                      |     Spring Boot Backend     |
                      |    (Java 21+, Port 8080)    |
                      |                             |
                      |  - WeatherController        |
                      |  - WeatherService           |
                      |  - WeatherRecommendation    |
                      |    Service (Rule-Based)     |
                      |  - OpenMeteoClient          |
                      +--------------+--------------+
                                     |
                          HTTPS      |  RestClient (JSON)
                          Requests   |  (No API key needed)
                                     v
                      +-----------------------------+
                      |       Open-Meteo API        |
                      |  - Geocoding API            |
                      |  - Forecast Weather API     |
                      +-----------------------------+
```

---

## ✨ Features

- **Real-Time City Search:** Fast geocoding and live meteorological data retrieval.
- **Smart Rule-Based Weather Recommendations:**
  - ☔ **Umbrella Advisory:** Triggers on elevated precipitation probability (≥40% caution, ≥70% warning).
  - ☀️ **Sun Protection (UV):** Triggers when UV index reaches moderate-to-high levels (≥6 warning, ≥8 extreme).
  - 💨 **Wind Safety:** Alerts when wind speeds exceed 40 km/h (caution) or 70 km/h (gale alert).
  - 🏃 **Outdoor Activity Guidance:** Recommends running, walking, or cycling during clear/mild conditions (15°C–28°C).
  - 🛡️ **Defensive Design:** Omits recommendations gracefully if individual metrics are unavailable; never assumes hardcoded values.
- **Current Weather Dashboard:** Displays temperature, "feels like", humidity, wind speed & direction, surface pressure, UV index, and sunrise/sunset times.
- **Extended Forecasts:**
  - **24-Hour Forecast:** Horizontal scroll with condition icons and hourly temperatures.
  - **7-Day Forecast:** Daily minimum/maximum temperatures with weather icons and descriptions.
- **Interactive Controls:** Instant Celsius (°C) and Fahrenheit (°F) conversion toggle.
- **Recent Searches:** Automatically persisted to `localStorage` with deduplication and one-click reload.
- **Robust Error Handling & UX:**
  - Graceful handling for blank city names (`400 Bad Request`), unknown cities (`404 Not Found`), and external API timeouts (`502 Bad Gateway`).
  - Animated loading skeletons during data fetches.
  - User-friendly error cards with a **Retry** button.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React icons, Oxlint |
| **Backend** | Java 21+ (Spring Boot 3.3.5), Spring Web (`RestClient`), Maven 3.9+ |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, Maven Surefire Plugin |
| **External API**| Open-Meteo Geocoding & Forecast APIs (free, no auth required) |

---

## 📡 API Endpoints

### 1. Get Weather & Recommendations
```http
GET /api/weather?city={cityName}
```

**Sample Response (`200 OK`):**
```json
{
  "cityName": "Indore",
  "country": "India",
  "latitude": 22.7179,
  "longitude": 75.8333,
  "temperature": 29.0,
  "feelsLike": 28.5,
  "humidity": 35,
  "windSpeed": 11.2,
  "windDirection": 140,
  "pressure": 1012.0,
  "uvIndex": 7.5,
  "weatherCode": 0,
  "weatherCondition": "Clear sky",
  "isDay": 1,
  "sunrise": "06:30",
  "sunset": "17:55",
  "recommendations": [
    {
      "category": "SUN",
      "title": "Sun Protection Recommended",
      "reason": "UV index is very high (7.5). Wear sunscreen (SPF 30+), sunglasses, and a hat.",
      "iconType": "SUN",
      "level": "WARNING"
    },
    {
      "category": "ACTIVITY",
      "title": "Favorable for Outdoor Activities",
      "reason": "Clear skies and moderate wind create favorable conditions for outdoor sports and walks.",
      "iconType": "ACTIVITY",
      "level": "INFO"
    }
  ],
  "hourlyForecast": [ ... ],
  "dailyForecast": [ ... ]
}
```

### 2. Service Health Check
```http
GET /api/weather/health
```

**Response (`200 OK`):**
```json
{
  "status": "UP",
  "service": "weather-backend",
  "message": "Weather Backend API is up and running.",
  "externalProvider": "Open-Meteo accessible",
  "timestamp": "2026-10-28T16:11:50"
}
```

### 3. Error Responses
Standardized across all exceptions (`400 Bad Request`, `404 Not Found`, `502 Bad Gateway`):
```json
{
  "timestamp": "2026-10-28T16:11:50",
  "status": 404,
  "error": "Not Found",
  "message": "No weather data found for city: 'Atlantis'",
  "path": "/api/weather"
}
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Java 21+ JDK** installed and added to `PATH`
- **Node.js 18+** & `npm`
- **Maven 3.8+** (or use local Maven executable)

---

### Step 1: Run Backend (Spring Boot)

1. Open a terminal in the `weather-backend` directory:
   ```bash
   cd weather-backend
   ```
2. Run backend unit & integration tests:
   ```bash
   mvn test
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *Or build and run the packaged JAR:*
   ```bash
   mvn clean package -DskipTests
   java -jar target/weather-backend-1.0.0.jar
   ```
4. Backend will start at: `http://localhost:8080` (API base: `http://localhost:8080/api`).

---

### Step 2: Run Frontend (React + Vite)

1. Open a separate terminal in the root directory:
   ```bash
   # Make sure dependencies are installed
   npm install
   ```
2. Verify environment configuration in `.env`:
   ```properties
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing & Verification

### Backend Unit Tests
Run backend tests covering recommendation rules, edge cases, and missing metrics:
```bash
cd weather-backend
mvn test
```
*Coverage highlights:*
- `testUmbrellaRecommendation_HighPrecipitation()`: Validates umbrella alert on high rain chance.
- `testSunRecommendation_HighUv()`: Validates sunscreen guidance on UV ≥ 6.
- `testWindRecommendation_HighWind()`: Validates wind precautions on wind > 40 km/h.
- `testNullOrMissingMetricsHandledGracefully()`: Confirms no NullPointerExceptions when API fields are null.
- `testInvalidCity_ThrowsCityNotFoundException()`: Asserts proper 404 mapping for unknown cities.

### Frontend Lint Checks
Run the fast linter to verify code cleaniness:
```bash
npx oxlint
```
*(All 22 files verified with 0 errors and 0 warnings)*

---

## 📸 Portfolio Screenshots Checklist

When presenting this application in a portfolio or demonstration, capture:
- [ ] **Main Weather Dashboard:** Indore or London showing the glassmorphism weather card with current conditions.
- [ ] **Smart Weather Recommendations:** The dynamic cards displaying Sun Protection, Umbrella reminder, or Outdoor Activity guidance.
- [ ] **Hourly & 7-Day Forecast:** The responsive horizontal hourly forecast and 7-day projection.
- [ ] **Unit Toggle in Action:** Seamless switch between °C and °F.
- [ ] **Recent Searches Dropdown/List:** Quick-select past cities saved in `localStorage`.
- [ ] **Error & Loading States:** Loading skeleton and the invalid city error banner with retry button.
- [ ] **Responsive Views:** Desktop, tablet, and mobile views.

---

## 🔒 Design Decisions & Constraints

- **No AI Claims:** Recommendations are strictly deterministic rule-based algorithms with understandable thresholds.
- **Lightweight Architecture:** No database (MySQL/PostgreSQL), Hibernate, Docker, or external authentication needed, making it zero-friction to run locally.
- **Fail-Safe Operation:** Missing metrics from upstream providers do not break the UI or trigger exceptions.
