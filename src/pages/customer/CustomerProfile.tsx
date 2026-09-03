import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { SaveIcon, UserIcon, MailIcon, PhoneIcon, LockIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'


export function CustomerProfile() {
  return (
    <Routes>
      <Route path="/" element={<PersonalInfoTab />} />
      <Route path="/security" element={<SecurityTab />} />
      <Route path="/preferences" element={<PreferencesTab />} />
    </Routes>
  )
}

function PersonalInfoTab() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.profileId) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', user.profileId)
          .single()
        if (!error && data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile', error)
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
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
        .eq('id', user.profileId)
      if (updateError) throw updateError
      await refreshUser()
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

function SecurityTab() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Account Security</h1>
        <p className="text-muted">Update your account credentials and security settings.</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card">
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="new-pass" className="block text-sm font-medium text-ink mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <LockIcon size={18} />
                </div>
                <input
                  type="password"
                  id="new-pass"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-pass" className="block text-sm font-medium text-ink mb-1.5">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <LockIcon size={18} />
                </div>
                <input
                  type="password"
                  id="confirm-pass"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <button
              type="submit"
              disabled={saving || !newPassword}
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <SaveIcon size={18} />
              )}
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PreferencesTab() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Preferences</h1>
        <p className="text-muted">Manage your dashboard interface settings and appearance.</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Theme Settings</h3>
            <p className="text-xs text-muted">Customize the color scheme of your TruckView dashboard.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-5 rounded-xl border-2 text-left transition-all ${theme === 'light'
                  ? 'border-accent-500 bg-accent-50/20 text-accent-700 ring-2 ring-accent-500/10'
                  : 'border-line hover:border-accent-300 bg-surface'
                }`}
            >
              <div className="text-lg mb-1.5">☀️</div>
              <div className="font-semibold text-sm text-ink">Light Mode</div>
              <div className="text-[11px] text-muted mt-1 leading-normal">Clean and bright view for daylight reading.</div>
            </button>

            <button
              type="button"
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-5 rounded-xl border-2 text-left transition-all ${theme === 'dark'
                  ? 'border-accent-500 bg-navy-950/20 text-accent-400 ring-2 ring-accent-500/10'
                  : 'border-line hover:border-accent-300 bg-surface'
                }`}
            >
              <div className="text-lg mb-1.5">🌙</div>
              <div className="font-semibold text-sm text-ink">Dark Mode</div>
              <div className="text-[11px] text-muted mt-1 leading-normal">Easy on the eyes, battery-efficient interface.</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
