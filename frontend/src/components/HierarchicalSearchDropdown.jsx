import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronRight } from 'lucide-react'

const WEATHER_OPTIONS = [
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

export default function HierarchicalSearchDropdown({
  isOpen,
  onClose,
  onSelectLocation,
  weatherService,
}) {
  const [stage, setStage] = useState('countries') // 'countries', 'states', 'weather', 'cities'
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryName, setSelectedCountryName] = useState('')
  const [states, setStates] = useState([])
  const [selectedState, setSelectedState] = useState(null)
  const [selectedStateName, setSelectedStateName] = useState('')
  const [selectedWeather, setSelectedWeather] = useState('all')
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [weatherCache, setWeatherCache] = useState({})

  const containerRef = useRef(null)

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setIsLoading(true)
        const results = await weatherService.searchLocationsByCategory('', 'country')
        const uniqueCountries = []
        const countryNames = new Set()

        results.forEach((result) => {
          if (result.country && !countryNames.has(result.country)) {
            countryNames.add(result.country)
            uniqueCountries.push({
              name: result.country,
              id: result.country.toLowerCase().replace(/\s+/g, '-'),
            })
          }
        })

        setCountries(uniqueCountries.sort((a, b) => a.name.localeCompare(b.name)))
      } catch (error) {
        console.error('Error loading countries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && stage === 'countries') {
      loadCountries()
    }
  }, [isOpen, stage, weatherService])

  // Load states for selected country
  useEffect(() => {
    const loadStates = async () => {
      if (!selectedCountry) return

      try {
        setIsLoading(true)
        const results = await weatherService.searchLocationsByCategory(
          selectedCountryName,
          'state'
        )
        const uniqueStates = []
        const stateNames = new Set()

        results.forEach((result) => {
          if (result.region && !stateNames.has(result.region)) {
            stateNames.add(result.region)
            uniqueStates.push({
              name: result.region,
              id: result.region.toLowerCase().replace(/\s+/g, '-'),
            })
          }
        })

        setStates(uniqueStates.sort((a, b) => a.name.localeCompare(b.name)))
      } catch (error) {
        console.error('Error loading states:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (stage === 'states') {
      loadStates()
    }
  }, [stage, selectedCountry, selectedCountryName, weatherService])

  // Load cities for selected state and weather
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedState || !selectedCountry) return

      try {
        setIsLoading(true)

        // Check cache first
        const cacheKey = `${selectedCountryName}-${selectedStateName}-${selectedWeather}`
        if (weatherCache[cacheKey]) {
          setCities(weatherCache[cacheKey])
          return
        }

        const results = await weatherService.searchLocationsByCategory(
          selectedStateName,
          'city'
        )

        let filtered = results
        if (selectedWeather !== 'all') {
          filtered = await Promise.all(
            results.map(async (city) => {
              try {
                const weather = await weatherService.fetchWeatherForCity(city.name)
                const matchesWeather = checkWeatherMatch(weather, selectedWeather)
                return matchesWeather ? city : null
              } catch {
                return null
              }
            })
          )
          filtered = filtered.filter(Boolean)
        }

        setCities(filtered)

        // Cache the results
        setWeatherCache((prev) => ({
          ...prev,
          [cacheKey]: filtered,
        }))
      } catch (error) {
        console.error('Error loading cities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (stage === 'cities') {
      loadCities()
    }
  }, [stage, selectedState, selectedCountry, selectedWeather, selectedCountryName, selectedStateName, weatherService, weatherCache])

  const checkWeatherMatch = (weather, weatherFilter) => {
    const code = weather?.current?.weather_code
    const temp = weather?.current?.temperature_2m || 0

    const weatherMap = {
      sunny: [0, 1],
      partly_cloudy: [2],
      cloudy: [3],
      rainy: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
      thunderstorm: [95, 96, 99],
      snowy: [71, 73, 75, 77, 85, 86],
      foggy: [45, 48],
      windy: [],
      hot: [],
      cold: [],
    }

    if (weatherFilter === 'hot') return temp > 30
    if (weatherFilter === 'cold') return temp < 5
    if (weatherFilter === 'windy') return weather?.current?.wind_speed_10m > 20

    return weatherMap[weatherFilter]?.includes(code) || false
  }

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.id)
    setSelectedCountryName(country.name)
    setStage('states')
    setSelectedState(null)
    setSelectedStateName('')
    setSelectedWeather('all')
  }

  const handleStateSelect = (state) => {
    setSelectedState(state.id)
    setSelectedStateName(state.name)
    setStage('weather')
  }

  const handleWeatherSelect = (weather) => {
    setSelectedWeather(weather.id)
    setStage('cities')
  }

  const handleCitySelect = (city) => {
    const locationName = `${city.name}, ${selectedStateName}, ${selectedCountryName}`
    onSelectLocation({ name: city.name })
    onClose()
  }

  const handleBack = () => {
    if (stage === 'states') {
      setStage('countries')
      setSelectedCountry(null)
      setSelectedCountryName('')
    } else if (stage === 'weather') {
      setStage('states')
      setSelectedState(null)
      setSelectedStateName('')
    } else if (stage === 'cities') {
      setStage('weather')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
      >
        {/* Header with breadcrumb */}
        {stage !== 'countries' && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-400 hover:text-white transition-colors"
              title="Go back"
            >
              ←
            </button>
            <span className="text-xs text-slate-400">
              {stage === 'states' && selectedCountryName}
              {stage === 'weather' && `${selectedCountryName} • ${selectedStateName}`}
              {stage === 'cities' && `${selectedCountryName} • ${selectedStateName}`}
            </span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            Loading...
          </div>
        )}

        {!isLoading && stage === 'countries' && countries.length > 0 && (
          <ul className="max-h-72 overflow-y-auto custom-scrollbar py-1">
            {countries.map((country) => (
              <li key={country.id}>
                <button
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                >
                  <span>{country.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && stage === 'states' && states.length > 0 && (
          <ul className="max-h-72 overflow-y-auto custom-scrollbar py-1">
            {states.map((state) => (
              <li key={state.id}>
                <button
                  type="button"
                  onClick={() => handleStateSelect(state)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                >
                  <span>{state.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && stage === 'weather' && (
          <ul className="max-h-72 overflow-y-auto custom-scrollbar py-1">
            {WEATHER_OPTIONS.map((weather) => (
              <li key={weather.id}>
                <button
                  type="button"
                  onClick={() => handleWeatherSelect(weather)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                    selectedWeather === weather.id
                      ? 'bg-blue-500/15 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{weather.emoji}</span>
                  <span>{weather.label}</span>
                  {selectedWeather === weather.id && (
                    <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && stage === 'cities' && cities.length > 0 && (
          <ul className="max-h-72 overflow-y-auto custom-scrollbar py-1">
            {cities.map((city, i) => (
              <li key={city.id ?? `${city.name}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/60 transition-colors"
                >
                  <span className="font-medium text-white">{city.name}</span>
                  {city.region && (
                    <span className="ml-1.5 text-xs text-slate-400">{city.region}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && cities.length === 0 && stage === 'cities' && (
          <div className="px-4 py-4 text-sm text-slate-500 text-center">
            No cities found matching this weather
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
