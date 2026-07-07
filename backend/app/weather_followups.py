"""
Dynamic Follow-up Suggestion Generator

Analyzes weather context, user question, insights, and recommendations
to generate intelligent follow-up questions.

Follow-ups are:
- Data-driven (based on actual weather)
- Never random or hallucinated
- Ranked by usefulness
- Non-duplicative
- Contextually relevant
"""

from typing import List, Optional, Set
from app.schemas import WeatherContext
from app.weather_insights import generate_weather_insights
from app.weather_recommendations import generate_weather_recommendations


class FollowupSuggestion:
    """Represents a single follow-up suggestion with priority."""

    def __init__(self, text: str, priority: int = 0, category: str = ""):
        self.text = text
        self.priority = priority
        self.category = category

    def __lt__(self, other):
        """Sort by priority (higher priority first)."""
        return self.priority > other.priority


def _extract_asked_topics(user_question: str) -> Set[str]:
    """
    Extract topics already asked about from user question.

    Args:
        user_question (str): User's current question

    Returns:
        Set[str]: Set of topics already covered
    """

    topics = set()
    question_lower = user_question.lower()

    # Map keywords to topics
    topic_keywords = {
        "temperature": ["temp", "temperature", "warm", "cold", "hot"],
        "rain": ["rain", "precipitation", "wet", "umbrella", "shower"],
        "wind": ["wind", "breeze", "gust", "windy"],
        "humidity": ["humid", "moisture"],
        "uv": ["uv", "sun", "sunscreen", "sunburn"],
        "air_quality": ["air quality", "aqi", "pollution", "smog"],
        "clothing": ["wear", "cloth", "jacket", "coat", "dress"],
        "activity": ["activity", "do", "walk", "run", "cycle", "hike", "outside", "outdoor"],
        "travel": ["drive", "travel", "road", "car", "vehicle", "commute"],
        "health": ["health", "exercise", "safe", "allergies", "pollen"],
        "forecast": ["tomorrow", "forecast", "next", "future", "coming", "later"],
        "visibility": ["visibility", "fog", "see", "clear"],
    }

    for topic, keywords in topic_keywords.items():
        if any(keyword in question_lower for keyword in keywords):
            topics.add(topic)

    return topics


