import React, { memo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { fetchAlertsForCity } from '../services/weatherService'

const SEVERITY_STYLES = {
  Minor: {
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    icon: 'text-emerald-400',
  },
  Moderate: {
    dot: 'bg-yellow-400',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-300',
    icon: 'text-yellow-400',
  },
  Severe: {
    dot: 'bg-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-300',
    icon: 'text-orange-400',
  },
  Extreme: {
    dot: 'bg-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    icon: 'text-red-400',
  },
}

function formatDateTime(iso) {
  if (!iso) return '--'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function AlertRow({ alert, index }) {
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.Minor
  const isCritical = alert.severity === 'Severe' || alert.severity === 'Extreme'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 * index, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-4`}
    >
      {isCritical && (
        <motion.div
          className={`absolute inset-0 rounded-2xl ${style.bg}`}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.bg}`}>
          <AlertTriangle className={`h-4.5 w-4.5 ${style.icon}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.text} ${style.bg} border ${style.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {alert.severity}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-slate-400">{alert.description}</p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
            <span>Starts: {formatDateTime(alert.start)}</span>
            <span>Ends: {formatDateTime(alert.end)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function WeatherAlertsCard({ city }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!city) return

    let active = true
    setLoading(true)
    setError('')

    fetchAlertsForCity(city)
      .then((result) => {
        if (active) setAlerts(result)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load weather alerts.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [city])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Weather Alerts</h2>
        <p className="mt-1 text-sm text-slate-500">Official warnings for this location</p>
      </div>

      {error && (
        <div className="flex h-20 items-center justify-center text-sm text-rose-400">{error}</div>
      )}

      {!error && loading && (
        <div className="flex h-20 items-center justify-center text-sm text-slate-500">
          Checking for alerts...
        </div>
      )}

      {!error && !loading && alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">No Active Weather Alerts</p>
            <p className="text-xs text-slate-400">Conditions are currently normal for this location.</p>
          </div>
        </motion.div>
      )}

      {!error && !loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <AlertRow key={alert.id ?? i} alert={alert} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default memo(WeatherAlertsCard)
