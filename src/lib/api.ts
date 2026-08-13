import { getDay } from 'date-fns'

import * as seed from '../data/mockData'
import type {
  Availability,
  Booking,
  BookingDraft,
  BookingStatus,
  Customer,
  ID,
  Service,
  Settings,
  SiteContent,
  SlotAvailability,
  SubscriptionPlan,
  UserSubscription,
  VehicleType,
  Weekday,
} from '../types'
import { fromISODate, toISODate } from '../utils/format'

const WEEKDAYS: Weekday[] = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
]

interface Store {
  vehicleTypes: VehicleType[]
  services: Service[]
  bookings: Booking[]
  availability: Availability
  content: SiteContent
  settings: Settings
  subscription: UserSubscription
}

const store: Store = {
  vehicleTypes: seed.vehicleTypes.map((v) => ({ ...v })),
  services: seed.services.map((s) => ({ ...s })),
  bookings: seed.bookings.map((b) => ({ ...b })),
  availability: JSON.parse(JSON.stringify(seed.availability)) as Availability,
  content: JSON.parse(JSON.stringify(seed.siteContent)) as SiteContent,
  settings: JSON.parse(JSON.stringify(seed.settings)) as Settings,
  subscription: {
    tier: 'free',
    bookingsUsed: 1,
    bookingsLimit: 3,
    renewsAt: '2026-09-13',
  },
}

const latency = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export class SlotUnavailableError extends Error {
  constructor() {
    super('This time slot is no longer available. Please select another time.')
    this.name = 'SlotUnavailableError'
  }
}

export class BookingLimitError extends Error {
  constructor() {
    super('You have reached your monthly booking limit. Please upgrade your plan to book more services.')
    this.name = 'BookingLimitError'
  }
}

function nextReference(): string {
  const year = new Date().getFullYear()
  const sequence = store.bookings.length + 1
  return `TV-${year}-${String(sequence).padStart(4, '0')}`
}

function weekdayOf(dateISO: string): Weekday {
  return WEEKDAYS[getDay(fromISODate(dateISO))]
}

function withinHours(time: string, start: string, end: string): boolean {
  return time >= start && time < end
}

function bookedCount(dateISO: string, time: string): number {
  return store.bookings.filter(
    (b) => b.date === dateISO && b.time === time && b.status !== 'cancelled',
  ).length
}

function isBlocked(dateISO: string, time: string): boolean {
  return store.availability.blockedSlots.some(
    (s) => s.date === dateISO && s.time === time,
  )
}

function isTooSoon(dateISO: string, time: string): boolean {
  const now = new Date()
  const target = fromISODate(dateISO)
  const [h, m] = time.split(':').map(Number)
  target.setHours(h, m, 0, 0)
  const noticeMs = store.availability.noticeHours * 60 * 60 * 1000
  return target.getTime() - now.getTime() < noticeMs
}

function computeSlots(dateISO: string): SlotAvailability[] {
  const dayConfig = store.availability.businessHours[weekdayOf(dateISO)]
  if (!dayConfig.open || store.availability.blockedDates.includes(dateISO)) {
    return []
  }
  return store.availability.slotTimes
    .filter((time) => withinHours(time, dayConfig.start, dayConfig.end))
    .map((time) => {
      if (isTooSoon(dateISO, time))
        return { time, available: false, reason: 'past' as const }
      if (isBlocked(dateISO, time))
        return { time, available: false, reason: 'blocked' as const }
      if (bookedCount(dateISO, time) >= store.availability.maxPerSlot)
        return { time, available: false, reason: 'booked' as const }
      return { time, available: true }
    })
}

