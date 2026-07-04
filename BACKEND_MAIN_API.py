# File: backend/app/main.py
# Weather Dashboard API - Main Routes

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, get_db
from app import crud
from app import services

app = FastAPI(
    title="Weather Dashboard API",
    description="Backend API for Weather Dashboard Internship Project",
    version="1.0.0"
)

# CORS Configuration - Allow localhost and ngrok domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(http|https)://(localhost|127\.0\.0\.1|.*\.ngrok.*\.dev|.*\.ngrok\.io)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint - check if API is running"""
    return {
        "message": "Weather Dashboard Backend is Running 🚀"
    }


@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "version": "1.0.0"
    }


# ============================================================================
# LOCATION ENDPOINTS
# ============================================================================

@app.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    """Get all saved locations from database"""
    return crud.get_locations(db)


@app.get("/search/{query}")
def search_locations(query: str):
    """
    Search for cities, states, and countries

    Args:
        query: Search term (minimum 2 characters)

    Returns:
        {"results": [...]} List of matching locations
    """
    if not query or len(query.strip()) < 2:
        return {"results": []}

    return {"results": services.search_locations(query.strip())}


@app.get("/search-by-weather/{condition}")
def search_by_weather_condition(condition: str):
    """
    Search for cities with specific weather conditions

    Args:
        condition: Weather condition filter
        Options: rainy, snowing, thunderstorm, sunny, foggy, cloudy, windy, hot, cold

    Returns:
        {"results": [...]} List of cities matching the weather condition
    """
    if not condition or len(condition.strip()) < 1:
        return {"results": []}

    condition = condition.lower().strip()

    weather_condition_map = {
        "rainy": ["rain", "drizzle", "light rain", "moderate rain", "heavy rain", "thunderstorm", "shower"],
        "snowing": ["snow", "light snow", "moderate snow", "heavy snow", "blizzard"],
        "thunderstorm": ["thunderstorm", "storm", "lightning", "thundery"],
        "sunny": ["clear", "clear sky", "sunny", "sunny sky", "mainly clear"],
        "foggy": ["fog", "mist", "foggy", "mogy"],
        "cloudy": ["cloudy", "overcast", "partly cloudy", "mostly cloudy", "cloud"],
        "windy": ["windy", "wind", "strong wind", "gale"],
    }

    # Major cities worldwide with coordinates
    major_cities = [
        ("London", 51.5074, -0.1278),
        ("Paris", 48.8566, 2.3522),
        ("Tokyo", 35.6762, 139.6503),
        ("Dubai", 25.2048, 55.2708),
        ("Sydney", -33.8688, 151.2093),
        ("New York", 40.7128, -74.0060),
        ("Los Angeles", 34.0522, -118.2437),
        ("Mumbai", 19.0760, 72.8777),
        ("Beijing", 39.9042, 116.4074),
        ("Moscow", 55.7558, 37.6173),
        ("Delhi", 28.7041, 77.1025),
        ("Bangkok", 13.7563, 100.5018),
        ("Singapore", 1.3521, 103.8198),
        ("Seoul", 37.5665, 126.9780),
        ("Hong Kong", 22.3193, 114.1694),
        ("Toronto", 43.6629, -79.3957),
        ("Vancouver", 49.2827, -123.1207),
        ("Berlin", 52.5200, 13.4050),
        ("Amsterdam", 52.3676, 4.9041),
        ("Rome", 41.9028, 12.4964),
    ]

    matching_results = []

    for city_name, lat, lon in major_cities:
        try:
            weather = services.get_current_weather(lat, lon)
            if weather is None:
                continue

            weather_code = weather.get("current", {}).get("weather_code")
            condition_name = services.get_condition(weather_code).lower()
            temperature = weather.get("current", {}).get("temperature_2m", 0)

            # Check if location matches weather filter
            matches = False
            if condition == "hot" and temperature > 30:
                matches = True
            elif condition == "cold" and temperature < 5:
                matches = True
            elif condition in weather_condition_map:
                keywords = weather_condition_map[condition]
                if any(keyword in condition_name for keyword in keywords):
                    matches = True

            if matches:
                matching_results.append({
                    "id": None,
                    "name": city_name,
                    "region": "",
                    "country": "",
                    "condition": condition_name,
                    "temperature": round(temperature),
                    "latitude": lat,
                    "longitude": lon,
                })
        except Exception:
            continue

    return {"results": matching_results}


