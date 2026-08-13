import { addDays, subDays } from 'date-fns'

import type {
  Availability,
  Booking,
  Service,
  Settings,
  SiteContent,
  SubscriptionPlan,
  VehicleType,
} from '../types'
import { toISODate } from '../utils/format'

const today = new Date()
const day = (offset: number) =>
  toISODate(offset >= 0 ? addDays(today, offset) : subDays(today, -offset))

/* ----------------------------------------------------------------- */
/*  Subscription plans                                                */
/* ----------------------------------------------------------------- */

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    bookingsPerMonth: 3,
    features: [
      'Up to 3 bookings per month',
      'Browse all services',
      'Online booking',
      'Digital service report',
    ],
  },
  {
    tier: 'standard',
    name: 'Standard',
    price: 20000,
    bookingsPerMonth: 10,
    highlighted: true,
    features: [
      'Up to 10 bookings per month',
      'Priority scheduling',
      'Booking history & tracking',
      'SMS appointment reminders',
      'Phone support',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: 50000,
    bookingsPerMonth: null,
    features: [
      'Unlimited bookings',
      'Dedicated mechanic assigned',
      'Roadside assistance included',
      '10% discount on all services',
      '24/7 priority support',
      'Fleet management dashboard',
    ],
  },
]

/* ----------------------------------------------------------------- */
/*  Vehicle types                                                     */
/* ----------------------------------------------------------------- */

export const vehicleTypes: VehicleType[] = [
  {
    id: 'vt-car',
    slug: 'cars',
    name: 'Cars',
    description:
      'Sedans, hatchbacks and saloons. Everyday servicing, diagnostics and detailing for personal cars.',
    image:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=600&h=400&fit=crop',
    active: true,
  },
  {
    id: 'vt-suv',
    slug: 'suvs',
    name: 'SUVs',
    description:
      'Family and off-road SUVs. Heavier suspension, brakes and drivetrain work handled by specialists.',
    image:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop',
    active: true,
  },
  {
    id: 'vt-van',
    slug: 'vans',
    name: 'Vans',
    description:
      'Compact and passenger vans. Keep the vehicles your business depends on moving every day.',
    image:
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop',
    active: true,
  },
  {
    id: 'vt-truck',
    slug: 'trucks',
    name: 'Trucks',
    description:
      'Pickups and light trucks. Servicing, inspections and tyre work sized for heavier vehicles.',
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop',
    active: true,
  },
  {
    id: 'vt-bus',
    slug: 'buses',
    name: 'Buses',
    description:
      'Minibuses and shuttles. Safety inspections and scheduled maintenance for passenger transport.',
    image:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
    active: true,
  },
  {
    id: 'vt-commercial',
    slug: 'commercial-vehicles',
    name: 'Commercial Vehicles',
    description:
      'Utility and work vehicles. Flexible scheduling so your operation keeps running while we service.',
    image:
      'https://images.unsplash.com/photo-1586191582056-88e36bbaef66?w=600&h=400&fit=crop',
    active: true,
  },
]

const allVehicles = vehicleTypes.map((v) => v.id)

/* ----------------------------------------------------------------- */
/*  Services                                                          */
/* ----------------------------------------------------------------- */

export const services: Service[] = [
  {
    id: 'svc-maintenance',
    slug: 'routine-maintenance',
    name: 'Routine Maintenance',
    description:
      'Scheduled servicing — oil and filters, fluids, belts and a full health check by certified technicians.',
    details: [
      'Engine oil and filter replacement',
      'Fluid top-up and level check',
      'Belts, hoses and battery check',
      'Digital service report',
    ],
    image:
      'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 45000,
    duration: 120,
    active: true,
  },
  {
    id: 'svc-inspection',
    slug: 'vehicle-inspection',
    name: 'Vehicle Inspection',
    description:
      'A 60-point condition and safety inspection with a documented report — ideal before a purchase or renewal.',
    details: [
      '60-point safety and condition check',
      'Brake, tyre and suspension review',
      'Photographed digital report',
      'Recommended next steps',
    ],
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 25000,
    duration: 60,
    active: true,
  },
  {
    id: 'svc-diagnostics',
    slug: 'engine-diagnostics',
    name: 'Engine Diagnostics',
    description:
      'Computer diagnostics to trace warning lights and performance faults, with a clear explanation of findings.',
    details: [
      'Full OBD fault code scan',
      'Live sensor data review',
      'Fault explanation in plain language',
      'Repair quote if required',
    ],
    image:
      'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&h=400&fit=crop',
    vehicleTypeIds: ['vt-car', 'vt-suv', 'vt-van', 'vt-truck', 'vt-commercial'],
    price: 20000,
    duration: 45,
    active: true,
  },
  {
    id: 'svc-tyres',
    slug: 'tyres-and-brakes',
    name: 'Tyres & Brakes',
    description:
      'Tyre fitting, balancing, alignment and brake replacement sized correctly for your vehicle class.',
    details: [
      'Tyre fitting and balancing',
      'Wheel alignment',
      'Brake pad and disc replacement',
      'Load-rated options for heavy vehicles',
    ],
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: null,
    duration: 90,
    active: true,
  },
  {
    id: 'svc-detailing',
    slug: 'detailing-and-care',
    name: 'Detailing & Care',
    description:
      'Interior and exterior detailing — deep clean, paint correction and protective finish.',
    details: [
      'Interior deep clean',
      'Exterior wash and decontamination',
      'Machine polish and paint correction',
      'Protective sealant',
    ],
    image:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop',
    vehicleTypeIds: ['vt-car', 'vt-suv', 'vt-van', 'vt-truck'],
    price: 35000,
    duration: 180,
    active: true,
  },
  {
    id: 'svc-mobile',
    slug: 'mobile-assistance',
    name: 'Mobile Assistance',
    description:
      'We come to you. On-site battery, tyre and minor fault assistance at your home or workplace.',
    details: [
      'Technician dispatched to your location',
      'Battery jump-start or replacement',
      'Tyre change and puncture repair',
      'On-site minor fault fixes',
    ],
    image:
      'https://images.unsplash.com/photo-1530685932526-e58e0b5e3840?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: null,
    duration: 60,
    active: true,
  },
]

