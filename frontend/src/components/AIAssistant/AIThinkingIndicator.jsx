import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * AIThinkingIndicator - Displays rotating thinking messages while AI processes
 *
 * Features:
 * - Rotates through meaningful weather-related thinking messages
 * - Random order, never repeats consecutive messages
 * - Smooth fade transitions
 * - Stops immediately when thinking completes
 */

const THINKING_MESSAGES = [
  { emoji: '🌦', text: 'Analyzing current weather...' },
  { emoji: '☁️', text: 'Reading forecast...' },
  { emoji: '🌬', text: 'Checking wind conditions...' },
  { emoji: '🌡', text: 'Calculating feels-like temperature...' },
  { emoji: '🌫', text: 'Reviewing air quality...' },
  { emoji: '🚗', text: 'Evaluating travel conditions...' },
  { emoji: '👕', text: 'Preparing clothing suggestions...' },
  { emoji: '🚴', text: 'Checking outdoor activity conditions...' },
  { emoji: '⚠', text: 'Looking for weather alerts...' },
  { emoji: '🧠', text: 'Generating personalized advice...' },
  { emoji: '✍', text: 'Writing response...' },
]

export function AIThinkingIndicator({ isThinking }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [visitedIndices, setVisitedIndices] = useState(new Set())
  const intervalRef = useRef(null)
  const lastMessageRef = useRef(-1)

  // Get a random message that hasn't been shown recently and isn't the same as last
  const getNextMessageIndex = (lastIndex, visited) => {
    const availableIndices = []

    // Build list of messages we can show (not the last one)
    for (let i = 0; i < THINKING_MESSAGES.length; i++) {
      if (i !== lastIndex) {
        availableIndices.push(i)
      }
    }

    // If we've shown all messages except the last one, reset visited set
    if (availableIndices.length === 0) {
      setVisitedIndices(new Set())
      availableIndices.push(
        ...Array.from({ length: THINKING_MESSAGES.length }, (_, i) => i).filter(
          (i) => i !== lastIndex
        )
      )
    }

    // Pick a random available message
    const randomIndex = Math.floor(Math.random() * availableIndices.length)
    return availableIndices[randomIndex]
  }

  useEffect(() => {
    if (!isThinking) {
      // Stop the interval when thinking is done
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initialize with first random message
    const nextIndex = getNextMessageIndex(lastMessageRef.current, visitedIndices)
    setCurrentMessageIndex(nextIndex)
    lastMessageRef.current = nextIndex

    // Rotate message every 1.5 seconds (1000-2000ms)
    const rotationSpeed = 1500
    intervalRef.current = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        const nextIndex = getNextMessageIndex(prevIndex, visitedIndices)
        lastMessageRef.current = nextIndex
        return nextIndex
      })
    }, rotationSpeed)

    // Cleanup interval on unmount or when thinking stops
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isThinking, visitedIndices])

  const currentMessage = THINKING_MESSAGES[currentMessageIndex]

  return (
    <AnimatePresence mode="wait">
      {isThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start"
        >
          <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-xl rounded-bl-none flex items-center gap-3">
            {/* Thinking indicator dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: dot * 0.15,
                  }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
              ))}
            </div>

            {/* Thinking message with smooth fade */}
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm leading-relaxed flex items-center gap-2"
            >
              <span className="text-base">{currentMessage.emoji}</span>
              <span>{currentMessage.text}</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AIThinkingIndicator
