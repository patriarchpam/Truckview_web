import { useState, useEffect } from 'react'
import { SendIcon, MegaphoneIcon, BellIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { formatShortDate } from '../../utils/format'

export function AdminNotifications() {
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('All Customers')
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchAdminNotifications = async () => {
    setLoading(true)
    let list: any[] = []
    try {
      const data = await api.getNotifications('admin-system')
      list = [...data]
    } catch {
      const stored = localStorage.getItem('notifications_admin-system')
      if (stored) list = JSON.parse(stored)
    }

    // Also check general admin notifications
    const storedFallback = localStorage.getItem('notifications_fallback_admin@truckview.com.ng')
    if (storedFallback) {
      const fallbacks = JSON.parse(storedFallback)
      const existingIds = new Set(list.map(n => n.id))
      fallbacks.forEach((f: any) => { if (!existingIds.has(f.id)) list.push(f) })
    }

    setNotifications(list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')))
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminNotifications()
  }, [])

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message to broadcast.')
      return
    }

    setSending(true)
    try {
      const customers = await api.getCustomers()
      let count = 0
      for (const cust of customers) {
        if (cust.id) {
          await api.createNotification(cust.id, 'Announcement from TruckView Admin', message, 'info')
          count++
        }
      }
      toast.success(`Broadcast sent successfully to ${count} customer(s)!`)
      setMessage('')
    } catch (err: any) {
      toast.error(`Broadcast failed: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead('admin-system')
      localStorage.removeItem('notifications_admin-system')
      toast.success('Admin notifications marked as read!')
      await fetchAdminNotifications()
    } catch {
      toast.success('Notifications marked as read!')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">System Notifications</h1>
          <p className="text-muted mt-1">Manage automated alerts, view system events, and send mass notifications.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={handleMarkAllRead} className="text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Broadcast */}
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <MegaphoneIcon size={20} className="text-accent-500" />
            Send Customer Broadcast
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Audience</label>
              <select 
                value={audience} 
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
              >
                <option>All Customers</option>
                <option>Active Bookings Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your announcement or alert here..."
                className="w-full px-4 py-3 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none"
              />
            </div>

            <button 
              onClick={handleSendBroadcast}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lift"
            >
              <SendIcon size={18} />
              {sending ? 'Sending Broadcast...' : 'Send Broadcast'}
            </button>
          </div>
        </div>

        {/* Live Admin Alert Feed */}
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-ink flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BellIcon size={20} className="text-accent-500" />
              Admin Activity Alerts
            </span>
            <span className="text-xs bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 px-2.5 py-1 rounded-full font-medium">
              {notifications.length} Alerts
            </span>
          </h2>

          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm border border-dashed border-line rounded-xl">
                No admin notifications yet.
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={n.id || i} className="p-3.5 bg-surface-2 rounded-xl border border-line flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BellIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-ink truncate">{n.title}</h4>
                      <span className="text-[10px] text-muted">{n.created_at ? formatShortDate(n.created_at) : 'Just now'}</span>
                    </div>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
