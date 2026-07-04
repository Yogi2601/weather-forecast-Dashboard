import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Radar, Maximize, Minimize, Compass, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const LAYERS = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
  },
}

function FlyToPosition({ position, zoom, useMapHook }) {
  const map = useMapHook()

  useEffect(() => {
    if (!map || !position) return
    map.flyTo(position, zoom, { duration: 1.4 })
  }, [map, position, zoom])

  return null
}

function MapControls({ useMapHook, defaultPosition, defaultZoom }) {
  const map = useMapHook()
  const [bearing, setBearing] = useState(0)

  useEffect(() => {
    if (!map) return

    // Standard Leaflet has no built-in map-rotation API without an external
    // rotation plugin. The compass is wired to the map's bearing state so it
    // is ready to animate the moment rotation support is added — for now
    // bearing stays at 0 (north-up), so the needle always points north.
    setBearing(0)
  }, [map])

  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => map?.zoomIn()}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-blue-500/40 hover:text-white"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map?.zoomOut()}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-blue-500/40 hover:text-white"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map?.flyTo(defaultPosition, defaultZoom, { duration: 1 })}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-blue-500/40 hover:text-white"
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="North is up"
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-300 shadow-lg backdrop-blur-md transition-all hover:border-blue-500/40 hover:text-white"
      >
        <Compass className="h-4 w-4 transition-transform" style={{ transform: `rotate(${-bearing}deg)` }} />
      </button>
    </div>
  )
}

function ScaleIndicator({ useMapHook }) {
  const map = useMapHook()
  const [scale, setScale] = useState(null)

  useEffect(() => {
    if (!map) return

    const updateScale = () => {
      const bounds = map.getBounds()
      const centerLat = map.getCenter().lat
      const metersPerPixel =
        (156543.03392 * Math.cos((centerLat * Math.PI) / 180)) / Math.pow(2, map.getZoom())
      const widthPx = 80
      const meters = metersPerPixel * widthPx

      const label =
        meters >= 1000 ? `${Math.round(meters / 1000)} km` : `${Math.round(meters)} m`

      setScale(label)
      // bounds is computed to keep this in sync with pan/zoom via the map events below
      void bounds
    }

    updateScale()
    map.on('zoom move', updateScale)
    return () => map.off('zoom move', updateScale)
  }, [map])

  if (!scale) return null

  return (
    <div className="absolute bottom-3 left-3 z-[500] flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-slate-300 shadow-lg backdrop-blur-md">
      <span className="h-px w-5 bg-slate-400" />
      {scale}
    </div>
  )
}

