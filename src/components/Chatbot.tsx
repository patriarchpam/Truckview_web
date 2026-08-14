import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquareIcon, XIcon, SendIcon, BotIcon, UserIcon } from 'lucide-react'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

type Message = {
  id: string
  role: 'bot' | 'user'
  content: string
}

// Initialize Gemini (only if key is provided)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// The system instructions for St. Paul
const SYSTEM_INSTRUCTION = `You are St. Paul, the virtual assistant for Truck-View Global Ent. located in Abuja, Nigeria. 
You are an expert mechanic and a friendly, empathetic customer service agent. 
Keep your answers concise, helpful, and conversational (do not use markdown headers, but you can use emojis). 
If a user is frustrated, stressed, or in an emergency (e.g., car broke down), respond with empathy, de-escalate the situation, and reassure them that we can help.
Always proactively direct users to book a service on our platform for any car issues. If they need maintenance or repairs, explicitly tell them to click the "Book a Service" button on the website.`

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hello! I am St. Paul, TruckView's Virtual Assistant. How can I help you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    if (!genAI) {
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: "I'm currently disconnected! Please ask the admin to add the Gemini API Key to my system (.env.local)."
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)
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
      const history = messages.slice(1).map(m => ({
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
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Chatbot Error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `I'm sorry, I'm having trouble thinking right now. Error details: ${errorMessage}`
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-col w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] bg-surface/90 backdrop-blur-xl border border-line rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-600 to-accent-500 text-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BotIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">St. Paul</h3>
                  <p className="text-xs text-white/80">Virtual Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close Chat"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300' : 'bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400'}`}>
                    {msg.role === 'user' ? <UserIcon size={14} /> : <BotIcon size={14} />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-navy-600 text-white rounded-tr-sm' : 'bg-surface-2 text-ink rounded-tl-sm border border-line'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400 flex items-center justify-center">
                    <BotIcon size={14} />
                  </div>
                  <div className="px-4 py-3 bg-surface-2 rounded-2xl rounded-tl-sm border border-line flex gap-1">
                    <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="h-1.5 w-1.5 bg-accent-400 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-surface border-t border-line flex items-center gap-2">
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
          
          {/* Tooltip on hover */}
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
