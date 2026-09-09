import { useState, useEffect } from 'react'
import { Trash2Icon, RefreshCwIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { toast } from 'sonner'
import { formatShortDate } from '../../utils/format'

export function AdminTrash() {
  const [deletedItems, setDeletedItems] = useState<{ type: string; id: string; name: string; deletedAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeleted = async () => {
    setLoading(true)
    const items: any[] = []
    
    // Fetch deleted bookings
    const { data: bData } = await supabase.from('bookings').select('*, profiles(name)').eq('is_deleted', true)
    if (bData) {
      bData.forEach(b => items.push({ type: 'Booking', id: b.id, name: `Booking ${b.reference} by ${b.profiles?.name || 'Customer'}`, deletedAt: b.deleted_at ? formatShortDate(b.deleted_at) : (b.created_at ? formatShortDate(b.created_at) : 'Recently') }))
    }

    // Fetch deleted quotes
    const { data: qData } = await supabase.from('quotes').select('*').eq('is_deleted', true)
    if (qData) {
      qData.forEach(q => items.push({ type: 'Quote', id: q.id, name: `Quote #${q.quotation_number}`, deletedAt: q.deleted_at ? formatShortDate(q.deleted_at) : (q.created_at ? formatShortDate(q.created_at) : 'Recently') }))
    }
    
    // Fetch deleted car brands (vehicle types)
    const { data: vData } = await supabase.from('vehicle_types').select('*').eq('is_deleted', true)
    if (vData) {
      vData.forEach(v => items.push({ type: 'Car Brand', id: v.id, name: v.name, deletedAt: v.deleted_at ? formatShortDate(v.deleted_at) : 'Recently' }))
    }

    // Fetch deleted services
    const { data: sData } = await supabase.from('services').select('*').eq('is_deleted', true)
    if (sData) {
      sData.forEach(s => items.push({ type: 'Service', id: s.id, name: s.name, deletedAt: s.deleted_at ? formatShortDate(s.deleted_at) : 'Recently' }))
    }

    // Fetch deleted customer profiles
    const { data: cData } = await supabase.from('profiles').select('*').eq('is_deleted', true)
    if (cData) {
      cData.forEach(c => items.push({ type: 'Customer Profile', id: c.id, name: `${c.name} (${c.email})`, deletedAt: c.deleted_at ? formatShortDate(c.deleted_at) : 'Recently' }))
    }

    setDeletedItems(items)
    setLoading(false)
  }

  useEffect(() => {
    fetchDeleted()
  }, [])

  const handleRestore = async (type: string, id: string) => {
    let table = ''
    if (type === 'Booking') table = 'bookings'
    else if (type === 'Quote') table = 'quotes'
    else if (type === 'Car Brand') table = 'vehicle_types'
    else if (type === 'Service') table = 'services'
    else if (type === 'Customer Profile') table = 'profiles'
    else return

    const { error } = await supabase.from(table).update({ is_deleted: false }).eq('id', id)
    if (!error) {
      toast.success(`${type} restored successfully.`)
      fetchDeleted()
    } else {
      toast.error(`Failed to restore: ${error.message}`)
    }
  }

  const handlePermanentDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete this ${type}? This action CANNOT be undone.`)) return

    let table = ''
    if (type === 'Booking') table = 'bookings'
    else if (type === 'Quote') table = 'quotes'
    else if (type === 'Car Brand') table = 'vehicle_types'
    else if (type === 'Service') table = 'services'
    else if (type === 'Customer Profile') table = 'profiles'
    else return

    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) {
      toast.success(`${type} permanently deleted.`)
      fetchDeleted()
    } else {
      toast.error(`Failed to permanently delete: ${error.message}`)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl dark:bg-red-900/30 dark:text-red-400">
          <Trash2Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Trash & Recovery</h1>
          <p className="text-muted mt-1">View, restore, or permanently purge soft-deleted items across the system.</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading deleted items...</div>
        ) : deletedItems.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircleIcon size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
            <p className="text-muted font-medium">Trash is empty. No deleted items found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-xs uppercase tracking-wider border-b border-line">
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">Deleted At</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-line">
              {deletedItems.map((item, i) => (
                <tr key={`${item.type}-${item.id}-${i}`} className="hover:bg-surface-2/30">
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-surface-2 font-medium text-xs border border-line">{item.type}</span>
                  </td>
                  <td className="p-4 text-ink font-medium">{item.name}</td>
                  <td className="p-4 text-muted text-xs">{item.deletedAt}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(item.type, item.id)}>
                      <RefreshCwIcon size={14} className="mr-1" /> Restore
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:border-red-200" onClick={() => handlePermanentDelete(item.type, item.id)}>
                      <XCircleIcon size={14} className="mr-1" /> Purge
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
