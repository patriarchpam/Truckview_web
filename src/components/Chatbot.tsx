import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquareIcon, XIcon, SendIcon, BotIcon, UserIcon, PlusIcon, HistoryIcon, Trash2Icon, ChevronLeftIcon } from 'lucide-react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

type Message = {
  id: string
  role: 'bot' | 'user'
  content: string
}

type ChatSession = {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}

const STORAGE_KEY_SESSIONS = 'truckview_chat_sessions'
const STORAGE_KEY_ACTIVE_ID = 'truckview_chat_active_id'

// Initialize Gemini (only if key is provided)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// The system instructions for St. Paul
const SYSTEM_INSTRUCTION = `You are St. Paul, the virtual assistant for Truck-View Global Ent. located in Abuja, Nigeria. 
You are an expert mechanic and a friendly, empathetic customer service agent. 
Keep your answers concise, helpful, and conversational (do not use markdown headers, but you can use emojis). 
If a user is frustrated, stressed, or in an emergency (e.g., car broke down), respond with empathy, de-escalate the situation, and reassure them that we can help.
Always proactively direct users to book a service on our platform for any car issues. If they need maintenance or repairs, explicitly tell them to click the "Book a Service" button on the website.`

const INITIAL_BOT_MSG: Message = {
  id: '1',
  role: 'bot',
  content: "Hello! I am St. Paul, TruckView's Virtual Assistant. How can I help you today?"
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS)
      const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID)
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored)
        setSessions(parsed)
        if (storedActiveId && parsed.some(s => s.id === storedActiveId)) {
          setActiveSessionId(storedActiveId)
        } else if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id)
        } else {
          createNewSession()
        }
      } else {
        createNewSession()
      }
    } catch {
      createNewSession()
    }
  }, [])

  // Save sessions to localStorage whenever they update
  const saveSessions = (updatedSessions: ChatSession[], activeId: string) => {
    setSessions(updatedSessions)
    setActiveSessionId(activeId)
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions))
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId)
  }

  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [INITIAL_BOT_MSG]
    }
    const updated = [newSession, ...sessions]
    saveSessions(updated, newSessionId)
    setShowHistory(false)
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      const newSessionId = `session_${Date.now()}`
      const freshSession: ChatSession = {
        id: newSessionId,
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        messages: [INITIAL_BOT_MSG]
      }
      saveSessions([freshSession], newSessionId)
      setShowHistory(false)
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]
  const currentMessages = activeSession ? activeSession.messages : [INITIAL_BOT_MSG]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [currentMessages, isOpen, showHistory])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeSession) return

    const userText = input.trim()
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userText }
    
    // Auto title update if it's the first user message
    let sessionTitle = activeSession.title
    if (sessionTitle === 'New Chat' || activeSession.messages.length <= 1) {
      sessionTitle = userText.slice(0, 24) + (userText.length > 24 ? '...' : '')
    }

    const updatedMessages = [...activeSession.messages, userMessage]
    const updatedSession: ChatSession = { ...activeSession, title: sessionTitle, messages: updatedMessages }
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s)
    
    saveSessions(updatedSessions, activeSession.id)
    setInput('')
    setIsTyping(true)

    if (!genAI) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: "I'm currently disconnected! Please ask the admin to add the Gemini API Key to system (.env.local)."
        }
        const finalMessages = [...updatedMessages, botMessage]
        const finalSession = { ...updatedSession, messages: finalMessages }
        saveSessions(sessions.map(s => s.id === activeSession.id ? finalSession : s), activeSession.id)
        setIsTyping(false)
      }, 800)
      return
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      })

      // Format previous messages for chat history
      const history = currentMessages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))

      const chat = model.startChat({ history })
      const result = await chat.sendMessage(userMessage.content)
      const response = await result.response

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: response.text()
      }
      
      const finalMessages = [...updatedMessages, botMessage]
      const finalSession = { ...updatedSession, messages: finalMessages }
      saveSessions(sessions.map(s => s.id === activeSession.id ? finalSession : s), activeSession.id)
    } catch (error) {
      console.error("Chatbot Error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `I'm sorry, I encountered an issue. Details: ${errorMessage}`
      }
      const finalMessages = [...updatedMessages, botMessage]
      const finalSession = { ...updatedSession, messages: finalMessages }
      saveSessions(sessions.map(s => s.id === activeSession.id ? finalSession : s), activeSession.id)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-0 sm:right-0 mb-0 sm:mb-4 flex flex-col w-full sm:w-[420px] h-full sm:h-[550px] bg-surface/95 backdrop-blur-xl border border-line sm:rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-accent-600 to-accent-500 text-white shrink-0">
              <div className="flex items-center gap-3">
                {showHistory ? (
                  <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <ChevronLeftIcon size={20} />
                  </button>
                ) : (
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BotIcon size={18} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    {showHistory ? 'Chat History' : (activeSession?.title || 'St. Paul')}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {showHistory ? 'Previous sessions' : 'Virtual Assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="View Chat History"
                >
                  <HistoryIcon size={18} />
                </button>
                <button
                  onClick={createNewSession}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Start New Chat"
                >
                  <PlusIcon size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white ml-1"
                  aria-label="Close Chat"
                >
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* Content Area: Either Session History List or Messages */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-2/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">All Sessions</span>
                  <button onClick={clearHistory} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <Trash2Icon size={12} /> Clear History
                  </button>
                </div>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id)
                      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, s.id)
                      setShowHistory(false)
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${s.id === activeSessionId ? 'bg-accent-50 border-accent-300 dark:bg-accent-900/30 dark:border-accent-700' : 'bg-surface border-line hover:border-accent-500'}`}
                  >
                    <div className="font-semibold text-sm text-ink truncate">{s.title}</div>
                    <div className="text-[11px] text-muted mt-1">
                      {s.messages.length} messages · {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300' : 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400'}`}>
                        {msg.role === 'user' ? <UserIcon size={14} /> : <BotIcon size={14} />}
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-navy-600 text-white rounded-tr-sm' : 'bg-surface-2 text-ink rounded-tl-sm border border-line'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400 flex items-center justify-center">
                        <BotIcon size={14} />
                      </div>
                      <div className="px-4 py-3 bg-surface-2 rounded-2xl rounded-tl-sm border border-line flex gap-1 items-center">
                        <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-surface border-t border-line flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask St. Paul..."
                    className="flex-1 bg-surface-2 border border-line rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-ink placeholder:text-muted"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="shrink-0 h-10 w-10 bg-accent-500 text-white rounded-full flex items-center justify-center hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send Message"
                  >
                    <SendIcon size={18} className="mr-0.5" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center justify-center h-14 w-14 rounded-full shadow-lift transition-all duration-300 ${isOpen ? 'bg-surface-2 text-ink hover:bg-line z-10' : 'bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:scale-105 z-10'}`}
          aria-label="Toggle Chat"
        >
          {isOpen ? <XIcon size={24} /> : <MessageSquareIcon size={24} />}
          
          {!isOpen && (
            <div className="absolute right-[calc(100%+16px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap bg-surface border border-line text-ink text-sm font-medium px-4 py-2 rounded-xl shadow-md flex items-center">
              Chat with St. Paul
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-surface border-r border-t border-line rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
