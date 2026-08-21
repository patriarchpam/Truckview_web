import { useState, useEffect } from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Field } from '../../components/ui/Field'
import { formatShortDate } from '../../utils/format'
import { toast } from 'sonner'
import type { BookingStatus } from '../../types'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'

import { AdminQuoteModal } from '../../components/admin/AdminQuoteModal'

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  reviewed: 'info',
  confirmed: 'info',
  inspection: 'info',
  diagnosed: 'info',
  'estimate-ready': 'warning',
  'awaiting-approval': 'warning',
  'in-progress': 'default',
  'quality-check': 'default',
  ready: 'success',
  completed: 'success',
  cancelled: 'danger'
}

function getNotificationContent(status: string, ref: string) {
  switch (status) {
    case 'confirmed':
      return { title: 'Appointment Confirmed', message: `Your appointment request ${ref} has been confirmed. See you then!`, type: 'success' as const }
    case 'inspection':
      return { title: 'Vehicle Inspection Started', message: `Your vehicle inspection under request ${ref} has been started by our mechanics.`, type: 'info' as const }
    case 'diagnosed':
      return { title: 'Diagnosis Ready', message: `The diagnosis report for request ${ref} is ready.`, type: 'info' as const }
    case 'estimate-ready':
      return { title: 'Estimate Awaiting Approval', message: `A service estimate is ready for your approval on request ${ref}.`, type: 'warning' as const }
    case 'in-progress':
      return { title: 'Repair In Progress', message: `Technicians have started working on your vehicle for request ${ref}.`, type: 'info' as const }
    case 'quality-check':
      return { title: 'Quality Checking', message: `Your vehicle is undergoing post-repair quality checks and road test.`, type: 'info' as const }
    case 'ready':
      return { title: 'Vehicle Ready for Collection', message: `Your vehicle is ready for collection under request ${ref}!`, type: 'success' as const }
    case 'completed':
      return { title: 'Service Request Completed', message: `Service request ${ref} is completed. Thank you for choosing TruckView!`, type: 'success' as const }
    case 'cancelled':
      return { title: 'Request Cancelled', message: `Your service request ${ref} has been cancelled.`, type: 'warning' as const }
    default:
      return { title: 'Status Update', message: `Your service request ${ref} has been updated to ${status}.`, type: 'info' as const }
  }
}

