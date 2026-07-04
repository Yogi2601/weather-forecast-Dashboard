import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Droplets, Wind, Clock } from 'lucide-react'

const ICONS = {
  sunny: Sun,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudLightning,
  cloudy: Cloud,
}

const CARD_WIDTH = 108
const CARD_GAP = 12
const CURVE_HEIGHT = 64

function buildCurvePath(temps) {
  if (temps.length < 2) return { path: '', points: [] }

  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const range = Math.max(max - min, 1)

  const points = temps.map((t, i) => {
    const x = i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2
    const y = CURVE_HEIGHT - ((t - min) / range) * (CURVE_HEIGHT - 16) - 8
    return { x, y }
  })

  const path = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = points[i - 1]
      const midX = (prev.x + p.x) / 2
      return `C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`
    })
    .join(' ')

  return { path, points }
}

function HourlyForecast({ hourlyForecast = [] }) {
  const hours = useMemo(() => hourlyForecast.slice(0, 24), [hourlyForecast])

  const currentIndex = useMemo(() => {
    const now = Date.now()
    let closest = 0
    let closestDiff = Infinity

    hours.forEach((hour, i) => {
      const diff = Math.abs(new Date(hour.label).getTime() - now)
      if (diff < closestDiff) {
        closestDiff = diff
        closest = i
      }
    })

    return closest
  }, [hours])

  const { path, points } = useMemo(() => buildCurvePath(hours.map((h) => h.temp)), [hours])

  if (!hours.length) return null

  const totalWidth = hours.length * CARD_WIDTH + (hours.length - 1) * CARD_GAP

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
            <Clock className="h-4 w-4 text-blue-400" />
            Hourly Forecast
          </h2>
          <p className="mt-1 text-sm text-slate-500">Next 24 hours</p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div style={{ width: totalWidth, minWidth: '100%' }} className="relative">
          {/* Animated temperature curve, drawn on load */}
          <svg
            width={totalWidth}
            height={CURVE_HEIGHT}
            className="absolute left-0 top-2 pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="hourlyCurveStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <motion.path
              d={path}
              fill="none"
              stroke="url(#hourlyCurveStroke)"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
            />
            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === currentIndex ? 4 : 2.5}
                fill={i === currentIndex ? '#38bdf8' : '#94a3b8'}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
              />
            ))}
          </svg>

          {/* Hourly cards */}
          <div className="relative flex gap-3 pt-16">
            {hours.map((hour, i) => {
              const Icon = ICONS[hour.icon] || Cloud
              const isNow = i === currentIndex
              const time = new Date(hour.label)
              const label = isNow
                ? 'Now'
                : time.toLocaleTimeString([], { hour: 'numeric' }).replace(' ', '')

              return (
                <motion.div
                  key={hour.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * i, ease: 'easeOut' }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  style={{ width: CARD_WIDTH, flex: `0 0 ${CARD_WIDTH}px` }}
                  className={`group rounded-2xl border p-3 text-center transition-colors duration-200 ${
                    isNow
                      ? 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-950/20'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <p className={`mb-2 text-xs font-semibold ${isNow ? 'text-blue-300' : 'text-slate-400'}`}>
                    {label}
                  </p>

                  <motion.div
                    animate={isNow ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="mx-auto mb-2 flex h-9 w-9 items-center justify-center"
                  >
                    <Icon
                      className={`h-7 w-7 transition-transform duration-200 group-hover:scale-110 ${
                        isNow ? 'text-blue-300' : 'text-sky-400'
                      }`}
                    />
                  </motion.div>

                  <p className="mb-2 text-base font-bold text-white">{hour.temp}°</p>

                  <div className="space-y-1 text-[10px] font-medium text-slate-500">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-2.5 w-2.5 text-sky-400" />
                      <span>{hour.precipitationProbability ?? '--'}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="h-2.5 w-2.5 text-blue-400" />
                      <span>{hour.windSpeed ?? '--'} km/h</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(HourlyForecast)
