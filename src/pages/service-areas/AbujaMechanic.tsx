
import { MapPinIcon, WrenchIcon, ClockIcon, StarIcon, CheckCircleIcon } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { ButtonLink } from '../../components/ui/Button'

export function AbujaMechanic() {
  return (
    <>
      <SEO 
        title="Top Rated Auto Mechanic in Abuja, Nigeria"
        description="Looking for a reliable auto mechanic in Abuja? Truck-View provides professional vehicle repair, diagnostics, and maintenance services in Karu District, Abuja."
        canonicalUrl="https://truckview.com.ng/service-areas/abuja"
        schema={{
          description: 'Professional auto mechanic services in Abuja, Nigeria. Specializing in vehicle repair, maintenance, and diagnostics.',
        }}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-900 pt-24 pb-32 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-1.5 text-sm font-medium text-accent-300 ring-1 ring-accent-500/50 mb-6">
            <MapPinIcon size={16} />
            Serving Abuja, Nigeria
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Trusted Auto Mechanic in <span className="text-transparent bg-clip-text bg-gradient-primary">Abuja</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100/80 leading-relaxed">
            Professional vehicle diagnostics, repairs, and maintenance located in the heart of Karu District. Get your car running perfectly with our expert team.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink to="/book" variant="gradient" size="lg">
              Book a Service
            </ButtonLink>
            <ButtonLink to="/contact" variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
              Get Directions
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-surface relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Why Choose Truck-View in Abuja?</h2>
            <p className="mt-4 text-lg text-ink-soft">We combine modern diagnostic technology with years of hands-on experience to deliver unmatched automotive care in the FCT.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-surface-2 border border-line glass hover:-translate-y-1 transition-transform">
              <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 mb-6">
                <WrenchIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Expert Technicians</h3>
              <p className="text-ink-soft">Our certified mechanics specialize in both modern computer diagnostics and traditional mechanical repairs.</p>
            </div>
            <div className="p-8 rounded-2xl bg-surface-2 border border-line glass hover:-translate-y-1 transition-transform">
              <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 mb-6">
                <ClockIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Fast Turnaround</h3>
              <p className="text-ink-soft">We value your time. Most routine maintenance and standard repairs in our Abuja workshop are completed the same day.</p>
            </div>
            <div className="p-8 rounded-2xl bg-surface-2 border border-line glass hover:-translate-y-1 transition-transform">
              <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600 mb-6">
                <StarIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-3">Guaranteed Quality</h3>
              <p className="text-ink-soft">We use premium OEM parts and guarantee our workmanship, ensuring your vehicle stays reliable on Nigerian roads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 bg-canvas border-t border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl mb-6">Comprehensive Auto Repair Services in Karu District</h2>
              <p className="text-lg text-ink-soft mb-8">From routine oil changes to complex engine overhauls, our Abuja-based facility is equipped to handle all your automotive needs.</p>
              
              <ul className="space-y-4">
                {[
                  'Advanced Engine Diagnostics & Scanning',
                  'Brake System Inspection & Replacement',
                  'Suspension & Steering Repairs',
                  'Air Conditioning (AC) Servicing & Gas Refill',
                  'Routine Maintenance (Oil, Filters, Fluids)',
                  'Transmission Servicing'
                ].map((service, i) => (
                  <li key={i} className="flex items-center gap-3 text-ink">
                    <CheckCircleIcon className="text-success-500" size={20} />
                    <span className="font-medium">{service}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <ButtonLink to="/services" variant="secondary">View All Services</ButtonLink>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 rounded-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80" 
                alt="Truck-View Mechanic working on a car in Abuja" 
                className="relative rounded-3xl shadow-2xl border border-line"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Visit Our Workshop in Abuja</h2>
          <p className="mt-4 text-lg text-ink-soft mb-8">
            Located conveniently behind Games Village, Deck One Apartments in Karu District. 
            We are easily accessible from anywhere in the FCT.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-surface-2 border border-line p-2 rounded-2xl">
             <div className="px-6 py-4 flex items-center gap-3">
               <MapPinIcon className="text-accent-500" />
               <div className="text-left">
                 <div className="font-bold text-ink">Truck-View Global Ent.</div>
                 <div className="text-sm text-ink-soft">Deck One Apartments, Karu, Abuja</div>
               </div>
             </div>
             <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-accent-500 text-white px-6 py-4 rounded-xl font-medium hover:bg-accent-600 transition-colors shadow-md text-center">
               Open in Google Maps
             </a>
          </div>
        </div>
      </section>
    </>
  )
}