/* ----------------------------------------------------------------- */
/*  Bookings                                                          */
/* ----------------------------------------------------------------- */

export const bookings: Booking[] = [
  {
    id: 'bk-1',
    reference: 'TV-2026-0001',
    customer: {
      name: 'Adaeze Okafor',
      phone: '0803 411 8820',
      email: 'adaeze.okafor@example.com',
    },
    vehicleTypeId: 'vt-suv',
    vehicleDetails: 'Toyota Highlander 2019 — Silver',
    serviceId: 'svc-maintenance',
    date: day(0),
    time: '10:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: 'Slight rattling noise from the front right wheel.',
    status: 'confirmed',
    createdAt: day(-4),
  },
  {
    id: 'bk-2',
    reference: 'TV-2026-0002',
    customer: {
      name: 'Michael Adeyemi',
      phone: '0812 908 4471',
      email: 'm.adeyemi@example.com',
    },
    vehicleTypeId: 'vt-car',
    vehicleDetails: 'Honda Accord 2021 — Black',
    serviceId: 'svc-diagnostics',
    date: day(0),
    time: '14:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: 'Check engine light came on last week.',
    status: 'in-progress',
    createdAt: day(-2),
  },
  {
    id: 'bk-3',
    reference: 'TV-2026-0003',
    customer: {
      name: 'Grace Nwosu',
      phone: '0705 220 7719',
      email: 'grace.nwosu@example.com',
    },
    vehicleTypeId: 'vt-van',
    vehicleDetails: 'Ford Transit Connect 2020 — Blue',
    serviceId: 'svc-inspection',
    date: day(1),
    time: '08:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: '',
    status: 'pending',
    createdAt: day(-1),
  },
  {
    id: 'bk-4',
    reference: 'TV-2026-0004',
    customer: {
      name: 'Samuel Eze',
      phone: '0906 118 3320',
      email: 'samuel.eze@example.com',
    },
    vehicleTypeId: 'vt-truck',
    vehicleDetails: 'Ford F-150 2022 — White',
    serviceId: 'svc-tyres',
    date: day(2),
    time: '12:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: 'Needs four new tyres, load rated.',
    status: 'pending',
    createdAt: day(-1),
  },
  {
    id: 'bk-5',
    reference: 'TV-2026-0005',
    customer: {
      name: 'Fatima Bello',
      phone: '0814 550 2214',
      email: 'fatima.bello@example.com',
    },
    vehicleTypeId: 'vt-bus',
    vehicleDetails: 'Mercedes Sprinter 2018 — 14 seater',
    serviceId: 'svc-inspection',
    date: day(3),
    time: '10:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: 'Annual passenger safety inspection.',
    status: 'confirmed',
    createdAt: day(-3),
  },
  {
    id: 'bk-6',
    reference: 'TV-2026-0006',
    customer: {
      name: 'Adaeze Okafor',
      phone: '0803 411 8820',
      email: 'adaeze.okafor@example.com',
    },
    vehicleTypeId: 'vt-suv',
    vehicleDetails: 'Toyota Highlander 2019 — Silver',
    serviceId: 'svc-detailing',
    date: day(-14),
    time: '08:00',
    location: 'Truck-View Workshop, Karu District, Abuja',
    notes: '',
    status: 'completed',
    createdAt: day(-20),
  },
  {
    id: 'bk-7',
    reference: 'TV-2026-0007',
    customer: {
      name: 'Ibrahim Musa',
      phone: '0701 663 9048',
      email: 'ibrahim.musa@example.com',
    },
    vehicleTypeId: 'vt-commercial',
    vehicleDetails: 'Isuzu NPR box body 2017',
    serviceId: 'svc-maintenance',
    date: day(-7),
    time: '16:00',
    location: 'Customer site — Karu',
    notes: '',
    status: 'cancelled',
    createdAt: day(-12),
  },
  {
    id: 'bk-8',
    reference: 'TV-2026-0008',
    customer: {
      name: 'Chidi Anyanwu',
      phone: '0802 774 1190',
      email: 'chidi.a@example.com',
    },
    vehicleTypeId: 'vt-car',
    vehicleDetails: 'Kia Rio 2020 — Red',
    serviceId: 'svc-mobile',
    date: day(1),
    time: '16:00',
    location: 'Deck One Apartments, Karu District, Abuja',
    notes: 'Battery keeps dying overnight.',
    status: 'confirmed',
    createdAt: day(-1),
  },
]

