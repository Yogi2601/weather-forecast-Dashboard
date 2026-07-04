import { useCallback, useEffect, useState } from 'react'

const NOTIFICATIONS_KEY = 'weatherDashboard.notifications'
const MAX_NOTIFICATIONS = 20

function readNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!raw) return []
    const notifications = JSON.parse(raw)
    return Array.isArray(notifications) ? notifications : []
  } catch {
    return []
  }
}

function writeNotifications(notifications) {
  try {
    const toStore = notifications.slice(0, MAX_NOTIFICATIONS)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(toStore))
  } catch {
    // localStorage unavailable
  }
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState(readNotifications)

  useEffect(() => {
    writeNotifications(notifications)
  }, [notifications])

  const addNotification = useCallback((type, title, message) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [notification, ...prev])
    return notification.id
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    unreadCount,
  }
}