@app.post("/locations")
def add_location(
    city_name: str,
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
    """
    Add a new location to the database

    Args:
        city_name: Name of the city
        latitude: City latitude
        longitude: City longitude

    Returns:
        Location object created
    """
    existing = crud.get_location_by_city(db, city_name)

    if existing:
        return {"message": "Location already exists"}

    coords = services.get_coordinates(city_name)

    if coords:
        latitude = coords["latitude"]
        longitude = coords["longitude"]

    location = crud.create_location(
        db,
        city_name,
        latitude,
        longitude
    )

    # Fetch and save historical weather data
    historical_data = services.get_historical_weather(latitude, longitude)
    if historical_data:
        daily_data = historical_data.get("daily", {})
        dates = daily_data.get("time", [])
        temps_max = daily_data.get("temperature_2m_max", [])
        temps_min = daily_data.get("temperature_2m_min", [])
        precipitation = daily_data.get("precipitation_sum", [])
        wind_speed = daily_data.get("wind_speed_10m_max", [])

        for i, date_str in enumerate(dates):
            if not crud.weather_record_exists(db, location.id, date_str):
                crud.save_weather_history(
                    db,
                    location.id,
                    date_str,
                    temps_max[i] if i < len(temps_max) else None,
                    temps_min[i] if i < len(temps_min) else None,
                    precipitation[i] if i < len(precipitation) else None,
                    wind_speed[i] if i < len(wind_speed) else None,
                )

    return location


@app.delete("/locations/{city_name}")
def delete_location(city_name: str, db: Session = Depends(get_db)):
    """
    Delete a location from the database

    Args:
        city_name: Name of the city to delete

    Returns:
        {"message": "Location deleted successfully"} or 404 error
    """
    success = crud.delete_location(db, city_name)

    if success:
        return {"message": f"Location '{city_name}' deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Location '{city_name}' not found")


# ============================================================================
# WEATHER ENDPOINTS
# ============================================================================

@app.get("/weather/{city_name}")
def get_weather(city_name: str, db: Session = Depends(get_db)):
    """
    Get current weather, forecast, and analytics for a city

    Args:
        city_name: Name of the city

    Returns:
        Weather data including current conditions, 7-day forecast, hourly forecast
    """
    location = crud.get_location_by_city(db, city_name)

    if not location:
        coords = services.get_coordinates(city_name)

        if not coords:
            raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")

        location = crud.create_location(
            db,
            city_name,
            coords["latitude"],
            coords["longitude"]
        )

    weather = services.get_current_weather(
        location.latitude,
        location.longitude
    )

    if weather is None:
        raise HTTPException(status_code=503, detail="Unable to fetch weather from API")

    weather_code = weather.get("current", {}).get("weather_code")
    is_day = weather.get("current", {}).get("is_day", 1)

    weather["current"]["condition"] = services.get_condition(weather_code)
    weather["current"]["icon"] = services.get_icon(weather_code)
    weather["current"]["theme_key"] = services.get_theme_key(weather_code, is_day)

    forecast = services.get_forecast(
        location.latitude,
        location.longitude
    )

    weather["forecast"] = forecast.get("forecast", [])
    weather["hourlyForecast"] = forecast.get("hourlyForecast", [])
    weather["sunrise"] = forecast.get("sunrise")
    weather["sunset"] = forecast.get("sunset")

    return weather


@app.get("/weather/coords/{latitude}/{longitude}")
def get_weather_by_coordinates(latitude: float, longitude: float, db: Session = Depends(get_db)):
    """
    Get weather by GPS coordinates

    Args:
        latitude: Location latitude
        longitude: Location longitude

    Returns:
        Weather data including current conditions, forecast, and analytics
    """
    city_name = services.reverse_geocode(latitude, longitude)

    location = crud.get_location_by_city(db, city_name)

    if not location:
        location = crud.create_location(
            db,
            city_name,
            latitude,
            longitude
        )

    weather = services.get_current_weather(latitude, longitude)

    if weather is None:
        return {"message": "Unable to fetch weather"}

    weather_code = weather.get("current", {}).get("weather_code")
    is_day = weather.get("current", {}).get("is_day", 1)

    weather["current"]["condition"] = services.get_condition(weather_code)
    weather["current"]["icon"] = services.get_icon(weather_code)
    weather["current"]["theme_key"] = services.get_theme_key(weather_code, is_day)

    forecast = services.get_forecast(latitude, longitude)

    weather["forecast"] = forecast.get("forecast", [])
    weather["hourlyForecast"] = forecast.get("hourlyForecast", [])
    weather["sunrise"] = forecast.get("sunrise")
    weather["sunset"] = forecast.get("sunset")
    weather["resolvedCityName"] = city_name

    return weather


@app.get("/forecast/{city_name}")
def get_forecast(city_name: str, db: Session = Depends(get_db)):
    """
    Get 7-day forecast and hourly forecast for a city

    Args:
        city_name: Name of the city

    Returns:
        Forecast data with daily and hourly predictions
    """
    location = crud.get_location_by_city(db, city_name)

    if not location:
        coords = services.get_coordinates(city_name)

        if not coords:
            raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")

        location = crud.create_location(
            db,
            city_name,
            coords["latitude"],
            coords["longitude"]
        )

    return services.get_forecast(
        location.latitude,
        location.longitude
    )


# ============================================================================
# AIR QUALITY ENDPOINTS
# ============================================================================

@app.get("/air-quality/{city_name}")
def get_air_quality(city_name: str, db: Session = Depends(get_db)):
    """
    Get air quality data for a city

    Args:
        city_name: Name of the city

    Returns:
        AQI, pollutant levels, and health recommendations
    """
    location = crud.get_location_by_city(db, city_name)

    if not location:
        coords = services.get_coordinates(city_name)

        if not coords:
            raise HTTPException(status_code=404, detail=f"City '{city_name}' not found")

        location = crud.create_location(
            db,
            city_name,
            coords["latitude"],
            coords["longitude"]
        )

    air_quality = services.get_air_quality(
        location.latitude,
        location.longitude
    )

    if air_quality is None:
        raise HTTPException(status_code=503, detail="Unable to fetch air quality from API")

    return air_quality


# ============================================================================
# ALERTS ENDPOINTS
# ============================================================================

@app.get("/alerts/{city_name}")
def get_alerts(city_name: str, db: Session = Depends(get_db)):
    """
    Get weather alerts for a city

    Args:
        city_name: Name of the city

    Returns:
        List of active weather alerts (currently empty - integration needed)
    """
    location = crud.get_location_by_city(db, city_name)

    if not location:
        coords = services.get_coordinates(city_name)

        if not coords:
            return {"message": "City not found"}

        location = crud.create_location(
            db,
            city_name,
            coords["latitude"],
            coords["longitude"]
        )

    alerts = services.get_alerts(
        location.latitude,
        location.longitude
    )

    return {"alerts": alerts}


# ============================================================================
# WEATHER CONDITIONS ENDPOINT
# ============================================================================

@app.get("/weather-conditions")
def get_weather_conditions():
    """Get list of available weather condition filters"""
    conditions = [
        {"id": "clear", "label": "Clear", "emoji": "☀️"},
        {"id": "cloudy", "label": "Cloudy", "emoji": "☁️"},
        {"id": "rainy", "label": "Rainy", "emoji": "🌧️"},
        {"id": "snowy", "label": "Snowy", "emoji": "❄️"},
        {"id": "thunderstorm", "label": "Thunderstorm", "emoji": "⛈️"},
        {"id": "foggy", "label": "Foggy", "emoji": "🌫️"},
        {"id": "windy", "label": "Windy", "emoji": "💨"},
    ]
    return {"conditions": conditions}


# ============================================================================
# WEATHER HISTORY ENDPOINTS
# ============================================================================

@app.get("/weather-history/{city_name}")
def get_weather_history(city_name: str, db: Session = Depends(get_db)):
    """
    Get historical weather data for a city (last 365 days)

    Args:
        city_name: Name of the city

    Returns:
        Historical daily data with statistics
    """
    location = crud.get_location_by_city(db, city_name)

    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{city_name}' not found")

    records = crud.get_weather_history(db, location.id)

    if not records:
        return {
            "city": city_name,
            "message": "No historical data available",
            "data": []
        }

    temps_max = [float(r.temperature_max) for r in records if r.temperature_max]
    temps_min = [float(r.temperature_min) for r in records if r.temperature_min]

    return {
        "city": city_name,
        "data": [
            {
                "date": str(r.weather_date),
                "temp_max": float(r.temperature_max) if r.temperature_max else None,
                "temp_min": float(r.temperature_min) if r.temperature_min else None,
                "precipitation": float(r.precipitation) if r.precipitation else None,
                "wind_speed": float(r.wind_speed) if r.wind_speed else None,
            }
            for r in records
        ],
        "statistics": {
            "highest_temperature": max(temps_max) if temps_max else None,
            "lowest_temperature": min(temps_min) if temps_min else None,
            "average_temperature": round(sum(temps_max) / len(temps_max), 2) if temps_max else None,
            "total_records": len(records),
        }
    }
