'use client'

// components/ChatBot.tsx
// Floating AI tutor chatbot.
// Listens for the 'chatprompt' CustomEvent fired by <ChatPrompt> components
// in MDX — when received, opens the panel and pre-fills the question.

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

// Maps URL slugs to readable chapter context for the AI
const PAGE_CONTEXT: Record<string, string> = {
  '/': 'Home page — textbook overview',
  '/chapters/01-introduction': 'Chapter 1: The World of Sound — what acoustics is, history, Lindsay\'s Wheel, sinusoids, amplitude, frequency, phase, wavelength, speed of sound, waveform vs spectrum, complex sounds, speech and hearing chain',
  '/chapters/02-standing-waves': 'Chapter 2: Standing Waves & Musical Acoustics — vibrating strings, pipes, membranes, and instruments',
  '/chapters/03-signal-analysis': 'Chapter 3: Signal Analysis — time series, frequency spectra, filtering, LTI systems, convolution',
  '/chapters/04-sound-levels': 'Chapter 4: Sound Levels & Propagation — decibels, SPL, frequency weighting, inverse square law, outdoor propagation',
  '/chapters/05-hearing-speech': 'Chapter 5: Hearing & Speech — auditory anatomy, psychoacoustics, speech sounds, co-articulation',
  '/chapters/06-architectural': 'Chapter 6: Architectural Acoustics — room acoustics, reverberation, vibration isolation',
  '/chapters/07-demos': 'Chapter 7: Interactive Demos — simple harmonic motion, damping, resonance, spectrograms',
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Listen for ChatPrompt events ──────────────────────────────────────────
  useEffect(() => {
    function handleChatPrompt(e: Event) {
      const { message } = (e as CustomEvent<{ message: string }>).detail
      setIsOpen(true)
      setInput(message)
      // Focus input after panel opens (small delay for animation)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
    window.addEventListener('chatprompt', handleChatPrompt)
    return () => window.removeEventListener('chatprompt', handleChatPrompt)
  }, [])

  // Focus input whenever panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText ?? input
    if (!text.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Append placeholder assistant message — we'll stream text into it
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          pageContext: PAGE_CONTEXT[pathname] ?? 'Acoustics textbook',
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'API error')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong.'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry — ${errMsg} Please try again.`,
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        aria-label={isOpen ? 'Close AI tutor' : 'Open AI tutor'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        )}
      </button>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">

          {/* Header */}
          <div className="px-4 py-3 bg-blue-600 rounded-t-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Acoustics Tutor</p>
              <p className="text-blue-200 text-xs">Ask me anything about this chapter</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-700 text-sm mt-8 px-4">
                <p className="text-2xl mb-3">👋</p>
                <p className="font-medium text-gray-800 mb-1">Hi, I'm your acoustics tutor!</p>
                <p>Ask me a question about what you're reading, or click any suggested question in the chapter.</p>
              </div>
            )}
            {messages.map((message, i) => (
              <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                }`}>
                  {message.content || (
                    <span className="inline-flex gap-1 py-0.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 disabled:opacity-50 placeholder:text-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 text-center">
              Enter to send · Tutor knows your current chapter
            </p>
          </div>
        </div>
      )}
    </>
  )
}