import { useStore } from '../../contexts/StoreContext'

export function AdminSettings() {
  const { settings, loading } = useStore()
  if (loading || !settings) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Business Information</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-muted block text-xs">Name</span><span className="text-ink">{settings.business.name}</span></div>
            <div><span className="text-muted block text-xs">Phone</span><span className="text-ink">{settings.business.phone}</span></div>
            <div><span className="text-muted block text-xs">Email</span><span className="text-ink">{settings.business.email}</span></div>
            <div><span className="text-muted block text-xs">Address</span><span className="text-ink">{settings.business.address}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Booking Settings</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-muted block text-xs">Notice Hours</span><span className="text-ink">{settings.booking.noticeHours} hrs</span></div>
            <div><span className="text-muted block text-xs">Max per Slot</span><span className="text-ink">{settings.booking.maxPerSlot}</span></div>
          </div>
          <div className="mt-3">
            <span className="text-muted block text-xs mb-1">Cancellation Policy</span>
            <p className="text-sm text-ink-soft">{settings.booking.cancellationPolicy}</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink mb-4">Admin Account</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-muted block text-xs">Name</span><span className="text-ink">{settings.account.name}</span></div>
            <div><span className="text-muted block text-xs">Email</span><span className="text-ink">{settings.account.email}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
