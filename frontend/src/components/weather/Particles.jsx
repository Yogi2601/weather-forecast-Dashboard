import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function Particles({ weatherKey = 'clear', prefersReducedMotion = false }) {
  const particles = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => ({
      id: index,
      left: `${(index * 11) % 100}%`,
      top: `${(index * 17 + 5) % 100}%`,
      size: 1 + (index % 4),
      delay: index * 0.18,
      duration: 7 + (index % 6) * 2.5,
      xDistance: 8 + (index % 4) * 6,
      yDistance: 3 + (index % 3) * 2,
      opacity: 0.03 + (index % 4) * 0.01,
    }))
  }, [])

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            opacity: weatherKey === 'night' ? 0.08 : particle.opacity,
          }}
          animate={{
            x: [0, particle.xDistance, 0, -particle.xDistance, 0],
            y: [0, -particle.yDistance, particle.yDistance, 0, -particle.yDistance],
            opacity: [particle.opacity * 0.4, particle.opacity, particle.opacity * 0.5, particle.opacity, particle.opacity * 0.4],
          }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut', delay: particle.delay }}
        />
      ))}
    </div>
  )
}
