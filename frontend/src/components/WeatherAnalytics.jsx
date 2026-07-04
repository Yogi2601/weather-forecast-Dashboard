import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function WeatherAnalytics({ hourlyForecast = [], weatherData }) {
  const chartData = (hourlyForecast || []).slice(0, 12).map((item, index) => ({
    name: item.label,
    temperature: item.temp,
    humidity: item.humidity,
    wind: item.wind,
    pressure: 1000 + index * 2 + (weatherData?.pressure ? Math.round(weatherData.pressure / 30) : 0),
    rain: item.rain,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Weather Analytics</h3>
          <p className="mt-1 text-sm text-slate-500">Hourly insights from live forecast data</p>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-400">
          Recharts
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-300">Temperature & Humidity</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="temperature" stroke="#38bdf8" fillOpacity={1} fill="url(#tempGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="humidity" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="mb-3 text-sm font-semibold text-slate-300">Wind & Rain Probability</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="wind" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rain" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
