import React, { useState, useEffect, useCallback } from 'react'

/**
 * DailyWeatherBriefing - Generates intelligent weather briefing text
 *
 * This is a utility function that creates a chat-style message
 * to be displayed in the chat panel as an assistant message
 */

export function generateWeatherBriefing(weatherData) {
  if (!weatherData) return null

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const city = weatherData.city || 'Your location'
  const temp = Math.round(weatherData.temp)
  const condition = weatherData.condition || 'Partly cloudy'
  const feelsLike = Math.round(weatherData.feelsLike || weatherData.temp)
  const humidity = weatherData.humidity || 0
  const wind = Math.round(weatherData.wind || 0)

  // Temperature assessment
  let tempAssessment = ''
  if (temp > 28) {
    tempAssessment = 'quite warm'
  } else if (temp > 20) {
    tempAssessment = 'pleasant'
  } else if (temp > 10) {
    tempAssessment = 'cool'
  } else {
    tempAssessment = 'cold'
  }

  // Rain assessment
  let rainAssessment = ''
  const forecast = weatherData.forecast || []
  const todayForecast = forecast[0]
  if (todayForecast && todayForecast.precipitation_probability > 60) {
    rainAssessment = 'Expect rain throughout the day.'
  } else if (todayForecast && todayForecast.precipitation_probability > 30) {
    rainAssessment = "There's a chance of scattered showers."
  } else {
    rainAssessment = 'No rain expected.'
  }

  // Wind assessment
  let windAssessment = ''
  if (wind > 30) {
    windAssessment = 'Strong winds expected.'
  } else if (wind > 20) {
    windAssessment = 'Moderate breeze throughout the day.'
  } else if (wind > 10) {
    windAssessment = 'Light winds.'
  } else {
    windAssessment = 'Calm conditions.'
  }

  // Clothing recommendation
  let clothingRec = ''
  if (temp < 0) {
    clothingRec = 'Wear heavy winter layers, gloves, and a hat.'
  } else if (temp < 10) {
    clothingRec = 'Bring a warm jacket and layers.'
  } else if (temp < 15) {
    clothingRec = 'A light jacket is recommended.'
  } else if (temp < 22) {
    clothingRec = 'Comfortable layers work well.'
  } else if (temp < 28) {
    clothingRec = 'Light clothing is perfect for today.'
  } else {
    clothingRec = 'Wear light, breathable clothing and sun protection.'
  }

  // Activity recommendation
  let activityRec = ''
  if (wind > 25 || (todayForecast && todayForecast.precipitation_probability > 60)) {
    activityRec = 'Consider indoor activities today.'
  } else if (temp > 28 && humidity > 75) {
    activityRec = 'Take breaks in shade if doing outdoor activities.'
  } else if (temp >= 15 && temp <= 25 && wind < 15) {
    activityRec = 'Perfect conditions for outdoor activities.'
  } else {
    activityRec = 'Most activities are suitable today.'
  }

  // Important highlight
  let highlight = ''
  if (weatherData.uvIndex && weatherData.uvIndex > 7) {
    highlight = `⚠️ High UV index (${weatherData.uvIndex}) - strong sun protection needed.`
  } else if (humidity > 85) {
    highlight = `💧 High humidity (${humidity}%) - stay hydrated.`
  } else if (wind > 30) {
    highlight = `🌬 Strong winds (${wind} km/h) - secure loose items.`
  } else if (temp > 32) {
    highlight = `🌡 Extreme heat (${temp}°C) - limit outdoor time.`
  } else if (temp < 0) {
    highlight = `❄️ Freezing conditions - roads may be icy.`
  } else {
    highlight = `✅ Overall favorable weather conditions.`
  }

  // Build briefing
  const briefingText = `${greeting}! 👋

Today in ${city}, expect ${tempAssessment} weather with ${condition.toLowerCase()}. The temperature will be around ${temp}°C (feels like ${feelsLike}°C) with ${humidity}% humidity.

${rainAssessment} ${windAssessment}

💡 **Clothing:** ${clothingRec}

🎯 **Activity:** ${activityRec}

${highlight}

Make it a great day! 🌟`

  return briefingText
}

/**
 * Hook to manage weather briefing state and caching
 */
export function useDailyWeatherBriefing(weatherData) {
  const [briefing, setBriefing] = useState(null)
  const [cachedWeatherHash, setCachedWeatherHash] = useState(null)

  const generateWeatherHash = useCallback((data) => {
    if (!data) return null
    return JSON.stringify({
      city: data.city,
      temp: data.temp,
      condition: data.condition,
      wind: data.wind,
      humidity: data.humidity,
      hour: new Date().getHours(),
    })
  }, [])

  useEffect(() => {
    if (!weatherData) return

    const currentHash = generateWeatherHash(weatherData)
    if (currentHash === cachedWeatherHash) return

    const newBriefing = generateWeatherBriefing(weatherData)
    setBriefing(newBriefing)
    setCachedWeatherHash(currentHash)
  }, [weatherData, cachedWeatherHash, generateWeatherHash])

  return briefing
}

export default {
  generateWeatherBriefing,
  useDailyWeatherBriefing,
}
