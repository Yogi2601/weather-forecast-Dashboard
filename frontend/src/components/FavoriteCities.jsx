import React from 'react'
import { motion } from 'framer-motion'
import { Star, Trash2, MapPin } from 'lucide-react'

export default function FavoriteCities({ favorites = [], onSelectCity, onRemoveFavorite }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Favorite Cities</h3>
          <p className="mt-1 text-sm text-slate-500">Saved for one-click access</p>
        </div>
      </div>

      <div className="space-y-2">
        {favorites.length ? favorites.map((city, index) => (
          <div key={`${city}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-3 py-3">
            <button onClick={() => onSelectCity(city)} className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-slate-300 hover:text-white">
              <Star className="h-4 w-4 text-amber-400" />
              {city}
            </button>
            <button onClick={() => onRemoveFavorite(city)} className="rounded-full p-2 text-slate-500 hover:bg-slate-800 hover:text-rose-300">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">
            No favorite cities yet.
          </div>
        )}
      </div>
    </motion.div>
  )
}
