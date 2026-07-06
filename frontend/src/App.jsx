import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import CurrentWeather from './components/CurrentWeather'
import QuickAccess from './components/QuickAccess'
import { Plus, Search, Star, History, Cloud } from 'lucide-react'
import { fetchWeatherForCity, fetchWeatherByCoordinates } from './services/weatherService'
import Forecast from './components/Forecast'
import WeatherMap from './components/WeatherMap'
import WeatherRadar from './components/WeatherRadar'
import AirQualityCard from './components/AirQualityCard'
import SunriseSunsetCard from './components/SunriseSunsetCard'
import WindCard from './components/WindCard'
import WeatherAlertsCard from './components/WeatherAlertsCard'
import WeatherStatisticsCard from './components/WeatherStatisticsCard'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SavedLocations from './components/SavedLocations'
import WeatherFilters from './components/WeatherFilters'
import { fetchHistoricalWeather, transformHistoricalToAnalytics } from './services/analyticsService'
import useCitySearchHistory from './hooks/useCitySearchHistory'
import useAppSettings from './hooks/useAppSettings'
import useNotifications from './hooks/useNotifications'
import useFavoriteCity from './hooks/useFavoriteCity'
import SettingsPanel from './components/SettingsPanel'
import NotificationCenter from './components/NotificationCenter'
import HourlyForecast from './components/HourlyForecast'
import HourlyChart from './components/HourlyChart'
import WeatherTimeline from './components/WeatherTimeline'

