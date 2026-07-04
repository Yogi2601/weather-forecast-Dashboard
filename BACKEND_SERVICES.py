# File: backend/app/services.py
# Weather Services - External API Integration

import requests
from datetime import datetime, timedelta


# ============================================================================
# GEOCODING SERVICES
# ============================================================================

def get_coordinates(city_name: str):
    """
    Convert city name to latitude and longitude using Open-Meteo Geocoding API

    Args:
        city_name (str): Name of the city

    Returns:
        dict: {"latitude": float, "longitude": float} or None if not found
    """
    url = (
        f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    if "results" not in data:
        return None

    city = data["results"][0]

    return {
        "latitude": city["latitude"],
        "longitude": city["longitude"],
    }


def reverse_geocode(latitude: float, longitude: float):
    """
    Convert coordinates to city name using OpenStreetMap Nominatim API

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude

    Returns:
        str: City name or "Current Location" if not found
    """
    url = (
        "https://nominatim.openstreetmap.org/reverse"
        f"?lat={latitude}&lon={longitude}&format=json&zoom=10"
    )

    try:
        response = requests.get(url, headers={"User-Agent": "weather-dashboard-app"})
    except requests.RequestException:
        return "Current Location"

    if response.status_code != 200:
        return "Current Location"

    data = response.json()
    address = data.get("address", {})

    name = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("county")
        or data.get("name")
    )

    return name or "Current Location"


def search_locations(query: str):
    """
    Search for cities, states, and countries using Open-Meteo Geocoding API

    Args:
        query (str): Search query (e.g., "London", "New York")

    Returns:
        list: List of location objects with id, name, region, country, latitude, longitude
    """
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={query}&count=8&language=en&format=json"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return []

    data = response.json()
    results = data.get("results") or []

    return [
        {
            "id": result.get("id"),
            "name": result.get("name"),
            "region": result.get("admin1"),
            "country": result.get("country"),
            "latitude": result.get("latitude"),
            "longitude": result.get("longitude"),
        }
        for result in results
    ]


# ============================================================================
# WEATHER DATA SERVICES
# ============================================================================

def get_current_weather(latitude: float, longitude: float):
    """
    Get current weather data for given coordinates

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude

    Returns:
        dict: JSON response from Open-Meteo API or None if failed
    """
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&current="
        "temperature_2m,"
        "apparent_temperature,"
        "relative_humidity_2m,"
        "wind_speed_10m,"
        "wind_direction_10m,"
        "wind_gusts_10m,"
        "pressure_msl,"
        "visibility,"
        "uv_index,"
        "weather_code,"
        "is_day"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return None

    return response.json()


def get_forecast(latitude: float, longitude: float):
    """
    Get 7-day forecast and hourly forecast for given coordinates

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude

    Returns:
        dict: {
            "forecast": List of daily forecasts,
            "hourlyForecast": List of hourly forecasts (next 24 hours),
            "sunrise": ISO 8601 timestamp,
            "sunset": ISO 8601 timestamp
        }
    """
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset"
        "&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m"
        "&forecast_days=7"
        "&timezone=auto"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return {
            "forecast": [],
            "hourlyForecast": [],
            "sunrise": None,
            "sunset": None,
        }

    data = response.json()

    forecast = []

    # Process daily forecast
    for i, day in enumerate(data["daily"]["time"]):
        code = data["daily"]["weather_code"][i]

        forecast.append({
            "label": day,
            "tempMax": round(data["daily"]["temperature_2m_max"][i]),
            "tempMin": round(data["daily"]["temperature_2m_min"][i]),
            "icon": get_icon(code)
        })

    hourly = []

    # Process hourly forecast (first 24 hours)
    for i in range(min(24, len(data["hourly"]["time"]))):
        code = data["hourly"]["weather_code"][i]

        hourly.append({
            "label": data["hourly"]["time"][i],
            "temp": round(data["hourly"]["temperature_2m"][i]),
            "icon": get_icon(code),
            "precipitationProbability": data["hourly"]["precipitation_probability"][i],
            "windSpeed": round(data["hourly"]["wind_speed_10m"][i]),
        })

    return {
        "forecast": forecast,
        "hourlyForecast": hourly,
        "sunrise": data["daily"]["sunrise"][0] if data["daily"]["sunrise"] else None,
        "sunset": data["daily"]["sunset"][0] if data["daily"]["sunset"] else None,
    }


