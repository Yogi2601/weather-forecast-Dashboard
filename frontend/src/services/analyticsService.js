// Use /api proxy which works for both localhost and ngrok
const BACKEND_URL = "/api"

export async function fetchHistoricalWeather(city) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/weather-history/${encodeURIComponent(city)}`
    )
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch historical weather:', err)
    return null
  }
}

export function transformForecastToAnalytics(forecast = [], hourlyForecast = []) {
  if (!forecast || forecast.length === 0) {
    return {
      temperature: [],
      dates: [],
      weatherConditionCounts: { clear: 0, cloudy: 0, rainy: 0, snowy: 0, stormy: 0 },
    }
  }

  const temperature = forecast.map(day => ({
    date: formatDate(day.label),
    max: day.tempMax,
    min: day.tempMin,
    avg: Math.round((day.tempMax + day.tempMin) / 2),
  }))

  const dates = forecast.map(day => formatDate(day.label))

  const weatherConditionCounts = forecast.reduce(
    (acc, day) => {
      const icon = day.icon
      acc[icon] = (acc[icon] || 0) + 1
      return acc
    },
    { clear: 0, cloudy: 0, rainy: 0, snowy: 0, stormy: 0 }
  )

  const humidity = extractHourlyData(hourlyForecast, 'humidity', forecast.length)
  const windSpeed = extractHourlyData(hourlyForecast, 'windSpeed', forecast.length)

  return {
    temperature,
    dates,
    weatherConditionCounts,
    humidity,
    windSpeed,
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function extractHourlyData(hourlyForecast = [], field, days) {
  const hoursPerDay = Math.ceil(hourlyForecast.length / days)
  const dailyAverages = []

  for (let i = 0; i < days; i++) {
    const dayStart = i * hoursPerDay
    const dayEnd = Math.min((i + 1) * hoursPerDay, hourlyForecast.length)
    const dayData = hourlyForecast.slice(dayStart, dayEnd)

    if (dayData.length > 0) {
      const values = dayData
        .map(h => h[field])
        .filter(v => v !== undefined && v !== null)
      const avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
      dailyAverages.push(avg)
    }
  }

  return dailyAverages
}

export function transformHistoricalToAnalytics(historicalData = null) {
  if (!historicalData || !historicalData.data || historicalData.data.length === 0) {
    return {
      historicalTemperature: [],
      monthlyAverages: {},
      statistics: {},
    }
  }

  const records = historicalData.data
  const stats = historicalData.statistics || {}

  const historicalTemperature = records.map(record => ({
    date: formatDate(record.date),
    max: record.temp_max,
    min: record.temp_min,
  }))

  const monthlyAverages = calculateMonthlyAverages(records)

  return {
    historicalTemperature,
    monthlyAverages,
    statistics: {
      highest: stats.highest_temperature,
      lowest: stats.lowest_temperature,
      average: stats.average_temperature,
    },
  }
}

function calculateMonthlyAverages(records = []) {
  const monthMap = {}

  records.forEach(record => {
    const date = new Date(record.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { temps: [], label: getMonthLabel(date) }
    }

    if (record.temp_max) {
      monthMap[monthKey].temps.push(record.temp_max)
    }
  })

  const monthlyAverages = {}
  Object.entries(monthMap).forEach(([key, data]) => {
    monthlyAverages[data.label] = Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length)
  })

  return monthlyAverages
}

function getMonthLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}
