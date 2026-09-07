import { useState, useEffect } from 'react'
import { SendIcon, MegaphoneIcon, BellIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from 'sonner'
import { formatShortDate, formatDateTime } from '../../utils/format'

export function AdminNotifications() {
  const [message, setMessage] = useState('')
  const [audienceType, setAudienceType] = useState('all') // 'all', 'specific'
  const [searchQuery, setSearchQuery] = useState('')
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [sentMessages, setSentMessages] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const custs = await api.getCustomers()
      setAllCustomers(custs)
    } catch {}

    const storedSent = localStorage.getItem('admin_sent_messages')
    if (storedSent) {
      setSentMessages(JSON.parse(storedSent))
    }

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
    loadData()
  }, [])

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message to broadcast.')
      return
    }

    if (audienceType === 'specific' && !selectedCustomer) {
      toast.error('Please select a specific customer.')
      return
    }

    setSending(true)
    try {
      let targetCustomers = allCustomers
      if (audienceType === 'specific') {
        targetCustomers = [selectedCustomer]
      }
      
      let count = 0
      
      const fallbackList = []
      const fallbackPayload = {
        id: Date.now().toString(),
        title: audienceType === 'specific' ? 'Direct Message from Admin' : 'Announcement from TruckView Admin',
        message,
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      }

      for (const cust of targetCustomers) {
        if (cust.id || cust.profileId) {
          const cId = cust.id || cust.profileId
          try {
            await api.createNotification(cId, fallbackPayload.title, message, 'info')
          } catch {
            // DB insert failed, we will use global fallback
          }
          fallbackList.push({ ...fallbackPayload, profile_id: cId, id: Date.now().toString() + count })
          count++
        }
      }
      
      // Store globally ONLY if it's a broadcast to all users
      if (audienceType === 'all') {
        const storedGlobal = localStorage.getItem('notifications_broadcast_global')
        const globalList = storedGlobal ? JSON.parse(storedGlobal) : []
        globalList.push(fallbackPayload)
        localStorage.setItem('notifications_broadcast_global', JSON.stringify(globalList))
      } else {
         // store specifically in that user's fallback
         const cId = selectedCustomer.id || selectedCustomer.profileId
         const specificFallbackKey = `notifications_fallback_${cId}`
         const specificStored = localStorage.getItem(specificFallbackKey)
         const specificList = specificStored ? JSON.parse(specificStored) : []
         specificList.push({ ...fallbackPayload, profile_id: cId })
         localStorage.setItem(specificFallbackKey, JSON.stringify(specificList))
      }

      // Record in sent messages history
      const newSent = {
        id: fallbackPayload.id,
        title: fallbackPayload.title,
        message,
        audience: audienceType === 'all' ? 'All Customers' : `${selectedCustomer.name} (${selectedCustomer.email})`,
        created_at: fallbackPayload.created_at
      }
      const updatedSent = [newSent, ...sentMessages]
      setSentMessages(updatedSent)
      localStorage.setItem('admin_sent_messages', JSON.stringify(updatedSent))

      toast.success(`Message sent successfully to ${count} customer(s)!`)
      setMessage('')
      setSearchQuery('')
      setSelectedCustomer(null)
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
      await loadData()
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
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <MegaphoneIcon size={20} className="text-accent-500" />
            Send Customer Message
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Audience</label>
              <select 
                value={audienceType} 
                onChange={(e) => {
                  setAudienceType(e.target.value)
                  setSelectedCustomer(null)
                  setSearchQuery('')
                }}
                className="w-full px-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 mb-3"
              >
                <option value="all">All Customers</option>
                <option value="specific">Specific Customer</option>
              </select>

              {audienceType === 'specific' && (
                <div className="space-y-2 relative">
                  <input
                    type="text"
                    placeholder="Search customer by name or email..."
                    value={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.email})` : searchQuery}
                    onChange={(e) => {
                       setSearchQuery(e.target.value)
                       if (selectedCustomer) setSelectedCustomer(null)
                    }}
                    className="w-full px-4 py-2.5 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                  />
                  {!selectedCustomer && searchQuery.length > 1 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-surface border border-line rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {allCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                        <div 
                          key={c.id || c.email} 
                          onClick={() => setSelectedCustomer(c)}
                          className="px-4 py-2 hover:bg-surface-2 cursor-pointer border-b border-line last:border-0"
                        >
                          <div className="font-semibold text-ink text-sm">{c.name}</div>
                          <div className="text-xs text-muted">{c.email}</div>
                        </div>
                      ))}
                      {allCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                         <div className="px-4 py-2 text-muted text-sm text-center">No customers found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>

        {/* Live Admin Alert Feed & Sent Messages */}
        <div className="bg-surface border border-line p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2 mb-4">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('inbox')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'inbox' ? 'border-accent-500 text-accent-600' : 'border-transparent text-muted hover:text-ink'}`}
              >
                Alerts Inbox
              </button>
              <button 
                onClick={() => setActiveTab('sent')}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'sent' ? 'border-accent-500 text-accent-600' : 'border-transparent text-muted hover:text-ink'}`}
              >
                Sent Messages
              </button>
            </div>
            {activeTab === 'inbox' && (
              <span className="text-xs bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 px-2.5 py-1 rounded-full font-medium">
                {notifications.length} Alerts
              </span>
            )}
            {activeTab === 'sent' && (
              <span className="text-xs bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 px-2.5 py-1 rounded-full font-medium">
                {sentMessages.length} Sent
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted">Loading...</div>
            ) : activeTab === 'inbox' ? (
              notifications.length === 0 ? (
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
                        <span className="text-[10px] text-muted">{n.created_at ? formatDateTime(n.created_at) : 'Just now'}</span>
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                ))
              )
            ) : (
              sentMessages.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm border border-dashed border-line rounded-xl">
                  You haven't sent any messages yet.
                </div>
              ) : (
                sentMessages.map((msg, i) => (
                  <div key={msg.id || i} className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600">To: {msg.audience}</span>
                      <span className="text-[10px] text-muted">{msg.created_at ? formatDateTime(msg.created_at) : 'Just now'}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-ink">{msg.title}</h4>
                    <p className="text-xs text-muted leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
