import React from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatShortDate } from '../../utils/format'

export function AdminCustomers() {
  const { customers, vehicleTypes, loading } = useStore()
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Customers</h1>
        <Badge>{customers.length} total</Badge>
      </div>
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Vehicles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Last Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-muted">{c.phone}</div>
                    <div className="text-xs text-muted">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.vehicleTypeIds.map((vtId) => {
                        const vt = vehicleTypes.find((v) => v.id === vtId)
                        return <Badge key={vtId} variant="default">{vt?.name || vtId}</Badge>
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{c.bookingCount}</td>
                  <td className="px-4 py-3 text-muted">{c.lastBookingDate ? formatShortDate(c.lastBookingDate) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
