import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, SparklesIcon, ZapIcon, CrownIcon } from 'lucide-react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Button } from '../components/ui/Button'
import { formatPrice } from '../utils/format'
import type { SubscriptionTier } from '../types'
import { toast } from 'sonner'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <SparklesIcon size={24} />,
  standard: <ZapIcon size={24} />,
  premium: <CrownIcon size={24} />,
}

const tierColors: Record<SubscriptionTier, string> = {
  free: 'from-navy-600 to-navy-700',
  standard: 'from-accent-500 to-accent-600',
  premium: 'from-purple-600 to-indigo-700',
}

export function Pricing() {
  const { plans, current, upgrade, loading } = useSubscription()
  const [upgrading, setUpgrading] = useState<SubscriptionTier | null>(null)

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === current.tier) return
    setUpgrading(tier)
    try {
      await upgrade(tier)
      toast.success(`Upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan!`)
    } catch {
      toast.error('Upgrade failed. Please try again.')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Pricing</span>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Choose Your Plan</h1>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            Booking services is free and unlimited for everyone. Choose a premium plan to unlock value-added maintenance benefits.
          </p>
        </motion.div>

        {/* Current plan indicator */}
        {!loading && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-surface border border-line px-5 py-2.5 shadow-card">
              <span className="text-sm text-muted">Current plan:</span>
              <span className="text-sm font-semibold text-accent-500 capitalize">{current.tier}</span>
              <span className="text-line-strong">·</span>
              <span className="text-sm text-muted">Unlimited Free Bookings</span>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isCurrent = plan.tier === current.tier
            return (
              <motion.div key={plan.tier} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`relative h-full flex flex-col rounded-2xl border ${plan.highlighted ? 'border-accent-500 shadow-lift ring-2 ring-accent-500/20' : 'border-line shadow-card'} bg-surface overflow-hidden transition-all duration-300 hover:-translate-y-1`}>
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 bg-accent-500 py-1.5 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${tierColors[plan.tier]} p-6 ${plan.highlighted ? 'pt-10' : ''} text-white`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        {tierIcons[plan.tier]}
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : formatPrice(plan.price)}</span>
                      {plan.price > 0 && <span className="text-white/70">/month</span>}
                    </div>
                    <p className="mt-2 text-sm text-white/80">
                      Unlimited service bookings
                    </p>
                  </div>
                  <div className="flex-1 p-6">
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                          <CheckIcon size={16} className="mt-0.5 shrink-0 text-success-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 pt-0">
                    <Button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={isCurrent || upgrading !== null}
                      variant={plan.highlighted ? 'primary' : 'secondary'}
                      className="w-full justify-center"
                    >
                      {isCurrent ? 'Current Plan' : upgrading === plan.tier ? 'Upgrading…' : plan.price === 0 ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-ink text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is booking a service free?', a: 'Yes! Booking a service request is free and unlimited for all users. You can book general servicing or report problems without needing any subscription.' },
              { q: 'What do I get with standard or premium plans?', a: 'Paid subscription plans provide extra maintenance and service-discount benefits such as priority scheduling, alerts, up to 10% parts discounts, digital health reports, and roadside assistance.' },
              { q: 'Can I cancel or downgrade my subscription?', a: 'Yes, you can upgrade, downgrade, or cancel your subscription tier at any time directly from your profile settings.' },
              { q: 'What payment methods do you accept?', a: 'We accept bank transfers, credit/debit card payments, and mobile money. Invoices are provided for every completed service.' },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="text-sm font-semibold text-ink">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
