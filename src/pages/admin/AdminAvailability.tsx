import React, { useState, useEffect } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatTime } from '../../utils/format'
import type { Weekday, Availability } from '../../types'

const days: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function AdminAvailability() {
  const { availability, updateAvailability, loading } = useStore()
  const [localAvail, setLocalAvail] = useState<Availability | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (availability && !loading) {
      setLocalAvail(JSON.parse(JSON.stringify(availability)))
    }
  }, [availability, loading])

  const handleSave = async () => {
    if (!localAvail) return
    setSaving(true)
    try {
      await updateAvailability(localAvail)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !localAvail) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Availability</h1>

      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-line bg-surface-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Business Hours</h2>
          <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
        <div className="divide-y divide-line">
          {days.map((day) => {
            const config = localAvail.businessHours[day]
            return (
              <div key={day} className="flex items-center justify-between px-5 py-3">
                <label className="flex items-center gap-3 w-32 cursor-pointer">
                  <input type="checkbox" checked={config.open} onChange={(e) => {
                    setLocalAvail({
                      ...localAvail,
                      businessHours: { ...localAvail.businessHours, [day]: { ...config, open: e.target.checked } }
                    })
                  }} className="accent-accent-500 rounded border-line" />
                  <span className="text-sm font-medium text-ink capitalize">{day}</span>
                </label>
                {config.open ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={config.start} onChange={(e) => {
                      setLocalAvail({
                        ...localAvail,
                        businessHours: { ...localAvail.businessHours, [day]: { ...config, start: e.target.value } }
                      })
                    }} className="px-2 py-1.5 border border-line rounded-lg text-sm bg-surface text-ink outline-none focus:border-accent-500 transition-colors" />
                    <span className="text-muted">–</span>
                    <input type="time" value={config.end} onChange={(e) => {
                      setLocalAvail({
                        ...localAvail,
                        businessHours: { ...localAvail.businessHours, [day]: { ...config, end: e.target.value } }
                      })
                    }} className="px-2 py-1.5 border border-line rounded-lg text-sm bg-surface text-ink outline-none focus:border-accent-500 transition-colors" />
                  </div>
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
          <div className="text-2xl font-bold text-ink">{localAvail.maxPerSlot}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="text-xs text-muted mb-1">Minimum Notice</div>
          <div className="text-2xl font-bold text-ink">{localAvail.noticeHours} hrs</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="text-xs text-muted mb-1">Blocked Dates</div>
          <div className="text-2xl font-bold text-ink">{localAvail.blockedDates.length}</div>
        </div>
      </div>
    </div>
  )
}
