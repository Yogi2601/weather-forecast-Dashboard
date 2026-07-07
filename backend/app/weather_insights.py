"""
Weather Insights Generator

Analyzes weather context and generates human-readable insights.
These insights are appended to prompts to help Gemini provide better responses.

Insights are based ONLY on available weather data - never invented.
"""

from typing import List, Optional
from app.schemas import WeatherContext


def generate_weather_insights(context: WeatherContext) -> List[str]:
    """
    Generate human-readable weather insights from weather context.

    Args:
        context (WeatherContext): Weather context with all available data

    Returns:
        List[str]: List of insight strings
    """

    insights = []

    if not context:
        return insights

    # ========================================================================
    # Current Weather Insights
    # ========================================================================

    if context.current_weather:
        cw = context.current_weather

        # Temperature feels different from actual
        if cw.temperature_2m and cw.apparent_temperature:
            temp_diff = cw.temperature_2m - cw.apparent_temperature
            if temp_diff > 3:
                insights.append(f"It feels significantly colder than the actual temperature ({cw.apparent_temperature}°C vs {cw.temperature_2m}°C).")
            elif temp_diff < -3:
                insights.append(f"It feels noticeably warmer than the actual temperature ({cw.apparent_temperature}°C vs {cw.temperature_2m}°C).")
            elif abs(temp_diff) > 0.5:
                insights.append(f"It feels slightly different from the actual temperature due to wind chill and humidity.")

        # Humidity observations
        if cw.relative_humidity_2m:
            if cw.relative_humidity_2m > 80:
                insights.append("High humidity - the air feels damp and sticky.")
            elif cw.relative_humidity_2m > 65:
                insights.append("Moderate humidity - fairly comfortable conditions.")
            elif cw.relative_humidity_2m < 30:
                insights.append("Low humidity - the air is quite dry.")

        # Wind observations
        if cw.wind_speed_10m:
            if cw.wind_speed_10m > 30:
                insights.append("Strong winds - be cautious outdoors and watch for gusts.")
            elif cw.wind_speed_10m > 20:
                insights.append("Moderate to strong winds - good for wind sports.")
            elif cw.wind_speed_10m > 10:
                insights.append("Light to moderate breeze - pleasant wind conditions.")

        # Wind gusts warning
        if cw.wind_gusts_10m and cw.wind_gusts_10m > 40:
            insights.append(f"Wind gusts up to {cw.wind_gusts_10m} km/h - secure loose items.")

        # Visibility
        if cw.visibility and cw.visibility < 1:
            insights.append("Very poor visibility - exercise caution when driving.")
        elif cw.visibility and cw.visibility < 5:
            insights.append("Reduced visibility - foggy or misty conditions.")

        # UV Index
        if cw.uv_index:
            if cw.uv_index >= 8:
                insights.append(f"Very high UV index ({cw.uv_index}) - strong sun protection essential.")
            elif cw.uv_index >= 6:
                insights.append(f"High UV index ({cw.uv_index}) - apply sunscreen if outdoors.")
            elif cw.uv_index >= 3:
                insights.append(f"Moderate UV index ({cw.uv_index}) - consider sun protection for extended outdoor time.")

        # Pressure observations (weather prediction)
        if cw.pressure_msl:
            if cw.pressure_msl < 1000:
                insights.append("Low atmospheric pressure - unsettled weather possible.")
            elif cw.pressure_msl > 1025:
                insights.append("High atmospheric pressure - stable weather likely.")

    # ========================================================================
    # Hourly Forecast Insights
    # ========================================================================

    if context.hourly_forecast and len(context.hourly_forecast) > 0:
        # Check for precipitation in next few hours
        next_few = context.hourly_forecast[:4]
        rain_chance = max([h.precipitation_probability for h in next_few if h.precipitation_probability])

        if rain_chance and rain_chance > 60:
            insights.append("Rain is likely soon - carry an umbrella.")
        elif rain_chance and rain_chance > 30:
            insights.append("Chance of rain in the next few hours.")

        # Check temperature trends
        temps = [h.temp for h in next_few if h.temp]
        if len(temps) > 1:
            if temps[-1] > temps[0] + 2:
                insights.append("Temperatures rising throughout the day.")
            elif temps[-1] < temps[0] - 2:
                insights.append("Temperatures dropping - expect it to get cooler.")

    # ========================================================================
    # Daily Forecast Insights
    # ========================================================================

    if context.daily_forecast and len(context.daily_forecast) > 0:
        today = context.daily_forecast[0]

        # Temperature comfort
        if today.temp_max and today.temp_min:
            avg_temp = (today.temp_max + today.temp_min) / 2
            if 15 <= avg_temp <= 22:
                insights.append("Comfortable temperature range for outdoor activities.")
            elif avg_temp > 28:
                insights.append("Hot day - stay hydrated and find shade when possible.")
            elif avg_temp < 5:
                insights.append("Cold day - dress warmly in layers.")

        # Daily rain prediction
        if hasattr(today, 'precipitation_probability') and today.precipitation_probability:
            if today.precipitation_probability > 70:
                insights.append("High chance of rain today.")
            elif today.precipitation_probability > 40:
                insights.append("Scattered showers possible.")

    # ========================================================================
    # Air Quality Insights
    # ========================================================================

    if context.air_quality:
        aq = context.air_quality

        if aq.category:
            if "Good" in aq.category:
                insights.append("Air quality is good - ideal for outdoor activities.")
            elif "Moderate" in aq.category:
                insights.append("Air quality is moderate - acceptable for most activities.")
            elif "Poor" in aq.category or "Unhealthy" in aq.category:
                insights.append("Poor air quality - sensitive groups should limit outdoor activities.")
            elif "Hazardous" in aq.category:
                insights.append("Hazardous air quality - avoid outdoor activities if possible.")

        # Specific pollutant insights
        if aq.pm2_5 and aq.pm2_5 > 35:
            insights.append("High PM2.5 levels - fine particles in the air.")
        if aq.pm10 and aq.pm10 > 50:
            insights.append("Elevated dust levels - consider wearing a mask if sensitive.")

    # ========================================================================
    # Weather Alerts Insights
    # ========================================================================

    if context.weather_alerts and len(context.weather_alerts) > 0:
        for alert in context.weather_alerts:
            if alert.severity and alert.title:
                insights.append(f"Weather alert: {alert.severity.lower()} - {alert.title}")

    # ========================================================================
    # Sun Data Insights
    # ========================================================================

    if context.sun_data:
        if context.sun_data.sunrise:
            insights.append(f"Sunrise at {context.sun_data.sunrise} - good time for morning activities.")
        if context.sun_data.sunset:
            insights.append(f"Sunset at {context.sun_data.sunset} - plan evening activities accordingly.")

    # ========================================================================
    # Activity Suitability Insights
    # ========================================================================

    cw = context.current_weather
    if cw:
        # Walking/jogging
        if cw.wind_speed_10m and cw.wind_speed_10m < 15 and cw.temperature_2m and 10 <= cw.temperature_2m <= 25:
            insights.append("Good conditions for walking or jogging.")

        # Cycling
        if cw.wind_speed_10m and cw.wind_speed_10m < 20 and cw.visibility and cw.visibility > 5:
            if not context.weather_alerts or len(context.weather_alerts) == 0:
                insights.append("Suitable conditions for cycling.")
            else:
                insights.append("Cycling possible, but be aware of weather alerts.")

        # Photography
        if cw.uv_index and cw.uv_index > 3 and cw.wind_speed_10m and cw.wind_speed_10m < 10:
            insights.append("Good lighting for outdoor photography.")

        # Beach/water activities
        if cw.wind_speed_10m and cw.wind_speed_10m < 12:
            insights.append("Calm conditions suitable for water activities.")
        elif cw.wind_speed_10m and cw.wind_speed_10m > 20:
            insights.append("Strong wind - exciting conditions for water sports.")

    return insights


def format_insights_for_prompt(insights: List[str]) -> str:
    """
    Format insights list into a string suitable for appending to prompts.

    Args:
        insights (List[str]): List of insight strings

    Returns:
        str: Formatted insights string
    """

    if not insights:
        return ""

    formatted = "Quick Weather Insights:\n"
    for insight in insights:
        formatted += f"- {insight}\n"

    return formatted.strip()
