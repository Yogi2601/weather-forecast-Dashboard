import React from 'react'
import { motion } from 'framer-motion'
import { Sunrise, Sunset } from 'lucide-react'

export default function SunriseSunset({ weatherData }) {
  const sunrise = weatherData?.sunrise ? new Date(weatherData.sunrise).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'
  const sunset = weatherData?.sunset ? new Date(weatherData.sunset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Sunrise & Sunset</h3>
        <p className="mt-1 text-sm text-slate-500">Animated horizon timing</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Sunrise className="h-4 w-4 text-amber-400" /> Sunrise</div>
          <div className="text-xl font-semibold text-white">{sunrise}</div>
        </div>
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Sunset className="h-4 w-4 text-purple-400" /> Sunset</div>
          <div className="text-xl font-semibold text-white">{sunset}</div>
        </div>
      </div>
    </motion.div>
  )
}
