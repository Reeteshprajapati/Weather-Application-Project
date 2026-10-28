# Weather Backend (Spring Boot REST API)

A clean, beginner-friendly Spring Boot backend that fetches live weather and geocoding data from Open-Meteo and exposes RESTful endpoints for the React frontend.

---

## 🚀 How to Run the Backend

### Prerequisites
- Java 21+ (`java -version`)
- Maven 3.9+ (`mvn -version`)

### Running with Maven (PowerShell)
From the `weather-backend` directory:
```powershell
# Using installed Maven
& "C:\Users\HP\maven\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run

# Or run tests
& "C:\Users\HP\maven\apache-maven-3.9.9\bin\mvn.cmd" test
```

### Running the Packaged JAR
```powershell
# Build the JAR
& "C:\Users\HP\maven\apache-maven-3.9.9\bin\mvn.cmd" clean package -DskipTests

# Run the JAR
java -jar target\weather-backend-1.0.0.jar
```
The server will start on **http://localhost:8080**.

---

## 📡 REST API Endpoints

### 1. Health Check
- **URL**: `GET /api/weather/health`
- **Description**: Verifies the backend server is running and tests connectivity to the Open-Meteo provider.
- **Sample Response**:
  ```json
  {
    "status": "UP",
    "service": "weather-backend",
    "message": "Weather Backend API is up and running.",
    "externalProvider": "Open-Meteo reachable",
    "timestamp": "2026-10-28T15:48:52.5873354"
  }
  ```

### 2. Live Weather by City
- **URL**: `GET /api/weather?city={cityName}`
- **Example**: `GET /api/weather?city=Indore`
- **Sample Response (200 OK)**:
  ```json
  {
    "cityName": "Indore",
    "country": "India",
    "latitude": 22.71792,
    "longitude": 75.8333,
    "timezone": "Asia/Kolkata",
    "temperature": 29.1,
    "feelsLike": 28.3,
    "humidity": 40,
    "windSpeed": 14.5,
    "weatherCode": 3,
    "weatherDescription": "Overcast",
    "isDay": true,
    "hourlyForecast": [
      { "time": "2026-10-28T00:00", "temperature": 21.4, "weatherCode": 1 },
      { "time": "2026-10-28T01:00", "temperature": 20.6, "weatherCode": 1 }
    ],
    "dailyForecast": [
      { "date": "2026-10-28", "minTemperature": 18.9, "maxTemperature": 29.5, "weatherCode": 3 },
      { "date": "2026-10-29", "minTemperature": 21.2, "maxTemperature": 30.4, "weatherCode": 55 }
    ]
  }
  ```

### 3. Error Responses
- **City Not Found (404)**:
  ```json
  {
    "timestamp": "2026-10-28T15:49:16.1977677",
    "status": 404,
    "error": "Not Found",
    "message": "City not found: NonExistentCity999XYZ",
    "path": "/api/weather"
  }
  ```
- **Empty City Parameter (400)**:
  ```json
  {
    "timestamp": "2026-10-28T15:49:29.5339203",
    "status": 400,
    "error": "Bad Request",
    "message": "City name parameter cannot be empty or blank.",
    "path": "/api/weather"
  }
  ```

---

## 📂 Package Structure Explained

- **`com.weatherapp.config`**:
  Contains configuration classes (`WebConfig`). Enables CORS for `http://localhost:5173` and configures the `RestClient` bean with timeouts.
- **`com.weatherapp.controller`**:
  Contains `WeatherController` which defines the HTTP endpoints (`/api/weather`, `/api/weather/health`), handles query parameters, and returns HTTP responses.
- **`com.weatherapp.service`**:
  Contains `WeatherService` which holds business logic, coordinates geocoding search and forecast fetching, validates city inputs, and maps data.
- **`com.weatherapp.client`**:
  Contains `OpenMeteoClient` which performs safe external HTTP calls to Open-Meteo's geocoding and forecast APIs using Spring's `RestClient`.
- **`com.weatherapp.dto`**:
  Contains Data Transfer Objects for JSON serialization and deserialization (`WeatherResponseDto`, `HourlyForecastDto`, `DailyForecastDto`, `GeocodingResponseDto`, `OpenMeteoForecastResponseDto`, `HealthResponseDto`, `ErrorResponseDto`).
- **`com.weatherapp.exception`**:
  Contains custom exceptions (`CityNotFoundException`, `InvalidCityException`, `WeatherServiceException`) and `GlobalExceptionHandler` (`@RestControllerAdvice`) to return clean JSON error payloads without stack traces.
