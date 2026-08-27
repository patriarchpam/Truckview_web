import { useState, useEffect } from 'react'
import { Trash2Icon, RefreshCwIcon, CheckCircleIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'

export function AdminTrash() {
  const [deletedItems, setDeletedItems] = useState<{ type: string; id: string; name: string; deletedAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeleted = async () => {
    setLoading(true)
    const items: any[] = []
    
    // Fetch deleted bookings
    const { data: bData } = await supabase.from('bookings').select('*, profiles(name)').eq('is_deleted', true)
    if (bData) {
      bData.forEach(b => items.push({ type: 'Booking', id: b.id, name: `Booking ${b.reference} by ${b.profiles?.name}`, deletedAt: b.created_at }))
    }

    // Fetch deleted quotes
    const { data: qData } = await supabase.from('quotes').select('*').eq('is_deleted', true)
    if (qData) {
      qData.forEach(q => items.push({ type: 'Quote', id: q.id, name: `Quote #${q.quotation_number}`, deletedAt: q.created_at }))
    }
    
    // Fetch deleted vehicle types
    const { data: vData } = await supabase.from('vehicle_types').select('*').eq('is_deleted', true)
    if (vData) {
      vData.forEach(v => items.push({ type: 'Vehicle Type', id: v.id, name: v.name, deletedAt: 'Unknown' }))
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
    else if (type === 'Vehicle Type') table = 'vehicle_types'
    else return

    const { error } = await supabase.from(table).update({ is_deleted: false }).eq('id', id)
    if (!error) {
      alert(`${type} restored successfully.`)
      fetchDeleted()
    } else {
      alert(`Failed to restore: ${error.message}`)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          <Trash2Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Trash & Recovery</h1>
          <p className="text-muted mt-1">View and restore soft-deleted items.</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted">Loading deleted items...</div>
        ) : deletedItems.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircleIcon size={48} className="mx-auto text-green-500 mb-4 opacity-50" />
            <p className="text-muted">Trash is empty. No deleted items found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-sm border-b border-line">
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">Deleted At</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-line">
              {deletedItems.map((item, i) => (
                <tr key={`${item.type}-${item.id}-${i}`} className="hover:bg-surface-2/30">
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 rounded bg-surface-2 font-medium text-xs border border-line">{item.type}</span>
                  </td>
                  <td className="p-4 text-ink font-medium">{item.name}</td>
                  <td className="p-4 text-muted">{item.deletedAt}</td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(item.type, item.id)}>
                      <RefreshCwIcon size={14} className="mr-1" /> Restore
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
