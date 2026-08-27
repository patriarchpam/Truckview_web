import { useState, useEffect } from 'react'
import { CreditCardIcon, DownloadIcon, FileTextIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../contexts/StoreContext'
import { api } from '../../lib/api'
import { formatPrice } from '../../utils/format'
import { QuoteDocumentPreview } from '../../components/admin/QuoteDocumentPreview'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'

export function CustomerPayments() {
  const { user } = useAuth()
  const { bookings, services } = useStore()
  
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchInvoices = async () => {
      setLoading(true)
      const myBookings = bookings.filter(b => b.customer.email.toLowerCase() === user.email.toLowerCase())
      const invoiceList: any[] = []
      
      await Promise.all(myBookings.map(async (b) => {
        try {
          const quote = await api.getQuoteByBookingId(b.id)
          if (quote) {
            // Deriving Invoice status: Completed booking -> Paid. Otherwise, if quote is accepted -> Unpaid.
            const status = b.status === 'completed' ? 'Paid' : quote.status === 'accepted' ? 'Unpaid' : null
            if (status) {
              const sNames = services.filter(sv => (b.serviceIds || []).includes(sv.id)).map(s => s.name).join(', ')
              invoiceList.push({
                id: quote.quotationNumber,
                bookingId: b.id,
                booking: b,
                quote: quote,
                date: quote.date,
                amount: quote.total,
                service: sNames || 'General Service',
                status: status
              })
            }
          }
        } catch (e) {
          console.warn("Failed to fetch quote for booking:", b.id)
        }
      }))
      
      setInvoices(invoiceList.sort((a, b) => b.date.localeCompare(a.date)))
      setLoading(false)
    }
    
    fetchInvoices()
  }, [user, bookings, services])

  const handleUpdatePayment = async (inv: any, status: 'pending' | 'partial' | 'full') => {
    try {
      await api.saveQuote({ ...inv.quote, paymentStatus: status, paymentConfirmedByAdmin: false })
      toast.success('Payment status updated')
      // re-fetch or update local state
      setInvoices(invoices.map(i => i.id === inv.id ? { 
        ...i, 
        quote: { ...i.quote, paymentStatus: status, paymentConfirmedByAdmin: false } 
      } : i))
    } catch (err) {
      toast.error('Failed to update payment status')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments & Invoices</h1>
        <p className="text-muted mt-1">View your transaction history and download invoices.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-4">Payment Methods</h2>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 bg-surface-2 rounded flex items-center justify-center border border-line">
                <CreditCardIcon size={24} className="text-muted" />
              </div>
              <div>
                <p className="font-medium text-ink">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted">Expires 12/28</p>
              </div>
            </div>
            <span className="text-xs font-medium bg-accent-50 text-accent-700 px-2 py-1 rounded">Default</span>
          </div>
          <button 
            className="text-sm font-medium text-accent-600 hover:text-accent-700"
            onClick={() => toast.info('Adding payment methods will be supported soon.')}
          >
            + Add Payment Method
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-4">Invoice History</h2>
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-muted">Loading invoice list...</div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted">No invoices found. Complete quotes will appear here.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-2/50 text-muted text-sm border-b border-line">
                    <th className="p-4 font-medium">Invoice</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Service</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-line last:border-0 hover:bg-surface-2/30">
                      <td className="p-4 font-medium text-ink flex items-center gap-2">
                        <FileTextIcon size={16} className="text-accent-500" />
                        {inv.id}
                      </td>
                      <td className="p-4 text-muted">{inv.date}</td>
                      <td className="p-4 text-ink-soft">{inv.service}</td>
                      <td className="p-4 font-bold text-ink">{formatPrice(inv.amount)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          inv.status === 'Paid'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {inv.quote.status === 'accepted' && (
                            <div className="flex items-center gap-2">
                              {(!inv.quote.paymentStatus || inv.quote.paymentStatus === 'unpaid') ? (
                                <>
                                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleUpdatePayment(inv, 'partial')}>Pay Partial</Button>
                                  <Button size="sm" className="h-7 text-xs" onClick={() => handleUpdatePayment(inv, 'full')}>Pay Full</Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted italic">
                                  {inv.quote.paymentConfirmedByAdmin ? 'Payment Confirmed' : `Pending ${inv.quote.paymentStatus} confirmation`}
                                </span>
                              )}
                            </div>
                          )}
                          <button onClick={() => setSelectedInvoice(inv)} className="text-accent-600 hover:text-accent-700 font-semibold inline-flex items-center gap-1 text-sm">
                            <DownloadIcon size={14} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {selectedInvoice && (
        <QuoteDocumentPreview 
          booking={selectedInvoice.booking} 
          quoteData={{
            ...selectedInvoice.quote,
            taxAmount: (selectedInvoice.quote.subtotal * selectedInvoice.quote.salesTaxRate) / 100
          }} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  )
}
