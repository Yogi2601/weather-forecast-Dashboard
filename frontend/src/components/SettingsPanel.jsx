import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Thermometer, Wind, Clock, Palette, Sparkles, Lock, Droplet,
  BarChart3, Bell, RotateCcw, Trash2, Info, MapPin, Heart
} from 'lucide-react'

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const isActive = value === option.value
        const isDisabled = option.disabled

        return (
          <button
            key={option.value}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) {
                onChange(option.value)
              }
            }}
            className={`relative flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? 'border-blue-500/40 bg-blue-500/15 text-white'
                : isDisabled
                  ? 'cursor-not-allowed border-slate-800 bg-slate-950/30 text-slate-600'
                  : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            {option.label}
            {isDisabled && <Lock className="h-3 w-3" />}
          </button>
        )
      })}
    </div>
  )
}

function SettingRow({ icon: Icon, iconColor, title, description, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900/80 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition-colors ${
        checked ? 'border-blue-500/40 bg-blue-500/30' : 'border-slate-700 bg-slate-800'
      }`}
    >
      <motion.span
        className={`absolute top-0.5 h-5 w-5 rounded-full shadow-md ${checked ? 'bg-blue-400' : 'bg-slate-400'}`}
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings,
  onClearRecentSearches,
  onClearNotifications,
  favorites = [],
  lastRefreshTime = null,
}) {
  const panelRef = useRef(null)
  const [activeTab, setActiveTab] = useState('general')

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

  const formatRefreshTime = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Thermometer },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'data', label: 'Data', icon: Trash2 },
    { id: 'about', label: 'About', icon: Info },
  ]

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
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-4 top-4 bottom-4 z-[101] w-full max-w-lg overflow-hidden custom-scrollbar rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:right-6 sm:top-6 sm:bottom-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-slate-400 transition-colors hover:text-white hover:border-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-800 px-6 pt-4 overflow-x-auto">
              {tabs.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {/* General Tab */}
              {activeTab === 'general' && (
                <>
                  <SettingRow icon={Thermometer} iconColor="text-rose-400" title="Temperature Unit" description="Used across the dashboard">
                    <SegmentedControl
                      value={settings.temperatureUnit}
                      onChange={(v) => onUpdateSetting('temperatureUnit', v)}
                      options={[
                        { value: 'celsius', label: '°C' },
                        { value: 'fahrenheit', label: '°F' },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={Wind} iconColor="text-emerald-400" title="Wind Speed Unit">
                    <SegmentedControl
                      value={settings.windSpeedUnit}
                      onChange={(v) => onUpdateSetting('windSpeedUnit', v)}
                      options={[
                        { value: 'kmh', label: 'km/h' },
                        { value: 'mph', label: 'mph' },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={BarChart3} iconColor="text-violet-400" title="Pressure Unit">
                    <SegmentedControl
                      value={settings.pressureUnit}
                      onChange={(v) => onUpdateSetting('pressureUnit', v)}
                      options={[
                        { value: 'hpa', label: 'hPa' },
                        { value: 'inhg', label: 'inHg' },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={Droplet} iconColor="text-blue-400" title="Precipitation Unit">
                    <SegmentedControl
                      value={settings.precipitationUnit}
                      onChange={(v) => onUpdateSetting('precipitationUnit', v)}
                      options={[
                        { value: 'mm', label: 'mm' },
                        { value: 'inches', label: 'inches' },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={Clock} iconColor="text-sky-400" title="Time Format">
                    <SegmentedControl
                      value={settings.timeFormat}
                      onChange={(v) => onUpdateSetting('timeFormat', v)}
                      options={[
                        { value: '12h', label: '12-hour' },
                        { value: '24h', label: '24-hour' },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={Palette} iconColor="text-purple-400" title="Theme" description="Light theme coming soon">
                    <SegmentedControl
                      value={settings.theme}
                      onChange={(v) => onUpdateSetting('theme', v)}
                      options={[
                        { value: 'dark', label: 'Dark' },
                        { value: 'light', label: 'Light', disabled: true },
                      ]}
                    />
                  </SettingRow>

                  <SettingRow icon={Sparkles} iconColor="text-amber-400" title="Weather Animations" description="Visual effects on dashboard">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {settings.animationsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ToggleSwitch
                        checked={settings.animationsEnabled}
                        onChange={(v) => onUpdateSetting('animationsEnabled', v)}
                      />
                    </div>
                  </SettingRow>
                </>
              )}

              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <>
                  <SettingRow icon={MapPin} iconColor="text-cyan-400" title="Default City" description="City on app startup">
                    <input
                      type="text"
                      value={settings.defaultCity}
                      onChange={(e) => onUpdateSetting('defaultCity', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/30 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. San Francisco"
                    />
                  </SettingRow>

                  <SettingRow icon={Clock} iconColor="text-sky-400" title="Auto Refresh Interval" description="Minutes between updates">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="5"
                        max="120"
                        step="5"
                        value={settings.autoRefreshInterval}
                        onChange={(e) => onUpdateSetting('autoRefreshInterval', Math.max(5, parseInt(e.target.value) || 5))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950/30 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <span className="text-sm text-slate-400 whitespace-nowrap">minutes</span>
                    </div>
                  </SettingRow>
                </>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <>
                  <SettingRow icon={Bell} iconColor="text-amber-400" title="Weather Alerts">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {settings.weatherAlertsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ToggleSwitch
                        checked={settings.weatherAlertsEnabled}
                        onChange={(v) => onUpdateSetting('weatherAlertsEnabled', v)}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow icon={Droplet} iconColor="text-blue-400" title="Rain Alerts">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {settings.rainAlertsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ToggleSwitch
                        checked={settings.rainAlertsEnabled}
                        onChange={(v) => onUpdateSetting('rainAlertsEnabled', v)}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow icon={Sparkles} iconColor="text-orange-400" title="Severe Weather Alerts">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {settings.severeWeatherAlertsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ToggleSwitch
                        checked={settings.severeWeatherAlertsEnabled}
                        onChange={(v) => onUpdateSetting('severeWeatherAlertsEnabled', v)}
                      />
                    </div>
                  </SettingRow>

                  <SettingRow icon={Bell} iconColor="text-purple-400" title="App Notifications">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <ToggleSwitch
                        checked={settings.notificationsEnabled}
                        onChange={(v) => onUpdateSetting('notificationsEnabled', v)}
                      />
                    </div>
                  </SettingRow>
                </>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-sm text-slate-400 mb-3">Manage your data and preferences</p>
                    <button
                      onClick={onClearRecentSearches}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white transition-all"
                    >
                      <span className="text-sm font-semibold">Clear Recent Searches</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <button
                      onClick={onClearNotifications}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-white transition-all"
                    >
                      <span className="text-sm font-semibold">Clear All Notifications</span>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <button
                      onClick={onResetSettings}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-950/30 hover:bg-rose-950/60 border border-slate-800 text-slate-300 hover:text-rose-300 transition-all"
                    >
                      <span className="text-sm font-semibold">Reset to Defaults</span>
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <>
                  <SettingRow icon={Info} iconColor="text-blue-400" title="About Weather Dashboard">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Application</span>
                        <span className="text-white font-semibold">Weather Dashboard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Version</span>
                        <span className="text-white font-semibold">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weather API</span>
                        <span className="text-white font-semibold">Open-Meteo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Database</span>
                        <span className="text-white font-semibold">SQLite/MySQL</span>
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow icon={Clock} iconColor="text-amber-400" title="Last Refresh">
                    <div className="text-sm">
                      <p className="text-white font-semibold">{formatRefreshTime(lastRefreshTime)}</p>
                    </div>
                  </SettingRow>

                  <SettingRow icon={Heart} iconColor="text-rose-400" title="Saved Locations">
                    <div className="text-sm">
                      <p className="text-white font-semibold">{favorites.length} location{favorites.length !== 1 ? 's' : ''} saved</p>
                    </div>
                  </SettingRow>
                </>
              )}
            </div>

            <div className="border-t border-slate-800 px-6 py-4 text-center">
              <p className="text-[11px] text-slate-600">
                Settings are saved automatically to this device.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
