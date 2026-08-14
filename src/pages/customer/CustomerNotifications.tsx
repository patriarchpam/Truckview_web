import { BellIcon, CalendarIcon, CheckCircle2Icon, WrenchIcon } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Booking Confirmed', message: 'Your booking TV-2026-0089 for General Maintenance has been confirmed.', time: '2 hours ago', type: 'success', icon: CheckCircle2Icon },
  { id: '2', title: 'Mechanic on the way', message: 'James Okoro is on the way to your location for your mobile service appointment.', time: '1 day ago', type: 'info', icon: WrenchIcon },
  { id: '3', title: 'Upcoming Appointment', message: 'Reminder: You have a transmission service scheduled for tomorrow at 10:00 AM.', time: '2 days ago', type: 'warning', icon: CalendarIcon },
]

export function CustomerNotifications() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-muted mt-1">Stay updated with real-time alerts about your bookings.</p>
        </div>
        <button className="text-sm font-medium text-accent-600 hover:text-accent-700">
          Mark all as read
        </button>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {MOCK_NOTIFICATIONS.length === 0 ? (
          <div className="p-12 text-center">
            <BellIcon size={48} className="mx-auto text-muted mb-4" />
            <p className="text-muted">You have no new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {MOCK_NOTIFICATIONS.map((notif) => {
              const Icon = notif.icon
              const colorClass = 
                notif.type === 'success' ? 'bg-green-50 text-green-600' : 
                notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 
                'bg-blue-50 text-blue-600'

              return (
                <div key={notif.id} className="p-5 flex gap-4 hover:bg-surface-2/30 transition-colors">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-ink">{notif.title}</h4>
                      <span className="text-xs text-muted whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-ink-soft">{notif.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
