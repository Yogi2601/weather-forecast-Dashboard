import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Cloud, CloudRain, CloudSnow, Calendar } from 'lucide-react'
import WeatherCardBackground from './WeatherBackgrounds/WeatherCardBackground'

const icons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
}

function Forecast({ forecast = [] }) {
  if (!forecast.length) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl shadow-blue-950/10 relative overflow-hidden"
    >
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            7-Day Forecast
          </h2>
          <p className="mt-1 text-sm text-slate-500">Week ahead weather overview</p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4"
      >
        {forecast.map((day) => {
          const Icon = icons[day.icon] || Cloud
          const dayName = new Date(day.label).toLocaleDateString(undefined, {
            weekday: 'short',
          })

          return (
            <motion.div key={day.label} variants={itemVariants}>
              <motion.div
                whileHover={{
                  y: -4,
                  boxShadow: '0 16px 32px rgba(59, 130, 246, 0.2)',
                }}
                whileTap={{ scale: 0.98 }}
                className="relative group rounded-2xl bg-slate-800/40 p-4 text-center border border-slate-700 hover:border-blue-500/40 transition-all duration-300 overflow-hidden"
              >
                {/* Weather-responsive background */}
                <WeatherCardBackground
                  weatherCode={day.weather_code || 0}
                  opacity={0.1}
                  className="absolute inset-0 rounded-2xl"
                />

                <div className="relative z-10 space-y-3">
                  <motion.p
                    className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors"
                  >
                    {dayName}
                  </motion.p>

                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="mx-auto h-9 w-9 flex items-center justify-center"
                  >
                    <Icon className="text-sky-400 group-hover:text-blue-300 transition-colors" size={32} />
                  </motion.div>

                  <div className="space-y-1">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg font-bold text-white"
                    >
                      {day.tempMax}°
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors"
                    >
                      {day.tempMin}°
                    </motion.p>
                  </div>
                </div>

                {/* Glassmorphism shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none group-hover:from-white/8 transition-all duration-300" />
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

export default memo(Forecast)
