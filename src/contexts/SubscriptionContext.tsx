import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { api } from '../lib/api'
import type { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../types'

interface SubValue {
  plans: SubscriptionPlan[]
  current: UserSubscription
  loading: boolean
  canBook: boolean
  remainingBookings: number | null
  upgrade: (tier: SubscriptionTier) => Promise<void>
  refresh: () => Promise<void>
}

const SubscriptionContext = createContext<SubValue | null>(null)

const defaultSub: UserSubscription = {
  tier: 'free',
  bookingsUsed: 0,
  bookingsLimit: 3,
  renewsAt: '',
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plans] = useState<SubscriptionPlan[]>(api.getSubscriptionPlans())
  const [current, setCurrent] = useState<UserSubscription>(defaultSub)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setCurrent(await api.getSubscription())
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const upgrade = useCallback(async (tier: SubscriptionTier) => {
    setLoading(true)
    setCurrent(await api.updateSubscription(tier))
    setLoading(false)
  }, [])

  const canBook = current.bookingsLimit === null || current.bookingsUsed < current.bookingsLimit
  const remainingBookings = current.bookingsLimit === null ? null : current.bookingsLimit - current.bookingsUsed

  const value = useMemo(() => ({
    plans, current, loading, canBook, remainingBookings, upgrade, refresh,
  }), [plans, current, loading, canBook, remainingBookings, upgrade, refresh])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription(): SubValue {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider')
  return ctx
}