def generate_followup_suggestions(
    user_question: str,
    context: WeatherContext,
    previous_questions: Optional[List[str]] = None,
    max_suggestions: int = 5,
) -> List[str]:
    """
    Generate intelligent follow-up suggestions based on weather context and user question.

    Args:
        user_question (str): User's current question
        context (WeatherContext): Weather context
        previous_questions (List[str], optional): Previous questions in conversation
        max_suggestions (int): Maximum number of suggestions to return (default 5)

    Returns:
        List[str]: Ranked list of follow-up suggestions (max 5)
    """

    if not context or not context.current_weather:
        return []

    suggestions: List[FollowupSuggestion] = []
    already_asked = _extract_asked_topics(user_question)

    # Add previous questions to "already asked" set
    if previous_questions:
        for prev_q in previous_questions:
            already_asked.update(_extract_asked_topics(prev_q))

    cw = context.current_weather
    seen_suggestions = set()

    # ========================================================================
    # RAIN-BASED FOLLOW-UPS
    # ========================================================================

    if context.hourly_forecast and len(context.hourly_forecast) > 0:
        next_few = context.hourly_forecast[:6]
        rain_chance = max([h.precipitation_probability for h in next_few if h.precipitation_probability], default=0)

        if rain_chance > 40 and "rain" not in already_asked:
            if "What time will the rain start?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "What time will the rain start?",
                        priority=8,
                        category="rain",
                    )
                )
                seen_suggestions.add("What time will the rain start?")

            if "How long will it rain?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "How long will it rain?",
                        priority=7,
                        category="rain",
                    )
                )
                seen_suggestions.add("How long will it rain?")

    # Rain for tomorrow
    if context.daily_forecast and len(context.daily_forecast) > 1 and "forecast" not in already_asked:
        tomorrow = context.daily_forecast[1]
        if hasattr(tomorrow, "precipitation_probability") and tomorrow.precipitation_probability and tomorrow.precipitation_probability > 50:
            if "Will tomorrow be better?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "Will tomorrow be better?",
                        priority=6,
                        category="forecast",
                    )
                )
                seen_suggestions.add("Will tomorrow be better?")

    # ========================================================================
    # TEMPERATURE-BASED FOLLOW-UPS
    # ========================================================================

    if cw.temperature_2m:
        temp = cw.temperature_2m

        if temp > 28 and "activity" not in already_asked:
            if "Is it safe to exercise outside?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "Is it safe to exercise outside?",
                        priority=8,
                        category="health",
                    )
                )
                seen_suggestions.add("Is it safe to exercise outside?")

            if "What should I drink?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "How can I stay cool?",
                        priority=7,
                        category="health",
                    )
                )
                seen_suggestions.add("How can I stay cool?")

        if temp < 5 and "clothing" not in already_asked:
            if "What should I wear?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "What should I wear?",
                        priority=8,
                        category="clothing",
                    )
                )
                seen_suggestions.add("What should I wear?")

    # ========================================================================
    # UV INDEX FOLLOW-UPS
    # ========================================================================

    if cw.uv_index and cw.uv_index > 5 and "uv" not in already_asked:
        if "How strong is the UV index?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "How strong is the UV index?",
                    priority=7,
                    category="uv",
                )
            )
            seen_suggestions.add("How strong is the UV index?")

        if "What SPF sunscreen should I use?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "What SPF sunscreen should I use?",
                    priority=6,
                    category="uv",
                )
            )
            seen_suggestions.add("What SPF sunscreen should I use?")

    # ========================================================================
    # WIND-BASED FOLLOW-UPS
    # ========================================================================

    if cw.wind_speed_10m and cw.wind_speed_10m > 25 and "wind" not in already_asked:
        if "How strong are the winds?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "How strong are the winds?",
                    priority=8,
                    category="wind",
                )
            )
            seen_suggestions.add("How strong are the winds?")

        if "Is it safe to drive?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "Is it safe to drive?",
                    priority=7,
                    category="travel",
                )
            )
            seen_suggestions.add("Is it safe to drive?")

    # ========================================================================
    # AIR QUALITY FOLLOW-UPS
    # ========================================================================

    if context.air_quality and "air_quality" not in already_asked:
        aq = context.air_quality
        if aq.category and ("Poor" in aq.category or "Unhealthy" in aq.category):
            if "Is outdoor exercise safe?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "Is outdoor exercise safe?",
                        priority=9,
                        category="air_quality",
                    )
                )
                seen_suggestions.add("Is outdoor exercise safe?")

            if "Should children stay indoors?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "Should children stay indoors?",
                        priority=8,
                        category="air_quality",
                    )
                )
                seen_suggestions.add("Should children stay indoors?")

            if "When will air quality improve?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "When will air quality improve?",
                        priority=7,
                        category="air_quality",
                    )
                )
                seen_suggestions.add("When will air quality improve?")

    # ========================================================================
    # VISIBILITY-BASED FOLLOW-UPS
    # ========================================================================

    if cw.visibility and cw.visibility < 5 and "visibility" not in already_asked and "travel" not in already_asked:
        if "Is it safe to drive?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "Is it safe to drive?",
                    priority=8,
                    category="travel",
                )
            )
            seen_suggestions.add("Is it safe to drive?")

    # ========================================================================
    # FORECAST-BASED FOLLOW-UPS
    # ========================================================================

    if context.daily_forecast and len(context.daily_forecast) > 1 and "forecast" not in already_asked:
        # Generic forecast question
        if "What about the weekend?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "What about the next few days?",
                    priority=5,
                    category="forecast",
                )
            )
            seen_suggestions.add("What about the next few days?")

    # ========================================================================
    # ACTIVITY-BASED FOLLOW-UPS
    # ========================================================================

    if "activity" not in already_asked:
        # Check if conditions are favorable
        temp_good = cw.temperature_2m and 10 <= cw.temperature_2m <= 25
        wind_good = cw.wind_speed_10m and cw.wind_speed_10m < 15

        if temp_good and wind_good:
            if "What outdoor activities are good today?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "What outdoor activities are good today?",
                        priority=6,
                        category="activity",
                    )
                )
                seen_suggestions.add("What outdoor activities are good today?")

    # ========================================================================
    # TRAVEL-BASED FOLLOW-UPS
    # ========================================================================

    if context.daily_forecast and len(context.daily_forecast) > 2 and "travel" not in already_asked:
        if "Is this weekend better for travel?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "Is this weekend better for travel?",
                    priority=6,
                    category="travel",
                )
            )
            seen_suggestions.add("Is this weekend better for travel?")

    # ========================================================================
    # CLOTHING-BASED FOLLOW-UPS
    # ========================================================================

    if "clothing" not in already_asked and cw.temperature_2m:
        if 15 <= cw.temperature_2m <= 25:
            if "What should I wear?" not in seen_suggestions:
                suggestions.append(
                    FollowupSuggestion(
                        "What should I wear?",
                        priority=5,
                        category="clothing",
                    )
                )
                seen_suggestions.add("What should I wear?")

    # ========================================================================
    # HEALTH-BASED FOLLOW-UPS
    # ========================================================================

    if cw.relative_humidity_2m and cw.relative_humidity_2m > 80 and "health" not in already_asked:
        if "Is the humidity affecting my health?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "How does the humidity affect me?",
                    priority=5,
                    category="health",
                )
            )
            seen_suggestions.add("How does the humidity affect me?")

    # ========================================================================
    # WEATHER ALERTS FOLLOW-UPS
    # ========================================================================

    if context.weather_alerts and len(context.weather_alerts) > 0:
        if "What should I do?" not in seen_suggestions:
            suggestions.append(
                FollowupSuggestion(
                    "What precautions should I take?",
                    priority=9,
                    category="alerts",
                )
            )
            seen_suggestions.add("What precautions should I take?")

    # ========================================================================
    # SORT AND RETURN TOP SUGGESTIONS
    # ========================================================================

    # Remove duplicates and sort by priority
    unique_suggestions = list({s.text: s for s in suggestions}.values())
    unique_suggestions.sort()

    # Return top N suggestions
    return [s.text for s in unique_suggestions[:max_suggestions]]


def format_followups_for_prompt(followups: List[str]) -> str:
    """
    Format follow-up suggestions for inclusion in prompt.

    Args:
        followups (List[str]): List of follow-up suggestions

    Returns:
        str: Formatted follow-ups string
    """

    if not followups:
        return ""

    lines = ["Suggested Follow-up Topics:"]
    for i, followup in enumerate(followups, 1):
        lines.append(f"  {i}. {followup}")

    return "\n".join(lines)
