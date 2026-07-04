import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, SunMedium, Flower2 } from 'lucide-react'

export default function AirQualityPanel({ weatherData }) {
  const aqi = weatherData?.airQuality || 'Moderate'
  const uvRisk = (weatherData?.uvIndex ?? 0) > 7 ? 'High' : (weatherData?.uvIndex ?? 0) > 3 ? 'Moderate' : 'Low'
  const pollen = weatherData?.humidity > 70 ? 'Elevated' : 'Low'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Air Quality & Wellness</h3>
          <p className="mt-1 text-sm text-slate-500">UV, pollen, and air conditions</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Sparkles className="h-4 w-4 text-emerald-400" /> AQI</div>
          <div className="text-xl font-semibold text-white">{aqi}</div>
        </div>
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><SunMedium className="h-4 w-4 text-amber-400" /> UV Risk</div>
          <div className="text-xl font-semibold text-white">{uvRisk}</div>
        </div>
        <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Flower2 className="h-4 w-4 text-lime-400" /> Pollen</div>
          <div className="text-xl font-semibold text-white">{pollen}</div>
        </div>
      </div>
    </motion.div>
  )
}
