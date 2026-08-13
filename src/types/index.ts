/**
 * Domain types for TruckView.
 */

export type ID = string

export interface VehicleType {
  id: ID
  slug: string
  name: string
  description: string
  image: string
  active: boolean
}

export interface Service {
  id: ID
  slug: string
  name: string
  description: string
  details: string[]
  image: string
  vehicleTypeIds: ID[]
  price: number | null
  duration: number
  active: boolean
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export interface BookingCustomer {
  name: string
  phone: string
  email: string
}

export interface Booking {
  id: ID
  reference: string
  customer: BookingCustomer
  vehicleTypeId: ID
  vehicleDetails: string
  serviceIds: ID[]
  date: string
  time: string
  location: string
  notes: string
  status: BookingStatus
  createdAt: string
}

export type BookingDraft = Omit<
  Booking,
  'id' | 'reference' | 'status' | 'createdAt'
>

export interface Customer {
  id: ID
  name: string
  phone: string
  email: string
  vehicleTypeIds: ID[]
  bookingCount: number
  lastBookingDate: string | null
}

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface BusinessDay {
  open: boolean
  start: string
  end: string
}

export interface Availability {
  businessHours: Record<Weekday, BusinessDay>
  slotTimes: string[]
  blockedDates: string[]
  blockedSlots: { date: string; time: string }[]
  maxPerSlot: number
  noticeHours: number
}

export interface SlotAvailability {
  time: string
  available: boolean
  reason?: 'booked' | 'blocked' | 'past'
}

export interface Testimonial {
  id: ID
  name: string
  role: string
  quote: string
  rating: number
}

export interface SiteContent {
  hero: {
    eyebrow: string
    heading: string
    description: string
    image: string
    featuredServiceIds: ID[]
  }
  about: {
    heading: string
    intro: string
    mission: string
    vision: string
    image: string
  }
  contact: {
    phone: string
    email: string
    address: string
    hours: string
    social: { label: string; url: string }[]
  }
  testimonials: Testimonial[]
}

export interface Settings {
  business: {
    name: string
    phone: string
    email: string
    address: string
  }
  booking: {
    noticeHours: number
    maxPerSlot: number
    cancellationPolicy: string
  }
  account: {
    name: string
    email: string
  }
}

/* ----------------------------------------------------------------- */
/*  Subscription types                                                */
/* ----------------------------------------------------------------- */

export type SubscriptionTier = 'free' | 'standard' | 'premium'

export interface SubscriptionPlan {
  tier: SubscriptionTier
  name: string
  price: number
  bookingsPerMonth: number | null
  features: string[]
  highlighted?: boolean
}

export interface UserSubscription {
  tier: SubscriptionTier
  bookingsUsed: number
  bookingsLimit: number | null
  renewsAt: string
}

/* ----------------------------------------------------------------- */
/*  Quotation types                                                   */
/* ----------------------------------------------------------------- */

export interface QuoteItem {
  id: string
  quantity: number
  description: string
  unitPrice: number
  taxable: boolean
}

export interface Quote {
  id: string
  bookingId: string
  quotationNumber: string
  date: string
  validUntil: string
  preparedBy: string
  items: QuoteItem[]
  subtotal: number
  salesTaxRate: number
  otherFees: number
  total: number
  comments: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  createdAt: string
}
