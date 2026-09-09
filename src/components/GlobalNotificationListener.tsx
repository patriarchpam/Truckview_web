import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useNotificationContext } from '../contexts/NotificationContext'
import { api } from '../lib/api'
import { BellIcon, CheckCircle2Icon, AlertCircleIcon, WrenchIcon, ShieldAlertIcon } from 'lucide-react'

const iconMap: Record<string, any> = {
  success: CheckCircle2Icon,
  warning: AlertCircleIcon,
  info: WrenchIcon,
  alert: ShieldAlertIcon
}

// Simple beep sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
    oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1) // A6
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.2)
  } catch (e) {
    console.warn('Could not play notification sound', e)
  }
}
const toastedIds = new Set<string>()

export function GlobalNotificationListener() {
  const { user } = useAuth()
  const { refresh } = useStore()
  const { refreshUnread } = useNotificationContext()

  useEffect(() => {
    if (!user) return

    // Determine which ID to listen to
    // If admin, we also want to hear 'admin-system' broadcasts.
    // If customer, we want to hear their profileId.
    const targetIds = [user.profileId]
    if (user.role === 'admin') {
      targetIds.push('00000000-0000-0000-0000-000000000000')
    }

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as any || payload.old
          // Check if this notification is meant for the current user
          if (newNotif && (targetIds.includes(newNotif.profile_id) || newNotif.profile_id === null || targetIds.includes(newNotif.sender_id))) {
            // Play sound and show toast only on INSERT or if an UPDATE reset the read status to false
            if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && (payload.new as any).read === false && (payload.old as any).read === true)) {
              
              // Don't show toast for messages the current user just sent
              const isFromMe = newNotif.sender_id === (user.role === 'admin' ? '00000000-0000-0000-0000-000000000000' : user.profileId)
              
              if (!isFromMe) {
                // Prevent duplicate toasts for the same notification ID
                const notifId = (payload.new as any)?.id || (payload.old as any)?.id
                if (notifId) {
                  if (toastedIds.has(notifId)) {
                    return
                  }
                  toastedIds.add(notifId)
                  
                  // Clean up set if it gets too large
                  if (toastedIds.size > 100) {
                    const iterator = toastedIds.values()
                    for (let i = 0; i < 50; i++) toastedIds.delete(iterator.next().value)
                  }
                }

                playNotificationSound()
                
                // Automatically mark as delivered if we just received it
                if (payload.eventType === 'INSERT' && newNotif.id && newNotif.profile_id) {
                   api.updateNotificationStatus(newNotif.id, 'delivered').catch(() => {})
                }

                // Show toast
                const notifData = payload.new
                const Icon = iconMap[notifData.type || 'info'] || BellIcon
                toast(notifData.title, {
                  description: notifData.message,
                  icon: <Icon className={
                    notifData.type === 'success' ? 'text-green-500' : 
                    notifData.type === 'warning' ? 'text-amber-500' : 
                    'text-blue-500'
                  } />,
                  duration: 5000,
                })
              }
            }
            
            // Trigger refresh to update Notification page and badge
            refreshUnread()
            window.dispatchEvent(new Event('refresh_notifications'))

            // Refresh global store data so user doesn't have to manually refresh page
            refresh()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notification_reactions' },
        () => {
          // Whenever a reaction is added or removed, trigger a UI refresh
          window.dispatchEvent(new Event('refresh_notifications'))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return null
}
