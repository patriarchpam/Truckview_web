import { ConstructionIcon } from 'lucide-react'
import { useStore } from '../../contexts/StoreContext'

function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
      <div className="h-16 w-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mb-2">
        <ConstructionIcon size={32} />
      </div>
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="text-muted leading-relaxed">{description}</p>
    </div>
  )
}


export const AdminSupport = () => <PlaceholderPage title="Help & Support Desk" description="Manage customer support tickets and inquiries. Coming soon!" />

export const AdminSettingsGeneral = () => {
  const { settings, loading } = useStore()
  if (loading || !settings) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink mb-4">Business Information</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><span className="text-muted block text-xs">Name</span><span className="text-ink">{settings.business.name}</span></div>
          <div><span className="text-muted block text-xs">Phone</span><span className="text-ink">{settings.business.phone}</span></div>
          <div><span className="text-muted block text-xs">Email</span><span className="text-ink">{settings.business.email}</span></div>
          <div><span className="text-muted block text-xs">Address</span><span className="text-ink">{settings.business.address}</span></div>
        </div>
      </div>
    </div>
  )
}

export const AdminSettingsBooking = () => {
  const { settings, loading } = useStore()
  if (loading || !settings) return null
  return (
    <div className="space-y-6">
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
    </div>
  )
}

