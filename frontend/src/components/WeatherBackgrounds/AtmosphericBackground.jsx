import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export function AtmosphericBackground({ weatherCode = 0, opacity = 0.12 }) {
  const getConfig = (code) => {
    // Clear - warm sunlight
    if (code === 0) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(255, 200, 100, 0.15) 0%, rgba(135, 206, 235, 0.1) 100%)',
        hasGlow: true,
        glowColor: 'rgba(255, 200, 100, 0.15)',
        hasFog: false,
        fogDensity: 0,
      }
    }

    // Cloudy
    if ([1, 2, 3].includes(code)) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(200, 200, 200, 0.12) 0%, rgba(150, 150, 160, 0.08) 100%)',
        hasGlow: false,
        glowColor: 'transparent',
        hasFog: true,
        fogDensity: 0.2,
      }
    }

    // Rainy
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(120, 120, 140, 0.15) 0%, rgba(100, 100, 120, 0.1) 100%)',
        hasGlow: false,
        glowColor: 'transparent',
        hasFog: true,
        fogDensity: 0.3,
      }
    }

    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(60, 60, 90, 0.18) 0%, rgba(40, 40, 70, 0.12) 100%)',
        hasGlow: true,
        glowColor: 'rgba(100, 100, 200, 0.08)',
        hasFog: true,
        fogDensity: 0.4,
      }
    }

    // Snow - moonlight
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(200, 220, 240, 0.15) 0%, rgba(150, 180, 210, 0.1) 100%)',
        hasGlow: true,
        glowColor: 'rgba(200, 220, 240, 0.12)',
        hasFog: true,
        fogDensity: 0.25,
      }
    }

    // Fog
    if ([45, 48].includes(code)) {
      return {
        baseGradient: 'linear-gradient(180deg, rgba(180, 180, 180, 0.15) 0%, rgba(150, 150, 150, 0.1) 100%)',
        hasGlow: false,
        glowColor: 'transparent',
        hasFog: true,
        fogDensity: 0.5,
      }
    }

    // Default
    return {
      baseGradient: 'linear-gradient(180deg, rgba(180, 180, 190, 0.12) 0%, rgba(140, 140, 160, 0.08) 100%)',
      hasGlow: false,
      glowColor: 'transparent',
      hasFog: true,
      fogDensity: 0.15,
    }
  }

  const config = useMemo(() => getConfig(weatherCode), [weatherCode])

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      {/* Base atmospheric gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: config.baseGradient,
          opacity: opacity,
        }}
      />

      {/* Glow effect (sun/moon) */}
      {config.hasGlow && (
        <motion.div
          className="absolute"
          style={{
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
            top: '-50px',
            right: '-100px',
            filter: 'blur(40px)',
          }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Animated fog layer */}
      {config.hasFog && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 1000px 300px at 50% 100%, rgba(255,255,255,${config.fogDensity * 0.1}) 0%, transparent 70%)`,
            }}
            animate={{ y: [0, 15, 0] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 800px 250px at 30% 80%, rgba(200,200,200,${config.fogDensity * 0.08}) 0%, transparent 60%)`,
            }}
            animate={{ y: [15, 0, 15], x: [-20, 20, -20] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Distant mountain silhouette effect */}
      <div
        className="absolute bottom-0 inset-x-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)',
        }}
      />
    </div>
  )
}

export default AtmosphericBackground
