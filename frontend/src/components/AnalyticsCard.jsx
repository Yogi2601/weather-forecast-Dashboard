import React from 'react'

export default function AnalyticsCard({ title, children, stats }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {stats && (
          <div className="text-right space-y-1">
            {stats.map((stat, i) => (
              <div key={i} className="text-sm">
                <span className="text-slate-400">{stat.label}: </span>
                <span className="font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        {children}
      </div>
    </div>
  )
}
