import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LockIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { toast } from 'sonner'

export function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Truck-View" className="mx-auto h-16 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink">Admin Login</h1>
          <p className="text-sm text-muted mt-1">Sign in to manage your workshop</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 lg:p-8 shadow-card space-y-5">
          <Field label="Email" required htmlFor="login-email">
            <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@truckview.com" />
          </Field>
          <Field label="Password" required htmlFor="login-password">
            <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Button type="submit" disabled={loading} className="w-full justify-center">
            <LockIcon size={16} /> {loading ? 'Signing in…' : 'Sign In'}
          </Button>
          <p className="text-xs text-center text-muted">Demo: truckviewent@gmail.com / truckview</p>
        </form>
      </motion.div>
    </div>
  )
}
