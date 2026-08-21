import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatShortDate } from '../../utils/format'
import { Calendar, ChevronDown, ChevronUp, Wrench } from 'lucide-react'
import { ServiceStatusTimeline } from '../../components/ServiceStatusTimeline'
import { CustomerQuoteCard } from '../../components/CustomerQuoteCard'
import { api } from '../../lib/api'
import type { Quote } from '../../types'

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default' }> = {
  pending: { label: 'Received', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  inspection: { label: 'Inspection', variant: 'info' },
  diagnosed: { label: 'Diagnosis', variant: 'info' },
  'estimate-ready': { label: 'Estimate Ready', variant: 'warning' },
  'awaiting-approval': { label: 'Awaiting Approval', variant: 'warning' },
  'in-progress': { label: 'In Progress', variant: 'default' },
  'quality-check': { label: 'Quality Check', variant: 'default' },
  ready: { label: 'Ready', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' }
}

export function CustomerBookings() {
  const { user } = useAuth()
  const { bookings, services } = useStore()
  
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})

  if (!user) return null

  const myBookings = bookings.filter(b => b.customer.email.toLowerCase() === user.email.toLowerCase())
  const upcomingBookings = myBookings.filter(b => !['completed', 'cancelled'].includes(b.status))
  const pastBookings = myBookings.filter(b => ['completed', 'cancelled'].includes(b.status))

  const loadQuote = async (bookingId: string) => {
    try {
      const q = await api.getQuoteByBookingId(bookingId)
      if (q) {
        setQuotes(prev => ({ ...prev, [bookingId]: q }))
      }
    } catch (e) {
      console.warn("Failed to load quote for booking:", bookingId)
    }
  }

  // Load quotes for all bookings
  useEffect(() => {
    myBookings.forEach(b => {
      loadQuote(b.id)
    })
  }, [bookings])

  const renderBookingCard = (b: any) => {
    const isExpanded = expandedId === b.id
    const bServices = (b.serviceIds || []).map((id: string) => services.find((s: any) => s.id === id)).filter(Boolean)
    const status = statusMap[b.status] || { label: b.status, variant: 'default' }

    return (
      <div key={b.id} className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden hover:border-accent-200 transition-all">
        {/* Header Summary */}
        <div
          onClick={() => setExpandedId(isExpanded ? null : b.id)}
          className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-2/30 select-none"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-ink text-sm sm:text-base">Service Request #{b.reference}</span>
              <Badge variant={status.variant} className="capitalize">{status.label}</Badge>
            </div>
            <div className="text-xs sm:text-sm text-ink-soft mt-1 font-semibold">{b.vehicleDetails}</div>
            <div className="text-xs text-muted mt-0.5">
              Preferred Date: {formatShortDate(b.date)} at {b.time}
            </div>
          </div>
          <div className="text-muted shrink-0">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Expanded Timeline & Details */}
        {isExpanded && (
          <div className="px-5 pb-6 border-t border-line bg-surface-2/10 space-y-6 pt-5">
            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-accent-500 uppercase tracking-wider">Service Progress Tracking</h4>
              <div className="bg-surface p-5 rounded-xl border border-line">
                <ServiceStatusTimeline status={b.status} />
              </div>
            </div>

            {/* Request Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted block font-medium">Requested Services</span>
                <div className="text-sm font-semibold text-ink">
                  {bServices.length > 0 ? bServices.map((s: any) => s?.name).join(', ') : 'Diagnostics / General Problem Report'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted block font-medium">Workshop Location</span>
                <span className="text-sm font-semibold text-ink">{b.location}</span>
              </div>
            </div>

            {/* Customer Description / Notes */}
            {b.notes && (
              <div className="p-4 bg-surface rounded-xl border border-line text-sm">
                <span className="text-xs text-muted block font-semibold mb-1">Problem Details & Symptoms</span>
                <p className="text-ink-soft whitespace-pre-line">{b.notes}</p>
              </div>
            )}

            {/* Estimates / Quotes */}
            {quotes[b.id] && (
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-accent-500 uppercase tracking-wider">Active Estimate</h4>
                <CustomerQuoteCard quote={quotes[b.id]} booking={b} onUpdate={() => loadQuote(b.id)} />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-1">My Service Requests</h1>
        <p className="text-muted">Track status, approve estimates, and view history</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
            <Wrench size={20} className="text-accent-500" />
            Active Service Requests
          </h2>
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="bg-surface p-8 rounded-xl border border-line text-muted text-sm text-center">
                No active service requests.
              </div>
            ) : (
              upcomingBookings.map(renderBookingCard)
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-muted" />
            Completed Service History
          </h2>
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="text-muted text-sm bg-surface p-4 rounded-xl border border-line text-center">No past service requests found.</div>
            ) : (
              pastBookings.map(renderBookingCard)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
