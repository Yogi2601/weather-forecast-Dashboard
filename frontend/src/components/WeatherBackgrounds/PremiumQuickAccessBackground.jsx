import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function PremiumQuickAccessBackground({ weatherCode = 0, opacity = 0.18 }) {
  const [currentHour, setCurrentHour] = useState(new Date().getHours())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const isNight = currentHour < 6 || currentHour >= 18
  const isSunrise = currentHour >= 6 && currentHour < 8
  const isSunset = currentHour >= 16 && currentHour < 18

  const getConfig = (code) => {
    // Clear sky
    if (code === 0) {
      return {
        skyGradient: isNight
          ? 'linear-gradient(180deg, rgba(10, 20, 50, 0.35) 0%, rgba(20, 40, 80, 0.25) 50%, rgba(40, 80, 120, 0.15) 100%)'
          : isSunrise
          ? 'linear-gradient(180deg, rgba(255, 120, 60, 0.25) 0%, rgba(255, 160, 100, 0.2) 30%, rgba(135, 180, 235, 0.15) 100%)'
          : isSunset
          ? 'linear-gradient(180deg, rgba(255, 100, 40, 0.25) 0%, rgba(255, 140, 80, 0.2) 30%, rgba(135, 100, 180, 0.15) 100%)'
          : 'linear-gradient(180deg, rgba(135, 206, 235, 0.25) 0%, rgba(200, 220, 240, 0.15) 50%, rgba(255, 200, 120, 0.12) 100%)',
        hasStars: isNight,
        hasMoon: isNight,
        hasCloudLayer: false,
        cloudOpacity: 0,
        hasSunRays: !isNight && code === 0,
        rayColor: isSunrise || isSunset ? 'rgba(255, 120, 60, 0.15)' : 'rgba(255, 200, 100, 0.12)',
        hasFog: false,
        hasParticles: false,
        horizonColor: isNight ? 'rgba(20, 40, 80, 0.3)' : 'rgba(200, 150, 100, 0.2)',
      }
    }

    // Partly cloudy
    if ([1, 2].includes(code)) {
      return {
        skyGradient: isNight
          ? 'linear-gradient(180deg, rgba(30, 40, 70, 0.3) 0%, rgba(40, 60, 100, 0.2) 100%)'
          : 'linear-gradient(180deg, rgba(135, 180, 220, 0.25) 0%, rgba(180, 200, 230, 0.15) 100%)',
        hasStars: isNight,
        hasMoon: isNight,
        hasCloudLayer: true,
        cloudOpacity: 0.45,
        hasSunRays: !isNight && code === 1,
        rayColor: isSunrise || isSunset ? 'rgba(255, 120, 60, 0.12)' : 'rgba(200, 200, 200, 0.1)',
        hasFog: false,
        hasParticles: false,
        horizonColor: isNight ? 'rgba(40, 60, 100, 0.25)' : 'rgba(180, 180, 180, 0.15)',
      }
    }

    // Cloudy
    if (code === 3) {
      return {
        skyGradient: isNight
          ? 'linear-gradient(180deg, rgba(40, 50, 80, 0.32) 0%, rgba(50, 70, 110, 0.22) 100%)'
          : 'linear-gradient(180deg, rgba(120, 150, 180, 0.28) 0%, rgba(150, 170, 190, 0.18) 100%)',
        hasStars: isNight,
        hasMoon: isNight,
        hasCloudLayer: true,
        cloudOpacity: 0.65,
        hasSunRays: false,
        rayColor: 'transparent',
        hasFog: true,
        fogDensity: 0.15,
        hasParticles: false,
        horizonColor: isNight ? 'rgba(50, 70, 110, 0.3)' : 'rgba(150, 150, 160, 0.18)',
      }
    }

    // Rain
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        skyGradient: 'linear-gradient(180deg, rgba(60, 80, 120, 0.32) 0%, rgba(80, 100, 140, 0.22) 100%)',
        hasStars: false,
        hasMoon: false,
        hasCloudLayer: true,
        cloudOpacity: 0.75,
        hasSunRays: false,
        rayColor: 'transparent',
        hasFog: true,
        fogDensity: 0.25,
        hasParticles: 'rain',
        horizonColor: 'rgba(80, 100, 140, 0.3)',
      }
    }

    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return {
        skyGradient: 'linear-gradient(180deg, rgba(30, 40, 70, 0.38) 0%, rgba(40, 60, 100, 0.28) 100%)',
        hasStars: false,
        hasMoon: false,
        hasCloudLayer: true,
        cloudOpacity: 0.85,
        hasSunRays: false,
        rayColor: 'transparent',
        hasFog: true,
        fogDensity: 0.35,
        hasParticles: 'rain',
        hasLightning: true,
        horizonColor: 'rgba(40, 60, 100, 0.35)',
      }
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        skyGradient: 'linear-gradient(180deg, rgba(180, 200, 220, 0.3) 0%, rgba(200, 220, 240, 0.2) 100%)',
        hasStars: isNight,
        hasMoon: isNight,
        hasCloudLayer: true,
        cloudOpacity: 0.6,
        hasSunRays: false,
        rayColor: isNight ? 'transparent' : 'rgba(220, 220, 240, 0.1)',
        hasFog: true,
        fogDensity: 0.2,
        hasParticles: 'snow',
        horizonColor: 'rgba(200, 220, 240, 0.25)',
      }
    }

    // Fog
    if ([45, 48].includes(code)) {
      return {
        skyGradient: 'linear-gradient(180deg, rgba(140, 150, 160, 0.32) 0%, rgba(160, 170, 180, 0.22) 100%)',
        hasStars: false,
        hasMoon: false,
        hasCloudLayer: false,
        cloudOpacity: 0,
        hasSunRays: false,
        rayColor: 'transparent',
        hasFog: true,
        fogDensity: 0.5,
        hasParticles: 'mist',
        horizonColor: 'rgba(160, 170, 180, 0.3)',
      }
    }

    // Default
    return {
      skyGradient: isNight
        ? 'linear-gradient(180deg, rgba(30, 40, 70, 0.3) 0%, rgba(40, 60, 100, 0.2) 100%)'
        : 'linear-gradient(180deg, rgba(135, 180, 220, 0.25) 0%, rgba(180, 200, 230, 0.15) 100%)',
      hasStars: isNight,
      hasMoon: isNight,
      hasCloudLayer: true,
      cloudOpacity: 0.4,
      hasSunRays: !isNight,
      rayColor: isNight ? 'transparent' : 'rgba(200, 200, 200, 0.08)',
      hasFog: false,
      hasParticles: false,
      horizonColor: isNight ? 'rgba(40, 60, 100, 0.25)' : 'rgba(180, 180, 180, 0.15)',
    }
  }

  const config = useMemo(() => getConfig(weatherCode), [weatherCode, isNight, isSunrise, isSunset])

  return (
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      {/* Base sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: config.skyGradient,
          opacity: opacity,
        }}
      />

      {/* Stars (night sky) */}
      {config.hasStars && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 1.5 + 0.5 + 'px',
                height: Math.random() * 1.5 + 0.5 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 60 + '%',
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: Math.random() * 3 + 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Moon glow (night) */}
      {config.hasMoon && (
        <motion.div
          className="absolute"
          style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(240, 240, 200, 0.2) 0%, rgba(200, 200, 150, 0.1) 50%, transparent 70%)',
            top: '5%',
            right: '10%',
            filter: 'blur(20px)',
          }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Sun rays (day) */}
      {config.hasSunRays && (
        <motion.div
          className="absolute"
          style={{
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${config.rayColor} 0%, transparent 70%)`,
            top: '-50px',
            right: '-100px',
            filter: 'blur(30px)',
          }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Cloud layer 1 (slow) */}
      {config.hasCloudLayer && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 700px 140px at 15% 35%, rgba(255,255,255,0.12) 0%, transparent 60%)',
            opacity: config.cloudOpacity,
          }}
          animate={{ x: [-700, 800] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Cloud layer 2 (medium) */}
      {config.hasCloudLayer && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 600px 120px at 80% 45%, rgba(255,255,255,0.1) 0%, transparent 55%)',
            opacity: config.cloudOpacity * 0.7,
          }}
          animate={{ x: [800, -700] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Cloud layer 3 (fast) - foreground */}
      {config.hasCloudLayer && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 500px 100px at 50% 60%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            opacity: config.cloudOpacity * 0.5,
          }}
          animate={{ x: [-500, 800] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Fog layers */}
      {config.hasFog && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 900px 300px at 50% 90%, rgba(255,255,255,${config.fogDensity * 0.08}) 0%, transparent 70%)`,
            }}
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 700px 250px at 35% 85%, rgba(200,200,200,${config.fogDensity * 0.06}) 0%, transparent 60%)`,
            }}
            animate={{ y: [15, 0, 15], x: [-40, 40, -40] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Rain particles */}
      {config.hasParticles === 'rain' && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.06) 6px, rgba(255,255,255,0.06) 12px)',
            backgroundSize: '12px 12px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '12px 0px'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Snow particles */}
      {config.hasParticles === 'snow' && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 1.5px, transparent 1.5px)',
            backgroundSize: '35px 35px',
            backgroundPosition: '0 0',
          }}
          animate={{ backgroundPosition: ['0 0', '35px 35px'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Mist particles */}
      {config.hasParticles === 'mist' && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
            backgroundSize: '50px 50px',
            opacity: 0.5,
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Lightning glow (thunderstorm) */}
      {config.hasLightning && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.85, 0.85, 0.95, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.85, 0.95, 1] }}
          style={{ background: 'rgba(100, 150, 255, 0.08)' }}
        />
      )}

      {/* Horizon line with landscape silhouette */}
      <div
        className="absolute bottom-0 inset-x-0 h-1/4"
        style={{
          background: `linear-gradient(to top, ${config.horizonColor}, transparent 80%)`,
          backdropFilter: 'blur(0.5px)',
        }}
      />

      {/* Glassmorphism overlay - reflections and highlights */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.04) 100%)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Light sweep animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          width: '100px',
        }}
        animate={{ x: ['-100px', 'calc(100% + 100px)'] }}
        transition={{ duration: 12, repeat: Infinity, repeatDelay: 10, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default PremiumQuickAccessBackground
