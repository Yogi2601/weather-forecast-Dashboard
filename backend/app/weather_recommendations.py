"""
Weather Recommendations Generator

Generates proactive, intelligent recommendations based on weather conditions.
Recommendations are categorized and data-driven - never invented.

Categories:
- Clothing
- Activities
- Health
- Travel
- Warnings
- Energy
- Pets
"""

from typing import Dict, List, Optional
from app.schemas import WeatherContext


class WeatherRecommendations:
    """Container for organized weather recommendations."""

    def __init__(self):
        self.clothing: List[str] = []
        self.activities: List[str] = []
        self.health: List[str] = []
        self.travel: List[str] = []
        self.warnings: List[str] = []
        self.energy: List[str] = []
        self.pets: List[str] = []

    def to_dict(self) -> Dict[str, List[str]]:
        """Convert to dictionary, excluding empty categories."""
        return {
            category: recs
            for category, recs in {
                "clothing": self.clothing,
                "activities": self.activities,
                "health": self.health,
                "travel": self.travel,
                "warnings": self.warnings,
                "energy": self.energy,
                "pets": self.pets,
            }.items()
            if recs
        }

    def has_recommendations(self) -> bool:
        """Check if any recommendations exist."""
        return any(
            [
                self.clothing,
                self.activities,
                self.health,
                self.travel,
                self.warnings,
                self.energy,
                self.pets,
            ]
        )


