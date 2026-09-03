import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

import { SEO } from '../components/SEO'

export function Services() {
  const { services, loading } = useStore()
  const active = services.filter((s) => s.active)

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <>
      <SEO 
        title="Our Services" 
        description="Explore our full range of professional auto repair and vehicle maintenance services in Abuja."
        canonicalUrl="https://truckview.com.ng/services"
      />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Our Services</span>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Professional Vehicle Services</h1>
          <p className="mt-3 text-muted max-w-2xl mx-auto">From routine oil changes to full diagnostics, our certified mechanics have you covered.</p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((s, i) => (
            <motion.div key={s.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="group h-full flex flex-col rounded-2xl border border-line bg-surface overflow-hidden shadow-card hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-52 overflow-hidden">
                  <img src={s.image} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted flex-1">{s.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-ink-soft">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent-500 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-line">
                    <div />
                    <Link to="/book" state={{ serviceId: s.id }}
                      className="text-sm font-medium text-accent-500 hover:text-accent-600 flex items-center gap-1 transition-colors"
                    >
                      Book <ArrowRightIcon size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
