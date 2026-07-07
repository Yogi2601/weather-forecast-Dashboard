import React from 'react'
import { motion } from 'framer-motion'

export function QuickAccessRow({ icon: Icon, label, value, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-600/40 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />}
        <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <motion.span
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        className="text-xs text-slate-450 font-bold group-hover:text-blue-300 transition-colors"
      >
        {value}
      </motion.span>
    </motion.div>
  )
}

export function QuickAccessChip({ text, onClick, onDelete }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(59, 130, 246, 0.2)' }}
      whileTap={{ scale: 0.96 }}
      className="relative px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold border border-slate-700 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all duration-200 group"
    >
      {text}

      {onDelete && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          whileHover={{ scale: 1.2 }}
          className="ml-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
        >
          ×
        </motion.button>
      )}
    </motion.button>
  )
}

export function GlassmorphicCard({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-lg p-4 ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

export default { QuickAccessRow, QuickAccessChip, GlassmorphicCard }
