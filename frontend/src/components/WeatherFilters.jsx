import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2, X } from 'lucide-react'
import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
} from '../services/LocationService'

const WEATHER_CONDITIONS = [
  { id: 'sunny', label: 'Sunny', emoji: '☀️', codes: [0, 1] },
  { id: 'partly-cloudy', label: 'Partly Cloudy', emoji: '🌤️', codes: [2] },
  { id: 'cloudy', label: 'Cloudy', emoji: '☁️', codes: [3] },
  { id: 'rainy', label: 'Rain', emoji: '🌧️', codes: [51, 53, 55, 61, 63, 65, 80, 81, 82] },
  { id: 'thunderstorm', label: 'Thunderstorm', emoji: '⛈️', codes: [95, 96, 99] },
  { id: 'snow', label: 'Snow', emoji: '🌨️', codes: [71, 73, 75, 77, 85, 86] },
  { id: 'fog', label: 'Fog', emoji: '🌫️', codes: [45, 48] },
  { id: 'drizzle', label: 'Drizzle', emoji: '🌦️', codes: [51, 53, 55] },
  { id: 'freezing', label: 'Freezing', emoji: '❄️', codes: [71, 73, 75, 77] },
]

// Open-Meteo weather code to icon mapping
const WEATHER_CODE_TO_ICON = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌧️', 81: '🌧️', 82: '🌧️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

const WEATHER_CODE_TO_LABEL = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
}

function Dropdown({ label, value, onChange, options, isLoading, isSearchable = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const searchInputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredOptions = useMemo(() => {
    if (!searchInput.trim()) return options
    const term = searchInput.toLowerCase()
    return options.filter(opt => opt.name.toLowerCase().includes(term))
  }, [options, searchInput])

  const displayValue = useMemo(() => {
    if (!value) return label
    const selected = options.find(opt => opt.isoCode === value)
    return selected?.name || label
  }, [value, options, label])

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : filteredOptions.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // If a specific option is highlighted, select it
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex])
        setIsOpen(false)
        setSearchInput('')
        setHighlightedIndex(-1)
      }
      // If only one option matches the search, select it
      else if (filteredOptions.length === 1) {
        onChange(filteredOptions[0])
        setIsOpen(false)
        setSearchInput('')
        setHighlightedIndex(-1)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setSearchInput('')
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPosition({
              top: rect.bottom + window.scrollY + 8,
              left: rect.left + window.scrollX,
              width: rect.width
            })
          }
          setIsOpen(!isOpen)
          if (!isOpen) setHighlightedIndex(0)
        }}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-200 hover:border-slate-600 transition-colors focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25"
      >
        <span className="text-sm font-medium truncate">{displayValue}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: '300px'
            }}
          >
            {isSearchable && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search and press Enter to select..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  // Automatically highlight first matching option when typing
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-4 py-2 bg-slate-900/50 border-b border-slate-700 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500/25"
              />
            )}

            <div className="overflow-y-auto max-h-64" ref={listRef}>
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm">No options found</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.isoCode}
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                      setSearchInput('')
                      setHighlightedIndex(-1)
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      highlightedIndex === index
                        ? 'bg-blue-500/25 text-white'
                        : value === option.isoCode
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    {option.name}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WeatherConditionCard({ condition, isSelected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isSelected && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
          initial={false}
          transition={{ duration: 0.2 }}
        />
      )}

      <div className="flex flex-col items-center gap-2">
        <motion.span
          className="text-3xl"
          animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {condition.emoji}
        </motion.span>
        <span className="text-xs font-semibold text-slate-200 text-center leading-tight">{condition.label}</span>
      </div>

      {isSelected && (
        <motion.div
          className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        />
      )}
    </motion.button>
  )
}

