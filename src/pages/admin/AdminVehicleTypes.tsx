import React from 'react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'

export function AdminVehicleTypes() {
  const { vehicleTypes, services, loading } = useStore()
  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Vehicle Types</h1>
        <Badge>{vehicleTypes.length} total</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicleTypes.map((vt) => {
          const count = services.filter((s) => s.vehicleTypeIds.includes(vt.id)).length
          return (
            <div key={vt.id} className="rounded-xl border border-line bg-surface overflow-hidden shadow-card">
              <img src={vt.image} alt={vt.name} className="h-36 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-ink">{vt.name}</h3>
                  <Badge variant={vt.active ? 'success' : 'default'}>{vt.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-xs text-muted line-clamp-2">{vt.description}</p>
                <div className="text-xs text-muted mt-2">{count} services available</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
