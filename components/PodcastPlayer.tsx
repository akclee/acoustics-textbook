'use client'

// components/PodcastPlayer.tsx
// Embedded podcast player for chapter audio.
// Props:
//   src      – path to audio file under /public (e.g. "/audio/episode.m4a")
//   title    – episode title shown in the player
//   position – "top" | "bottom" (controls the teaser message shown)

interface Props {
  src: string
  title?: string
  position?: 'top' | 'bottom'
}

export default function PodcastPlayer({
  src,
  title = 'Chapter Podcast',
  position = 'top',
}: Props) {
  const isTop = position === 'top'

  return (
    <div className="my-8 rounded-2xl border border-purple-200 bg-purple-50 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Headphones icon */}
        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="white"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 9v5a9 9 0 0 0 18 0V9"
            />
          </svg>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 leading-none mb-0.5">
            Chapter Podcast
          </p>
          <p className="text-sm font-semibold text-purple-900 leading-snug">{title}</p>
        </div>
      </div>

      {/* Teaser text */}
      <p className="text-sm text-purple-800 mb-4 leading-relaxed">
        {isTop
          ? 'Listen to an audio overview of this chapter before you begin reading — it can help you build a mental map of the key ideas.'
          : "You've finished the chapter! Re-listen to the podcast to reinforce what you've learned and hear how the concepts connect."}
      </p>

      {/* Native audio player */}
      <audio
        controls
        className="w-full rounded-xl accent-purple-600"
        preload="metadata"
      >
        <source src={src} type="audio/mp4" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}