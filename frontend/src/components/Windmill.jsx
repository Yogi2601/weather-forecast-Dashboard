import React, { useMemo } from 'react'

// Calculate rotation speed (RPM) based on wind speed
function getRotationSpeed(windSpeed) {
  if (windSpeed == null || windSpeed <= 0) return 0
  if (windSpeed <= 5) return 1.5 // very slow
  if (windSpeed <= 15) return 4.5 // slow
  if (windSpeed <= 30) return 12 // medium
  if (windSpeed <= 50) return 28 // fast
  return 45 // very fast
}

function WindTurbine({ windSpeed = 0 }) {
  const rotationSpeed = useMemo(() => getRotationSpeed(windSpeed), [windSpeed])
  const animationDuration = rotationSpeed === 0 ? '10s' : `${60 / rotationSpeed}s`

  return (
    <div className="relative flex w-full justify-center py-2" style={{ minHeight: '280px' }}>
      <style>{`
        @keyframes turbineBladeRotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .turbine-blade-rotor {
          animation: turbineBladeRotation ${animationDuration} linear ${rotationSpeed === 0 ? 'paused' : 'infinite'};
        }
      `}</style>

      {/* Container for both turbines - aligned at bottom */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '-80px', justifyContent: 'center' }}>
        {/* First/Main SVG Turbine - enlarged viewport to prevent blade clipping during rotation */}
        <svg width={420} height={480} viewBox="0 0 420 480" className="relative">
        <defs>
          {/* Tower gradient - realistic white cement with slight shadow */}
          <linearGradient id="towerGradient" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#f8f8f8', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e6e6e6', stopOpacity: 1 }} />
          </linearGradient>

          {/* Tower shadow for depth */}
          <linearGradient id="towerShadow" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
            <stop offset="100%" style={{ stopColor: '#999999', stopOpacity: 0.15 }} />
          </linearGradient>

          {/* Nacelle gradient - modern rounded housing */}
          <linearGradient id="nacelleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
          </linearGradient>

          {/* Blade gradient - aerodynamic white */}
          <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d9d9d9', stopOpacity: 1 }} />
          </linearGradient>

          {/* Filters */}
          <filter id="towerShadowFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodOpacity="0.1" />
          </filter>

          <filter id="nacelleShadowFilter">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>

          <filter id="bladeShadowFilter">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.15" />
          </filter>

          <filter id="hubGlowFilter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ===== TOWER (STATIC) ===== */}
        {/* Main tower body - tall white cylinder */}
        <rect
          x="193"
          y="170"
          width="34"
          height="200"
          fill="url(#towerGradient)"
          rx="8"
          filter="url(#towerShadowFilter)"
        />

        {/* Tower depth shadow on right side */}
        <rect
          x="220"
          y="170"
          width="7"
          height="200"
          fill="url(#towerShadow)"
          rx="4"
        />

        {/* Tower base - slightly wider */}
        <ellipse cx="210" cy="370" rx="22" ry="6" fill="#d9d9d9" />
        <ellipse cx="210" cy="371" rx="20" ry="4" fill="#e6e6e6" />

        {/* ===== NACELLE (STATIC) ===== */}
        {/* Nacelle body - rounded housing at top of tower */}
        <rect
          x="160"
          y="130"
          width="100"
          height="50"
          fill="url(#nacelleGradient)"
          rx="18"
          filter="url(#nacelleShadowFilter)"
        />

        {/* Nacelle top highlight - for glossy effect */}
        <ellipse cx="210" cy="138" rx="48" ry="10" fill="#ffffff" opacity="0.5" />

        {/* Nacelle bottom shadow - for depth */}
        <ellipse cx="210" cy="178" rx="50" ry="5" fill="#000000" opacity="0.08" />

        {/* Nacelle front panel - slight accent */}
        <rect
          x="170"
          y="145"
          width="80"
          height="20"
          fill="#f8f8f8"
          opacity="0.6"
          rx="4"
        />

        {/* ===== HUB (STATIC) ===== */}
        {/* Hub assembly - permanently anchored to nacelle center at (210, 150) */}
        {/* Hub outer ring */}
        <circle cx="210" cy="150" r="16" fill="#e0e0e0" filter="url(#hubGlowFilter)" />

        {/* Hub middle ring */}
        <circle cx="210" cy="150" r="12" fill="#f0f0f0" filter="url(#hubGlowFilter)" />

        {/* Hub center cap */}
        <circle cx="210" cy="150" r="8" fill="#d0d0d0" />

        {/* Hub center point */}
        <circle cx="210" cy="150" r="5" fill="#e8e8e8" />

        {/* Hub very center */}
        <circle cx="210" cy="150" r="3" fill="#a0a0a0" />

        {/* ===== ROTATING BLADE ASSEMBLY ===== */}
        {/* Blade rotor group - ONLY the blades rotate around hub center (210, 150) */}
        <g className="turbine-blade-rotor" style={{ transformOrigin: '210px 150px' }}>
          {/* ===== BLADE 1 (INITIALLY AT TOP) ===== */}
          <g>
            {/* Blade root mounting point - connects directly to hub */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient)"
              filter="url(#bladeShadowFilter)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade edge highlight - for 3D effect */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade dark edge - subtle shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>

          {/* ===== BLADE 2 (120 degrees offset from Blade 1) ===== */}
          <g transform="rotate(120 210 150)">
            {/* Blade root */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient)"
              filter="url(#bladeShadowFilter)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade highlight */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>

          {/* ===== BLADE 3 (240 degrees offset from Blade 1) ===== */}
          <g transform="rotate(240 210 150)">
            {/* Blade root */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient)"
              filter="url(#bladeShadowFilter)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade highlight */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>
        </g>
      </svg>

      {/* Second smaller SVG Turbine - 70% size of main turbine */}
      <svg width={294} height={336} viewBox="0 0 420 480" className="relative" style={{ opacity: 0.85 }}>
        <defs>
          {/* Tower gradient - realistic white cement with slight shadow */}
          <linearGradient id="towerGradient2" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#f8f8f8', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f0f0f0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e6e6e6', stopOpacity: 1 }} />
          </linearGradient>

          {/* Tower shadow for depth */}
          <linearGradient id="towerShadow2" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
            <stop offset="100%" style={{ stopColor: '#999999', stopOpacity: 0.15 }} />
          </linearGradient>

          {/* Nacelle gradient - modern rounded housing */}
          <linearGradient id="nacelleGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
          </linearGradient>

          {/* Blade gradient - aerodynamic white */}
          <linearGradient id="bladeGradient2" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d9d9d9', stopOpacity: 1 }} />
          </linearGradient>

          {/* Filters */}
          <filter id="towerShadowFilter2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodOpacity="0.1" />
          </filter>

          <filter id="nacelleShadowFilter2">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>

          <filter id="bladeShadowFilter2">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.15" />
          </filter>

          <filter id="hubGlowFilter2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ===== TOWER (STATIC) ===== */}
        {/* Main tower body - tall white cylinder */}
        <rect
          x="193"
          y="170"
          width="34"
          height="200"
          fill="url(#towerGradient2)"
          rx="8"
          filter="url(#towerShadowFilter2)"
        />

        {/* Tower depth shadow on right side */}
        <rect
          x="220"
          y="170"
          width="7"
          height="200"
          fill="url(#towerShadow2)"
          rx="4"
        />

        {/* Tower base - slightly wider */}
        <ellipse cx="210" cy="370" rx="22" ry="6" fill="#d9d9d9" />
        <ellipse cx="210" cy="371" rx="20" ry="4" fill="#e6e6e6" />

        {/* ===== NACELLE (STATIC) ===== */}
        {/* Nacelle body - rounded housing at top of tower */}
        <rect
          x="160"
          y="130"
          width="100"
          height="50"
          fill="url(#nacelleGradient2)"
          rx="18"
          filter="url(#nacelleShadowFilter2)"
        />

        {/* Nacelle top highlight - for glossy effect */}
        <ellipse cx="210" cy="138" rx="48" ry="10" fill="#ffffff" opacity="0.5" />

        {/* Nacelle bottom shadow - for depth */}
        <ellipse cx="210" cy="178" rx="50" ry="5" fill="#000000" opacity="0.08" />

        {/* Nacelle front panel - slight accent */}
        <rect
          x="170"
          y="145"
          width="80"
          height="20"
          fill="#f8f8f8"
          opacity="0.6"
          rx="4"
        />

        {/* ===== HUB (STATIC) ===== */}
        {/* Hub assembly - permanently anchored to nacelle center at (210, 150) */}
        {/* Hub outer ring */}
        <circle cx="210" cy="150" r="16" fill="#e0e0e0" filter="url(#hubGlowFilter2)" />

        {/* Hub middle ring */}
        <circle cx="210" cy="150" r="12" fill="#f0f0f0" filter="url(#hubGlowFilter2)" />

        {/* Hub center cap */}
        <circle cx="210" cy="150" r="8" fill="#d0d0d0" />

        {/* Hub center point */}
        <circle cx="210" cy="150" r="5" fill="#e8e8e8" />

        {/* Hub very center */}
        <circle cx="210" cy="150" r="3" fill="#a0a0a0" />

        {/* ===== ROTATING BLADE ASSEMBLY ===== */}
        {/* Blade rotor group - ONLY the blades rotate around hub center (210, 150) */}
        <g className="turbine-blade-rotor" style={{ transformOrigin: '210px 150px' }}>
          {/* ===== BLADE 1 (INITIALLY AT TOP) ===== */}
          <g>
            {/* Blade root mounting point - connects directly to hub */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient2)"
              filter="url(#bladeShadowFilter2)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade edge highlight - for 3D effect */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade dark edge - subtle shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>

          {/* ===== BLADE 2 (120 degrees offset from Blade 1) ===== */}
          <g transform="rotate(120 210 150)">
            {/* Blade root */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient2)"
              filter="url(#bladeShadowFilter2)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade highlight */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>

          {/* ===== BLADE 3 (240 degrees offset from Blade 1) ===== */}
          <g transform="rotate(240 210 150)">
            {/* Blade root */}
            <rect x="208" y="147" width="4" height="8" fill="#c0c0c0" rx="1.5" />

            {/* Blade main body - SIGNIFICANTLY EXTENDED 2.3x */}
            <path
              d="M 203 150 Q 197 100 198 30 Q 199 5 210 -7 Q 221 5 222 30 Q 223 100 217 150 Z"
              fill="url(#bladeGradient2)"
              filter="url(#bladeShadowFilter2)"
              strokeWidth="0.5"
              stroke="#ffffff"
              strokeOpacity="0.3"
            />

            {/* Blade highlight */}
            <path
              d="M 203 150 Q 198 105 200 55 Q 201 25 210.5 0"
              stroke="#ffffff"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />

            {/* Blade shadow */}
            <path
              d="M 217 150 Q 222 105 220 55 Q 219 25 209.5 0"
              stroke="#888888"
              strokeWidth="0.8"
              fill="none"
              opacity="0.2"
            />
          </g>
        </g>
      </svg>
      </div>

      {/* Ambient glow effect around turbines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }}
      ></div>
    </div>
  )
}

export default WindTurbine
