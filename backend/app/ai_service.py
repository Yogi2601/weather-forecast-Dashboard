"""
AI Service Layer
Handles all AI-related business logic and integrations with Google Gemini.

Features:
- System prompts for weather expert behavior
- Response mode support (quick, detailed, expert)
- Conversation memory management
- Weather context validation
- Gemini API integration with error handling and timeouts
"""

import logging
import json
from typing import Dict, Any, Optional, List
from datetime import datetime

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-genai SDK not installed. Install with: pip install google-genai")

from app.schemas import (
    WeatherContext,
    LegacyWeatherContextRequest,
    LocationData,
    CurrentWeatherData,
    HourlyForecastData,
    DailyForecastData,
    AirQualityData,
    WeatherAlertData,
    SunData,
    UnitsData,
    ConversationMessage,
)
from app.ai_prompts import get_system_prompt, validate_response_mode, get_mode_config
from app.conversation_memory import conversation_memory, MessageData
from app.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT
from app.weather_insights import generate_weather_insights, format_insights_for_prompt
from app.weather_recommendations import generate_weather_recommendations, format_recommendations_for_prompt
from app.weather_followups import generate_followup_suggestions, format_followups_for_prompt
from app.weather_context_resolver import context_resolver

# Setup logging
logger = logging.getLogger(__name__)

# Initialize Gemini client if API key is available
gemini_client = None
logger.info(f"GEMINI_AVAILABLE: {GEMINI_AVAILABLE}")
logger.info(f"GEMINI_API_KEY set: {bool(GEMINI_API_KEY)}")
logger.info(f"GEMINI_MODEL: {GEMINI_MODEL}")

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info(f"[SUCCESS] Gemini API configured with model: {GEMINI_MODEL}")
        logger.info(f"[SUCCESS] Gemini client initialized: {gemini_client is not None}")
    except Exception as e:
        logger.error(f"[FAILED] Failed to initialize Gemini client: {str(e)}")
        GEMINI_AVAILABLE = False
        gemini_client = None
else:
    if not GEMINI_AVAILABLE:
        logger.warning("[INIT] google-genai SDK not installed")
    if not GEMINI_API_KEY:
        logger.warning("[INIT] GEMINI_API_KEY not set in environment")


# ============================================================================
# Helper Functions for Gemini Integration
# ============================================================================

def format_weather_context_for_gemini(context: WeatherContext) -> str:
    """
    Format WeatherContext into a readable string for Gemini.

    Args:
        context (WeatherContext): Weather context object

    Returns:
        str: Formatted weather context string
    """

    lines = [
        f"Location: {context.location.city}, {context.location.country or 'Unknown'}",
        f"Timezone: {context.location.timezone or 'Not specified'}",
        f"Latitude: {context.location.latitude}, Longitude: {context.location.longitude}",
    ]

    if context.current_weather:
        lines.append("\n### Current Weather:")
        cw = context.current_weather
        lines.append(f"Temperature: {cw.temperature_2m}°C (feels like {cw.apparent_temperature}°C)")
        lines.append(f"Condition: {cw.condition} ({cw.icon})")
        lines.append(f"Humidity: {cw.relative_humidity_2m}%")
        lines.append(f"Wind: {cw.wind_speed_10m} km/h from {cw.wind_direction_10m}°")
        lines.append(f"Wind Gusts: {cw.wind_gusts_10m} km/h")
        lines.append(f"Pressure: {cw.pressure_msl} hPa")
        lines.append(f"Visibility: {cw.visibility} km")
        lines.append(f"UV Index: {cw.uv_index}")
        lines.append(f"Is Daytime: {'Yes' if cw.is_day else 'No'}")

    if context.hourly_forecast:
        lines.append("\n### Hourly Forecast (Next 24 Hours):")
        for i, hour in enumerate(context.hourly_forecast[:6]):  # Show first 6 hours
            lines.append(
                f"  {hour.label}: {hour.temp}°C, {hour.icon}, "
                f"Precipitation: {hour.precipitation_probability}%, "
                f"Wind: {hour.wind_speed} km/h"
            )

    if context.daily_forecast:
        lines.append("\n### 7-Day Forecast:")
        for day in context.daily_forecast:
            lines.append(f"  {day.label}: {day.temp_max}°C / {day.temp_min}°C, {day.icon}")

    if context.air_quality:
        lines.append("\n### Air Quality:")
        aq = context.air_quality
        lines.append(f"AQI: {aq.aqi} ({aq.category})")
        lines.append(f"PM2.5: {aq.pm2_5} µg/m³")
        lines.append(f"PM10: {aq.pm10} µg/m³")
        lines.append(f"Recommendation: {aq.recommendation}")

    if context.sun_data:
        lines.append("\n### Sun Data:")
        lines.append(f"Sunrise: {context.sun_data.sunrise}")
        lines.append(f"Sunset: {context.sun_data.sunset}")

    if context.weather_alerts:
        lines.append("\n### Weather Alerts:")
        for alert in context.weather_alerts:
            lines.append(f"  [{alert.severity}] {alert.title}: {alert.description}")

    return "\n".join(lines)


