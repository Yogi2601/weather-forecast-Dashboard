import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export function AnimatedSkyBackground({ weatherCode = 0, opacity = 0.15 }) {
  const getBackgroundConfig = (code) => {
    // Clear sky
    if (code === 0) {
      return {
        gradient: 'linear-gradient(180deg, rgba(135, 206, 235, 0.3) 0%, rgba(255, 214, 165, 0.2) 100%)',
        hasCloudLayer: false,
        cloudOpacity: 0,
        hasRain: false,
      }
    }

    // Partly cloudy
    if ([1, 2].includes(code)) {
      return {
        gradient: 'linear-gradient(180deg, rgba(107, 140, 174, 0.25) 0%, rgba(192, 192, 192, 0.15) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.4,
        hasRain: false,
      }
    }

    // Cloudy
    if (code === 3) {
      return {
        gradient: 'linear-gradient(180deg, rgba(107, 140, 174, 0.3) 0%, rgba(160, 160, 170, 0.2) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.6,
        hasRain: false,
      }
    }

    // Rain
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        gradient: 'linear-gradient(180deg, rgba(74, 95, 127, 0.3) 0%, rgba(100, 100, 110, 0.2) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.7,
        hasRain: true,
      }
    }

    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return {
        gradient: 'linear-gradient(180deg, rgba(26, 47, 74, 0.35) 0%, rgba(51, 51, 70, 0.2) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.8,
        hasRain: true,
      }
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        gradient: 'linear-gradient(180deg, rgba(176, 208, 232, 0.25) 0%, rgba(240, 240, 248, 0.15) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.5,
        hasRain: false,
      }
    }

    // Fog
    if ([45, 48].includes(code)) {
      return {
        gradient: 'linear-gradient(180deg, rgba(136, 136, 136, 0.25) 0%, rgba(170, 170, 170, 0.15) 100%)',
        hasCloudLayer: true,
        cloudOpacity: 0.9,
        hasRain: false,
      }
    }

    // Default
    return {
      gradient: 'linear-gradient(180deg, rgba(107, 140, 174, 0.2) 0%, rgba(192, 192, 192, 0.1) 100%)',
      hasCloudLayer: true,
      cloudOpacity: 0.3,
      hasRain: false,
    }
  }

  const config = useMemo(() => getBackgroundConfig(weatherCode), [weatherCode])

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

      {/* Animated clouds */}
      {config.hasCloudLayer && (
        <>
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 800px 200px at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
            }}
            animate={{ x: [-800, 800] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 600px 150px at 80% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            }}
            animate={{ x: [800, -800] }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Horizon line */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
    </div>
  )
}

export default AnimatedSkyBackground
