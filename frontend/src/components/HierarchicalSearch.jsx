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

  // Load cities when state is selected (NOT waiting for weather)
  useEffect(() => {
    if (view !== 'cities' || !selectedCountry || !selectedState) {
      setCitiesData([])
      return
    }

    const loadCities = () => {
      try {
        setIsLoading(true)
        setSearch('')

        console.log('\n=== LOADING CITIES ===')
        console.log('Country:', selectedCountry.name, `(${selectedCountry.isoCode})`)
        console.log('State:', selectedState.name, `(${selectedState.isoCode})`)
        console.log('Weather Filter: DISABLED (not implemented yet)')

        // Get all cities in the state from LocationService
        const allCities = getCitiesByState(selectedCountry.isoCode, selectedState.isoCode)

        console.log('1. Cities loaded from LocationService:', allCities?.length || 0)
        if (allCities && allCities.length > 0) {
          console.log('   First 3 cities:', allCities.slice(0, 3).map(c => c.name))
          console.log('   Last 3 cities:', allCities.slice(-3).map(c => c.name))
        }

        if (!allCities || allCities.length === 0) {
          console.log('❌ No cities found for this state')
          setCitiesData([])
          setIsLoading(false)
          return
        }

        console.log('2. All cities ready for display (no filtering applied)')
        console.log('   Total cities to display:', allCities.length)
        console.log('   Full city list:', allCities.map(c => c.name).join(', '))

        setCitiesData(allCities)
        console.log('3. Cities stored in state:', allCities.length)
      } catch (error) {
        console.error('Error loading cities:', error)
        setCitiesData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCities()
  }, [view, selectedCountry, selectedState])

  // Weather filtering - NOT IMPLEMENTED YET
  // TODO: Implement weather filtering after cities display is working correctly

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
      console.log('City selected:', {
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        state: selectedState.name,
        country: selectedCountry.name,
      })
      // Pass city object with coordinates instead of formatted string
      onSelectLocation({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        state: selectedState.name,
        country: selectedCountry.name,
      })
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
    console.log('COUNTRIES VIEW: Total countries available:', countries.length)
    items = search ? searchCountries(search) : countries
    console.log('  After search filtering:', items.length)
    title = 'Countries'
    placeholder = 'Search Country...'
  } else if (view === 'states') {
    console.log('STATES VIEW: Total states available:', states.length)
    items = search ? searchStates(selectedCountry.isoCode, search) : states
    console.log('  After search filtering:', items.length)
    title = `States - ${selectedCountry.name}`
    showBackButton = true
    placeholder = 'Search State...'
  } else if (view === 'weather') {
    console.log('WEATHER VIEW: Total weather options:', WEATHER_OPTIONS.length)
    items = WEATHER_OPTIONS
    title = `Weather - ${selectedState.name}`
    showBackButton = true
    showSearch = false
  } else if (view === 'cities') {
    console.log('CITIES VIEW DEBUG:')
    console.log('  citiesData length (from state):', citiesData.length)
    console.log('  search term:', search ? `"${search}"` : '(empty)')

    let filtered = citiesData
    if (search) {
      filtered = citiesData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      console.log('  After search filtering:', filtered.length)
    }

    items = filtered
    console.log('  Final items to render:', items.length)

    title = `Cities in ${selectedState.name}`
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
                  {view === 'cities' && items.map((city, index) => (
                    <li key={`${city.name}-${city.latitude}-${city.longitude}`}>
                      <button
                        type="button"
                        onClick={() => {
                          console.log(`Clicked city #${index + 1}: ${city.name}`)
                          handleSelectCity(city)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm transition-colors text-slate-300 hover:bg-slate-800/60 hover:text-white flex items-center justify-between group"
                      >
                        <span>{city.name}</span>
                        <ChevronLeft className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-slate-400 rotate-180" />
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
