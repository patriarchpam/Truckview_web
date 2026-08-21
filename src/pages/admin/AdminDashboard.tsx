import { motion } from 'framer-motion'
import { CalendarIcon, UsersIcon, WrenchIcon, TrendingUpIcon,  } from 'lucide-react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatShortDate, formatTime } from '../../utils/format'
import { useNavigate } from 'react-router-dom'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const statusColors: Record<string, 'warning' | 'info' | 'accent' | 'success' | 'danger'> = {
  pending: 'warning',
  reviewed: 'info',
  confirmed: 'info',
  inspection: 'info',
  diagnosed: 'info',
  'estimate-ready': 'warning',
  'awaiting-approval': 'warning',
  'in-progress': 'accent' as any,
  'quality-check': 'accent' as any,
  ready: 'success',
  completed: 'success',
  cancelled: 'danger',
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { bookings, services, customers, loading } = useStore()

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = bookings.filter((b) => b.date === today)
  const activeBookings = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status))
  const stats = [
    { icon: CalendarIcon, label: "Today's Bookings", value: todayBookings.length, color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400' },
    { icon: TrendingUpIcon, label: 'Active Bookings', value: activeBookings.length, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { icon: UsersIcon, label: 'Customers', value: customers.length, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { icon: WrenchIcon, label: 'Services', value: services.filter((s) => s.active).length, color: 'bg-success-100 text-success-600 dark:bg-success-700/30 dark:text-success-400' },
  ]

  const upcoming = [...activeBookings].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: i * 0.05, duration: 0.4 }}
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-xl border border-line bg-surface shadow-card"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-sm font-semibold text-ink">Upcoming Bookings</h2>
          <Badge>{upcoming.length}</Badge>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No upcoming bookings.</div>
        ) : (
          <div className="divide-y divide-line">
            {upcoming.map((b) => {
              const svcNames = services.filter((s) => (b.serviceIds || []).includes(s.id)).map(s => s.name).join(', ')
              return (
                <div key={b.id} onClick={() => navigate('/admin/bookings')} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-surface-2 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between sm:justify-start gap-2 mb-1 sm:mb-0">
                      <div className="text-sm font-medium text-ink truncate">{b.customer.name}</div>
                      <Badge variant={statusColors[b.status] || 'default'} className="shrink-0 sm:hidden">{b.status}</Badge>
                    </div>
                    <div className="text-xs text-muted truncate">{svcNames || 'Unknown'} · {b.vehicleDetails}</div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:text-right shrink-0 mt-2 sm:mt-0">
                    <div>
                      <div className="text-xs font-medium text-ink">{formatShortDate(b.date)}</div>
                      <div className="text-xs text-muted">{formatTime(b.time)}</div>
                    </div>
                    <Badge variant={statusColors[b.status] || 'default'} className="shrink-0 hidden sm:inline-flex">{b.status}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
