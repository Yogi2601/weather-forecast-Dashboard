import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, Bell, MapPin, Loader2, MapPinned, Star, History, AlertCircle, CheckCircle2, Settings } from 'lucide-react'
import { searchLocations } from '../services/weatherService'

const DEBOUNCE_MS = 300

export default function Navbar({
  setSidebarOpen,
  onSearch,
  onNavigateToFilters,
  onUseCurrentLocation,
  recentSearches = [],
  favorites = [],
  isFavorite,
  onToggleFavorite,
  gpsStatus = 'idle',
  gpsMessage = '',
  onOpenSettings,
  onOpenNotifications,
  unreadNotificationCount = 0,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)

  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    function handleEscapeKey(e) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSuggestions([])
      setIsLoading(false)
      setHasSearched(false)
      return
    }

    setIsLoading(true)

    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      searchLocations(searchTerm, { signal: controller.signal })
        .then((results) => {
          setSuggestions(results)
          setHasSearched(true)
          setActiveIndex(-1)
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setSuggestions([])
            setHasSearched(true)
          }
        })
        .finally(() => setIsLoading(false))
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [searchTerm])

  const selectLocation = (location) => {
    if (!location) return

    // If location has coordinates (from HierarchicalSearch), pass the full object
    if (location.latitude !== undefined && location.longitude !== undefined) {
      console.log('Location with coordinates selected:', location)
      onSearch?.(location)
    } else {
      // Otherwise, pass just the name (from regular search)
      console.log('Location by name selected:', location.name)
      onSearch?.(location.name)
    }

    setSearchTerm('')
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      selectLocation(suggestions[activeIndex])
      return
    }
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim())
      setSearchTerm('')
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen || !suggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const [showGpsMessage, setShowGpsMessage] = useState(false)

  useEffect(() => {
    if (gpsStatus === 'idle' || gpsStatus === 'loading' || !gpsMessage) {
      setShowGpsMessage(false)
      return
    }

    setShowGpsMessage(true)
    const timer = setTimeout(() => setShowGpsMessage(false), 5000)
    return () => clearTimeout(timer)
  }, [gpsStatus, gpsMessage])

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const isSearching = searchTerm.trim().length >= 2
  const showAutocomplete = isOpen && isSearching
  const showHistoryPanel = isOpen && !isSearching && (favorites.length > 0 || recentSearches.length > 0) && !searchTerm.trim()

  return (
    <header className="flex items-center justify-between h-20 px-6 border-b border-slate-800 bg-slate-950/20 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-white tracking-tight">Weather Console</h1>
          <p className="text-xs text-slate-400">{formattedDate} • SaaS Live Environment</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-full justify-end md:justify-between lg:max-w-4xl ml-4">
        <div ref={containerRef} className="relative flex-1 flex items-center gap-2">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => {
                if (searchTerm.trim()) {
                  setIsOpen(true)
                }
              }}
              onKeyDown={(e) => {
                if (searchTerm.trim()) {
                  handleKeyDown(e)
                } else if (e.key === 'Escape') {
                  setIsOpen(false)
                }
              }}
              role="combobox"
              aria-expanded={showAutocomplete || showHistoryPanel}
              aria-autocomplete="list"
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-200"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
            )}
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showAutocomplete && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
              >
                {isLoading && suggestions.length === 0 && (
                  <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    Searching...
                  </div>
                )}

                {!isLoading && hasSearched && suggestions.length === 0 && (
                  <div className="px-4 py-4 text-sm text-slate-500 text-center">
                    No locations found
                  </div>
                )}

                {suggestions.length > 0 && (
                  <>
                    <ul className="max-h-72 overflow-y-auto custom-scrollbar py-1">
                      {suggestions.map((location, i) => (
                        <li key={location.id ?? `${location.name}-${i}`}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => selectLocation(location)}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                              i === activeIndex
                                ? 'bg-blue-500/15 text-white'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <MapPinned className={`h-4 w-4 flex-shrink-0 ${i === activeIndex ? 'text-blue-400' : 'text-slate-500'}`} />
                            <span className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-semibold text-white">{location.name}</span>
                                  <span className="ml-1.5 text-xs text-slate-400">
                                    {[location.region, location.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              </div>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-slate-800/50 px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('')
                          setIsOpen(false)
                          onNavigateToFilters?.()
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 text-sm font-medium transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Use Weather Filters for Advanced Search
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Panel */}
          <AnimatePresence>
            {showHistoryPanel && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-2 z-40 max-h-80 overflow-y-auto custom-scrollbar rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
              >
                {favorites.length > 0 && (
                  <div className="py-1">
                    <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <Star className="h-3 w-3 text-amber-400" />
                      Favorite Cities
                    </div>
                    <ul>
                      {favorites.map((city) => (
                        <li key={`fav-${city}`}>
                          <div className="group flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/60">
                            <button
                              type="button"
                              onClick={() => selectLocation({ name: city })}
                              className="flex min-w-0 flex-1 items-center gap-2.5"
                            >
                              <MapPinned className="h-4 w-4 flex-shrink-0 text-slate-500" />
                              <span className="truncate font-medium text-white">{city}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleFavorite?.(city)}
                              className="flex-shrink-0 text-slate-500 transition-colors hover:text-amber-400"
                              title="Remove from favorites"
                            >
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="border-t border-slate-800/80 py-1">
                    <div className="flex items-center gap-1.5 px-4 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <History className="h-3 w-3 text-blue-400" />
                      Recent Searches
                    </div>
                    <ul>
                      {recentSearches.map((city) => (
                        <li key={`recent-${city}`}>
                          <div className="group flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/60">
                            <button
                              type="button"
                              onClick={() => selectLocation({ name: city })}
                              className="flex min-w-0 flex-1 items-center gap-2.5"
                            >
                              <MapPinned className="h-4 w-4 flex-shrink-0 text-slate-500" />
                              <span className="truncate font-medium text-white">{city}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleFavorite?.(city)}
                              className={`flex-shrink-0 transition-colors ${
                                isFavorite?.(city) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                              }`}
                              title={isFavorite?.(city) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFavorite?.(city) ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 font-medium">API: 100% Online</span>
          </div>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={gpsStatus === 'loading'}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {gpsStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-sm font-medium">{gpsStatus === 'loading' ? 'Locating...' : 'GPS'}</span>
            </button>

            <AnimatePresence>
              {showGpsMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`absolute right-0 top-full mt-2 z-40 w-64 rounded-xl border px-3.5 py-3 text-xs font-medium shadow-2xl backdrop-blur-md ${
                    gpsStatus === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {gpsStatus === 'success' ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                    )}
                    <span>{gpsMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
