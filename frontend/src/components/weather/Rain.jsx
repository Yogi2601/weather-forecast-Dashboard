import React from 'react'

export default function Rain({ prefersReducedMotion = false }) {
  const drops = Array.from({ length: 48 })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {drops.map((_, index) => (
        <span
          key={index}
          className={`absolute top-[-8%] h-14 w-[2px] bg-gradient-to-b from-sky-200/0 via-sky-200/90 to-sky-200/0 ${prefersReducedMotion ? '' : 'animate-[rainFall_700ms_linear_infinite]'}`}
          style={{
            left: `${(index * 3.2) % 100}%`,
            animationDelay: `${index * 0.08}s`,
            opacity: 0.45 + (index % 6) * 0.08,
          }}
        />
      ))}
    </div>
  )
}
