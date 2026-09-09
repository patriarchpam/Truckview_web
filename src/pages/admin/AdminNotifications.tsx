import { useState, useEffect, useRef } from 'react'
import { SendIcon, MegaphoneIcon, BellIcon, XIcon, ReplyIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { toast } from 'sonner'
import { formatDateTime } from '../../utils/format'
import { ReactionPicker } from '../../components/chat/ReactionPicker'

export function AdminNotifications() {
  const { refreshUnread } = useNotificationContext()
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
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<any>(null)

  const cleanMessagePreview = (msg: string) => {
    if (!msg) return ''
    if (msg.startsWith('>REPLY_TO:')) {
       return msg.split('\n\n').slice(1).join('\n\n')
    }
    return msg
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (selectedNotification) {
      scrollToBottom()
    }
  }, [selectedNotification, notifications])

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
      const data = await api.getNotifications('00000000-0000-0000-0000-000000000000')
      list = [...data]
    } catch {
      const stored = localStorage.getItem('notifications_00000000-0000-0000-0000-000000000000')
      if (stored) list = JSON.parse(stored)
    }

    // Also check general admin notifications
    const storedFallback = localStorage.getItem('notifications_fallback_admin@truckview.com.ng')
    if (storedFallback) {
      const fallbacks = JSON.parse(storedFallback)
      const existingIds = new Set(list.map(n => n.id))
      fallbacks.forEach((f: any) => { if (!existingIds.has(f.id)) list.push(f) })
    }

    setNotifications(list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    
    const handleRefresh = () => loadData()
    window.addEventListener('refresh_notifications', handleRefresh)
    
    return () => {
      window.removeEventListener('refresh_notifications', handleRefresh)
    }
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
      const fallbackPayload = {
        id: Date.now().toString(),
        title: audienceType === 'specific' ? 'Direct Message from Admin' : 'Announcement from TruckView Admin',
        message,
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      }

      if (audienceType === 'all') {
        try {
          await api.createNotification(null, fallbackPayload.title, message, 'info', '00000000-0000-0000-0000-000000000000')
        } catch {
          // DB insert failed, we will use global fallback
        }
        const storedGlobal = localStorage.getItem('notifications_broadcast_global')
        const globalList = storedGlobal ? JSON.parse(storedGlobal) : []
        globalList.push({ ...fallbackPayload, sender_id: '00000000-0000-0000-0000-000000000000' })
        localStorage.setItem('notifications_broadcast_global', JSON.stringify(globalList))
      } else {
         const cId = selectedCustomer.id || selectedCustomer.profileId
         try {
           await api.createNotification(cId, fallbackPayload.title, message, 'info', '00000000-0000-0000-0000-000000000000')
         } catch {
           // DB insert failed
         }
         const specificFallbackKey = `notifications_fallback_${cId}`
         const specificStored = localStorage.getItem(specificFallbackKey)
         const specificList = specificStored ? JSON.parse(specificStored) : []
         specificList.push({ ...fallbackPayload, profile_id: cId, sender_id: '00000000-0000-0000-0000-000000000000' })
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
      
      const newNotificationObj = {
        ...fallbackPayload,
        profile_id: audienceType === 'all' ? 'all' : (selectedCustomer?.id || selectedCustomer?.profileId),
        sender_id: '00000000-0000-0000-0000-000000000000'
      }
      setNotifications(prev => [newNotificationObj, ...prev])

      toast.success(`Message sent successfully!`)
      setMessage('')
      setSearchQuery('')
      setSelectedCustomer(null)
      loadData()
    } catch (err: any) {
      toast.error(`Broadcast failed: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleSendReply = async (otherPartyId: string) => {
    if (!replyMessage.trim()) return
    setSending(true)
    try {
      const title = 'Direct Message from Admin'
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
         profile_id: otherPartyId,
         sender_id: '00000000-0000-0000-0000-000000000000',
         created_at: new Date().toISOString(),
         status: 'sent',
         read: false,
         notification_reactions: []
      }
      setNotifications(prev => [...prev, newMsg])
      setReplyMessage('')
      setReplyingTo(null)

      await api.createNotification(otherPartyId, title, body, 'info', '00000000-0000-0000-0000-000000000000')
      loadData()
    } catch (err: any) {
      toast.error(`Reply failed: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleSaveEdit = async (msgId: string) => {
    if (!editContent.trim()) return
    try {
      await api.updateNotificationMessage(msgId, editContent)
      toast.success('Message updated and user re-notified!')
      setEditingMessage(null)
      loadData()
    } catch (err: any) {
      toast.error(`Edit failed: ${err.message}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead('00000000-0000-0000-0000-000000000000')
      localStorage.removeItem('notifications_00000000-0000-0000-0000-000000000000')
      toast.success('Admin notifications marked as read!')
      await loadData()
      await refreshUnread()
    } catch {
      toast.success('Notifications marked as read!')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">System Notifications</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">Manage automated alerts, view system events, and send mass notifications.</p>
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
                (() => {
                  const inboxMsgs = notifications.filter(n => n.profile_id === '00000000-0000-0000-0000-000000000000' || n.profile_id === null)
                  const grouped: any[] = []
                  const senderMap = new Set()
                  
                  // Process newest to oldest for the inbox view
                  for (let i = inboxMsgs.length - 1; i >= 0; i--) {
                    const n = inboxMsgs[i]
                    const isDirectMessage = n.title?.includes('Message from') || n.title?.includes('Direct Message')
                    
                    if (isDirectMessage && n.sender_id) {
                      if (!senderMap.has(n.sender_id)) {
                        senderMap.add(n.sender_id)
                        grouped.push(n)
                      }
                    } else {
                      grouped.push(n)
                    }
                  }
                  
                  return grouped.map((n, i) => (
                    <div 
                      key={n.id || i} 
                      onClick={() => {
                        setSelectedNotification(n)
                        if (!n.read && n.id) {
                          api.updateNotificationStatus(n.id, 'read').catch(() => {})
                          setNotifications(prev => prev.map(msg => msg.id === n.id ? { ...msg, read: true, status: 'read' } : msg))
                          refreshUnread()
                        }
                      }}
                      className="p-3.5 bg-surface-2 rounded-xl border border-line flex items-start gap-3 cursor-pointer hover:bg-surface-2/80 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400 flex items-center justify-center shrink-0 mt-0.5">
                        <BellIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-ink truncate">{n.title}</h4>
                          <span className="text-[10px] text-muted">{n.created_at ? formatDateTime(n.created_at) : 'Just now'}</span>
                        </div>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{cleanMessagePreview(n.message)}</p>
                      </div>
                    </div>
                  ))
                })()
              )
            ) : (
                (() => {
                  const sentMsgs = notifications.filter(n => n.sender_id === '00000000-0000-0000-0000-000000000000')
                  const groupedSent: any[] = []
                  const receiverMap = new Set()
                  
                  for (let i = sentMsgs.length - 1; i >= 0; i--) {
                    const n = sentMsgs[i]
                    if (n.profile_id && n.profile_id !== '00000000-0000-0000-0000-000000000000' && n.profile_id !== 'all') {
                      if (!receiverMap.has(n.profile_id)) {
                        receiverMap.add(n.profile_id)
                        groupedSent.push(n)
                      }
                    } else {
                      groupedSent.push(n)
                    }
                  }

                  if (groupedSent.length === 0) {
                    return (
                      <div className="p-8 text-center text-muted text-sm border border-dashed border-line rounded-xl">
                        You haven't sent any messages yet.
                      </div>
                    )
                  }

                  return groupedSent.map((msg, i) => {
                    const customer = allCustomers.find(c => c.id === msg.profile_id || c.profileId === msg.profile_id)
                    const audienceName = msg.audience || (msg.profile_id === null ? 'All Customers' : (customer ? `${customer.name} (${customer.email})` : 'Customer'))
                    
                    return (
                      <div 
                        key={msg.id || i} 
                        onClick={() => setSelectedNotification(msg)}
                        className="p-3.5 bg-surface-2 rounded-xl border border-line space-y-2 cursor-pointer hover:bg-surface-2/80 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600">To: {audienceName}</span>
                          <span className="text-[10px] text-muted">{msg.created_at ? formatDateTime(msg.created_at) : 'Just now'}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-ink">{msg.title}</h4>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">{cleanMessagePreview(msg.message)}</p>
                      </div>
                    )
                  })
                })()
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm" onClick={() => setSelectedNotification(null)}>
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400`}>
                  <BellIcon size={16} />
                </div>
                <h3 className="font-semibold text-ink">
                  {(() => {
                    if (selectedNotification.title?.startsWith('Message from ')) {
                      return selectedNotification.title.replace('Message from ', '');
                    }
                    if (selectedNotification.title?.startsWith('Direct Message')) {
                       const otherPartyId = selectedNotification.sender_id === '00000000-0000-0000-0000-000000000000' ? selectedNotification.profile_id : selectedNotification.sender_id;
                       const customer = allCustomers.find(c => c.id === otherPartyId || c.profileId === otherPartyId);
                       return customer ? `Chat with ${customer.name}` : 'Customer Chat';
                    }
                    return 'Notification Details';
                  })()}
                </h3>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="p-1.5 text-muted hover:text-ink hover:bg-surface-2 rounded-lg transition-colors">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="p-0 overflow-hidden flex-1 flex flex-col bg-canvas/30">
              {(() => {
                const isThread = selectedNotification.title?.includes('Message from') || selectedNotification.title?.includes('Direct Message')
                const otherPartyId = selectedNotification.sender_id === '00000000-0000-0000-0000-000000000000' 
                  ? selectedNotification.profile_id 
                  : selectedNotification.sender_id

                if (isThread && otherPartyId) {
                  return (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {notifications
                          .filter(n => (n.profile_id === otherPartyId || n.sender_id === otherPartyId) && (n.title?.includes('Message from') || n.title?.includes('Direct Message')))
                          .sort((a,b) => (a.created_at || '').localeCompare(b.created_at || ''))
                          .map(msg => {
                            const isMine = msg.sender_id === '00000000-0000-0000-0000-000000000000'
                            const statusColor = msg.status === 'read' ? 'text-blue-500' : 'text-muted'
                            
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-accent-500 text-white rounded-br-sm' : 'bg-surface border border-line text-ink rounded-bl-sm shadow-sm'}`}>
                                  {(() => {
                                    let displayMessage = msg.message || ''
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
                                    
                                    if (editingMessage === msg.id) {
                                      return (
                                        <div className="flex flex-col gap-2">
                                          <textarea 
                                            value={editContent} 
                                            onChange={e => setEditContent(e.target.value)} 
                                            className="w-full text-ink bg-surface p-2 rounded text-sm"
                                            rows={3}
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <button onClick={() => setEditingMessage(null)} className="text-xs text-white/80 hover:text-white">Cancel</button>
                                            <button onClick={() => handleSaveEdit(msg.id)} className="text-xs bg-white text-accent-600 px-2 py-1 rounded font-bold">Save</button>
                                          </div>
                                        </div>
                                      )
                                    }
                                    
                                    return (
                                      <>
                                        {replyBlock}
                                        <p className={`text-sm ${isMine ? 'text-white' : 'text-ink'} whitespace-pre-wrap`}>{displayMessage}</p>
                                        <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${isMine ? 'text-white/70 justify-end' : 'text-muted justify-start'}`}>
                                          <span>{formatDateTime(msg.created_at || new Date().toISOString())}</span>
                                          {isMine && (
                                            <>
                                              <button onClick={() => { setEditingMessage(msg.id); setEditContent(displayMessage); }} className="hover:text-white underline ml-2">Edit</button>
                                              <span className={statusColor}>
                                                {msg.status === 'sent' && '✓'}
                                                {msg.status === 'delivered' && '✓✓'}
                                                {msg.status === 'read' && '✓✓'}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </>
                                    )
                                  })()}
                                </div>
                                <div className={`flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start'} w-full px-2 mt-1`}>
                                  {!isMine && <ReactionPicker notificationId={msg.id} reactions={msg.notification_reactions || []} />}
                                  <button onClick={() => setReplyingTo(msg)} className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-ink transition-opacity rounded-full hover:bg-surface-2">
                                    <ReplyIcon size={14} />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
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
                            placeholder="Type a reply..."
                            className="w-full pl-4 pr-12 py-3 bg-surface-2 border border-line rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 resize-none shadow-inner"
                          />
                          <button 
                            onClick={() => handleSendReply(otherPartyId)}
                            disabled={sending || !replyMessage.trim()}
                            className="absolute right-2 bottom-2 p-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white rounded-lg transition-colors shadow-lift"
                          >
                            <SendIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-ink mb-2">{selectedNotification.title}</h2>
                    <span className="text-sm font-medium text-muted block mb-4">
                      {formatDateTime(selectedNotification.created_at || new Date().toISOString())}
                    </span>
                    
                    {selectedNotification.audience && (
                       <div className="mb-4 text-sm font-medium text-accent-600">
                          To: {selectedNotification.audience}
                       </div>
                    )}

                    {editingMessage === selectedNotification.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={editContent} 
                          onChange={e => setEditContent(e.target.value)} 
                          className="w-full text-ink bg-surface border border-line p-3 rounded-xl text-sm shadow-inner"
                          rows={4}
                        />
                        <div className="flex gap-2 justify-end mt-2">
                          <button onClick={() => setEditingMessage(null)} className="text-sm text-muted hover:text-ink">Cancel</button>
                          <button onClick={() => handleSaveEdit(selectedNotification.id)} className="text-sm bg-accent-500 text-white px-4 py-2 rounded-lg font-bold">Save Changes</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-ink-soft whitespace-pre-wrap leading-relaxed text-sm bg-surface-2 p-4 rounded-xl border border-line relative group">
                          {selectedNotification.message}
                          {selectedNotification.sender_id === '00000000-0000-0000-0000-000000000000' && (
                            <button onClick={() => { setEditingMessage(selectedNotification.id); setEditContent(selectedNotification.message); }} className="absolute top-2 right-2 text-xs bg-surface border border-line px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-ink">
                              Edit
                            </button>
                          )}
                        </div>
                        <ReactionPicker notificationId={selectedNotification.id} reactions={selectedNotification.notification_reactions || []} />
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
