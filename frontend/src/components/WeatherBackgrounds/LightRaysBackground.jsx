import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export function LightRaysBackground({ weatherCode = 0, opacity = 0.12 }) {
  const getConfig = (code) => {
    // Clear/Sunny
    if (code === 0) {
      return {
        gradient: 'linear-gradient(135deg, rgba(255, 214, 165, 0.2) 0%, rgba(135, 206, 235, 0.15) 100%)',
        rayColor: 'rgba(255, 255, 200, 0.15)',
        rayCount: 3,
      }
    }

    // Cloudy/Partly cloudy
    if ([1, 2, 3].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(107, 140, 174, 0.12) 100%)',
        rayColor: 'rgba(200, 200, 200, 0.08)',
        rayCount: 2,
      }
    }

    // Rainy
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(100, 100, 120, 0.15) 0%, rgba(80, 80, 100, 0.1) 100%)',
        rayColor: 'rgba(150, 150, 180, 0.06)',
        rayCount: 1,
      }
    }

    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(50, 50, 80, 0.18) 0%, rgba(30, 30, 50, 0.12) 100%)',
        rayColor: 'rgba(100, 100, 150, 0.05)',
        rayCount: 0,
      }
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(240, 240, 248, 0.15) 0%, rgba(176, 208, 232, 0.12) 100%)',
        rayColor: 'rgba(255, 255, 255, 0.1)',
        rayCount: 2,
      }
    }

    // Fog
    if ([45, 48].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(170, 170, 170, 0.12) 0%, rgba(136, 136, 136, 0.08) 100%)',
        rayColor: 'rgba(150, 150, 150, 0.04)',
        rayCount: 0,
      }
    }

    // Default
    return {
      gradient: 'linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(107, 140, 174, 0.08) 100%)',
      rayColor: 'rgba(200, 200, 200, 0.06)',
      rayCount: 1,
    }
  }

  const config = useMemo(() => getConfig(weatherCode), [weatherCode])

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: config.gradient,
          opacity: opacity,
        }}
      />

      {/* Light rays */}
      {Array.from({ length: config.rayCount }).map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute"
          style={{
            width: '200px',
            height: '200px',
            background: `radial-gradient(ellipse at center, ${config.rayColor} 0%, transparent 70%)`,
            top: `${20 + i * 30}%`,
            left: `${10 + i * 25}%`,
            filter: 'blur(30px)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle moving mist */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 900px 300px at 50% 100%, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }}
        animate={{ y: [0, -20, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export default LightRaysBackground