def generate_weather_recommendations(context: WeatherContext) -> WeatherRecommendations:
    """
    Generate intelligent recommendations based on weather context.

    Args:
        context (WeatherContext): Weather context with available data

    Returns:
        WeatherRecommendations: Organized recommendations by category
    """

    recs = WeatherRecommendations()

    if not context:
        return recs

    cw = context.current_weather

    # ========================================================================
    # CLOTHING RECOMMENDATIONS
    # ========================================================================

    if cw and cw.temperature_2m:
        temp = cw.temperature_2m

        if temp < 0:
            recs.clothing.append("Wear heavy winter coat and layers.")
            recs.clothing.append("Wear gloves, hat, and warm socks.")
        elif temp < 5:
            recs.clothing.append("Wear warm jacket and layers.")
            recs.clothing.append("Gloves and a hat are recommended.")
        elif temp < 10:
            recs.clothing.append("Wear a light to medium jacket.")
            recs.clothing.append("Long sleeves are suitable.")
        elif temp < 15:
            recs.clothing.append("A light jacket or sweater is comfortable.")
        elif temp < 20:
            recs.clothing.append("Light layers are suitable for comfort.")
        elif temp < 25:
            recs.clothing.append("Short sleeves and comfortable clothing work well.")
        else:
            recs.clothing.append("Light, breathable clothing is best.")

        # UV and sun protection
        if cw.uv_index and cw.uv_index > 5:
            recs.clothing.append("Use sunscreen (SPF 30+).")
            recs.clothing.append("Carry sunglasses to protect your eyes.")
            if cw.uv_index > 7:
                recs.clothing.append("Wear a hat or cap for additional sun protection.")

    # Rain protection
    if context.hourly_forecast and len(context.hourly_forecast) > 0:
        next_few = context.hourly_forecast[:4]
        rain_chance = max(
            [h.precipitation_probability for h in next_few if h.precipitation_probability],
            default=0,
        )
        if rain_chance > 50:
            recs.clothing.append("Carry an umbrella or wear a rain jacket.")

    # Wind-related clothing
    if cw and cw.wind_speed_10m and cw.wind_speed_10m > 20:
        recs.clothing.append("Wear windproof clothing to stay comfortable.")

    # Humidity-based recommendations
    if cw and cw.relative_humidity_2m:
        if cw.relative_humidity_2m > 80:
            recs.clothing.append("High humidity - wear moisture-wicking fabrics.")

    # ========================================================================
    # ACTIVITY RECOMMENDATIONS
    # ========================================================================

    if cw:
        # General comfort check
        temp_good = cw.temperature_2m and 10 <= cw.temperature_2m <= 25
        wind_good = cw.wind_speed_10m and cw.wind_speed_10m < 15
        vis_good = cw.visibility and cw.visibility > 5

        # Walking/Running
        if temp_good and wind_good and vis_good:
            recs.activities.append("Great day for walking or running outdoors.")

        # Cycling
        cycling_temp = cw.temperature_2m and 8 <= cw.temperature_2m <= 28
        cycling_wind = cw.wind_speed_10m and cw.wind_speed_10m < 20
        if cycling_temp and cycling_wind and vis_good:
            recs.activities.append("Suitable conditions for cycling.")
        elif cw.wind_speed_10m and cw.wind_speed_10m > 20:
            recs.activities.append("Strong winds - excellent for wind sports.")

        # Water activities
        if cw.wind_speed_10m and cw.wind_speed_10m < 12:
            recs.activities.append("Calm conditions ideal for swimming or water activities.")
        elif cw.wind_speed_10m and cw.wind_speed_10m > 20:
            recs.activities.append("Strong winds good for surfing or windsurfing.")

        # Photography
        photo_temp = cw.temperature_2m and 5 <= cw.temperature_2m <= 30
        if cw.uv_index and cw.uv_index > 3 and photo_temp and wind_good:
            recs.activities.append("Good lighting conditions for outdoor photography.")

        # Hiking
        if cw.visibility and cw.visibility < 2:
            recs.activities.append("Avoid hiking - visibility is too poor.")
        elif cw.wind_speed_10m and cw.wind_speed_10m > 35:
            recs.activities.append("Avoid exposed hiking - winds are too strong.")
        elif temp_good and vis_good and wind_good:
            recs.activities.append("Ideal conditions for hiking.")

        # Indoor activities
        if cw.wind_speed_10m and cw.wind_speed_10m > 40:
            recs.activities.append("Very strong winds - consider indoor activities.")
        elif cw.temperature_2m and cw.temperature_2m > 32:
            recs.activities.append("Extreme heat - indoor activities are safer.")
        elif cw.visibility and cw.visibility < 1:
            recs.activities.append("Poor visibility - indoor activities recommended.")

    # ========================================================================
    # HEALTH RECOMMENDATIONS
    # ========================================================================

    if cw and cw.temperature_2m:
        if cw.temperature_2m > 30:
            recs.health.append("Stay hydrated - drink plenty of water.")
            recs.health.append("Take frequent breaks in shade or cool areas.")
        if cw.temperature_2m < 0:
            recs.health.append("Watch for signs of hypothermia in prolonged cold exposure.")

    # Humidity and health
    if cw and cw.relative_humidity_2m:
        if cw.relative_humidity_2m > 85:
            recs.health.append("High humidity increases heat stress risk - stay cool.")

    # UV and skin health
    if cw and cw.uv_index and cw.uv_index > 6:
        recs.health.append("High UV index - protect your skin and eyes.")

    # Air quality and respiratory
    if context.air_quality:
        aq = context.air_quality
        if aq.category and ("Poor" in aq.category or "Unhealthy" in aq.category):
            recs.health.append("Poor air quality - sensitive groups should limit outdoor activities.")
            recs.health.append("Consider wearing an N95 mask if outdoor activities are necessary.")
        if aq.pm2_5 and aq.pm2_5 > 35:
            recs.health.append("High fine particle levels - avoid strenuous outdoor exercise.")

    # Pollen/allergies (if data available in alerts or category)
    if context.weather_alerts:
        for alert in context.weather_alerts:
            if alert.title and ("pollen" in alert.title.lower() or "allergy" in alert.title.lower()):
                recs.health.append("High pollen levels - take allergy medication before going outside.")

    # ========================================================================
    # TRAVEL RECOMMENDATIONS
    # ========================================================================

    if cw:
        # Visibility for driving
        if cw.visibility and cw.visibility < 1:
            recs.travel.append("Very poor visibility - exercise extreme caution when driving.")
        elif cw.visibility and cw.visibility < 5:
            recs.travel.append("Reduced visibility - use headlights and reduce speed.")

        # Wind and driving
        if cw.wind_speed_10m and cw.wind_speed_10m > 40:
            recs.travel.append("Very strong winds may affect vehicle stability - reduce speed.")
        elif cw.wind_speed_10m and cw.wind_speed_10m > 30:
            recs.travel.append("Strong winds - exercise caution with high-sided vehicles.")

        # Temperature and road conditions
        if cw.temperature_2m and cw.temperature_2m < 0:
            recs.travel.append("Roads may be icy - reduce speed and increase following distance.")
            recs.travel.append("Consider winter tires for safer driving.")

    # ========================================================================
    # WARNINGS - CRITICAL ALERTS
    # ========================================================================

    if cw:
        # Extreme wind warning
        if cw.wind_speed_10m and cw.wind_speed_10m > 50:
            recs.warnings.append("SEVERE WIND WARNING - winds exceeding 50 km/h. Secure loose items.")
        elif cw.wind_gusts_10m and cw.wind_gusts_10m > 60:
            recs.warnings.append(
                f"EXTREME WIND GUST WARNING - gusts up to {cw.wind_gusts_10m} km/h. Stay indoors."
            )

        # Temperature extremes
        if cw.temperature_2m and cw.temperature_2m > 40:
            recs.warnings.append("EXTREME HEAT WARNING - temperatures exceed 40°C. Avoid prolonged outdoor exposure.")
        elif cw.temperature_2m and cw.temperature_2m < -20:
            recs.warnings.append("EXTREME COLD WARNING - temperatures below -20°C. Limit outdoor exposure.")

        # Visibility hazard
        if cw.visibility and cw.visibility < 0.5:
            recs.warnings.append("SEVERE FOG - visibility critically low. Use extreme caution.")

    # Weather alerts
    if context.weather_alerts and len(context.weather_alerts) > 0:
        for alert in context.weather_alerts:
            if alert.severity and alert.severity.lower() == "severe":
                recs.warnings.append(f"WEATHER ALERT: {alert.title}")

    # ========================================================================
    # ENERGY RECOMMENDATIONS
    # ========================================================================

    if cw:
        # Solar generation
        if cw.uv_index and cw.uv_index > 5 and cw.weather_code in [0, 1]:  # Clear or mostly clear
            recs.energy.append("Excellent conditions for solar energy generation.")

        # Wind energy
        if cw.wind_speed_10m and cw.wind_speed_10m > 20:
            recs.energy.append("Strong wind conditions favor wind energy generation.")

    # ========================================================================
    # PET RECOMMENDATIONS
    # ========================================================================

    if cw and cw.temperature_2m:
        temp = cw.temperature_2m

        if temp > 28:
            recs.pets.append("Hot day - ensure pets have access to cool water and shade.")
            recs.pets.append("Limit exercise time for pets to avoid heat stress.")
        elif temp < 0:
            recs.pets.append("Cold weather - limit time outdoors for pets.")
            recs.pets.append("Check paws for ice and salt buildup after walks.")
        elif 10 <= temp <= 25:
            recs.pets.append("Comfortable weather for outdoor pet activities.")

        # Rain and pets
        if context.hourly_forecast and len(context.hourly_forecast) > 0:
            next_few = context.hourly_forecast[:4]
            rain_chance = max(
                [h.precipitation_probability for h in next_few if h.precipitation_probability],
                default=0,
            )
            if rain_chance > 60:
                recs.pets.append("Rainy conditions - ensure pets dry off after outdoor time.")

    return recs


def format_recommendations_for_prompt(recs: WeatherRecommendations) -> str:
    """
    Format recommendations for inclusion in prompt.

    Args:
        recs (WeatherRecommendations): Weather recommendations object

    Returns:
        str: Formatted recommendations string
    """

    if not recs.has_recommendations():
        return ""

    lines = ["Weather Recommendations:"]

    categories = [
        ("Clothing", recs.clothing),
        ("Activities", recs.activities),
        ("Health", recs.health),
        ("Travel", recs.travel),
        ("Warnings", recs.warnings),
        ("Energy", recs.energy),
        ("Pets", recs.pets),
    ]

    for category_name, recommendations in categories:
        if recommendations:
            lines.append(f"\n{category_name}:")
            for rec in recommendations:
                lines.append(f"  • {rec}")

    return "\n".join(lines)