function PulsingMarkerOverlay({ position, weatherData, useMapHook }) {
  const map = useMapHook()
  const [point, setPoint] = useState(null)

  useEffect(() => {
    if (!map) return

    const updatePoint = () => {
      setPoint(map.latLngToContainerPoint(position))
    }

    updatePoint()
    map.on('move zoom', updatePoint)

    return () => {
      map.off('move zoom', updatePoint)
    }
  }, [map, position])

  if (!point) return null

  return (
    <div
      className="absolute z-[500] pointer-events-none"
      style={{ left: point.x, top: point.y, transform: 'translate(-50%, -100%)' }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 flex items-center gap-1 rounded-full border border-blue-400/40 bg-slate-950 px-2.5 py-1 text-xs font-bold text-white shadow-lg whitespace-nowrap"
        >
          {weatherData?.temp ?? '--'}° · {weatherData?.condition || 'Live'}
        </motion.div>
      </AnimatePresence>
      <div className="relative flex items-center justify-center">
        <motion.span
          className="absolute w-8 h-8 rounded-full bg-blue-400/40"
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="w-3 h-3 rounded-full bg-blue-400 border-2 border-slate-950 shadow-md" />
      </div>
    </div>
  )
}

function WeatherMap({ weatherData, loading = false }) {
  const [mapModules, setMapModules] = useState(null)
  const [mapError, setMapError] = useState('')
  const [activeLayer, setActiveLayer] = useState('street')
  const [showRadar, setShowRadar] = useState(false)
  const [radarFrame, setRadarFrame] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen?.()
    }
  }

  useEffect(() => {
    let active = true

    Promise.all([import('react-leaflet'), import('leaflet')])
      .then(([reactLeaflet, leaflet]) => {
        if (active) {
          setMapModules({ reactLeaflet, leaflet: leaflet.default ?? leaflet })
        }
      })
      .catch(() => {
        if (active) {
          setMapError('Weather map is temporarily unavailable.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!showRadar) return
    let active = true

    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        const latest = data?.radar?.past?.slice(-1)?.[0]
        if (latest) {
          setRadarFrame({ host: data.host, path: latest.path })
        }
      })
      .catch(() => {
        if (active) setRadarFrame(null)
      })

    return () => {
      active = false
    }
  }, [showRadar])

  // Memoized on the actual coordinate values (not object identity) so
  // FlyToPosition's effect — and its map.flyTo() animation — only re-runs
  // when the city actually changes, not on every unrelated re-render.
  const position = useMemo(
    () =>
      weatherData?.latitude && weatherData?.longitude
        ? [weatherData.latitude, weatherData.longitude]
        : [37.7749, -122.4194],
    [weatherData?.latitude, weatherData?.longitude]
  )

  if (mapError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[32px] border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Live Weather Map</h3>
            <p className="mt-1 text-sm text-slate-500">Current location and live coordinates</p>
          </div>
        </div>
        <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-slate-800 bg-slate-950 text-sm text-slate-500">
          {mapError}
        </div>
      </motion.div>
    )
  }

  if (!mapModules) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[32px] border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Live Weather Map</h3>
            <p className="mt-1 text-sm text-slate-500">Current location and live coordinates</p>
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
            OpenStreetMap
          </div>
        </div>

        <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-slate-800 bg-slate-950 text-sm text-slate-500">
          Loading map...
        </div>
      </motion.div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap } = mapModules.reactLeaflet
  const L = mapModules.leaflet
  // Not wrapped in useMemo: this line runs after WeatherMap's early returns
  // above, so a hook here would violate the Rules of Hooks (conditional hook
  // count). Constructing an L.Icon is cheap (no network/layout work), so the
  // per-render cost is negligible.
  const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })

  const layer = LAYERS[activeLayer]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[32px] border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">Live Weather Map</h3>
          <p className="mt-1 text-sm text-slate-500">Current location and live coordinates</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 p-1">
            <Layers className="ml-1.5 w-3.5 h-3.5 text-slate-500" />
            {Object.entries(LAYERS).map(([key, def]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveLayer(key)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeLayer === key
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {def.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowRadar((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              showRadar
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            Radar
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:text-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden rounded-[24px] border border-slate-800 relative bg-slate-950">
        {loading ? (
          <div className="flex h-[320px] items-center justify-center bg-slate-950/60 text-sm text-slate-500">
            Loading map...
          </div>
        ) : (
          <MapContainer
            center={position}
            zoom={8}
            scrollWheelZoom
            zoomControl={false}
            className={isFullscreen ? 'h-screen w-full' : 'h-[320px] w-full'}
          >
            <TileLayer key={activeLayer} attribution={layer.attribution} url={layer.url} />

            {showRadar && radarFrame && (
              <TileLayer
                url={`${radarFrame.host}${radarFrame.path}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={0.55}
                zIndex={10}
              />
            )}

            <FlyToPosition position={position} zoom={8} useMapHook={useMap} />

            <Marker position={position} icon={markerIcon}>
              <Popup>
                <div className="text-sm text-slate-200">
                  <div className="font-semibold">{weatherData?.city || 'Current location'}</div>
                  <div>{weatherData?.temp ?? '--'}° • {weatherData?.condition || 'Live weather'}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Humidity {weatherData?.humidity ?? '--'}% • Wind {weatherData?.wind ?? '--'} km/h
                  </div>
                </div>
              </Popup>
            </Marker>

            <PulsingMarkerOverlay position={position} weatherData={weatherData} useMapHook={useMap} />
            <MapControls useMapHook={useMap} defaultPosition={position} defaultZoom={8} />
            <ScaleIndicator useMapHook={useMap} />
          </MapContainer>
        )}
      </div>
    </motion.div>
  )
}

export default memo(WeatherMap)
