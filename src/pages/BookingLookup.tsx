import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon, CalendarIcon, ClockIcon, TruckIcon, MapPinIcon } from 'lucide-react'
import { api } from '../lib/api'
import { useStore } from '../contexts/StoreContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { formatLongDate, formatTime, formatPrice, formatDuration } from '../utils/format'
import { CustomerQuoteCard } from '../components/CustomerQuoteCard'
import type { Booking, BookingStatus, Quote } from '../types'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const statusMap: Record<BookingStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  'in-progress': { label: 'In Progress', variant: 'accent' as any },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

export function BookingLookup() {
  const { serviceById, vehicleTypeById } = useStore()
  
  const [mode, setMode] = useState<'reference' | 'history'>('reference')
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [history, setHistory] = useState<Booking[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const reloadQuote = async (bookingId: string) => {
    const q = await api.getQuoteByBookingId(bookingId)
    if (q) setQuotes(prev => ({ ...prev, [bookingId]: q }))
  }

  const handleSearchReference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reference.trim()) return
    setSearching(true)
    setSearched(false)
    const result = await api.findBookingByReference(reference)
    setBooking(result)
    if (result) {
      const q = await api.getQuoteByBookingId(result.id)
      if (q) setQuotes(prev => ({ ...prev, [result.id]: q }))
    }
    setSearched(true)
    setSearching(false)
  }

  const handleSearchHistory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSearching(true)
    setSearched(false)
    const results = await api.findBookingsByEmail(email)
    setHistory(results)
    const qs: Record<string, Quote> = {}
    await Promise.all(results.map(async (r) => {
      const q = await api.getQuoteByBookingId(r.id)
      if (q) qs[r.id] = q
    }))
    setQuotes(qs)
    setSearched(true)
    setSearching(false)
  }

  const renderBookingCard = (b: Booking) => {
    const bServices = (b.serviceIds || []).map(id => serviceById(id)).filter(Boolean)
    const vehicle = vehicleTypeById(b.vehicleTypeId)
    const status = statusMap[b.status]
    if (bServices.length === 0 || !vehicle) return null

    return (
      <div key={b.id} className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{b.reference}</h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><CalendarIcon size={18} /></div>
            <div>
              <div className="text-xs text-muted">Date & Time</div>
              <div className="text-sm font-medium text-ink">{formatLongDate(b.date)} at {formatTime(b.time)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><TruckIcon size={18} /></div>
            <div>
              <div className="text-xs text-muted">Vehicle</div>
              <div className="text-sm font-medium text-ink">{b.vehicleDetails}</div>
              <div className="text-xs text-muted">{vehicle.name}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><ClockIcon size={18} /></div>
            <div>
              <div className="text-xs text-muted">Service</div>
              <div className="text-sm font-medium text-ink">{bServices.map(s => s?.name).join(', ')}</div>
              <div className="text-xs text-muted">{formatPrice(bServices.reduce((a, s) => a + (s?.price || 0), 0))} · {formatDuration(bServices.reduce((a, s) => a + (s?.duration || 0), 0))}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><MapPinIcon size={18} /></div>
            <div>
              <div className="text-xs text-muted">Location</div>
              <div className="text-sm font-medium text-ink line-clamp-2">{b.location}</div>
            </div>
          </div>
        </div>
        {b.notes && (
          <div className="rounded-xl bg-surface-2 p-4">
            <div className="text-xs text-muted mb-1">Notes</div>
            <p className="text-sm text-ink-soft">{b.notes}</p>
          </div>
        )}
        {quotes[b.id] && (
          <CustomerQuoteCard quote={quotes[b.id]} booking={b} onUpdate={() => reloadQuote(b.id)} />
        )}
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">Track Your Booking</h1>
          <p className="mt-2 text-muted">Check the status of an appointment or view your booking history.</p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8 flex rounded-xl bg-surface-2 p-1">
          <button
            onClick={() => { setMode('reference'); setSearched(false) }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'reference' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            Track Reference
          </button>
          <button
            onClick={() => { setMode('history'); setSearched(false) }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${mode === 'history' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            Booking History
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'reference' ? (
            <motion.form key="ref" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSearchReference} className="flex gap-3 mb-8"
            >
              <Field label="" className="flex-1">
                <Input value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="Booking Ref (e.g. TV-2026-0001)" className="uppercase" />
              </Field>
              <Button type="submit" disabled={searching} className="mt-1.5 self-end">
                <SearchIcon size={16} /> {searching ? 'Searching…' : 'Search'}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="hist" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSearchHistory} className="flex gap-3 mb-8"
            >
              <Field label="" className="flex-1">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
              </Field>
              <Button type="submit" disabled={searching} className="mt-1.5 self-end">
                <SearchIcon size={16} /> {searching ? 'Searching…' : 'Search'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {searched && mode === 'reference' && !booking && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-12">
            <p className="text-muted">No booking found with that reference. Please check and try again.</p>
          </motion.div>
        )}

        {searched && mode === 'history' && history.length === 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-12">
            <p className="text-muted">No bookings found for that email address.</p>
          </motion.div>
        )}

        {mode === 'reference' && booking && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4 }}>
            {renderBookingCard(booking)}
          </motion.div>
        )}

        {mode === 'history' && history.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4 }} className="space-y-6">
            <h3 className="font-semibold text-ink">Found {history.length} booking{history.length > 1 ? 's' : ''}</h3>
            {history.map(renderBookingCard)}
          </motion.div>
        )}
      </div>
    </div>
  )
}
