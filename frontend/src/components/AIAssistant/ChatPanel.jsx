import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronDown } from 'lucide-react'
import { AIThinkingIndicator } from './AIThinkingIndicator'
import { SuggestionChips } from './SuggestionChips'
import { useDailyWeatherBriefing } from './DailyWeatherBriefing'

/**
 * StreamingMessage - Component for streaming text with typing animation
 */
function StreamingMessage({ content, isStreaming }) {
  const [displayedContent, setDisplayedContent] = useState('')
  const streamingRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!isStreaming && displayedContent === content) {
      return
    }

    // Start streaming
    let charIndex = 0
    const streamChar = () => {
      if (charIndex < content.length) {
        setDisplayedContent(content.substring(0, charIndex + 1))
        charIndex++
        // Natural typing speed: 15-25ms per character
        const speed = 15 + Math.random() * 10
        timeoutRef.current = setTimeout(streamChar, speed)
      }
    }

    streamChar()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [content, isStreaming])

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {displayedContent}
      {isStreaming && displayedContent !== content && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="inline-block w-2 h-5 bg-slate-100 ml-0.5 align-text-bottom"
        />
      )}
    </p>
  )
}

/**
 * ChatPanel - Modal chat interface for the AI Weather Assistant
 *
 * Props:
 *   - isOpen (bool): Whether the panel is visible
 *   - onClose (func): Callback to close the panel
 *   - weatherData (object): Current weather data to pass to AI
 *   - isLoading (bool): Whether AI is generating a response
 *   - messages (array): Chat message history
 *   - onSendMessage (func): Callback when user sends a message
 */
export function ChatPanel({
  isOpen,
  onClose,
  weatherData,
  isLoading,
  messages = [],
  onSendMessage,
  messageMetadata: externalMetadata = {},
}) {
  const [inputValue, setInputValue] = useState('')
  const [streamingMessageIndex, setStreamingMessageIndex] = useState(-1)
  const [briefingShown, setBriefingShown] = useState(false)
  const messagesEndRef = useRef(null)

  // Generate weather briefing
  const briefing = useDailyWeatherBriefing(weatherData)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessageIndex])

  const handleSend = useCallback((text = null) => {
    const messageText = text || inputValue
    if (messageText.trim() === '') return

    // Call parent's message handler
    onSendMessage(messageText)

    // Clear input only if not from chip
    if (!text) {
      setInputValue('')
    }
  }, [inputValue, onSendMessage])

  const handleKeyDown = (e) => {
    // Send on Enter, but allow Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Determine which message is currently streaming
  useEffect(() => {
    if (isLoading) {
      setStreamingMessageIndex(-1)
    } else if (messages.length > 0) {
      // Last message from assistant is the one being streamed
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setStreamingMessageIndex(messages.length - 1)
      }
    }
  }, [isLoading, messages])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 flex flex-col bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
            style={{
              bottom: 'max(1rem, env(safe-area-inset-bottom))',
              right: 'max(1rem, env(safe-area-inset-right))',
              width: 'clamp(280px, 95vw, 400px)',
              height: 'clamp(400px, 85vh, 600px)',
              maxHeight: 'calc(100vh - 120px)',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">AI Weather Assistant</h3>
                <p className="text-blue-100 text-xs">Powered by Gemini</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-600 p-1 rounded transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-950">
              {messages.length === 0 && (
                <>
                  {/* Show AI Weather Briefing when chat is empty */}
                  {briefing && !briefingShown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onAnimationComplete={() => setBriefingShown(true)}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl rounded-bl-none max-w-xs">
                        <p className="text-sm leading-relaxed whitespace-pre-line break-words">{briefing}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestion chips for briefing */}
                  {briefingShown && (
                    <SuggestionChips
                      onSuggestionClick={(text) => handleSend(text)}
                      isVisible={true}
                      messageId="briefing"
                    />
                  )}

                  {/* Placeholder when no briefing yet */}
                  {!briefing && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-400">
                        <p className="text-sm mb-2">Ask me anything about today's weather!</p>
                        <p className="text-xs text-slate-500">Examples:</p>
                        <ul className="text-xs text-slate-500 mt-2 space-y-1">
                          <li>• Will it rain tomorrow?</li>
                          <li>• What should I wear?</li>
                          <li>• Is it good for jogging?</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}

              {messages.map((msg, idx) => {
                const isStreamingThisMessage = idx === streamingMessageIndex && msg.role === 'assistant'
                const isLastAssistantMessage = msg.role === 'assistant' && idx === messages.length - 1
                const messageId = `msg-${idx}`
                const suggestions = externalMetadata[messageId]?.suggestions || null

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={msg.role === 'user' ? '' : 'max-w-sm w-full'}>
                      <div
                        className={`px-4 py-3 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {isStreamingThisMessage ? (
                          <StreamingMessage content={msg.content} isStreaming={true} />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                      </div>

                      {/* Show suggestion chips only for last assistant message */}
                      {isLastAssistantMessage && !isLoading && (
                        <SuggestionChips
                          onSuggestionClick={(text) => handleSend(text)}
                          backendSuggestions={suggestions}
                          isVisible={true}
                          messageId={messageId}
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {/* AI Thinking Indicator */}
              <AIThinkingIndicator isThinking={isLoading} />

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 bg-slate-900 border-t border-slate-700 p-4 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the weather..."
                disabled={isLoading}
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
              />
              <motion.button
                onClick={handleSend}
                disabled={isLoading || inputValue.trim() === ''}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white p-2.5 rounded-full transition-colors"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChatPanel
