/**
 * AI Chat Service
 * Handles communication with the backend AI endpoint.
 * Supports both unified WeatherContext format and legacy format.
 */

import { buildWeatherContext, buildLegacyRequest } from '../utils/weatherContextBuilder'

const BACKEND_URL = "/api"

/**
 * Send a weather question using unified WeatherContext format (Recommended).
 * Supports response modes and conversation memory.
 *
 * @param {string} userQuestion - The user's question about the weather
 * @param {object} weatherContext - Unified WeatherContext object (from buildWeatherContext)
 * @param {object} options - Additional options:
 *   - responseMode: "quick" | "detailed" | "expert" (default: "detailed")
 *   - conversationId: string (for conversation memory)
 *   - previousMessages: array (previous messages in conversation)
 *   - userId: string (user identifier)
 *
 * @returns {Promise<object>} AI response with success status and message
 *
 * @throws {Error} If request fails or response is invalid
 */
export async function sendWeatherQuestionWithContext(
  userQuestion,
  weatherContext,
  options = {}
) {
  if (!userQuestion || userQuestion.trim() === "") {
    throw new Error("Question cannot be empty")
  }

  if (!weatherContext || !weatherContext.location) {
    throw new Error("WeatherContext with location is required")
  }

  // Build request payload using enhanced unified format
  const payload = {
    user_question: userQuestion.trim(),
    weather_context: weatherContext,
    response_mode: options.responseMode || "detailed",
    conversation_id: options.conversationId || null,
    previous_messages: (options.previousMessages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
    user_id: options.userId || null,
    metadata: options.metadata || null,
  }

  return sendToBackend(payload)
}

/**
 * Send a weather question using legacy format (Backward Compatibility).
 *
 * @param {string} userQuestion - The user's question about the weather
 * @param {object} weatherData - Current weather data
 * @param {array} forecast - 7-day forecast data
 * @param {array} hourlyForecast - Hourly forecast data
 * @param {object} airQuality - Air quality metrics
 * @param {array} alerts - Weather alerts
 *
 * @returns {Promise<object>} AI response with success status and message
 *
 * @throws {Error} If request fails or response is invalid
 */
export async function sendWeatherQuestion(
  userQuestion,
  weatherData,
  forecast = [],
  hourlyForecast = [],
  airQuality = null,
  alerts = []
) {
  if (!userQuestion || userQuestion.trim() === "") {
    throw new Error("Question cannot be empty")
  }

  if (!weatherData || !weatherData.city) {
    throw new Error("Weather data with city is required")
  }

  // Build request payload using legacy format
  const payload = buildLegacyRequest(
    userQuestion,
    weatherData,
    airQuality,
    alerts
  )

  return sendToBackend(payload)
}

/**
 * Internal function to send request to backend.
 *
 * @param {object} payload - Request payload
 * @returns {Promise<object>} AI response
 */
async function sendToBackend(payload) {
  let response

  try {
    response = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    throw new Error("Cannot reach the AI service — is the backend running?")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.detail || `AI service error: ${response.statusText}`
    )
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    throw new Error("Invalid response from AI service")
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || "AI service failed to process request")
  }

  return data
}

export default {
  sendWeatherQuestion,
  sendWeatherQuestionWithContext,
}
