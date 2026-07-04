import { useCallback, useEffect, useState } from 'react'

const RECENTS_KEY = 'weatherDashboard.recentSearches'
const FAVORITES_KEY = 'weatherDashboard.favoriteCities'
const MAX_RECENTS = 10

function readList(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // the in-memory state still works for the current session.
  }
}

function sameCity(a, b) {
  return a?.trim().toLowerCase() === b?.trim().toLowerCase()
}

export default function useCitySearchHistory() {
  const [recentSearches, setRecentSearches] = useState(() => readList(RECENTS_KEY))
  const [favorites, setFavorites] = useState(() => readList(FAVORITES_KEY))

  useEffect(() => {
    writeList(RECENTS_KEY, recentSearches)
  }, [recentSearches])

  useEffect(() => {
    writeList(FAVORITES_KEY, favorites)
  }, [favorites])

  const addRecentSearch = useCallback((cityName) => {
    if (!cityName?.trim()) return

    setRecentSearches((prev) => {
      const withoutDuplicate = prev.filter((c) => !sameCity(c, cityName))
      return [cityName, ...withoutDuplicate].slice(0, MAX_RECENTS)
    })
  }, [])

  const isFavorite = useCallback(
    (cityName) => favorites.some((c) => sameCity(c, cityName)),
    [favorites]
  )

  const toggleFavorite = useCallback((cityName) => {
    if (!cityName?.trim()) return

    setFavorites((prev) =>
      prev.some((c) => sameCity(c, cityName))
        ? prev.filter((c) => !sameCity(c, cityName))
        : [cityName, ...prev]
    )
  }, [])

  return {
    recentSearches,
    favorites,
    addRecentSearch,
    isFavorite,
    toggleFavorite,
  }
}
