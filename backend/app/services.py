import requests


def get_coordinates(city_name: str):
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


def get_location_type(result):
    name = result.get("name", "")
    admin1 = result.get("admin1", "")
    country = result.get("country", "")

    if not admin1 and not country:
        return "unknown"

    if admin1 and name != admin1:
        return "city"
    elif admin1 and name == admin1:
        return "state"
    elif country and not admin1:
        return "country"
    else:
        return "city"


def search_locations(query: str):
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
            "type": get_location_type(result),
        }
        for result in results
    ]


def search_locations_by_category(query: str, category: str):
    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={query}&count=15&language=en&format=json"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return []

    data = response.json()
    results = data.get("results") or []

    filtered = []
    for result in results:
        location_type = get_location_type(result)
        if location_type == category:
            filtered.append({
                "id": result.get("id"),
                "name": result.get("name"),
                "region": result.get("admin1"),
                "country": result.get("country"),
                "latitude": result.get("latitude"),
                "longitude": result.get("longitude"),
                "type": location_type,
            })

    return filtered[:8]


def get_current_weather(latitude: float, longitude: float):
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


def get_icon(weather_code):
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
    return WEATHER_CODE_CONDITIONS.get(weather_code, "Unknown")


def get_theme_key(weather_code, is_day=1):
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


def get_forecast(latitude: float, longitude: float):
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

    for i, day in enumerate(data["daily"]["time"]):
        code = data["daily"]["weather_code"][i]

        forecast.append({
            "label": day,
            "tempMax": round(data["daily"]["temperature_2m_max"][i]),
            "tempMin": round(data["daily"]["temperature_2m_min"][i]),
            "icon": get_icon(code)
        })

    hourly = []

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


def get_aqi_category(aqi):
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


def matches_weather_condition(weather_code: int, temperature: float, condition_filter: str):
    condition_lower = condition_filter.lower()

    weather_condition_map = {
        "sunny": [0, 1],
        "partly_cloudy": [2],
        "cloudy": [3],
        "rainy": [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
        "thunderstorm": [95, 96, 99],
        "snowy": [71, 73, 75, 77, 85, 86],
        "foggy": [45, 48],
        "windy": [],
        "hot": [],
        "cold": [],
    }

    if condition_lower == "hot":
        return temperature > 30
    elif condition_lower == "cold":
        return temperature < 5
    elif condition_lower in weather_condition_map:
        return weather_code in weather_condition_map[condition_lower]

    return False


def get_country_flag(country_code: str):
    if not country_code or len(country_code) != 2:
        return ""
    return "".join(chr(127397 + ord(c)) for c in country_code.upper())


def search_locations_by_weather(condition_filter: str, category: str = "city", limit: int = 20):
    major_cities = [
        ("Tokyo", "Japan", 35.6762, 139.6503),
        ("London", "United Kingdom", 51.5074, -0.1278),
        ("Paris", "France", 48.8566, 2.3522),
        ("New York", "United States", 40.7128, -74.0060),
        ("Los Angeles", "United States", 34.0522, -118.2437),
        ("Dubai", "United Arab Emirates", 25.2048, 55.2708),
        ("Singapore", "Singapore", 1.3521, 103.8198),
        ("Hong Kong", "Hong Kong", 22.3193, 114.1694),
        ("Mumbai", "India", 19.0760, 72.8777),
        ("Sydney", "Australia", -33.8688, 151.2093),
        ("Moscow", "Russia", 55.7558, 37.6173),
        ("Istanbul", "Turkey", 41.0082, 28.9784),
        ("Rio de Janeiro", "Brazil", -22.9068, -43.1729),
        ("Mexico City", "Mexico", 19.4326, -99.1332),
        ("Bangkok", "Thailand", 13.7563, 100.5018),
        ("Toronto", "Canada", 43.6629, -79.3957),
        ("Cairo", "Egypt", 30.0444, 31.2357),
        ("Beijing", "China", 39.9042, 116.4074),
        ("Shanghai", "China", 31.2304, 121.4737),
        ("Seoul", "South Korea", 37.5665, 126.9780),
        ("Berlin", "Germany", 52.5200, 13.4050),
        ("Madrid", "Spain", 40.4168, -3.7038),
        ("Rome", "Italy", 41.9028, 12.4964),
        ("Amsterdam", "Netherlands", 52.3676, 4.9041),
        ("Vienna", "Austria", 48.2082, 16.3738),
        ("Prague", "Czech Republic", 50.0755, 14.4378),
        ("Warsaw", "Poland", 52.2297, 21.0122),
        ("Athens", "Greece", 37.9838, 23.7275),
        ("Lisbon", "Portugal", 38.7223, -9.1393),
        ("Stockholm", "Sweden", 59.3293, 18.0686),
    ]

    matching_results = []

    for city_name, country, lat, lon in major_cities:
        try:
            weather = get_current_weather(lat, lon)
            if weather is None:
                continue

            weather_code = weather.get("current", {}).get("weather_code")
            temperature = weather.get("current", {}).get("temperature_2m", 0)

            if matches_weather_condition(weather_code, temperature, condition_filter):
                condition_name = get_condition(weather_code)
                matching_results.append({
                    "id": None,
                    "name": city_name,
                    "region": "",
                    "country": country,
                    "condition": condition_name,
                    "temperature": round(temperature),
                    "latitude": lat,
                    "longitude": lon,
                    "type": category,
                })
        except Exception:
            continue

    return matching_results[:limit]


def get_air_quality(latitude: float, longitude: float):
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


def get_alerts(latitude: float, longitude: float):
    """
    Returns official weather alerts for the given coordinates.

    No alert provider is connected yet — Open-Meteo's free forecast API does
    not include official government alerts. This always returns an empty
    list today, but the response shape is the real contract the frontend
    consumes, so wiring in a provider later (e.g. NWS for US coordinates, or
    a paid global provider) only requires filling in this function — no
    frontend changes.

    Each alert, once populated, must have this shape:
    {
        "id": str,
        "title": str,
        "severity": "Minor" | "Moderate" | "Severe" | "Extreme",
        "start": str (ISO 8601),
        "end": str (ISO 8601),
        "description": str,
    }
    """
    return []


def get_historical_weather(latitude: float, longitude: float, days: int = 365):
    from datetime import datetime, timedelta

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