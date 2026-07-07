import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, GitCommitHorizontal } from 'lucide-react'
import LightRaysBackground from './WeatherBackgrounds/LightRaysBackground'

const ICONS = {
  sunny: Sun,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudLightning,
  cloudy: Cloud,
}

const NODE_SPACING = 92
const TRACK_HEIGHT = 96

// Computes both the node y-positions and the SVG path string in one pass so
// the min/max scan over temps happens exactly once, rather than being
// recomputed per-node during render (previously an O(n^2) pattern).
function buildLineData(temps) {
  if (temps.length < 2) return { path: '', points: [] }

  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const range = Math.max(max - min, 1)

  const points = temps.map((t, i) => {
    const x = i * NODE_SPACING + NODE_SPACING / 2
    const y = TRACK_HEIGHT - ((t - min) / range) * (TRACK_HEIGHT - 24) - 12
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

function WeatherTimeline({ hourlyForecast = [] }) {
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

  const { path: linePath, points: nodePoints } = useMemo(
    () => buildLineData(hours.map((h) => h.temp)),
    [hours]
  )

  if (!hours.length) return null

  const totalWidth = hours.length * NODE_SPACING

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10 relative overflow-hidden"
    >
      {/* Light rays background */}
      <LightRaysBackground weatherCode={hours[0]?.weather_code || 0} opacity={0.12} />

      <div className="relative z-10">
        <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
          <GitCommitHorizontal className="h-4 w-4 text-blue-400" />
          Weather Timeline
        </h2>
        <p className="mt-1 text-sm text-slate-500">Progression from now through the next 24 hours</p>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div style={{ width: totalWidth, minWidth: '100%' }} className="relative">
          <svg
            width={totalWidth}
            height={TRACK_HEIGHT}
            className="absolute left-0 top-0 pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="timelineStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#timelineStroke)"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
            />
          </svg>

          <div className="relative flex" style={{ height: TRACK_HEIGHT }}>
            {hours.map((hour, i) => {
              const isNow = i === currentIndex
              return (
                <div
                  key={hour.label}
                  className="absolute top-0"
                  style={{ left: i * NODE_SPACING, width: NODE_SPACING }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.03, ease: 'backOut' }}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: (nodePoints[i]?.y ?? TRACK_HEIGHT / 2) - 4 }}
                  >
                    <span
                      className={`block h-3 w-3 rounded-full border-2 ${
                        isNow
                          ? 'border-white bg-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]'
                          : 'border-slate-950 bg-slate-300'
                      }`}
                    />
                  </motion.div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex" style={{ width: totalWidth }}>
            {hours.map((hour, i) => {
              const Icon = ICONS[hour.icon] || Cloud
              const isNow = i === currentIndex
              const time = new Date(hour.label)
              const label = isNow
                ? 'Now'
                : time.toLocaleTimeString([], { hour: 'numeric' }).replace(' ', '')

              return (
                <motion.div
                  key={`meta-${hour.label}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * i, ease: 'easeOut' }}
                  style={{ width: NODE_SPACING, flex: `0 0 ${NODE_SPACING}px` }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <span className={`text-xs font-semibold ${isNow ? 'text-blue-300' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  <Icon className={`h-5 w-5 ${isNow ? 'text-blue-300' : 'text-sky-400'}`} />
                  <span className="text-sm font-bold text-white">{hour.temp}°</span>
                </motion.div>
              )
            })}
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(WeatherTimeline)
