from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, get_db
from app import crud
from app import services
from app import ai_routes

app = FastAPI(
    title="Weather Dashboard API",
    description="Backend API for Weather Dashboard Internship Project",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(http|https)://(localhost|127\.0\.0\.1|.*\.ngrok.*\.dev|.*\.ngrok\.io)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Register AI routes
app.include_router(ai_routes.router)


@app.get("/")
def root():
    return {
        "message": "Weather Dashboard Backend is Running 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "version": "1.0.0"
    }


@app.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    return crud.get_locations(db)


@app.get("/search/{query}")
def search_locations(query: str):
    if not query or len(query.strip()) < 2:
        return {"results": []}

    return {"results": services.search_locations(query.strip())}


@app.get("/search/cities/{query}")
def search_cities(query: str):
    if not query or len(query.strip()) < 2:
        return {"results": []}

    return {"results": services.search_locations_by_category(query.strip(), "city")}


@app.get("/search/states/{query}")
def search_states(query: str):
    if not query or len(query.strip()) < 2:
        return {"results": []}

    return {"results": services.search_locations_by_category(query.strip(), "state")}


@app.get("/search/countries/{query}")
def search_countries(query: str):
    if not query or len(query.strip()) < 2:
        return {"results": []}

    return {"results": services.search_locations_by_category(query.strip(), "country")}


@app.get("/weather-results/{condition}")
def get_weather_results(condition: str, category: str = "city"):
    if not condition or len(condition.strip()) < 1:
        return {"results": []}

    return {"results": services.search_locations_by_weather(condition.strip(), category)}


@app.get("/weather-conditions")
def get_weather_conditions():
    """Return available weather condition options"""
    conditions = [
        {"id": "all", "label": "All Weather", "emoji": "🌍"},
        {"id": "sunny", "label": "Sunny / Clear", "emoji": "☀️"},
        {"id": "partly_cloudy", "label": "Partly Cloudy", "emoji": "⛅"},
        {"id": "cloudy", "label": "Cloudy", "emoji": "☁️"},
        {"id": "rainy", "label": "Rainy", "emoji": "🌧️"},
        {"id": "thunderstorm", "label": "Thunderstorm", "emoji": "⛈️"},
        {"id": "snowy", "label": "Snowy", "emoji": "❄️"},
        {"id": "foggy", "label": "Foggy", "emoji": "🌫️"},
        {"id": "windy", "label": "Windy", "emoji": "💨"},
        {"id": "hot", "label": "Hot", "emoji": "🔥"},
        {"id": "cold", "label": "Cold", "emoji": "🧊"},
    ]
    return {"conditions": conditions}


@app.get("/weather/coords/{latitude}/{longitude}")
def get_weather_by_coordinates(latitude: float, longitude: float, db: Session = Depends(get_db)):

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


@app.get("/weather/{city_name}")
def get_weather(city_name: str, db: Session = Depends(get_db)):

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


@app.get("/forecast/{city_name}")
def get_forecast(city_name: str, db: Session = Depends(get_db)):

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


@app.get("/air-quality/{city_name}")
def get_air_quality(city_name: str, db: Session = Depends(get_db)):

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


@app.get("/alerts/{city_name}")
def get_alerts(city_name: str, db: Session = Depends(get_db)):

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


@app.get("/weather-history/{city_name}")
def get_weather_history(city_name: str, db: Session = Depends(get_db)):
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


@app.post("/locations")
def add_location(
    city_name: str,
    latitude: float,
    longitude: float,
    db: Session = Depends(get_db)
):
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
    success = crud.delete_location(db, city_name)

    if success:
        return {"message": f"Location '{city_name}' deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Location '{city_name}' not found")