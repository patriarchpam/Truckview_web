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

export const CustomerSupport = () => <PlaceholderPage title="Help & Support" description="Get help with your bookings, contact our support team, or browse our FAQs. Coming soon!" />
