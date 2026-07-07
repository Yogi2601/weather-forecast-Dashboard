/**
 * Weather Context Builder
 * Constructs unified WeatherContext objects for AI processing.
 * This ensures consistent data formatting and future-proofs the architecture.
 */

/**
 * Build a unified WeatherContext object from weather data.
 * This is the recommended way to construct context for AI endpoints.
 *
 * @param {object} weatherData - Main weather data object from fetchWeatherForCity
 * @param {object} options - Additional options
 * @returns {object} - Unified WeatherContext ready for AI API
 */
export function buildWeatherContext(weatherData, options = {}) {
  if (!weatherData || !weatherData.city) {
    throw new Error("Weather data with city is required")
  }

  // Build current weather object
  const currentWeather = {
    temperature_2m: weatherData.temp,
    apparent_temperature: weatherData.feelsLike,
    relative_humidity_2m: weatherData.humidity,
    wind_speed_10m: weatherData.wind,
    wind_direction_10m: weatherData.windDirection,
    wind_gusts_10m: weatherData.windGust,
    pressure_msl: weatherData.pressure,
    visibility: weatherData.visibility,
    uv_index: weatherData.uvIndex,
    weather_code: weatherData.weather_code,
    is_day: weatherData.isDay,
    condition: weatherData.condition,
    icon: weatherData.icon,
  }

  // Build hourly forecast
  const hourlyForecast = (weatherData.hourlyForecast || []).map((hour) => ({
    label: hour.label,
    temp: hour.temp,
    icon: hour.icon,
    precipitation_probability: hour.precipitationProbability,
    wind_speed: hour.windSpeed,
    weather_code: hour.weather_code,
  }))

  // Build daily forecast
  const dailyForecast = (weatherData.forecast || []).map((day) => ({
    label: day.label,
    temp_max: day.tempMax,
    temp_min: day.tempMin,
    icon: day.icon,
    weather_code: day.weather_code,
  }))

  // Location data
  const location = {
    city: weatherData.city,
    country: weatherData.country || null,
    latitude: weatherData.latitude || null,
    longitude: weatherData.longitude || null,
    timezone: options.timezone || null,
  }

  // Sun data
  const sunData = {
    sunrise: weatherData.sunrise || null,
    sunset: weatherData.sunset || null,
  }

  // Units (default to metric/SI)
  const units = {
    temperature: options.temperatureUnit || "celsius",
    wind_speed: options.windSpeedUnit || "kmh",
    distance: options.distanceUnit || "km",
    pressure: options.pressureUnit || "hPa",
  }

  // Build unified context object
  const weatherContext = {
    location,
    current_weather: currentWeather,
    hourly_forecast: hourlyForecast.length > 0 ? hourlyForecast : null,
    daily_forecast: dailyForecast.length > 0 ? dailyForecast : null,
    air_quality: options.airQuality || null,
    weather_alerts: options.alerts || null,
    weather_history: Array.isArray(options.weatherHistory) ? options.weatherHistory : [],
    sun_data: sunData,
    units,
    last_updated: new Date().toISOString(),
    user_preferences: options.userPreferences || null,
  }

  return weatherContext
}

/**
 * Build a legacy-format request for backward compatibility.
 * Use buildWeatherContext() for new code.
 *
 * @param {string} userQuestion - User's question
 * @param {object} weatherData - Main weather data
 * @param {object} airQuality - Optional air quality data
 * @param {array} alerts - Optional weather alerts
 * @returns {object} - Legacy format request
 */
export function buildLegacyRequest(
  userQuestion,
  weatherData,
  airQuality = null,
  alerts = []
) {
  return {
    user_question: userQuestion,
    city: weatherData.city,
    current_weather: {
      temperature_2m: weatherData.temp,
      relative_humidity_2m: weatherData.humidity,
      wind_speed_10m: weatherData.wind,
      weather_code: weatherData.weather_code,
    },
    forecast: weatherData.forecast || [],
    hourly_forecast: weatherData.hourlyForecast || [],
    air_quality: airQuality,
    alerts: alerts,
  }
}

export default {
  buildWeatherContext,
  buildLegacyRequest,
}