/* ----------------------------------------------------------------- */
/*  Availability                                                      */
/* ----------------------------------------------------------------- */

export const availability: Availability = {
  businessHours: {
    monday: { open: true, start: '08:00', end: '17:00' },
    tuesday: { open: true, start: '08:00', end: '17:00' },
    wednesday: { open: true, start: '08:00', end: '17:00' },
    thursday: { open: true, start: '08:00', end: '17:00' },
    friday: { open: true, start: '08:00', end: '17:00' },
    saturday: { open: true, start: '09:00', end: '14:00' },
    sunday: { open: false, start: '09:00', end: '14:00' },
  },
  slotTimes: ['08:00', '10:00', '12:00', '14:00', '16:00'],
  blockedDates: [day(5)],
  blockedSlots: [{ date: day(2), time: '08:00' }],
  maxPerSlot: 1,
  noticeHours: 4,
}

/* ----------------------------------------------------------------- */
/*  Site content                                                      */
/* ----------------------------------------------------------------- */

export const siteContent: SiteContent = {
  hero: {
    eyebrow: 'Professional Mechanic Workshop',
    heading: 'Your Vehicle. Our Expertise. Simplified.',
    description:
      'Truck-View Global Ent. brings every vehicle service into one place. Cars, SUVs, vans, trucks, buses and commercial vehicles — pick a service, choose a time that works, and our certified mechanics handle the rest.',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&h=600&fit=crop',
    featuredServiceIds: ['svc-maintenance', 'svc-inspection', 'svc-diagnostics'],
  },
  about: {
    heading: 'Built for every vehicle on your street',
    intro:
      'Truck-View Global Ent. started with a simple frustration: booking a vehicle service meant phone calls, guesswork and waiting. We built a platform where any vehicle owner — private or commercial — can find the right service and reserve a real appointment slot in under two minutes.',
    mission:
      'Make quality vehicle servicing easy to discover, easy to book and easy to trust, for every category of vehicle in Abuja and beyond.',
    vision:
      'To become the platform vehicle owners across Nigeria open first, whether they drive one car or manage a mixed fleet.',
    image:
      'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&h=500&fit=crop',
  },
  contact: {
    phone: '0803 679 8700',
    email: 'truckviewent@gmail.com',
    address: 'Behind Games Village, Deck One Apartments, Karu District, Abuja',
    hours: 'Mon – Fri, 8:00 AM – 5:00 PM · Sat, 9:00 AM – 2:00 PM',
    social: [
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'WhatsApp', url: 'https://wa.me/2348036798700' },
      { label: 'Facebook', url: 'https://facebook.com' },
    ],
  },
  testimonials: [
    {
      id: 'ts-1',
      name: 'Adaeze Okafor',
      role: 'SUV owner',
      quote:
        'I booked a full service on my phone during a lunch break and got a confirmation the same hour. No calls, no back and forth.',
      rating: 5,
    },
    {
      id: 'ts-2',
      name: 'Ibrahim Musa',
      role: 'Runs three delivery vans',
      quote:
        'Being able to stagger my vans across different slots means I am never without a vehicle on the road.',
      rating: 5,
    },
    {
      id: 'ts-3',
      name: 'Grace Nwosu',
      role: 'Minibus operator',
      quote:
        'The inspection report came back photographed and explained properly. That kind of clarity is rare.',
      rating: 4,
    },
  ],
}

/* ----------------------------------------------------------------- */
/*  Settings                                                          */
/* ----------------------------------------------------------------- */

export const settings: Settings = {
  business: {
    name: 'Truck-View Global Ent.',
    phone: '0803 679 8700',
    email: 'truckviewent@gmail.com',
    address: 'Behind Games Village, Deck One Apartments, Karu District, Abuja',
  },
  booking: {
    noticeHours: 4,
    maxPerSlot: 1,
    cancellationPolicy:
      'Bookings can be cancelled or rescheduled free of charge up to 12 hours before the appointment time.',
  },
  account: {
    name: 'Admin',
    email: 'truckviewent@gmail.com',
  },
}
