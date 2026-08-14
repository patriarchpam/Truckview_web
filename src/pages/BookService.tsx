import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import { addDays } from 'date-fns'
import { toast } from 'sonner'

import { useStore } from '../contexts/StoreContext'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Button, ButtonLink } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { vehicleMakes } from '../data/vehicleMakes'
import type { BookingDraft, SlotAvailability } from '../types'
import { formatTime, formatPrice, formatDuration, formatShortDate, toISODate } from '../utils/format'

import { SEO } from '../components/SEO'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export function BookService() {
  const location = useLocation()
  const { services, vehicleTypes, getSlots, createBooking } = useStore()
  const { canBook, remainingBookings, current } = useSubscription()

  const preService = (location.state as { serviceId?: string })?.serviceId
  const preVehicle = (location.state as { vehicleTypeId?: string })?.vehicleTypeId

  const { user, ready } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const preCar = searchParams.get('car')

  const [step, setStep] = useState(1)
  const [serviceIds, setServiceIds] = useState<string[]>(preService ? [preService] : [])
  const [vehicleTypeId, setVehicleTypeId] = useState(preVehicle ?? '')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleDetails, setVehicleDetails] = useState(preCar ?? '')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [slots, setSlots] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ reference: string } | null>(null)

  const activeServices = services.filter((s) => s.active)
  const activeVehicles = vehicleTypes.filter((v) => v.active)

  const availableServices = useMemo(() => {
    if (!vehicleTypeId) return activeServices
    return activeServices.filter((s) => s.vehicleTypeIds.includes(vehicleTypeId))
  }, [activeServices, vehicleTypeId])

  // Next 14 days for date picker
  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 14 }, (_, i) => toISODate(addDays(today, i)))
  }, [])

  const loadSlots = useCallback(async (d: string) => {
    setLoadingSlots(true)
    setTime('')
    const result = await getSlots(d)
    setSlots(result)
    setLoadingSlots(false)
  }, [getSlots])

  useEffect(() => {
    if (date) void loadSlots(date)
  }, [date, loadSlots])

  useEffect(() => {
    if (!preCar || !activeVehicles.length || vehicleTypeId) return;
    
    // Reverse sort makes by length so longer names match first
    const sortedMakes = Object.keys(vehicleMakes).sort((a, b) => b.length - a.length);
    let foundMake = '';
    let foundModel = '';

    for (const make of sortedMakes) {
      if (preCar.startsWith(make)) {
        foundMake = make;
        break;
      }
    }

    if (foundMake) {
      const models = (vehicleMakes as any)[foundMake] || [];
      const sortedModels = [...models].sort((a: string, b: string) => b.length - a.length);
      const remainder = preCar.substring(foundMake.length).trim();
      
      for (const model of sortedModels) {
        if (remainder.startsWith(model)) {
          foundModel = model;
          break;
        }
      }

      const vt = activeVehicles.find(v => v.name.toLowerCase() === foundMake.toLowerCase());
      if (vt) {
        setVehicleTypeId(vt.id);
        if (foundModel) {
          setVehicleModel(foundModel);
          const finalRest = remainder.substring(foundModel.length).trim();
          // Remove leading hyphens if present, e.g. "- red" -> "red"
          setVehicleDetails(finalRest.replace(/^-+\s*/, ''));
        } else {
          setVehicleDetails(remainder.replace(/^-+\s*/, ''));
        }
      }
    }
  }, [preCar, activeVehicles, vehicleTypeId]);

  useEffect(() => {
    if (user && !name) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user, name])

  const isValidPhone = phone.replace(/\\D/g, '').length >= 10
  const canProceed1 = serviceIds.length > 0 && vehicleTypeId && vehicleModel && vehicleDetails.trim()
  const canProceed2 = name.trim() && isValidPhone && email.trim()
  const canProceed3 = date && time

  const handleSubmit = async () => {
    if (!canBook) {
      toast.error('You have reached your monthly booking limit. Please upgrade your plan.')
      return
    }
    setSubmitting(true)
    try {
      const draft: BookingDraft = {
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
        vehicleTypeId,
        vehicleDetails: `${vehicleModel} - ${vehicleDetails.trim()}`,
        serviceIds,
        date,
        time,
        location: 'Truck-View Workshop, Karu District, Abuja',
        notes: notes.trim(),
      }
      const booking = await createBooking(draft)
      setConfirmed({ reference: booking.reference })
      toast.success('Booking confirmed!')
    } catch (err: any) {
      toast.error(err.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) {
    return <div className="py-20 text-center text-muted">Loading...</div>
  }

  if (!user) {
    return (
      <div className="py-20 px-4">
        <div className="mx-auto max-w-md text-center bg-surface p-8 rounded-3xl shadow-card border border-line">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-500">
            <AlertCircleIcon size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-ink">Login Required</h2>
          <p className="text-muted mb-8">
            To ensure proper tracking and record keeping, you must be logged into your account to book a service.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <ButtonLink to="/login" variant="primary">Login to your Account</ButtonLink>
            <ButtonLink to="/signup" variant="outline">Create an Account</ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="py-20">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-700/20 dark:text-success-400">
            <CheckCircleIcon size={40} />
          </div>
          <h1 className="text-2xl font-bold text-ink">Booking Confirmed!</h1>
          <p className="mt-3 text-muted">Your booking reference is</p>
          <p className="mt-2 text-3xl font-bold text-accent-500">{confirmed.reference}</p>
          <p className="mt-4 text-sm text-muted">Save this reference to track or manage your booking. We'll send a confirmation to your email.</p>
          <div className="mt-8 flex justify-center gap-4">
            {user ? (
              <ButtonLink variant="secondary" to="/dashboard">View Dashboard</ButtonLink>
            ) : (
              <ButtonLink variant="secondary" to="/booking">Track Booking</ButtonLink>
            )}
            <ButtonLink to="/">Back to Home</ButtonLink>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Book a Service" 
        description="Schedule your auto repair or maintenance appointment with Truck-View in Abuja."
        canonicalUrl="https://truckview.com.ng/book"
      />
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-10">
            <h1 className="text-3xl font-bold text-ink">Book a Service</h1>
            <p className="mt-2 text-muted">Fill in the details below to schedule your appointment.</p>
          </motion.div>

        {/* Subscription warning */}
        {!canBook && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircleIcon size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Booking limit reached</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                You've used all {current.bookingsLimit} bookings this month.{' '}
                <ButtonLink to="/pricing" variant="ghost" size="sm" className="text-red-700 underline p-0 h-auto">Upgrade your plan</ButtonLink> to continue booking.
              </p>
            </div>
          </div>
        )}

        {remainingBookings !== null && canBook && (
          <div className="mb-6 rounded-xl bg-accent-50 border border-accent-200 p-3 text-center text-sm text-accent-700 dark:bg-accent-900/20 dark:border-accent-800 dark:text-accent-300">
            You have <strong>{remainingBookings}</strong> booking{remainingBookings !== 1 ? 's' : ''} remaining this month on your <strong className="capitalize">{current.tier}</strong> plan.
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${step >= s ? 'bg-accent-500 text-white' : 'bg-surface-2 text-muted border border-line'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 rounded ${step > s ? 'bg-accent-500' : 'bg-line'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 lg:p-8 shadow-card">
          {/* Step 1: Service */}
          {step === 1 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-5">
              <h2 className="text-lg font-semibold text-ink">1. Select Service & Vehicle</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Vehicle Make" required htmlFor="vehicleType">
                  <Select id="vehicleType" value={vehicleTypeId} onChange={(e) => { 
                    setVehicleTypeId(e.target.value); 
                    setVehicleModel('');
                    setServiceIds([]); 
                  }}>
                    <option value="">Choose make...</option>
                    {activeVehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </Select>
                </Field>
                <Field label="Vehicle Model" required htmlFor="vehicleModel">
                  <Select id="vehicleModel" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} disabled={!vehicleTypeId}>
                    <option value="">Choose model...</option>
                    {vehicleTypeId && (vehicleMakes as any)[activeVehicles.find(v => v.id === vehicleTypeId)?.name || '']?.map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Services <span className="text-red-500">*</span></label>
                {!vehicleTypeId ? (
                  <p className="text-sm text-muted">Please select a vehicle make first.</p>
                ) : (
                  <div className="grid gap-2">
                    {availableServices.map(s => {
                      const isSelected = serviceIds.includes(s.id)
                      return (
                        <label key={s.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-accent-500 bg-accent-50/50 dark:bg-accent-900/10' : 'border-line bg-surface hover:border-accent-300'}`}>
                          <input type="checkbox" className="mt-1 accent-accent-500" checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setServiceIds(prev => [...prev, s.id])
                              else setServiceIds(prev => prev.filter(id => id !== s.id))
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-ink">{s.name}</div>
                            <div className="text-xs text-muted mt-0.5">{s.description}</div>
                            <div className="mt-2 flex gap-4 text-xs text-muted font-medium">
                              <span className="flex items-center gap-1"><ClockIcon size={12} /> {formatDuration(s.duration)}</span>
                              <span>{formatPrice(s.price)}</span>
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
              <Field label="Year & Colour" required htmlFor="vehicleDetails" hint="e.g. 2020 — Silver">
                <Input id="vehicleDetails" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} placeholder="Year, colour, reg number" />
              </Field>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canProceed1}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-5">
              <h2 className="text-lg font-semibold text-ink">2. Your Details</h2>
              <Field label="Full Name" required htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone" required htmlFor="phone">
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" />
                  {phone.trim() && !isValidPhone && (
                    <p className="text-xs text-danger-500 mt-1">Please enter a valid phone number (at least 10 digits).</p>
                  )}
                </Field>
                <Field label="Email" required htmlFor="email">
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </Field>
              </div>
              <Field label="Additional Notes" htmlFor="notes">
                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific issues or requests?" />
              </Field>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!canProceed2}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-5">
              <h2 className="text-lg font-semibold text-ink">3. Choose Date & Time</h2>
              <div>
                <label className="block text-sm font-medium text-ink-soft mb-2">Select a date</label>
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <button key={d} onClick={() => setDate(d)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium border transition-colors ${date === d ? 'bg-accent-500 text-white border-accent-500' : 'bg-surface border-line text-ink-soft hover:border-accent-300'}`}
                    >
                      <CalendarIcon size={12} className="inline mr-1" />
                      {formatShortDate(d)}
                    </button>
                  ))}
                </div>
              </div>
              {date && (
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-2">Select a time</label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-sm text-muted py-4"><div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /> Loading slots…</div>
                  ) : slots.length === 0 || slots.every(s => !s.available) ? (
                    <div className="py-4 space-y-3">
                      <p className="text-sm text-muted">No slots available on this date.</p>
                      <div className="p-4 bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-900/30 rounded-xl">
                        <p className="text-sm font-medium text-warning-800 dark:text-warning-300">Is it urgent or an emergency?</p>
                        <p className="text-sm text-warning-700 dark:text-warning-400 mt-1">
                          <a href="tel:+2348000000000" className="font-bold underline hover:text-warning-900 dark:hover:text-warning-200">Call or Text us instantly</a> and we'll see how we can squeeze you in!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {slots.map((s) => (
                        <button key={s.time} onClick={() => s.available && setTime(s.time)} disabled={!s.available}
                          className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors ${time === s.time ? 'bg-accent-500 text-white border-accent-500' : s.available ? 'bg-surface border-line text-ink-soft hover:border-accent-300' : 'bg-surface-2 text-muted border-line opacity-50 cursor-not-allowed'}`}
                        >
                          <ClockIcon size={12} className="inline mr-1" />
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} disabled={!canProceed3 || submitting || !canBook}>
                  {submitting ? 'Booking…' : 'Confirm Booking'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
