import { useCallback, useEffect, useState } from 'react'

const FAVORITE_CITY_KEY = 'weatherDashboard.favoriteCity'

function readFavoriteCity() {
  try {
    const raw = localStorage.getItem(FAVORITE_CITY_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeFavoriteCity(city) {
  try {
    localStorage.setItem(FAVORITE_CITY_KEY, JSON.stringify(city))
  } catch {
    // localStorage unavailable
  }
}

export default function useFavoriteCity() {
  const [favoriteCity, setFavoriteCity] = useState(readFavoriteCity)

  useEffect(() => {
    writeFavoriteCity(favoriteCity)
  }, [favoriteCity])

  const setNewFavorite = useCallback((city) => {
    if (!city?.trim()) return
    setFavoriteCity(city)
  }, [])

  return { favoriteCity, setNewFavorite }
}