def get_historical_weather(latitude: float, longitude: float, days: int = 365):
    """
    Get historical weather data for the past N days

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude
        days (int): Number of days to fetch (default: 365)

    Returns:
        dict: JSON response from Open-Meteo Archive API or None if failed
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)

    url = (
        "https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        f"&start_date={start_date}"
        f"&end_date={end_date}"
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
        "&timezone=auto"
    )

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None

        return response.json()
    except requests.RequestException:
        return None


# ============================================================================
# WEATHER CODE INTERPRETATION
# ============================================================================

def get_icon(weather_code):
    """
    Map WMO weather code to icon name

    Args:
        weather_code (int): WMO weather code

    Returns:
        str: Icon name (sunny, cloudy, rainy, snowy, stormy)
    """
    if weather_code == 0:
        return "sunny"
    elif weather_code in [1, 2, 3]:
        return "cloudy"
    elif weather_code in [51, 53, 55, 61, 63, 65]:
        return "rainy"
    elif weather_code in [71, 73, 75]:
        return "snowy"
    elif weather_code >= 95:
        return "stormy"

    return "cloudy"


# Weather code to condition description mapping
WEATHER_CODE_CONDITIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
}


def get_condition(weather_code):
    """
    Get human-readable weather condition from WMO code

    Args:
        weather_code (int): WMO weather code

    Returns:
        str: Weather condition description
    """
    return WEATHER_CODE_CONDITIONS.get(weather_code, "Unknown")


def get_theme_key(weather_code, is_day=1):
    """
    Determine the UI theme based on weather and time of day

    Args:
        weather_code (int): WMO weather code
        is_day (int): 1 for day, 0 for night

    Returns:
        str: Theme key (storm, snow, heavy-rain, rain, fog, cloudy, night, clear)
    """
    if weather_code in (95, 96, 99):
        return "storm"
    if weather_code in (71, 73, 75, 77, 85, 86):
        return "snow"
    if weather_code in (65, 82, 67):
        return "heavy-rain"
    if weather_code in (51, 53, 55, 56, 57, 61, 63, 66, 80, 81):
        return "rain"
    if weather_code in (45, 48):
        return "fog"
    if weather_code in (2, 3):
        return "cloudy"
    if not is_day:
        return "night"
    return "clear"


# ============================================================================
# AIR QUALITY SERVICES
# ============================================================================

def get_aqi_category(aqi):
    """
    Get air quality category from AQI value

    Args:
        aqi (int): Air Quality Index value

    Returns:
        str: AQI category (Good, Fair, Moderate, Poor, Very Poor)
    """
    if aqi is None:
        return "Unknown"
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Fair"
    if aqi <= 150:
        return "Moderate"
    if aqi <= 200:
        return "Poor"
    return "Very Poor"


def get_aqi_recommendation(aqi):
    """
    Get health recommendation based on AQI value

    Args:
        aqi (int): Air Quality Index value

    Returns:
        str: Health recommendation
    """
    if aqi is None:
        return "Air quality data is unavailable right now."
    if aqi <= 50:
        return "Air quality is good. Enjoy outdoor activities as usual."
    if aqi <= 100:
        return "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion."
    if aqi <= 150:
        return "Sensitive groups (children, elderly, respiratory conditions) should reduce prolonged outdoor exertion."
    if aqi <= 200:
        return "Everyone may begin to experience health effects. Limit prolonged outdoor exertion."
    return "Health warning: avoid outdoor exertion. Stay indoors with windows closed if possible."


def get_air_quality(latitude: float, longitude: float):
    """
    Get air quality data for given coordinates

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude

    Returns:
        dict: Air quality data with AQI, pollutants, and recommendations or None if failed
    """
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&current="
        "us_aqi,"
        "pm2_5,"
        "pm10,"
        "ozone,"
        "nitrogen_dioxide,"
        "carbon_monoxide,"
        "sulphur_dioxide,"
        "uv_index"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()
    current = data.get("current", {})

    aqi = current.get("us_aqi")

    return {
        "aqi": aqi,
        "category": get_aqi_category(aqi),
        "recommendation": get_aqi_recommendation(aqi),
        "pm2_5": current.get("pm2_5"),
        "pm10": current.get("pm10"),
        "o3": current.get("ozone"),
        "no2": current.get("nitrogen_dioxide"),
        "co": current.get("carbon_monoxide"),
        "so2": current.get("sulphur_dioxide"),
        "uvIndex": current.get("uv_index"),
    }


# ============================================================================
# ALERT SERVICES
# ============================================================================

def get_alerts(latitude: float, longitude: float):
    """
    Get weather alerts for given coordinates

    Note: Currently returns empty list. Requires integration with alert provider
    (e.g., NWS for US, or a paid global provider).

    The response shape is the contract the frontend consumes, so integration
    only requires filling in this function with real data.

    Args:
        latitude (float): Location latitude
        longitude (float): Location longitude

    Returns:
        list: List of alert objects or empty list if none
    """
    # TODO: Integrate with weather alert provider
    # Each alert should have this shape:
    # {
    #     "id": str,
    #     "title": str,
    #     "severity": "Minor" | "Moderate" | "Severe" | "Extreme",
    #     "start": str (ISO 8601),
    #     "end": str (ISO 8601),
    #     "description": str,
    # }
    return []
