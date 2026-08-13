import React from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { formatPrice, formatDuration } from '../../utils/format'

export function AdminServices() {
  const { services, loading } = useStore()
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Services</h1>
        <Badge>{services.length} total</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-ink">{s.name}</h3>
              <Badge variant={s.active ? 'success' : 'default'}>{s.active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="text-xs text-muted mb-3 line-clamp-2">{s.description}</p>
            <div className="flex gap-3 text-xs text-muted">
              <span>{formatPrice(s.price)}</span>
              <span>·</span>
              <span>{formatDuration(s.duration)}</span>
              <span>·</span>
              <span>{s.vehicleTypeIds.length} vehicle types</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
