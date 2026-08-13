import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboardIcon, CalendarIcon, WrenchIcon, TruckIcon, ClockIcon,
  UsersIcon, FileTextIcon, SettingsIcon, LogOutIcon, ChevronLeftIcon,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/format'

const nav = [
  { to: '/admin', icon: LayoutDashboardIcon, label: 'Dashboard', end: true },
  { to: '/admin/bookings', icon: CalendarIcon, label: 'Bookings' },
  { to: '/admin/services', icon: WrenchIcon, label: 'Services' },
  { to: '/admin/vehicle-types', icon: TruckIcon, label: 'Vehicle Types' },
  { to: '/admin/availability', icon: ClockIcon, label: 'Availability' },
  { to: '/admin/customers', icon: UsersIcon, label: 'Customers' },
  { to: '/admin/content', icon: FileTextIcon, label: 'Content' },
  { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
]

export function AdminLayout() {
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()

  if (!ready) return <div className="flex h-screen items-center justify-center text-muted">Loading…</div>
  if (!user) { navigate('/admin/login', { replace: true }); return null }

  return (
    <div className="flex h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-line">
          <img src="/logo.png" alt="Truck-View" className="h-9 w-auto" />
          <div>
            <span className="block text-sm font-bold text-ink leading-tight">Truck-View</span>
            <span className="block text-[9px] uppercase tracking-widest text-muted">Admin</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line px-3 py-4 space-y-2">
          <NavLink to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:text-ink hover:bg-surface-2 transition-colors">
            <ChevronLeftIcon size={18} />
            Back to site
          </NavLink>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOutIcon size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between border-b border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Truck-View" className="h-8 w-auto" />
            <span className="text-sm font-bold text-ink">Admin</span>
          </div>
          <button onClick={logout} className="text-sm text-red-500 font-medium">Log out</button>
        </header>
        {/* Mobile nav */}
        <div className="lg:hidden flex overflow-x-auto border-b border-line bg-surface px-2 gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-medium border-b-2 transition-colors',
                  isActive ? 'border-accent-500 text-accent-600' : 'border-transparent text-muted hover:text-ink',
                )
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
