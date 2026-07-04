import React, { memo, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Thermometer, Droplets, Wind, CloudRain, SunMedium, BarChart3 } from 'lucide-react'

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function AnimatedNumber({ value, decimals = 0, duration = 1.1 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value == null) return
    let frame
    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <>{display.toFixed(decimals)}</>
}

function StatTile({ icon: Icon, iconColor, label, value, unit, decimals = 0, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 * index, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-center transition-colors duration-200 hover:border-slate-700 hover:bg-slate-900/60"
    >
      <div className="mb-1.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        {label}
      </div>
      <div className="text-base font-bold text-white">
        <AnimatedNumber value={value} decimals={decimals} />
        {unit}
      </div>
    </motion.div>
  )
}

// --- Mini SVG charts, no chart library ---

const CHART_WIDTH = 260
const CHART_HEIGHT = 64

function scaleLinear(values, height, padding = 6) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)
  return (v) => height - padding - ((v - min) / range) * (height - padding * 2)
}

function LineChart({ values, color = '#38bdf8' }) {
  const points = useMemo(() => {
    if (values.length < 2) return []
    const y = scaleLinear(values, CHART_HEIGHT)
    const stepX = CHART_WIDTH / (values.length - 1)
    return values.map((v, i) => ({ x: i * stepX, y: y(v) }))
  }, [values])

  const path = useMemo(() => {
    if (!points.length) return ''
    return points
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = points[i - 1]
        const midX = (prev.x + p.x) / 2
        return `C ${midX} ${prev.y}, ${midX} ${p.y}, ${p.x} ${p.y}`
      })
      .join(' ')
  }, [points])

  if (!points.length) return null

  return (
    <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.2 }}
      />
    </svg>
  )
}

function AreaChart({ values, color = '#818cf8' }) {
  const points = useMemo(() => {
    if (values.length < 2) return []
    const y = scaleLinear(values, CHART_HEIGHT, 8)
    const stepX = CHART_WIDTH / (values.length - 1)
    return values.map((v, i) => ({ x: i * stepX, y: y(v) }))
  }, [values])

  const linePath = useMemo(() => {
    if (!points.length) return ''
    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  }, [points])

  const areaPath = useMemo(() => {
    if (!points.length) return ''
    return `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`
  }, [linePath, points])

  if (!points.length) return null

  const gradientId = `windAreaFill-${color.replace('#', '')}`

  return (
    <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.2 }}
      />
    </svg>
  )
}

function BarChart({ values, color = '#38bdf8' }) {
  const { max, barWidth, gap } = useMemo(() => {
    const barW = CHART_WIDTH / values.length
    return { max: Math.max(...values, 1), barWidth: barW, gap: barW * 0.28 }
  }, [values])

  return (
    <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
      {values.map((v, i) => {
        const height = (v / max) * (CHART_HEIGHT - 6)
        const x = i * barWidth + gap / 2
        const width = barWidth - gap

        return (
          // Full-height rect scaled via a GPU-friendly transform (scaleY +
          // translateY) instead of animating the SVG height/y attributes,
          // which would trigger layout/paint on every frame.
          <motion.rect
            key={i}
            x={x}
            y={0}
            width={width}
            height={CHART_HEIGHT}
            rx={2}
            fill={color}
            fillOpacity={0.75}
            style={{ transformOrigin: `${x + width / 2}px ${CHART_HEIGHT}px` }}
            initial={{ scaleY: 0, translateY: 0 }}
            animate={{ scaleY: height / CHART_HEIGHT, translateY: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.02, ease: 'easeOut' }}
          />
        )
      })}
    </svg>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </div>
  )
}

function WeatherStatisticsCard({ weatherData }) {
  const hourly = weatherData?.hourlyForecast ?? []
  const today = weatherData?.forecast?.[0]

  // Derive the three series and the aggregate stats in a single memo keyed
  // on the underlying hourly/forecast data — previously these arrays were
  // rebuilt on every render (defeating the stats useMemo below, since new
  // array references were passed as its dependencies every time).
  const { temps, winds, rainChances, stats } = useMemo(() => {
    const t = hourly.map((h) => h.temp).filter((v) => typeof v === 'number')
    const w = hourly.map((h) => h.windSpeed).filter((v) => typeof v === 'number')
    const r = hourly.map((h) => h.precipitationProbability).filter((v) => typeof v === 'number')

    return {
      temps: t,
      winds: w,
      rainChances: r,
      stats: {
        high: today?.tempMax ?? Math.max(...t, 0),
        low: today?.tempMin ?? Math.min(...t, 0),
        avgTemp: average(t),
        avgHumidity: weatherData?.humidity ?? 0,
        avgWind: average(w),
        maxWind: w.length ? Math.max(...w) : 0,
        avgRainChance: average(r),
        avgUv: weatherData?.uvIndex ?? 0,
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hourly, today, weatherData?.humidity, weatherData?.uvIndex])

  if (!hourly.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10"
    >
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          Weather Statistics
        </h2>
        <p className="mt-1 text-sm text-slate-500">Today's summary from the 24-hour forecast</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile index={0} icon={ArrowUp} iconColor="text-rose-400" label="Today's High" value={stats.high} unit="°" />
        <StatTile index={1} icon={ArrowDown} iconColor="text-sky-400" label="Today's Low" value={stats.low} unit="°" />
        <StatTile index={2} icon={Thermometer} iconColor="text-amber-400" label="Avg Temp" value={stats.avgTemp} unit="°" decimals={1} />
        <StatTile index={3} icon={Droplets} iconColor="text-blue-400" label="Avg Humidity" value={stats.avgHumidity} unit="%" />
        <StatTile index={4} icon={Wind} iconColor="text-emerald-400" label="Avg Wind" value={stats.avgWind} unit=" km/h" decimals={1} />
        <StatTile index={5} icon={Wind} iconColor="text-teal-400" label="Max Wind" value={stats.maxWind} unit=" km/h" />
        <StatTile index={6} icon={CloudRain} iconColor="text-indigo-400" label="Rain Chance Avg" value={stats.avgRainChance} unit="%" decimals={1} />
        <StatTile index={7} icon={SunMedium} iconColor="text-orange-400" label="Avg UV Index" value={stats.avgUv} unit="" decimals={1} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Temperature Trend">
          <LineChart values={temps} color="#38bdf8" />
        </ChartCard>
        <ChartCard title="Rain Probability">
          <BarChart values={rainChances} color="#818cf8" />
        </ChartCard>
        <ChartCard title="Wind Speed">
          <AreaChart values={winds} color="#34d399" />
        </ChartCard>
      </div>
    </motion.div>
  )
}

export default memo(WeatherStatisticsCard)
