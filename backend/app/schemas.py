from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# ============================================================================
# Existing Location Schemas (Keep for backward compatibility)
# ============================================================================

class LocationCreate(BaseModel):
    city_name: str


class LocationResponse(BaseModel):
    id: int
    city_name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


# ============================================================================
# Weather Context Schema - Unified structure for AI processing
# ============================================================================

class CurrentWeatherData(BaseModel):
    """Current weather observations"""
    temperature_2m: Optional[float] = None
    apparent_temperature: Optional[float] = None
    relative_humidity_2m: Optional[int] = None
    wind_speed_10m: Optional[float] = None
    wind_direction_10m: Optional[int] = None
    wind_gusts_10m: Optional[float] = None
    pressure_msl: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[float] = None
    weather_code: Optional[int] = None
    is_day: Optional[int] = None
    condition: Optional[str] = None
    icon: Optional[str] = None


class HourlyForecastData(BaseModel):
    """Hourly forecast for next 24 hours"""
    label: Optional[str] = None
    temp: Optional[int] = None
    icon: Optional[str] = None
    precipitation_probability: Optional[int] = None
    wind_speed: Optional[int] = None
    weather_code: Optional[int] = None


class DailyForecastData(BaseModel):
    """Daily forecast for 7 days"""
    label: Optional[str] = None
    temp_max: Optional[int] = None
    temp_min: Optional[int] = None
    icon: Optional[str] = None
    weather_code: Optional[int] = None


class AirQualityData(BaseModel):
    """Air quality metrics"""
    aqi: Optional[int] = None
    category: Optional[str] = None
    recommendation: Optional[str] = None
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None
    co: Optional[float] = None
    so2: Optional[float] = None
    uv_index: Optional[float] = None


class WeatherAlertData(BaseModel):
    """Weather alert information"""
    id: Optional[str] = None
    title: Optional[str] = None
    severity: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    description: Optional[str] = None


class WeatherHistoryData(BaseModel):
    """Historical weather data (optional)"""
    date: Optional[str] = None
    temp_max: Optional[float] = None
    temp_min: Optional[float] = None
    precipitation: Optional[float] = None
    wind_speed: Optional[float] = None


class LocationData(BaseModel):
    """Location and geographic information"""
    city: str
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None


class SunData(BaseModel):
    """Sunrise and sunset information"""
    sunrise: Optional[str] = None
    sunset: Optional[str] = None


class UnitsData(BaseModel):
    """Unit information for measurements"""
    temperature: Optional[str] = "celsius"
    wind_speed: Optional[str] = "kmh"
    distance: Optional[str] = "km"
    pressure: Optional[str] = "hPa"


