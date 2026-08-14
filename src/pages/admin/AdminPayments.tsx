import { TrendingUpIcon, DownloadIcon, DollarSignIcon, ClockIcon } from 'lucide-react'

const MOCK_TRANSACTIONS = [
  { id: 'TXN-9091', date: 'Oct 14, 2026', customer: 'Adaeze Okafor', amount: '₦ 35,000', method: 'Card', status: 'Completed' },
  { id: 'TXN-9090', date: 'Oct 13, 2026', customer: 'Michael Adeyemi', amount: '₦ 85,000', method: 'Bank Transfer', status: 'Pending' },
  { id: 'TXN-9089', date: 'Oct 12, 2026', customer: 'Grace Nwosu', amount: '₦ 45,000', method: 'Card', status: 'Completed' },
  { id: 'TXN-9088', date: 'Oct 10, 2026', customer: 'Samuel Eze', amount: '₦ 120,000', method: 'Card', status: 'Completed' },
]

export function AdminPayments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Payments & Revenue</h1>
        <p className="text-muted mt-1">Track revenue, manage payouts, and view invoice history.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 text-muted mb-2">
            <DollarSignIcon size={20} />
            <h3 className="font-medium">Total Revenue (This Month)</h3>
          </div>
          <div className="text-3xl font-bold text-ink mb-2">₦ 2,450,000</div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUpIcon size={16} />
            +12.5% from last month
          </div>
        </div>
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 text-muted mb-2">
            <ClockIcon size={20} />
            <h3 className="font-medium">Pending Payments</h3>
          </div>
          <div className="text-3xl font-bold text-ink mb-2">₦ 345,000</div>
          <div className="text-sm text-muted">Across 8 invoices</div>
        </div>
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 text-muted mb-2">
            <DownloadIcon size={20} />
            <h3 className="font-medium">Ready for Payout</h3>
          </div>
          <div className="text-3xl font-bold text-ink mb-3">₦ 1,800,000</div>
          <button className="w-full py-2 bg-accent-50 text-accent-700 font-medium rounded-lg hover:bg-accent-100 transition-colors">
            Initiate Payout
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-card">
        <div className="p-5 border-b border-line flex justify-between items-center">
          <h2 className="font-semibold text-lg text-ink">Recent Transactions</h2>
          <button className="text-sm font-medium text-accent-600 hover:text-accent-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-muted text-sm">
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {MOCK_TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="border-b border-line hover:bg-surface-2/30">
                  <td className="p-4 font-medium text-ink">{txn.id}</td>
                  <td className="p-4 text-muted">{txn.date}</td>
                  <td className="p-4 text-ink">{txn.customer}</td>
                  <td className="p-4 text-muted">{txn.method}</td>
                  <td className="p-4 font-medium text-ink">{txn.amount}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border
                      ${txn.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
