"""
Weather Context Resolver

Intelligently resolves which weather context to use based on user question.
Handles city detection, fetching, caching, and conversation memory.
"""

import logging
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta

from app.schemas import WeatherContext, LocationData, CurrentWeatherData, UnitsData
from app import services
from app.city_detection import (
    detect_cities_in_text,
    normalize_city_name,
    extract_city_and_question,
    is_followup_question,
)

logger = logging.getLogger(__name__)

# Cache for fetched weather contexts: {city_name: (weather_data, timestamp)}
WEATHER_CONTEXT_CACHE: Dict[str, Tuple[Any, datetime]] = {}
CACHE_DURATION_MINUTES = 30  # Cache weather for 30 minutes


class ContextResolver:
    """Resolves weather context based on user questions and conversation history."""

    def __init__(self):
        self.last_detected_city: Optional[str] = None
        self.last_question: Optional[str] = None
        # Per-conversation tracking for multi-user scenarios
        self.conversation_states: Dict[str, Dict[str, Optional[str]]] = {}

    def resolve_context(
        self,
        user_question: str,
        current_context: WeatherContext,
        conversation_history: Optional[List[Any]] = None,
        conversation_id: Optional[str] = None,
    ) -> Tuple[WeatherContext, Optional[str]]:
        """
        Resolve which weather context to use for the user's question.

        Args:
            user_question (str): The user's question
            current_context (WeatherContext): Currently loaded weather context
            conversation_history (List, optional): Previous messages in conversation

        Returns:
            Tuple[WeatherContext, Optional[str]]: (resolved_context, city_being_queried_or_none)
        """

        try:
            # Get conversation-specific state
            conv_id = conversation_id or "default"
            if conv_id not in self.conversation_states:
                self.conversation_states[conv_id] = {
                    'last_detected_city': None,
                    'last_question': None,
                }

            conv_state = self.conversation_states[conv_id]
            last_detected_city = conv_state['last_detected_city']
            last_question = conv_state['last_question']

            current_city = current_context.location.city if current_context.location else None

            # Check if this is a follow-up question
            if is_followup_question(
                user_question,
                last_question,
                last_detected_city
            ):
                logger.info(f"Follow-up question detected for {last_detected_city}")
                conv_state['last_question'] = user_question
                # Continue with last detected city
                if last_detected_city:
                    # Fetch from cache or use current if same city
                    context = self._fetch_or_use_cache(last_detected_city)
                    if context:
                        logger.info(f"Using cached/fetched context for follow-up: {last_detected_city}")
                        return context, last_detected_city
                    else:
                        logger.warning(f"Could not fetch context for {last_detected_city}, using current context")
                        return current_context, None
                return current_context, None

            # Extract cities from current question
            detected_city, clean_question, is_comparison = extract_city_and_question(
                user_question,
                current_city
            )

            # Handle comparison questions
            if is_comparison:
                cities = detect_cities_in_text(user_question)
                if len(cities) >= 2:
                    logger.info(f"Comparison question detected: {cities}")
                    # Return current context, but add info that we'll handle comparison
                    self.last_detected_city = cities[0]
                    self.last_question = user_question
                    return current_context, f"comparison:{','.join(cities)}"

            # Single city detected from alias database
            if detected_city:
                logger.info(f"City detected: {detected_city}")
                conv_state['last_detected_city'] = detected_city
                conv_state['last_question'] = user_question

                try:
                    context = self._fetch_or_use_cache(detected_city)
                    if context:
                        return context, detected_city
                    else:
                        logger.warning(f"Could not fetch weather for {detected_city}")
                        # Fall back to current context on fetch failure
                        return current_context, None
                except Exception as fetch_error:
                    logger.error(f"Error fetching weather for {detected_city}: {fetch_error}")
                    # Gracefully fall back to current context
                    return current_context, None

            # Try to extract any city name from user question (for cities not in alias database)
            # Look for patterns like "weather in CITY" or "in CITY" or "CITY weather"
            import re
            city_patterns = [
                r'weather\s+(?:in|for|at)\s+([A-Za-z\s]+?)(?:\.|,|\?|$)',
                r'in\s+([A-Za-z\s]+?)(?:\.|,|\?|$)',
                r'([A-Za-z]+)\s+(?:city|weather)',
            ]

            potential_city = None
            for pattern in city_patterns:
                match = re.search(pattern, user_question, re.IGNORECASE)
                if match:
                    potential_city = match.group(1).strip()
                    # Filter out common words that aren't cities
                    non_cities = ['the', 'a', 'an', 'is', 'are', 'will', 'would', 'like', 'know', 'tell', 'show']
                    if potential_city.lower() not in non_cities and len(potential_city) > 2:
                        logger.info(f"Potential city extracted from question: {potential_city}")
                        break

            # Try to fetch weather for the potential city
            if potential_city:
                logger.info(f"Attempting to fetch weather for potential city: {potential_city}")
                try:
                    context = self._fetch_or_use_cache(potential_city)
                    if context:
                        logger.info(f"Successfully fetched weather for {potential_city}")
                        conv_state['last_detected_city'] = potential_city
                        conv_state['last_question'] = user_question
                        return context, potential_city
                    else:
                        logger.info(f"Could not find weather data for {potential_city}, using current context")
                except Exception as fetch_error:
                    logger.info(f"Failed to fetch {potential_city}: {fetch_error}, using current context")

            # No city detected, use current context
            conv_state['last_question'] = user_question
            return current_context, None

        except Exception as e:
            logger.error(f"Error resolving context: {str(e)}", exc_info=True)
            # Always return current context on any error
            return current_context, None

    def _fetch_or_use_cache(self, city_name: str) -> Optional[WeatherContext]:
        """
        Fetch weather for a city or use cached version if recent.

        Args:
            city_name (str): City name to fetch weather for

        Returns:
            Optional[WeatherContext]: Weather context or None if fetch failed
        """

        try:
            # Check cache
            if city_name in WEATHER_CONTEXT_CACHE:
                cached_data, timestamp = WEATHER_CONTEXT_CACHE[city_name]
                age = datetime.now() - timestamp
                if age < timedelta(minutes=CACHE_DURATION_MINUTES):
                    logger.info(f"Using cached weather for {city_name}")
                    return cached_data

            # Fetch fresh weather data
            logger.info(f"Fetching weather for {city_name}")

            # Get coordinates for city using Open Meteo Geocoding API
            coords = services.get_coordinates(city_name)

            if not coords:
                logger.warning(f"Could not find coordinates for {city_name}")
                # Try with "City" suffix removed (e.g., "Dhule City" → "Dhule")
                if city_name.endswith(" City") or city_name.endswith(" city"):
                    alt_city_name = city_name.rsplit(" ", 1)[0]
                    logger.info(f"Retrying with alternative name: {alt_city_name}")
                    coords = services.get_coordinates(alt_city_name)

                if not coords:
                    logger.warning(f"Could not find coordinates for {city_name} (even with alternatives)")
                    return None

            latitude = coords.get('latitude')
            longitude = coords.get('longitude')

            logger.info(f"Found coordinates for {city_name}: {latitude}, {longitude}")

            # Get weather data from Open Meteo API
            weather_data = services.get_current_weather(latitude, longitude)

            if not weather_data:
                logger.warning(f"No weather data returned for {city_name}")
                return None

            # Get forecast data for more complete context
            forecast_data = services.get_forecast(latitude, longitude)

            # Extract city info - try to get from geocoding results or use input
            city_info = coords.get('city', city_name)
            country_info = coords.get('country')

            # Build WeatherContext
            location = LocationData(
                city=city_info,
                country=country_info,
                latitude=latitude,
                longitude=longitude,
                timezone=weather_data.get('timezone'),
            )

            # Build current weather
            current_weather = None
            current = weather_data.get('current', {})
            if current.get('temperature_2m') is not None:
                current_weather = CurrentWeatherData(
                    temperature_2m=current.get('temperature_2m'),
                    apparent_temperature=current.get('apparent_temperature'),
                    relative_humidity_2m=current.get('relative_humidity_2m'),
                    wind_speed_10m=current.get('wind_speed_10m'),
                    wind_direction_10m=current.get('wind_direction_10m'),
                    wind_gusts_10m=current.get('wind_gusts_10m'),
                    pressure_msl=current.get('pressure_msl'),
                    visibility=current.get('visibility'),
                    uv_index=current.get('uv_index'),
                    weather_code=current.get('weather_code'),
                    is_day=current.get('is_day'),
                    condition=current.get('condition'),
                    icon=current.get('icon'),
                )

            # Build hourly forecast if available
            hourly_forecast = None
            if forecast_data and forecast_data.get('hourly'):
                hourly_data = forecast_data['hourly']
                # Create a simplified hourly forecast structure
                hourly_forecast = [
                    {
                        'time': hourly_data.get('time', [])[i] if i < len(hourly_data.get('time', [])) else None,
                        'temperature': hourly_data.get('temperature_2m', [])[i] if i < len(hourly_data.get('temperature_2m', [])) else None,
                        'weather_code': hourly_data.get('weather_code', [])[i] if i < len(hourly_data.get('weather_code', [])) else None,
                    }
                    for i in range(min(24, len(hourly_data.get('time', []))))  # First 24 hours
                ] if hourly_data.get('time') else None

            # Build daily forecast if available
            daily_forecast = None
            if forecast_data and forecast_data.get('daily'):
                daily_data = forecast_data['daily']
                daily_forecast = [
                    {
                        'date': daily_data.get('time', [])[i] if i < len(daily_data.get('time', [])) else None,
                        'temp_max': daily_data.get('temperature_2m_max', [])[i] if i < len(daily_data.get('temperature_2m_max', [])) else None,
                        'temp_min': daily_data.get('temperature_2m_min', [])[i] if i < len(daily_data.get('temperature_2m_min', [])) else None,
                        'weather_code': daily_data.get('weather_code', [])[i] if i < len(daily_data.get('weather_code', [])) else None,
                    }
                    for i in range(min(7, len(daily_data.get('time', []))))  # First 7 days
                ] if daily_data.get('time') else None

            # Build sun data if available
            sun_data = None
            if forecast_data and forecast_data.get('daily'):
                daily_data = forecast_data['daily']
                sun_data = {
                    'sunrise': daily_data.get('sunrise', [])[0] if daily_data.get('sunrise') else None,
                    'sunset': daily_data.get('sunset', [])[0] if daily_data.get('sunset') else None,
                }

            units = UnitsData(
                temperature='celsius',
                wind_speed='kmh',
                distance='km',
                pressure='hPa',
            )

            context = WeatherContext(
                location=location,
                current_weather=current_weather,
                hourly_forecast=hourly_forecast,
                daily_forecast=daily_forecast,
                air_quality=None,
                weather_alerts=None,
                weather_history=[],
                sun_data=sun_data,
                units=units,
                last_updated=datetime.utcnow().isoformat() + 'Z',
            )

            # Cache the result
            WEATHER_CONTEXT_CACHE[city_name] = (context, datetime.now())
            logger.info(f"Cached weather data for {city_name}")

            return context

        except Exception as e:
            logger.error(f"Error fetching weather for {city_name}: {str(e)}", exc_info=True)
            return None

    def reset_conversation(self):
        """Reset conversation memory for new conversation."""
        self.last_detected_city = None
        self.last_question = None


# Global resolver instance
context_resolver = ContextResolver()
