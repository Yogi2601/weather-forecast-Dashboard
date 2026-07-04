import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Loader2, Search as SearchIcon, Globe } from 'lucide-react'
import { getWeatherDataForLocation } from '../services/weatherService'
import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  searchCountries,
  searchStates,
  searchCities,
} from '../services/LocationService'

const WEATHER_OPTIONS = [
  { id: 'sunny', label: 'Sunny', emoji: '☀️' },
  { id: 'rainy', label: 'Rainy', emoji: '🌧️' },
  { id: 'snowy', label: 'Snowy', emoji: '❄️' },
  { id: 'thunderstorm', label: 'Thunderstorm', emoji: '⛈️' },
  { id: 'foggy', label: 'Foggy', emoji: '🌫️' },
  { id: 'cloudy', label: 'Cloudy', emoji: '☁️' },
  { id: 'windy', label: 'Windy', emoji: '💨' },
  { id: 'hot', label: 'Hot', emoji: '🔥' },
  { id: 'cold', label: 'Cold', emoji: '🥶' },
]

const WMO_WEATHER_MAP = {
  0: '☀️', 1: '☀️', 2: '🤷', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌧️', 53: '🌧️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️', 80: '🌧️', 81: '🌧️',
  82: '🌧️', 85: '❄️', 86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export default function HierarchicalSearch({ isOpen, onClose, onSelectLocation }) {
  // Navigation state machine: 'countries' | 'states' | 'weather' | 'cities'
  const [view, setView] = useState('countries')

  // Navigation history for back button
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedWeather, setSelectedWeather] = useState(null)

  // Search and loading
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Location data from service
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [citiesData, setCitiesData] = useState([])

  // Load countries on mount
  useEffect(() => {
    const countryList = getAllCountries()
    setCountries(countryList)
  }, [])

  // Load states when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setStates([])
      return
    }

    const stateList = getStatesByCountry(selectedCountry.isoCode)
    setStates(stateList)
  }, [selectedCountry])

  // Load cities when weather is selected
  useEffect(() => {
    if (view !== 'cities' || !selectedCountry || !selectedState || !selectedWeather) {
      setCitiesData([])
      return
    }

    const loadCities = async () => {
      try {
        setIsLoading(true)
        setSearch('')

        console.log('\n=== LOADING CITIES ===')
        console.log('Country:', selectedCountry.name, `(${selectedCountry.isoCode})`)
        console.log('State:', selectedState.name, `(${selectedState.isoCode})`)
        console.log('Weather Filter:', selectedWeather)

        // Get all cities in the state from LocationService
        const allCities = getCitiesByState(selectedCountry.isoCode, selectedState.isoCode)

        console.log('1. Cities loaded from LocationService:', allCities?.length || 0)
        if (allCities && allCities.length > 0) {
          console.log('   First 3 cities:', allCities.slice(0, 3).map(c => c.name))
        }

        if (!allCities || allCities.length === 0) {
          console.log('❌ No cities found for this state')
          setCitiesData([])
          setIsLoading(false)
          return
        }

        // Fetch weather for each city and filter
        console.log('2. Fetching weather for cities...')
        const citiesWithWeather = await Promise.all(
          allCities.slice(0, 20).map(async (city) => {
            try {
              const weather = await getWeatherDataForLocation(city.latitude, city.longitude)
              console.log(`   ${city.name}:`, {
                temp: weather?.temperature,
                code: weather?.weather_code,
                windSpeed: weather?.wind_speed,
              })
              return { ...city, weather }
            } catch (err) {
              console.error(`   ❌ Failed to fetch weather for ${city.name}:`, err.message)
              return null
            }
          })
        )

        const successfulCities = citiesWithWeather.filter(Boolean)
        console.log('3. Cities with weather data:', successfulCities.length)

        // Filter cities by matching weather condition
        console.log('4. Filtering by condition:', selectedWeather)
        const filtered = successfulCities.filter(city => {
          const matches = matchesWeatherCondition(city.weather, selectedWeather)
          if (matches) {
            console.log(`   ✅ ${city.name} matches (code: ${city.weather?.weather_code}, temp: ${city.weather?.temperature}°C)`)
          }
          return matches
        })

        console.log('5. Filtered cities:', filtered.length)
        console.log('   Filtered array:', filtered.map(c => c.name))

        setCitiesData(filtered)
      } catch (error) {
        console.error('Error loading cities:', error)
        setCitiesData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCities()
  }, [view, selectedCountry, selectedState, selectedWeather])

  // Weather matching logic
  function matchesWeatherCondition(weather, condition) {
    if (!weather) {
      console.log('   ⚠️ No weather data')
      return false
    }

    const temp = weather.temperature || 0
    const windSpeed = weather.wind_speed || 0
    const code = weather.weather_code
    const rawCondition = weather.condition

    console.log(`     DEBUG: code=${code}, condition="${rawCondition}", temp=${temp}°C, wind=${windSpeed}km/h`)

    let matches = false
    switch (condition) {
      case 'sunny':
        matches = code === 0 || code === 1
        break
      case 'rainy':
        matches = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)
        break
      case 'snowy':
        matches = [71, 73, 75, 77, 85, 86].includes(code)
        break
      case 'thunderstorm':
        matches = [95, 96, 99].includes(code)
        break
      case 'foggy':
        matches = code === 45 || code === 48
        break
      case 'cloudy':
        matches = code === 3
        break
      case 'windy':
        matches = windSpeed > 25
        break
      case 'hot':
        matches = temp >= 32
        break
      case 'cold':
        matches = temp <= 10
        break
      default:
        matches = false
    }

    console.log(`     Result: ${matches ? '✅ MATCH' : '❌ NO MATCH'}`)
    return matches
  }

  // Weather info helpers
  function getWeatherEmoji(code) {
    return WMO_WEATHER_MAP[code] || '🌡️'
  }

  function getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Cloudy',
      45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Heavy drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      85: 'Slight snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
    }
    return descriptions[code] || 'Unknown'
  }

  // Navigation handlers
  function handleSelectCountry(country) {
    setSelectedCountry(country)
    setSelectedState(null)
    setSearch('')
    setView('states')
  }

  function handleSelectState(state) {
    setSelectedState(state)
    setSearch('')
    setView('weather')
  }

  function handleSelectWeather(weather) {
    setSelectedWeather(weather.id)
    setSearch('')
    setView('cities')
  }

  function handleSelectCity(city) {
    if (onSelectLocation) {
      const locationName = `${city.name}, ${selectedState.name}, ${selectedCountry.name}`
      onSelectLocation({ name: locationName })
    }
    onClose()
  }

  function handleBack() {
    setSearch('')

    if (view === 'cities') {
      setSelectedWeather(null)
      setView('weather')
    } else if (view === 'weather') {
      setSelectedState(null)
      setView('states')
    } else if (view === 'states') {
      setSelectedCountry(null)
      setView('countries')
    }
  }

  // Filter data based on current view
  let items = []
  let title = ''
  let showSearch = true
  let showBackButton = false
  let placeholder = ''

  if (view === 'countries') {
    items = search ? searchCountries(search) : countries
    title = 'Countries'
    placeholder = 'Search Country...'
  } else if (view === 'states') {
    items = search ? searchStates(selectedCountry.isoCode, search) : states
    title = `States - ${selectedCountry.name}`
    showBackButton = true
    placeholder = 'Search State...'
  } else if (view === 'weather') {
    items = WEATHER_OPTIONS
    title = `Weather - ${selectedState.name}`
    showBackButton = true
    showSearch = false
  } else if (view === 'cities') {
    items = search ? citiesData.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : citiesData
    const weatherLabel = WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.label || 'Weather'
    title = `${weatherLabel} Cities in ${selectedState.name}`
    showBackButton = true
    placeholder = 'Search City...'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/40 backdrop-blur-md overflow-hidden"
      >
        <div className="w-full max-w-sm flex flex-col h-96">
          {/* Header - Always Visible */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2 flex-shrink-0">
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-white flex-shrink-0"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-slate-200 flex-1 truncate">{title}</h3>
          </div>

          {/* Search Bar - Always Visible (except weather view) */}
          {showSearch && (
            <div className="px-3 py-2 border-b border-slate-800 flex-shrink-0">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Content Area - Animates Between Views */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full gap-2 text-slate-400"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </motion.div>
              )}

              {!isLoading && items.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full text-slate-500 text-sm px-4 text-center"
                >
                  <p>
                    {view === 'cities' ? `No ${WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.label.toLowerCase()} cities found.` : 'No items found'}
                  </p>
                </motion.div>
              )}

              {!isLoading && items.length > 0 && (
                <motion.ul
                  key={view}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="py-1"
                >
                  {/* Countries View */}
                  {view === 'countries' && items.map((country) => (
                    <li key={country.isoCode}>
                      <button
                        type="button"
                        onClick={() => handleSelectCountry(country)}
                        className="w-full px-4 py-2.5 text-left text-sm transition-colors text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <span>{country.name}</span>
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-400 rotate-180" />
                      </button>
                    </li>
                  ))}

                  {/* States View */}
                  {view === 'states' && items.map((state) => (
                    <li key={state.isoCode}>
                      <button
                        type="button"
                        onClick={() => handleSelectState(state)}
                        className="w-full px-4 py-2.5 text-left text-sm transition-colors text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center justify-between group"
                      >
                        <span>{state.name}</span>
                        <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-400 rotate-180" />
                      </button>
                    </li>
                  ))}

                  {/* Weather View */}
                  {view === 'weather' && items.map((weather) => (
                    <li key={weather.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectWeather(weather)}
                        className="w-full px-4 py-2.5 text-left text-sm transition-colors text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center gap-3 group"
                      >
                        <span className="text-lg">{weather.emoji}</span>
                        <span className="flex-1">{weather.label}</span>
                        <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-slate-400 rotate-180" />
                      </button>
                    </li>
                  ))}

                  {/* Cities View */}
                  {view === 'cities' && items.map((city) => (
                    <li key={`${city.name}-${city.latitude}-${city.longitude}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className="w-full px-4 py-2.5 text-left text-sm transition-colors text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-start justify-between gap-2 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{city.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{getWeatherEmoji(city.weather?.weather_code)}</span>
                            <span className="truncate">
                              {Math.round(city.weather?.temperature || 0)}°C • {getWeatherDescription(city.weather?.weather_code)}
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-slate-400 rotate-180 mt-1" />
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
