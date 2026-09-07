import { useState } from 'react'
import { CheckIcon, XIcon, FileTextIcon, MessageSquareIcon } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { formatPrice } from '../utils/format'
import type { Quote, Booking } from '../types'
import { QuoteDocumentPreview } from './admin/QuoteDocumentPreview'
import { toast } from 'sonner'

interface CustomerQuoteCardProps {
  quote: Quote
  booking: Booking
  onUpdate?: () => void
}

export function CustomerQuoteCard({ quote, booking, onUpdate }: CustomerQuoteCardProps) {
  const [updating, setUpdating] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [customerNote, setCustomerNote] = useState(quote.customerNotes || '')

  const handleAction = async (status: 'accepted' | 'rejected' | 'negotiating') => {
    setUpdating(true)
    try {
      await api.updateQuoteStatus(quote.id, status, customerNote)
      toast.success(status === 'negotiating' ? 'Change request sent to admin.' : `Quote ${status} successfully!`)
      onUpdate?.()
    } catch (err) {
      toast.error(`Failed to update quote status`)
    } finally {
      setUpdating(false)
    }
  }

  const handlePayment = async (status: 'pending' | 'partial' | 'full') => {
    setUpdating(true)
    try {
      await api.updatePaymentStatus(quote.id, status)
      toast.success('Payment status updated!')
      onUpdate?.()
    } catch (err) {
      toast.error('Failed to update payment status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="mt-6 border-t border-line pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <FileTextIcon size={18} className="text-accent-500" />
          Quotation #{quote.quotationNumber}
        </h3>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowPdf(true)}>
            View PDF
          </Button>
          <Badge 
            variant={
              quote.status === 'accepted' ? 'success' : 
              quote.status === 'rejected' ? 'danger' : 
              quote.status === 'negotiating' ? 'accent' : 'warning'
            } 
            className="capitalize"
          >
            {quote.status === 'negotiating' ? 'Changes Requested' : quote.status}
          </Badge>
          {quote.paymentStatus && (
            <Badge variant={quote.paymentConfirmedByAdmin ? 'success' : 'warning'} className="capitalize ml-2">
              {quote.paymentConfirmedByAdmin ? 'Paid ' : 'Pending '} {quote.paymentStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-surface-2 rounded-xl p-5 border border-line">
        <div className="flex justify-between text-sm mb-4 pb-4 border-b border-line">
          <div><span className="text-muted block text-xs">Date</span><span className="font-medium text-ink">{quote.date}</span></div>
          <div><span className="text-muted block text-xs">Valid Until</span><span className="font-medium text-ink">{quote.validUntil}</span></div>
          <div><span className="text-muted block text-xs">Prepared By</span><span className="font-medium text-ink">{quote.preparedBy}</span></div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            <div className="col-span-2">Qty</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-4 text-right">Amount</div>
          </div>
          {quote.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 text-sm text-ink-soft items-center py-1">
              <div className="col-span-2">{item.quantity}</div>
              <div className="col-span-6">{item.description}</div>
              <div className="col-span-4 text-right font-medium text-ink">{formatPrice(item.quantity * item.unitPrice)}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm pt-4 border-t border-line mb-6">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatPrice(quote.subtotal)}</span>
          </div>
          {quote.salesTaxRate > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Tax ({quote.salesTaxRate}%)</span>
              <span>{formatPrice((quote.subtotal * quote.salesTaxRate) / 100)}</span>
            </div>
          )}
          {quote.otherFees > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Other Fees</span>
              <span>{formatPrice(quote.otherFees)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink font-bold pt-2 text-base">
            <span>Total Amount</span>
            <span className="text-accent-600">{formatPrice(quote.total)}</span>
          </div>
        </div>

        {/* Customer Notes Input Box */}
        <div className="mb-4 pt-4 border-t border-line">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MessageSquareIcon size={14} className="text-accent-500" />
            Your Comments or Change Requests
          </label>
          <textarea
            rows={2}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Need adjustments, have questions, or special requests regarding this quote?"
            className="w-full p-3 bg-surface border border-line rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
          />
        </div>

        {(quote.status === 'sent' || quote.status === 'negotiating') && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-line">
            <Button className="flex-1" onClick={() => handleAction('accepted')} disabled={updating}>
              <CheckIcon size={16} /> Accept Quote
            </Button>
            <Button variant="outline" className="flex-1 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20" onClick={() => handleAction('negotiating')} disabled={updating}>
              <MessageSquareIcon size={16} /> Request Changes
            </Button>
            <Button variant="outline" className="flex-1 text-red-500 hover:bg-red-50 hover:border-red-200" onClick={() => handleAction('rejected')} disabled={updating}>
              <XIcon size={16} /> Reject Quote
            </Button>
          </div>
        )}

        {quote.status === 'accepted' && (
          <div className="pt-4 border-t border-line space-y-3">
            <p className="text-sm font-semibold text-ink">Update Payment Status</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => handlePayment('pending')} disabled={updating || quote.paymentStatus === 'pending'}>
                Mark as Pending
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePayment('partial')} disabled={updating || quote.paymentStatus === 'partial'}>
                Mark as Partial Paid
              </Button>
              <Button size="sm" onClick={() => handlePayment('full')} disabled={updating || quote.paymentStatus === 'full'}>
                Mark as Fully Paid
              </Button>
            </div>
            {quote.paymentStatus && !quote.paymentConfirmedByAdmin && (
              <p className="text-xs text-muted mt-2 italic">Waiting for admin to confirm payment status.</p>
            )}
          </div>
        )}

        {quote.comments && (
          <div className="mt-4 p-3 bg-surface rounded-lg text-sm text-ink-soft italic">
            <strong>Admin Note:</strong> "{quote.comments}"
          </div>
        )}
      </div>

      {showPdf && (
        <QuoteDocumentPreview 
          booking={booking} 
          quoteData={{
            ...quote,
            taxAmount: (quote.subtotal * quote.salesTaxRate) / 100
          }} 
          onClose={() => setShowPdf(false)} 
        />
      )}
    </div>
  )
}
