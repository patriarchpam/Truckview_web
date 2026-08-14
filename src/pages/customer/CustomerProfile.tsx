import { useEffect, useState } from 'react'
import { SaveIcon, UserIcon, MailIcon, PhoneIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import { toast } from 'sonner'

export function CustomerProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  })

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.profileId) return
      try {
        setLoading(true)
        const customers = await api.getCustomers()
        const customer = customers.find(c => c.id === user.profileId)
        if (customer) {
          setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || ''
          })
        }
      } catch (error) {
        console.error("Error fetching profile", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.profileId) return
    
    try {
      setSaving(true)
      await api.updateCustomer(user.profileId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Profile</h1>
        <p className="text-muted">Manage your personal information and contact details.</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <MailIcon size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <PhoneIcon size={18} />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                  placeholder="0803 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <SaveIcon size={18} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
