// components/diagrams/WaveformSpectrumDiagram.tsx
// Side-by-side: time-domain waveform (sum of 3 sinusoids) on the left,
// frequency-domain spectrum (bar chart) on the right.
// All static SVG — no interactivity needed.

const W = 660
const H = 200
const HALF = W / 2
const PAD = 20
const PLOT_W = HALF - PAD * 2 - 10
const PLOT_H = H - 60
const PLOT_TOP = 30
const DIVIDER = HALF

// --- Waveform (left panel) ---
// Composite: f1=1, f2=2, f3=3 with amplitudes 1, 0.5, 0.25
const POINTS = 300
function buildWaveform(): string {
  const pts: string[] = []
  const cx = PAD + 10
  const cy = PLOT_TOP + PLOT_H / 2
  const scaleY = (PLOT_H / 2) * 0.85
  for (let i = 0; i <= POINTS; i++) {
    const t = (i / POINTS) * 2 * Math.PI * 2
    const y = Math.sin(t) + 0.5 * Math.sin(2 * t) + 0.25 * Math.sin(3 * t)
    const sx = cx + (i / POINTS) * PLOT_W
    const sy = cy - (y / 1.75) * scaleY
    pts.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(2)},${sy.toFixed(2)}`)
  }
  return pts.join(' ')
}

// --- Spectrum (right panel) ---
// Bars at f=1,2,3 with heights proportional to amplitudes 1, 0.5, 0.25
const components = [
  { label: 'f₀', amp: 1.0, color: '#3b82f6' },
  { label: '2f₀', amp: 0.5, color: '#6366f1' },
  { label: '3f₀', amp: 0.25, color: '#8b5cf6' },
]
const BAR_W = 18
const spectrumLeft = DIVIDER + PAD + 10
const spectrumRight = spectrumLeft + PLOT_W
const spectrumStep = PLOT_W / (components.length + 1)
const spectrumBaseY = PLOT_TOP + PLOT_H

export default function WaveformSpectrumDiagram() {
  const waveformPath = buildWaveform()
  const leftCY = PLOT_TOP + PLOT_H / 2
  const leftCX = PAD + 10

  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" aria-label="Waveform and spectrum diagram">

          {/* ── Left panel: Waveform ── */}
          {/* Panel label */}
          <text x={leftCX + PLOT_W / 2} y={16} textAnchor="middle" fontSize={11}
                fontWeight="600" fill="#374151">Time Domain (Waveform)</text>

          {/* Axes */}
          <line x1={leftCX} y1={leftCY} x2={leftCX + PLOT_W} y2={leftCY}
                stroke="#e2e8f0" strokeWidth={1} />
          <line x1={leftCX} y1={PLOT_TOP} x2={leftCX} y2={PLOT_TOP + PLOT_H}
                stroke="#e2e8f0" strokeWidth={1} />

          {/* Axis labels */}
          <text x={leftCX + PLOT_W / 2} y={PLOT_TOP + PLOT_H + 14}
                textAnchor="middle" fontSize={9} fill="#94a3b8">Time →</text>
          <text x={leftCX - 8} y={leftCY} textAnchor="end"
                dominantBaseline="middle" fontSize={9} fill="#94a3b8">0</text>

          {/* Waveform */}
          <path d={waveformPath} fill="none" stroke="#3b82f6" strokeWidth={2}
                strokeLinejoin="round" />

          {/* Divider */}
          <line x1={DIVIDER} y1={PLOT_TOP - 10} x2={DIVIDER} y2={PLOT_TOP + PLOT_H + 20}
                stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 4" />

          {/* ── Right panel: Spectrum ── */}
          {/* Panel label */}
          <text x={spectrumLeft + PLOT_W / 2} y={16} textAnchor="middle" fontSize={11}
                fontWeight="600" fill="#374151">Frequency Domain (Spectrum)</text>

          {/* Axes */}
          <line x1={spectrumLeft} y1={spectrumBaseY} x2={spectrumLeft + PLOT_W} y2={spectrumBaseY}
                stroke="#e2e8f0" strokeWidth={1} />
          <line x1={spectrumLeft} y1={PLOT_TOP} x2={spectrumLeft} y2={spectrumBaseY}
                stroke="#e2e8f0" strokeWidth={1} />

          {/* Axis labels */}
          <text x={spectrumLeft + PLOT_W / 2} y={spectrumBaseY + 14}
                textAnchor="middle" fontSize={9} fill="#94a3b8">Frequency →</text>
          <text x={spectrumLeft - 8} y={spectrumBaseY} textAnchor="end"
                dominantBaseline="middle" fontSize={9} fill="#94a3b8">0</text>

          {/* Bars */}
          {components.map((c, i) => {
            const barX = spectrumLeft + spectrumStep * (i + 1)
            const barH = c.amp * (PLOT_H * 0.8)
            const barY = spectrumBaseY - barH
            return (
              <g key={c.label}>
                <rect x={barX - BAR_W / 2} y={barY} width={BAR_W} height={barH}
                      fill={c.color} rx={3} opacity={0.85} />
                {/* Amplitude label above bar */}
                <text x={barX} y={barY - 4} textAnchor="middle" fontSize={9}
                      fill={c.color} fontWeight="600">
                  {c.amp === 1 ? 'A' : c.amp === 0.5 ? 'A/2' : 'A/4'}
                </text>
                {/* Frequency label below axis */}
                <text x={barX} y={spectrumBaseY + 12} textAnchor="middle"
                      fontSize={9} fill="#4b5563">{c.label}</text>
              </g>
            )
          })}

          {/* Fourier transform arrow */}
          <text x={DIVIDER} y={PLOT_TOP + PLOT_H / 2 - 8} textAnchor="middle"
                fontSize={9} fill="#94a3b8" fontStyle="italic">Fourier</text>
          <text x={DIVIDER} y={PLOT_TOP + PLOT_H / 2 + 4} textAnchor="middle"
                fontSize={9} fill="#94a3b8" fontStyle="italic">transform</text>
          <text x={DIVIDER} y={PLOT_TOP + PLOT_H / 2 + 16} textAnchor="middle"
                fontSize={12} fill="#94a3b8">⟷</text>

        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        The same complex tone shown in the time domain (left) and frequency domain (right).
        The Fourier transform converts between the two representations.
      </figcaption>
    </figure>
  )
}