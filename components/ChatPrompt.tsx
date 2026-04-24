'use client'

// components/ChatPrompt.tsx
// Renders suggested questions the student can click to send to the AI tutor.
// Dispatches a 'chatprompt' CustomEvent that ChatBot listens for.
//
// Pass each question as a separate prop (q1, q2, q3, q4, q5).
// This mirrors ActivitySoundwalk's pattern of hardcoded strings and avoids
// RSC serialisation issues with array/complex props in next-mdx-remote/rsc.
//
// Usage in MDX:
// <ChatPrompt
//   title="Ask the tutor"
//   q1="First question?"
//   q2="Second question?"
//   q3="Third question?"
// />

interface ChatPromptProps {
  title?: string
  q1?: string
  q2?: string
  q3?: string
  q4?: string
  q5?: string
}

export default function ChatPrompt({
  title = 'Ask the tutor',
  q1, q2, q3, q4, q5,
}: ChatPromptProps) {
  const qs = [q1, q2, q3, q4, q5].filter((q): q is string => Boolean(q))

  function send(q: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatprompt', { detail: { message: q } }))
    }
  }

  return (
    <div
      className="not-prose"
      style={{
        margin: '2rem 0',
        borderRadius: '14px',
        border: '2px solid #6366f1',
        overflow: 'hidden',
        fontFamily: 'inherit',
        boxShadow: '0 2px 12px rgba(99,102,241,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#4f46e5', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🤖</span>
        <div>
          <div style={{ color: '#c7d2fe', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Chatbot Exercise
          </div>
          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
            {title}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ background: '#eef2ff', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {qs.length === 0 ? (
          <div style={{ color: '#6366f1', fontSize: '13px', fontStyle: 'italic' }}>
            Click to open the chat and ask the tutor about this topic.
          </div>
        ) : (
          qs.map((q, i) => (
            <div
              key={i}
              onClick={() => send(q)}
              style={{
                background: '#fff',
                border: '1px solid #a5b4fc',
                borderRadius: '10px',
                padding: '11px 14px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#1e1b4b',
                lineHeight: '1.6',
              }}
            >
              <span style={{ color: '#6366f1', fontWeight: 700, marginRight: '6px' }}>→</span>
              {q}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#eef2ff', padding: '0 18px 12px', fontSize: '11px', color: '#818cf8' }}>
        Click a question to send it to the AI tutor.
      </div>
    </div>
  )
}