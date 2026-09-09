import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, StarIcon, WrenchIcon, ShieldCheckIcon, ClockIcon, TruckIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { ButtonLink } from '../components/ui/Button'
import { formatDuration } from '../utils/format'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

import { SEO } from '../components/SEO'

export function Home() {
  const { content, services, vehicleTypes, loading } = useStore()
  const [selectedSymptom, setSelectedSymptom] = useState({
    id: 'brakes',
    emoji: '🔊',
    label: 'Squeaking Brakes',
    title: 'Brake System Wear',
    desc: 'Likely worn brake friction pads or warped rotors.',
    rec: 'Brake Replacement & Fluid Flush',
    urgency: 'High',
    serviceId: 'svc-3'
  })

  if (loading || !content) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    )
  }

  const featured = services.filter((s) => content.hero.featuredServiceIds.includes(s.id))

  return (
    <>
      <SEO 
        title="Expert Vehicle Repair & Servicing" 
        canonicalUrl="https://truckview.com.ng/"
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0">
          <img src={content.hero.image} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:py-36">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 border border-accent-500/30 px-4 py-1.5 text-xs font-medium text-accent-300 mb-6">
              <SparklesIcon size={14} />
              {content.hero.eyebrow}
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {content.hero.heading}
            </h1>
            <p className="mt-6 text-lg text-navy-300 leading-relaxed max-w-xl">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to="/book" size="lg">
                Book a Service <ArrowRightIcon size={18} />
              </ButtonLink>
              <ButtonLink to="/services" variant="outline" size="lg" className="border-navy-600 text-white hover:bg-navy-800">
                View Services
              </ButtonLink>
            </div>

            {/* Live Dispatch Radar Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 p-3.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex items-center justify-between gap-4 max-w-xl"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-navy-100">
                  <strong className="text-white">Live Abuja Fleet Status:</strong> 14 Mechanics active · Avg response 18m
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold bg-green-500/20 text-green-300 border border-green-400/30 px-2 py-0.5 rounded-full shrink-0">
                Online
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { icon: WrenchIcon, value: '6+', label: 'Service Types' },
              { icon: TruckIcon, value: '6', label: 'Vehicle Categories' },
              { icon: ShieldCheckIcon, value: '100%', label: 'Certified Mechanics' },
              { icon: ClockIcon, value: '< 2 min', label: 'To Book Online' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                  <stat.icon size={22} />
                </div>
                <div className="text-2xl font-bold text-ink">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Symptom Quick-Checker */}
      <section className="py-16 bg-gradient-to-b from-surface-2/60 to-canvas border-b border-line">
        <div className="mx-auto max-w-7xl px-4">
          <div className="bg-surface border border-line rounded-3xl p-6 sm:p-10 shadow-lift relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 text-xs font-bold uppercase tracking-wider mb-3">
                <SparklesIcon size={14} /> Interactive Diagnostic Simulator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">What's wrong with your vehicle?</h2>
              <p className="text-sm text-muted mt-2">Select a symptom below for an instant preliminary diagnosis and repair recommendation.</p>
            </div>

            {/* Symptom Chips */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                { id: 'brakes', emoji: '🔊', label: 'Squeaking Brakes', title: 'Brake System Wear', desc: 'Likely worn brake friction pads or warped rotors.', rec: 'Brake Replacement & Fluid Flush', urgency: 'High', serviceId: 'svc-3' },
                { id: 'engine', emoji: '⚠️', label: 'Check Engine Light', title: 'Ignition / Sensor Warning', desc: 'Fault code triggered in ECU by sensor or misfire.', rec: 'Full Computer Diagnostics', urgency: 'Medium', serviceId: 'svc-2' },
                { id: 'ac', emoji: '💨', label: 'AC Blowing Warm Air', title: 'AC Compressor / Gas Depleted', desc: 'Low refrigerant gas pressure or compressor clutch issue.', rec: 'AC Servicing & Gas Recharge', urgency: 'Low', serviceId: 'svc-4' },
                { id: 'battery', emoji: '🔋', label: 'Slow Engine Crank', title: 'Battery Charge Drop', desc: 'Cell voltage low or alternator charging output reduced.', rec: 'Battery Diagnostics & Swap', urgency: 'Medium', serviceId: 'svc-5' },
                { id: 'oil', emoji: '🛢️', label: 'Dark Oil Fluid Leak', title: 'Engine Oil Seepage', desc: 'Degraded gasket seal or loose sump plug.', rec: 'Full Synthetic Oil Change', urgency: 'High', serviceId: 'svc-1' },
              ].map((sym) => (
                <button
                  key={sym.id}
                  onClick={() => setSelectedSymptom(sym)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${selectedSymptom.id === sym.id ? 'bg-accent-500 text-white border-accent-500 shadow-md scale-105' : 'bg-surface-2 text-ink border-line hover:border-accent-400 hover:bg-surface'}`}
                >
                  <span>{sym.emoji}</span>
                  <span>{sym.label}</span>
                </button>
              ))}
            </div>

            {/* Result Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSymptom.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="mt-8 p-6 bg-surface-2/80 rounded-2xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedSymptom.emoji}</span>
                    <h3 className="text-lg font-bold text-ink">{selectedSymptom.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${selectedSymptom.urgency === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : selectedSymptom.urgency === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {selectedSymptom.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{selectedSymptom.desc}</p>
                  <div className="pt-2 text-xs font-semibold text-ink flex items-center gap-2">
                    <WrenchIcon size={14} className="text-accent-500" />
                    <span>Recommended Service: <strong className="text-accent-600">{selectedSymptom.rec}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <ButtonLink to="/book" state={{ serviceId: selectedSymptom.serviceId }} size="md" className="w-full justify-center">
                    Book This Repair <ArrowRightIcon size={16} />
                  </ButtonLink>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">What We Offer</span>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Featured Services</h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">Professional vehicle servicing by certified mechanics. From routine maintenance to emergency roadside assistance.</p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, i) => (
              <motion.div key={service.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="group rounded-2xl border border-line bg-surface overflow-hidden shadow-card hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img src={service.image} alt={service.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-ink">{service.name}</h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{service.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <ClockIcon size={14} /> {formatDuration(service.duration)}
                      </span>
                      <Link to="/book" state={{ serviceId: service.id }}
                        className="text-sm font-medium text-accent-500 hover:text-accent-600 flex items-center gap-1 transition-colors"
                      >
                        Book now <ArrowRightIcon size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink to="/services" variant="secondary">View All Services</ButtonLink>
          </div>
        </div>
      </section>

      {/* Car Brands */}
      <section className="py-20 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Car Brands</span>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Every Car Brand</h2>
          </motion.div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mt-12">
            {vehicleTypes.filter((v) => v.active).slice(0, 12).map((vt, i) => (
              <motion.div key={vt.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link to="/vehicle-types" className="group block rounded-2xl border border-line bg-surface p-4 text-center hover:shadow-card hover:border-accent-300 transition-all duration-300">
                  <div className="h-24 w-full rounded-xl overflow-hidden mb-3">
                    <img src={vt.image} alt={vt.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{vt.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Testimonials</span>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">What Our Clients Say</h2>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {content.testimonials.map((t, i) => (
              <motion.div key={t.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-2xl border border-line bg-surface p-6 shadow-card transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <StarIcon key={si} size={16} className={si < t.rating ? 'fill-accent-400 text-accent-400' : 'text-line-strong'} />
                  ))}
                </div>
                <p className="text-sm text-ink-soft leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-600 text-sm font-bold dark:bg-accent-900/30 dark:text-accent-400">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-surface-2/40 border-t border-line">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Flexible Subscriptions</span>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Transparent Fleet Plans</h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">Choose a plan tailored to your fleet size or pay as you go per service.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { name: 'Pay-As-You-Go', price: 'Free', period: '/forever', desc: 'Ideal for single vehicle owners needing on-demand repairs.', features: ['Full Service Catalog Access', 'Instant Mobile Booking', 'Standard 24/7 Support', '3 Free Monthly Quotes'] },
              { name: 'Standard Fleet', price: '₦45,000', period: '/month', desc: 'Best for small businesses managing up to 5 commercial vehicles.', features: ['Priority Mechanic Dispatch', '15% Off All Maintenance', 'Dedicated Support Manager', 'Unlimited Digital Invoices'], popular: true },
              { name: 'Enterprise Fleet', price: '₦120,000', period: '/month', desc: 'Custom fleet management for large transport & logistics fleets.', features: ['Guaranteed 1-hr Emergency Arrival', 'Customized Service Contracts', 'Full Diagnostics & Preventative Audit', 'Custom Payment Billing Terms'] },
            ].map((plan, i) => (
              <motion.div 
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative rounded-2xl p-6 bg-surface border transition-all flex flex-col justify-between ${plan.popular ? 'border-accent-500 shadow-lift ring-2 ring-accent-500/20' : 'border-line shadow-card'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-500 text-white text-[10px] uppercase font-extrabold tracking-wider rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg text-ink">{plan.name}</h3>
                  <p className="text-xs text-muted mt-1 min-h-[36px]">{plan.desc}</p>
                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-ink">{plan.price}</span>
                    <span className="text-xs text-muted font-medium">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-ink-soft mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <CheckCircleIcon size={14} className="text-accent-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ButtonLink to="/pricing" variant={plan.popular ? 'primary' : 'outline'} className="w-full justify-center text-xs py-2.5">
                  View Full Details <ArrowRightIcon size={14} />
                </ButtonLink>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-accent-600 via-accent-500 to-navy-900 py-16 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to get your vehicle serviced?</h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Book your appointment in under 2 minutes. Our certified mechanics are ready to help.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
                <ButtonLink to="/book" size="lg" className="bg-white text-accent-600 hover:bg-gray-100 shadow-xl border-none">
                  <CheckCircleIcon size={18} /> Book Now
                </ButtonLink>
              </motion.div>
              <ButtonLink to="/pricing" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Plans
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
