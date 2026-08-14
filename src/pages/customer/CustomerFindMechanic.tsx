import { useState } from 'react'
import { SearchIcon, StarIcon, MapPinIcon, FilterIcon } from 'lucide-react'

const MOCK_MECHANICS = [
  { id: '1', name: 'James Okoro', specialization: 'Engine Diagnostics & Repair', rating: 4.8, reviews: 124, distance: '2.5 km away', available: true },
  { id: '2', name: 'Samuel Chinedu', specialization: 'Transmission Specialist', rating: 4.9, reviews: 89, distance: '3.1 km away', available: false },
  { id: '3', name: 'AutoPro Workshop', specialization: 'General Maintenance, AC', rating: 4.6, reviews: 312, distance: '5.0 km away', available: true },
  { id: '4', name: 'Emeka Fix-It', specialization: 'Brakes & Suspension', rating: 4.7, reviews: 56, distance: '1.2 km away', available: true },
]

export function CustomerFindMechanic() {
  const [search, setSearch] = useState('')

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Find a Mechanic</h1>
        <p className="text-muted mt-1">Search our directory of certified mechanics and workshops near you.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 bg-surface border border-line text-ink px-4 py-2.5 rounded-xl hover:bg-surface-2 transition-colors">
          <FilterIcon size={18} />
          Filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_MECHANICS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.specialization.toLowerCase().includes(search.toLowerCase())).map((mechanic) => (
          <div key={mechanic.id} className="bg-surface border border-line p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-ink">{mechanic.name}</h3>
                <p className="text-sm text-ink-soft">{mechanic.specialization}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${mechanic.available ? 'bg-green-50 text-green-700' : 'bg-surface-2 text-muted'}`}>
                {mechanic.available ? 'Available Now' : 'Busy'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted mb-5">
              <div className="flex items-center gap-1">
                <StarIcon size={16} className="text-amber-500 fill-amber-500" />
                <span className="font-medium text-ink">{mechanic.rating}</span>
                <span>({mechanic.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPinIcon size={16} />
                <span>{mechanic.distance}</span>
              </div>
            </div>

            <button className="w-full bg-accent-50 text-accent-600 font-medium py-2 rounded-lg hover:bg-accent-100 transition-colors">
              View Profile & Book
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
