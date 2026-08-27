import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboardIcon, CalendarIcon, WrenchIcon, TruckIcon,
  UsersIcon, SettingsIcon, LogOutIcon, ChevronLeftIcon,
  MenuIcon, XIcon, MoonIcon, SunIcon, UserCircleIcon, CreditCardIcon,
  StarIcon, BarChartIcon, BellIcon, TrashIcon,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/format'

const nav = [
  { to: '/admin', icon: LayoutDashboardIcon, label: 'Dashboard', end: true },
  { to: '/admin/bookings', icon: CalendarIcon, label: 'Bookings' },
  { to: '/admin/mechanics', icon: WrenchIcon, label: 'Mechanics' },
  { to: '/admin/customers', icon: UsersIcon, label: 'Customers' },
  { to: '/admin/vehicle-types', icon: TruckIcon, label: 'Vehicles' },
  { to: '/admin/services', icon: WrenchIcon, label: 'Services' },
  { to: '/admin/payments', icon: CreditCardIcon, label: 'Payments' },
  { to: '/admin/reviews', icon: StarIcon, label: 'Reviews' },
  { to: '/admin/reports', icon: BarChartIcon, label: 'Reports' },
  { to: '/admin/notifications', icon: BellIcon, label: 'Notifications' },
  { to: '/admin/trash', icon: TrashIcon, label: 'Trash' },
]

const settingsNav = [
  { to: '/admin/settings', label: 'General', end: true },
  { to: '/admin/settings/staff', label: 'Admin & Staff' },
  { to: '/admin/settings/booking', label: 'Booking' },
  { to: '/admin/settings/payments', label: 'Payments' },
  { to: '/admin/settings/notifications', label: 'Notifications' },
  { to: '/admin/settings/appearance', label: 'Appearance' },
  { to: '/admin/settings/security', label: 'Security' },
  { to: '/admin/settings/audit', label: 'Audit Logs' },
]

export function AdminLayout() {
  const { user, ready, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!ready) return <div className="flex h-screen items-center justify-center text-muted">Loading…</div>
  if (!user) { navigate('/admin/login', { replace: true }); return null }
  if (user.role !== 'admin') { navigate('/dashboard', { replace: true }); return null }

  const renderNavLinks = (onClick?: () => void) => (
    <>
      <div className="space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClick}
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
      </div>
      
      <div className="pt-2 mt-2 border-t border-line">
        <button 
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
        >
          <div className="flex items-center gap-3">
            <SettingsIcon size={18} />
            Settings
          </div>
        </button>
        {settingsOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-line space-y-1">
            {settingsNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 mt-2 border-t border-line space-y-1">
        <NavLink
          to="/admin/profile"
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <UserCircleIcon size={18} />
          Admin Profile
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-line/50 glass z-30">
        <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-line/50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Truck-View" className="h-9 w-auto" />
            <div>
              <span className="block text-sm font-bold text-ink leading-tight">Truck-View</span>
              <span className="block text-[9px] uppercase tracking-widest text-muted">Admin</span>
            </div>
          </div>
          <button onClick={toggleTheme} className="ml-auto p-1.5 text-muted hover:text-ink hover:bg-surface-2 rounded-lg transition-colors">
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavLinks()}
        </nav>
        <div className="border-t border-line/50 px-3 py-4 space-y-2">
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
        <header className="lg:hidden flex items-center justify-between border-b border-line/50 glass px-4 py-3 relative z-20">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 -ml-1 text-ink-soft hover:text-ink">
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img src="/logo.png" alt="Truck-View" className="h-7 w-auto" />
            <span className="text-sm font-bold text-ink">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 text-muted hover:text-ink hover:bg-surface-2 rounded-lg transition-colors">
              {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-10 bg-canvas/80 backdrop-blur-sm pt-[60px]" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-surface border-b border-line flex flex-col p-4 shadow-lg overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
              {renderNavLinks(() => setMobileMenuOpen(false))}
              <div className="pt-4 mt-4 border-t border-line space-y-2">
                <NavLink to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted hover:text-ink hover:bg-surface-2 transition-colors">
                  <ChevronLeftIcon size={18} />
                  Back to site
                </NavLink>
                <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOutIcon size={18} />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-canvas">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