const DEFAULT_WEATHER_DATA = {
  city: 'San Francisco',
  country: 'United States',
  temp: 18,
  condition: 'Cloudy',
  icon: 'cloudy',
  tempMax: 22,
  tempMin: 14,
  wind: 16,
    humidity: 78,
    desc: 'Overcast clouds with fresh coastal breezes.'
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [weather, setWeather] = useState(DEFAULT_WEATHER_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gpsStatus, setGpsStatus] = useState('idle') // idle | loading | success | denied | unavailable
  const [gpsMessage, setGpsMessage] = useState('')
  const { recentSearches, favorites, addRecentSearch, isFavorite, toggleFavorite } = useCitySearchHistory()
  const { settings, updateSetting, resetSettings, clearRecentSearches, clearNotifications } = useAppSettings()
  const { notifications, addNotification, markAsRead, markAllAsRead, clearNotifications: clearNotificationsState, deleteNotification, unreadCount } = useNotifications()
  const { favoriteCity, setNewFavorite } = useFavoriteCity()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [lastFavoritesCount, setLastFavoritesCount] = useState(favorites.length)
  const [historicalData, setHistoricalData] = useState(null)
  const [lastRefreshTime, setLastRefreshTime] = useState(null)

  useEffect(() => {
    if (favorites.length > lastFavoritesCount) {
      const newFavorite = favorites[0]
      addNotification('location_added', 'Location Saved', `${newFavorite} added to favorites.`)
      setLastFavoritesCount(favorites.length)
    } else if (favorites.length < lastFavoritesCount) {
      addNotification('location_removed', 'Location Removed', 'Location removed from favorites.')
      setLastFavoritesCount(favorites.length)
    }
  }, [favorites, lastFavoritesCount, addNotification])

  const handleSearch = useCallback(async (cityInput) => {
    // Handle both string and object inputs
    let city, latitude, longitude, displayName

    if (typeof cityInput === 'object' && cityInput !== null) {
      // Input is a location object with coordinates from HierarchicalSearch
      latitude = cityInput.latitude
      longitude = cityInput.longitude
      displayName = `${cityInput.name}, ${cityInput.state}, ${cityInput.country}`
      console.log('Searching by coordinates:', { latitude, longitude, displayName })
    } else if (typeof cityInput === 'string') {
      // Input is a city name string from regular search
      city = cityInput.trim()
      if (!city) return
      displayName = city
      console.log('Searching by city name:', city)
    } else {
      return
    }

    setLoading(true)
    setError('')

    try {
      let data
      if (latitude !== undefined && longitude !== undefined) {
        // Use coordinates endpoint
        console.log('Fetching weather using coordinates:', latitude, longitude, displayName)
        data = await fetchWeatherByCoordinates(latitude, longitude, displayName)
      } else {
        // Use city name endpoint
        console.log('Fetching weather using city name:', city)
        data = await fetchWeatherForCity(city)
      }

      setWeather(data)
      setLastRefreshTime(Date.now())
      addRecentSearch(data.city || displayName)
      if (settings.notificationsEnabled) {
        addNotification('city_searched', 'City Searched', `Now viewing weather for ${data.city}.`)
      }

      // Check for rain tomorrow
      if (settings.notificationsEnabled && settings.rainAlertsEnabled && data?.forecast?.[1]?.icon === 'rainy') {
        addNotification('rain_alert', 'Rain Expected Tomorrow', `${data.city} may experience rain tomorrow.`)
      }

      // Check for high temperature
      if (settings.notificationsEnabled && settings.weatherAlertsEnabled && data?.forecast?.[0]?.tempMax > 30) {
        addNotification('temp_alert', 'High Temperature Alert', `${data.city} will reach ${Math.round(data.forecast[0].tempMax)}°.`)
      }
    } catch (err) {
      setError(err.message || 'Unable to load weather data.')
      if (settings.notificationsEnabled && settings.weatherAlertsEnabled) {
        addNotification('api_error', 'Weather API Error', err.message || 'Failed to fetch weather data.')
      }
    } finally {
      setLoading(false)
    }
  }, [addRecentSearch, addNotification, settings])

  useEffect(() => {
    handleSearch('San Francisco')
  }, [handleSearch])

  useEffect(() => {
    if (weather.city) {
      setNewFavorite(weather.city)
      fetchHistoricalWeather(weather.city)
        .then(data => setHistoricalData(data))
        .catch(() => setHistoricalData(null))
    }
  }, [weather.city, setNewFavorite])

  const handleUseCurrentLocation = useCallback(() => {
    if (gpsStatus === 'loading') return

    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable')
      setGpsMessage('Location services are not supported on this device.')
      return
    }

    setGpsStatus('loading')
    setGpsMessage('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLoading(true)
        setError('')

        try {
          const data = await fetchWeatherByCoordinates(
            position.coords.latitude,
            position.coords.longitude
          )
          setWeather(data)
          addRecentSearch(data.city)
          setGpsStatus('success')
          setGpsMessage(`Showing weather for ${data.city}.`)
        } catch (err) {
          setGpsStatus('unavailable')
          setGpsMessage(err.message || 'Unable to load weather for your location.')
        } finally {
          setLoading(false)
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGpsStatus('denied')
          setGpsMessage('Location access was denied. You can still search for any city above.')
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setGpsStatus('unavailable')
          setGpsMessage('Your location could not be determined. Please try again.')
        } else if (geoError.code === geoError.TIMEOUT) {
          setGpsStatus('unavailable')
          setGpsMessage('Location request timed out. Please try again.')
        } else {
          setGpsStatus('unavailable')
          setGpsMessage('Something went wrong while getting your location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [addRecentSearch, gpsStatus])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          setSidebarOpen={setSidebarOpen}
          onSearch={handleSearch}
          onNavigateToFilters={() => setActiveTab('filters')}
          recentSearches={recentSearches}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onUseCurrentLocation={handleUseCurrentLocation}
          gpsStatus={gpsStatus}
          gpsMessage={gpsMessage}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadNotificationCount={unreadCount}
        />

        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onUpdateSetting={updateSetting}
          onResetSettings={resetSettings}
          onClearRecentSearches={clearRecentSearches}
          onClearNotifications={clearNotifications}
          favorites={favorites}
          lastRefreshTime={lastRefreshTime}
        />

        <NotificationCenter
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearNotificationsState}
          onDelete={deleteNotification}
        />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Analytics View */}
          {activeTab === 'analytics' ? (
            <AnalyticsDashboard weatherData={weather} />
          ) : activeTab === 'filters' ? (
            <WeatherFilters onSelectCity={(cityData) => {
              setActiveTab('dashboard')
              handleSearch(cityData)
            }} />
          ) : activeTab === 'saved' ? (
            <SavedLocations onSelectLocation={handleSearch} currentCity={weather.city} />
          ) : activeTab === 'dashboard' ? (
            <div className="space-y-6">
              {/* Top Section: Hero Card + Sidebar Info Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Large Weather Card (Hero) - Span 2 cols on large screen */}
                <div className="lg:col-span-2">
                  <CurrentWeather
                    weatherData={weather}
                    loading={loading}
                    error={error}
                    isFavorite={isFavorite(weather.city)}
                    onAddFavorite={() => toggleFavorite(weather.city)}
                  />
                </div>

                {/* Right side info panel: Quick Access & Recent searches */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between space-y-4 backdrop-blur-md">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Quick Access
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="font-semibold text-sm">Saved Locations</span>
                        <span className="text-xs text-slate-450 font-bold">{favorites.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="font-semibold text-sm">Rain Tomorrow</span>
                        <span className="text-xs text-slate-450">{weather?.forecast?.[1]?.icon === 'rainy' ? 'Yes ⛈️' : 'No ☀️'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="font-semibold text-sm">Favorite City</span>
                        <span className="text-xs text-slate-450">{favorites.length > 0 ? favorites[0] : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="font-semibold text-sm">Monthly Avg</span>
                        <span className="text-xs text-slate-450">{weather?.forecast?.[0] ? Math.round((weather.forecast[0].tempMax + weather.forecast[0].tempMin) / 2) + '°' : '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 5).map((city) => (
                        <button
                          key={city}
                          onClick={() => handleSearch(city)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-800 text-slate-300 hover:text-white transition-all"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                </div>

              </div>
            </div>

              {/* Quick Access Grid Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white tracking-tight">System Quick Access</h2>
                <QuickAccess
                  onSelectCity={handleSearch}
                  onOpenAnalytics={() => setActiveTab('analytics')}
                  onOpenSavedLocations={() => setActiveTab('saved')}
                  currentWeather={weather}
                  favorites={favorites}
                  favoriteCity={favoriteCity}
                  historicalData={historicalData}
                />

                {/* Hourly Forecast Section */}
                <div className="mt-6">
                  <HourlyForecast hourlyForecast={weather.hourlyForecast || []} />
                </div>

                {/* Weather Timeline Section */}
                <div className="mt-6">
                  <WeatherTimeline hourlyForecast={weather.hourlyForecast || []} />
                </div>

                {/* Hourly Chart Section */}
                <div className="mt-6">
                  <HourlyChart hourlyForecast={weather.hourlyForecast || []} />
                </div>

                <div className="mt-6">
                  <Forecast forecast={weather.forecast || []} />
                </div>
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <WeatherMap weatherData={weather} loading={loading} />
                  <WeatherRadar weatherData={weather} loading={loading} />
                </div>
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <AirQualityCard city={weather.city} />
                  <SunriseSunsetCard weatherData={weather} />
                </div>
                <div className="mt-6">
                  <WindCard weatherData={weather} />
                </div>
                <div className="mt-6">
                  <WeatherAlertsCard city={weather.city} />
                </div>
                <div className="mt-6">
                  <WeatherStatisticsCard weatherData={weather} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white capitalize">{activeTab} View</h2>
                <p className="text-sm text-slate-500">Currently in layout design phase. Logic and data will be connected next.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
