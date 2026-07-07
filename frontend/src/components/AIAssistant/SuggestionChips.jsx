import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * SuggestionChips - Displays clickable suggestion chips below assistant messages
 *
 * Features:
 * - Renders 3-5 suggestion chips
 * - Uses backend suggestions if available
 * - Falls back to intelligent frontend defaults
 * - Modern hover/press animations
 * - Mobile responsive
 * - No duplicates
 */

const DEFAULT_SUGGESTIONS = [
  { emoji: '☔', text: 'Will it rain tomorrow?' },
  { emoji: '👕', text: 'What should I wear?' },
  { emoji: '🌡', text: 'Explain the weather' },
  { emoji: '🚴', text: 'Is it good for cycling?' },
  { emoji: '🌬', text: 'What about wind?' },
  { emoji: '🌅', text: 'When is sunset?' },
  { emoji: '📅', text: 'Weekend forecast' },
  { emoji: '🚗', text: 'Safe to travel?' },
  { emoji: '💧', text: 'Humidity levels?' },
  { emoji: '🧥', text: 'Jacket needed?' },
  { emoji: '☀️', text: 'UV index today?' },
  { emoji: '🏃', text: 'Good for running?' },
]

/**
 * Get 3-5 random suggestion chips without duplicates
 */
function getRandomSuggestions(backendSuggestions = null, count = 4) {
  // If backend suggestions available, use those
  if (backendSuggestions && Array.isArray(backendSuggestions) && backendSuggestions.length > 0) {
    // Convert backend suggestions to chip format if needed
    const suggestions = backendSuggestions.slice(0, count).map((text) => {
      // Extract first emoji if present, otherwise use a default
      const emojiMatch = text.match(/^([\p{Emoji_Presentation}])/u)
      const emoji = emojiMatch ? emojiMatch[1] : '💭'
      const cleanText = text.replace(/^([\p{Emoji_Presentation}])\s*/u, '')

      return {
        emoji,
        text: cleanText || text,
      }
    })

    return suggestions
  }

  // Fall back to random defaults
  const shuffled = [...DEFAULT_SUGGESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Remove duplicate suggestions based on text content
 */
function removeDuplicates(suggestions) {
  const seen = new Set()
  return suggestions.filter((chip) => {
    const key = chip.text.toLowerCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export function SuggestionChips({
  onSuggestionClick,
  backendSuggestions = null,
  isVisible = true,
  messageId = null,
}) {
  // Generate suggestions, ensuring no duplicates
  const suggestions = useMemo(() => {
    const chips = getRandomSuggestions(backendSuggestions, 5)
    return removeDuplicates(chips)
  }, [backendSuggestions, messageId])

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  const handleChipClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.text)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {suggestions.map((chip, idx) => (
        <motion.button
          key={`${messageId}-${idx}-${chip.text}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: idx * 0.05 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgb(30, 58, 138)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleChipClick(chip)}
          className="px-3 py-2 rounded-full bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <span className="text-sm">{chip.emoji}</span>
          <span className="hidden sm:inline">{chip.text}</span>
          <span className="sm:hidden">{chip.text.split(' ')[0]}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}

export default SuggestionChips
