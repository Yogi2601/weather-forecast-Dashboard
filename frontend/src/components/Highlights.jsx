import React from 'react'
import { motion } from 'framer-motion'
import { Droplets, Wind, Sunrise, Sunset, Sparkles, ThermometerSun, Compass, Eye, Gauge, CloudRain, SunMedium } from 'lucide-react'

function DetailTile({ title, value, icon: Icon, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group rounded-[24px] border border-slate-800/80 bg-slate-950/50 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-md transition-all duration-300 hover:border-sky-500/30 hover:bg-slate-900/70"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <div className={`rounded-2xl border p-2.5 shadow-lg shadow-slate-950/20 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-5 text-xl font-semibold tracking-tight text-white">{value}</p>
    </motion.div>
  )
}

function SkeletonTile() {
  return (
    <div className="rounded-[24px] border border-slate-800/80 bg-slate-950/50 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-800" />
        <div className="h-9 w-9 animate-pulse rounded-2xl bg-slate-800" />
      </div>
      <div className="mt-5 h-6 w-24 animate-pulse rounded-full bg-slate-800" />
    </div>
  )
}

export default function Highlights({ weatherData, loading = false, error = '' }) {
  if (!weatherData) return null

  const sunrise = weatherData.sunrise
    ? new Date(weatherData.sunrise).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '—'
  const sunset = weatherData.sunset
    ? new Date(weatherData.sunset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '—'

  const detailItems = [
    { title: 'Feels Like', value: `${weatherData.feelsLike ?? '--'}°`, icon: ThermometerSun, accent: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
    { title: 'Humidity', value: `${weatherData.humidity ?? 0}%`, icon: Droplets, accent: 'border-sky-500/20 bg-sky-500/10 text-sky-400' },
    { title: 'Wind Speed', value: `${weatherData.wind ?? 0} km/h`, icon: Wind, accent: 'border-blue-500/20 bg-blue-500/10 text-blue-400' },
    { title: 'Wind Direction', value: weatherData.windDirection || '—', icon: Compass, accent: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400' },
    { title: 'Visibility', value: `${weatherData.visibility ?? 0} km`, icon: Eye, accent: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' },
    { title: 'Pressure', value: `${weatherData.pressure ?? 0} hPa`, icon: Gauge, accent: 'border-violet-500/20 bg-violet-500/10 text-violet-400' },
    { title: 'UV Index', value: `${weatherData.uvIndex ?? 0}`, icon: SunMedium, accent: 'border-orange-500/20 bg-orange-500/10 text-orange-400' },
    { title: 'Rain Probability', value: `${weatherData.precipitationChance ?? 0}%`, icon: CloudRain, accent: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' },
    { title: 'Sunrise', value: sunrise, icon: Sunrise, accent: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
    { title: 'Sunset', value: sunset, icon: Sunset, accent: 'border-purple-500/20 bg-purple-500/10 text-purple-400' },
  ]

  return (
    <div className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur-md">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Weather Details</h3>
          <p className="mt-1 text-sm text-slate-500">Live details from the current forecast</p>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-400">
          Open-Meteo • Live data
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => <SkeletonTile key={index} />)
          : detailItems.map((item, index) => (
              <DetailTile key={item.title} title={item.title} value={item.value} icon={item.icon} accent={item.accent} delay={index * 0.03} />
            ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Air Quality
        </div>
        <p className="mt-2 text-sm text-slate-500">{weatherData.airQuality || 'Moderate'} • Placeholder data until a live air-quality endpoint is connected.</p>
      </div>
    </div>
  )
}
