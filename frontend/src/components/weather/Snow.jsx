import React from 'react'

export default function Snow({ prefersReducedMotion = false }) {
  const flakes = Array.from({ length: 24 })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {flakes.map((_, index) => (
        <span
          key={index}
          className={`absolute top-[-8%] rounded-full bg-white/80 ${prefersReducedMotion ? '' : 'animate-[snowFall_4s_linear_infinite]'}`}
          style={{
            left: `${(index * 4.2) % 100}%`,
            width: `${6 + (index % 3) * 4}px`,
            height: `${6 + (index % 3) * 4}px`,
            animationDelay: `${index * 0.15}s`,
            opacity: 0.45 + (index % 4) * 0.12,
          }}
        />
      ))}
    </div>
  )
}
