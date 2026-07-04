import React, { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wind, Droplets, Factory, Flame, CloudDrizzle, Waves, SunMedium, Info } from 'lucide-react'
import { fetchAirQualityForCity } from '../services/weatherService'

const AQI_BANDS = [
  { max: 50, category: 'Good', color: '#22c55e' },
  { max: 100, category: 'Fair', color: '#eab308' },
  { max: 150, category: 'Moderate', color: '#f97316' },
  { max: 200, category: 'Poor', color: '#ef4444' },
  { max: Infinity, category: 'Very Poor', color: '#a855f7' },
]

const GAUGE_MAX = 250
const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getBand(aqi) {
  if (aqi == null) return AQI_BANDS[0]
  return AQI_BANDS.find((band) => aqi <= band.max) ?? AQI_BANDS[AQI_BANDS.length - 1]
}

function AnimatedNumber({ value, duration = 1.4 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value == null) return
    let frame
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <>{display}</>
}

function AqiGauge({ aqi, band }) {
  const clamped = Math.min(aqi ?? 0, GAUGE_MAX)
  const progress = clamped / GAUGE_MAX

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      <svg width={176} height={176} className="-rotate-90">
        <circle
          cx={88}
          cy={88}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={12}
        />
        <motion.circle
          cx={88}
          cy={88}
          r={RADIUS}
          fill="none"
          stroke={band.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 8px ${band.color}66)` }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-white">
          <AnimatedNumber value={aqi ?? 0} />
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: band.color }}>
          {band.category}
        </span>
        <span className="mt-0.5 text-[10px] text-slate-500">US AQI</span>
      </div>
    </div>
  )
}

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', icon: Droplets, color: 'text-sky-400' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', icon: CloudDrizzle, color: 'text-blue-400' },
  { key: 'o3', label: 'O₃', unit: 'µg/m³', icon: Wind, color: 'text-emerald-400' },
  { key: 'no2', label: 'NO₂', unit: 'µg/m³', icon: Factory, color: 'text-amber-400' },
  { key: 'co', label: 'CO', unit: 'µg/m³', icon: Flame, color: 'text-rose-400' },
  { key: 'so2', label: 'SO₂', unit: 'µg/m³', icon: Waves, color: 'text-purple-400' },
]

function AirQualityCard({ city }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!city) return

    let active = true
    setLoading(true)
    setError('')

    fetchAirQualityForCity(city)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load air quality data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [city])

  const band = getBand(data?.aqi)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Air Quality</h2>
        <p className="mt-1 text-sm text-slate-500">Current AQI and pollutant levels</p>
      </div>

      {error && (
        <div className="flex h-56 items-center justify-center text-sm text-rose-400">{error}</div>
      )}

      {!error && (loading || !data) && (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
          Loading air quality...
        </div>
      )}

      {!error && !loading && data && (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <AqiGauge aqi={data.aqi} band={band} />

            <div className="flex max-w-xs items-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
              <p>{data.recommendation}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {POLLUTANTS.map((p, i) => {
              const Icon = p.icon
              const value = data[p.key]

              return (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-center transition-colors duration-200 hover:border-slate-700 hover:bg-slate-900/60"
                >
                  <Icon className={`mx-auto mb-1.5 h-4 w-4 ${p.color}`} />
                  <p className="text-sm font-bold text-white">
                    {value != null ? value.toFixed(1) : '--'}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">
                    {p.label} {p.unit}
                  </p>
                </motion.div>
              )
            })}

            {data.uvIndex != null && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + POLLUTANTS.length * 0.06, ease: 'easeOut' }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-center transition-colors duration-200 hover:border-slate-700 hover:bg-slate-900/60"
              >
                <SunMedium className="mx-auto mb-1.5 h-4 w-4 text-orange-400" />
                <p className="text-sm font-bold text-white">{data.uvIndex.toFixed(1)}</p>
                <p className="text-[10px] font-medium text-slate-500">UV Index</p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default memo(AirQualityCard)
