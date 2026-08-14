import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboardIcon, CalendarIcon, TruckIcon, SearchIcon, HeartIcon,
  CreditCardIcon, BellIcon, UserIcon, HelpCircleIcon, LogOutIcon, MenuIcon, XIcon,
  ChevronLeftIcon, ShieldIcon, SettingsIcon,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/format'
import { Chatbot } from '../Chatbot'

const nav = [
  { to: '/dashboard', icon: LayoutDashboardIcon, label: 'Home', end: true },
  { to: '/dashboard/bookings', icon: CalendarIcon, label: 'My Bookings' },
  { to: '/dashboard/vehicles', icon: TruckIcon, label: 'My Vehicles' },
  { to: '/dashboard/find-mechanic', icon: SearchIcon, label: 'Find a Mechanic' },
  { to: '/dashboard/saved-mechanics', icon: HeartIcon, label: 'Saved Mechanics' },
  { to: '/dashboard/payments', icon: CreditCardIcon, label: 'Payments' },
  { to: '/dashboard/notifications', icon: BellIcon, label: 'Notifications' },
]

const profileNav = [
  { to: '/dashboard/profile', icon: UserIcon, label: 'Personal Information', end: true },
  { to: '/dashboard/profile/security', icon: ShieldIcon, label: 'Security' },
  { to: '/dashboard/profile/preferences', icon: SettingsIcon, label: 'Preferences' },
]

export function CustomerLayout() {
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  if (!ready) return <div className="flex h-screen items-center justify-center text-muted">Loading…</div>
  if (!user) { navigate('/login', { replace: true }); return null }
  if (user?.role === 'admin') { navigate('/admin', { replace: true }); return null }

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
      
      <div className="pt-4 mt-4 border-t border-line">
        <button 
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
        >
          <div className="flex items-center gap-3">
            <UserIcon size={18} />
            My Profile
          </div>
        </button>
        {profileOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-line space-y-1">
            {profileNav.map((item) => (
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

      <div className="pt-4 mt-4 border-t border-line space-y-1">
        <NavLink
          to="/dashboard/support"
          onClick={onClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <HelpCircleIcon size={18} />
          Help & Support
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-line/50 glass z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-line/50">
          <img src="/logo.png" alt="Truck-View" className="h-9 w-auto" />
          <div>
            <span className="block text-sm font-bold text-ink leading-tight">Truck-View</span>
            <span className="block text-[9px] uppercase tracking-widest text-muted">My Dashboard</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {renderNavLinks()}
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between border-b border-line/50 glass px-4 py-3 relative z-20">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 -ml-1 text-ink-soft hover:text-ink">
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img src="/logo.png" alt="Truck-View" className="h-7 w-auto" />
            <span className="text-sm font-bold text-ink">Dashboard</span>
          </div>
          <button onClick={logout} className="text-sm text-red-500 font-medium">Log out</button>
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

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <Outlet />
          <Chatbot />
        </main>
      </div>
    </div>
  )
}
