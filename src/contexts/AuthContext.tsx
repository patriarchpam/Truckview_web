import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { api } from '../lib/api'

interface AdminUser { name: string; email: string }
interface AuthValue {
  user: AdminUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)
const STORAGE_KEY = 'truckview-admin'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored) as AdminUser) } catch { window.sessionStorage.removeItem(STORAGE_KEY) }
    }
    setReady(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const account = await api.login(email, password)
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(account))
    setUser(account)
  }, [])

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
