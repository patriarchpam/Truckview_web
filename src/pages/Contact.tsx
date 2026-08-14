import { useState } from 'react'
import { motion } from 'framer-motion'
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, SendIcon } from 'lucide-react'
import { useStore } from '../contexts/StoreContext'
import { Button } from '../components/ui/Button'
import { Field, Input, Textarea } from '../components/ui/Field'
import { toast } from 'sonner'
import { SEO } from '../components/SEO'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export function Contact() {
  const { content, loading } = useStore()
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Message sent! We'll get back to you shortly.")
    setSending(false)
    ;(e.target as HTMLFormElement).reset()
  }

  if (loading || !content) return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  const info = [
    { icon: MapPinIcon, label: 'Address', value: content.contact.address },
    { icon: PhoneIcon, label: 'Phone', value: content.contact.phone, href: `tel:${content.contact.phone.replace(/\s/g, '')}` },
    { icon: MailIcon, label: 'Email', value: content.contact.email, href: `mailto:${content.contact.email}` },
    { icon: ClockIcon, label: 'Hours', value: content.contact.hours },
  ]

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with Truck-View Global Ent. for all your car repair and maintenance needs in Abuja."
      />
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-500">Contact Us</span>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Get in Touch</h1>
          <p className="mt-3 text-muted max-w-2xl mx-auto">Have a question or want to discuss a service? Reach out — we're happy to help.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1, duration: 0.5 }} className="space-y-6">
            {info.map((item) => (
              <div key={item.label} className="flex items-start gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600 shrink-0 dark:bg-accent-900/30 dark:text-accent-400">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.label}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-accent-500 hover:text-accent-600 transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm text-muted">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a href="https://wa.me/2348036798700" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-green-600 p-5 text-white hover:bg-green-700 transition-colors shadow-card"
            >
              <svg className="h-6 w-6 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.685-1.378A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.382-1.572l-.376-.227-2.785.82.747-2.73-.25-.397A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              <div>
                <div className="font-semibold">Chat on WhatsApp</div>
                <div className="text-sm text-white/80">Quick response guaranteed</div>
              </div>
            </a>
          </motion.div>

          {/* Form */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2, duration: 0.5 }}>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 lg:p-8 shadow-card space-y-5">
              <h2 className="text-lg font-semibold text-ink">Send us a message</h2>
              <Field label="Name" required htmlFor="contact-name">
                <Input id="contact-name" required placeholder="Your name" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" required htmlFor="contact-email">
                  <Input id="contact-email" type="email" required placeholder="you@example.com" />
                </Field>
                <Field label="Phone" htmlFor="contact-phone">
                  <Input id="contact-phone" type="tel" placeholder="0803 000 0000" />
                </Field>
              </div>
              <Field label="Message" required htmlFor="contact-message">
                <Textarea id="contact-message" rows={5} required placeholder="Tell us about your vehicle or service needs…" />
              </Field>
              <Button type="submit" disabled={sending} className="w-full justify-center">
                <SendIcon size={16} /> {sending ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Map */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3, duration: 0.5 }} className="mt-12 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <iframe
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Deck+One+Apartments,+Karu,+Abuja&output=embed"
            title="Location Map"
          ></iframe>
        </motion.div>
      </div>
    </div>
    </>
  )
}
