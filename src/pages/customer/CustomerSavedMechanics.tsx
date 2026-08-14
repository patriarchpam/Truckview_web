import { HeartIcon, StarIcon, MapPinIcon, MoreVerticalIcon } from 'lucide-react'

const SAVED_MECHANICS = [
  { id: '1', name: 'James Okoro', specialization: 'Engine Diagnostics & Repair', rating: 4.8, distance: '2.5 km away', dateSaved: '2 days ago' },
  { id: '3', name: 'AutoPro Workshop', specialization: 'General Maintenance, AC', rating: 4.6, distance: '5.0 km away', dateSaved: '1 month ago' },
]

export function CustomerSavedMechanics() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Saved Mechanics</h1>
        <p className="text-muted mt-1">Quickly access your favorite and previously booked mechanics.</p>
      </div>

      {SAVED_MECHANICS.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-line rounded-2xl">
          <HeartIcon size={48} className="mx-auto text-muted mb-4" />
          <h3 className="text-lg font-medium text-ink mb-1">No saved mechanics yet</h3>
          <p className="text-muted">When you find a mechanic you like, tap the heart icon to save them here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {SAVED_MECHANICS.map((mechanic) => (
            <div key={mechanic.id} className="bg-surface border border-line p-5 rounded-2xl shadow-sm relative group">
              <button className="absolute top-4 right-4 text-muted hover:text-ink">
                <MoreVerticalIcon size={20} />
              </button>
              
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-accent-50 text-accent-500 flex items-center justify-center shrink-0">
                  <HeartIcon size={24} className="fill-accent-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-ink pr-6">{mechanic.name}</h3>
                  <p className="text-sm text-ink-soft mb-2">{mechanic.specialization}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <StarIcon size={14} className="text-amber-500 fill-amber-500" />
                      <span className="font-medium text-ink">{mechanic.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon size={14} />
                      <span>{mechanic.distance}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 bg-accent-500 text-white font-medium py-2 rounded-lg hover:bg-accent-600 transition-colors">
                  Book Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
