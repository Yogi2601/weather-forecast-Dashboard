import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export function WeatherCardBackground({ weatherCode = 0, opacity = 0.15 }) {
  const getConfig = (code) => {
    // Sunny
    if (code === 0) {
      return {
        gradient: 'linear-gradient(135deg, rgba(255, 200, 87, 0.25) 0%, rgba(135, 206, 235, 0.15) 100%)',
        hasAnimation: true,
        animationType: 'glow',
        hasParticles: false,
      }
    }

    // Partly cloudy
    if ([1, 2].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(200, 210, 220, 0.2) 0%, rgba(100, 150, 200, 0.12) 100%)',
        hasAnimation: true,
        animationType: 'clouds',
        hasParticles: false,
      }
    }

    // Cloudy
    if (code === 3) {
      return {
        gradient: 'linear-gradient(135deg, rgba(160, 170, 180, 0.22) 0%, rgba(120, 130, 140, 0.14) 100%)',
        hasAnimation: true,
        animationType: 'clouds',
        hasParticles: false,
      }
    }

    // Rain
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(100, 120, 150, 0.25) 0%, rgba(80, 100, 140, 0.15) 100%)',
        hasAnimation: true,
        animationType: 'rain',
        hasParticles: true,
      }
    }

    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(50, 60, 100, 0.28) 0%, rgba(30, 40, 80, 0.18) 100%)',
        hasAnimation: true,
        animationType: 'lightning',
        hasParticles: true,
      }
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(220, 230, 240, 0.2) 0%, rgba(180, 210, 240, 0.12) 100%)',
        hasAnimation: true,
        animationType: 'snow',
        hasParticles: true,
      }
    }

    // Fog
    if ([45, 48].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(170, 170, 170, 0.2) 0%, rgba(140, 140, 150, 0.12) 100%)',
        hasAnimation: true,
        animationType: 'mist',
        hasParticles: false,
      }
    }

    // Default
    return {
      gradient: 'linear-gradient(135deg, rgba(180, 190, 200, 0.18) 0%, rgba(140, 150, 170, 0.1) 100%)',
      hasAnimation: false,
      animationType: 'none',
      hasParticles: false,
    }
  }

  const config = useMemo(() => getConfig(weatherCode), [weatherCode])

  const renderAnimation = () => {
    switch (config.animationType) {
      case 'glow':
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 200, 87, 0.1) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )

      case 'clouds':
        return (
          <>
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 400px 100px at 20% 40%, rgba(255,255,255,0.08) 0%, transparent 60%)',
              }}
              animate={{ x: [-400, 500] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 300px 80px at 80% 60%, rgba(255,255,255,0.06) 0%, transparent 50%)',
              }}
              animate={{ x: [500, -400] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )

      case 'rain':
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
              backgroundSize: '20px 20px',
            }}
            animate={{ backgroundPosition: ['0px 0px', '20px 0px'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )

      case 'lightning':
        return (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.8, 0.8, 0.95, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.95, 1] }}
            style={{ background: 'rgba(100, 150, 255, 0.08)' }}
          />
        )

      case 'snow':
        return (
          <motion.div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              backgroundPosition: '0 0',
            }}
            animate={{ backgroundPosition: ['0 0', '50px 50px'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        )

      case 'mist':
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 600px 200px at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: config.gradient,
          opacity: opacity,
        }}
      />

      {/* Weather-specific animation */}
      {config.hasAnimation && renderAnimation()}

      {/* Subtle gloss effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)',
        }}
      />
    </div>
  )
}

export default WeatherCardBackground
