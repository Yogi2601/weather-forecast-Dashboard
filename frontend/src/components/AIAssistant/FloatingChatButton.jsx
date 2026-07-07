import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

/**
 * FloatingChatButton - A floating button that toggles the AI chat panel
 *
 * Props:
 *   - isOpen (bool): Whether the chat panel is open
 *   - onToggle (func): Callback to toggle the panel open/closed
 *   - unreadCount (number): Number of unread AI responses (optional badge)
 */
export function FloatingChatButton({ isOpen, onToggle, unreadCount = 0 }) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
        isOpen
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {/* Icon container with smooth transition */}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </motion.div>

      {/* Unread badge (shows if unreadCount > 0) */}
      {unreadCount > 0 && !isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.div>
      )}

      {/* Pulse animation when button is not open */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-600"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ zIndex: -1 }}
        />
      )}
    </motion.button>
  )
}

export default FloatingChatButton
