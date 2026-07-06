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

function Dropdown({ label, value, onChange, options, isLoading, isSearchable = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-200 hover:border-slate-600 transition-colors"
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
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {isSearchable && (
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 bg-slate-900/50 border-b border-slate-700 text-sm text-slate-200 placeholder-slate-500 outline-none"
              />
            )}

            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm">No options found</div>
              ) : (
                filteredOptions.map(option => (
                  <button
                    key={option.isoCode}
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                      setSearchInput('')
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      value === option.isoCode
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

function CityResultsModal({ cities, isOpen, onClose, onSelectCity, selectedCountry, selectedState, isLoading }) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-md"
      >
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isLoading ? 'Loading Cities...' : `${cities.length} Cities Found`}
            </h2>
            {selectedState && selectedCountry && (
              <p className="text-sm text-slate-400 mt-1">{selectedState.name}, {selectedCountry.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No cities found matching your criteria.</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your weather filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city, index) => (
                <motion.div
                  key={`${city.name}-${city.latitude}-${city.longitude}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-md hover:border-slate-700 hover:bg-slate-800/60 transition-all group cursor-pointer"
                  onClick={() => onSelectCity?.(city)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{city.name}</h3>
                    </div>
                    <motion.span className="text-2xl group-hover:scale-110 transition-transform">
                      {city.icon || '🌡️'}
                    </motion.span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Temperature</span>
                      <span className="font-semibold text-white">{Math.round(city.temp)}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Condition</span>
                      <span className="text-blue-400 font-semibold">{city.condition}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Humidity</span>
                      <span className="text-slate-300">{city.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Wind</span>
                      <span className="text-slate-300">{Math.round(city.wind_speed)} km/h</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectCity?.(city)
                    }}
                    className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
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

      // If no weather filter, show all cities
      if (!selectedWeather) {
        const basicCities = cityList.map(city => ({
          ...city,
          temp: 0,
          feels_like: 0,
          humidity: 0,
          wind_speed: 0,
          condition: 'Unknown',
          icon: '🌡️',
          weather_code: 0,
        }))
        setSearchResults(basicCities)
        setIsSearching(false)
        return
      }

      // Filter by weather condition - fetch in parallel batches
      const BATCH_SIZE = 10
      let results = []

      for (let i = 0; i < cityList.length; i += BATCH_SIZE) {
        const batch = cityList.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map(async (city) => {
            try {
              const rawResponse = await fetch(`/api/weather/coords/${city.latitude}/${city.longitude}`)
              if (!rawResponse.ok) return null
              const data = await rawResponse.json()

              const weatherCode = data.current?.weather_code || 0
              const selectedWeatherCodes = WEATHER_CONDITIONS.find(w => w.id === selectedWeather)?.codes || []

              if (selectedWeatherCodes.includes(weatherCode)) {
                return {
                  ...city,
                  temp: data.current?.temperature_2m || 0,
                  feels_like: data.current?.apparent_temperature || 0,
                  humidity: data.current?.relative_humidity_2m || 0,
                  wind_speed: data.current?.wind_speed_10m || 0,
                  weather_code: weatherCode,
                  condition: data.current?.condition || 'Unknown',
                  icon: data.current?.icon || '🌡️',
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
  }, [selectedCountry, selectedState, selectedWeather])

  return (
    <div className="space-y-6 pb-12">
      {/* Location Filters */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-6">Location</h2>
        <div className="space-y-4">
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
            {selectedWeather && (
              <button
                onClick={() => setSelectedWeather(null)}
                className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
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

      {/* City Results Modal */}
      <CityResultsModal
        cities={searchResults}
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        onSelectCity={(cityData) => {
          setShowResults(false)
          onSelectCity?.({
            name: cityData.name,
            latitude: cityData.latitude,
            longitude: cityData.longitude
          })
        }}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        isLoading={isSearching}
      />
    </div>
  )
}