function buildCustomers(): Customer[] {
  const map = new Map<string, Customer>()
  const ordered = [...store.bookings].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  )
  ordered.forEach((booking) => {
    const key = booking.customer.email.toLowerCase()
    const existing = map.get(key)
    if (existing) {
      existing.bookingCount += 1
      existing.lastBookingDate = booking.date
      if (!existing.vehicleTypeIds.includes(booking.vehicleTypeId)) {
        existing.vehicleTypeIds.push(booking.vehicleTypeId)
      }
      return
    }
    map.set(key, {
      id: key,
      name: booking.customer.name,
      phone: booking.customer.phone,
      email: booking.customer.email,
      vehicleTypeIds: [booking.vehicleTypeId],
      bookingCount: 1,
      lastBookingDate: booking.date,
    })
  })
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export const api = {
  async getBootstrap() {
    await latency()
    return {
      vehicleTypes: clone(store.vehicleTypes),
      services: clone(store.services),
      bookings: clone(store.bookings),
      availability: clone(store.availability),
      content: clone(store.content),
      settings: clone(store.settings),
      customers: buildCustomers(),
    }
  },

  async updateContent(content: SiteContent): Promise<SiteContent> {
    await latency(200)
    store.content = clone(content)
    return clone(store.content)
  },

  async updateSettings(settings: Settings): Promise<Settings> {
    await latency(200)
    store.settings = clone(settings)
    store.availability.maxPerSlot = settings.booking.maxPerSlot
    store.availability.noticeHours = settings.booking.noticeHours
    return clone(store.settings)
  },

  async saveService(service: Service): Promise<Service[]> {
    await latency(200)
    const index = store.services.findIndex((s) => s.id === service.id)
    if (index >= 0) store.services[index] = clone(service)
    else store.services.push(clone(service))
    return clone(store.services)
  },

  async deleteService(id: ID): Promise<Service[]> {
    await latency(200)
    store.services = store.services.filter((s) => s.id !== id)
    return clone(store.services)
  },

  async saveVehicleType(vehicleType: VehicleType): Promise<VehicleType[]> {
    await latency(200)
    const index = store.vehicleTypes.findIndex((v) => v.id === vehicleType.id)
    if (index >= 0) store.vehicleTypes[index] = clone(vehicleType)
    else store.vehicleTypes.push(clone(vehicleType))
    return clone(store.vehicleTypes)
  },

  async deleteVehicleType(id: ID): Promise<VehicleType[]> {
    await latency(200)
    store.vehicleTypes = store.vehicleTypes.filter((v) => v.id !== id)
    return clone(store.vehicleTypes)
  },

  async getSlots(dateISO: string): Promise<SlotAvailability[]> {
    await latency(180)
    return computeSlots(dateISO)
  },

  async updateAvailability(availability: Availability): Promise<Availability> {
    await latency(200)
    store.availability = clone(availability)
    return clone(store.availability)
  },

  async createBooking(
    draft: BookingDraft,
  ): Promise<{ booking: Booking; bookings: Booking[] }> {
    await latency(500)

    // Check subscription limit
    if (
      store.subscription.bookingsLimit !== null &&
      store.subscription.bookingsUsed >= store.subscription.bookingsLimit
    ) {
      throw new BookingLimitError()
    }

    const slot = computeSlots(draft.date).find((s) => s.time === draft.time)
    if (!slot || !slot.available) throw new SlotUnavailableError()

    const booking: Booking = {
      ...clone(draft),
      id: `bk-${Date.now()}`,
      reference: nextReference(),
      status: 'pending',
      createdAt: toISODate(new Date()),
    }
    store.bookings.push(booking)
    store.subscription.bookingsUsed += 1
    return { booking: clone(booking), bookings: clone(store.bookings) }
  },

  async updateBookingStatus(id: ID, status: BookingStatus): Promise<Booking[]> {
    await latency(200)
    const booking = store.bookings.find((b) => b.id === id)
    if (booking) booking.status = status
    return clone(store.bookings)
  },

  async rescheduleBooking(id: ID, date: string, time: string): Promise<Booking[]> {
    await latency(250)
    const slot = computeSlots(date).find((s) => s.time === time)
    const takenByOther = store.bookings.some(
      (b) => b.id !== id && b.date === date && b.time === time && b.status !== 'cancelled',
    )
    if (takenByOther || (!slot?.available && slot?.reason !== 'past')) {
      throw new SlotUnavailableError()
    }
    const booking = store.bookings.find((b) => b.id === id)
    if (booking) {
      booking.date = date
      booking.time = time
    }
    return clone(store.bookings)
  },

  async findBookingByReference(reference: string): Promise<Booking | null> {
    await latency(300)
    const match = store.bookings.find(
      (b) => b.reference.toLowerCase() === reference.trim().toLowerCase(),
    )
    return match ? clone(match) : null
  },

  async getCustomers(): Promise<Customer[]> {
    await latency(200)
    return buildCustomers()
  },

  async login(email: string, password: string): Promise<{ name: string; email: string }> {
    await latency(600)
    if (
      email.trim().toLowerCase() === store.settings.account.email &&
      password === 'truckview'
    ) {
      return { name: store.settings.account.name, email: store.settings.account.email }
    }
    throw new Error('Incorrect email or password.')
  },

  /* ---- Subscription ---- */

  getSubscriptionPlans(): SubscriptionPlan[] {
    return clone(seed.subscriptionPlans)
  },

  async getSubscription(): Promise<UserSubscription> {
    await latency(100)
    return clone(store.subscription)
  },

  async updateSubscription(tier: 'free' | 'standard' | 'premium'): Promise<UserSubscription> {
    await latency(400)
    const plan = seed.subscriptionPlans.find((p) => p.tier === tier)!
    store.subscription = {
      tier,
      bookingsUsed: 0,
      bookingsLimit: plan.bookingsPerMonth,
      renewsAt: toISODate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    }
    return clone(store.subscription)
  },
}
