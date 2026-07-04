# Weather Dashboard - API Documentation

## Project APIs Overview

This document lists all the APIs and services used in the Weather Dashboard project.

---

## 1. Backend API Endpoints (FastAPI)

### Base URL
- **Local**: `http://localhost:5000`
- **Production**: Available via ngrok tunnel

### Health & Status

#### GET `/`
Returns backend status message
```
Response: {
  "message": "Weather Dashboard Backend is Running 🚀"
}
```

#### GET `/health`
Checks backend health
```
Response: {
  "status": "healthy",
  "backend": "FastAPI",
  "version": "1.0.0"
}
```

---

### Location Management

#### GET `/locations`
Get all saved locations from database
```
Response: [
  {
    "id": 1,
    "city_name": "London",
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  ...
]
```

#### GET `/search/{query}`
Search for cities, states, and countries
```
Params:
  - query (string): Search term (minimum 2 characters)

Response: {
  "results": [
    {
      "id": 2643743,
      "name": "London",
      "region": "England",
      "country": "United Kingdom",
      "latitude": 51.50853,
      "longitude": -0.12574
    },
    ...
  ]
}
```

#### GET `/search-by-weather/{condition}`
Search for cities with specific weather conditions
```
Params:
  - condition (string): Weather condition filter
    Options: rainy, snowing, thunderstorm, sunny, foggy, cloudy, windy, hot, cold

Response: {
  "results": [
    {
      "id": None,
      "name": "Tokyo",
      "region": "",
      "country": "",
      "condition": "Partly cloudy",
      "temperature": 26,
      "latitude": 35.6762,
      "longitude": 139.6503
    },
    ...
  ]
}
```

#### POST `/locations`
Add a new location to the database
```
Params:
  - city_name (string): Name of the city
  - latitude (float): City latitude
  - longitude (float): City longitude

Response: Location object created
```

#### DELETE `/locations/{city_name}`
Remove a location from the database
```
Params:
  - city_name (string): Name of the city to delete

Response: {
  "message": "Location '{city_name}' deleted successfully"
}
```

---

### Weather Data

#### GET `/weather/{city_name}`
Get current weather, forecast, and analytics for a city
```
Params:
  - city_name (string): Name of the city

Response: {
  "current": {
    "temperature_2m": 16.8,
    "apparent_temperature": 15.2,
    "relative_humidity_2m": 72,
    "wind_speed_10m": 8.5,
    "wind_direction_10m": 240,
    "wind_gusts_10m": 15.2,
    "pressure_msl": 1013.25,
    "visibility": 10000,
    "uv_index": 3.5,
    "weather_code": 1,
    "is_day": 1,
    "condition": "Mainly clear",
    "icon": "cloudy",
    "theme_key": "clear"
  },
  "forecast": [
    {
      "label": "2026-07-04",
      "tempMax": 22,
      "tempMin": 15,
      "icon": "cloudy"
    },
    ...
  ],
  "hourlyForecast": [
    {
      "label": "2026-07-04T00:00",
      "temp": 16,
      "icon": "cloudy",
      "precipitationProbability": 10,
      "windSpeed": 8
    },
    ...
  ],
  "sunrise": "2026-07-04T04:45",
  "sunset": "2026-07-04T21:15"
}
```

#### GET `/weather/coords/{latitude}/{longitude}`
Get weather by GPS coordinates
```
Params:
  - latitude (float): Location latitude
  - longitude (float): Location longitude

Response: Same as /weather/{city_name}
```

#### GET `/forecast/{city_name}`
Get only the forecast data for a city
```
Params:
  - city_name (string): Name of the city

Response: {
  "forecast": [...],
  "hourlyForecast": [...],
  "sunrise": "...",
  "sunset": "..."
}
```

#### GET `/weather-history/{city_name}`
Get historical weather data for a city (last 365 days)
```
Params:
  - city_name (string): Name of the city

Response: {
  "city": "London",
  "data": [
    {
      "date": "2025-07-04",
      "temp_max": 22.5,
      "temp_min": 15.3,
      "precipitation": 2.5,
      "wind_speed": 8.5
    },
    ...
  ],
  "statistics": {
    "highest_temperature": 28.5,
    "lowest_temperature": 5.2,
    "average_temperature": 16.8,
    "total_records": 365
  }
}
```

---

### Air Quality & Alerts

#### GET `/air-quality/{city_name}`
Get air quality data for a city
```
Params:
  - city_name (string): Name of the city

Response: {
  "aqi": 45,
  "category": "Good",
  "recommendation": "Air quality is good. Enjoy outdoor activities as usual.",
  "pm2_5": 8.5,
  "pm10": 12.3,
  "o3": 45.2,
  "no2": 15.8,
  "co": 285,
  "so2": 2.5,
  "uvIndex": 3.5
}
```

