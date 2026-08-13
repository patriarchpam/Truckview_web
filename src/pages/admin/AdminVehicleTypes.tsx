import React, { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { VehicleTypeModal } from '../../components/admin/VehicleTypeModal'
import type { VehicleType } from '../../types'

export function AdminVehicleTypes() {
  const { vehicleTypes, loading, deleteVehicleType } = useStore()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVt, setEditingVt] = useState<VehicleType | undefined>(undefined)

  const handleAdd = () => {
    setEditingVt(undefined)
    setModalOpen(true)
  }

  const handleEdit = (vt: VehicleType) => {
    setEditingVt(vt)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle type?')) {
      try {
        await deleteVehicleType(id)
      } catch (err) {
        alert('Failed to delete vehicle type')
      }
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Vehicle Types</h1>
          <p className="text-sm text-muted">Manage the types of vehicles your workshop services.</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusIcon size={16} /> Add Vehicle Type
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicleTypes.map((vt) => (
          <div key={vt.id} className="rounded-xl border border-line bg-surface overflow-hidden shadow-card group">
            {vt.image && (
              <div className="aspect-video w-full overflow-hidden bg-surface-2 relative">
                <img src={vt.image} alt={vt.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-ink">{vt.name}</h3>
                <Badge variant={vt.active ? 'success' : 'default'}>{vt.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-sm text-muted line-clamp-3 mb-4">{vt.description}</p>
              
              <div className="flex gap-2 pt-4 border-t border-line">
                <Button variant="outline" className="flex-1 text-xs py-1.5" onClick={() => handleEdit(vt)}>
                  <PencilIcon size={14} /> Edit
                </Button>
                <Button variant="outline" className="flex-1 text-xs py-1.5 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-900/30" onClick={() => handleDelete(vt.id)}>
                  <TrashIcon size={14} /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VehicleTypeModal open={modalOpen} onClose={() => setModalOpen(false)} vehicleType={editingVt} />
    </div>
  )
}
