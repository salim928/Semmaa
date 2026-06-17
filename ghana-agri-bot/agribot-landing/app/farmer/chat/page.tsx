'use client'

// app/farmer/chat/page.tsx – Web chat UI mirroring the mobile ChatScreen

import { useEffect, useRef, useState } from 'react'
import { api, AskResponse } from '@/lib/api'

type Sender = 'user' | 'ai'

interface Message {
  id: string
  text: string
  sender: Sender
  createdAt: Date
  loading?: boolean
  durationMs?: number
  kbHits?: number
}

// Quick suggestion prompts for farmers
const QUICK_PROMPTS = [
  "What crops grow best in Northern Ghana?",
  "How do I treat tomato leaf blight?",
  "Best time to plant maize in Ghana?",
  "How to improve my soil naturally?",
  "Current market prices for cassava",
]

export default function FarmerChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! 👋 I'm your SemmaAI farming advisor. I'm here to help you with:\n\n🌱 **Crop advice** - planting, care, and harvesting\n🐛 **Pest & disease** - identification and treatment\n☀️ **Weather guidance** - seasonal planning\n💰 **Market insights** - prices and selling tips\n\nAsk me anything about farming in Ghana!",
      sender: 'ai',
      createdAt: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const send = async () => {
    if (!input.trim() || isSending) return
    setError(null)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      sender: 'user',
      createdAt: new Date(),
    }

    const loadingMessage: Message = {
      id: `ai-loading-${Date.now()}`,
      text: 'Thinking…',
      sender: 'ai',
      createdAt: new Date(),
      loading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInput('')
    setIsSending(true)

    try {
      const res: AskResponse = await api.ask(userMessage.text, 'Ghana')
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: res.answer || 'Sorry, I could not process your question right now. Please try again.',
        sender: 'ai',
        createdAt: new Date(),
        durationMs: res.duration_ms,
        kbHits: res.kb_hits,
      }

      setMessages((prev) =>
        prev
          .filter((m) => !m.loading)
          .concat(aiMessage),
      )
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => !m.loading)
          .concat({
            id: `ai-error-${Date.now()}`,
            text:
              'Sorry, there was a problem reaching the server. Please check your connection and try again.',
            sender: 'ai',
            createdAt: new Date(),
          }),
      )
      setError('Could not reach the advisor. Is the API running?')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-3xl border border-emerald-100 bg-white shadow-sm sm:h-[calc(100vh-7rem)]">
      <header className="flex items-center justify-between border-b border-emerald-100 px-4 py-3 sm:px-5">
        <div>
          <h1 className="text-base font-semibold text-emerald-900 sm:text-lg">
            🤖 SemmaAI Farming Advisor
          </h1>
          <p className="text-xs text-emerald-500 sm:text-sm">
            Expert agricultural guidance tailored for Ghana
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </span>
      </header>

      {error && (
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-5">
          ⚠️ {error}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Quick prompts - show only when no conversation yet */}
      {messages.length <= 1 && (
        <div className="border-t border-emerald-100 bg-emerald-50/30 px-3 py-3 sm:px-4">
          <p className="mb-2 text-xs font-medium text-emerald-600">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(prompt)
                }}
                className="rounded-full bg-white border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="border-t border-emerald-100 bg-emerald-50/40 px-3 py-3 sm:px-4"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your farming question…"
            rows={1}
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 sm:text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:px-4"
          >
            {isSending ? 'Sending…' : 'Send'}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-emerald-500">
          Press Enter to send, Shift + Enter for a new line.
        </p>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.sender === 'ai'
  
  // Format text with basic markdown support (bold)
  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }
  
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base ${
          isAI
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-50 text-emerald-900 border border-emerald-100'
            : 'bg-emerald-600 text-white'
        }`}
      >
        {message.loading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-emerald-600">Thinking...</span>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-line">{formatText(message.text)}</p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] opacity-60">
              <span>
                {message.createdAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {isAI && message.durationMs && (
                <span className="flex items-center gap-1">
                  ⚡ {(message.durationMs / 1000).toFixed(1)}s
                </span>
              )}
              {isAI && message.kbHits !== undefined && message.kbHits > 0 && (
                <span className="flex items-center gap-1">
                  📚 {message.kbHits} sources
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


