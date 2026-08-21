import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

interface AppUser { name: string; email: string; role: 'admin' | 'customer'; profileId?: string }
interface AuthValue {
  user: AppUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (customer: { name: string; email: string; phone: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [ready, setReady] = useState(false)

  const resolveUser = async (userObj: any) => {
    try {
      const u = await api.getCurrentUser(userObj)
      setUser(u)
    } catch {
      setUser({ name: 'Admin', email: userObj.email, role: 'admin' }) // fallback
    }
  }

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await resolveUser(session.user)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        resolveUser(session.user).finally(() => setReady(true))
      } else {
        setReady(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        resolveUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email, password)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    await api.loginWithGoogle()
  }, [])

  const signup = useCallback(async (customer: { name: string; email: string; phone: string; password: string }) => {
    await api.customerSignup(customer)
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, login, loginWithGoogle, signup, logout, refreshUser }), [user, ready, login, loginWithGoogle, signup, logout, refreshUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
