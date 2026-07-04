import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MapPinned } from 'lucide-react'

export default function WeatherResultsPanel({ selectedWeather, searchTerm, searchCategory = 'city' }) {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const weatherOptions = {
    'all': { label: 'All Weather', emoji: '🌍' },
    'sunny': { label: 'Sunny / Clear', emoji: '☀️' },
    'partly_cloudy': { label: 'Partly Cloudy', emoji: '⛅' },
    'cloudy': { label: 'Cloudy', emoji: '☁️' },
    'rainy': { label: 'Rainy', emoji: '🌧️' },
    'thunderstorm': { label: 'Thunderstorm', emoji: '⛈️' },
    'snowy': { label: 'Snowy', emoji: '❄️' },
    'foggy': { label: 'Foggy', emoji: '🌫️' },
    'windy': { label: 'Windy', emoji: '💨' },
    'hot': { label: 'Hot', emoji: '🔥' },
    'cold': { label: 'Cold', emoji: '🧊' },
  }

  useEffect(() => {
    if (selectedWeather === 'all') {
      setResults([])
      return
    }

    setIsLoading(true)
    fetch(`/api/weather-results/${selectedWeather}?category=${searchCategory}`)
      .then(res => res.json())
      .then(data => {
        let filtered = data.results || []

        if (searchTerm && searchTerm.trim().length >= 2) {
          const query = searchTerm.toLowerCase()
          filtered = filtered.filter(city =>
            city.name.toLowerCase().includes(query) ||
            (city.region && city.region.toLowerCase().includes(query)) ||
            (city.country && city.country.toLowerCase().includes(query))
          )
        }

        setResults(filtered)
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false))
  }, [selectedWeather, searchTerm, searchCategory])

  if (selectedWeather === 'all' || !selectedWeather) {
    return null
  }

  const option = weatherOptions[selectedWeather]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 10, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute left-full ml-2 top-0 w-96 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{option.emoji}</span>
            <div>
              <h3 className="font-semibold text-white text-sm">{option.label} Cities</h3>
              <p className="text-xs text-slate-400">Showing live weather results</p>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              Loading results...
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-8 text-sm text-slate-500 text-center">
              No locations found
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="py-1">
              {results.map((city, i) => (
                <li key={`${city.name}-${i}`}>
                  <div className="px-4 py-3 text-left text-sm transition-colors hover:bg-slate-800/60 border-b border-slate-800/40 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{city.name}</div>
                        {city.region && (
                          <div className="text-xs text-slate-400">{city.region}, {city.country}</div>
                        )}
                        {!city.region && (
                          <div className="text-xs text-slate-400">{city.country}</div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-semibold text-white text-sm">{city.temperature}°C</div>
                        <div className="text-xs text-slate-400">{city.condition}</div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
