import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export function QuickAccessBackground({ weatherCode = 0, opacity = 0.12 }) {
  const getConfig = (code) => {
    // Clear/Sunny - soft sun rays and blue sky
    if (code === 0) {
      return {
        gradient: 'linear-gradient(135deg, rgba(255, 200, 87, 0.15) 0%, rgba(135, 206, 235, 0.12) 100%)',
        hasRays: true,
        hasClouds: false,
        hasRain: false,
        hasSnow: false,
        hasMist: false,
        hasLightning: false,
        rayColor: 'rgba(255, 220, 150, 0.12)',
      }
    }

    // Partly cloudy - slow-moving clouds
    if ([1, 2].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(200, 210, 220, 0.15) 0%, rgba(130, 160, 200, 0.1) 100%)',
        hasRays: false,
        hasClouds: true,
        hasRain: false,
        hasSnow: false,
        hasMist: false,
        hasLightning: false,
        cloudOpacity: 0.4,
      }
    }

    // Cloudy - layered gray clouds
    if (code === 3) {
      return {
        gradient: 'linear-gradient(135deg, rgba(160, 170, 180, 0.18) 0%, rgba(120, 130, 140, 0.12) 100%)',
        hasRays: false,
        hasClouds: true,
        hasRain: false,
        hasSnow: false,
        hasMist: false,
        hasLightning: false,
        cloudOpacity: 0.6,
      }
    }

    // Rain - subtle rain streaks and mist
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(100, 120, 150, 0.2) 0%, rgba(80, 100, 140, 0.12) 100%)',
        hasRays: false,
        hasClouds: true,
        hasRain: true,
        hasSnow: false,
        hasMist: true,
        hasLightning: false,
        cloudOpacity: 0.7,
      }
    }

    // Thunderstorm - dark clouds with lightning glow
    if ([95, 96, 99].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(50, 60, 100, 0.22) 0%, rgba(30, 40, 80, 0.15) 100%)',
        hasRays: false,
        hasClouds: true,
        hasRain: true,
        hasSnow: false,
        hasMist: true,
        hasLightning: true,
        cloudOpacity: 0.8,
      }
    }

    // Snow - gentle falling snowflakes
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(220, 230, 240, 0.15) 0%, rgba(180, 210, 240, 0.1) 100%)',
        hasRays: false,
        hasClouds: true,
        hasRain: false,
        hasSnow: true,
        hasMist: false,
        hasLightning: false,
        cloudOpacity: 0.5,
      }
    }

    // Fog - drifting mist
    if ([45, 48].includes(code)) {
      return {
        gradient: 'linear-gradient(135deg, rgba(170, 170, 170, 0.18) 0%, rgba(140, 140, 150, 0.12) 100%)',
        hasRays: false,
        hasClouds: false,
        hasRain: false,
        hasSnow: false,
        hasMist: true,
        hasLightning: false,
        mistDensity: 0.5,
      }
    }

    // Default
    return {
      gradient: 'linear-gradient(135deg, rgba(180, 190, 200, 0.15) 0%, rgba(140, 150, 170, 0.1) 100%)',
      hasRays: false,
      hasClouds: true,
      hasRain: false,
      hasSnow: false,
      hasMist: false,
      hasLightning: false,
      cloudOpacity: 0.3,
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

      {/* Sun rays */}
      {config.hasRays && (
        <>
          <motion.div
            className="absolute"
            style={{
              width: '250px',
              height: '250px',
              background: `radial-gradient(circle, ${config.rayColor} 0%, transparent 70%)`,
              top: '-80px',
              right: '-100px',
              filter: 'blur(35px)',
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Animated clouds */}
      {config.hasClouds && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(ellipse 600px 120px at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
            animate={{ x: [-600, 700] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(ellipse 500px 100px at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)',
            }}
            animate={{ x: [700, -600] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      {/* Rain streaks */}
      {config.hasRain && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px)',
            backgroundSize: '16px 16px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '16px 0px'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Mist effect */}
      {config.hasMist && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 800px 200px at 50% 80%, rgba(255,255,255,${(config.mistDensity || 0.2) * 0.1}) 0%, transparent 70%)`,
            }}
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 600px 150px at 30% 70%, rgba(200,200,200,${(config.mistDensity || 0.2) * 0.08}) 0%, transparent 60%)`,
            }}
            animate={{ y: [20, 0, 20], x: [-30, 30, -30] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Snowflakes */}
      {config.hasSnow && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
          }}
          animate={{ backgroundPosition: ['0 0', '40px 40px'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Lightning glow */}
      {config.hasLightning && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.8, 0.8, 0.92, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.95, 1] }}
          style={{ background: 'rgba(80, 120, 200, 0.06)' }}
        />
      )}

      {/* Glassmorphism effect - blur and subtle reflections */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)',
          backdropFilter: 'blur(0.5px)',
        }}
      />
    </div>
  )
}

export default QuickAccessBackground