export function AdminBookings() {
  const { bookings, services, updateBookingStatus, rescheduleBooking } = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)

  // Rescheduling states
  const [confirmedDate, setConfirmedDate] = useState('')
  const [confirmedTime, setConfirmedTime] = useState('')
  const [confirmingAppt, setConfirmingAppt] = useState(false)

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const sorted = [...filtered].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  const selectedBooking = bookings.find((b) => b.id === selected)
  const svcs = selectedBooking ? services.filter((s) => (selectedBooking.serviceIds || []).includes(s.id)) : []
  const selectedSvcNames = svcs.map(s => s.name).join(', ')

  useEffect(() => {
    if (selectedBooking) {
      setConfirmedDate(selectedBooking.date)
      setConfirmedTime(selectedBooking.time)
    }
  }, [selected])

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(id, status)
      
      // Auto-create notification for customer
      if (selectedBooking && selectedBooking.customer.email) {
        try {
          const { data: profile } = await supabase.from('profiles').select('id').eq('email', selectedBooking.customer.email.toLowerCase()).single()
          if (profile) {
            const notifContent = getNotificationContent(status, selectedBooking.reference)
            await api.createNotification(profile.id, notifContent.title, notifContent.message, notifContent.type)
          }
        } catch (e) {
          // local storage fallback for user notifications during offline dev testing
          console.warn("Could not create DB notification, attempting local storage fallback:", e)
          const storedKey = `notifications_fallback_${selectedBooking.customer.email.toLowerCase()}`
          const stored = localStorage.getItem(storedKey)
          const list = stored ? JSON.parse(stored) : []
          const notifContent = getNotificationContent(status, selectedBooking.reference)
          list.push({
            id: Date.now().toString(),
            title: notifContent.title,
            message: notifContent.message,
            type: notifContent.type,
            read: false,
            created_at: new Date().toISOString()
          })
          localStorage.setItem(storedKey, JSON.stringify(list))
        }
      }
      
      toast.success(`Booking status updated to: ${status}`)
      setSelected(null)
    } catch { 
      toast.error('Failed to update status') 
    }
  }

  const handleConfirmAppointment = async () => {
    if (!selectedBooking) return
    setConfirmingAppt(true)
    try {
      await rescheduleBooking(selectedBooking.id, confirmedDate, confirmedTime)
      await handleStatusChange(selectedBooking.id, 'confirmed')
      toast.success('Appointment date and time confirmed!')
    } catch {
      toast.error('Failed to confirm appointment')
    } finally {
      setConfirmingAppt(false)
    }
  }

  const openQuoteModal = () => {
    setQuoteModalOpen(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-ink">Bookings</h1>
        <div className="flex gap-1 overflow-x-auto pb-2 -mb-2 scrollbar-hide w-full max-w-full">
          {['all', ...Object.keys(statusColors)].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize ${filter === f ? 'bg-accent-500 text-white' : 'text-muted hover:bg-surface-2'}`}
            >{f.replace('-', ' ')}</button>
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
                      <div className="text-ink font-semibold">{b.customer.name}</div>
                      <div className="text-xs text-muted">{b.customer.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink line-clamp-1">{sNames || 'Diagnostics'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-ink font-semibold">{formatShortDate(b.date)}</div>
                      <div className="text-xs text-muted">{b.time}</div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusColors[b.status] || 'default'} className="capitalize">{b.status.replace('-', ' ')}</Badge></td>
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
      <Modal open={!!selectedBooking} onClose={() => setSelected(null)} title={`Request ${selectedBooking?.reference ?? ''}`} description={selectedSvcNames || 'General Diagnostics'}>
        {selectedBooking && (
          <div className="space-y-6 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="text-muted block text-xs">Customer</span><span className="font-semibold text-ink">{selectedBooking.customer.name}</span></div>
              <div><span className="text-muted block text-xs">Phone</span><span className="font-semibold text-ink">{selectedBooking.customer.phone}</span></div>
              <div><span className="text-muted block text-xs">Email</span><span className="font-semibold text-ink">{selectedBooking.customer.email}</span></div>
              <div><span className="text-muted block text-xs">Vehicle Details</span><span className="font-semibold text-ink">{selectedBooking.vehicleDetails}</span></div>
              <div><span className="text-muted block text-xs">Requested Preference</span><span className="font-semibold text-ink">{formatShortDate(selectedBooking.date)} at {selectedBooking.time}</span></div>
              <div><span className="text-muted block text-xs">Current Stage</span><Badge variant={statusColors[selectedBooking.status] || 'default'} className="capitalize">{selectedBooking.status.replace('-', ' ')}</Badge></div>
            </div>
            
            {selectedBooking.notes && (
              <div className="rounded-lg bg-surface-2 p-3 border border-line">
                <span className="text-xs text-muted block mb-1 font-semibold">Symptom Log / Notes</span>
                <p className="text-ink-soft whitespace-pre-line text-xs leading-relaxed">{selectedBooking.notes}</p>
              </div>
            )}
            
            {/* Scheduler Confirmation */}
            <div className="pt-4 border-t border-line space-y-3 bg-surface-2 p-4 rounded-xl border border-line">
              <h4 className="text-xs text-accent-500 font-bold uppercase tracking-wider">Confirm / Modify Schedule</h4>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Confirmed Date">
                  <input
                    type="date"
                    value={confirmedDate}
                    onChange={(e) => setConfirmedDate(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent-500 focus:outline-none"
                  />
                </Field>
                <Field label="Confirmed Time">
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM or Morning"
                    value={confirmedTime}
                    onChange={(e) => setConfirmedTime(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent-500 focus:outline-none"
                  />
                </Field>
              </div>
              <Button
                size="sm"
                onClick={handleConfirmAppointment}
                disabled={confirmingAppt || !confirmedDate || !confirmedTime}
                className="w-full justify-center"
              >
                {confirmingAppt ? 'Confirming...' : 'Save & Confirm appointment'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-line">
              <Button size="sm" variant="outline" className="w-full text-accent-600 border-accent-200 hover:bg-accent-50" onClick={openQuoteModal}>
                View / Generate Estimate & Invoice
              </Button>
            </div>

            {/* Quick Status Select */}
            <div className="pt-4 border-t border-line">
              <label className="block text-xs text-muted font-bold uppercase mb-2">Change Progress Stage</label>
              <select
                value={selectedBooking.status}
                onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value as any)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent-500 focus:outline-none capitalize"
              >
                {Object.keys(statusColors).map((st) => (
                  <option key={st} value={st} className="capitalize">
                    {st.replace('-', ' ')}
                  </option>
                ))}
              </select>
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
