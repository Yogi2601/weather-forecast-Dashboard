export function getWeatherTheme(weather) {
  if (weather?.themeKey) {
    return weather.themeKey;
  }

  const condition = (
    weather?.condition ||
    weather?.desc ||
    ""
  ).toLowerCase();

  const icon = (weather?.icon || "").toLowerCase();

  if (
    condition.includes("thunder") ||
    condition.includes("storm") ||
    icon === "stormy"
  ) {
    return "storm";
  }

  if (
    condition.includes("snow") ||
    icon === "snowy"
  ) {
    return "snow";
  }

  if (
    condition.includes("heavy rain")
  ) {
    return "heavy-rain";
  }

  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    icon === "rainy"
  ) {
    return "rain";
  }

  if (
    condition.includes("fog") ||
    condition.includes("mist")
  ) {
    return "fog";
  }

  if (
    condition.includes("cloud")
  ) {
    return "cloudy";
  }

  if (weather?.isDay === 0) {
    return "night";
  }

  return "clear";
}