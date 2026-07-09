import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock } from 'lucide-react'

const CACHE_DURATION_MS = 30 * 60 * 1000  // 30 minutes

const SearchedCitiesCacheComponent = forwardRef(({ onSelectCity }, ref) => {
  const [cachedCities, setCachedCities] = useState([])
  const [timeLeft, setTimeLeft] = useState({})

  // Load cached cities from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('searchedCitiesCache')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const now = Date.now()

        // Filter out expired entries
        const valid = parsed.filter(city => (city.timestamp + CACHE_DURATION_MS) > now)

        if (valid.length > 0) {
          setCachedCities(valid)
          updateTimeLeft(valid)
        } else {
          localStorage.removeItem('searchedCitiesCache')
        }
      } catch (error) {
        console.error('Error loading cached cities:', error)
      }
    }
  }, [])

  // Update time remaining for each city every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeLeft(cachedCities)
    }, 1000)

    return () => clearInterval(interval)
  }, [cachedCities])

  const updateTimeLeft = (cities) => {
    const now = Date.now()
    const remaining = {}

    cities.forEach(city => {
      const age = now - city.timestamp
      const timeRemaining = CACHE_DURATION_MS - age

      if (timeRemaining > 0) {
        const minutes = Math.floor(timeRemaining / 60000)
        const seconds = Math.floor((timeRemaining % 60000) / 1000)
        remaining[city.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`
      } else {
        remaining[city.id] = 'Expired'
      }
    })

    setTimeLeft(remaining)
  }

  // Add a city to cache
  const addCityToCache = (cityData) => {
    const newCity = {
      id: `${cityData.name}-${Date.now()}`,
      name: cityData.name,
      country: cityData.country,
      temp: cityData.temp,
      condition: cityData.condition,
      humidity: cityData.humidity,
      wind: cityData.wind,
      icon: cityData.icon,
      timestamp: Date.now(),
      fullData: cityData
    }

    setCachedCities(prev => {
      const updated = [newCity, ...prev].slice(0, 12)
      localStorage.setItem('searchedCitiesCache', JSON.stringify(updated))
      return updated
    })
  }

  // Remove a city from cache
  const removeCityFromCache = (cityId) => {
    setCachedCities(prev => {
      const updated = prev.filter(city => city.id !== cityId)
      if (updated.length === 0) {
        localStorage.removeItem('searchedCitiesCache')
      } else {
        localStorage.setItem('searchedCitiesCache', JSON.stringify(updated))
      }
      return updated
    })
  }

  // Remove expired cities
  useEffect(() => {
    const now = Date.now()
    const nonExpired = cachedCities.filter(city => (city.timestamp + CACHE_DURATION_MS) > now)

    if (nonExpired.length !== cachedCities.length) {
      setCachedCities(nonExpired)
      if (nonExpired.length === 0) {
        localStorage.removeItem('searchedCitiesCache')
      } else {
        localStorage.setItem('searchedCitiesCache', JSON.stringify(nonExpired))
      }
    }
  }, [cachedCities])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addCityToCache,
    removeCityFromCache,
    getCache: () => cachedCities,
    clearCache: () => {
      setCachedCities([])
      localStorage.removeItem('searchedCitiesCache')
    }
  }))

  return (
    <AnimatePresence>
      {cachedCities.length > 0 && (
        <motion.div
          key="cache-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mt-6 bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Recently Searched (Cached)</h3>
            <span className="text-xs text-slate-400 ml-auto">{cachedCities.length} cities</span>
          </div>

          {/* City Cards Grid - Small and Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <AnimatePresence>
              {cachedCities.map((city) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group cursor-pointer"
                >
                  {/* Card */}
                  <div
                    onClick={() => onSelectCity?.(city.fullData)}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-lg p-2 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-105"
                  >
                    {/* Weather Icon & Temp */}
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-lg">{city.icon}</span>
                      <span className="text-xs font-bold text-blue-300">{Math.round(city.temp)}°C</span>
                    </div>

                    {/* City Name */}
                    <p className="text-xs font-semibold text-slate-100 truncate">{city.name}</p>
                    <p className="text-xs text-slate-400 truncate">{city.country}</p>

                    {/* Condition */}
                    <p className="text-xs text-slate-300 mt-1 line-clamp-1">{city.condition}</p>

                    {/* Time Left & Humidity/Wind Mini */}
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-yellow-300 font-mono">{timeLeft[city.id]}</span>
                      <div className="flex gap-1">
                        <span title={`Humidity ${city.humidity}%`}>💧{city.humidity}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button - Visible on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCityFromCache(city.id)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="Remove from cache"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Info Text */}
          <p className="text-xs text-slate-400 mt-3 text-center">
            💡 Click any city to load its weather • Cache expires in 30 minutes
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

SearchedCitiesCacheComponent.displayName = 'SearchedCitiesCache'

// Hook to manage cached cities
export function useSearchedCitiesCache() {
  const cacheRef = React.useRef(null)

  const addCity = (cityData) => {
    cacheRef.current?.addCity?.(cityData)
  }

  const getCache = () => {
    const stored = localStorage.getItem('searchedCitiesCache')
    return stored ? JSON.parse(stored) : []
  }

  const clearCache = () => {
    localStorage.removeItem('searchedCitiesCache')
  }

  return { addCity, getCache, clearCache, cacheRef }
}

export default SearchedCitiesCacheComponent
