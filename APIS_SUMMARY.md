# Weather Dashboard - Complete API List

## Quick Reference - All APIs Used

### 📁 Files Generated with Full Documentation

1. **API_DOCUMENTATION.md** - Complete API documentation with all endpoints
2. **BACKEND_MAIN_API.py** - Main API routes file with full code
3. **BACKEND_SERVICES.py** - External API integration services
4. **BACKEND_CRUD.py** - Database CRUD operations
5. **APIS_SUMMARY.md** - This file

---

## Backend API Endpoints

### Health & Status (2 endpoints)
- `GET /` - Check if backend is running
- `GET /health` - Health check

### Location Endpoints (4 endpoints)
- `GET /locations` - Get all saved locations
- `GET /search/{query}` - Search cities/states/countries
- `GET /search-by-weather/{condition}` - Search by weather condition ⭐
- `POST /locations` - Add new location
- `DELETE /locations/{city_name}` - Remove location

### Weather Endpoints (4 endpoints)
- `GET /weather/{city_name}` - Get full weather data
- `GET /weather/coords/{latitude}/{longitude}` - Get weather by GPS
- `GET /forecast/{city_name}` - Get forecast only
- `GET /weather-history/{city_name}` - Get historical data

### Air Quality & Alerts (3 endpoints)
- `GET /air-quality/{city_name}` - Get air quality data
- `GET /alerts/{city_name}` - Get weather alerts
- `GET /weather-conditions` - Get available filters

---

## External APIs

### 1. Open-Meteo Geocoding API
**Purpose**: Convert location names to coordinates
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Used for**: `search_locations()`, `get_coordinates()`
- **Auth**: None (free)

### 2. Open-Meteo Weather API
**Purpose**: Current weather and forecasts
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Used for**: `get_current_weather()`, `get_forecast()`
- **Auth**: None (free)
- **Variables**: Temperature, humidity, wind, precipitation, UV index

### 3. Open-Meteo Archive API
**Purpose**: Historical weather data
- **Endpoint**: `https://archive-api.open-meteo.com/v1/archive`
- **Used for**: `get_historical_weather()`
- **Auth**: None (free)
- **Data**: 365 days of daily weather

### 4. Open-Meteo Air Quality API
**Purpose**: Air quality index and pollutants
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Used for**: `get_air_quality()`
- **Auth**: None (free)
- **Variables**: AQI, PM2.5, PM10, O3, NO2, CO, SO2

### 5. OpenStreetMap Nominatim API
**Purpose**: Reverse geocoding (coordinates to location)
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Used for**: `reverse_geocode()`
- **Auth**: None (free)
- **Rate Limit**: 1 request per second recommended

---

## Frontend API Calls

### Frontend Service Functions
Located in: `frontend/src/services/weatherService.js`

```javascript
// Search functions
searchLocations(query)              // Search cities
getCoordinates(cityName)            // Get lat/lon

// Weather functions
getWeather(cityName)                // Full weather data
getWeatherByCoords(lat, lon)        // Weather from GPS
getForecast(cityName)               // 7-day forecast

// Air quality & alerts
getAirQuality(cityName)             // Air quality data
getAlerts(cityName)                 // Weather alerts

// History
getWeatherHistory(cityName)         // Historical data
```

### Frontend API Proxy
- **Local**: `/api/*` → `http://localhost:5000`
- **Config**: `frontend/vite.config.js`

---

## Service Functions (Backend)

### Geocoding Services
```python
get_coordinates(city_name)           # Name → Lat/Lon
reverse_geocode(lat, lon)            # Lat/Lon → Name
search_locations(query)              # Search cities
```

### Weather Services
```python
get_current_weather(lat, lon)        # Current conditions
get_forecast(lat, lon)               # 7-day forecast
get_historical_weather(lat, lon)     # 365 days history
get_icon(weather_code)               # Code → Icon
get_condition(weather_code)          # Code → Description
get_theme_key(code, is_day)          # Code → UI Theme
```

### Air Quality Services
```python
get_air_quality(lat, lon)            # Air quality data
get_aqi_category(aqi)                # AQI → Category
get_aqi_recommendation(aqi)          # AQI → Advice
```

### Alert Services
```python
get_alerts(lat, lon)                 # Weather alerts (empty)
```

---

## CRUD Operations (Database)

