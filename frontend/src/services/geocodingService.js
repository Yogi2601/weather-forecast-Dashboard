const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchCities(query) {
  if (!query || !query.trim()) {
    return []
  }

  const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to search cities right now.')
  }

  const data = await response.json()

  return (data.results || []).map((result) => ({
    id: `${result.latitude}-${result.longitude}`,
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
  }))
}
