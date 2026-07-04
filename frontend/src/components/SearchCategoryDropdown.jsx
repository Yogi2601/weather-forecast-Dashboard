import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function SearchCategoryDropdown({ selectedCategory, onCategoryChange, isOpen, onOpenChange }) {
  const buttonRef = useRef(null)

  const categories = [
    { id: 'city', label: 'Cities', icon: '🏙', description: 'Search any city' },
    { id: 'state', label: 'States / Provinces', icon: '🗺', description: 'Search any state or province' },
    { id: 'country', label: 'Countries', icon: '🌍', description: 'Search any country' },
  ]

  const selected = categories.find(c => c.id === selectedCategory)

  const handleSelect = (categoryId) => {
    onCategoryChange(categoryId)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 min-w-[120px] text-sm"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected?.icon} {selected?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md overflow-hidden"
          >
            <div className="py-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500/15 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{category.icon}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white">{category.label}</div>
                      <div className="text-xs text-slate-400">{category.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
