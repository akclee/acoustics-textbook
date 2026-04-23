// components/diagrams/AcousticChainDiagram.tsx
// Flow diagram: Cause → Generating mechanism → Acoustic wave propagation
//               → Reception → Effect
// Simple horizontal arrows connect the stages.

const W = 720
const H = 90
const CY = H / 2

// Stage definitions
const stages = [
  { label: ['Cause'],                          filled: false },
  { label: ['Generating', 'mechanism', '(transduction)'], filled: true  },
  { label: ['Acoustic', 'wave', 'propagation'], filled: false },
  { label: ['Reception', '(transduction)'],    filled: true  },
  { label: ['Effect'],                         filled: false },
]

const ARROW_GAP = 28   // width reserved for each arrow
const BOX_PAD_X = 14   // horizontal padding inside filled boxes
const LINE_H    = 15   // vertical line-height for text

// Measure approximate text width so we can size boxes proportionally.
// We use a fixed char-width estimate (bold 13px ≈ 8px/char).
const CHAR_W = 7.8
function labelWidth(lines: string[]): number {
  const longest = Math.max(...lines.map(l => l.length))
  return longest * CHAR_W + BOX_PAD_X * 2
}

// Compute x positions
function layout() {
  const widths = stages.map(s => labelWidth(s.label))
  const total = widths.reduce((a, b) => a + b, 0) + ARROW_GAP * (stages.length - 1)
  const scale = W / total
  let x = 0
  return stages.map((s, i) => {
    const w = widths[i] * scale
    const pos = { x, w, ...s }
    x += w + ARROW_GAP
    return pos
  })
}

export default function AcousticChainDiagram() {
  const positions = layout()

  return (
    <figure className="my-6">
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[520px]"
          aria-label="Acoustic chain: Cause → Generating mechanism (transduction) → Acoustic wave propagation → Reception (transduction) → Effect"
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8"
                    refX="7" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#374151" />
            </marker>
          </defs>

          {positions.map((s, i) => {
            const cx = s.x + s.w / 2
            const textStartY = CY - ((s.label.length - 1) * LINE_H) / 2

            return (
              <g key={i}>
                {/* Box (filled stages only) */}
                {s.filled && (
                  <rect
                    x={s.x} y={12} width={s.w} height={H - 24}
                    rx={6} fill="#1e293b"
                  />
                )}

                {/* Text */}
                {s.label.map((line, j) => (
                  <text
                    key={j}
                    x={cx}
                    y={textStartY + j * LINE_H}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight="700"
                    fill={s.filled ? '#ffffff' : '#1e293b'}
                    fontFamily="system-ui, sans-serif"
                  >
                    {line}
                  </text>
                ))}

                {/* Arrow to next stage */}
                {i < positions.length - 1 && (
                  <line
                    x1={s.x + s.w + 3}
                    y1={CY}
                    x2={s.x + s.w + ARROW_GAP - 6}
                    y2={CY}
                    stroke="#374151"
                    strokeWidth={2}
                    markerEnd="url(#arrowhead)"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        The acoustic chain: every sound event involves a cause, a generating mechanism,
        wave propagation through a medium, reception, and a perceptual or physical effect.
      </figcaption>
    </figure>
  )
}