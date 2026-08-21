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
    bookingsPerMonth: null,
    features: [
      'Unlimited service bookings',
      'Saved vehicles in garage',
      'Real-time service tracking',
      'Complete service history',
      'Invoices & receipts history',
    ],
  },
  {
    tier: 'standard',
    name: 'Standard',
    price: 15000,
    bookingsPerMonth: null,
    highlighted: true,
    features: [
      'All Free features included',
      'Priority scheduling preference',
      'Routine maintenance reminders',
      '5% discount on parts and labor',
      'Standard customer support',
    ],
  },
  {
    tier: 'premium',
    name: 'TruckView Plus',
    price: 35000,
    bookingsPerMonth: null,
    features: [
      'All Standard features included',
      'Guaranteed priority booking slots',
      '10% discount on parts and labor',
      'Detailed digital health reports',
      '24/7 priority roadside assistance',
      'Dedicated service advisor',
    ],
  },
]

/* ----------------------------------------------------------------- */
/*  Vehicle types                                                     */
/* ----------------------------------------------------------------- */

import { vehicleMakes } from './vehicleMakes'

export const vehicleTypes: VehicleType[] = Object.keys(vehicleMakes).map((make) => ({
  id: `vt-${make.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  slug: make.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  name: make,
  description: `Professional servicing and repairs for ${make} vehicles.`,
  image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=600&h=400&fit=crop', // generic placeholder
  active: true,
}))

const allVehicles = vehicleTypes.map((v) => v.id)

/* ----------------------------------------------------------------- */
/*  Services                                                          */
/* ----------------------------------------------------------------- */

export const services: Service[] = [
  {
    id: 'svc-maintenance',
    slug: 'general-maintenance',
    name: 'General Maintenance',
    description: 'Routine car servicing to keep your vehicle running smoothly and prevent major breakdowns.',
    details: [
      'Oil Change & Oil Filter Replacement',
      'Routine Car Servicing',
      'Vehicle Inspection',
      'Preventive Maintenance',
      'Fluid Top-Up & Replacement',
      'Air Filter Replacement',
      'Cabin Filter Replacement',
      'Spark Plug Replacement',
      'Timing Belt Replacement',
      'Fuel Filter Replacement'
    ],
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 35000,
    duration: 120,
    active: true,
  },
  {
    id: 'svc-engine',
    slug: 'engine-services',
    name: 'Engine Services',
    description: 'Comprehensive engine diagnostics, repair, and overhauls for optimal performance.',
    details: [
      'Engine Diagnostics',
      'Engine Repair',
      'Engine Overhaul',
      'Engine Rebuild',
      'Engine Replacement',
      'Engine Tuning',
      'Overheating Diagnosis & Repair',
      'Radiator Repair/Replacement',
      'Water Pump Replacement',
      'Cooling System Repair',
      'Fuel Injector Cleaning/Repair',
      'Engine Mount Replacement'
    ],
    image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 85000,
    duration: 240,
    active: true,
  },
  {
    id: 'svc-transmission',
    slug: 'transmission',
    name: 'Transmission',
    description: 'Expert care for automatic and manual transmissions, clutches, and gearboxes.',
    details: [
      'Transmission Diagnostics',
      'Automatic Transmission Repair',
      'Manual Transmission Repair',
      'Transmission Fluid Change',
      'Gearbox Repair/Replacement',
      'Clutch Replacement',
      'Clutch Repair',
      'Gear Shifting Problems',
      'Differential Repair'
    ],
    image: 'https://images.unsplash.com/photo-1605273398453-39f50f22ff60?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 120000,
    duration: 300,
    active: true,
  },
  {
    id: 'svc-brakes',
    slug: 'brakes',
    name: 'Brakes',
    description: 'Complete brake system inspections, pad replacements, and ABS diagnostics.',
    details: [
      'Brake Inspection',
      'Brake Pad Replacement',
      'Brake Disc/Rotor Replacement',
      'Brake Shoe Replacement',
      'Brake Fluid Replacement',
      'ABS Diagnostics & Repair',
      'Brake Caliper Repair',
      'Handbrake Repair'
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 45000,
    duration: 90,
    active: true,
  },
  {
    id: 'svc-suspension',
    slug: 'suspension-steering',
    name: 'Suspension & Steering',
    description: 'Specialized repairs for shocks, struts, control arms, and steering systems.',
    details: [
      'Suspension Inspection',
      'Shock Absorber Replacement',
      'Strut Replacement',
      'Ball Joint Replacement',
      'Control Arm Replacement',
      'Bushing Replacement',
      'Tie Rod Replacement',
      'Steering Rack Repair',
      'Power Steering Repair',
      'Wheel Alignment',
      'Wheel Balancing'
    ],
    image: 'https://images.unsplash.com/photo-1579824225381-8b2b95b5c92c?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 65000,
    duration: 180,
    active: true,
  },
  {
    id: 'svc-electrical',
    slug: 'electrical-diagnostics',
    name: 'Electrical & Diagnostics',
    description: 'Computer OBD scans, wiring repairs, and complete electrical fault diagnosis.',
    details: [
      'Computer Diagnostics / OBD Scan',
      'Electrical Fault Diagnosis',
      'Battery Testing & Replacement',
      'Alternator Repair/Replacement',
      'Starter Motor Repair',
      'Wiring Repair',
      'Fuse & Relay Replacement',
      'Dashboard Warning Light Diagnosis',
      'Sensor Replacement',
      'ECU Diagnostics',
      'Car Key/Immobilizer Diagnostics'
    ],
    image: 'https://images.unsplash.com/photo-1563297120-7f2df2f84cb7?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 25000,
    duration: 60,
    active: true,
  },
  {
    id: 'svc-ac',
    slug: 'ac-cooling',
    name: 'AC & Cooling',
    description: 'Comprehensive A/C gas recharge, compressor repair, and cooling system maintenance.',
    details: [
      'AC Diagnosis',
      'AC Gas Recharge',
      'AC Compressor Repair/Replacement',
      'AC Fan & Electrical Diagnosis',
      'Cooling System Repair'
    ],
    image: 'https://images.unsplash.com/photo-1620984920216-9bba7a5de0c1?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 30000,
    duration: 120,
    active: true,
  },
  {
    id: 'svc-tyres',
    slug: 'tyres-wheels',
    name: 'Tyres & Wheels',
    description: 'Tyre replacement, balancing, and alignment for a safe driving experience.',
    details: [
      'Tyre Replacement & Rotation',
      'Flat Tyre Repair',
      'Wheel Balancing & Alignment',
      'Rim Repair',
      'Wheel Bearing Replacement'
    ],
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 20000,
    duration: 60,
    active: true,
  },
  {
    id: 'svc-exhaust',
    slug: 'exhaust-emissions',
    name: 'Exhaust & Emissions',
    description: 'Muffler replacement, exhaust leak repairs, and emission system diagnostics.',
    details: [
      'Exhaust & Muffler Repair/Replacement',
      'Catalytic Converter Inspection',
      'Exhaust Leak Repair',
      'Oxygen Sensor Replacement',
      'Emission System Diagnostics'
    ],
    image: 'https://images.unsplash.com/photo-1502877338535-466e6d60118d?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 40000,
    duration: 90,
    active: true,
  },
  {
    id: 'svc-body',
    slug: 'body-other',
    name: 'Body & Other Services',
    description: 'Panel beating, dent repair, painting, and roadside assistance.',
    details: [
      'Minor Body Repairs & Panel Beating',
      'Dent & Scratch Repair',
      'Car Painting & Headlamp Restoration',
      'Windshield Replacement',
      'Towing & Roadside Assistance'
    ],
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop',
    vehicleTypeIds: allVehicles,
    price: 55000,
    duration: 180,
    active: true,
  }
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
    serviceIds: ['svc-maintenance'],
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
    serviceIds: ['svc-diagnostics'],
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
    serviceIds: ['svc-inspection'],
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
    serviceIds: ['svc-tyres'],
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
    serviceIds: ['svc-inspection'],
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
    serviceIds: ['svc-detailing'],
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
    serviceIds: ['svc-maintenance'],
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
    serviceIds: ['svc-mobile'],
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
