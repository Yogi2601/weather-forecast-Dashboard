import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CloudGenerator from './CloudGenerator'
import SunGlow from './SunGlow'
import Atmosphere from './Atmosphere'
import Particles from './Particles'
import Rain from './Rain'
import Snow from './Snow'
import Stars from './Stars'

export default function WeatherEffects({ weatherKey = 'clear', prefersReducedMotion = false }) {
  const showRain = weatherKey === 'rain' || weatherKey === 'storm'
  const showSnow = weatherKey === 'snow'
  const showStars = weatherKey === 'night'

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(61,174,255,0.16)_0%,_rgba(85,188,255,0.08)_45%,_rgba(142,215,255,0.04)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[40%] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0)_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[35%] bg-[radial-gradient(ellipse_at_bottom,_rgba(19,35,59,0.16)_0%,_rgba(19,35,59,0)_75%)]" />
      <AnimatePresence mode="wait">
        <motion.div
          key={weatherKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <CloudGenerator weatherKey={weatherKey} prefersReducedMotion={prefersReducedMotion} />
          <SunGlow weatherKey={weatherKey} prefersReducedMotion={prefersReducedMotion} />
          <Atmosphere weatherKey={weatherKey} prefersReducedMotion={prefersReducedMotion} />
          <Particles weatherKey={weatherKey} prefersReducedMotion={prefersReducedMotion} />
          {showRain && <Rain prefersReducedMotion={prefersReducedMotion} />}
          {showSnow && <Snow prefersReducedMotion={prefersReducedMotion} />}
          {showStars && <Stars prefersReducedMotion={prefersReducedMotion} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
