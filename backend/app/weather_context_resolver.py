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

    def resolve_context(
        self,
        user_question: str,
        current_context: WeatherContext,
        conversation_history: Optional[List[Any]] = None,
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
            current_city = current_context.location.city if current_context.location else None

            # Check if this is a follow-up question
            if is_followup_question(
                user_question,
                self.last_question,
                self.last_detected_city
            ):
                logger.info(f"Follow-up question detected for {self.last_detected_city}")
                self.last_question = user_question
                # Continue with last detected city
                if self.last_detected_city and self.last_detected_city != current_city:
                    context = self._fetch_or_use_cache(self.last_detected_city)
                    if context:
                        return context, self.last_detected_city
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

            # Single city detected
            if detected_city:
                logger.info(f"City detected: {detected_city}")
                self.last_detected_city = detected_city
                self.last_question = user_question

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

            # No city detected, use current context
            self.last_question = user_question
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

            # Get coordinates for city
            coords = services.get_coordinates(city_name)
            if not coords:
                logger.warning(f"Could not find coordinates for {city_name}")
                return None

            # Get weather data
            weather_data = services.get_current_weather(
                coords['latitude'],
                coords['longitude']
            )

            if not weather_data:
                logger.warning(f"No weather data returned for {city_name}")
                return None

            # Build WeatherContext
            location = LocationData(
                city=city_name,
                country=weather_data.get('country'),
                latitude=coords['latitude'],
                longitude=coords['longitude'],
                timezone=weather_data.get('timezone'),
            )

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

            units = UnitsData(
                temperature='celsius',
                wind_speed='kmh',
                distance='km',
                pressure='hPa',
            )

            context = WeatherContext(
                location=location,
                current_weather=current_weather,
                hourly_forecast=None,
                daily_forecast=None,
                air_quality=None,
                weather_alerts=None,
                weather_history=[],
                sun_data=None,
                units=units,
                last_updated=datetime.utcnow().isoformat() + 'Z',
            )

            # Cache the result
            WEATHER_CONTEXT_CACHE[city_name] = (context, datetime.now())

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
