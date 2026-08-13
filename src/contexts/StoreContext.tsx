import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { api } from '../lib/api'
import type {
  Availability, Booking, BookingDraft, BookingStatus, Customer, ID,
  Service, Settings, SiteContent, SlotAvailability, VehicleType,
} from '../types'

interface StoreValue {
  loading: boolean
  error: string | null
  vehicleTypes: VehicleType[]
  services: Service[]
  bookings: Booking[]
  availability: Availability
  content: SiteContent | null
  settings: Settings | null
  customers: Customer[]
  reload: () => Promise<void>
  refresh: () => Promise<void>
  getSlots: (dateISO: string) => Promise<SlotAvailability[]>
  createBooking: (draft: BookingDraft) => Promise<Booking>
  updateBookingStatus: (id: ID, status: BookingStatus) => Promise<void>
  rescheduleBooking: (id: ID, date: string, time: string) => Promise<void>
  deleteVehicleType: (id: ID) => Promise<void>
  updateAvailability: (availability: Availability) => Promise<void>
  updateContent: (content: SiteContent) => Promise<void>
  updateSettings: (settings: Settings) => Promise<void>
  serviceById: (id: ID) => Service | undefined
  vehicleTypeById: (id: ID) => VehicleType | undefined
}

const emptyAvailability: Availability = {
  businessHours: {
    monday: { open: false, start: '08:00', end: '17:00' },
    tuesday: { open: false, start: '08:00', end: '17:00' },
    wednesday: { open: false, start: '08:00', end: '17:00' },
    thursday: { open: false, start: '08:00', end: '17:00' },
    friday: { open: false, start: '08:00', end: '17:00' },
    saturday: { open: false, start: '09:00', end: '14:00' },
    sunday: { open: false, start: '09:00', end: '14:00' },
  },
  slotTimes: [],
  blockedDates: [],
  blockedSlots: [],
  maxPerSlot: 1,
  noticeHours: 4,
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<Availability>(emptyAvailability)
  const [content, setContent] = useState<SiteContent | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getBootstrap()
      setVehicleTypes(data.vehicleTypes)
      setServices(data.services)
      setBookings(data.bookings)
      setAvailability(data.availability)
      setContent(data.content)
      setSettings(data.settings)
      setCustomers(data.customers)
    } catch {
      setError('We could not load TruckView content. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void reload() }, [reload])

  const refreshCustomers = useCallback(async () => {
    setCustomers(await api.getCustomers())
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      loading, error, vehicleTypes, services, bookings, availability, content, settings, customers, reload,
      getSlots: (dateISO) => api.getSlots(dateISO),
      refresh: async () => { await reload() },
      createBooking: async (draft) => {
        const result = await api.createBooking(draft)
        await reload()
        return result.booking
      },
      updateBookingStatus: async (id, status) => { await api.updateBookingStatus(id, status); await reload() },
      rescheduleBooking: async (id, date, time) => { await api.rescheduleBooking(id, date, time); await reload() },
      saveService: async (service) => { await api.saveService(service); await reload() },
      deleteService: async (id) => { await api.deleteService(id); await reload() },
      saveVehicleType: async (vt) => { await api.saveVehicleType(vt); await reload() },
      deleteVehicleType: async (id) => { await api.deleteVehicleType(id); await reload() },
      updateAvailability: async (next) => { setAvailability(await api.updateAvailability(next)) },
      updateContent: async (next) => { setContent(await api.updateContent(next)) },
      updateSettings: async (next) => {
        const saved = await api.updateSettings(next)
        setSettings(saved)
        setAvailability((cur) => ({ ...cur, maxPerSlot: saved.booking.maxPerSlot, noticeHours: saved.booking.noticeHours }))
      },
      serviceById: (id) => services.find((s) => s.id === id),
      vehicleTypeById: (id) => vehicleTypes.find((v) => v.id === id),
    }),
    [loading, error, vehicleTypes, services, bookings, availability, content, settings, customers, reload, refreshCustomers],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
