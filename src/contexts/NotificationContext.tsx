import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

interface NotificationContextValue {
  unreadCount: number
  refreshUnread: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = useCallback(async () => {
    if (!ready || !user) {
      setUnreadCount(0)
      return
    }
    
    try {
      const profileId = user.role === 'admin' ? '00000000-0000-0000-0000-000000000000' : user.profileId
      if (!profileId) return
      
      const data = await api.getNotifications(profileId)
      const count = data.filter(n => !n.read && (n.profile_id === profileId || n.profile_id === null)).length
      setUnreadCount(count)
    } catch {
      // Fallback
      try {
        const stored = localStorage.getItem(`notifications_${user.role === 'admin' ? '00000000-0000-0000-0000-000000000000' : user.profileId}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          const fallbackProfileId = user.role === 'admin' ? '00000000-0000-0000-0000-000000000000' : user.profileId
          setUnreadCount(parsed.filter((n: any) => !n.read && (n.profile_id === fallbackProfileId || n.profile_id === null)).length)
        }
      } catch {}
    }
  }, [user, ready])

  useEffect(() => {
    refreshUnread()
    
    // Poll every 30s to keep it updated just in case
    const interval = setInterval(refreshUnread, 30000)
    return () => clearInterval(interval)
  }, [refreshUnread])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}
