import { CreditCardIcon, DownloadIcon, FileTextIcon } from 'lucide-react'

const MOCK_INVOICES = [
  { id: 'INV-2026-0089', date: 'Oct 12, 2026', amount: '₦ 35,000', service: 'General Maintenance', status: 'Paid' },
  { id: 'INV-2026-0042', date: 'Sep 05, 2026', amount: '₦ 120,000', service: 'Transmission Repair', status: 'Paid' },
  { id: 'INV-2026-0012', date: 'Jul 22, 2026', amount: '₦ 45,000', service: 'Brake Pad Replacement', status: 'Paid' },
]

export function CustomerPayments() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments & Invoices</h1>
        <p className="text-muted mt-1">View your transaction history and manage payment methods.</p>
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
          <button className="text-sm font-medium text-accent-600 hover:text-accent-700">
            + Add Payment Method
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-4">Invoice History</h2>
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2/50 text-muted text-sm border-b border-line">
                  <th className="p-4 font-medium">Invoice</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b border-line last:border-0 hover:bg-surface-2/30">
                    <td className="p-4 font-medium text-ink flex items-center gap-2">
                      <FileTextIcon size={16} className="text-muted" />
                      {inv.id}
                    </td>
                    <td className="p-4 text-muted">{inv.date}</td>
                    <td className="p-4 text-ink-soft">{inv.service}</td>
                    <td className="p-4 font-medium text-ink">{inv.amount}</td>
                    <td className="p-4 text-right">
                      <button className="text-accent-600 hover:text-accent-700 font-medium inline-flex items-center gap-1 text-sm">
                        <DownloadIcon size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
