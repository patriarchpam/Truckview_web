import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../utils/format'

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

export function AdminSettings() {
  const location = useLocation()
  
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-ink mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {settingsNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap md:whitespace-normal px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive || (item.to !== '/admin/settings' && location.pathname.startsWith(item.to))
                      ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
                      : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
