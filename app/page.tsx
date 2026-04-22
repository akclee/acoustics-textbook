import Link from 'next/link'

const chapters = [
  {
    slug: '01-introduction',
    number: 1,
    title: 'The World of Sound',
    description: 'Soundscapes, spectra, and the nature of acoustic phenomena.',
  },
  {
    slug: '02-standing-waves',
    number: 2,
    title: 'Standing Waves & Musical Acoustics',
    description: 'Vibrating strings, pipes, membranes, and musical instruments.',
  },
  {
    slug: '03-signal-analysis',
    number: 3,
    title: 'Signal Analysis',
    description: 'Time series, frequency spectra, filtering, and LTI systems.',
  },
  {
    slug: '04-sound-levels',
    number: 4,
    title: 'Sound Levels & Propagation',
    description: 'Decibels, SPL, frequency weighting, and outdoor propagation.',
  },
  {
    slug: '05-hearing-speech',
    number: 5,
    title: 'Hearing & Speech',
    description: 'Auditory anatomy, psychoacoustics, and speech sounds.',
  },
  {
    slug: '06-architectural',
    number: 6,
    title: 'Architectural Acoustics',
    description: 'Room acoustics, binaural responses, and vibration isolation.',
  },
  {
    slug: '07-demos',
    number: 7,
    title: 'Interactive Demos',
    description: 'Hands-on simulations for SHM, resonance, damping, and spectrograms.',
  },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">

      {/* Hero section */}
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">
          Open Educational Resource
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acoustics: The Science of Sound
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          An interactive textbook exploring the physics, engineering, and perception of sound —
          from vibrating strings to architectural spaces, with an AI tutor available throughout.
        </p>
        <div className="mt-6">
          <Link
            href="/chapters/01-introduction"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Reading →
          </Link>
        </div>
      </div>

      {/* Chapter cards */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">
          Contents
        </h2>
        <div className="space-y-3">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/chapters/${chapter.slug}`}
              className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl font-bold text-gray-200 group-hover:text-blue-200 transition-colors w-8 shrink-0 mt-0.5 font-mono">
                {chapter.number}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {chapter.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{chapter.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}