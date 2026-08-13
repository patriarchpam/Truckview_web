import React from 'react'
import { motion } from 'framer-motion'
import { TargetIcon, EyeIcon, WrenchIcon, UsersIcon } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { ButtonLink } from '../components/ui/Button'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export function About() {
  const { content, loading } = useStore()
  if (loading || !content) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Hero */}
        <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">About Us</span>
            <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{content.about.heading}</h1>
            <p className="mt-6 text-ink-soft leading-relaxed">{content.about.intro}</p>
            <div className="mt-8">
              <ButtonLink to="/book">Book a Service</ButtonLink>
            </div>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2, duration: 0.6 }}>
            <div className="rounded-2xl overflow-hidden shadow-lift">
              <img src={content.about.image} alt="Truck-View Workshop" className="w-full h-80 object-cover" />
            </div>
          </motion.div>
        </div>

        {/* Mission / Vision */}
        <div className="grid gap-8 sm:grid-cols-2 mb-20">
          {[
            { icon: TargetIcon, title: 'Our Mission', text: content.about.mission },
            { icon: EyeIcon, title: 'Our Vision', text: content.about.vision },
          ].map((item, i) => (
            <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-line bg-surface p-8 shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 mb-4">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-ink">Why Choose Truck-View?</h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: WrenchIcon, title: 'Certified Mechanics', desc: 'Our team is factory-trained and certified across all vehicle categories.' },
            { icon: UsersIcon, title: 'Customer-First', desc: 'We explain every job clearly and never push unnecessary work.' },
            { icon: TargetIcon, title: 'Transparent Pricing', desc: 'No hidden fees. You see the price before you commit.' },
            { icon: EyeIcon, title: 'Digital Reports', desc: 'Photographed inspection reports delivered to your phone.' },
          ].map((v, i) => (
            <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                <v.icon size={22} />
              </div>
              <h3 className="text-sm font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-xs text-muted">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
