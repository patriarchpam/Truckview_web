import { StarIcon, FlagIcon, CheckCircle2Icon } from 'lucide-react'

const MOCK_REVIEWS = [
  { id: '1', customer: 'Adaeze Okafor', service: 'General Maintenance', rating: 5, date: 'Oct 12, 2026', comment: 'Excellent service! The mechanic arrived on time and fixed my car very quickly.', status: 'Published' },
  { id: '2', customer: 'Samuel Eze', service: 'Tyres & Wheels', rating: 4, date: 'Oct 10, 2026', comment: 'Good work, but the waiting time was a bit longer than expected.', status: 'Published' },
  { id: '3', customer: 'Ibrahim Musa', service: 'Engine Services', rating: 2, date: 'Oct 08, 2026', comment: 'The mechanic did not have the right tools for my truck. Had to reschedule.', status: 'Flagged' },
]

export function AdminReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Customer Reviews</h1>
        <p className="text-muted mt-1">Monitor and moderate customer feedback and ratings.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-ink">{review.customer}</h3>
                <p className="text-sm text-muted">Service: {review.service} • {review.date}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                ${review.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {review.status}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={16} className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-line fill-surface-2"} />
              ))}
            </div>

            <p className="text-ink-soft mb-6">{review.comment}</p>

            <div className="flex gap-3 border-t border-line pt-4">
              {review.status === 'Flagged' ? (
                <button className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                  <CheckCircle2Icon size={16} /> Approve
                </button>
              ) : (
                <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                  <FlagIcon size={16} /> Flag Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
