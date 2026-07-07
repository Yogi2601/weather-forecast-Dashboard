import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { OceanSystem } from './OceanSystem'
import { CloudSystem } from './CloudSystem'
import { RainSystem } from './RainSystem'
import { SnowSystem } from './SnowSystem'
import { LightningSystem } from './LightningSystem'
import { SkyController } from './SkyController'

const WEATHER_CONFIG = {
  clear: { skyColor: 0x87ceeb, horizon: 0xffd480, fog: 100 },
  cloudy: { skyColor: 0x6b8cae, horizon: 0xc0c0c0, fog: 60 },
  rain: { skyColor: 0x4a5f7f, horizon: 0x666666, fog: 40 },
  thunderstorm: { skyColor: 0x1a1f3a, horizon: 0x333333, fog: 30 },
  snow: { skyColor: 0xb0d0e0, horizon: 0xf0f0f0, fog: 50 },
  fog: { skyColor: 0x888888, horizon: 0x999999, fog: 15 },
}

export function WeatherEnvironment({ weather, windSpeed = 0, onReady = null }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const systemsRef = useRef({})
  const animationIdRef = useRef(null)
  const timeRef = useRef(0)

  // Map weather code to condition type
  const getWeatherType = () => {
    if (!weather) return 'clear'
    const code = weather.weather_code || 0

    if ([95, 96, 99].includes(code)) return 'thunderstorm'
    if ([61, 63, 65, 80, 81, 82].includes(code)) return 'rain'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
    if ([45, 48].includes(code)) return 'fog'
    if ([3].includes(code)) return 'cloudy'
    return 'clear'
  }

  const weatherType = useMemo(() => getWeatherType(), [weather])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    camera.position.set(0, 2, 5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowShadowMap
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x654321, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)

    // Initialize systems
    const systems = {}
    systems.sky = new SkyController(scene, weatherType)
    systems.ocean = new OceanSystem(scene)
    systems.clouds = new CloudSystem(scene, windSpeed)
    systems.rain = new RainSystem(scene)
    systems.snow = new SnowSystem(scene)
    systems.lightning = new LightningSystem(scene)

    systemsRef.current = systems

    // Update systems for current weather
    updateSystemsForWeather(systems, weatherType, windSpeed)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      timeRef.current += 0.016

      // Subtle camera movement
      camera.position.x = Math.sin(timeRef.current * 0.3) * 0.1
      camera.position.y = 2 + Math.cos(timeRef.current * 0.5) * 0.05

      // Update all systems
      Object.values(systems).forEach(system => {
        if (system.update) system.update(windSpeed)
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight

      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    onReady?.()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement)
        } catch (e) {}
      }
      Object.values(systems).forEach(system => {
        if (system.dispose) system.dispose()
      })
      renderer.dispose()
    }
  }, [])

  // Update when weather changes
  useEffect(() => {
    if (systemsRef.current && Object.keys(systemsRef.current).length > 0) {
      updateSystemsForWeather(systemsRef.current, weatherType, windSpeed)
    }
  }, [weatherType, windSpeed])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />
}

function updateSystemsForWeather(systems, weatherType, windSpeed) {
  const config = WEATHER_CONFIG[weatherType] || WEATHER_CONFIG.clear

  // Update sky
  if (systems.sky) systems.sky.setWeather(weatherType, config)

  // Update ocean
  if (systems.ocean) systems.ocean.setWaveIntensity(getWaveIntensity(weatherType, windSpeed))

  // Update clouds
  if (systems.clouds) systems.clouds.setMovementSpeed(windSpeed)

  // Update particles
  if (systems.rain) systems.rain.setActive(weatherType === 'rain' || weatherType === 'thunderstorm')
  if (systems.snow) systems.snow.setActive(weatherType === 'snow')

  // Update lightning
  if (systems.lightning) systems.lightning.setActive(weatherType === 'thunderstorm')
}

function getWaveIntensity(weatherType, windSpeed) {
  const baseIntensity = {
    clear: 0.3,
    cloudy: 0.5,
    rain: 0.8,
    thunderstorm: 1.2,
    snow: 0.4,
    fog: 0.3,
  }

  const base = baseIntensity[weatherType] || 0.3
  const windFactor = (windSpeed / 40) * 0.5
  return Math.min(base + windFactor, 1.5)
}

export default WeatherEnvironment
