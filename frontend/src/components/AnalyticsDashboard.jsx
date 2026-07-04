import React, { useMemo, useEffect, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { transformForecastToAnalytics, fetchHistoricalWeather, transformHistoricalToAnalytics } from '../services/analyticsService'
import AnalyticsCard from './AnalyticsCard'

const WEATHER_ICONS = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⚡',
}

const COLORS = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
}

export default function AnalyticsDashboard({ weatherData = {} }) {
  const [historicalData, setHistoricalData] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (weatherData.city) {
      setLoadingHistory(true)
      fetchHistoricalWeather(weatherData.city)
        .then(data => {
          setHistoricalData(data)
        })
        .catch(err => {
          console.error('Failed to load historical data:', err)
          setHistoricalData(null)
        })
        .finally(() => {
          setLoadingHistory(false)
        })
    }
  }, [weatherData.city])

  const analytics = useMemo(() => {
    return transformForecastToAnalytics(weatherData.forecast, weatherData.hourlyForecast)
  }, [weatherData.forecast, weatherData.hourlyForecast])

  const historical = useMemo(() => {
    return transformHistoricalToAnalytics(historicalData)
  }, [historicalData])

  if (!analytics.temperature || analytics.temperature.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">No forecast data available</p>
      </div>
    )
  }

  const tempData = analytics.temperature.map((day, i) => ({
    date: day.date,
    max: day.max,
    min: day.min,
    avg: day.avg,
  }))

  const humidityData = analytics.dates.map((date, i) => ({
    date,
    humidity: analytics.humidity[i] || 0,
  }))

  const windData = analytics.dates.map((date, i) => ({
    date,
    speed: analytics.windSpeed[i] || 0,
  }))

  const weatherDistribution = Object.entries(analytics.weatherConditionCounts)
    .filter(([_, count]) => count > 0)
    .map(([condition, count]) => ({
      name: condition.charAt(0).toUpperCase() + condition.slice(1),
      value: count,
      icon: WEATHER_ICONS[condition] || '❓',
    }))

  const tempStats = [
    { label: 'Max', value: `${Math.max(...analytics.temperature.map(t => t.max))}°C` },
    { label: 'Avg', value: `${Math.round(analytics.temperature.reduce((sum, t) => sum + t.avg, 0) / analytics.temperature.length)}°C` },
  ]

  const humidityStats = [
    { label: 'Avg', value: `${Math.round(analytics.humidity.reduce((a, b) => a + b, 0) / analytics.humidity.length)}%` },
  ]

  const windStats = [
    { label: 'Avg', value: `${Math.round(analytics.windSpeed.reduce((a, b) => a + b, 0) / analytics.windSpeed.length)} km/h` },
  ]

  const historicalTempStats = historical.statistics.highest && historical.statistics.lowest ? [
    { label: 'Highest', value: `${historical.statistics.highest}°C` },
    { label: 'Lowest', value: `${historical.statistics.lowest}°C` },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{weatherData.city} Analytics</h1>
        <p className="text-sm text-slate-400">7-Day Forecast</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <AnalyticsCard
          title="Temperature Trend"
          stats={tempStats}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="max"
                stroke={COLORS.danger}
                dot={{ fill: COLORS.danger, r: 4 }}
                activeDot={{ r: 6 }}
                name="Max"
              />
              <Line
                type="monotone"
                dataKey="min"
                stroke={COLORS.secondary}
                dot={{ fill: COLORS.secondary, r: 4 }}
                activeDot={{ r: 6 }}
                name="Min"
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke={COLORS.primary}
                dot={{ fill: COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
                name="Avg"
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Humidity Trend */}
        <AnalyticsCard
          title="Humidity Levels"
          stats={humidityStats}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.2}
                name="Humidity (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Wind Speed */}
        <AnalyticsCard
          title="Wind Speed Pattern"
          stats={windStats}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={windData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar
                dataKey="speed"
                fill={COLORS.accent}
                radius={[8, 8, 0, 0]}
                name="Speed (km/h)"
              />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {/* Weather Distribution */}
        <AnalyticsCard
          title="Weather Condition Distribution"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={weatherDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, icon }) => `${icon} ${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {weatherDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={[COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success, COLORS.danger][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      {loadingHistory ? (
        <div className="text-center py-8 text-slate-400">Loading historical data...</div>
      ) : historical.historicalTemperature.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold text-white mt-8">Historical Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Temperature Chart */}
            <AnalyticsCard
              title="Historical Temperature (1 Year)"
              stats={historicalTempStats}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historical.historicalTemperature}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke={COLORS.danger}
                    dot={false}
                    isAnimationActive={false}
                    name="Max"
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke={COLORS.secondary}
                    dot={false}
                    isAnimationActive={false}
                    name="Min"
                  />
                </LineChart>
              </ResponsiveContainer>
            </AnalyticsCard>

            {/* Monthly Average Temperature */}
            <AnalyticsCard
              title="Monthly Average Temperature"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(historical.monthlyAverages).map(([month, avg]) => ({ month, avg }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar
                    dataKey="avg"
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
                    name="Avg Temp (°C)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </AnalyticsCard>
          </div>
        </>
      ) : null}
    </div>
  )
}