#### GET `/alerts/{city_name}`
Get weather alerts for a city
```
Params:
  - city_name (string): Name of the city

Response: {
  "alerts": []
}

Note: Currently returns empty array. Integration with alert provider needed.
```

#### GET `/weather-conditions`
Get list of available weather condition filters
```
Response: {
  "conditions": [
    {"id": "clear", "label": "Clear", "emoji": "☀️"},
    {"id": "cloudy", "label": "Cloudy", "emoji": "☁️"},
    {"id": "rainy", "label": "Rainy", "emoji": "🌧️"},
    {"id": "snowy", "label": "Snowy", "emoji": "❄️"},
    {"id": "thunderstorm", "label": "Thunderstorm", "emoji": "⛈️"},
    {"id": "foggy", "label": "Foggy", "emoji": "🌫️"},
    {"id": "windy", "label": "Windy", "emoji": "💨"}
  ]
}
```

---

## 2. External APIs Used

### Open-Meteo Geocoding API
**Purpose**: Convert city names to coordinates and vice versa

#### Search Locations
```
URL: https://geocoding-api.open-meteo.com/v1/search
Params:
  - name: City/location name
  - count: Number of results (max 8)
  - language: Language code (en)
  - format: json

Example:
https://geocoding-api.open-meteo.com/v1/search?name=London&count=8&language=en&format=json
```

#### Get Coordinates
```
URL: https://geocoding-api.open-meteo.com/v1/search
Params:
  - name: City name
  - count: 1

Example:
https://geocoding-api.open-meteo.com/v1/search?name=London&count=1
```

### Open-Meteo Weather API
**Purpose**: Get current weather, forecasts, and historical data

#### Current Weather
```
URL: https://api.open-meteo.com/v1/forecast
Params:
  - latitude: Location latitude
  - longitude: Location longitude
  - current: temperature_2m, apparent_temperature, relative_humidity_2m, 
             wind_speed_10m, wind_direction_10m, wind_gusts_10m, 
             pressure_msl, visibility, uv_index, weather_code, is_day

Example:
https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m,weather_code,is_day
```

#### Forecast Data
```
URL: https://api.open-meteo.com/v1/forecast
Params:
  - latitude: Location latitude
  - longitude: Location longitude
  - daily: weather_code, temperature_2m_max, temperature_2m_min, sunrise, sunset
  - hourly: temperature_2m, weather_code, precipitation_probability, wind_speed_10m
  - forecast_days: 7
  - timezone: auto

Example:
https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&forecast_days=7&timezone=auto
```

#### Historical Weather
```
URL: https://archive-api.open-meteo.com/v1/archive
Params:
  - latitude: Location latitude
  - longitude: Location longitude
  - start_date: YYYY-MM-DD format
  - end_date: YYYY-MM-DD format
  - daily: temperature_2m_max, temperature_2m_min, precipitation_sum, wind_speed_10m_max
  - timezone: auto

Example:
https://archive-api.open-meteo.com/v1/archive?latitude=51.5&longitude=-0.1&start_date=2025-07-04&end_date=2026-07-04&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto
```

### Open-Meteo Air Quality API
**Purpose**: Get air quality data

```
URL: https://air-quality-api.open-meteo.com/v1/air-quality
Params:
  - latitude: Location latitude
  - longitude: Location longitude
  - current: us_aqi, pm2_5, pm10, ozone, nitrogen_dioxide, 
             carbon_monoxide, sulphur_dioxide, uv_index

Example:
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.5&longitude=-0.1&current=us_aqi,pm2_5,pm10
```

### OpenStreetMap Nominatim API
**Purpose**: Reverse geocoding (get city name from coordinates)

```
URL: https://nominatim.openstreetmap.org/reverse
Params:
  - lat: Latitude
  - lon: Longitude
  - format: json
  - zoom: 10

Example:
https://nominatim.openstreetmap.org/reverse?lat=51.5074&lon=-0.1278&format=json&zoom=10
```

---

## 3. Service Functions (Python Backend)

### services.py

#### `get_coordinates(city_name: str)`
Converts city name to latitude/longitude
```python
Returns: {
  "latitude": float,
  "longitude": float
} or None
```

#### `reverse_geocode(latitude: float, longitude: float)`
Converts coordinates to city name
```python
Returns: str (city name or "Current Location")
```

#### `search_locations(query: str)`
Searches for locations matching a query
```python
Returns: List of location objects with id, name, region, country, latitude, longitude
```

#### `get_current_weather(latitude: float, longitude: float)`
Fetches current weather data
```python
Returns: JSON response from Open-Meteo API
```

#### `get_icon(weather_code)`
Maps weather code to icon name
```python
Returns: str (sunny, cloudy, rainy, snowy, stormy)
```

#### `get_condition(weather_code)`
Maps weather code to condition description
```python
Returns: str (e.g., "Partly cloudy", "Light rain")
```

