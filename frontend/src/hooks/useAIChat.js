import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendWeatherQuestion, sendWeatherQuestionWithContext } from '../services/aiChatService'
import { buildWeatherContext } from '../utils/weatherContextBuilder'

/**
 * useAIChat - Hook to manage AI chat conversation state and communication with backend
 *
 * Features:
 * - Conversation memory support
 * - Response mode selection (quick, detailed, expert)
 * - Auto-generated conversation IDs
 * - Message history management
 *
 * Returns:
 *   - chatOpen (bool): Is the chat panel open
 *   - toggleChat (func): Toggle chat panel open/closed
 *   - messages (array): Array of {role: 'user'|'assistant', content: string}
 *   - isLoading (bool): Is AI currently generating a response
 *   - responseMode (string): Current response mode
 *   - setResponseMode (func): Change response mode
 *   - conversationId (string): Current conversation ID
 *   - startNewConversation (func): Start a new conversation
 *   - addMessage (func): Add a message to the conversation
 *   - clearChat (func): Clear all messages
 *   - sendMessage (func): Send user question using legacy format
 *   - sendMessageWithContext (func): Send user question using unified WeatherContext format
 */
export function useAIChat() {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [responseMode, setResponseMode] = useState('detailed')
  const [conversationId, setConversationId] = useState(null)
  const [messageMetadata, setMessageMetadata] = useState({}) // Track suggestions per message

  // Auto-generate conversation ID on mount
  useEffect(() => {
    const id = `conv_${uuidv4()}`
    setConversationId(id)
  }, [])

  // Toggle chat panel visibility
  const toggleChat = () => {
    setChatOpen((prev) => !prev)
  }

  // Add a message to the conversation with optional metadata
  const addMessage = (role, content, suggestions = null) => {
    setMessages((prev) => [...prev, { role, content }])
    if (suggestions && role === 'assistant') {
      const messageIndex = messages.length
      setMessageMetadata((prev) => ({
        ...prev,
        [`msg-${messageIndex}`]: { suggestions },
      }))
    }
  }

  // Clear all messages in the conversation
  const clearChat = () => {
    setMessages([])
  }

  // Start a new conversation (generates new ID)
  const startNewConversation = () => {
    const id = `conv_${uuidv4()}`
    setConversationId(id)
    setMessages([])
  }

  // Set loading state
  const setLoadingState = (isLoadingValue) => {
    setIsLoading(isLoadingValue)
  }

  /**
   * Send a message using legacy format (backward compatible).
   *
   * @param {string} userQuestion - The user's question
   * @param {object} weatherData - Current weather data
   * @param {array} forecast - 7-day forecast
   * @param {array} hourlyForecast - Hourly forecast
   * @param {object} airQuality - Air quality data
   * @param {array} alerts - Weather alerts
   */
  const sendMessage = async (
    userQuestion,
    weatherData,
    forecast = [],
    hourlyForecast = [],
    airQuality = null,
    alerts = []
  ) => {
    try {
      setIsLoading(true)

      // Send to backend AI endpoint using legacy format
      const response = await sendWeatherQuestion(
        userQuestion,
        weatherData,
        forecast,
        hourlyForecast,
        airQuality,
        alerts
      )

      // Add AI response to message history
      if (response.ai_response) {
        addMessage('assistant', response.ai_response)
      }
    } catch (error) {
      // Add error message to chat
      addMessage('assistant', `Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Send a message using unified WeatherContext format with response modes and conversation (Recommended).
   *
   * @param {string} userQuestion - The user's question
   * @param {object} weatherData - Current weather data object
   * @param {object} options - Additional context options (airQuality, alerts, etc.)
   */
  const sendMessageWithContext = async (userQuestion, weatherData, options = {}) => {
    try {
      setIsLoading(true)

      // Build unified WeatherContext
      const weatherContext = buildWeatherContext(weatherData, options)

      // Format previous messages for backend (ensure only role and content are included)
      const formattedMessages = messages.map((msg) => ({
        role: msg.role || 'user',
        content: msg.content || '',
      }))

      // Send to backend AI endpoint using enhanced format
      const response = await sendWeatherQuestionWithContext(
        userQuestion,
        weatherContext,
        {
          ...options,
          responseMode,
          conversationId,
          previousMessages: formattedMessages,
        }
      )

      // Add AI response to message history
      if (response && response.ai_response) {
        addMessage('assistant', response.ai_response)
      }
    } catch (error) {
      // Add error message to chat
      const errorMsg = error instanceof Error ? error.message : String(error)
      addMessage('assistant', `Error: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    chatOpen,
    toggleChat,
    messages,
    isLoading,
    responseMode,
    setResponseMode,
    conversationId,
    startNewConversation,
    addMessage,
    clearChat,
    setLoadingState,
    sendMessage,
    sendMessageWithContext,
    messageMetadata,
  }
}

export default useAIChat
