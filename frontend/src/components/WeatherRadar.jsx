import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Radar, Play, Pause, ZoomIn, ZoomOut, Locate } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// RainViewer's public API is free and requires no key. If a paid/alternate
// radar provider is added later, only RADAR_SOURCE and the frame-fetch
// effect below need to change — the rest of the component (playback,
// legend, zoom/pan controls, layout) is provider-agnostic.
const RADAR_SOURCE = {
  framesUrl: 'https://api.rainviewer.com/public/weather-maps.json',
  tileUrl: (host, path) => `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`,
}

const INTENSITY_LEGEND = [
  { label: 'Light', color: '#3b82f6' },
  { label: 'Moderate', color: '#22c55e' },
  { label: 'Heavy', color: '#eab308' },
  { label: 'Severe', color: '#ef4444' },
]

const FRAME_INTERVAL_MS = 700

function ZoomControls({ useMapHook }) {
  const map = useMapHook()

  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1">
      <button
        type="button"
        onClick={() => map?.zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 backdrop-blur-md transition-all hover:text-white hover:border-blue-500/40"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map?.zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 backdrop-blur-md transition-all hover:text-white hover:border-blue-500/40"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map?.flyTo(map.getCenter(), 8, { duration: 0.6 })}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 backdrop-blur-md transition-all hover:text-white hover:border-blue-500/40"
        title="Recenter"
      >
        <Locate className="h-4 w-4" />
      </button>
    </div>
  )
}

function RecenterOnLocation({ position, useMapHook }) {
  const map = useMapHook()

  useEffect(() => {
    if (!map || !position) return
    map.flyTo(position, map.getZoom() < 6 ? 8 : map.getZoom(), { duration: 1.2 })
  }, [map, position])

  return null
}

function WeatherRadar({ weatherData, loading = false }) {
  const [mapModules, setMapModules] = useState(null)
  const [mapError, setMapError] = useState('')
  const [frames, setFrames] = useState([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const playbackRef = useRef(null)

  useEffect(() => {
    let active = true

    Promise.all([import('react-leaflet'), import('leaflet')])
      .then(([reactLeaflet, leaflet]) => {
        if (active) {
          setMapModules({ reactLeaflet, leaflet: leaflet.default ?? leaflet })
        }
      })
      .catch(() => {
        if (active) setMapError('Radar is temporarily unavailable.')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    fetch(RADAR_SOURCE.framesUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        const past = data?.radar?.past ?? []
        const nowcast = data?.radar?.nowcast ?? []
        const sequence = [...past, ...nowcast].map((f) => ({
          time: f.time,
          url: RADAR_SOURCE.tileUrl(data.host, f.path),
        }))
        setFrames(sequence)
        setFrameIndex(Math.max(sequence.length - 1, 0))
      })
      .catch(() => {
        if (active) setFrames([])
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || frames.length < 2) return

    playbackRef.current = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length)
    }, FRAME_INTERVAL_MS)

    return () => clearInterval(playbackRef.current)
  }, [isPlaying, frames.length])

  // Memoized on the coordinate values, not object identity, so
  // RecenterOnLocation's effect only re-fires when the city actually
  // changes rather than on every unrelated re-render.
  const position = useMemo(
    () =>
      weatherData?.latitude && weatherData?.longitude
        ? [weatherData.latitude, weatherData.longitude]
        : [37.7749, -122.4194],
    [weatherData?.latitude, weatherData?.longitude]
  )

  const activeFrame = frames[frameIndex]
  const frameTime = activeFrame?.time
    ? new Date(activeFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const containerClass =
    'rounded-[32px] border border-slate-800 bg-slate-900/40 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-md'

  if (mapError) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={containerClass}>
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Weather Radar</h3>
          <p className="mt-1 text-sm text-slate-500">Live precipitation overlay</p>
        </div>
        <div className="flex h-[360px] items-center justify-center rounded-[24px] border border-slate-800 bg-slate-950/60 text-sm text-slate-500">
          {mapError}
        </div>
      </motion.div>
    )
  }

  if (!mapModules) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={containerClass}>
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Weather Radar</h3>
          <p className="mt-1 text-sm text-slate-500">Live precipitation overlay</p>
        </div>
        <div className="flex h-[360px] items-center justify-center rounded-[24px] border border-slate-800 bg-slate-950/60 text-sm text-slate-500">
          Loading radar...
        </div>
      </motion.div>
    )
  }

  const { MapContainer, TileLayer, Marker, useMap } = mapModules.reactLeaflet
  const L = mapModules.leaflet
  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={containerClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-slate-400">
            <Radar className="h-4 w-4 text-blue-400" />
            Weather Radar
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Live precipitation overlay{frameTime ? ` · ${frameTime}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
          disabled={frames.length < 2}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 ${
            isPlaying
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
              : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white'
          }`}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? 'Playing' : 'Paused'}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-slate-800">
        {loading ? (
          <div className="flex h-[360px] items-center justify-center bg-slate-950/60 text-sm text-slate-500">
            Loading radar...
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={8}
            scrollWheelZoom
            zoomControl={false}
            className="h-[360px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeFrame && (
              <TileLayer key={activeFrame.time} url={activeFrame.url} opacity={0.65} zIndex={10} />
            )}

            <RecenterOnLocation position={position} useMapHook={useMap} />
            <ZoomControls useMapHook={useMap} />

            <Marker position={position} icon={markerIcon} />
          </MapContainer>
        )}

        {/* Intensity legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/85 px-3 py-2 backdrop-blur-md">
          {INTENSITY_LEGEND.map((level) => (
            <div key={level.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: level.color }} />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{level.label}</span>
            </div>
          ))}
        </div>

        {/* Frame scrubber */}
        {frames.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-[500] rounded-full border border-slate-800 bg-slate-950/85 px-3 py-1.5 text-[10px] font-semibold text-slate-400 backdrop-blur-md">
            Frame {frameIndex + 1}/{frames.length}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(WeatherRadar)