#### `get_theme_key(weather_code, is_day=1)`
Determines the UI theme based on weather
```python
Returns: str (storm, snow, heavy-rain, rain, fog, cloudy, night, clear)
```

#### `get_forecast(latitude: float, longitude: float)`
Fetches 7-day forecast and hourly forecast
```python
Returns: {
  "forecast": List[daily forecast],
  "hourlyForecast": List[hourly forecast],
  "sunrise": str,
  "sunset": str
}
```

#### `get_air_quality(latitude: float, longitude: float)`
Fetches air quality data
```python
Returns: {
  "aqi": int,
  "category": str,
  "recommendation": str,
  "pm2_5": float,
  "pm10": float,
  "o3": float,
  "no2": float,
  "co": float,
  "so2": float,
  "uvIndex": float
}
```

#### `get_alerts(latitude: float, longitude: float)`
Fetches weather alerts (currently empty)
```python
Returns: []
```

#### `get_historical_weather(latitude: float, longitude: float, days: int = 365)`
Fetches historical weather data
```python
Returns: JSON with daily max/min temps, precipitation, wind speed
```

---

## 4. CRUD Operations (crud.py)

### Database Functions

#### `get_location_by_city(db: Session, city_name: str)`
Retrieves a location from database by city name

#### `create_location(db: Session, city_name: str, latitude: float, longitude: float)`
Creates a new location in database

#### `get_locations(db: Session)`
Gets all saved locations from database

#### `save_weather_history(db, location_id, weather_date, temperature_max, temperature_min, precipitation, wind_speed)`
Saves historical weather data to database

#### `weather_record_exists(db, location_id: int, weather_date)`
Checks if a weather record exists

#### `get_weather_history(db: Session, location_id: int, days: int = 365)`
Retrieves historical weather records for a location

#### `delete_location(db: Session, city_name: str)`
Deletes a location from database

---

## 5. Frontend API Integration

### Frontend Services (weatherService.js)
```javascript
// Search locations
searchLocations(query) → Promise<locations>

// Get weather for a city
getWeather(cityName) → Promise<weather>

// Get weather by coordinates
getWeatherByCoords(lat, lon) → Promise<weather>

// Get forecast
getForecast(cityName) → Promise<forecast>

// Get air quality
getAirQuality(cityName) → Promise<airQuality>

// Get alerts
getAlerts(cityName) → Promise<alerts>

// Get weather history
getWeatherHistory(cityName) → Promise<history>
```

### Vite Proxy Configuration
Frontend requests to `/api/*` are proxied to `http://localhost:5000`

---

## 6. Weather Codes Reference

### WMO Weather Interpretation Codes

| Code | Condition | Icon |
|------|-----------|------|
| 0 | Clear sky | sunny |
| 1 | Mainly clear | cloudy |
| 2 | Partly cloudy | cloudy |
| 3 | Overcast | cloudy |
| 45 | Fog | cloudy |
| 48 | Freezing fog | cloudy |
| 51-57 | Drizzle | rainy |
| 61-67 | Rain | rainy |
| 71-77 | Snow | snowy |
| 80-82 | Rain showers | rainy |
| 85-86 | Snow showers | snowy |
| 95-99 | Thunderstorm | stormy |

---

## 7. Database Schema

### Locations Table
```
- id: Primary Key
- city_name: String
- latitude: Float
- longitude: Float
```

### Weather History Table
```
- id: Primary Key
- location_id: Foreign Key (Locations)
- weather_date: Date
- temperature_max: Float
- temperature_min: Float
- precipitation: Float
- wind_speed: Float
```

---

## 8. CORS Configuration

**Allowed Origins**:
- localhost:* (all ports)
- 127.0.0.1:* (all ports)
- *.ngrok-free.dev
- *.ngrok.io

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH

**Allowed Headers**: *

---

## 9. Authentication

Currently, **no authentication** is implemented. All endpoints are publicly accessible.

---

## 10. Rate Limiting

**Open-Meteo APIs**: Free tier with reasonable limits. No rate limiting configured on backend.

---

## 11. Error Handling

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad request
- **404**: Resource not found
- **503**: Service unavailable (external API error)

---

## 12. API Performance Notes

- **Weather filters**: Checks 20 major cities (optimized for fast response)
- **Search**: Returns up to 8 results per query
- **Forecast**: 7-day forecast + 24 hourly forecasts
- **Historical data**: 365 days of daily data (configurable)

---

## 13. Future Enhancements

- [ ] Add weather alert provider integration (NWS for US)
- [ ] Implement API authentication/authorization
- [ ] Add rate limiting and caching
- [ ] Support for multiple weather data sources
- [ ] Real-time weather updates via WebSocket
- [ ] User preferences API

---

**Last Updated**: 2026-07-04
**API Version**: 1.0.0
**Project**: Weather Dashboard Internship Project
