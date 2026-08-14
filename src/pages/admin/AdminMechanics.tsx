import { useState } from 'react'
import { PlusIcon, SearchIcon, MoreVerticalIcon, WrenchIcon, CheckCircle2Icon } from 'lucide-react'

// Mock Data for Mechanics
const MOCK_MECHANICS = [
  { id: '1', name: 'John Doe', role: 'Senior Mechanic', specialization: 'Engine Diagnostics, AC Repair', status: 'Available', rating: 4.8 },
  { id: '2', name: 'Michael Eze', role: 'Mechanic', specialization: 'Brakes, Suspension', status: 'On Job', rating: 4.5 },
  { id: '3', name: 'Sarah Ahmed', role: 'Lead Electrician', specialization: 'Electrical & Diagnostics', status: 'Off Duty', rating: 4.9 },
]

export function AdminMechanics() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mechanics</h1>
          <p className="text-muted text-sm mt-1">Manage your team of certified mechanics and their assignments.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lift shrink-0">
          <PlusIcon size={18} />
          Add Mechanic
        </button>
      </div>

      {/* Filters/Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            placeholder="Search mechanics by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
          />
        </div>
      </div>

      {/* Mechanics Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-muted text-sm">
                <th className="p-4 font-medium">Mechanic Info</th>
                <th className="p-4 font-medium">Specialization</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_MECHANICS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.specialization.toLowerCase().includes(searchQuery.toLowerCase())).map((mechanic) => (
                <tr key={mechanic.id} className="border-b border-line hover:bg-surface-2/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center shrink-0">
                        <WrenchIcon size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-ink">{mechanic.name}</div>
                        <div className="text-xs text-muted mt-0.5">{mechanic.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ink-soft">
                    {mechanic.specialization}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${mechanic.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 
                        mechanic.status === 'On Job' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-surface-2 text-muted border-line'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${mechanic.status === 'Available' ? 'bg-green-500' : mechanic.status === 'On Job' ? 'bg-amber-500' : 'bg-muted'}`}></span>
                      {mechanic.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-ink font-medium">
                      <CheckCircle2Icon size={14} className="text-accent-500" />
                      {mechanic.rating}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-surface-2 transition-colors">
                      <MoreVerticalIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {MOCK_MECHANICS.length === 0 && (
          <div className="p-12 text-center text-muted">
            No mechanics found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}
