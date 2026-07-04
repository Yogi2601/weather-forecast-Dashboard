import React, { memo } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, ArrowUp, ArrowDown, Star, FileDown } from 'lucide-react'
import { motion } from 'framer-motion'
import WeatherSceneManager from '../Weather/WeatherSceneManager.jsx'

function CurrentWeather({ weatherData, loading, error, isFavorite, onAddFavorite }) {
  if (!weatherData) return null

  const { city, temp, condition, icon, tempMax, tempMin, wind, humidity, desc } = weatherData

  // Match icon name to Lucide Icon
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'sunny':
        return <Sun className="w-16 h-16 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
      case 'rainy':
        return <CloudRain className="w-16 h-16 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]" />
      case 'snowy':
        return <CloudSnow className="w-16 h-16 text-sky-200 drop-shadow-[0_0_10px_rgba(186,230,253,0.3)]" />
      case 'stormy':
        return <CloudLightning className="w-16 h-16 text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]" />
      default:
        return <Cloud className="w-16 h-16 text-slate-350 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]" />
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-950/90 shadow-2xl shadow-blue-950/20 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <WeatherSceneManager weather={weatherData} />

      {/* Weather info */}
      <div className="space-y-4 relative z-10">
        {loading && (
          <p className="text-sm text-slate-400">Loading live weather data...</p>
        )}

        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Current Weather
            </span>
            <button
              type="button"
              onClick={onAddFavorite}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:border-amber-500/40 transition-all"
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">{city}</h2>
          <p className="text-sm text-slate-400 mt-1.5">{desc}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <motion.span
            key={temp}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-5xl sm:text-7xl font-light text-white tracking-tighter"
          >
            {temp}°
          </motion.span>
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{condition}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <ArrowUp className="w-3.5 h-3.5 text-rose-400" />
            H: {tempMax}°
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
            L: {tempMin}°
          </span>
        </div>
      </div>

      {/* Icon and Quick Stats Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center md:flex-col lg:flex-row gap-6 relative z-10 bg-slate-900/40 border border-slate-800/60 p-4 sm:p-5 rounded-2xl md:min-w-[280px]">
        {/* Large Weather Icon with animation */}
        <motion.div
          key={icon}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 },
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="flex items-center justify-center p-3 rounded-2xl bg-slate-950/50 border border-slate-850"
        >
          {getIcon(icon)}
        </motion.div>

        {/* Detailed parameters */}
        <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              Wind
            </div>
            <p className="text-sm font-bold text-white">{wind} km/h</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Humidity
            </div>
            <p className="text-sm font-bold text-white">{humidity}%</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default memo(CurrentWeather)
