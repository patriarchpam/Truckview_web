import { useState } from 'react'
import { SmileIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

interface ReactionPickerProps {
  notificationId: string
  reactions: any[]
}

export function ReactionPicker({ notificationId, reactions = [] }: ReactionPickerProps) {
  const { user } = useAuth()
  const [showPicker, setShowPicker] = useState(false)

  const toggleReaction = async (emoji: string) => {
    if (!user) return
    try {
      await api.toggleReaction(notificationId, user.profileId || '00000000-0000-0000-0000-000000000000', emoji)
      setShowPicker(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Group reactions by emoji
  const grouped = reactions.reduce((acc: any, r: any) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  // Check if current user reacted
  const hasReacted = (emoji: string) => {
    if (!user) return false
    const uId = user.profileId || '00000000-0000-0000-0000-000000000000'
    return reactions.some(r => r.emoji === emoji && r.user_id === uId)
  }

  return (
    <div className="relative flex items-center gap-1.5 -mt-3.5 z-10 px-2">
      {/* Existing Reactions */}
      {Object.entries(grouped).map(([emoji, count]: any) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${hasReacted(emoji) ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-surface-2 border-line text-muted hover:bg-surface-3 transition-colors'}`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}

      {/* Picker Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          onBlur={() => setTimeout(() => setShowPicker(false), 200)}
          className="p-1 rounded-full text-muted/40 hover:text-ink hover:bg-surface-2 transition-colors peer"
          style={{ color: showPicker ? 'var(--ink)' : undefined }}
        >
          <SmileIcon size={16} />
        </button>

        {/* Picker Dropdown */}
        {showPicker && (
          <div className="absolute bottom-full mb-2 left-0 bg-surface border border-line rounded-full shadow-lg p-1.5 flex gap-1 z-10" onClick={e => e.stopPropagation()}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => toggleReaction(e)}
                className="hover:bg-surface-2 p-1.5 rounded-full transition-transform hover:scale-125 focus:outline-none"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
