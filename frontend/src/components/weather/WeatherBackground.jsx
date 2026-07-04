import React from 'react'
import { motion } from 'framer-motion'
import WeatherEffects from './WeatherEffects'

const WEATHER_THEMES = {
  clear: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  cloudy: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  rain: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  storm: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  snow: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  fog: {
    background: 'from-[#3DAEFF] via-[#55BCFF] to-[#8ED7FF]',
  },
  night: {
    background: 'from-[#0d1b3a] via-[#16284f] to-[#28446e]',
  },
}

export default function WeatherBackground({ weatherKey = 'clear', weatherLabel, prefersReducedMotion = false }) {
  const theme = WEATHER_THEMES[weatherKey] || WEATHER_THEMES.clear

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={`absolute inset-0 rounded-[inherit] bg-gradient-to-b ${theme.background}`}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_15%_20%,_rgba(255,255,255,0.16),_transparent_35%)]" />
      <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,_rgba(255,255,255,0.06)_0%,_rgba(255,255,255,0)_45%,_rgba(14,27,45,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] rounded-[inherit] bg-[radial-gradient(ellipse_at_center_bottom,_rgba(125,211,252,0.16)_0%,_rgba(125,211,252,0.06)_35%,_transparent_70%)]" />
      <WeatherEffects weatherKey={weatherKey} prefersReducedMotion={prefersReducedMotion} />
      <div className="absolute inset-x-0 bottom-0 h-32 rounded-[inherit] bg-gradient-to-t from-slate-950/55 to-transparent" />
    </motion.div>
  )
}
