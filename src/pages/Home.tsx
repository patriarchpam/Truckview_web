import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, StarIcon, WrenchIcon, ShieldCheckIcon, ClockIcon, TruckIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { ButtonLink } from '../components/ui/Button'
import { formatPrice, formatDuration } from '../utils/format'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export function Home() {
  const { content, services, vehicleTypes, loading } = useStore()

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
              <ButtonLink to="/services" variant="secondary" size="lg" className="border-navy-600 text-white hover:bg-navy-800">
                View Services
              </ButtonLink>
            </div>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block rounded-full bg-accent-500 px-3 py-1 text-xs font-medium text-white">
                        {formatPrice(service.price)}
                      </span>
                    </div>
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

      {/* Vehicle Types */}
      <section className="bg-surface-2 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">We Service</span>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Every Vehicle Type</h2>
          </motion.div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {vehicleTypes.filter((v) => v.active).map((vt, i) => (
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
                className="rounded-2xl border border-line bg-surface p-6 shadow-card"
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

      {/* CTA */}
      <section className="bg-gradient-to-r from-accent-600 to-accent-500 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to get your vehicle serviced?</h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Book your appointment in under 2 minutes. Our certified mechanics are ready to help.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink to="/book" size="lg" className="bg-white text-accent-600 hover:bg-gray-100 shadow-lg">
                <CheckCircleIcon size={18} /> Book Now
              </ButtonLink>
              <ButtonLink to="/pricing" size="lg" variant="secondary" className="border-white/30 text-white hover:bg-white/10">
                View Plans
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
