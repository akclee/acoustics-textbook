'use client'

// components/ActivitySoundwalk.tsx
// Activity 1: Soundwalk + Mars audio clip.
// Place after §1.1.2 (A Brief History of Acoustics).

export default function ActivitySoundwalk() {
  function startSoundwalk() {
    window.dispatchEvent(
      new CustomEvent('chatprompt', {
        detail: {
          message:
            "I'm ready for the soundwalk activity. Please guide me through noticing and describing the sounds in my environment right now — or the sounds I typically encounter in a day.",
        },
      })
    )
  }

  function startMars() {
    window.dispatchEvent(
      new CustomEvent('chatprompt', {
        detail: {
          message:
            "I just listened to the NASA Mars sound clip. Can you explain why we can still hear sound on Mars even though it has almost no atmosphere? How is sound on Mars different from sound on Earth?",
        },
      })
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-teal-100 bg-teal-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-teal-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">
          🎧 Activity 1 — Listening to Your World
        </p>
        <h3 className="text-lg font-bold text-teal-900 m-0">The Soundwalk</h3>
        <p className="text-sm text-teal-700 mt-1 leading-relaxed">
          Before we go further, let's ground acoustics in your everyday experience.
          A <strong>soundwalk</strong> is a focused listening exercise: you pay deliberate
          attention to all the sounds around you — their sources, qualities, distances,
          and meanings.
        </p>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Part A: Everyday sounds */}
        <div>
          <p className="text-sm font-semibold text-teal-800 mb-2">
            Part A — Your personal soundscape
          </p>
          <p className="text-sm text-teal-700 leading-relaxed mb-3">
            Take 60 seconds and simply listen. What do you hear right now?
            Then click below and the tutor will guide you through a reflection
            on the sounds of your day — and connect them to the branches of
            acoustics you just read about.
          </p>
          <button
            onClick={startSoundwalk}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <span>🎙️</span> Start soundwalk with tutor
          </button>
          <p className="text-xs text-teal-500 mt-2">
            You can also browse everyday sound clips at{' '}
            <a
              href="https://pixabay.com/sound-effects/search/everyday/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal-700"
            >
              Pixabay Sound Effects
            </a>{' '}
            (free, no account needed). Pick one that interests you and describe what you hear.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-teal-100" />

        {/* Part B: Mars clip */}
        <div>
          <p className="text-sm font-semibold text-teal-800 mb-2">
            Part B — Sound on Mars
          </p>
          <p className="text-sm text-teal-700 leading-relaxed mb-3">
            Sound requires a medium. Mars has a very thin atmosphere —
            about 1% the density of Earth's — yet sound can still propagate there.
            Listen to this recording captured by NASA's Perseverance rover,
            then ask the tutor why.
          </p>

          {/* Audio player */}
          <div className="bg-white rounded-xl border border-teal-200 p-4 mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              First audio recording of sounds on Mars
            </p>
            <audio controls className="w-full" preload="metadata">
              <source src="/audio/mars-sound.wav" type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-slate-400 mt-2">
              Source:{' '}
              <a
                href="https://science.nasa.gov/resource/first-audio-recording-of-sounds-on-mars/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-600"
              >
                NASA — First Audio Recording of Sounds on Mars
              </a>
              . Recorded by the Perseverance rover, February 2021.
            </p>
          </div>

          <button
            onClick={startMars}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <span>🪐</span> Discuss the Mars recording with tutor
          </button>
        </div>
      </div>
    </div>
  )
}