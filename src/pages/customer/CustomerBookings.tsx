import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatShortDate } from '../../utils/format'
import { Calendar } from 'lucide-react'

export function CustomerBookings() {
  const { user } = useAuth()
  const { bookings } = useStore()

  if (!user) return null

  const myBookings = bookings.filter(b => b.customer.email.toLowerCase() === user.email.toLowerCase())
  const upcomingBookings = myBookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status))
  const pastBookings = myBookings.filter(b => ['completed', 'cancelled'].includes(b.status))

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-1">My Bookings</h1>
        <p className="text-muted">View and manage your service appointments</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-accent-500" />
            Upcoming Appointments
          </h2>
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="bg-surface p-6 rounded-xl border border-line text-muted text-sm text-center">
                No upcoming appointments.
              </div>
            ) : (
              upcomingBookings.map(b => (
                <div key={b.id} className="bg-surface p-5 rounded-xl border border-line shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-ink">{b.vehicleDetails}</div>
                    <div className="text-sm text-muted mt-1">{formatShortDate(b.date)} at {b.time}</div>
                    <div className="text-xs text-muted mt-1">Ref: {b.reference}</div>
                  </div>
                  <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'in-progress' ? 'default' : 'warning'}>{b.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-ink mb-4">Past Service History</h2>
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="text-muted text-sm">No past bookings found.</div>
            ) : (
              pastBookings.map(b => (
                <div key={b.id} className="bg-surface p-4 rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75">
                  <div>
                    <div className="font-medium text-ink">{b.vehicleDetails}</div>
                    <div className="text-sm text-muted">{formatShortDate(b.date)}</div>
                    <div className="text-xs text-muted mt-1">Ref: {b.reference}</div>
                  </div>
                  <Badge variant={b.status === 'completed' ? 'success' : 'danger'}>{b.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
