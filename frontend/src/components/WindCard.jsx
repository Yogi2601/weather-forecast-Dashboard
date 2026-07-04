import React, { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation, Wind, Gauge } from 'lucide-react'
import WindTurbine from './Windmill'

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function getCompassDirection(deg) {
  if (deg == null) return '--'
  const index = Math.round(deg / 45) % 8
  return COMPASS_POINTS[index]
}

const BEAUFORT_SCALE = [
  { max: 1, level: 0, label: 'Calm' },
  { max: 5, level: 1, label: 'Light Air' },
  { max: 11, level: 2, label: 'Light Breeze' },
  { max: 19, level: 3, label: 'Gentle Breeze' },
  { max: 28, level: 4, label: 'Moderate Breeze' },
  { max: 38, level: 5, label: 'Fresh Breeze' },
  { max: 49, level: 6, label: 'Strong Breeze' },
  { max: 61, level: 7, label: 'Near Gale' },
  { max: 74, level: 8, label: 'Gale' },
  { max: 88, level: 9, label: 'Strong Gale' },
  { max: 102, level: 10, label: 'Storm' },
  { max: 117, level: 11, label: 'Violent Storm' },
  { max: Infinity, level: 12, label: 'Hurricane' },
]

function getBeaufort(speedKmh) {
  if (speedKmh == null) return BEAUFORT_SCALE[0]
  return BEAUFORT_SCALE.find((b) => speedKmh <= b.max) ?? BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1]
}

function AnimatedNumber({ value, duration = 1.1 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value == null) return
    let frame
    const start = performance.now()
    const from = display

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <>{display}</>
}

// A handful of soft curved airflow lines drifting slowly behind the
// compass — subtle, lightweight, purely decorative.
const AIRFLOW_LINES = [
  { top: '18%', width: '70%', duration: 7, delay: 0 },
  { top: '42%', width: '85%', duration: 9, delay: 1.2 },
  { top: '66%', width: '60%', duration: 8, delay: 0.6 },
  { top: '84%', width: '75%', duration: 10, delay: 2 },
]

function AirflowBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
      {AIRFLOW_LINES.map((line, i) => (
        <motion.div
          key={i}
          className="absolute left-0 h-px rounded-full bg-gradient-to-r from-transparent via-blue-400/25 to-transparent"
          style={{ top: line.top, width: line.width }}
          animate={{ x: ['-20%', '120%'] }}
          transition={{ duration: line.duration, delay: line.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

// Mini compass (50-60px) for the top-right wind info
function MiniCompass({ direction }) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center flex-shrink-0">
      <svg width={56} height={56} className="relative">
        <circle cx={28} cy={28} r={25} fill="#0f172a" stroke="#1e293b" strokeWidth={1} />
        <circle cx={28} cy={28} r={19} fill="none" stroke="#1e293b" strokeWidth={0.5} strokeDasharray="1 3" />

        {COMPASS_POINTS.map((point, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x = 28 + 21 * Math.sin(angle)
          const y = 28 - 21 * Math.cos(angle)
          const isCardinal = i % 2 === 0

          return (
            <text
              key={point}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isCardinal ? 8 : 6}
              fontWeight={isCardinal ? 700 : 500}
              fill={isCardinal ? '#e2e8f0' : '#64748b'}
            >
              {point}
            </text>
          )
        })}

        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const isMajor = i % 6 === 0
          const outer = 25
          const inner = isMajor ? 22 : 23
          const x1 = 28 + inner * Math.sin(angle)
          const y1 = 28 - inner * Math.cos(angle)
          const x2 = 28 + outer * Math.sin(angle)
          const y2 = 28 - outer * Math.cos(angle)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? '#475569' : '#334155'}
              strokeWidth={isMajor ? 0.8 : 0.6}
            />
          )
        })}
      </svg>

      {/* Rotating needle */}
      <motion.div
        className="absolute"
        style={{ width: 2.5, height: 18, transformOrigin: '50% 100%', bottom: '50%' }}
        animate={{ rotate: direction ?? 0 }}
        transition={{ type: 'spring', stiffness: 60, damping: 12 }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: 'linear-gradient(to top, #1e293b 0%, #ef4444 55%, #f87171 100%)',
            filter: 'drop-shadow(0 0 2px rgba(239,68,68,0.5))',
          }}
        />
      </motion.div>

      <div className="absolute h-1.5 w-1.5 rounded-full border border-slate-950 bg-slate-100 shadow-sm" />
      <div className="absolute -top-0.5 text-[7px] font-bold tracking-wider text-slate-500">N</div>
    </div>
  )
}

function WindCard({ weatherData }) {
  const speed = weatherData?.wind ?? 0
  const gust = weatherData?.windGust ?? speed
  const direction = weatherData?.windDirection ?? 0
  const compassDir = getCompassDirection(direction)
  const beaufort = getBeaufort(speed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10 relative"
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Wind</h2>
        <p className="mt-1 text-sm text-slate-500">Live speed, gusts, and direction</p>
      </div>

      {/* Top-right wind information block */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5">
        {/* Wind speed */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-white">
            <AnimatedNumber value={speed} />
          </span>
          <span className="text-xs font-semibold text-slate-400">km/h</span>
        </div>

        {/* Sustained wind speed label */}
        <p className="text-[11px] font-medium text-slate-500">Sustained wind speed</p>

        {/* Direction text */}
        <div className="flex items-center gap-1.5 text-sm text-slate-300 mt-1">
          <span className="font-semibold">{compassDir}</span>
          <span className="text-slate-500 text-xs">· {Math.round(direction)}°</span>
        </div>

        {/* Mini compass */}
        <div className="mt-1">
          <MiniCompass direction={direction} />
        </div>
      </div>

      {/* Wind Turbine centered - moved down to prevent blade clipping */}
      <div className="flex justify-center mb-6 mt-16">
        <WindTurbine windSpeed={speed} />
      </div>

      {/* Info cards grid at bottom */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Wind className="h-3.5 w-3.5 text-sky-400" /> Gust
          </div>
          <div className="text-base font-bold text-white">{gust} km/h</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Navigation className="h-3.5 w-3.5 text-blue-400" /> Direction
          </div>
          <div className="text-base font-bold text-white">{compassDir}</div>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center sm:col-span-1">
          <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-emerald-400" /> Beaufort {beaufort.level}
          </div>
          <div className="text-base font-bold text-white">{beaufort.label}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(WindCard)
