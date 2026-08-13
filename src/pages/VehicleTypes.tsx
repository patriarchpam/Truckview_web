import { motion } from 'framer-motion'
import { useStore } from '../contexts/StoreContext'
import { ButtonLink } from '../components/ui/Button'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export function VehicleTypes() {
  const { vehicleTypes, services, loading } = useStore()
  const active = vehicleTypes.filter((v) => v.active)

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Vehicle Types</span>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">We Service Every Vehicle</h1>
          <p className="mt-3 text-muted max-w-2xl mx-auto">From personal cars to commercial fleets, our mechanics are trained to handle them all.</p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((vt, i) => {
            const count = services.filter((s) => s.active && s.vehicleTypeIds.includes(vt.id)).length
            return (
              <motion.div key={vt.id} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="group rounded-2xl border border-line bg-surface overflow-hidden shadow-card hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-56 overflow-hidden">
                    <img src={vt.image} alt={vt.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{vt.name}</h3>
                      <span className="text-sm text-white/80">{count} services available</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted">{vt.description}</p>
                    <div className="mt-4">
                      <ButtonLink to="/book" state={{ vehicleTypeId: vt.id }} size="sm" variant="secondary" className="w-full justify-center">
                        Book for {vt.name}
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
