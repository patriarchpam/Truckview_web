import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SearchIcon, CalendarIcon, ClockIcon, TruckIcon } from 'lucide-react'
import { api } from '../lib/api'
import { useStore } from '../contexts/StoreContext'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { formatLongDate, formatTime, formatPrice, formatDuration } from '../utils/format'
import type { Booking, BookingStatus } from '../types'

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
  const [reference, setReference] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reference.trim()) return
    setSearching(true)
    setSearched(false)
    const result = await api.findBookingByReference(reference)
    setBooking(result)
    setSearched(true)
    setSearching(false)
  }

  const service = booking ? serviceById(booking.serviceId) : undefined
  const vehicle = booking ? vehicleTypeById(booking.vehicleTypeId) : undefined
  const status = booking ? statusMap[booking.status] : undefined

  return (
    <div className="py-16">
      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink">Track Your Booking</h1>
          <p className="mt-2 text-muted">Enter your booking reference to check the status of your appointment.</p>
        </motion.div>

        <motion.form initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSearch} className="flex gap-3 mb-8"
        >
          <Field label="" className="flex-1">
            <Input value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="e.g. TV-2026-0001" className="uppercase" />
          </Field>
          <Button type="submit" disabled={searching} className="mt-1.5 self-end">
            <SearchIcon size={16} /> {searching ? 'Searching…' : 'Search'}
          </Button>
        </motion.form>

        {searched && !booking && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-12">
            <p className="text-muted">No booking found with that reference. Please check and try again.</p>
          </motion.div>
        )}

        {booking && service && status && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.4 }}
            className="rounded-2xl border border-line bg-surface p-6 lg:p-8 shadow-card space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">{booking.reference}</h2>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><CalendarIcon size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Date & Time</div>
                  <div className="text-sm font-medium text-ink">{formatLongDate(booking.date)} at {formatTime(booking.time)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><TruckIcon size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Vehicle</div>
                  <div className="text-sm font-medium text-ink">{booking.vehicleDetails}</div>
                  <div className="text-xs text-muted">{vehicle?.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 shrink-0"><ClockIcon size={18} /></div>
                <div>
                  <div className="text-xs text-muted">Service</div>
                  <div className="text-sm font-medium text-ink">{service.name}</div>
                  <div className="text-xs text-muted">{formatPrice(service.price)} · {formatDuration(service.duration)}</div>
                </div>
              </div>
            </div>
            {booking.notes && (
              <div className="rounded-xl bg-surface-2 p-4">
                <div className="text-xs text-muted mb-1">Notes</div>
                <p className="text-sm text-ink-soft">{booking.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
