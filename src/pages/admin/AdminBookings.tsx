import { useState } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { formatShortDate, formatTime,  } from '../../utils/format'
import { toast } from 'sonner'
import type { BookingStatus } from '../../types'

import { AdminQuoteModal } from '../../components/admin/AdminQuoteModal'

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', confirmed: 'info', 'in-progress': 'info', completed: 'success', cancelled: 'danger',
}


export function AdminBookings() {
  const { bookings, services, updateBookingStatus } = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const sorted = [...filtered].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  const selectedBooking = bookings.find((b) => b.id === selected)
  const svcs = selectedBooking ? services.filter((s) => (selectedBooking.serviceIds || []).includes(s.id)) : []
  const selectedSvcNames = svcs.map(s => s.name).join(', ')

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status)
      toast.success(`Booking updated to ${status}`)
      setSelected(null)
    } catch { toast.error('Failed to update') }
  }

  const openQuoteModal = () => {
    setQuoteModalOpen(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-ink">Bookings</h1>
        <div className="flex gap-1 overflow-x-auto pb-2 -mb-2 scrollbar-hide w-full max-w-full">
          {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${filter === f ? 'bg-accent-500 text-white' : 'text-muted hover:bg-surface-2'}`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Ref</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map((b) => {
                const sNames = services.filter((sv) => (b.serviceIds || []).includes(sv.id)).map(s => s.name).join(', ')
                return (
                  <tr key={b.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{b.reference}</td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{b.customer.name}</div>
                      <div className="text-xs text-muted">{b.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink line-clamp-1">{sNames || 'Unknown'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink">{formatShortDate(b.date)}</div>
                      <div className="text-xs text-muted">{formatTime(b.time)}</div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusColors[b.status] || 'default'} className="capitalize">{b.status}</Badge></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(b.id)}>View</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && <div className="p-8 text-center text-sm text-muted">No bookings found.</div>}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selectedBooking} onClose={() => setSelected(null)} title={selectedBooking?.reference ?? ''} description={selectedSvcNames}>
        {selectedBooking && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="text-muted block text-xs">Customer</span><span className="font-medium text-ink">{selectedBooking.customer.name}</span></div>
              <div><span className="text-muted block text-xs">Phone</span><span className="font-medium text-ink">{selectedBooking.customer.phone}</span></div>
              <div><span className="text-muted block text-xs">Email</span><span className="font-medium text-ink">{selectedBooking.customer.email}</span></div>
              <div><span className="text-muted block text-xs">Vehicle</span><span className="font-medium text-ink">{selectedBooking.vehicleDetails}</span></div>
              <div><span className="text-muted block text-xs">Date & Time</span><span className="font-medium text-ink">{formatShortDate(selectedBooking.date)} at {formatTime(selectedBooking.time)}</span></div>
              <div><span className="text-muted block text-xs">Status</span><Badge variant={statusColors[selectedBooking.status] || 'default'} className="capitalize">{selectedBooking.status}</Badge></div>
            </div>
            {selectedBooking.notes && (
              <div className="rounded-lg bg-surface-2 p-3">
                <span className="text-xs text-muted block mb-1">Notes</span>
                <p className="text-ink-soft">{selectedBooking.notes}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 pt-2 pb-2 border-t border-line mt-4">
              <Button size="sm" variant="outline" className="w-full text-accent-600 border-accent-200 hover:bg-accent-50" onClick={openQuoteModal}>
                View / Generate Quote
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-line mt-4">
              {(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'] as BookingStatus[])
                .filter(st => st !== selectedBooking.status)
                .map((st) => (
                <Button key={st} size="sm" variant={st === 'cancelled' ? 'danger' : st === 'completed' ? 'success' : 'outline'}
                  onClick={() => handleStatusChange(selectedBooking.id, st)}
                  className="capitalize text-xs py-1"
                >
                  Mark as {st}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {selectedBooking && (
        <AdminQuoteModal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} booking={selectedBooking} />
      )}
    </div>
  )
}