def format_conversation_for_gemini(messages: List[MessageData]) -> List[Dict[str, Any]]:
    """
    Format conversation history for Gemini API (google-genai SDK).

    Args:
        messages (List[MessageData]): Messages from conversation memory

    Returns:
        List[Dict]: Formatted messages for Gemini
    """

    formatted = []
    for msg in messages:
        # google-genai SDK uses simple role/content format
        formatted.append({
            "role": "user" if msg.role == "user" else "model",
            "content": msg.content
        })

    return formatted


def is_greeting_only(question: str) -> bool:
    """
    Check if the user is just greeting (not asking a weather question).

    Args:
        question (str): User's message

    Returns:
        bool: True if it's just a greeting
    """
    greetings = {"hello", "hi", "hey", "good morning", "good evening", "good afternoon", "greetings"}
    return question.strip().lower() in greetings


def cleanup_gemini_response(text: str) -> str:
    """
    Clean up the Gemini response by removing excessive blank lines and duplicates.

    Args:
        text (str): Raw response from Gemini

    Returns:
        str: Cleaned response
    """
    if not text:
        return text

    lines = text.split('\n')
    cleaned = []
    prev_blank = False

    for line in lines:
        is_blank = not line.strip()

        # Skip multiple consecutive blank lines
        if is_blank and prev_blank:
            continue

        cleaned.append(line)
        prev_blank = is_blank

    result = '\n'.join(cleaned).strip()
    return result


def call_gemini_api(
    system_prompt: str,
    user_question: str,
    weather_context_str: str,
    weather_insights_str: str,
    weather_recommendations_str: str,
    weather_followups_str: str,
    conversation_history: List[Dict[str, Any]],
    response_mode: str
) -> Optional[str]:
    """
    Call Gemini API with full context using google-genai SDK.

    Args:
        system_prompt (str): System prompt for weather expert behavior
        user_question (str): User's question
        weather_context_str (str): Formatted weather context
        weather_insights_str (str): Generated weather insights
        weather_recommendations_str (str): Generated weather recommendations
        weather_followups_str (str): Generated follow-up suggestions
        conversation_history (List[Dict]): Conversation history
        response_mode (str): Response mode (quick, detailed, expert)

    Returns:
        Optional[str]: AI response or None if error occurs
    """

    if not GEMINI_AVAILABLE or not gemini_client:
        logger.error("Gemini not available: SDK not installed or client not initialized")
        return None

    try:
        # Build the complete prompt with all context layers
        prompt_parts = [system_prompt, "Weather Context:", weather_context_str]

        if weather_insights_str:
            prompt_parts.append(weather_insights_str)

        if weather_recommendations_str:
            prompt_parts.append(weather_recommendations_str)

        if weather_followups_str:
            prompt_parts.append(weather_followups_str)

        prompt_parts.extend(["User Question:", user_question])

        complete_prompt = "\n\n".join(prompt_parts)

        # Set generation config based on response mode with optimal parameters
        mode_config = get_mode_config(response_mode)
        generation_config = {
            "max_output_tokens": mode_config.get("max_length", 2000),
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
        }

        # Call Gemini API
        logger.info(f"Calling Gemini API with model {GEMINI_MODEL}, mode: {response_mode}")

        try:
            logger.debug(f"Gemini request config: {generation_config}")

            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=complete_prompt,
                config=generation_config
            )

            logger.debug(f"Gemini response object: {response}")
            logger.debug(f"Gemini response type: {type(response)}")

            # Extract and clean response text
            if response and hasattr(response, 'text') and response.text:
                cleaned_response = cleanup_gemini_response(response.text)
                logger.info("Gemini API call successful")
                return cleaned_response
            else:
                logger.warning(f"Gemini returned empty or invalid response")
                logger.warning(f"Response object: {response}")
                if hasattr(response, 'candidates'):
                    logger.warning(f"Response candidates: {response.candidates}")
                if hasattr(response, 'content'):
                    logger.warning(f"Response content: {response.content}")
                return None

        except TimeoutError as e:
            logger.error(f"Gemini API timeout after {GEMINI_TIMEOUT}s: {str(e)}", exc_info=True)
            return None
        except Exception as e:
            logger.error(f"Gemini API call error: {type(e).__name__}: {str(e)}", exc_info=True)
            return None

    except Exception as e:
        logger.error(f"Gemini API outer error: {str(e)}", exc_info=True)
        return None


