// components/diagrams/InterferenceDiagram.tsx
// Shows constructive interference (in-phase) and destructive interference
// (out-of-phase) side by side, each with two input waves and the resulting sum.

const W = 660
const H = 270
const HALF = W / 2
const PAD = 16
const DIVIDER = HALF
const PLOT_W = HALF - PAD * 2 - 6

const POINTS = 250
const ROW_H = 52   // height per wave row
const TOP_PAD = 28
const AMP = ROW_H * 0.28   // single-wave amplitude (~14.6 px)

function sinePath(
  xOffset: number,
  yCenter: number,
  amp: number,
  phase: number,
  width = PLOT_W
): string {
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const t = (i / POINTS) * 2 * Math.PI * 1.5
    const x = xOffset + (i / POINTS) * width
    const y = yCenter - amp * Math.sin(t + phase)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

// Returns the sum of two sinusoids at full scale (no normalisation).
// For constructive (phase2=0): result is 2× amplitude.
// For destructive (phase2=π): result is 0 (flat line).
function sumPath(
  xOffset: number,
  yCenter: number,
  amp: number,
  phase2: number,
  width = PLOT_W
): string {
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const t = (i / POINTS) * 2 * Math.PI * 1.5
    const sum = amp * Math.sin(t) + amp * Math.sin(t + phase2)
    const x = xOffset + (i / POINTS) * width
    const y = yCenter - sum
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

interface PanelProps {
  xOffset: number
  title: string
  titleColor: string
  phase2: number
  sumColor: string
  sumLabel: string
  /** How many × AMP the sum wave reaches at its peak */
  sumAmpScale: number
}

function Panel({ xOffset, title, titleColor, phase2, sumColor, sumLabel, sumAmpScale }: PanelProps) {
  const row1Y = TOP_PAD + ROW_H * 0.55
  const row2Y = TOP_PAD + ROW_H * 1.55
  // Push the sum row further down to give room for a taller wave
  const sumY  = TOP_PAD + ROW_H * 2.85
  const sumPeakAmp = AMP * sumAmpScale

  return (
    <g>
      {/* Panel title */}
      <text x={xOffset + PLOT_W / 2} y={14} textAnchor="middle"
            fontSize={11} fontWeight="700" fill={titleColor}>
        {title}
      </text>

      {/* Wave 1 */}
      <text x={xOffset} y={row1Y - AMP - 4} fontSize={9} fill="#6b7280">Wave 1</text>
      <line x1={xOffset} y1={row1Y} x2={xOffset + PLOT_W} y2={row1Y}
            stroke="#e2e8f0" strokeWidth={1} />
      <path d={sinePath(xOffset, row1Y, AMP, 0)}
            fill="none" stroke="#3b82f6" strokeWidth={1.8} />

      {/* Wave 2 */}
      <text x={xOffset} y={row2Y - AMP - 4} fontSize={9} fill="#6b7280">Wave 2</text>
      <line x1={xOffset} y1={row2Y} x2={xOffset + PLOT_W} y2={row2Y}
            stroke="#e2e8f0" strokeWidth={1} />
      <path d={sinePath(xOffset, row2Y, AMP, phase2)}
            fill="none" stroke="#f59e0b" strokeWidth={1.8} />

      {/* "+" and "=" connectors */}
      <text x={xOffset + PLOT_W / 2} y={sumY - sumPeakAmp - 16}
            textAnchor="middle" fontSize={13} fill="#94a3b8">+</text>

      {/* Sum label */}
      <text x={xOffset} y={sumY - sumPeakAmp - 4}
            fontSize={9} fill={sumColor} fontWeight="600">
        Sum → {sumLabel}
      </text>
      <line x1={xOffset} y1={sumY} x2={xOffset + PLOT_W} y2={sumY}
            stroke="#e2e8f0" strokeWidth={1} />
      <path d={sumPath(xOffset, sumY, AMP, phase2)}
            fill="none" stroke={sumColor} strokeWidth={2.4} />
    </g>
  )
}

export default function InterferenceDiagram() {
  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]"
             aria-label="Constructive and destructive interference diagram">

          {/* Constructive (left) — sum reaches 2× AMP */}
          <Panel
            xOffset={PAD + 6}
            title="Constructive Interference (in phase)"
            titleColor="#16a34a"
            phase2={0}
            sumColor="#16a34a"
            sumLabel="doubled amplitude"
            sumAmpScale={2}
          />

          {/* Divider */}
          <line x1={DIVIDER} y1={10} x2={DIVIDER} y2={H - 10}
                stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" />

          {/* Destructive (right) — sum is 0 */}
          <Panel
            xOffset={DIVIDER + PAD + 6}
            title="Destructive Interference (out of phase)"
            titleColor="#dc2626"
            phase2={Math.PI}
            sumColor="#dc2626"
            sumLabel="silence (cancellation)"
            sumAmpScale={1}
          />

        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        When two identical waves are added in phase (0° offset) the amplitudes double.
        When they are exactly out of phase (180° offset) they cancel completely.
      </figcaption>
    </figure>
  )
}