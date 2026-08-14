import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { useStore } from '../../contexts/StoreContext'
import type { Customer } from '../../types'

interface CustomerModalProps {
  open: boolean
  onClose: () => void
  customer?: Customer
}

export function CustomerModal({ open, onClose, customer }: CustomerModalProps) {
  const { createCustomer, updateCustomer } = useStore()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [manualBookingCount, setManualBookingCount] = useState('')
  const [manualLastBookingDate, setManualLastBookingDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(customer?.name || '')
      setEmail(customer?.email || '')
      setPhone(customer?.phone || '')
      setManualBookingCount(customer ? customer.bookingCount.toString() : '')
      setManualLastBookingDate(customer?.lastBookingDate || '')
      setError(null)
    }
  }, [open, customer])

  const handleSave = async () => {
    if (!name || !email || !phone) {
      setError('Please fill in all fields')
      return
    }
    
    setSaving(true)
    setError(null)
    try {
      if (customer) {
        await updateCustomer(customer.id, { 
          name, email, phone, 
          manualBookingCount: manualBookingCount ? parseInt(manualBookingCount, 10) : null,
          manualLastBookingDate: manualLastBookingDate || null
        })
      } else {
        await createCustomer({ name, email, phone })
      }
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || `Failed to ${customer ? 'update' : 'create'} customer`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={customer ? "Edit Customer" : "Add New Customer"} size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (customer ? 'Update Customer' : 'Save Customer')}</Button>
        </>
      }
    >
      <div className="grid gap-5">
        {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        
        <Field label="Full Name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
        </Field>
        
        <Field label="Email Address">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@example.com" />
        </Field>

        <Field label="Phone Number">
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0803 123 4567" />
        </Field>

        {customer && (
          <div className="pt-4 border-t border-line grid gap-4">
            <h4 className="text-sm font-semibold text-ink">Manual Override (For WhatsApp/Call bookings)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Bookings">
                <Input type="number" min="0" value={manualBookingCount} onChange={e => setManualBookingCount(e.target.value)} placeholder="e.g. 5" />
              </Field>
              <Field label="Last Booking Date">
                <Input type="date" value={manualLastBookingDate} onChange={e => setManualLastBookingDate(e.target.value)} />
              </Field>
            </div>
            <p className="text-xs text-muted">
              Use these fields to manually adjust the customer's history. Leave empty to auto-calculate from online bookings.
            </p>
          </div>
        )}
        
        {!customer && (
          <p className="text-xs text-muted mt-2">
            Note: Vehicles can be linked when creating quotes or bookings for this customer.
          </p>
        )}
      </div>
    </Modal>
  )
}