class WeatherContext(BaseModel):
    """
    Unified Weather Context object for AI processing.

    This is the single source of truth for all weather-related data passed to the AI.
    All fields are optional to support partial data updates.
    """

    # Location information
    location: LocationData

    # Current conditions
    current_weather: Optional[CurrentWeatherData] = None

    # Forecasts
    hourly_forecast: Optional[List[HourlyForecastData]] = None
    daily_forecast: Optional[List[DailyForecastData]] = None

    # Environmental data
    air_quality: Optional[AirQualityData] = None
    weather_alerts: Optional[List[WeatherAlertData]] = None
    weather_history: Optional[List[WeatherHistoryData]] = None

    # Sun data
    sun_data: Optional[SunData] = None

    # Units
    units: Optional[UnitsData] = None

    # Additional metadata
    last_updated: Optional[str] = None
    user_preferences: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic config"""
        schema_extra = {
            "example": {
                "location": {
                    "city": "San Francisco",
                    "country": "United States",
                    "latitude": 37.7749,
                    "longitude": -122.4194,
                    "timezone": "America/Los_Angeles"
                },
                "current_weather": {
                    "temperature_2m": 18,
                    "relative_humidity_2m": 75,
                    "weather_code": 3
                },
                "hourly_forecast": [
                    {
                        "label": "2024-01-15T00:00",
                        "temp": 16,
                        "icon": "cloudy"
                    }
                ],
                "daily_forecast": [
                    {
                        "label": "2024-01-15",
                        "temp_max": 22,
                        "temp_min": 14,
                        "icon": "cloudy"
                    }
                ],
                "air_quality": {
                    "aqi": 45,
                    "category": "Good"
                },
                "sun_data": {
                    "sunrise": "2024-01-15T07:30:00",
                    "sunset": "2024-01-15T17:15:00"
                },
                "units": {
                    "temperature": "celsius",
                    "wind_speed": "kmh"
                }
            }
        }


# ============================================================================
# AI Chat Request/Response Schemas
# ============================================================================

class AIChatRequest(BaseModel):
    """
    Request model for AI chat endpoint.
    Accepts unified WeatherContext object.
    """

    user_question: str
    weather_context: WeatherContext

    class Config:
        schema_extra = {
            "example": {
                "user_question": "Will it rain tomorrow?",
                "weather_context": {
                    "location": {
                        "city": "San Francisco"
                    },
                    "current_weather": {
                        "temperature_2m": 18
                    }
                }
            }
        }


class AIChatResponse(BaseModel):
    """Response model for AI chat endpoint"""

    success: bool
    message: str
    received_context: Optional[Dict[str, Any]] = None
    ai_response: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# Backward Compatibility Schemas (Legacy Support)
# ============================================================================

class LegacyWeatherContextRequest(BaseModel):
    """
    Legacy request format for backward compatibility.
    Used during transition period - will be deprecated.
    """

    user_question: str
    city: str
    current_weather: Optional[dict] = None
    forecast: Optional[List[dict]] = None
    hourly_forecast: Optional[List[dict]] = None
    air_quality: Optional[dict] = None
    alerts: Optional[List[dict]] = None

    class Config:
        schema_extra = {
            "example": {
                "user_question": "Will it rain tomorrow?",
                "city": "San Francisco",
                "current_weather": {"temperature_2m": 18},
                "forecast": [],
                "hourly_forecast": [],
                "air_quality": None,
                "alerts": []
            }
        }


# ============================================================================
# Enhanced AI Chat Schemas with Response Modes and Conversation Support
# ============================================================================

class ConversationMessage(BaseModel):
    """Represents a message in conversation history"""

    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class EnhancedAIChatRequest(BaseModel):
    """
    Enhanced AI chat request with response modes and conversation support.
    Supports both new unified format and legacy format.
    """

    user_question: str
    weather_context: Optional[WeatherContext] = None

    # Response mode: "quick", "detailed", or "expert"
    response_mode: Optional[str] = "detailed"

    # Conversation support
    conversation_id: Optional[str] = None
    previous_messages: Optional[List[ConversationMessage]] = None

    # Optional metadata
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "user_question": "Will it rain tomorrow?",
                "weather_context": {
                    "location": {"city": "San Francisco"},
                    "current_weather": {"temperature_2m": 18}
                },
                "response_mode": "detailed",
                "conversation_id": "conv_12345",
                "previous_messages": [
                    {
                        "role": "user",
                        "content": "How's the weather?"
                    },
                    {
                        "role": "assistant",
                        "content": "It's overcast..."
                    }
                ]
            }
        }


class EnhancedAIChatResponse(BaseModel):
    """
    Enhanced AI chat response with conversation support.
    """

    success: bool
    message: str
    ai_response: Optional[str] = None
    error: Optional[str] = None

    # Conversation support
    conversation_id: Optional[str] = None
    message_count: Optional[int] = None

    # Response metadata
    response_mode: Optional[str] = None
    received_context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Response generated successfully",
                "ai_response": "Based on the forecast...",
                "conversation_id": "conv_12345",
                "message_count": 2,
                "response_mode": "detailed"
            }
        }