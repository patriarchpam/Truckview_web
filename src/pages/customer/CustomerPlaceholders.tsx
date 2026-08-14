import { ConstructionIcon } from 'lucide-react'

function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
      <div className="h-16 w-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mb-2">
        <ConstructionIcon size={32} />
      </div>
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="text-muted leading-relaxed">{description}</p>
    </div>
  )
}

export const CustomerFindMechanic = () => <PlaceholderPage title="Find a Mechanic" description="Search our directory of certified mechanics and book an expert for your specific vehicle needs. Coming soon!" />
export const CustomerSavedMechanics = () => <PlaceholderPage title="Saved Mechanics" description="Quickly access your favorite and previously booked mechanics. Coming soon!" />
export const CustomerPayments = () => <PlaceholderPage title="Payments & Invoices" description="View your transaction history, manage payment methods, and download invoices. Coming soon!" />
export const CustomerNotifications = () => <PlaceholderPage title="Notifications" description="Stay updated with real-time alerts about your bookings and messages from mechanics. Coming soon!" />
export const CustomerProfile = () => <PlaceholderPage title="My Profile" description="Manage your personal information, security settings, and communication preferences. Coming soon!" />
export const CustomerSupport = () => <PlaceholderPage title="Help & Support" description="Get help with your bookings, contact our support team, or browse our FAQs. Coming soon!" />
