import React, { useEffect, useState } from 'react'
import { MapPin, Cloud, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { fetchWeatherForCity } from '../services/weatherService'
import useNotifications from '../hooks/useNotifications'

// Use /api proxy which works for both localhost and ngrok
const BACKEND_URL = "/api"

export default function SavedLocations({ onSelectLocation, currentCity }) {
  const { addNotification } = useNotifications()
  const [savedLocations, setSavedLocations] = useState([])
  const [weatherData, setWeatherData] = useState({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState({})
  const [error, setError] = useState('')

  // Load saved locations on mount
  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${BACKEND_URL}/locations`)
      if (!response.ok) throw new Error('Failed to load locations')
      const locations = await response.json()
      setSavedLocations(Array.isArray(locations) ? locations : [])

      // Fetch weather for each location
      for (const location of (Array.isArray(locations) ? locations : [])) {
        try {
          const weather = await fetchWeatherForCity(location.city_name)
          setWeatherData(prev => ({
            ...prev,
            [location.city_name]: weather
          }))
        } catch (err) {
          console.error(`Failed to fetch weather for ${location.city_name}:`, err)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLocation = async (cityName) => {
    if (!window.confirm(`Delete "${cityName}" and all its historical data?`)) return

    try {
      setDeleting(prev => ({ ...prev, [cityName]: true }))
      const response = await fetch(`${BACKEND_URL}/locations/${encodeURIComponent(cityName)}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete location')

      setSavedLocations(prev => prev.filter(loc => loc.city_name !== cityName))
      setWeatherData(prev => {
        const updated = { ...prev }
        delete updated[cityName]
        return updated
      })
      addNotification('location_removed', 'Location Removed', `${cityName} has been deleted.`)
    } catch (err) {
      setError(`Failed to delete ${cityName}: ${err.message}`)
    } finally {
      setDeleting(prev => ({ ...prev, [cityName]: false }))
    }
  }

  const handleSelectLocation = (cityName) => {
    onSelectLocation?.(cityName)
  }

  if (loading && savedLocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <p className="text-slate-400">Loading saved locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-8 h-8 text-blue-400" />
          Saved Locations
        </h1>
        <button
          onClick={loadLocations}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 border border-blue-500/25 text-blue-400 hover:bg-blue-600/20 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {savedLocations.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-md">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <p className="text-slate-400 mb-2">No saved locations yet</p>
          <p className="text-xs text-slate-500">Search for a city to add it to your saved locations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedLocations.map(location => {
            const weather = weatherData[location.city_name]
            const isCurrentCity = location.city_name === currentCity

            return (
              <div
                key={location.city_name}
                className={`rounded-3xl border backdrop-blur-md p-6 transition-all cursor-pointer group ${
                  isCurrentCity
                    ? 'bg-blue-600/10 border-blue-500/25 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Header with delete button */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{location.city_name}</h3>
                    <p className="text-xs text-slate-500">
                      {weather?.forecast?.[0] ? `${weather.forecast[0].tempMin}° - ${weather.forecast[0].tempMax}°` : 'No data'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(location.city_name)}
                    disabled={deleting[location.city_name]}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Weather info */}
                {weather ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSelectLocation(location.city_name)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700 hover:border-slate-600 transition-all">
                        <div className="flex items-center gap-3">
                          <Cloud className="w-5 h-5 text-sky-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">{weather.condition}</p>
                            <p className="text-xs text-slate-400">{Math.round(weather.temp)}°</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-white">{Math.round(weather.temp)}°</p>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-800/30 text-center">
                        <p className="text-slate-400">Humidity</p>
                        <p className="text-white font-semibold">{weather.humidity}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/30 text-center">
                        <p className="text-slate-400">Wind</p>
                        <p className="text-white font-semibold">{Math.round(weather.wind)} km/h</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-center">
                    <Loader2 className="w-4 h-4 text-slate-500 animate-spin mx-auto" />
                  </div>
                )}

                {isCurrentCity && (
                  <div className="mt-3 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-center">
                    <p className="text-xs font-semibold text-blue-400">Currently Viewing</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
