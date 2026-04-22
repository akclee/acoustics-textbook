'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const chapters = [
  {
    slug: '01-introduction',
    number: 1,
    title: 'The World of Sound',
    topics: ['Soundscapes & Spectra', "Lindsay's Wheel", 'What is Acoustics?'],
  },
  {
    slug: '02-standing-waves',
    number: 2,
    title: 'Standing Waves & Musical Acoustics',
    topics: ['Vibrating Strings', 'Pipes & Membranes', 'Musical Instruments'],
  },
  {
    slug: '03-signal-analysis',
    number: 3,
    title: 'Signal Analysis',
    topics: ['Time Series & Spectra', 'Filtering & LTI Systems', 'Convolution'],
  },
  {
    slug: '04-sound-levels',
    number: 4,
    title: 'Sound Levels & Propagation',
    topics: ['Decibels & SPL', 'Frequency Weighting', 'Outdoor Propagation'],
  },
  {
    slug: '05-hearing-speech',
    number: 5,
    title: 'Hearing & Speech',
    topics: ['Auditory Anatomy', 'Psychoacoustics', 'Speech Sounds'],
  },
  {
    slug: '06-architectural',
    number: 6,
    title: 'Architectural Acoustics',
    topics: ['Room Acoustics', 'BRIR', 'Vibration Isolation'],
  },
  {
    slug: '07-demos',
    number: 7,
    title: 'Interactive Demos',
    topics: ['SHM & Resonance', 'Damping', 'Spectrograms'],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-screen overflow-y-auto shrink-0">

      {/* Textbook title at top */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/" className="block">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Open Textbook
          </p>
          <h1 className="text-lg font-bold text-white leading-tight">
            Acoustics: The Science of Sound
          </h1>
        </Link>
      </div>

      {/* Chapter links */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-2 mb-3">
          Chapters
        </p>
        <ul className="space-y-1">
          {chapters.map((chapter) => {
            const href = `/chapters/${chapter.slug}`
            const isActive = pathname === href

            return (
              <li key={chapter.slug}>
                <Link
                  href={href}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`mt-0.5 text-xs font-mono shrink-0 w-5 text-center ${
                    isActive ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    {chapter.number}
                  </span>
                  <span className="font-medium">{chapter.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Open Educational Resource
        </p>
      </div>

    </aside>
  )
}