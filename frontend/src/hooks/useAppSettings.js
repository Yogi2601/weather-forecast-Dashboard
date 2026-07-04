import { useCallback, useEffect, useState } from 'react'

const SETTINGS_KEY = 'weatherDashboard.settings'

const DEFAULT_SETTINGS = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hpa',
  precipitationUnit: 'mm',
  timeFormat: '24h',
  theme: 'dark',
  animationsEnabled: true,
  defaultCity: 'San Francisco',
  autoRefreshInterval: 30,
  weatherAlertsEnabled: true,
  rainAlertsEnabled: true,
  severeWeatherAlertsEnabled: true,
  notificationsEnabled: true,
}

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable
  }
}

export default function useAppSettings() {
  const [settings, setSettings] = useState(readSettings)

  useEffect(() => {
    writeSettings(settings)
  }, [settings])

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const clearRecentSearches = useCallback(() => {
    try {
      localStorage.removeItem('weatherDashboard.recentSearches')
    } catch {
      // ignore
    }
  }, [])

  const clearNotifications = useCallback(() => {
    try {
      localStorage.removeItem('weatherDashboard.notifications')
    } catch {
      // ignore
    }
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
    clearRecentSearches,
    clearNotifications,
    defaultSettings: DEFAULT_SETTINGS,
  }
}
