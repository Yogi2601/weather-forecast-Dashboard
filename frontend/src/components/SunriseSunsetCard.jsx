import React, { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sunrise, Sunset, Clock, Moon } from 'lucide-react'

const ARC_WIDTH = 260
const ARC_HEIGHT = 130
const ARC_RADIUS = 110
const CENTER_X = ARC_WIDTH / 2
const CENTER_Y = ARC_HEIGHT

function formatTime(date) {
  if (!date) return '--:--'
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(ms) {
  if (ms == null || ms < 0) return '--'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

// Position along a half-circle arc for a given progress fraction [0, 1],
// where 0 = left edge (horizon), 0.5 = top (peak), 1 = right edge (horizon).
function pointOnArc(progress) {
  const angle = Math.PI - progress * Math.PI
  const x = CENTER_X + ARC_RADIUS * Math.cos(angle)
  const y = CENTER_Y - ARC_RADIUS * Math.sin(angle)
  return { x, y }
}

function buildArcPath() {
  const start = pointOnArc(0)
  const end = pointOnArc(1)
  return `M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${end.x} ${end.y}`
}

function SunriseSunsetCard({ weatherData }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const sunrise = weatherData?.sunrise ? new Date(weatherData.sunrise) : null
  const sunset = weatherData?.sunset ? new Date(weatherData.sunset) : null

  const isDaytime = useMemo(() => {
    if (!sunrise || !sunset) return weatherData?.isDay !== 0
    return now >= sunrise && now < sunset
  }, [now, sunrise, sunset, weatherData?.isDay])

  const dayLengthMs = sunrise && sunset ? sunset - sunrise : null

  const progress = useMemo(() => {
    if (!sunrise || !sunset) return 0.5

    if (isDaytime) {
      return Math.min(Math.max((now - sunrise) / (sunset - sunrise), 0), 1)
    }

    // Nighttime: progress across the night span, from sunset to next sunrise.
    // Approximate next sunrise as "same time tomorrow" since only today's
    // sunrise/sunset are available from the API.
    const nightLength = 24 * 60 * 60 * 1000 - dayLengthMs
    const elapsedSinceSunset = now >= sunset ? now - sunset : now - (sunset.getTime() - 24 * 60 * 60 * 1000)
    return Math.min(Math.max(elapsedSinceSunset / nightLength, 0), 1)
  }, [now, sunrise, sunset, isDaytime, dayLengthMs])

  const countdown = useMemo(() => {
    if (!sunrise || !sunset) return null

    if (isDaytime) {
      return { label: 'Sunset in', ms: sunset - now }
    }

    if (now < sunrise) {
      return { label: 'Sunrise in', ms: sunrise - now }
    }

    const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000)
    return { label: 'Sunrise in', ms: nextSunrise - now }
  }, [now, sunrise, sunset, isDaytime])

  const arcPath = useMemo(buildArcPath, [])
  const bodyPosition = pointOnArc(progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Sunrise & Sunset</h2>
        <p className="mt-1 text-sm text-slate-500">
          {countdown ? `${countdown.label} ${formatDuration(countdown.ms)}` : 'Sun position today'}
        </p>
      </div>

      <div className="flex justify-center">
        <svg width={ARC_WIDTH} height={ARC_HEIGHT + 20} className="overflow-visible">
          <defs>
            <linearGradient id="sunArcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#facc15" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          {/* Horizon line */}
          <line
            x1={0}
            y1={ARC_HEIGHT}
            x2={ARC_WIDTH}
            y2={ARC_HEIGHT}
            stroke="#334155"
            strokeWidth={1.5}
            strokeDasharray="3 4"
          />

          {/* Arc track */}
          <path d={arcPath} fill="none" stroke="#1e293b" strokeWidth={3} strokeLinecap="round" />

          {/* Animated progress along the arc */}
          <motion.path
            d={arcPath}
            fill="none"
            stroke="url(#sunArcGradient)"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Glow behind the moving body */}
          <motion.circle
            cx={bodyPosition.x}
            cy={bodyPosition.y}
            r={16}
            fill={isDaytime ? '#facc15' : '#a5b4fc'}
            opacity={0.25}
            animate={{ r: [14, 18, 14], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Sun or moon body, animated into position */}
          <motion.circle
            r={8}
            fill={isDaytime ? '#fde047' : '#e0e7ff'}
            initial={false}
            animate={{ cx: bodyPosition.x, cy: bodyPosition.y }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              filter: isDaytime
                ? 'drop-shadow(0 0 6px rgba(250,204,21,0.8))'
                : 'drop-shadow(0 0 6px rgba(199,210,254,0.7))',
            }}
          />

          {/* Sunrise/sunset endpoint markers */}
          <circle cx={pointOnArc(0).x} cy={pointOnArc(0).y} r={3} fill="#f97316" />
          <circle cx={pointOnArc(1).x} cy={pointOnArc(1).y} r={3} fill="#818cf8" />
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
        {isDaytime ? (
          <>Sun is above the horizon</>
        ) : (
          <span className="flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5 text-indigo-300" /> Sun is below the horizon
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Sunrise className="h-3.5 w-3.5 text-amber-400" /> Sunrise
          </div>
          <div className="text-base font-bold text-white">{formatTime(sunrise)}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Sunset className="h-3.5 w-3.5 text-purple-400" /> Sunset
          </div>
          <div className="text-base font-bold text-white">{formatTime(sunset)}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock className="h-3.5 w-3.5 text-sky-400" /> Day Length
          </div>
          <div className="text-base font-bold text-white">{formatDuration(dayLengthMs)}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(SunriseSunsetCard)
