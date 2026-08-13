import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, FileTextIcon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'
import { formatPrice } from '../../utils/format'
import type { Booking, Quote, QuoteItem } from '../../types'
import { QuoteDocumentPreview } from './QuoteDocumentPreview'

interface AdminQuoteModalProps {
  open: boolean
  onClose: () => void
  booking: Booking | null
}

export function AdminQuoteModal({ open, onClose, booking }: AdminQuoteModalProps) {
  const [quote, setQuote] = useState<Partial<Quote> | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Form Fields
  const [quotationNumber, setQuotationNumber] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [validUntil, setValidUntil] = useState('')
  const [preparedBy, setPreparedBy] = useState('Pam Patriarch')
  const [comments, setComments] = useState('')
  const [salesTaxRate, setSalesTaxRate] = useState(0)
  const [otherFees, setOtherFees] = useState(0)
  
  const [items, setItems] = useState<Omit<QuoteItem, 'id'>[]>([])

  useEffect(() => {
    if (open && booking) {
      loadQuote(booking.id)
    }
  }, [open, booking])

  const loadQuote = async (bookingId: string) => {
    setLoading(true)
    try {
      const existing = await api.getQuoteByBookingId(bookingId)
      if (existing) {
        setQuote(existing)
        setQuotationNumber(existing.quotationNumber)
        setDate(existing.date)
        setValidUntil(existing.validUntil)
        setPreparedBy(existing.preparedBy)
        setComments(existing.comments)
        setSalesTaxRate(existing.salesTaxRate)
        setOtherFees(existing.otherFees)
        setItems(existing.items)
      } else {
        setQuote(null)
        setQuotationNumber(`Q-${Math.floor(Math.random() * 10000)}`)
        const today = new Date()
        setDate(today.toISOString().split('T')[0])
        const nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 7)
        setValidUntil(nextWeek.toISOString().split('T')[0])
        setPreparedBy('Pam Patriarch')
        setComments('')
        setSalesTaxRate(0)
        setOtherFees(0)
        setItems([{ quantity: 1, description: 'Service Charge', unitPrice: 0, taxable: false }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
  const taxAmount = (subtotal * salesTaxRate) / 100
  const total = subtotal + taxAmount + otherFees

  const handleSave = async () => {
    if (!booking) return
    setSaving(true)
    try {
      await api.saveQuote({
        id: quote?.id,
        bookingId: booking.id,
        quotationNumber,
        date,
        validUntil,
        preparedBy,
        items: items.map((it, i) => ({ ...it, id: i.toString() })),
        subtotal,
        salesTaxRate,
        otherFees,
        total,
        comments,
        status: quote?.status || 'sent'
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save quote")
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => setItems([...items, { quantity: 1, description: '', unitPrice: 0, taxable: false }])
  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  if (loading || !booking) return null

  return (
    <>
      <Modal open={open && !showPreview} onClose={onClose} title={`Quote for ${booking.customer.name}`} size="lg"
      footer={
        <div className="flex w-full justify-between items-center">
          <Button variant="secondary" onClick={() => setShowPreview(true)}>
            <FileTextIcon size={16} className="mr-1" /> Preview PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (quote ? 'Update Quote' : 'Create Quote')}</Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* Header Details */}
        <div className="grid gap-4 sm:grid-cols-2 bg-surface-2 p-4 rounded-xl">
          <Field label="Quotation #">
            <Input value={quotationNumber} onChange={e => setQuotationNumber(e.target.value)} />
          </Field>
          <Field label="Prepared By">
            <Input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Field>
          <Field label="Valid Until">
            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </Field>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-ink">Line Items</h3>
            <Button variant="outline" onClick={addItem} className="text-xs py-1 px-3 h-auto"><PlusIcon size={14} className="mr-1"/> Add Item</Button>
          </div>
          
          <div className="border border-line rounded-xl overflow-hidden">
            <div className="bg-surface-2 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
              <div className="col-span-2">Qty</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-3">Unit Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="divide-y divide-line">
              {items.map((item, i) => (
                <div key={i} className="px-4 py-2 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2">
                    <Input type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-5">
                    <Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Part / Labor" className="h-8 text-sm" />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2 text-sm font-medium text-ink">
                    {formatPrice(item.quantity * item.unitPrice)}
                    <button onClick={() => removeItem(i)} className="text-muted hover:text-red-500 p-1"><TrashIcon size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Comments / Instructions">
            <Textarea rows={4} value={comments} onChange={e => setComments(e.target.value)} placeholder="None" />
          </Field>
          
          <div className="bg-surface-2 p-4 rounded-xl space-y-3 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-ink-soft">
              <span className="flex items-center gap-2">Tax Rate (%) <Input type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(Number(e.target.value))} className="w-16 h-7 text-xs px-2" /></span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-ink-soft">
              <span className="flex items-center gap-2">Other Fees <Input type="number" value={otherFees} onChange={e => setOtherFees(Number(e.target.value))} className="w-24 h-7 text-xs px-2" /></span>
              <span>{formatPrice(otherFees)}</span>
            </div>
            <div className="flex justify-between text-ink font-bold pt-3 border-t border-line/50 text-base">
              <span>Total Amount</span>
              <span className="text-accent-600">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>

      {showPreview && (
        <QuoteDocumentPreview 
          booking={booking} 
          quoteData={{ quotationNumber, date, validUntil, preparedBy, items, subtotal, salesTaxRate, taxAmount, otherFees, total, comments }} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </>
  )
}
