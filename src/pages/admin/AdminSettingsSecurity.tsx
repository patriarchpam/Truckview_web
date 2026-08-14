import { ShieldCheckIcon, KeyIcon, LockIcon } from 'lucide-react'

export function AdminSettingsSecurity() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-ink">Security Settings</h2>
        <p className="text-muted text-sm mt-1">Configure 2FA, password policies, and session limits.</p>
      </div>

      <div className="space-y-6">
        {/* 2FA */}
        <div className="bg-surface border border-line p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon size={24} className="text-accent-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-ink mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-muted">Require all admin users to use 2FA to access the dashboard.</p>
            </div>
          </div>
          <button className={`w-12 h-6 rounded-full relative transition-colors bg-accent-500 shrink-0`}>
            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform translate-x-6`} />
          </button>
        </div>

        {/* Password Policy */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <KeyIcon size={20} className="text-muted" />
            <h3 className="font-semibold text-ink">Password Policy</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-ink">Require minimum 12 characters</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-ink">Require numbers and special characters</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-ink">Force password reset every 90 days</span>
            </label>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-surface border border-line p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <LockIcon size={20} className="text-muted" />
            <h3 className="font-semibold text-ink">Session Management</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Idle Session Timeout</label>
            <select className="w-full max-w-xs px-3 py-2 bg-surface border border-line rounded-lg text-ink focus:ring-2 focus:ring-accent-500/20">
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>4 Hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
