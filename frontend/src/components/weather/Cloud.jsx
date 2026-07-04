import React from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function Cloud({ cloud, time, mouse, viewport, layerIndex, prefersReducedMotion }) {
  const drift = ((time * cloud.speed * 0.00028 + cloud.phase) % (viewport.width + 320)) - 160
  const x = cloud.baseX + drift
  const wobble = Math.sin((time * 0.00022 * (cloud.speed + 8) + cloud.phase) * 0.8) * (cloud.wobble * 0.7)
  const verticalDrift = Math.sin((time * 0.0002 * (cloud.speed + 6) + cloud.phase * 0.55)) * (cloud.wobble * 0.35)
  const depthShiftX = mouse.x * (layerIndex + 0.4) * 1.8
  const depthShiftY = mouse.y * (layerIndex + 0.2) * 0.9
  const y = cloud.altitude + verticalDrift + depthShiftY
  const pulse = 1 + Math.sin(time * 0.0005 + cloud.phase) * 0.018
  const scale = cloud.scale * pulse
  const opacity = clamp(cloud.opacity + Math.sin(time * 0.00035 + cloud.phase) * 0.02, 0.12, 0.95)
  const shadowOpacity = clamp(cloud.opacity * 0.3, 0.08, 0.35)
  const transform = `translate3d(${x + depthShiftX}px, ${y}px, 0) scale(${scale})`
  const filterId = `cloud-${cloud.id}`

  return (
    <g
      opacity={prefersReducedMotion ? cloud.opacity : opacity}
      style={{ transform, transformOrigin: 'center', willChange: 'transform' }}
    >
      <ellipse
        cx={cloud.shadowX}
        cy={cloud.shadowY + 2}
        rx={cloud.size * 0.98}
        ry={cloud.size * 0.58}
        fill="rgba(8, 15, 30, 0.42)"
        filter={`url(#${filterId}-shadow)`}
        opacity={shadowOpacity}
      />
      <ellipse
        cx={cloud.shadowX + 6}
        cy={cloud.shadowY + 10}
        rx={cloud.size * 0.72}
        ry={cloud.size * 0.34}
        fill="rgba(12, 24, 42, 0.28)"
        filter={`url(#${filterId}-shadow)`}
        opacity={shadowOpacity * 0.7}
      />
      {cloud.blobs.map((blob, index) => {
        const morph = 1 + Math.sin(time * 0.001 * (cloud.speed + 0.4) + cloud.phase + index) * 0.06
        const jitterX = Math.sin(time * 0.0011 * (cloud.speed + 0.3) + cloud.phase + index) * 2.2
        const jitterY = Math.cos(time * 0.0009 * (cloud.speed + 0.2) + cloud.phase + index) * 2.0
        const rx = blob.rx * morph
        const ry = blob.ry * (1 + Math.sin(time * 0.0008 + cloud.phase + index) * 0.025)
        return (
          <ellipse
            key={`${cloud.id}-${index}`}
            cx={blob.cx + jitterX + wobble * 0.35}
            cy={blob.cy + jitterY + verticalDrift * 0.15}
            rx={rx}
            ry={ry}
            fill={`rgba(255,255,255,${cloud.brightness})`}
            opacity={0.92}
            filter={`url(#${filterId})`}
          />
        )
      })}
      <defs>
        <filter id={`${filterId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={cloud.blur + 6} />
        </filter>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={cloud.blur} />
        </filter>
      </defs>
    </g>
  )
}
