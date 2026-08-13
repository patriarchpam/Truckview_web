import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'
import { useStore } from '../../contexts/StoreContext'
import { UploadIcon } from 'lucide-react'
import type { VehicleType } from '../../types'

interface VehicleTypeModalProps {
  open: boolean
  onClose: () => void
  vehicleType?: VehicleType
}

export function VehicleTypeModal({ open, onClose, vehicleType }: VehicleTypeModalProps) {
  const { saveVehicleType } = useStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (vehicleType && open) {
      setName(vehicleType.name)
      setDescription(vehicleType.description)
      setImage(vehicleType.image || '')
      setActive(vehicleType.active)
    } else if (open) {
      setName('')
      setDescription('')
      setImage('')
      setActive(true)
    }
  }, [vehicleType, open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveVehicleType({
        id: vehicleType?.id,
        name, description, image, active,
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save vehicle type")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={vehicleType ? 'Edit Vehicle Type' : 'Add New Vehicle Type'} size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Vehicle Type'}</Button>
        </>
      }
    >
      <div className="grid gap-5">
        <Field label="Name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sedan" />
        </Field>
        
        <Field label="Description">
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </Field>
        
        <Field label="Image">
          <div className="flex items-center gap-3">
            <Input value={image} onChange={e => setImage(e.target.value)} placeholder="/images/vehicle-sedan.png" className="flex-1" />
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

        <label className="flex items-center gap-2 text-sm font-medium text-ink cursor-pointer mt-2">
          <input type="checkbox" className="rounded border-line text-accent-500 focus:ring-accent-500"
            checked={active} onChange={(e) => setActive(e.target.checked)} />
          Vehicle Type is Active
        </label>
      </div>
    </Modal>
  )
}
