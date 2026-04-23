// components/diagrams/SourceFilterDiagram.tsx
// Block diagram of the source-filter model of speech:
//   Vocal folds (source) → Vocal tract (filter) → Ear (receiver)
// Each block is accompanied by a small sketch of its spectrum shape.

const W = 660
const H = 220

// Block layout
const blocks = [
  {
    x: 30, y: 60, w: 140, h: 64,
    title: 'Source',
    subtitle: 'Vocal folds',
    color: '#dbeafe', border: '#3b82f6', text: '#1d4ed8',
    specLabel: 'Harmonic series',
  },
  {
    x: 260, y: 60, w: 140, h: 64,
    title: 'Filter',
    subtitle: 'Vocal tract',
    color: '#fef3c7', border: '#f59e0b', text: '#92400e',
    specLabel: 'Formant peaks',
  },
  {
    x: 490, y: 60, w: 140, h: 64,
    title: 'Receiver',
    subtitle: 'Ear / listener',
    color: '#dcfce7', border: '#22c55e', text: '#15803d',
    specLabel: 'Perceived sound',
  },
]

// Arrow positions (centre-right of each block → centre-left of next)
const arrows = [
  { x1: 170, y1: 92, x2: 258, y2: 92 },
  { x1: 400, y1: 92, x2: 488, y2: 92 },
]

// Mini spectrum sketches below each block
function SourceSpectrum({ cx, topY }: { cx: number; topY: number }) {
  // Even-height harmonic bars — line spectrum
  const bars = [0, 1, 2, 3, 4, 5, 6]
  const barW = 5
  const spacing = 14
  const maxH = 28
  return (
    <g>
      {bars.map((i) => {
        const amp = 1 / (i + 1)
        const bx = cx - (bars.length * spacing) / 2 + i * spacing
        const bh = amp * maxH
        return (
          <rect key={i} x={bx - barW / 2} y={topY + maxH - bh}
                width={barW} height={bh} fill="#3b82f6" opacity={0.7} rx={1} />
        )
      })}
      <text x={cx} y={topY + maxH + 12} textAnchor="middle" fontSize={8} fill="#6b7280">
        f₀  2f₀  3f₀ …
      </text>
    </g>
  )
}

function FilterSpectrum({ cx, topY }: { cx: number; topY: number }) {
  // Three equal-height Gaussian peaks at F1, F2, F3
  const POINTS = 120
  const maxH = 28
  const bw = 110
  const formants = [0.2, 0.5, 0.8]   // positions along t=[0,1]
  const sigma = 0.006                 // controls peak width
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const t = i / POINTS
    const x = cx - bw / 2 + t * bw
    const val = formants.reduce((sum, f0) =>
      sum + Math.exp(-((t - f0) ** 2) / sigma), 0)
    const y = topY + maxH - Math.min(val, 1) * maxH
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const base = `L${(cx + bw / 2).toFixed(1)},${(topY + maxH).toFixed(1)} L${(cx - bw / 2).toFixed(1)},${(topY + maxH).toFixed(1)} Z`
  // Peak label positions
  const labelXs = formants.map(f => cx - bw / 2 + f * bw)
  return (
    <g>
      <path d={pts.join(' ') + base} fill="#f59e0b" opacity={0.35} />
      <path d={pts.join(' ')} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      {['F1', 'F2', 'F3'].map((label, i) => (
        <text key={label} x={labelXs[i]} y={topY + maxH + 12}
              textAnchor="middle" fontSize={8} fill="#6b7280">{label}</text>
      ))}
    </g>
  )
}

function OutputSpectrum({ cx, topY }: { cx: number; topY: number }) {
  // Harmonic bars shaped by three formants:
  // F1 region (left) → tallest; F2 (middle) → medium; F3 (right) → shortest.
  // Uses same Gaussian envelope as FilterSpectrum to stay consistent.
  const bars = [0, 1, 2, 3, 4, 5, 6]
  const barW = 5
  const spacing = 14
  const maxH = 28
  const bw = 110
  const formants = [0.2, 0.5, 0.8]
  // Descending peak heights: F1=1.0, F2=0.6, F3=0.35
  const peakAmps = [1.0, 0.6, 0.35]
  const sigma = 0.006

  return (
    <g>
      {bars.map((i) => {
        const bx = cx - (bars.length * spacing) / 2 + i * spacing
        // Normalise bar x to [0,1] within the bw window
        const t = (bx - (cx - bw / 2)) / bw
        // Evaluate weighted Gaussian envelope at this t
        const val = formants.reduce((sum, f0, fi) =>
          sum + peakAmps[fi] * Math.exp(-((t - f0) ** 2) / sigma), 0)
        const bh = Math.min(val, 1) * maxH
        return (
          <rect key={i} x={bx - barW / 2} y={topY + maxH - bh}
                width={barW} height={Math.max(bh, 1)} fill="#22c55e" opacity={0.75} rx={1} />
        )
      })}
      <text x={cx} y={topY + maxH + 12} textAnchor="middle" fontSize={8} fill="#6b7280">
        harmonics shaped by formants
      </text>
    </g>
  )
}

export default function SourceFilterDiagram() {
  const specTop = 148

  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[540px]"
             aria-label="Source-filter model of speech production">

          {/* Title */}
          <text x={W / 2} y={18} textAnchor="middle" fontSize={12}
                fontWeight="700" fill="#374151">
            Source–Filter Model of Speech
          </text>

          {/* Blocks */}
          {blocks.map((b) => (
            <g key={b.title}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h}
                    fill={b.color} stroke={b.border} strokeWidth={1.5} rx={10} />
              <text x={b.x + b.w / 2} y={b.y + 24} textAnchor="middle"
                    fontSize={12} fontWeight="700" fill={b.text}>
                {b.title}
              </text>
              <text x={b.x + b.w / 2} y={b.y + 40} textAnchor="middle"
                    fontSize={10} fill={b.text} opacity={0.8}>
                {b.subtitle}
              </text>
              <text x={b.x + b.w / 2} y={b.y + 56} textAnchor="middle"
                    fontSize={9} fill={b.text} opacity={0.6} fontStyle="italic">
                {b.specLabel}
              </text>
            </g>
          ))}

          {/* Arrows with × for filter */}
          {arrows.map((a, i) => (
            <g key={i}>
              <defs>
                <marker id={`arrow${i}`} markerWidth="8" markerHeight="8"
                        refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
                </marker>
              </defs>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                    stroke="#94a3b8" strokeWidth={2}
                    markerEnd={`url(#arrow${i})`} />
              {/* Operator label above arrow */}
              <text x={(a.x1 + a.x2) / 2} y={a.y1 - 8}
                    textAnchor="middle" fontSize={11} fill="#94a3b8">
                {i === 0 ? '×' : '→'}
              </text>
              <text x={(a.x1 + a.x2) / 2} y={a.y1 + 14}
                    textAnchor="middle" fontSize={8} fill="#94a3b8" fontStyle="italic">
                {i === 0 ? '(convolution)' : ''}
              </text>
            </g>
          ))}

          {/* Mini spectra */}
          <SourceSpectrum cx={30 + 70} topY={specTop} />
          <FilterSpectrum cx={260 + 70} topY={specTop} />
          <OutputSpectrum cx={490 + 70} topY={specTop} />

        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        The source–filter model. The vocal folds produce a harmonic source signal;
        the vocal tract filter shapes it via formant resonances; the ear receives the result.
      </figcaption>
    </figure>
  )
}