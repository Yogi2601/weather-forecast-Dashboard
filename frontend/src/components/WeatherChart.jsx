import React, { useState } from 'react'
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, Line, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { Cloud, Droplets, Wind, Navigation } from 'lucide-react'

// Custom Tooltip component matching premium glassmorphic UI
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 backdrop-blur-xl shadow-2xl space-y-2.5 max-w-[240px] text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-white text-sm">{data.fullLabel || label}</span>
          <span className="text-slate-400 font-semibold">{data.condition}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Temp: <strong className="text-white">{data.temp}°C</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Hum: <strong className="text-white">{data.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>Wind: <strong className="text-white">{data.wind} km/h</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Rain: <strong className="text-white">{data.rain}%</strong></span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function WeatherChart({ hourlyForecast = [], loading }) {
  const [activeHour, setActiveHour] = useState(null)

  if (loading) {
    return (
      <div className="h-96 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500/25 border-t-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading forecast chart...</span>
        </div>
      </div>
    )
  }

  if (!hourlyForecast.length) {
    return (
      <div className="h-96 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
        <span className="text-sm font-semibold text-slate-500">No hourly forecast data available.</span>
      </div>
    )
  }

  // Handle chart mouse interactions to update highlighted hour state
  const handleMouseMove = (state) => {
    if (state && state.activeTooltipIndex !== undefined) {
      setActiveHour(hourlyForecast[state.activeTooltipIndex])
    } else {
      setActiveHour(null)
    }
  }

  const handleMouseLeave = () => {
    setActiveHour(null)
  }

  // Calculate min and max temperatures to dynamically size YAxis
  const temps = hourlyForecast.map(item => item.temp)
  const minTemp = Math.min(...temps) - 1
  const maxTemp = Math.max(...temps) + 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-3xl border border-slate-800 bg-slate-900/45 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">24-Hour Temperature Trend</h2>
          <p className="text-xs text-slate-400">Drag or hover across the curve for atmospheric variables</p>
        </div>

        {/* Live Active Hour Indicators */}
        {activeHour && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 bg-slate-950/40 px-4 py-2 rounded-2xl border border-slate-850 text-xs font-semibold text-slate-350"
          >
            <span>Time: <strong className="text-white">{activeHour.fullLabel}</strong></span>
            <span>Temp: <strong className="text-blue-400">{activeHour.temp}°C</strong></span>
            <span>Precipitation: <strong className="text-sky-400">{activeHour.rain}%</strong></span>
          </motion.div>
        )}
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyForecast}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
            <XAxis 
              dataKey="label" 
              tickLine={false} 
              axisLine={false} 
              stroke="#64748b" 
              tick={{ fontSize: 10, fontWeight: 600 }} 
            />
            <YAxis 
              domain={[minTemp, maxTemp]} 
              tickLine={false} 
              axisLine={false} 
              stroke="#64748b" 
              tick={{ fontSize: 10, fontWeight: 600 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
