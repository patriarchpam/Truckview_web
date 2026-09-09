import { useState, useEffect, useRef } from 'react'
import { BellIcon, CheckCircle2Icon, WrenchIcon, AlertCircleIcon, ShieldAlertIcon, XIcon, SendIcon, ReplyIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { api } from '../../lib/api'
import { formatDateTime } from '../../utils/format'
import { ReactionPicker } from '../../components/chat/ReactionPicker'
import { toast } from 'sonner'

const iconMap: Record<string, any> = {
  success: CheckCircle2Icon,
  warning: AlertCircleIcon,
  info: WrenchIcon,
  alert: ShieldAlertIcon
}

export function CustomerNotifications() {
  const { user } = useAuth()
  const { refreshUnread } = useNotificationContext()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'chat' | 'alerts' | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)

  const cleanMessagePreview = (msg: string) => {
    if (!msg) return ''
    if (msg.startsWith('>REPLY_TO:')) {
       return msg.split('\n\n').slice(1).join('\n\n')
    }
    return msg
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !user) return
    setSendingReply(true)
    try {
      const title = `Message from ${user.name}`
      let body = replyMessage
      if (replyingTo) {
         let replyText = replyingTo.message
         if (replyText.startsWith('>REPLY_TO:')) {
           replyText = replyText.split('\n\n').slice(1).join('\n\n')
         }
         body = `>REPLY_TO:${replyingTo.id}|${replyText.substring(0, 50).replace(/\n/g, ' ')}...\n\n${replyMessage}`
      }
      
      const tempId = `temp-${Date.now()}`
      const newMsg = {
         id: tempId,
         title,
         message: body,
         type: 'info',
         profile_id: '00000000-0000-0000-0000-000000000000',
         sender_id: user.profileId,
         created_at: new Date().toISOString(),
         status: 'sent',
         read: false,
         notification_reactions: []
      }
      setNotifications(prev => [...prev, newMsg])
      setReplyMessage('')
      setReplyingTo(null)
      
      const createdNotif = await api.createNotification('00000000-0000-0000-0000-000000000000', title, body, 'info', user.profileId)
      
      // Update local storage for sent messages history only if it's a fallback ID
      // or just use the same ID so that existingIds deduplication handles it correctly.
      const fallbackKey = `notifications_fallback_${user.profileId}`
      const stored = localStorage.getItem(fallbackKey)
      const list = stored ? JSON.parse(stored) : []
      // Use the ID returned by createNotification to ensure it is deduplicated by loadNotifications
      list.push({ id: createdNotif.id || Date.now().toString(), title, message: body, type: 'info', read: true, created_at: new Date().toISOString(), profile_id: '00000000-0000-0000-0000-000000000000', sender_id: user.profileId })
      localStorage.setItem(fallbackKey, JSON.stringify(list))

      toast.success('Message sent!')
      loadNotifications()
    } catch (err: any) {
      toast.error(`Failed to send reply: ${err.message}`)
    } finally {
      setSendingReply(false)
    }
  }

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
    const fallbackKey = `notifications_fallback_${user.profileId}`
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

    // Load global broadcast notifications
    const globalStored = localStorage.getItem('notifications_broadcast_global')
    if (globalStored) {
      const globalList = JSON.parse(globalStored)
      const existingIds = new Set(list.map(n => n.id))
      globalList.forEach((n: any) => {
        if (!existingIds.has(n.id)) {
          list.push({ ...n, profile_id: user.profileId })
        }
      })
    }

    setNotifications(list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')))
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
    
    const handleRefresh = () => loadNotifications()
    window.addEventListener('refresh_notifications', handleRefresh)

    // Poll every 10 seconds for new notifications
    const interval = setInterval(() => {
      loadNotifications()
    }, 10000)

    return () => {
      window.removeEventListener('refresh_notifications', handleRefresh)
      clearInterval(interval)
    }
  }, [user])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (selectedView === 'chat') {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [notifications, selectedView])

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
    const fallbackKey = `notifications_fallback_${user.profileId}`
    localStorage.removeItem(fallbackKey)
    toast.success('Notifications cleared!')
    await loadNotifications()
    await refreshUnread()
  }

  if (!user) return null

  const chatMessages = notifications.filter(n => n.title?.includes('Message from') || n.title?.includes('Direct Message') || n.title === 'Reply Sent to Admin')
  const alertMessages = notifications.filter(n => !chatMessages.includes(n))

  const unreadChatCount = chatMessages.filter(n => !n.read && n.profile_id === user.profileId).length
  const unreadAlertCount = alertMessages.filter(n => !n.read && (n.profile_id === user.profileId || n.profile_id === null)).length

  const latestChat = chatMessages.length > 0 ? chatMessages[0] : null
  const latestAlert = alertMessages.length > 0 ? alertMessages[0] : null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">Stay updated with real-time alerts about your bookings.</p>
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
        ) : (
          <div className="divide-y divide-line">
            {/* Direct Messages Row */}
            <div 
              onClick={() => {
                setSelectedView('chat')
                // Mark all chat messages as read
                const unreadInThread = chatMessages.filter(n => !n.read && n.profile_id === user.profileId)
                if (unreadInThread.length > 0) {
                  unreadInThread.forEach(n => {
                    if (n.id) api.updateNotificationStatus(n.id, 'read').catch(() => {})
                  })
                  setNotifications(prev => prev.map(n => 
                    (n.title?.includes('Message from') || n.title?.includes('Direct Message') || n.title === 'Reply Sent to Admin') && n.profile_id === user.profileId && !n.read
                    ? { ...n, read: true, status: 'read' } : n
                  ))
                  refreshUnread()
                }
              }}
              className={`p-5 flex gap-4 hover:bg-surface-2/30 cursor-pointer transition-colors ${unreadChatCount > 0 ? 'bg-accent-50/5 dark:bg-accent-950/5 border-l-2 border-accent-500' : ''}`}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                <SendIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h4 className={`font-semibold text-ink text-sm ${unreadChatCount > 0 ? 'font-bold text-accent-600' : ''}`}>Direct Messages</h4>
                  <span className="text-xs text-muted whitespace-nowrap">{latestChat ? formatDateTime(latestChat.created_at || new Date().toISOString()) : ''}</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-1">{latestChat ? latestChat.message : 'No messages yet'}</p>
                {unreadChatCount > 0 && (
                  <span className="mt-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold bg-accent-500 text-white rounded-full">
                    {unreadChatCount} new
                  </span>
                )}
              </div>
            </div>

            {/* Alerts Row */}
            <div 
              onClick={() => {
                setSelectedView('alerts')
                // Mark all alerts as read
                const unreadAlerts = alertMessages.filter(n => !n.read && (n.profile_id === user.profileId || n.profile_id === null))
                if (unreadAlerts.length > 0) {
                  unreadAlerts.forEach(n => {
                    if (n.id) api.updateNotificationStatus(n.id, 'read').catch(() => {})
                  })
                  setNotifications(prev => prev.map(n => 
                    !(n.title?.includes('Message from') || n.title?.includes('Direct Message') || n.title === 'Reply Sent to Admin') && (n.profile_id === user.profileId || n.profile_id === null) && !n.read
                    ? { ...n, read: true, status: 'read' } : n
                  ))
                  refreshUnread()
                }
              }}
              className={`p-5 flex gap-4 hover:bg-surface-2/30 cursor-pointer transition-colors ${unreadAlertCount > 0 ? 'bg-amber-50/5 dark:bg-amber-950/5 border-l-2 border-amber-500' : ''}`}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <BellIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h4 className={`font-semibold text-ink text-sm ${unreadAlertCount > 0 ? 'font-bold text-amber-600' : ''}`}>System Alerts & Announcements</h4>
                  <span className="text-xs text-muted whitespace-nowrap">{latestAlert ? formatDateTime(latestAlert.created_at || new Date().toISOString()) : ''}</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-1">{latestAlert ? latestAlert.message : 'No alerts yet'}</p>
                {unreadAlertCount > 0 && (
                  <span className="mt-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {unreadAlertCount} new
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm" onClick={() => setSelectedView(null)}>
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400`}>
                  {selectedView === 'chat' ? <SendIcon size={16} /> : <BellIcon size={16} />}
                </div>
                <h3 className="font-semibold text-ink">{selectedView === 'chat' ? 'Direct Messages' : 'Alerts & Announcements'}</h3>
              </div>
              <button onClick={() => setSelectedView(null)} className="p-1.5 text-muted hover:text-ink hover:bg-surface-2 rounded-lg transition-colors">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="p-0 overflow-hidden flex-1 flex flex-col bg-canvas/30">
              {selectedView === 'chat' ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted p-8 text-sm">No messages yet. Start a conversation!</div>
                    ) : (
                      chatMessages.map(msg => {
                        const isMine = msg.sender_id === user.profileId
                        const statusColor = msg.status === 'read' ? 'text-blue-500' : 'text-muted'
                        
                        // Clean up legacy message text if it has the Customer Email suffix
                        let displayMessage = msg.message || ''
                        if (displayMessage.includes('---') && displayMessage.includes('Customer Email:')) {
                           displayMessage = displayMessage.split('---')[0].trim()
                        }
                        
                        let replyBlock = null
                        if (displayMessage.startsWith('>REPLY_TO:')) {
                          const parts = displayMessage.split('\n\n')
                          const header = parts[0]
                          displayMessage = parts.slice(1).join('\n\n')
                          const quotedText = header.split('|').slice(1).join('|')
                          replyBlock = (
                            <div className={`p-2 rounded text-xs mb-1 border-l-2 border-accent-500 opacity-80 line-clamp-1 ${isMine ? 'bg-black/10 text-white' : 'bg-surface-2 text-ink-soft'}`}>
                              {quotedText}
                            </div>
                          )
                        }
                        
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-accent-500 text-white rounded-br-sm' : 'bg-surface border border-line text-ink rounded-bl-sm shadow-sm'}`}>
                              {replyBlock}
                              <p className={`text-sm ${isMine ? 'text-white' : 'text-ink'} whitespace-pre-wrap`}>{displayMessage}</p>
                              <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isMine ? 'text-white/70 justify-end' : 'text-muted justify-start'}`}>
                                <span>{formatDateTime(msg.created_at || new Date().toISOString())}</span>
                                {isMine && (
                                  <span className={statusColor}>
                                    {msg.status === 'sent' && '✓'}
                                    {msg.status === 'delivered' && '✓✓'}
                                    {msg.status === 'read' && '✓✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'} w-full px-2 mt-1`}>
                              {!isMine && <ReactionPicker notificationId={msg.id} reactions={msg.notification_reactions || []} />}
                              <button onClick={() => setReplyingTo(msg)} className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-ink transition-opacity rounded-full hover:bg-surface-2">
                                <ReplyIcon size={14} />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 bg-surface border-t border-line">
                    {replyingTo && (
                      <div className="bg-surface-2 border-l-4 border-accent-500 p-2 text-xs text-muted mb-2 flex justify-between items-center rounded-r-lg">
                         <span className="line-clamp-1 text-ink">
                           <span className="font-semibold mr-1">Replying to:</span> 
                           {replyingTo.message.startsWith('>REPLY_TO:') ? replyingTo.message.split('\n\n').slice(1).join('\n\n') : replyingTo.message}
                         </span>
                         <button onClick={() => setReplyingTo(null)} className="hover:text-ink"><XIcon size={14}/></button>
                      </div>
                    )}
                    <div className="relative">
                      <textarea 
                        rows={2}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none shadow-inner"
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyMessage.trim()}
                        className="absolute right-2 bottom-2 p-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg transition-colors shadow-lift"
                      >
                        <SendIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4 h-full overflow-y-auto">
                  {alertMessages.length === 0 ? (
                    <div className="text-center text-muted p-8 text-sm">No alerts yet.</div>
                  ) : (
                    alertMessages.map(notif => {
                      const Icon = iconMap[notif.type] || BellIcon
                      const colorClass = 
                        notif.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' : 
                        notif.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' : 
                        'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'

                      return (
                        <div key={notif.id} className="p-5 flex gap-4 bg-surface rounded-xl border border-line">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className="font-semibold text-ink text-sm">{notif.title}</h4>
                              <span className="text-xs text-muted whitespace-nowrap">{formatDateTime(notif.created_at || notif.date || new Date().toISOString())}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{cleanMessagePreview(notif.message)}</p>
                            <ReactionPicker notificationId={notif.id} reactions={notif.notification_reactions || []} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
