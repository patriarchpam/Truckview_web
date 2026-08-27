import { useState, useEffect, useCallback } from 'react'
import { TrendingUpIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { api } from '../../lib/api'
import { formatPrice } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'

interface PaymentRecord {
  quoteId: string
  quotationNumber: string
  bookingRef: string
  customerName: string
  customerEmail: string
  total: number
  quoteStatus: string
  paymentStatus: string | null
  paymentConfirmedByAdmin: boolean
  date: string
  bookingId: string
}

const paymentStatusLabel: Record<string, { label: string; classes: string }> = {
  full:    { label: 'Full Payment',    classes: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' },
  partial: { label: 'Partial Payment', classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
  pending: { label: 'Pending',         classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400' },
  unpaid:  { label: 'Unpaid',          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
}

export function AdminPayments() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'full' | 'awaiting'>('all')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*, bookings(reference, profile_id, profiles(name, email))')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped: PaymentRecord[] = (quotes || []).map((q: any) => ({
        quoteId: q.id,
        quotationNumber: q.quotation_number,
        bookingRef: q.bookings?.reference || '—',
        customerName: q.bookings?.profiles?.name || 'Unknown',
        customerEmail: q.bookings?.profiles?.email || '',
        total: q.total || 0,
        quoteStatus: q.status,
        paymentStatus: q.payment_status || null,
        paymentConfirmedByAdmin: q.payment_confirmed_by_admin || false,
        date: q.date || q.created_at?.split('T')[0],
        bookingId: q.booking_id,
      }))

      setRecords(mapped)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to load payment records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  useEffect(() => {
    const channel = supabase
      .channel('quotes-payments')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quotes' }, () => {
        fetchPayments()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPayments])

  const handleConfirmPayment = async (record: PaymentRecord) => {
    setConfirmingId(record.quoteId)
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ payment_confirmed_by_admin: true })
        .eq('id', record.quoteId)
      if (error) throw error

      if (record.customerEmail) {
        try {
          const { data: profile } = await supabase.from('profiles').select('id').eq('email', record.customerEmail.toLowerCase()).single()
          if (profile) {
            await api.createNotification(
              profile.id,
              'Payment Confirmed ✓',
              `Your ${record.paymentStatus} payment for Quote #${record.quotationNumber} (Booking ${record.bookingRef}) has been confirmed by our team.`,
              'success'
            )
          }
        } catch(e) { console.warn('Could not send notification', e) }
      }

      toast.success(`Payment confirmed for ${record.customerName}`)
      await fetchPayments()
    } catch (err: any) {
      toast.error('Failed to confirm payment: ' + err.message)
    } finally {
      setConfirmingId(null)
    }
  }

  const handleRejectPayment = async (record: PaymentRecord) => {
    setConfirmingId(record.quoteId)
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ payment_status: null, payment_confirmed_by_admin: false })
        .eq('id', record.quoteId)
      if (error) throw error

      if (record.customerEmail) {
        try {
          const { data: profile } = await supabase.from('profiles').select('id').eq('email', record.customerEmail.toLowerCase()).single()
          if (profile) {
            await api.createNotification(
              profile.id,
              'Payment Not Confirmed',
              `We could not confirm your payment for Quote #${record.quotationNumber}. Please contact us or update your payment status.`,
              'warning'
            )
          }
        } catch(e) {}
      }

      toast.info(`Payment status reset for ${record.customerName}`)
      await fetchPayments()
    } catch (err: any) {
      toast.error('Failed to reset payment: ' + err.message)
    } finally {
      setConfirmingId(null)
    }
  }

  const filtered = records.filter(r => {
    if (filter === 'all') return r.quoteStatus === 'accepted' || !!r.paymentStatus
    if (filter === 'awaiting') return !!r.paymentStatus && !r.paymentConfirmedByAdmin
    return r.paymentStatus === filter
  })

  const pendingCount = records.filter(r => r.paymentStatus && !r.paymentConfirmedByAdmin).length
  const confirmedTotal = records.filter(r => r.paymentConfirmedByAdmin).reduce((s, r) => s + r.total, 0)
  const pendingTotal = records.filter(r => r.paymentStatus && !r.paymentConfirmedByAdmin).reduce((s, r) => s + r.total, 0)

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Payments</h1>
          <p className="text-muted mt-1">Confirm client payment updates and track all invoices.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
          <RefreshCwIcon size={14} className={`${loading ? 'animate-spin' : ''} mr-1`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-muted mb-2 text-sm"><TrendingUpIcon size={16}/> Confirmed Revenue</div>
          <div className="text-2xl font-bold text-ink">{formatPrice(confirmedTotal)}</div>
          <div className="text-xs text-green-600 mt-1">{records.filter(r => r.paymentConfirmedByAdmin).length} payments confirmed</div>
        </div>
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-muted mb-2 text-sm"><ClockIcon size={16}/> Awaiting Confirmation</div>
          <div className="text-2xl font-bold text-ink">{formatPrice(pendingTotal)}</div>
          <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            {pendingCount > 0 && <AlertCircleIcon size={12}/>}
            {pendingCount} pending your action
          </div>
        </div>
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-muted mb-2 text-sm"><CheckCircleIcon size={16}/> Total Quotes Issued</div>
          <div className="text-2xl font-bold text-ink">{records.length}</div>
          <div className="text-xs text-muted mt-1">{records.filter(r => r.quoteStatus === 'accepted').length} accepted</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All' },
          { key: 'awaiting', label: `⚠ Awaiting (${pendingCount})` },
          { key: 'full', label: 'Full Payment' },
          { key: 'partial', label: 'Partial' },
          { key: 'pending', label: 'Pending' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-accent-500 text-white' : 'text-muted hover:bg-surface-2 bg-surface border border-line'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payment Records Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading payment records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircleIcon size={40} className="mx-auto text-green-400 opacity-50 mb-3" />
            <p className="text-muted text-sm">No payment records match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2/50 border-b border-line">
                <tr className="text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Quote #</th>
                  <th className="p-4 font-medium">Booking</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Client Status</th>
                  <th className="p-4 font-medium">Admin</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map(record => {
                  const ps = record.paymentStatus || 'unpaid'
                  const style = paymentStatusLabel[ps] || paymentStatusLabel.unpaid
                  const isConfirming = confirmingId === record.quoteId
                  const needsAction = record.paymentStatus && !record.paymentConfirmedByAdmin

                  return (
                    <tr key={record.quoteId} className={`hover:bg-surface-2/30 transition-colors ${needsAction ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}>
                      <td className="p-4 font-medium text-ink">{record.quotationNumber}</td>
                      <td className="p-4 text-muted">{record.bookingRef}</td>
                      <td className="p-4">
                        <div className="font-medium text-ink">{record.customerName}</div>
                        <div className="text-xs text-muted">{record.customerEmail}</div>
                      </td>
                      <td className="p-4 font-bold text-ink">{formatPrice(record.total)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.classes}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.paymentConfirmedByAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <CheckCircleIcon size={13}/> Confirmed
                          </span>
                        ) : record.paymentStatus ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <AlertCircleIcon size={13}/> Awaiting
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {record.paymentStatus && !record.paymentConfirmedByAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleConfirmPayment(record)} disabled={isConfirming}>
                              {isConfirming ? '...' : '✓ Confirm'}
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 hover:bg-red-50 border-red-200" onClick={() => handleRejectPayment(record)} disabled={isConfirming}>
                              ✕ Reject
                            </Button>
                          </div>
                        )}
                        {record.paymentConfirmedByAdmin && <span className="text-xs text-muted italic">Done</span>}
                        {!record.paymentStatus && <span className="text-xs text-muted">No payment yet</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted italic">
        💡 When a client updates their payment status, it appears here automatically in real-time.
        Confirm to verify and notify the client, or Reject to ask them to retry.
      </p>
    </div>
  )
}
