import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function WeatherAlerts({ weatherData }) {
  const severity = weatherData?.precipitationChance > 70 ? 'High' : weatherData?.wind > 25 ? 'Moderate' : 'Low'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Weather Alerts</h3>
          <p className="mt-1 text-sm text-slate-500">Current conditions with live forecast context</p>
        </div>
        <div className="rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-400">
          Open-Meteo
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{severity} weather advisory</div>
            <div className="text-sm text-slate-500">{weatherData?.condition || 'Current conditions'} • {weatherData?.precipitationChance ?? 0}% precipitation chance</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
