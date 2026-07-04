import React from 'react'
import { motion } from 'framer-motion'

export default function Atmosphere({ weatherKey = 'clear', prefersReducedMotion = false }) {
  const isNight = weatherKey === 'night'
  const isFog = weatherKey === 'fog'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={prefersReducedMotion ? { opacity: 0.06 } : { opacity: [0.06, 0.14, 0.06], x: [-18, 10, -18] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-24%] left-[-20%] h-64 w-[140%] rounded-full bg-sky-50/10 blur-[90px]"
      />
      <motion.div
        animate={prefersReducedMotion ? { opacity: 0.055 } : { opacity: [0.04, 0.08, 0.04], x: [8, -16, 8] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-12%] left-[-8%] h-44 w-[125%] rounded-full bg-white/10 blur-[70px]"
      />
      <motion.div
        animate={prefersReducedMotion ? { opacity: 0.08 } : { opacity: [0.06, 0.12, 0.06], y: [0, -4, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-x-0 bottom-[-8%] h-32 rounded-[50%] bg-[radial-gradient(circle,_rgba(125,201,250,0.25)_0%,_rgba(125,201,250,0.08)_55%,_transparent_100%)]"
      />
      {isFog && (
        <motion.div
          animate={prefersReducedMotion ? { opacity: 0.2 } : { opacity: [0.14, 0.24, 0.14], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[12%] left-[-5%] h-32 w-[110%] rounded-full bg-slate-100/20 blur-[100px]"
        />
      )}
      {isNight && (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent" />
      )}
    </div>
  )
}
