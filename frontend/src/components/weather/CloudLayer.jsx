import React from 'react'
import Cloud from './Cloud'

export default function CloudLayer({ clouds, time, mouse, viewport, layerIndex, prefersReducedMotion }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          cloud={cloud}
          time={time}
          mouse={mouse}
          viewport={viewport}
          layerIndex={layerIndex}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </svg>
  )
}
