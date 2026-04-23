'use client'

// components/ChatPrompt.tsx
// Renders a set of suggested questions students can click to send to the chatbot.
// Fires a 'chatprompt' CustomEvent that ChatBot listens for.
//
// Usage in MDX:
// <ChatPrompt questions={[
//   "Why does sound travel faster in water than air?",
//   "What's the difference between frequency and pitch?",
// ]} />

interface ChatPromptProps {
  questions: string[]
  title?: string
}

export default function ChatPrompt({
  questions = [],
  title = 'Ask the tutor',
}: ChatPromptProps) {
  if (!questions || questions.length === 0) return null
  function sendQuestion(q: string) {
    window.dispatchEvent(
      new CustomEvent('chatprompt', { detail: { message: q } })
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
        🎓 {title}
      </p>
      <ul className="space-y-2">
        {questions.map((q) => (
          <li key={q}>
            <button
              onClick={() => sendQuestion(q)}
              className="w-full text-left text-sm text-indigo-800 bg-white hover:bg-indigo-100
                         border border-indigo-200 rounded-lg px-4 py-2.5 transition-colors
                         font-medium leading-snug cursor-pointer"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-indigo-400 mt-3">
        Click a question to open the chat and explore it with your AI tutor.
      </p>
    </div>
  )
}
