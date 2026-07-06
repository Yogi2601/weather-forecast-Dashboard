import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2, Wind, X } from 'lucide-react'
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

const AIR_QUALITY_LEVELS = [
  { id: 'excellent', label: 'Excellent', color: 'bg-emerald-500/20 border-emerald-500/30' },
  { id: 'good', label: 'Good', color: 'bg-blue-500/20 border-blue-500/30' },
  { id: 'moderate', label: 'Moderate', color: 'bg-yellow-500/20 border-yellow-500/30' },
  { id: 'poor', label: 'Poor', color: 'bg-red-500/20 border-red-500/30' },
]

const VISIBILITY_LEVELS = [
  { id: 'high', label: 'High', range: [8, 10] },
  { id: 'medium', label: 'Medium', range: [4, 8] },
  { id: 'low', label: 'Low', range: [0, 4] },
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

function RangeSlider({ label, minValue, maxValue, onMinChange, onMaxChange, min = 0, max = 100, unit = '' }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Min</span>
            <span className="text-sm font-bold text-blue-400">{minValue}{unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={minValue}
            onChange={(e) => onMinChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Max</span>
            <span className="text-sm font-bold text-blue-400">{maxValue}{unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={maxValue}
            onChange={(e) => onMaxChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
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

export default function WeatherFilters({ onSelectCity }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedWeather, setSelectedWeather] = useState(null)
  const [selectedAirQuality, setSelectedAirQuality] = useState(null)
  const [selectedVisibility, setSelectedVisibility] = useState(null)

  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  const [tempMin, setTempMin] = useState(-30)
  const [tempMax, setTempMax] = useState(50)
  const [humidityMin, setHumidityMin] = useState(0)
  const [humidityMax, setHumidityMax] = useState(100)
  const [windSpeedMin, setWindSpeedMin] = useState(0)
  const [windSpeedMax, setWindSpeedMax] = useState(50)
  const [uvIndexMin, setUvIndexMin] = useState(0)
  const [uvIndexMax, setUvIndexMax] = useState(11)
  const [rainProbability, setRainProbability] = useState(50)

  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

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
      setCities([])
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

  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCities([])
      return
    }

    setIsLoadingCities(true)
    try {
      const cityList = getCitiesByState(selectedCountry.isoCode, selectedState.isoCode)
      setCities(cityList)
    } catch (error) {
      console.error('Error loading cities:', error)
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }, [selectedCountry, selectedState])

  const handleFindCities = useCallback(async () => {
    if (!selectedCountry || !selectedState) {
      alert('Please select a country and state')
      return
    }

    setIsSearching(true)
    setSearchResults([])

    try {
      const cityList = getCitiesByState(selectedCountry.isoCode, selectedState.isoCode)
      let results = []

      const fetchCityWeather = async (city) => {
        try {
          const rawResponse = await fetch(`/api/weather/coords/${city.latitude}/${city.longitude}`)
          if (!rawResponse.ok) throw new Error('Failed to fetch weather')
          const data = await rawResponse.json()

          const weatherWithCodes = {
            ...city,
            temp: data.current?.temperature_2m || 0,
            feels_like: data.current?.apparent_temperature || 0,
            humidity: data.current?.relative_humidity_2m || 0,
            wind_speed: data.current?.wind_speed_10m || 0,
            weather_code: data.current?.weather_code || 0,
            condition: data.current?.condition || 'Unknown',
            icon: data.current?.icon || '🌡️',
            uv_index: data.current?.uv_index || 0,
            visibility: (data.current?.visibility || 0) / 1000,
            rain_probability: 0,
            aqi: 'Good',
          }
          return {
            ...weatherWithCodes,
            matchesFilters: matchesAllFilters(weatherWithCodes),
          }
        } catch (error) {
          console.error(`Error fetching weather for ${city.name}:`, error)
          return null
        }
      }

      const weatherData = await Promise.all(cityList.map(fetchCityWeather))
      results = weatherData.filter(Boolean).filter(r => r.matchesFilters)

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching cities:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedCountry, selectedState])

  const matchesAllFilters = useCallback((weather) => {
    if (selectedWeather) {
      const weatherCodes = WEATHER_CONDITIONS.find(w => w.id === selectedWeather)?.codes || []
      if (!weatherCodes.includes(weather.weather_code)) return false
    }

    if (weather.temp < tempMin || weather.temp > tempMax) return false
    if (weather.humidity < humidityMin || weather.humidity > humidityMax) return false
    if (weather.wind_speed < windSpeedMin || weather.wind_speed > windSpeedMax) return false
    if (weather.uv_index < uvIndexMin || weather.uv_index > uvIndexMax) return false
    if (weather.rain_probability && weather.rain_probability < rainProbability) return false

    if (selectedAirQuality && weather.aqi !== selectedAirQuality) return false

    if (selectedVisibility) {
      const visibilityLevel = VISIBILITY_LEVELS.find(v => v.id === selectedVisibility)
      const [min, max] = visibilityLevel.range
      if (!weather.visibility || weather.visibility < min || weather.visibility > max) return false
    }

    return true
  }, [selectedWeather, tempMin, tempMax, humidityMin, humidityMax, windSpeedMin, windSpeedMax, uvIndexMin, uvIndexMax, rainProbability, selectedAirQuality, selectedVisibility])

  return (
    <div className="space-y-6 pb-12">
      {/* Section 1: Location Filters */}
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

      {/* Section 2: Weather Condition Filters - Only show after country+state selected */}
      {selectedCountry && selectedState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Weather Condition</h2>
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

      {/* Section 3: Extra Weather Filters - Only show after country+state selected */}
      {selectedCountry && selectedState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <h2 className="text-lg font-bold text-white mb-6">Additional Filters</h2>
          <div className="space-y-6">
            <RangeSlider
              label="Temperature Range"
              minValue={tempMin}
              maxValue={tempMax}
              onMinChange={setTempMin}
              onMaxChange={setTempMax}
              min={-30}
              max={50}
              unit="°C"
            />
            <RangeSlider
              label="Humidity Range"
              minValue={humidityMin}
              maxValue={humidityMax}
              onMinChange={setHumidityMin}
              onMaxChange={setHumidityMax}
              min={0}
              max={100}
              unit="%"
            />
            <RangeSlider
              label="Wind Speed Range"
              minValue={windSpeedMin}
              maxValue={windSpeedMax}
              onMinChange={setWindSpeedMin}
              onMaxChange={setWindSpeedMax}
              min={0}
              max={50}
              unit=" km/h"
            />
            <RangeSlider
              label="UV Index Range"
              minValue={uvIndexMin}
              maxValue={uvIndexMax}
              onMinChange={setUvIndexMin}
              onMaxChange={setUvIndexMax}
              min={0}
              max={11}
            />

            <div className="pt-4 border-t border-slate-700">
              <label className="text-sm font-medium text-slate-300 mb-3 block">Air Quality</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AIR_QUALITY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedAirQuality(selectedAirQuality === level.id ? null : level.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedAirQuality === level.id
                        ? `${level.color} border-2`
                        : 'bg-slate-800/40 border border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <label className="text-sm font-medium text-slate-300 mb-3 block">Visibility</label>
              <div className="grid grid-cols-3 gap-2">
                {VISIBILITY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedVisibility(selectedVisibility === level.id ? null : level.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedVisibility === level.id
                        ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-300'
                        : 'bg-slate-800/40 border border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 4: Find Cities Button */}
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

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            {searchResults.length} {searchResults.length === 1 ? 'City' : 'Cities'} Found
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((city, index) => (
              <motion.div
                key={`${city.name}-${city.latitude}-${city.longitude}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md hover:border-slate-700 transition-all group cursor-pointer"
                onClick={() => onSelectCity?.({ name: city.name, latitude: city.latitude, longitude: city.longitude })}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{city.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{selectedState?.name}, {selectedCountry?.name}</p>
                  </div>
                  <motion.span className="text-3xl group-hover:scale-110 transition-transform" whileHover={{ scale: 1.2 }}>
                    {city.icon || '🌡️'}
                  </motion.span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Temperature</span>
                    <span className="text-lg font-bold text-white">{Math.round(city.temp)}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Condition</span>
                    <span className="text-sm font-semibold text-blue-400">{city.condition}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Humidity</span>
                    <span className="text-sm font-semibold text-slate-300">{city.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Wind className="w-3 h-3" /> Wind
                    </span>
                    <span className="text-sm font-semibold text-slate-300">{Math.round(city.wind_speed)} km/h</span>
                  </div>
                  {city.aqi && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Air Quality</span>
                      <span className="text-sm font-semibold text-slate-300">{city.aqi}</span>
                    </div>
                  )}
                  {city.feels_like && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Feels Like</span>
                      <span className="text-sm font-semibold text-slate-300">{Math.round(city.feels_like)}°C</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectCity?.({ name: city.name, latitude: city.latitude, longitude: city.longitude })
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Open
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && isSearching === false && selectedCountry && selectedState && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-md">
          <p className="text-slate-400">No cities match your filters. Try adjusting them.</p>
        </div>
      )}
    </div>
  )
}