def analyze_weather_with_ai(
    user_question: str,
    context: WeatherContext,
    response_mode: str = "detailed",
    conversation_id: Optional[str] = None,
    previous_messages: Optional[List[ConversationMessage]] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyzes weather data and answers user questions using AI.

    Features:
    - Professional weather expert system prompt
    - Multiple response modes (quick, detailed, expert)
    - Conversation memory support
    - Context-only responses (never invents data)

    Args:
        user_question (str): The user's weather-related question
        context (WeatherContext): Unified weather context containing all relevant data
        response_mode (str): One of "quick", "detailed", or "expert"
        conversation_id (str, optional): Conversation identifier for memory
        previous_messages (List[ConversationMessage], optional): Previous messages in conversation
        user_id (str, optional): User identifier

    Returns:
        dict: AI response with success status, message, and metadata
    """

    # Validate input
    if not user_question or not user_question.strip():
        response_data = {
            "success": False,
            "message": "Please ask me a weather-related question.",
            "error": "Empty question",
        }
        # Still store in conversation if ID provided
        if conversation_id:
            conversation = conversation_memory.get_conversation(conversation_id)
            if not conversation:
                conversation = conversation_memory.create_conversation(
                    conversation_id=conversation_id,
                    user_id=user_id
                )
        return response_data

    if not context or not context.location:
        return {
            "success": False,
            "error": "Weather context with location is required"
        }

    # Check if this is just a greeting (not a weather question)
    if is_greeting_only(user_question):
        greeting_response = "Hello! 👋 I'm your AI Weather Assistant. I can help you understand current weather, forecasts, air quality, travel conditions, clothing suggestions, outdoor activities, storms, rain predictions, and much more. How can I help you today?"

        # Store greeting in conversation for continuity
        if conversation_id:
            conversation = conversation_memory.get_conversation(conversation_id)
            if not conversation:
                conversation = conversation_memory.create_conversation(
                    conversation_id=conversation_id,
                    user_id=user_id
                )
            conversation_memory.add_message(
                conversation_id,
                role="user",
                content=user_question,
                metadata={"type": "greeting"}
            )
            conversation_memory.add_message(
                conversation_id,
                role="assistant",
                content=greeting_response,
                metadata={"type": "greeting"}
            )

        return {
            "success": True,
            "message": "Greeting response",
            "ai_response": greeting_response,
            "conversation_id": conversation_id,
            "response_mode": "quick",
            "received_context": {
                "city": context.location.city,
                "country": context.location.country,
                "question": user_question,
                "response_mode": "quick",
            },
            "metadata": {
                "format_version": "3.0",
                "ai_version": "gemini-weather-expert",
                "gemini_model": GEMINI_MODEL,
                "response_mode": "quick",
                "is_greeting": True,
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        }

    # Validate response mode
    if not validate_response_mode(response_mode):
        response_mode = "detailed"

    # Resolve weather context based on user question (handle city detection)
    resolved_context, city_query_info = context_resolver.resolve_context(
        user_question=user_question,
        current_context=context,
        conversation_history=previous_messages,
        conversation_id=conversation_id
    )

    # If resolution failed or detected an invalid city
    if not resolved_context or not resolved_context.location:
        return {
            "success": False,
            "error": "I couldn't find weather information for that city.",
            "message": "Unable to fetch weather data for the requested location."
        }

    # Use resolved context for the rest of the analysis
    context = resolved_context

    # Get system prompt for the selected mode
    system_prompt = get_system_prompt(response_mode)
    mode_config = get_mode_config(response_mode)

    # Prepare conversation context
    conversation_history = None
    if conversation_id:
        # Get or create conversation
        conversation = conversation_memory.get_conversation(conversation_id)
        if not conversation:
            conversation = conversation_memory.create_conversation(
                conversation_id=conversation_id,
                user_id=user_id
            )

        # Add weather context snapshot
        context_dict = context.dict(exclude_none=True)
        conversation_memory.add_weather_context_snapshot(conversation_id, context_dict)

        # Get conversation history
        conversation_history = conversation_memory.get_conversation_history(
            conversation_id,
            limit=10  # Keep last 10 messages for context
        )

    # Format weather context for Gemini
    weather_context_str = format_weather_context_for_gemini(context)

    # Generate weather insights from the context
    weather_insights_list = generate_weather_insights(context)
    weather_insights_str = format_insights_for_prompt(weather_insights_list)
    logger.info(f"Generated {len(weather_insights_list)} weather insights")

    # Generate weather recommendations from the context
    weather_recommendations = generate_weather_recommendations(context)
    weather_recommendations_str = format_recommendations_for_prompt(weather_recommendations)

    # Count total recommendations (only actual list attributes, not methods)
    recommendation_dict = weather_recommendations.to_dict()
    total_recommendations = sum(len(recs) for recs in recommendation_dict.values())
    logger.info(f"Generated {total_recommendations} weather recommendations across {len(recommendation_dict)} categories")

    # Generate follow-up suggestions
    previous_user_questions = []
    if conversation_history:
        previous_user_questions = [msg.content for msg in conversation_history if msg.role == "user"]
    followup_suggestions = generate_followup_suggestions(
        user_question=user_question,
        context=context,
        previous_questions=previous_user_questions,
        max_suggestions=5
    )
    weather_followups_str = format_followups_for_prompt(followup_suggestions)
    logger.info(f"Generated {len(followup_suggestions)} follow-up suggestions")

    # Format conversation history for Gemini
    gemini_conversation_history = []
    if conversation_history:
        gemini_conversation_history = format_conversation_for_gemini(conversation_history)

    # Call Gemini API
    ai_response = None
    gemini_error = None

    if GEMINI_AVAILABLE and gemini_client:
        logger.info(f"Calling Gemini API for question: {user_question[:50]}...")

        ai_response = call_gemini_api(
            system_prompt=system_prompt,
            user_question=user_question,
            weather_context_str=weather_context_str,
            weather_insights_str=weather_insights_str,
            weather_recommendations_str=weather_recommendations_str,
            weather_followups_str=weather_followups_str,
            conversation_history=gemini_conversation_history,
            response_mode=response_mode
        )

        if not ai_response:
            gemini_error = "Gemini API returned no response. Please try again."
            logger.warning("Gemini API returned empty response")
    else:
        gemini_error = "Gemini AI is not configured. Please set GEMINI_API_KEY environment variable."
        logger.warning("Gemini not available - SDK not initialized or API key not configured")

    # Build response
    if ai_response:
        # Successful Gemini response
        response_data = {
            "success": True,
            "message": "AI response generated successfully",
            "response_mode": response_mode,
            "ai_response": ai_response,
            "conversation_id": conversation_id,
            "received_context": {
                "city": context.location.city,
                "country": context.location.country,
                "question": user_question,
                "response_mode": response_mode,
                "has_conversation": bool(conversation_id),
                "conversation_message_count": len(conversation_history) if conversation_history else 0,
                "context_received": {
                    "has_current_weather": bool(context.current_weather),
                    "has_hourly_forecast": bool(context.hourly_forecast),
                    "has_daily_forecast": bool(context.daily_forecast),
                    "has_air_quality": bool(context.air_quality),
                    "has_weather_alerts": bool(context.weather_alerts),
                    "has_weather_history": bool(context.weather_history),
                    "has_sun_data": bool(context.sun_data),
                }
            },
            "metadata": {
                "format_version": "3.0",
                "ai_version": "gemini-weather-expert",
                "gemini_model": GEMINI_MODEL,
                "response_mode": response_mode,
                "max_response_length": mode_config.get("max_length"),
                "system_prompt_active": True,
                "conversation_support": bool(conversation_id),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        }
    else:
        # Gemini failed or not available - return friendly error
        response_data = {
            "success": False,
            "message": gemini_error or "Unable to generate AI response",
            "error": gemini_error,
            "response_mode": response_mode,
            "conversation_id": conversation_id,
            "received_context": {
                "city": context.location.city,
                "country": context.location.country,
                "question": user_question,
                "response_mode": response_mode,
            },
            "metadata": {
                "format_version": "3.0",
                "ai_version": "gemini-weather-expert",
                "gemini_available": GEMINI_AVAILABLE and bool(gemini_client),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        }

    # Store messages in conversation if conversation_id provided
    if conversation_id:
        # Add user message
        conversation_memory.add_message(
            conversation_id,
            role="user",
            content=user_question,
            metadata={"response_mode": response_mode}
        )

        # Add assistant message (even if it's an error)
        assistant_message = ai_response if ai_response else (gemini_error or "Unable to generate response")
        conversation_memory.add_message(
            conversation_id,
            role="assistant",
            content=assistant_message,
            metadata={"mode": response_mode, "success": bool(ai_response)}
        )

    return response_data


def convert_legacy_to_unified(legacy_request: LegacyWeatherContextRequest) -> WeatherContext:
    """
    Converts legacy request format to unified WeatherContext format.

    This function maintains backward compatibility with the old API format.

    Args:
        legacy_request (LegacyWeatherContextRequest): Request in legacy format

    Returns:
        WeatherContext: Unified weather context
    """

    # Create location data from legacy request
    location = LocationData(
        city=legacy_request.city,
        country=legacy_request.current_weather.get("country") if legacy_request.current_weather else None,
        latitude=legacy_request.current_weather.get("latitude") if legacy_request.current_weather else None,
        longitude=legacy_request.current_weather.get("longitude") if legacy_request.current_weather else None,
    )

    # Convert current weather
    current_weather = None
    if legacy_request.current_weather:
        current_weather = CurrentWeatherData(**legacy_request.current_weather)

    # Convert hourly forecast
    hourly_forecast = None
    if legacy_request.hourly_forecast:
        hourly_forecast = [HourlyForecastData(**item) for item in legacy_request.hourly_forecast]

    # Convert daily forecast
    daily_forecast = None
    if legacy_request.forecast:
        daily_forecast = [DailyForecastData(**item) for item in legacy_request.forecast]

    # Convert air quality
    air_quality = None
    if legacy_request.air_quality:
        air_quality = AirQualityData(**legacy_request.air_quality)

    # Convert alerts
    weather_alerts = None
    if legacy_request.alerts:
        weather_alerts = [WeatherAlertData(**item) for item in legacy_request.alerts]

    # Create unified context
    unified_context = WeatherContext(
        location=location,
        current_weather=current_weather,
        hourly_forecast=hourly_forecast,
        daily_forecast=daily_forecast,
        air_quality=air_quality,
        weather_alerts=weather_alerts,
    )

    return unified_context


def format_weather_context(
    city: str,
    current_weather: dict = None,
    forecast: list = None,
    hourly_forecast: list = None,
    air_quality: dict = None,
    alerts: list = None
) -> WeatherContext:
    """
    Legacy function - Formats raw weather data into a unified WeatherContext object.

    This function is maintained for backward compatibility. New code should use
    WeatherContext objects directly.

    Args:
        city (str): City name
        current_weather (dict): Current weather data from API
        forecast (list): 7-day forecast
        hourly_forecast (list): Hourly forecast data
        air_quality (dict): Air quality metrics
        alerts (list): Weather alerts

    Returns:
        WeatherContext: Structured context ready for AI processing
    """

    location = LocationData(city=city)

    current_weather_obj = None
    if current_weather:
        current_weather_obj = CurrentWeatherData(**current_weather)

    hourly_forecast_list = None
    if hourly_forecast:
        hourly_forecast_list = [HourlyForecastData(**item) for item in hourly_forecast]

    daily_forecast_list = None
    if forecast:
        daily_forecast_list = [DailyForecastData(**item) for item in forecast]

    air_quality_obj = None
    if air_quality:
        air_quality_obj = AirQualityData(**air_quality)

    weather_alerts = None
    if alerts:
        weather_alerts = [WeatherAlertData(**item) for item in alerts]

    context = WeatherContext(
        location=location,
        current_weather=current_weather_obj,
        hourly_forecast=hourly_forecast_list,
        daily_forecast=daily_forecast_list,
        air_quality=air_quality_obj,
        weather_alerts=weather_alerts,
    )

    return context
