import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function WeatherFilterDropdown({ selectedWeather, onWeatherChange, isOpen, onOpenChange }) {
  const buttonRef = useRef(null)

  const weatherOptions = [
    { id: 'all', label: 'All Weather', emoji: '🌍' },
    { id: 'sunny', label: 'Sunny / Clear', emoji: '☀️' },
    { id: 'partly_cloudy', label: 'Partly Cloudy', emoji: '⛅' },
    { id: 'cloudy', label: 'Cloudy', emoji: '☁️' },
    { id: 'rainy', label: 'Rainy', emoji: '🌧️' },
    { id: 'thunderstorm', label: 'Thunderstorm', emoji: '⛈️' },
    { id: 'snowy', label: 'Snowy', emoji: '❄️' },
    { id: 'foggy', label: 'Foggy', emoji: '🌫️' },
    { id: 'windy', label: 'Windy', emoji: '💨' },
    { id: 'hot', label: 'Hot', emoji: '🔥' },
    { id: 'cold', label: 'Cold', emoji: '🧊' },
  ]

  const selected = weatherOptions.find(w => w.id === selectedWeather)

  const handleSelect = (optionId) => {
    onWeatherChange(optionId)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 min-w-[120px] text-sm"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected?.emoji} {selected?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md overflow-hidden"
          >
            <div className="py-1 max-h-72 overflow-y-auto custom-scrollbar">
              {weatherOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full px-4 py-2.5 text-left transition-colors flex items-center gap-2 ${
                    selectedWeather === option.id
                      ? 'bg-blue-500/15 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-lg w-5 text-center">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
