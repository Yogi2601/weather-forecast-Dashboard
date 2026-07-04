import React from 'react'

export default function SunGlow({ weatherKey, prefersReducedMotion = false }) {
  const isNight = weatherKey === 'night'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute left-[7%] top-[10%] h-[16rem] w-[16rem] rounded-full ${isNight ? 'bg-slate-200/22' : 'bg-amber-300/20'} blur-[90px] ${prefersReducedMotion ? '' : 'animate-[pulseGlow_5s_ease-in-out_infinite]'}`} />
      <div className={`absolute left-[11%] top-[14%] h-[9rem] w-[9rem] rounded-full ${isNight ? 'bg-slate-100/30' : 'bg-white/25'} blur-[60px] ${prefersReducedMotion ? '' : 'animate-[spinSlow_24s_linear_infinite]'}`} />
      <div className={`absolute left-[16%] top-[18%] h-[4.5rem] w-[4.5rem] rounded-full ${isNight ? 'bg-slate-100/35' : 'bg-amber-100/35'} blur-[32px]`} />
    </div>
  )
}
