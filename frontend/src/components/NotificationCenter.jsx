import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, MapPin, Trash2, Download, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'

const NOTIFICATION_ICONS = {
  location_added: MapPin,
  location_removed: Trash2,
  city_searched: MapPin,
  download_complete: Download,
  refresh_complete: CheckCircle2,
  rain_alert: AlertTriangle,
  temp_alert: Zap,
  api_error: AlertCircle,
}

const NOTIFICATION_COLORS = {
  location_added: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  location_removed: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
  city_searched: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  download_complete: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
  refresh_complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  rain_alert: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  temp_alert: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  api_error: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDelete,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
    return date.toLocaleDateString()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-4 top-4 bottom-4 z-[101] w-full max-w-md overflow-y-auto custom-scrollbar rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:right-6 sm:top-6 sm:bottom-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight">Notifications</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-slate-400 transition-colors hover:text-white hover:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {unreadCount > 0 && (
              <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25">
                <span className="text-sm text-blue-400 font-semibold">{unreadCount} unread</span>
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Mark all read
                </button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                  <p className="text-slate-400 text-sm">All caught up!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type] || AlertCircle
                  const colorClass = NOTIFICATION_COLORS[notification.type]

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all ${colorClass} ${
                        notification.read ? 'opacity-60' : ''
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <p className="text-xs opacity-80 mt-1">{notification.message}</p>
                          <p className="text-xs opacity-60 mt-2">{formatTime(notification.timestamp)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(notification.id)
                          }}
                          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/20 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="mt-6 w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
              >
                Clear All
              </button>
            )}

            <p className="mt-6 text-center text-[11px] text-slate-600">
              Up to 20 notifications stored locally.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
