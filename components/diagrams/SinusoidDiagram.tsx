// components/diagrams/SinusoidDiagram.tsx
// Static SVG diagram labeling the key parameters of a sinusoid:
// Amplitude (A), Period (T), and Phase (φ).
// No interactivity needed — this is for the "reading" view.
// Usage in MDX: <SinusoidDiagram />

const W = 560
const H = 200
const CY = H / 2
const POINTS = 400

function sinePath(A: number, f: number, phi: number): string {
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const x = (i / POINTS) * W
    const t = (i / POINTS) * 2 * Math.PI * 2
    const y = CY - A * (H * 0.42) * Math.sin(f * t + phi)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

export default function SinusoidDiagram() {
  const A = 1
  const f = 1
  const phi = 0
  const path = sinePath(A, f, phi)

  const peakY = CY - H * 0.42
  const periodPx = W / 2   // one full cycle = half the SVG width (f=1 → 2 cycles)
  const halfPeriodX = periodPx

  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Sinusoid diagram showing amplitude, period, and phase">
          {/* Axis */}
          <line x1={0} y1={CY} x2={W} y2={CY} stroke="#cbd5e1" strokeWidth={1.5} />
          {/* Dashed amplitude lines */}
          <line x1={0} y1={peakY} x2={W} y2={peakY} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 3" />
          <line x1={0} y1={H - peakY} x2={W} y2={H - peakY} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 3" />

          {/* Sine wave */}
          <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" />

          {/* — Amplitude annotation (left side, first quarter) — */}
          {/* Vertical brace */}
          <line x1={20} y1={CY} x2={20} y2={peakY} stroke="#f59e0b" strokeWidth={1.5} />
          <line x1={14} y1={CY} x2={26} y2={CY} stroke="#f59e0b" strokeWidth={1} />
          <line x1={14} y1={peakY} x2={26} y2={peakY} stroke="#f59e0b" strokeWidth={1} />
          <text x={28} y={(CY + peakY) / 2} dominantBaseline="middle"
                fontSize={12} fill="#d97706" fontWeight="600" fontFamily="serif">
            A
          </text>

          {/* — Period annotation (bottom, first cycle) — */}
          <line x1={4} y1={H - 16} x2={halfPeriodX} y2={H - 16} stroke="#6366f1" strokeWidth={1.5} />
          <line x1={4} y1={H - 22} x2={4} y2={H - 10} stroke="#6366f1" strokeWidth={1} />
          <line x1={halfPeriodX} y1={H - 22} x2={halfPeriodX} y2={H - 10} stroke="#6366f1" strokeWidth={1} />
          <text x={halfPeriodX / 2} y={H - 18} textAnchor="middle" dominantBaseline="auto"
                fontSize={12} fill="#6366f1" fontWeight="600" fontFamily="serif">
            T
          </text>

          {/* — Equation label — centred at the top of the panel — */}
          <text x={W / 2} y={14} textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fill="#64748b" fontFamily="monospace">
            p(t) = A · sin(2πft + φ)
          </text>

          {/* Labels at extremes */}
          <text x={30} y={peakY - 6} fontSize={10} fill="#94a3b8">+A</text>
          <text x={30} y={H - peakY + 14} fontSize={10} fill="#94a3b8">−A</text>
          <text x={4} y={CY - 6} fontSize={10} fill="#94a3b8">0</text>
        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        A sinusoidal wave showing amplitude <em>A</em>, period <em>T</em>, and the general equation.
      </figcaption>
    </figure>
  )
}