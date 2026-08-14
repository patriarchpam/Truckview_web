import { motion } from 'framer-motion'
import { PhoneIcon, MailIcon, MessageCircleIcon, MapPinIcon } from 'lucide-react'

export function HelpSupport() {
  const faqs = [
    {
      q: "How do I book a service?",
      a: "You can book a service by clicking the 'Book a Service' button in the dashboard or on the homepage. Select your vehicle, choose the required services, pick a date and time, and confirm your booking."
    },
    {
      q: "Can I cancel or reschedule my booking?",
      a: "Yes, you can cancel or reschedule up to 24 hours before your appointment time from your 'My Bookings' page. For urgent cancellations, please contact us directly via phone."
    },
    {
      q: "Do you offer mobile mechanics?",
      a: "Yes, we offer emergency roadside assistance and mobile mechanics for certain types of services. Please call our emergency line for immediate help."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept bank transfers, debit/credit cards, and POS payments at our workshop. Online payments will be available soon."
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-2">Help & Support</h1>
        <p className="text-muted">Get assistance with your account, bookings, and general inquiries.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Cards */}
        <div className="space-y-6">
          <div className="bg-surface border border-line p-6 rounded-2xl shadow-card transition-shadow hover:shadow-lift">
            <div className="h-10 w-10 bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 rounded-xl flex items-center justify-center mb-4">
              <PhoneIcon size={20} />
            </div>
            <h3 className="font-semibold text-ink mb-1">Call Us Directly</h3>
            <p className="text-sm text-muted mb-4">Available Mon-Sat, 8am to 6pm for general inquiries and 24/7 for emergencies.</p>
            <a href="tel:08036798700" className="inline-block px-4 py-2 bg-surface-2 hover:bg-line text-sm font-medium rounded-lg transition-colors text-ink">
              0803 679 8700
            </a>
          </div>

          <div className="bg-surface border border-line p-6 rounded-2xl shadow-card transition-shadow hover:shadow-lift">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
              <MailIcon size={20} />
            </div>
            <h3 className="font-semibold text-ink mb-1">Email Support</h3>
            <p className="text-sm text-muted mb-4">Send us an email and we'll get back to you within 24 hours.</p>
            <a href="mailto:truckviewent@gmail.com" className="inline-block px-4 py-2 bg-surface-2 hover:bg-line text-sm font-medium rounded-lg transition-colors text-ink">
              truckviewent@gmail.com
            </a>
          </div>

          <div className="bg-surface border border-line p-6 rounded-2xl shadow-card transition-shadow hover:shadow-lift">
            <div className="h-10 w-10 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
              <MessageCircleIcon size={20} />
            </div>
            <h3 className="font-semibold text-ink mb-1">WhatsApp Chat</h3>
            <p className="text-sm text-muted mb-4">Chat with our customer service team on WhatsApp for quick responses.</p>
            <a href="https://wa.me/2348036798700" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-surface-2 hover:bg-line text-sm font-medium rounded-lg transition-colors text-ink">
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-card h-fit">
          <h2 className="font-bold text-lg text-ink mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="pb-6 border-b border-line last:border-0 last:pb-0">
                <h4 className="font-medium text-ink mb-2">{faq.q}</h4>
                <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-surface-2 rounded-xl border border-line">
            <h4 className="font-medium text-ink flex items-center gap-2 mb-2">
              <MapPinIcon size={16} className="text-accent-500" /> Our Location
            </h4>
            <p className="text-sm text-muted">
              Behind Games Village,<br />
              Deck One Apartments,<br />
              Karu District, Abuja
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
