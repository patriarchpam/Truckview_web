import { getDay } from 'date-fns'
import { supabase } from './supabase'
import type {
  Availability,
  Booking,
  BookingDraft,
  BookingStatus,
  Customer,
  ID,
  Quote,
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
import * as seed from '../data/mockData' // fallback for singletons
import { vehicleMakes } from '../data/vehicleMakes'

const WEEKDAYS: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

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

function weekdayOf(dateISO: string): Weekday {
  return WEEKDAYS[getDay(fromISODate(dateISO))]
}

function withinHours(time: string, start: string, end: string): boolean {
  return time >= start && time < end
}

function isTooSoon(dateISO: string, time: string, noticeHours: number): boolean {
  const now = new Date()
  const target = fromISODate(dateISO)
  const [h, m] = time.split(':').map(Number)
  target.setHours(h, m, 0, 0)
  return target.getTime() - now.getTime() < noticeHours * 60 * 60 * 1000
}

function nextReference(currentCount: number): string {
  const year = new Date().getFullYear()
  const sequence = currentCount + 1
  return `TV-${year}-${String(sequence).padStart(4, '0')}`
}

export const api = {
  async getBootstrap() {
    const [{ data: services }, { data: vehicleTypes }, { data: bookings }] = await Promise.all([
      supabase.from('services').select('*'),
      supabase.from('vehicle_types').select('*'),
      supabase.from('bookings').select('*, profiles(name, phone, email)'),
    ])

    const availability = seed.availability
    const content = seed.siteContent
    const settings = seed.settings

    const transformedBookings: Booking[] = (bookings || []).map((b: any) => ({
      id: b.id,
      reference: b.reference,
      customer: {
        name: b.profiles?.name || 'Unknown',
        phone: b.profiles?.phone || '',
        email: b.profiles?.email || '',
      },
      vehicleTypeId: b.vehicle_type_id,
      vehicleDetails: b.vehicle_details,
      serviceIds: b.service_id ? b.service_id.split(',') : [],
      date: b.date,
      time: b.time,
      location: b.location,
      notes: b.notes,
      status: b.status,
      createdAt: b.created_at,
    }))

    const transformedVehicleTypes: VehicleType[] = (vehicleTypes || []).map((v: any) => ({
      id: v.id,
      slug: v.id, // Generate slug fallback
      name: v.name,
      description: v.description,
      image: v.image,
      active: v.active,
    }))

    const transformedServices: Service[] = (services || []).map((s: any) => ({
      id: s.id,
      slug: s.id, // Generate slug fallback
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
      details: s.details,
      image: s.image,
      vehicleTypeIds: s.vehicle_type_ids, // Mapped from snake_case
      active: s.active,
    }))

    return {
      vehicleTypes: transformedVehicleTypes,
      services: transformedServices,
      bookings: transformedBookings,
      availability,
      content,
      settings,
      customers: await api.getCustomers(),
    }
  },

  async updateContent(content: SiteContent): Promise<SiteContent> {
    return content 
  },

  async updateSettings(settings: Settings): Promise<Settings> {
    return settings 
  },

  async saveService(service: Service): Promise<Service[]> {
    const id = service.id || `srv-${Date.now()}`
    const { error } = await supabase.from('services').upsert({
      id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      details: service.details,
      image: service.image,
      vehicle_type_ids: service.vehicleTypeIds,
      active: service.active,
    })
    if (error) throw new Error(error.message)
    const { data } = await supabase.from('services').select('*')
    return data as Service[] || []
  },

  async deleteService(id: ID): Promise<Service[]> {
    await supabase.from('services').delete().eq('id', id)
    const { data } = await supabase.from('services').select('*')
    return data as Service[] || []
  },

  async saveVehicleType(vehicleType: VehicleType): Promise<VehicleType[]> {
    const id = vehicleType.id || `vt-${Date.now()}`
    const payload = { ...vehicleType, id }
    const { error } = await supabase.from('vehicle_types').upsert(payload)
    if (error) throw new Error(error.message)
    const { data } = await supabase.from('vehicle_types').select('*')
    return data as VehicleType[] || []
  },

  async deleteVehicleType(id: ID): Promise<VehicleType[]> {
    await supabase.from('vehicle_types').delete().eq('id', id)
    const { data } = await supabase.from('vehicle_types').select('*')
    return data as VehicleType[] || []
  },

  async getSlots(dateISO: string): Promise<SlotAvailability[]> {
    const availability = seed.availability
    const dayConfig = availability.businessHours[weekdayOf(dateISO)]
    
    if (!dayConfig.open || availability.blockedDates.includes(dateISO)) return []

    const { data: bookings } = await supabase.from('bookings').select('time').eq('date', dateISO).neq('status', 'cancelled')
    const bookedTimes = (bookings || []).map((b) => b.time)
    const countTime = (time: string) => bookedTimes.filter((t) => t === time).length

    return availability.slotTimes
      .filter((time) => withinHours(time, dayConfig.start, dayConfig.end))
      .map((time) => {
        if (isTooSoon(dateISO, time, availability.noticeHours)) return { time, available: false, reason: 'past' as const }
        if (availability.blockedSlots.some(s => s.date === dateISO && s.time === time)) return { time, available: false, reason: 'blocked' as const }
        if (countTime(time) >= availability.maxPerSlot) return { time, available: false, reason: 'booked' as const }
        return { time, available: true }
      })
  },

  async updateAvailability(availability: Availability): Promise<Availability> {
    return availability 
  },

  async createBooking(draft: BookingDraft): Promise<{ booking: Booking; bookings: Booking[] }> {
    // 1. Get or create profile
    let profileId: string
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', draft.customer.email.toLowerCase()).single()
    
    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      // Create new profile without Auth required
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({ name: draft.customer.name, email: draft.customer.email.toLowerCase(), phone: draft.customer.phone })
        .select()
        .single()
      
      if (profileError || !newProfile) throw new Error('Failed to create customer profile. Have you run the updated schema migration?')
      profileId = newProfile.id
    }

    // 2. Check subscription (bookings are free, but we still track usage)
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('profile_id', profileId).single()
    const used = sub?.bookings_used ?? 0

    // 3. Verify slot (only if it is a specific slot time like "10:00")
    const isSpecificSlot = /^\d{2}:\d{2}$/.test(draft.time)
    if (isSpecificSlot) {
      const slots = await api.getSlots(draft.date)
      const slot = slots.find((s) => s.time === draft.time)
      if (!slot || !slot.available) throw new SlotUnavailableError()
    }

    // 4. Insert booking
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
    const ref = nextReference(count || 0)
    const bookingId = `bk-${Date.now()}`

    const { error: bookingError } = await supabase.from('bookings').insert({
      id: bookingId,
      reference: ref,
      profile_id: profileId,
      vehicle_type_id: draft.vehicleTypeId,
      vehicle_details: draft.vehicleDetails,
      service_id: draft.serviceIds.join(','),
      date: draft.date,
      time: draft.time,
      location: draft.location,
      notes: draft.notes,
      status: 'pending',
    })

    if (bookingError) throw new Error(bookingError.message)

    // 5. Update subscription usage
    if (sub) {
      await supabase.from('subscriptions').update({ bookings_used: used + 1 }).eq('profile_id', profileId)
    } else {
      await supabase.from('subscriptions').insert({ profile_id: profileId, tier: 'free', bookings_used: 1, bookings_limit: 3, renews_at: toISODate(new Date()) })
    }

    // Reload all bookings to return fresh state
    const { bookings } = await this.getBootstrap()
    const newBooking = bookings.find(b => b.id === bookingId)!
    
    return { booking: newBooking, bookings }
  },

  async updateBookingStatus(id: ID, status: BookingStatus): Promise<Booking[]> {
    await supabase.from('bookings').update({ status }).eq('id', id)
    const { bookings } = await this.getBootstrap()
    return bookings
  },

  async rescheduleBooking(id: ID, date: string, time: string): Promise<Booking[]> {
    await supabase.from('bookings').update({ date, time }).eq('id', id)
    const { bookings } = await this.getBootstrap()
    return bookings
  },

  async findBookingByReference(reference: string): Promise<Booking | null> {
    const { data } = await supabase.from('bookings').select('*, profiles(name, phone, email)').ilike('reference', reference).single()
    if (!data) return null
    return {
      id: data.id,
      reference: data.reference,
      customer: {
        name: data.profiles?.name || 'Unknown',
        phone: data.profiles?.phone || '',
        email: data.profiles?.email || '',
      },
      vehicleTypeId: data.vehicle_type_id,
      vehicleDetails: data.vehicle_details,
      serviceIds: data.service_id ? data.service_id.split(',') : [],
      date: data.date,
      time: data.time,
      location: data.location,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
    }
  },

  async findBookingsByEmail(email: string): Promise<Booking[]> {
    const { data: profile } = await supabase.from('profiles').select('id').ilike('email', email).single()
    if (!profile) return []

    const { data } = await supabase.from('bookings').select('*, profiles(name, phone, email)').eq('profile_id', profile.id).order('date', { ascending: false })
    if (!data) return []

    return data.map((b: any) => ({
      id: b.id,
      reference: b.reference,
      customer: {
        name: b.profiles?.name || 'Unknown',
        phone: b.profiles?.phone || '',
        email: b.profiles?.email || '',
      },
      vehicleTypeId: b.vehicle_type_id,
      vehicleDetails: b.vehicle_details,
      serviceIds: b.service_id ? b.service_id.split(',') : [],
      date: b.date,
      time: b.time,
      location: b.location,
      notes: b.notes,
      status: b.status,
      createdAt: b.created_at,
    }))
  },

  async getQuoteByBookingId(bookingId: string): Promise<Quote | null> {
    const { data, error } = await supabase.from('quotes').select('*').eq('booking_id', bookingId).single()
    if (error || !data) return null
    return {
      id: data.id,
      bookingId: data.booking_id,
      quotationNumber: data.quotation_number,
      date: data.date,
      validUntil: data.valid_until,
      preparedBy: data.prepared_by,
      items: data.items,
      subtotal: data.subtotal,
      salesTaxRate: data.sales_tax_rate,
      otherFees: data.other_fees,
      total: data.total,
      comments: data.comments,
      status: data.status,
      createdAt: data.created_at
    }
  },

  async saveQuote(quote: Partial<Quote>): Promise<Quote> {
    const payload = {
      booking_id: quote.bookingId,
      quotation_number: quote.quotationNumber,
      date: quote.date,
      valid_until: quote.validUntil,
      prepared_by: quote.preparedBy,
      items: quote.items,
      subtotal: quote.subtotal,
      sales_tax_rate: quote.salesTaxRate,
      other_fees: quote.otherFees,
      total: quote.total,
      comments: quote.comments,
      status: quote.status || 'sent'
    }

    let res
    if (quote.id) {
      res = await supabase.from('quotes').update(payload).eq('id', quote.id).select().single()
    } else {
      res = await supabase.from('quotes').insert(payload).select().single()
    }
    
    if (res.error) throw new Error(res.error.message)
    const data = res.data
    return {
      id: data.id, bookingId: data.booking_id, quotationNumber: data.quotation_number, date: data.date,
      validUntil: data.valid_until, preparedBy: data.prepared_by, items: data.items, subtotal: data.subtotal,
      salesTaxRate: data.sales_tax_rate, otherFees: data.other_fees, total: data.total, comments: data.comments,
      status: data.status, createdAt: data.created_at
    }
  },

  async updateQuoteStatus(quoteId: string, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabase.from('quotes').update({ status }).eq('id', quoteId)
    if (error) throw new Error(error.message)
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('images').upload(fileName, file)
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from('images').getPublicUrl(fileName)
    return data.publicUrl
  },

  async getCustomers(): Promise<Customer[]> {
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: bookings } = await supabase.from('bookings').select('profile_id, vehicle_type_id, date')
    
    return (profiles || []).map((p: any) => {
      const pBookings = (bookings || []).filter(b => b.profile_id === p.id)
      const vTypes = [...new Set(pBookings.map(b => b.vehicle_type_id))]
      const lastBooking = pBookings.sort((a, b) => b.date.localeCompare(a.date))[0]?.date || null
      
      return {
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email,
        vehicleTypeIds: vTypes,
        bookingCount: p.manual_booking_count !== null && p.manual_booking_count !== undefined ? p.manual_booking_count : pBookings.length,
        lastBookingDate: p.manual_last_booking_date || lastBooking
      }
    })
  },

  async createCustomer(customer: { name: string; email: string; phone: string }): Promise<Customer> {
    const email = customer.email.toLowerCase();
    
    // Check if exists
    const { data: existingEmail } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (existingEmail) {
      throw new Error('A customer with this email already exists.');
    }
    
    const { data: existingPhone } = await supabase.from('profiles').select('*').eq('phone', customer.phone).single();
    if (existingPhone) {
      throw new Error('A customer with this phone number already exists.');
    }

    const { data, error } = await supabase.from('profiles').insert({
      name: customer.name,
      email,
      phone: customer.phone
    }).select().single();
    
    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      vehicleTypeIds: [],
      bookingCount: 0,
      lastBookingDate: null
    };
  },

  async updateCustomer(id: string, customer: { name: string; email: string; phone: string; manualBookingCount?: number | null; manualLastBookingDate?: string | null }): Promise<void> {
    const email = customer.email.toLowerCase();
    
    // Check if exists
    const { data: existingEmail } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (existingEmail && existingEmail.id !== id) {
      throw new Error('A customer with this email already exists.');
    }
    
    if (customer.phone && customer.phone.trim() !== '') {
      const { data: existingPhone } = await supabase.from('profiles').select('id').eq('phone', customer.phone.trim()).limit(1).maybeSingle();
      if (existingPhone && existingPhone.id !== id) {
        throw new Error('A customer with this phone number already exists.');
      }
    }

    const { error } = await supabase.from('profiles').update({
      name: customer.name,
      email,
      phone: customer.phone,
      manual_booking_count: customer.manualBookingCount,
      manual_last_booking_date: customer.manualLastBookingDate
    }).eq('id', id);

    if (error) throw new Error(error.message);
  },

  async login(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  async customerSignup(customer: { name: string; email: string; phone: string; password: string }): Promise<void> {
    const email = customer.email.toLowerCase();
    
    // Check if customer exists in profiles
    const { data: existingEmail } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (existingEmail) {
      throw new Error('A customer with this email already exists.');
    }

    const { error: signUpError } = await supabase.auth.signUp({ email, password: customer.password });
    if (signUpError) throw new Error(signUpError.message);

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      name: customer.name,
      email,
      phone: customer.phone
    });
    
    if (profileError) throw new Error(profileError.message);
  },

  async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw new Error(error.message)
  },

  async getCurrentUser(user: any): Promise<{ name: string; email: string; role: 'admin' | 'customer'; profileId?: string }> {
    const email = user.email?.toLowerCase() || '';
    const { data } = await supabase.from('profiles').select('id, name').eq('email', email).limit(1).maybeSingle();
    
    if (data) {
      return { name: data.name, email, role: 'customer', profileId: data.id };
    }

    // Auto-create customer profile if they signed in via Google
    if (user.app_metadata?.provider === 'google') {
      const name = user.user_metadata?.full_name || email.split('@')[0];
      // Generate a dummy phone if required, or let it be if not strictly checked
      const dummyPhone = `No Phone Provided`;
      const { data: newProfile, error } = await supabase.from('profiles').insert({
        name,
        email,
        phone: dummyPhone // prompt them later to update
      }).select('id').single();

      if (!error && newProfile) {
        return { name, email, role: 'customer', profileId: newProfile.id };
      } else if (error) {
        console.error("Failed to auto-create Google customer profile", error)
      }
    }

    return { name: 'Admin', email, role: 'admin' };
  },

  getSubscriptionPlans(): SubscriptionPlan[] {
    return seed.subscriptionPlans
  },

  async getSubscription(): Promise<UserSubscription> {
    // In a real app we'd fetch this for the logged in user.
    // For this prototype, we'll return a default free tier for the UI since the UI doesn't have customer auth yet.
    return { tier: 'free', bookingsUsed: 0, bookingsLimit: 3, renewsAt: toISODate(new Date()) }
  },

  async updateSubscription(tier: 'free' | 'standard' | 'premium'): Promise<UserSubscription> {
    const plan = seed.subscriptionPlans.find((p) => p.tier === tier)!
    return { tier, bookingsUsed: 0, bookingsLimit: plan.bookingsPerMonth, renewsAt: toISODate(new Date()) }
  },

  async getSavedVehicles(profileId: string): Promise<any[]> {
    const { data, error } = await supabase.from('vehicles').select('*').eq('profile_id', profileId).order('created_at', { ascending: false })
    if (error) {
      console.warn("DB saved vehicles read failed:", error.message)
      throw error
    }
    return (data || []).map(v => ({
      id: v.id,
      profileId: v.profile_id,
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color || '',
      plateNumber: v.plate_number || '',
      details: `${v.make} ${v.model} ${v.year}${v.plate_number ? ' - ' + v.plate_number : ''}`
    }))
  },

  async saveVehicle(v: { id?: string; profileId: string; make: string; model: string; year: number; color?: string; plateNumber?: string }): Promise<any> {
    const payload = {
      profile_id: v.profileId,
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color || null,
      plate_number: v.plateNumber || null
    }
    let res
    if (v.id) {
      res = await supabase.from('vehicles').update(payload).eq('id', v.id).select().single()
    } else {
      res = await supabase.from('vehicles').insert(payload).select().single()
    }
    if (res.error) throw new Error(res.error.message)
    return {
      id: res.data.id,
      profileId: res.data.profile_id,
      make: res.data.make,
      model: res.data.model,
      year: res.data.year,
      color: res.data.color || '',
      plateNumber: res.data.plate_number || '',
      details: `${res.data.make} ${res.data.model} ${res.data.year}${res.data.plate_number ? ' - ' + res.data.plate_number : ''}`
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },

  async getVehicleModels(makeId: string): Promise<string[]> {
    const { data, error } = await supabase.from('vehicle_models').select('name').eq('make_id', makeId).eq('active', true)
    if (error || !data || data.length === 0) {
      const makeName = makeId.startsWith('vt-') ? makeId.substring(3).toLowerCase() : makeId.toLowerCase()
      const key = Object.keys(vehicleMakes).find(k => k.toLowerCase() === makeName.replace(/-/g, ' '))
      return key ? (vehicleMakes as any)[key] : []
    }
    return data.map(d => d.name)
  },

  async getNotifications(profileId: string): Promise<any[]> {
    const { data, error } = await supabase.from('notifications').select('*').eq('profile_id', profileId).order('created_at', { ascending: false })
    if (error) {
      console.warn("DB notifications read failed:", error.message)
      throw error
    }
    return data || []
  },

  async createNotification(profileId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info'): Promise<any> {
    const payload = {
      profile_id: profileId,
      title,
      message,
      type
    }
    const { data, error } = await supabase.from('notifications').insert(payload).select().single()
    if (error) {
      console.warn("DB notification insert failed:", error.message)
      throw error
    }
    return data
  },

  async markNotificationsRead(profileId: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('profile_id', profileId)
    if (error) throw error
  },
}
