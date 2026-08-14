import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useStore } from '../../contexts/StoreContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatPrice, formatDuration } from '../../utils/format'
import { ServiceModal } from '../../components/admin/ServiceModal'
import type { Service } from '../../types'

export function AdminServices() {
  const { services, loading, deleteService } = useStore()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | undefined>(undefined)

  const handleAdd = () => {
    setEditingService(undefined)
    setModalOpen(true)
  }

  const handleEdit = (s: Service) => {
    setEditingService(s)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id)
      } catch (err) {
        alert('Failed to delete service')
      }
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" /></div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Services</h1>
          <p className="text-sm text-muted mt-1">Manage the services you offer to customers.</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto shrink-0 justify-center">
          <PlusIcon size={16} className="mr-2" /> Add Service
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-surface p-5 shadow-card group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-ink">{s.name}</h3>
              <Badge variant={s.active ? 'success' : 'default'}>{s.active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="text-xs text-muted mb-3 line-clamp-2">{s.description}</p>
            <div className="flex gap-3 text-xs text-muted mb-4">
              <span>{formatPrice(s.price)}</span>
              <span>·</span>
              <span>{formatDuration(s.duration)}</span>
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-line">
              <Button variant="outline" className="flex-1 text-xs py-1.5" onClick={() => handleEdit(s)}>
                <PencilIcon size={14} /> Edit
              </Button>
              <Button variant="outline" className="flex-1 text-xs py-1.5 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-900/30" onClick={() => handleDelete(s.id)}>
                <TrashIcon size={14} /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)} service={editingService} />
    </div>
  )
}
