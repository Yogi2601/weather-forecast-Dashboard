import React, { memo, useMemo } from 'react'
import { Heart, CloudRain, Star, CalendarDays, Thermometer } from 'lucide-react'
import { transformHistoricalToAnalytics } from '../services/analyticsService'

export function QuickAccessCard({ children, title, icon: Icon, iconColor = 'text-blue-400', onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-5 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px] hover:border-slate-700/85 hover:bg-slate-900/60 shadow-lg shadow-slate-950/20 w-full text-left"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
          {title}
        </h3>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </button>
  )
}

function QuickAccess({
  onSelectCity,
  onOpenAnalytics,
  onOpenSavedLocations,
  currentWeather = null,
  favorites = [],
  favoriteCity = null,
  historicalData = null,
}) {
  const currentTemp = currentWeather?.temp ?? '--'
  const currentHumidity = currentWeather?.humidity ?? '—'
  const currentWind = currentWeather?.wind ?? '—'

  // Rain calculation for tomorrow (forecast[1])
  const tomorrowForecast = currentWeather?.forecast?.[1]
  const isRainTomorrow = tomorrowForecast?.icon === 'rainy'
  const rainLabel = isRainTomorrow ? 'Rain Expected' : 'No Rain'
  const tomorrowPrecip = tomorrowForecast?.precipitationProbability ?? 0

  // Monthly average from historical data
  const analytics = useMemo(() => {
    return transformHistoricalToAnalytics(historicalData)
  }, [historicalData])

  const monthlyAverages = analytics.monthlyAverages || {}
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const monthlyAverage = monthlyAverages[currentMonth] || Math.round((currentWeather?.tempMax + currentWeather?.tempMin) / 2) || '--'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Saved Locations */}
      <QuickAccessCard
        title="Saved Locations"
        icon={Heart}
        iconColor="text-rose-400"
        onClick={onOpenSavedLocations}
      >
        <div className="space-y-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {favorites.length}
          </div>
          <p className="text-xs text-slate-400">
            {favorites.length === 0
              ? 'Search a city and click Save'
              : favorites.length === 1
                ? '1 location saved'
                : `${favorites.length} locations saved`}
          </p>
        </div>
      </QuickAccessCard>

      {/* Card 2: Rain Tomorrow */}
      <QuickAccessCard
        title="Rain Tomorrow"
        icon={CloudRain}
        iconColor="text-sky-400"
        onClick={() => { /* Forecast is already visible on dashboard */ }}
      >
        <div className="flex flex-col h-full justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold text-white tracking-tight">{rainLabel}</div>
              <span className="text-xs font-semibold text-slate-400 block mt-1">{tomorrowPrecip}% probability</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isRainTomorrow ? 'bg-blue-500/10 border-blue-500/20 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <CloudRain className={`w-8 h-8 ${isRainTomorrow ? 'text-blue-400' : 'text-emerald-400'}`} />
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isRainTomorrow
              ? `${tomorrowPrecip}% chance of precipitation tomorrow.`
              : 'Clear conditions expected tomorrow.'}
          </p>
        </div>
      </QuickAccessCard>

      {/* Card 3: Favourite City */}
      <QuickAccessCard
        title="Favourite City"
        icon={Star}
        iconColor="text-amber-400"
        onClick={() => favoriteCity && onSelectCity?.(favoriteCity)}
      >
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-bold text-white leading-tight">
                {favoriteCity || 'Not set'}
              </h4>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mt-0.5">
                {favoriteCity ? 'Last viewed' : 'Primary focus'}
              </span>
            </div>
            <span className="text-2xl font-black text-white">{currentTemp}°</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
            <div className="bg-slate-950/20 px-2 py-1.5 rounded-lg border border-slate-850">
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Humidity</span>
              {currentHumidity}%
            </div>
            <div className="bg-slate-950/20 px-2 py-1.5 rounded-lg border border-slate-850">
              <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Wind</span>
              {currentWind} km/h
            </div>
          </div>
        </div>
      </QuickAccessCard>

      {/* Card 4: Monthly Average Temperature */}
      <QuickAccessCard
        title="Monthly Average"
        icon={CalendarDays}
        iconColor="text-emerald-400"
        onClick={onOpenAnalytics}
      >
        <div className="flex flex-col h-full justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-4xl font-extrabold text-white tracking-tight">{monthlyAverage}°</span>
              <span className="text-xs font-semibold text-slate-400 block mt-1">
                {typeof monthlyAverage === 'number' ? 'Monthly average' : 'Loading...'}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Thermometer className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {typeof monthlyAverage === 'number'
              ? `${currentMonth} average temperature for ${currentWeather?.city || 'this city'}.`
              : 'Historical data loading...'}
          </p>
        </div>
      </QuickAccessCard>
    </div>
  )
}

export default memo(QuickAccess)
