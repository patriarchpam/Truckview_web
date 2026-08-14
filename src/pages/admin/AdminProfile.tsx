import { useState } from 'react'
import { SaveIcon, UserIcon, MailIcon, ShieldIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

export function AdminProfile() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin',
    email: user?.email || 'admin@truckview.com',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Admin profile updated (Mock)')
    }, 800)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Profile</h1>
        <p className="text-muted">Manage your personal admin account settings.</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center border-2 border-accent-100">
              <ShieldIcon size={28} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-ink">Super Administrator</h3>
              <p className="text-sm text-muted">Full system access</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <MailIcon size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lift disabled:opacity-50"
            >
              <SaveIcon size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
