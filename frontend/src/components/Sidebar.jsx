import React from 'react'
import { LayoutDashboard, Heart, BarChart3, CloudSun, X, Cloud } from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saved', label: 'Saved Locations', icon: Heart },
    { id: 'filters', label: 'Weather Filters', icon: Cloud },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-950/30 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-slate-900/30 lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 shadow-md shadow-blue-500/20">
              <CloudSun className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">SkyFlow</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Forecast SaaS</span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white lg:hidden border border-slate-750"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (setActiveTab) setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group border
                  ${isActive
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/25 shadow-inner'
                    : 'text-slate-400 hover:text-slate-205 hover:bg-slate-800/40 border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Profile Footer Section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/20 border border-slate-850 hover:border-slate-700 transition-all duration-200 cursor-pointer">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Profile"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/10"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">Sarah Connor</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">SaaS Administrator</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}