### Location Operations
```python
get_location_by_city(db, city_name)
create_location(db, city_name, lat, lon)
get_locations(db)
delete_location(db, city_name)
```

### Weather History Operations
```python
save_weather_history(db, location_id, date, temp_max, temp_min, precip, wind)
weather_record_exists(db, location_id, weather_date)
get_weather_history(db, location_id, days=365)
```

---

## Data Models

### Location
```python
- id: Integer (Primary Key)
- city_name: String
- latitude: Float
- longitude: Float
```

### WeatherHistory
```python
- id: Integer (Primary Key)
- location_id: Integer (Foreign Key → Location)
- weather_date: Date
- temperature_max: Float
- temperature_min: Float
- precipitation: Float
- wind_speed: Float
```

---

## Weather Code Reference

### WMO Weather Interpretation Codes
- **0**: Clear sky
- **1-3**: Cloudy variants
- **45-48**: Fog variants
- **51-67**: Drizzle & Rain variants
- **71-86**: Snow & Showers variants
- **95-99**: Thunderstorm variants

### Icon Mapping
- `sunny`: Code 0
- `cloudy`: Codes 1-3
- `rainy`: Codes 51-67
- `snowy`: Codes 71-77, 85-86
- `stormy`: Codes 95-99

### Theme Mapping
- `storm`: Thunderstorms
- `snow`: Snow/Blizzard
- `heavy-rain`: Heavy rain
- `rain`: Light/moderate rain
- `fog`: Fog/Mist
- `cloudy`: Overcast/Partly cloudy
- `night`: Nighttime (any weather)
- `clear`: Clear sky/Sunny

---

## API Request Examples

### Search for a City
```
GET /search/london
Response: {
  "results": [
    {
      "id": 2643743,
      "name": "London",
      "region": "England",
      "country": "United Kingdom",
      "latitude": 51.50853,
      "longitude": -0.12574
    }
  ]
}
```

### Get Weather
```
GET /weather/London
Response: {
  "current": {
    "temperature_2m": 16.8,
    "apparent_temperature": 15.2,
    "relative_humidity_2m": 72,
    "wind_speed_10m": 8.5,
    ...
  },
  "forecast": [...],
  "hourlyForecast": [...],
  "sunrise": "...",
  "sunset": "..."
}
```

### Search by Weather
```
GET /search-by-weather/cloudy
Response: {
  "results": [
    {
      "id": null,
      "name": "Tokyo",
      "region": "",
      "country": "",
      "condition": "Partly cloudy",
      "temperature": 26,
      "latitude": 35.6762,
      "longitude": 139.6503
    }
  ]
}
```

### Get Air Quality
```
GET /air-quality/London
Response: {
  "aqi": 45,
  "category": "Good",
  "recommendation": "Air quality is good...",
  "pm2_5": 8.5,
  "pm10": 12.3,
  ...
}
```

---

## API Statistics

- **Total Backend Endpoints**: 13
- **External APIs Used**: 5
- **Service Functions**: 15+
- **CRUD Operations**: 8
- **Database Tables**: 2
- **Weather Codes Supported**: 50+

---

## Performance Notes

- ✅ Free external APIs (Open-Meteo)
- ✅ No API keys required
- ✅ Caching at database level for locations
- ✅ Historical data cached (365 days)
- ✅ Optimized for ~20 major cities in weather filter
- ✅ Typical response time: < 2 seconds

---

## CORS Configuration

**Allowed Origins**:
- `localhost:*` (all ports)
- `127.0.0.1:*` (all ports)
- `*.ngrok-free.dev`
- `*.ngrok.io`

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH

**Allowed Headers**: All

---

## Future Enhancements

- [ ] Add weather alert provider (NWS for US)
- [ ] Implement API authentication
- [ ] Add rate limiting
- [ ] Support for multiple weather data sources
- [ ] Real-time updates via WebSocket
- [ ] GraphQL API option
- [ ] API documentation/Swagger UI

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/app/main.py` | All API endpoints |
| `backend/app/services.py` | External API integration |
| `backend/app/crud.py` | Database operations |
| `backend/app/models.py` | Database schemas |
| `backend/app/database.py` | Database configuration |
| `frontend/src/services/weatherService.js` | Frontend API client |
| `frontend/vite.config.js` | API proxy setup |

---

**Last Updated**: 2026-07-04
**API Version**: 1.0.0
**Total Lines of API Code**: 1000+
