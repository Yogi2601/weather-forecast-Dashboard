import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WeatherBackground from './WeatherBackground'

export default function AnimatedSky({ weatherKey, weatherLabel }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener?.('change', updatePreference)

    let frameId = null
    const handleMove = (event) => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 12
        const y = (event.clientY / window.innerHeight - 0.5) * 12
        setMouse({ x, y })
        frameId = null
      })
    }

    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frameId) window.cancelAnimationFrame(frameId)
      mediaQuery.removeEventListener?.('change', updatePreference)
    }
  }, [])

  const motionProps = useMemo(() => ({
    x: mouse.x,
    y: mouse.y,
    transition: { type: 'spring', stiffness: 70, damping: 20, mass: 0.5 },
  }), [mouse.x, mouse.y])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={prefersReducedMotion ? { opacity: 1 } : motionProps}
      initial={false}
    >
      <AnimatePresence mode="wait">
        <WeatherBackground key={weatherKey} weatherKey={weatherKey} weatherLabel={weatherLabel} prefersReducedMotion={prefersReducedMotion} />
      </AnimatePresence>
    </motion.div>
  )
}