function CityCard({ city, index, onSelect, weatherCode }) {
  // Get weather-specific animations based on weather code
  const getWeatherAnimation = () => {
    if ([95, 96, 99].includes(weatherCode)) {
      // Thunderstorm - shake effect
      return {
        animate: { y: [0, -2, 0] },
        transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
      }
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      // Rain - gentle float
      return {
        animate: { y: [0, -4, 0] },
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
      }
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      // Snow - slow float
      return {
        animate: { y: [0, -3, 0] },
        transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
      }
    }
    // Default sunny - subtle bounce
    return {
      animate: { y: [0, -2, 0] },
      transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
    }
  }

  const weatherAnim = getWeatherAnimation()

  return (
    <motion.div
      key={`${city.name}-${city.latitude}-${city.longitude}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group cursor-pointer h-full"
      onClick={() => onSelect(city)}
    >
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-md hover:border-blue-500/30 hover:from-slate-800/70 hover:to-slate-900/70 transition-all h-full flex flex-col shadow-lg hover:shadow-blue-500/10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{city.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{city.condition}</p>
          </div>
          <motion.div
            className="text-4xl shrink-0 ml-2"
            initial={{ scale: 1 }}
            {...weatherAnim}
          >
            {city.icon || '🌡️'}
          </motion.div>
        </div>

        {/* Temperature Display */}
        <div className="bg-slate-900/40 rounded-xl p-4 mb-4">
          <div className="text-3xl font-bold text-white">{Math.round(city.temp)}°C</div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Humidity</span>
            <span className="font-semibold text-slate-200">{city.humidity}%</span>
          </div>
          <div className="h-px bg-slate-800/50" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Wind</span>
            <span className="font-semibold text-slate-200">{Math.round(city.wind_speed)} km/h</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(city)
          }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 group-hover:from-blue-500 group-hover:to-blue-400"
        >
          View Details
        </button>
      </div>
    </motion.div>
  )
}

function CityResultsModal({ cities, isOpen, onClose, onSelectCity, selectedCountry, selectedState, isLoading, onReset }) {
  if (!isOpen) return null

  const handleCitySelect = (city) => {
    onSelectCity?.(city)
    onClose()
  }

  const handleNewSearch = () => {
    onClose()
    onReset?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/98 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden backdrop-blur-xl flex flex-col shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 border-b border-slate-800 px-8 py-6 flex items-center justify-between shrink-0 gap-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                        Loading Cities...
                      </span>
                    ) : (
                      `${cities.length} Cities Found`
                    )}
                  </h2>
                  {selectedState && selectedCountry && (
                    <p className="text-sm text-slate-400 mt-2">{selectedState.name}, {selectedCountry.name}</p>
                  )}
                </div>
                {!isLoading && cities.length > 0 && (
                  <button
                    onClick={handleNewSearch}
                    className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
                  >
                    New Search
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-8 py-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                      <p className="text-slate-300">Fetching city weather data...</p>
                    </div>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-slate-400 text-lg mb-2">No cities found matching your criteria.</p>
                    <p className="text-slate-500 text-sm">Try selecting a different weather condition.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cities.map((city, index) => (
                      <CityCard
                        key={`${city.name}-${city.latitude}-${city.longitude}-${index}`}
                        city={city}
                        index={index}
                        onSelect={handleCitySelect}
                        weatherCode={city.weather_code}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function WeatherFilters({ onSelectCity }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedWeather, setSelectedWeather] = useState(null)

  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])

  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const countryList = getAllCountries()
        setCountries(countryList)
      } catch (error) {
        console.error('Error loading countries:', error)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    loadCountries()
  }, [])

  useEffect(() => {
    if (!selectedCountry) {
      setStates([])
      setSelectedState(null)
      return
    }

    setIsLoadingStates(true)
    try {
      const stateList = getStatesByCountry(selectedCountry.isoCode)
      setStates(stateList)
    } catch (error) {
      console.error('Error loading states:', error)
      setStates([])
    } finally {
      setIsLoadingStates(false)
    }
  }, [selectedCountry])

  const fetchWeatherFromOpenMeteo = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=auto`
      )
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Error fetching from Open-Meteo:', error)
      return null
    }
  }, [])

  const handleFindCities = useCallback(async () => {
    if (!selectedCountry || !selectedState) {
      alert('Please select a country and state')
      return
    }

    setIsSearching(true)
    setShowResults(true)
    setSearchResults([])

    try {
      const cityList = getCitiesByState(selectedCountry.isoCode, selectedState.isoCode)

      // If no weather filter, show all cities quickly without fetching weather
      if (!selectedWeather) {
        const basicCities = cityList.slice(0, 50).map(city => ({
          ...city,
          temp: 0,
          humidity: 0,
          wind_speed: 0,
          condition: 'Loading...',
          icon: '🌡️',
          weather_code: 0,
        }))
        setSearchResults(basicCities)
        setIsSearching(false)
        return
      }

      // Filter by weather condition using Open-Meteo API (much faster)
      const BATCH_SIZE = 15
      let results = []
      const selectedWeatherCodes = WEATHER_CONDITIONS.find(w => w.id === selectedWeather)?.codes || []

      for (let i = 0; i < cityList.length; i += BATCH_SIZE) {
        const batch = cityList.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map(async (city) => {
            try {
              const data = await fetchWeatherFromOpenMeteo(city.latitude, city.longitude)
              if (!data?.current) return null

              const weatherCode = data.current.weather_code
              if (selectedWeatherCodes.includes(weatherCode)) {
                return {
                  ...city,
                  temp: data.current.temperature_2m || 0,
                  humidity: data.current.relative_humidity_2m || 0,
                  wind_speed: data.current.wind_speed_10m || 0,
                  weather_code: weatherCode,
                  condition: WEATHER_CODE_TO_LABEL[weatherCode] || 'Unknown',
                  icon: WEATHER_CODE_TO_ICON[weatherCode] || '🌡️',
                }
              }
              return null
            } catch (error) {
              console.error(`Error fetching weather for ${city.name}:`, error)
              return null
            }
          })
        )
        results = results.concat(batchResults.filter(Boolean))
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching cities:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedCountry, selectedState, selectedWeather, fetchWeatherFromOpenMeteo])

  const resetFilters = useCallback(() => {
    setSelectedCountry(null)
    setSelectedState(null)
    setSelectedWeather(null)
    setSearchResults([])
    setShowResults(false)
  }, [])

  const handleSelectCity = useCallback((cityData) => {
    setShowResults(false)

    const cityObject = {
      name: cityData.name,
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      state: selectedState?.name || '',
      country: selectedCountry?.name || '',
    }

    // Reset filters after selection
    resetFilters()
    onSelectCity?.(cityObject)
  }, [onSelectCity, selectedCountry, selectedState, resetFilters])

  return (
    <div className="space-y-6 pb-12">
      {/* Location Filters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md relative z-0">
        <h2 className="text-lg font-bold text-white mb-6">Location</h2>
        <div className="space-y-4 relative">
          <Dropdown
            label="Select Country"
            value={selectedCountry?.isoCode}
            onChange={(country) => setSelectedCountry(country)}
            options={countries}
            isLoading={isLoadingCountries}
            isSearchable={true}
          />

          {selectedCountry && (
            <Dropdown
              label="Select State"
              value={selectedState?.isoCode}
              onChange={(state) => setSelectedState(state)}
              options={states}
              isLoading={isLoadingStates}
              isSearchable={true}
            />
          )}
        </div>
      </div>

      {/* Weather Condition Filters - Only show after country+state selected */}
      {selectedCountry && selectedState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Weather Condition (Optional)</h2>
            <div className="flex items-center gap-2">
              {selectedWeather && (
                <button
                  onClick={() => setSelectedWeather(null)}
                  className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedState(null)
                  setSelectedWeather(null)
                }}
                className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1"
              >
                ← Back
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {WEATHER_CONDITIONS.map(condition => (
              <WeatherConditionCard
                key={condition.id}
                condition={condition}
                isSelected={selectedWeather === condition.id}
                onClick={() => setSelectedWeather(selectedWeather === condition.id ? null : condition.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Find Cities Button */}
      {selectedCountry && selectedState && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedState(null)
              setSelectedWeather(null)
            }}
            className="px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200"
          >
            ← Back
          </button>
          <button
            onClick={handleFindCities}
            disabled={isSearching}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
              isSearching
                ? 'bg-blue-600/30 text-blue-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isSearching ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </span>
            ) : (
              'Find Cities'
            )}
          </button>
        </div>
      )}

      {/* City Results Modal - Fixed positioning and z-index */}
      <CityResultsModal
        cities={searchResults}
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        onSelectCity={handleSelectCity}
        onReset={resetFilters}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        isLoading={isSearching}
      />
    </div>
  )
}
