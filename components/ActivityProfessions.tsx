'use client'

// components/ActivityProfessions.tsx
// Activity 2: Socratic brainstorm — what professions involve sound?
// Place just before §1.1.3 (The Scope of Acoustics: ASA Technical Areas).

export default function ActivityProfessions() {
  function startActivity() {
    window.dispatchEvent(
      new CustomEvent('chatprompt', {
        detail: {
          message:
            "I'm ready for the professions activity. Without telling me the answer yet, can you guide me with questions to help me think of as many professions as possible that involve working with sound?",
        },
      })
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-violet-100 bg-violet-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-violet-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">
          💬 Activity 2 — Think Before You Read
        </p>
        <h3 className="text-lg font-bold text-violet-900 m-0">
          Who works with sound?
        </h3>
        <p className="text-sm text-violet-700 mt-1 leading-relaxed">
          Before reading the official list of acoustics sub-fields, take a few
          minutes to explore what you already know. The tutor will ask you
          questions — not give you answers — to help you discover the breadth
          of the field yourself.
        </p>
      </div>

      <div className="px-6 py-5">
        <p className="text-sm text-violet-700 leading-relaxed mb-2">
          <strong>Your task:</strong> Name as many <em>professions</em> as you can
          think of where sound is central to the work. Don't worry about being
          "right" — explore freely. The tutor will prompt you with hints if you
          get stuck, and reflect back what areas of acoustics your answers connect to.
        </p>
        <p className="text-sm text-violet-700 leading-relaxed mb-4">
          When you feel you've exhausted your list, keep reading — see how many
          of the ASA's 14 technical areas you anticipated.
        </p>
        <button
          onClick={startActivity}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <span>🧠</span> Start brainstorm with tutor
        </button>
      </div>
    </div>
  )
}