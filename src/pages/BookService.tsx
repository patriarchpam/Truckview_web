import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, Car, Check } from 'lucide-react'
import { addDays } from 'date-fns'
import { toast } from 'sonner'

import { useStore } from '../contexts/StoreContext'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Button, ButtonLink } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import { Autocomplete } from '../components/ui/Autocomplete'
import { vehicleMakes } from '../data/vehicleMakes'
import type { BookingDraft, SlotAvailability } from '../types'
import { formatTime, formatShortDate, toISODate } from '../utils/format'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

import { SEO } from '../components/SEO'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const SYMPTOMS = [
  'Strange noise',
  'Car won\'t start',
  'Overheating',
  'Warning light',
  'Poor acceleration',
  'Brake problem',
  'AC problem',
  'Electrical problem',
  'Strange smell',
  'Excessive fuel consumption',
  'Other'
]

export function BookService() {
  const location = useLocation()
  const { services, vehicleTypes, getSlots, createBooking } = useStore()
  useSubscription()

  const preService = (location.state as { serviceId?: string })?.serviceId
  const preVehicle = (location.state as { vehicleTypeId?: string })?.vehicleTypeId

  const { user, ready } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const preCar = searchParams.get('car')

  const [step, setStep] = useState(1)
  
  // Booking Modes: 'service' (user knows) or 'diagnostic' (unknown problem)
  const [bookingMode, setBookingMode] = useState<'service' | 'diagnostic'>('service')
  
  // Selected fields
  const [serviceIds, setServiceIds] = useState<string[]>(preService ? [preService] : [])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [symptomDescription, setSymptomDescription] = useState('')

  // Vehicle states
  const [savedVehicles, setSavedVehicles] = useState<any[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [isManualVehicle, setIsManualVehicle] = useState(false)
  const [vehicleTypeId, setVehicleTypeId] = useState(preVehicle ?? '') // Make
  const [vehicleModel, setVehicleModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [saveToGarage, setSaveToGarage] = useState(true)

  // Customer states
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [email, setEmail] = useState(user?.email || '')
  
  // Appointment states
  const [date, setDate] = useState('')
  const [time, setTime] = useState('') // "Morning", "Afternoon", "Evening", or exact HH:MM slot
  const [timeType, setTimeType] = useState<'flexible' | 'specific'>('flexible')
  const [notes, setNotes] = useState('')
  
  const [slots, setSlots] = useState<SlotAvailability[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ reference: string } | null>(null)

  const activeServices = services.filter((s) => s.active)
  const activeVehicles = vehicleTypes.filter((v) => v.active)
  const makes = Object.keys(vehicleMakes)

  const models = useMemo(() => {
    if (!vehicleTypeId) return []
    // Extract make name from slug or ID, e.g. "vt-toyota" -> "Toyota"
    const makeId = vehicleTypeId.startsWith('vt-') ? vehicleTypeId.substring(3) : vehicleTypeId
    const key = Object.keys(vehicleMakes).find(k => k.toLowerCase() === makeId.toLowerCase())
    return key ? (vehicleMakes as any)[key] : []
  }, [vehicleTypeId])

  const selectedVehicleDetails = useMemo(() => {
    if (!isManualVehicle && selectedVehicleId) {
      return savedVehicles.find(v => v.id === selectedVehicleId)
    }
    return null
  }, [isManualVehicle, selectedVehicleId, savedVehicles])

  // Next 14 days for date picker
  const dates = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 14 }, (_, i) => toISODate(addDays(today, i)))
  }, [])

  const loadSlots = useCallback(async (d: string) => {
    setLoadingSlots(true)
    const result = await getSlots(d)
    setSlots(result)
    setLoadingSlots(false)
  }, [getSlots])

  useEffect(() => {
    if (date) void loadSlots(date)
  }, [date, loadSlots])

  // Load user's saved vehicles & contact phone number
  const loadSavedData = async () => {
    if (!user?.profileId) return
    setLoadingVehicles(true)
    try {
      // Load saved vehicles
      const vehicles = await api.getSavedVehicles(user.profileId)
      setSavedVehicles(vehicles)
      if (vehicles.length > 0) {
        setSelectedVehicleId(vehicles[0].id)
        setIsManualVehicle(false)
      } else {
        setIsManualVehicle(true)
      }
      
      // Load phone number
      const { data } = await supabase.from('profiles').select('phone').eq('id', user.profileId).single()
      if (data?.phone) {
        setPhone(data.phone)
      }
    } catch {
      // local storage fallback
      const stored = localStorage.getItem(`vehicles_${user.profileId}`)
      if (stored) {
        const vehicles = JSON.parse(stored)
        setSavedVehicles(vehicles)
        if (vehicles.length > 0) {
          setSelectedVehicleId(vehicles[0].id)
          setIsManualVehicle(false)
        } else {
          setIsManualVehicle(true)
        }
      } else {
        setIsManualVehicle(true)
      }
    } finally {
      setLoadingVehicles(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadSavedData()
      setName(user.name)
      setEmail(user.email)
      if (user.phone) setPhone(user.phone)
    }
  }, [user])

  // Handle URL pre-filled car parameters
  useEffect(() => {
    if (!preCar || !activeVehicles.length || vehicleTypeId) return;
    
    setIsManualVehicle(true)
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
      const sortedModels = [...((vehicleMakes as any)[foundMake] || [])].sort((a: string, b: string) => b.length - a.length);
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
          const cleanRest = finalRest.replace(/^-+\s*/, '');
          
          // Try to extract year (4 digit number)
          const yearMatch = cleanRest.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) {
            setYear(yearMatch[0]);
            setColor(cleanRest.replace(yearMatch[0], '').replace(/-|\s+/g, ' ').trim());
          } else {
            setYear(new Date().getFullYear().toString());
            setColor(cleanRest);
          }
        } else {
          setYear(new Date().getFullYear().toString());
        }
      }
    }
  }, [preCar, activeVehicles, vehicleTypeId]);

  const isValidPhone = phone.replace(/\D/g, '').length >= 10
  
  const canProceed1 = useMemo(() => {
    // Check vehicle
    if (!isManualVehicle && !selectedVehicleId) return false
    if (isManualVehicle && (!vehicleTypeId || !vehicleModel || !year)) return false
    
    // Check service
    if (bookingMode === 'service' && serviceIds.length === 0) return false
    if (bookingMode === 'diagnostic' && !symptomDescription.trim() && selectedSymptoms.length === 0) return false
    
    return true
  }, [isManualVehicle, selectedVehicleId, vehicleTypeId, vehicleModel, year, bookingMode, serviceIds, symptomDescription, selectedSymptoms])

  const canProceed2 = name.trim() && isValidPhone && email.trim()
  const canProceed3 = date && time

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      let finalVehicleTypeId = vehicleTypeId
      let finalVehicleDetails = ''

      if (!isManualVehicle && selectedVehicleDetails) {
        const make = selectedVehicleDetails.make
        finalVehicleTypeId = `vt-${make.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
        finalVehicleDetails = `${selectedVehicleDetails.model} - ${selectedVehicleDetails.year} ${selectedVehicleDetails.color ? '(' + selectedVehicleDetails.color + ')' : ''} [${selectedVehicleDetails.plateNumber || 'No Reg'}]`
      } else {
        const makeName = vehicleTypeId.startsWith('vt-') ? vehicleTypeId.substring(3) : vehicleTypeId
        // Format makeName capitalized
        const capitalizedMake = makeName.charAt(0).toUpperCase() + makeName.slice(1)
        finalVehicleDetails = `${vehicleModel} - ${year} ${color ? '(' + color + ')' : ''} [${plateNumber || 'No Reg'}]`
        
        // Auto-save vehicle to garage if checked
        if (user?.profileId && saveToGarage) {
          try {
            await api.saveVehicle({
              profileId: user.profileId,
              make: capitalizedMake,
              model: vehicleModel,
              year: parseInt(year),
              color: color || undefined,
              plateNumber: plateNumber || undefined
            })
          } catch (e) {
            // Local storage fallback for vehicle auto-save
            const stored = localStorage.getItem(`vehicles_${user.profileId}`)
            const curVehicles = stored ? JSON.parse(stored) : []
            curVehicles.push({
              id: Date.now().toString(),
              make: capitalizedMake,
              model: vehicleModel,
              year: parseInt(year),
              color,
              plateNumber,
              details: `${capitalizedMake} ${vehicleModel} ${year}${plateNumber ? ' - ' + plateNumber : ''}`
            })
            localStorage.setItem(`vehicles_${user.profileId}`, JSON.stringify(curVehicles))
          }
        }
      }

      // Build diagnostic details or list of service IDs
      const finalServiceIds = bookingMode === 'service' ? serviceIds : ['svc-engine'] // Map diagnostic mode to engine/diagnostics service
      const finalNotes = bookingMode === 'diagnostic' 
        ? `[Symptom checklist: ${selectedSymptoms.join(', ') || 'None'}] Description: ${symptomDescription}\n\nAdditional notes: ${notes}`
        : notes

      const draft: BookingDraft = {
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
        vehicleTypeId: finalVehicleTypeId,
        vehicleDetails: finalVehicleDetails,
        serviceIds: finalServiceIds,
        date,
        time,
        location: 'Truck-View Workshop, Karu District, Abuja',
        notes: finalNotes.trim(),
      }

      const booking = await createBooking(draft)
      setConfirmed({ reference: booking.reference })
      toast.success('Booking request submitted!')
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
          <h1 className="text-2xl font-bold text-ink">Service Request Submitted!</h1>
          <p className="mt-3 text-muted">Your booking reference is</p>
          <p className="mt-2 text-3xl font-bold text-accent-500">{confirmed.reference}</p>
          <p className="mt-4 text-sm text-muted">
            We have received your preference request. Our service advisors will review the request and confirm your final appointment time.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink variant="secondary" to="/dashboard">Go to Dashboard</ButtonLink>
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
            <p className="mt-2 text-muted">Fill in the details below to schedule your appointment preference.</p>
          </motion.div>

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
            {/* Step 1: Select Service & Vehicle */}
            {step === 1 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-line pb-4 mb-4">
                  <h2 className="text-lg font-bold text-ink">1. Vehicle & Service Selection</h2>
                </div>

                {/* Vehicle Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-ink-soft">Select Vehicle</label>
                  
                  {loadingVehicles ? (
                    <div className="text-sm text-muted">Loading saved vehicles...</div>
                  ) : savedVehicles.length > 0 && !isManualVehicle ? (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {savedVehicles.map(v => (
                          <div
                            key={v.id}
                            onClick={() => {
                              setSelectedVehicleId(v.id)
                              setVehicleTypeId(`vt-${v.make.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
                              setVehicleModel(v.model)
                            }}
                            className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                              selectedVehicleId === v.id
                                ? 'border-accent-500 bg-accent-50/20 dark:bg-accent-950/10'
                                : 'border-line hover:border-accent-300 bg-surface'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-surface-2 flex items-center justify-center">
                                <Car size={18} className="text-accent-500" />
                              </div>
                              <div>
                                <span className="font-semibold text-ink text-sm">{v.year} {v.make} {v.model}</span>
                                {v.plateNumber && <span className="block text-xs font-semibold text-accent-500 uppercase">{v.plateNumber}</span>}
                              </div>
                            </div>
                            {selectedVehicleId === v.id && (
                              <div className="h-5 w-5 rounded-full bg-accent-500 text-white flex items-center justify-center shrink-0">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsManualVehicle(true)}
                        className="text-xs text-accent-500 hover:text-accent-600 font-semibold"
                      >
                        + Add a different vehicle
                      </button>
                    </div>
                  ) : (
                    <div className="bg-surface-2 p-5 rounded-2xl border border-line space-y-4">
                      {savedVehicles.length > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-accent-500 uppercase">New Vehicle Details</span>
                          <button
                            type="button"
                            onClick={() => setIsManualVehicle(false)}
                            className="text-xs text-muted hover:text-ink font-semibold"
                          >
                            Choose from saved garage
                          </button>
                        </div>
                      )}
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Vehicle Make" required>
                          <Autocomplete
                            value={vehicleTypeId.startsWith('vt-') ? vehicleTypeId.substring(3).charAt(0).toUpperCase() + vehicleTypeId.substring(3).slice(1) : vehicleTypeId}
                            onChange={(val) => {
                              setVehicleTypeId(`vt-${val.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
                              setVehicleModel('')
                            }}
                            options={makes}
                            placeholder="Search Make (e.g. Toyota)..."
                          />
                        </Field>
                        
                        <Field label="Vehicle Model" required>
                          <Autocomplete
                            value={vehicleModel}
                            onChange={setVehicleModel}
                            options={models}
                            placeholder="Search Model (e.g. Camry)..."
                            disabled={!vehicleTypeId}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <Field label="Year" required>
                            <Input
                              type="number"
                              min="1990"
                              max={new Date().getFullYear() + 1}
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              placeholder="2019"
                            />
                          </Field>
                        </div>
                        <div className="col-span-1">
                          <Field label="Color">
                            <Input
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              placeholder="Silver"
                            />
                          </Field>
                        </div>
                        <div className="col-span-1">
                          <Field label="Plate Number" hint="e.g. ABC-123-XY">
                            <Input
                              value={plateNumber}
                              onChange={(e) => setPlateNumber(e.target.value)}
                              placeholder="Reg Plate"
                              className="uppercase"
                            />
                          </Field>
                        </div>
                      </div>
                      
                      {user && (
                        <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs text-ink-soft">
                          <input
                            type="checkbox"
                            className="accent-accent-500"
                            checked={saveToGarage}
                            onChange={(e) => setSaveToGarage(e.target.checked)}
                          />
                          Save this vehicle to my garage
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Service Mode Toggles */}
                <div className="space-y-4 pt-4 border-t border-line">
                  <label className="block text-sm font-semibold text-ink-soft">What do you need help with?</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingMode('service')}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                        bookingMode === 'service'
                          ? 'border-accent-500 bg-accent-50/20 text-accent-600 dark:bg-accent-950/10'
                          : 'border-line hover:border-accent-300 text-ink-soft bg-surface'
                      }`}
                    >
                      I know what service I need
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingMode('diagnostic')}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                        bookingMode === 'diagnostic'
                          ? 'border-accent-500 bg-accent-50/20 text-accent-600 dark:bg-accent-950/10'
                          : 'border-line hover:border-accent-300 text-ink-soft bg-surface'
                      }`}
                    >
                      I'm not sure what's wrong
                    </button>
                  </div>
                </div>

                {/* Service Checklist or Diagnosis inputs */}
                <div className="space-y-4">
                  {bookingMode === 'service' ? (
                    <div>
                      <label className="block text-sm font-semibold text-ink-soft mb-2">Select Services</label>
                      <div className="grid gap-2 max-h-60 overflow-y-auto pr-1 border border-line p-2 rounded-xl">
                        {activeServices.map(s => {
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
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-surface-2 p-5 rounded-2xl border border-line">
                      <div>
                        <label className="block text-xs font-bold text-accent-500 uppercase mb-2">Select Symptoms (Optional)</label>
                        <div className="flex flex-wrap gap-2">
                          {SYMPTOMS.map(symp => {
                            const isSelected = selectedSymptoms.includes(symp)
                            return (
                              <button
                                key={symp}
                                type="button"
                                onClick={() => {
                                  if (isSelected) setSelectedSymptoms(prev => prev.filter(s => s !== symp))
                                  else setSelectedSymptoms(prev => [...prev, symp])
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                                    : 'bg-surface text-ink-soft border-line hover:border-accent-300'
                                }`}
                              >
                                {symp}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <Field label="Describe what you're experiencing" required hint="Describe symptoms, noise type, timing, etc.">
                        <Textarea
                          value={symptomDescription}
                          onChange={(e) => setSymptomDescription(e.target.value)}
                          placeholder="My car makes a strange knocking noise when I accelerate from a stop..."
                          rows={4}
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-line">
                  <Button onClick={() => setStep(2)} disabled={!canProceed1}>Continue</Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-line pb-4 mb-4">
                  <h2 className="text-lg font-bold text-ink">2. Contact Information</h2>
                </div>

                {user ? (
                  <div className="bg-surface-2 p-5 rounded-2xl border border-line space-y-4">
                    <p className="text-xs text-muted leading-relaxed">
                      You are logged in. The booking will be associated with your account and the information below.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <span className="text-xs text-muted block">Full Name</span>
                        <span className="text-sm font-semibold text-ink">{user.name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted block">Email Address</span>
                        <span className="text-sm font-semibold text-ink">{user.email}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted block">Phone Number</span>
                        {isValidPhone ? (
                          <span className="text-sm font-semibold text-ink">{phone}</span>
                        ) : (
                          <div className="mt-1">
                            <Input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Enter phone number"
                              className="text-sm"
                            />
                            {phone.trim() && !isValidPhone && (
                              <p className="text-xs text-red-500 mt-1">Provide a valid phone number (at least 10 digits).</p>
                            )}
                            {!phone.trim() && (
                              <p className="text-xs text-amber-500 mt-1">Phone number required to continue.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-2 text-xs text-muted flex justify-between items-center border-t border-line/50 mt-2">
                      <span>Need to update details?</span>
                      <Link to="/dashboard/profile" className="text-accent-500 hover:text-accent-600 font-semibold underline">Edit Profile Settings</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Full Name" required>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Phone Number" required>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" />
                        {phone.trim() && !isValidPhone && (
                          <p className="text-xs text-red-500 mt-1">Provide a valid phone number (at least 10 digits).</p>
                        )}
                      </Field>
                      <Field label="Email Address" required>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                      </Field>
                    </div>
                  </div>
                )}

                <Field label="Additional Instructions or Notes (Optional)" hint="Anything else we should know?">
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. I need towing assistance, or please look at the dashboard indicators too."
                  />
                </Field>

                <div className="flex justify-between pt-4 border-t border-line">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceed2}>Continue</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Date & Preferred Time */}
            {step === 3 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="border-b border-line pb-4 mb-4">
                  <h2 className="text-lg font-bold text-ink">3. Choose Appointment Preference</h2>
                </div>

                <div className="p-4 bg-accent-50/50 border border-accent-200 dark:bg-accent-950/10 dark:border-accent-900 rounded-2xl flex gap-3 text-sm text-accent-700 dark:text-accent-400">
                  <AlertCircleIcon className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-semibold">Flexible Booking Schedule</p>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      Your selected date and time are preferences. TruckView will review the request and contact you to confirm the final appointment time.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-ink-soft">Select Date</label>
                  <div className="flex flex-wrap gap-2">
                    {dates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDate(d)}
                        className={`rounded-xl px-4 py-3 text-xs font-semibold border transition-all ${
                          date === d
                            ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                            : 'bg-surface border-line text-ink-soft hover:border-accent-300'
                        }`}
                      >
                        <CalendarIcon size={12} className="inline mr-1 -mt-0.5" />
                        {formatShortDate(d)}
                      </button>
                    ))}
                  </div>
                </div>

                {date && (
                  <div className="space-y-4 pt-4 border-t border-line">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-ink-soft">Select Preferred Time</label>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setTimeType('flexible'); setTime('') }}
                          className={`font-semibold py-0.5 px-2 rounded-full ${timeType === 'flexible' ? 'bg-accent-100 text-accent-700' : 'text-muted'}`}
                        >
                          Flexible Period
                        </button>
                        <button
                          type="button"
                          onClick={() => { setTimeType('specific'); setTime('') }}
                          className={`font-semibold py-0.5 px-2 rounded-full ${timeType === 'specific' ? 'bg-accent-100 text-accent-700' : 'text-muted'}`}
                        >
                          Specific Hour
                        </button>
                      </div>
                    </div>

                    {timeType === 'flexible' ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Morning', desc: '8:00 AM - 12:00 PM', value: 'Morning' },
                          { label: 'Afternoon', desc: '12:00 PM - 4:00 PM', value: 'Afternoon' },
                          { label: 'Evening', desc: '4:00 PM - 6:00 PM', value: 'Evening' }
                        ].map(t => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setTime(t.value)}
                            className={`rounded-xl p-4 border text-center transition-all ${
                              time === t.value
                                ? 'border-accent-500 bg-accent-50/20 text-accent-600 dark:bg-accent-950/10'
                                : 'border-line bg-surface hover:border-accent-300'
                            }`}
                          >
                            <ClockIcon size={16} className="mx-auto mb-1.5 text-accent-500" />
                            <div className="font-semibold text-sm text-ink">{t.label}</div>
                            <div className="text-[10px] text-muted mt-0.5">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {loadingSlots ? (
                          <div className="flex items-center gap-2 text-sm text-muted py-4">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                            Loading available hours...
                          </div>
                        ) : slots.length === 0 || slots.every(s => !s.available) ? (
                          <div className="py-4 space-y-3">
                            <p className="text-sm text-muted">No specific hours available. Please choose a flexible period above.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {slots.map((s) => (
                              <button
                                key={s.time}
                                type="button"
                                onClick={() => s.available && setTime(s.time)}
                                disabled={!s.available}
                                className={`rounded-xl px-3 py-2.5 text-sm font-semibold border transition-all ${
                                  time === s.time
                                    ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                                    : s.available
                                      ? 'bg-surface border-line text-ink-soft hover:border-accent-300'
                                      : 'bg-surface-2 text-muted border-line opacity-50 cursor-not-allowed'
                                }`}
                              >
                                <ClockIcon size={12} className="inline mr-1 -mt-0.5" />
                                {formatTime(s.time)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-line">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={!canProceed3 || submitting}>
                    {submitting ? 'Submitting Request…' : 'Submit Service Request'}
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
