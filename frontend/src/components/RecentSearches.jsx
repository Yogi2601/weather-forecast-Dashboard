import React from 'react'
import { motion } from 'framer-motion'
import { History, X } from 'lucide-react'

export default function RecentSearches({ searches = [], onSelectCity, onDeleteSearch, onClearHistory }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Recent Searches</h3>
          <p className="mt-1 text-sm text-slate-500">Saved locally for quick access</p>
        </div>
        <button
          onClick={onClearHistory}
          className="rounded-full border border-slate-800 bg-slate-950/50 px-3 py-1 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {searches.length ? searches.map((city, index) => (
          <motion.div
            key={`${city}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-3 hover:bg-slate-950/70 hover:border-slate-700 transition-all"
          >
            <button
              onClick={() => onSelectCity(city)}
              className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <History className="h-4 w-4 text-sky-400" />
              <span className="truncate">{city}</span>
            </button>
            <button
              onClick={() => onDeleteSearch(city)}
              className="ml-2 rounded-full p-1.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Remove from recent searches"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">
            No recent searches yet.
          </div>
        )}
      </div>
    </motion.div>
  )
}
