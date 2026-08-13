import React from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatTime } from '../../utils/format'
import type { Weekday } from '../../types'

const days: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function AdminAvailability() {
  const { availability, loading } = useStore()
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Availability</h1>

      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-line bg-surface-2">
          <h2 className="text-sm font-semibold text-ink">Business Hours</h2>
        </div>
        <div className="divide-y divide-line">
          {days.map((day) => {
            const config = availability.businessHours[day]
            return (
              <div key={day} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-ink capitalize">{day}</span>
                {config.open ? (
                  <span className="text-sm text-muted">{formatTime(config.start)} – {formatTime(config.end)}</span>
                ) : (
                  <Badge variant="default">Closed</Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="text-xs text-muted mb-1">Max Bookings per Slot</div>
          <div className="text-2xl font-bold text-ink">{availability.maxPerSlot}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="text-xs text-muted mb-1">Minimum Notice</div>
          <div className="text-2xl font-bold text-ink">{availability.noticeHours} hrs</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="text-xs text-muted mb-1">Blocked Dates</div>
          <div className="text-2xl font-bold text-ink">{availability.blockedDates.length}</div>
        </div>
      </div>
    </div>
  )
}
