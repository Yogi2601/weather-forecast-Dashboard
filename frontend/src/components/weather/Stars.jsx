import React from 'react'

export default function Stars({ prefersReducedMotion = false }) {
  const stars = Array.from({ length: 20 })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((_, index) => (
        <span
          key={index}
          className={`absolute rounded-full bg-white ${prefersReducedMotion ? 'opacity-70' : 'animate-[twinkle_3.2s_ease-in-out_infinite]'}`}
          style={{
            left: `${(index * 5.2) % 100}%`,
            top: `${8 + (index % 7) * 12}%`,
            width: `${2 + (index % 3)}px`,
            height: `${2 + (index % 3)}px`,
            animationDelay: `${index * 0.25}s`,
            opacity: 0.35 + (index % 4) * 0.16,
          }}
        />
      ))}
    </div>
  )
}
