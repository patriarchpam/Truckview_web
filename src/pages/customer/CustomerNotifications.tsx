import { useState, useEffect } from 'react'
import { BellIcon, CheckCircle2Icon, WrenchIcon, AlertCircleIcon, ShieldAlertIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { formatShortDate } from '../../utils/format'

const iconMap: Record<string, any> = {
  success: CheckCircle2Icon,
  warning: AlertCircleIcon,
  info: WrenchIcon,
  alert: ShieldAlertIcon
}

export function CustomerNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    if (!user?.profileId) return
    setLoading(true)
    let list: any[] = []
    try {
      const data = await api.getNotifications(user.profileId)
      list = [...data]
    } catch {
      // Local storage fallback
      const stored = localStorage.getItem(`notifications_${user.profileId}`)
      if (stored) {
        list = JSON.parse(stored)
      }
    }

    // Load any fallback notifications written locally during admin testing
    const fallbackKey = `notifications_fallback_${user.email.toLowerCase()}`
    const fallbackStored = localStorage.getItem(fallbackKey)
    if (fallbackStored) {
      const fallbackList = JSON.parse(fallbackStored)
      const existingIds = new Set(list.map(n => n.id))
      fallbackList.forEach((n: any) => {
        if (!existingIds.has(n.id)) {
          list.push(n)
        }
      })
    }

    setNotifications(list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')))
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const handleMarkAllRead = async () => {
    if (!user?.profileId) return
    try {
      await api.markNotificationsRead(user.profileId)
      toast.success('All notifications marked as read!')
    } catch {
      const stored = localStorage.getItem(`notifications_${user.profileId}`)
      if (stored) {
        const data = JSON.parse(stored).map((n: any) => ({ ...n, read: true }))
        localStorage.setItem(`notifications_${user.profileId}`, JSON.stringify(data))
      }
    }
    
    // Clear local storage fallback alerts
    const fallbackKey = `notifications_fallback_${user.email.toLowerCase()}`
    localStorage.removeItem(fallbackKey)
    toast.success('Notifications cleared!')
    await loadNotifications()
  }

  if (!user) return null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-muted mt-1">Stay updated with real-time alerts about your bookings.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={handleMarkAllRead} className="text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted text-sm">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellIcon size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted text-sm">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {notifications.map((notif) => {
              const Icon = iconMap[notif.type] || BellIcon
              const colorClass = 
                notif.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' : 
                notif.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : 
                'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'

              return (
                <div key={notif.id} className={`p-5 flex gap-4 hover:bg-surface-2/30 transition-colors ${!notif.read ? 'bg-accent-50/5 dark:bg-accent-950/5 border-l-2 border-accent-500' : ''}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <h4 className={`font-semibold text-ink text-sm ${!notif.read ? 'font-bold text-accent-600' : ''}`}>{notif.title}</h4>
                      <span className="text-xs text-muted whitespace-nowrap">{formatShortDate(notif.created_at || notif.date || new Date().toISOString())}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
