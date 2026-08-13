import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'
import { useStore } from '../../contexts/StoreContext'
import { UploadIcon } from 'lucide-react'
import type { Service } from '../../types'

interface ServiceModalProps {
  open: boolean
  onClose: () => void
  service?: Service
}

export function ServiceModal({ open, onClose, service }: ServiceModalProps) {
  const { vehicleTypes, saveService } = useStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [selectedVt, setSelectedVt] = useState<string[]>([])
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (service && open) {
      setName(service.name)
      setDescription(service.description)
      setDuration(service.duration)
      setPrice(service.price)
      setImage(service.image || '')
      setSelectedVt(service.vehicleTypeIds || [])
      setActive(service.active)
    } else if (open) {
      setName('')
      setDescription('')
      setDuration(60)
      setPrice(0)
      setImage('')
      setSelectedVt([])
      setActive(true)
    }
  }, [service, open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveService({
        id: service?.id,
        name, description, duration, price, image, active,
        vehicleTypeIds: selectedVt
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save service")
    } finally {
      setSaving(false)
    }
  }

  const toggleVt = (id: string) => {
    setSelectedVt(cur => cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id])
  }

  return (
    <Modal open={open} onClose={onClose} title={service ? 'Edit Service' : 'Add New Service'} size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Service'}</Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Full Diagnostics" />
        </Field>
        
        <Field label="Price (NGN)">
          <Input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
        </Field>
        
        <Field label="Duration (minutes)">
          <Input type="number" value={duration || ''} onChange={e => setDuration(Number(e.target.value))} />
        </Field>

        <Field label="Description" className="sm:col-span-2">
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </Field>
        
        <Field label="Image" className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <Input value={image} onChange={e => setImage(e.target.value)} placeholder="/images/service-oil.png" className="flex-1" />
            <div className="relative">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    const url = await api.uploadImage(file)
                    setImage(url)
                  } catch (err) { alert('Upload failed') }
                  finally { setUploading(false) }
                }}
              />
              <Button variant="outline" type="button" disabled={uploading}>
                <UploadIcon size={16} className="mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </Field>
        
        <div className="sm:col-span-2">
          <div className="text-sm font-medium text-ink mb-2">Supported Vehicle Types</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {vehicleTypes.map(vt => (
              <label key={vt.id} className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
                <input type="checkbox" className="rounded border-line text-accent-500 focus:ring-accent-500"
                  checked={selectedVt.includes(vt.id)} onChange={() => toggleVt(vt.id)} />
                {vt.name}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer sm:col-span-2 mt-2">
          <input type="checkbox" className="rounded border-line text-accent-500 focus:ring-accent-500"
            checked={active} onChange={(e) => setActive(e.target.checked)} />
          Service is Active
        </label>
      </div>
    </Modal>
  )
}
