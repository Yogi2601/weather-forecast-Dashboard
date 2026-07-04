import React, { memo } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow } from 'lucide-react'

const icons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
}

function Forecast({ forecast = [] }) {
  if (!forecast.length) return null

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-xl font-bold mb-6 text-white">
        7-Day Forecast
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {forecast.map((day) => {
          const Icon = icons[day.icon] || Cloud

          return (
            <div
              key={day.label}
              className="rounded-2xl bg-slate-800/40 p-4 text-center border border-slate-700"
            >
              <p className="text-sm text-slate-400 mb-3">
                {new Date(day.label).toLocaleDateString(undefined, {
                  weekday: 'short',
                })}
              </p>

              <Icon className="mx-auto text-sky-400 mb-3" size={34} />

              <p className="text-lg font-bold text-white">
                {day.tempMax}°
              </p>

              <p className="text-sm text-slate-400">
                {day.tempMin}°
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(Forecast)
