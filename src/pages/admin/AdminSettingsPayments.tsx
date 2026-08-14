import { CreditCardIcon, LandmarkIcon, PercentIcon } from 'lucide-react'

export function AdminSettingsPayments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Payment Configuration</h2>
        <p className="text-muted text-sm mt-1">Configure payment gateways, taxes, and platform fees.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Gateway Config */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <CreditCardIcon size={20} className="text-accent-500" />
            <h3 className="font-semibold text-ink">Payment Gateways</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-line rounded-xl bg-surface-2">
              <div>
                <div className="font-medium text-ink">Paystack</div>
                <div className="text-xs text-muted">Primary processor</div>
              </div>
              <button className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Active</button>
            </div>
            <div className="flex items-center justify-between p-3 border border-line rounded-xl">
              <div>
                <div className="font-medium text-ink">Flutterwave</div>
                <div className="text-xs text-muted">Backup processor</div>
              </div>
              <button className="text-sm font-medium text-muted bg-surface-2 px-2 py-1 rounded">Configure</button>
            </div>
          </div>
        </div>

        {/* Taxes & Fees */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <PercentIcon size={20} className="text-accent-500" />
            <h3 className="font-semibold text-ink">Taxes & Platform Fees</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">VAT Rate (%)</label>
              <input type="number" defaultValue={7.5} className="w-full px-3 py-2 bg-surface border border-line rounded-lg text-ink focus:ring-2 focus:ring-accent-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Platform Fee (%)</label>
              <input type="number" defaultValue={5.0} className="w-full px-3 py-2 bg-surface border border-line rounded-lg text-ink focus:ring-2 focus:ring-accent-500/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
