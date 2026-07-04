import React, { useEffect, useMemo, useState } from 'react'
import CloudLayer from './CloudLayer'

const LAYER_DEFS = [
  { name: 'far', depth: 0.16, baseCount: 4, baseSize: 32, baseOpacity: 0.2 },
  { name: 'mid', depth: 0.3, baseCount: 4, baseSize: 40, baseOpacity: 0.28 },
  { name: 'near', depth: 0.5, baseCount: 4, baseSize: 48, baseOpacity: 0.36 },
  { name: 'foreground', depth: 0.72, baseCount: 4, baseSize: 58, baseOpacity: 0.48 },
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function CloudGenerator({ weatherKey = 'clear', prefersReducedMotion = false }) {
  const [viewport, setViewport] = useState({ width: 1600, height: 900 })
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    const handlePointer = (event) => {
      setMouse({ x: (event.clientX / window.innerWidth - 0.5) * 2, y: (event.clientY / window.innerHeight - 0.5) * 2 })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('mousemove', handlePointer)

    let frameId = null
    let lastTime = performance.now()

    const tick = (now) => {
      const delta = now - lastTime
      lastTime = now
      setTime((prev) => prev + delta)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('mousemove', handlePointer)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  const layers = useMemo(() => {
    const cloudScale = weatherKey === 'cloudy' || weatherKey === 'storm' ? 1.18 : weatherKey === 'rain' ? 1.08 : weatherKey === 'fog' ? 1.02 : weatherKey === 'night' ? 0.88 : 0.95

    return LAYER_DEFS.map((layer, layerIndex) => {
      const count = Math.round(layer.baseCount + (weatherKey === 'cloudy' || weatherKey === 'storm' ? 1 : 0) + (weatherKey === 'rain' ? 1 : 0))
      const clouds = Array.from({ length: count }, (_, cloudIndex) => {
        const seed = layerIndex * 17 + cloudIndex * 23 + (weatherKey.charCodeAt(0) % 7) * 3
        const size = layer.baseSize + (seed % 6) * 12 + layerIndex * 4
        const altitude = 8 + layerIndex * 18 + (cloudIndex % 4) * 10 + (seed % 3) * 6
        const opacity = clamp(layer.baseOpacity + (cloudIndex % 5) * 0.04 + (weatherKey === 'cloudy' || weatherKey === 'storm' ? 0.04 : 0.0), 0.16, 0.85)
        const brightness = clamp(0.72 + (seed % 5) * 0.05 + (weatherKey === 'clear' ? 0.04 : 0), 0.7, 0.98)
        const speed = clamp(22 + (seed % 8) * 8 + layerIndex * 6, 20, 80)
        const wobble = 3 + (seed % 4) * 2
        const blur = 7 + (seed % 5) * 2 + layerIndex * 3
        const baseX = (seed % 10) / 10 * viewport.width
        const shadowX = 14 + (seed % 3) * 6
        const shadowY = 18 + (seed % 3) * 4

        return {
          id: `${layer.name}-${cloudIndex}`,
          size,
          altitude,
          opacity: opacity * cloudScale,
          brightness,
          speed,
          wobble,
          blur,
          scale: 0.8 + (seed % 4) * 0.08,
          phase: seed * 0.12,
          baseX,
          shadowX,
          shadowY,
          blobs: [
            { cx: -size * 0.22, cy: -size * 0.04, rx: size * 0.55, ry: size * 0.4 },
            { cx: size * 0.12, cy: -size * 0.18, rx: size * 0.48, ry: size * 0.36 },
            { cx: size * 0.3, cy: size * 0.01, rx: size * 0.42, ry: size * 0.31 },
            { cx: size * 0.06, cy: size * 0.12, rx: size * 0.35, ry: size * 0.26 },
          ],
        }
      })

      return { ...layer, clouds }
    })
  }, [viewport.height, viewport.width, weatherKey])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {layers.map((layer, index) => (
        <CloudLayer
          key={layer.name}
          clouds={layer.clouds}
          time={time}
          mouse={mouse}
          viewport={viewport}
          layerIndex={index}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  )
}
