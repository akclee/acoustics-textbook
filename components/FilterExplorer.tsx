'use client'

// components/FilterExplorer.tsx
// Interactive frequency-response visualizer for the four classic filter types.
// Usage in MDX: <FilterExplorer />

import { useState, useMemo, useEffect } from 'react'

type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'bandstop'

const ORDER = 5        // Butterworth order — controls roll-off steepness
const MAX_F = 1000     // Hz shown on x-axis

// ── Butterworth gain helpers ────────────────────────────────────────────────
function lpGain(f: number, fc: number) {
  if (fc <= 0) return 0
  return 1 / Math.sqrt(1 + Math.pow(f / fc, 2 * ORDER))
}
function hpGain(f: number, fc: number) {
  if (f <= 0) return 0
  if (fc <= 0) return 1
  return 1 / Math.sqrt(1 + Math.pow(fc / f, 2 * ORDER))
}
function gain(f: number, type: FilterType, fc1: number, fc2: number): number {
  const lo = Math.min(fc1, fc2)
  const hi = Math.max(fc1, fc2)
  switch (type) {
    case 'lowpass':  return lpGain(f, fc1)
    case 'highpass': return hpGain(f, fc1)
    case 'bandpass': return hpGain(f, lo) * lpGain(f, hi)
    case 'bandstop': return 1 - hpGain(f, lo) * lpGain(f, hi)
  }
}

// ── SVG layout constants ────────────────────────────────────────────────────
const VW = 580, VH = 180
const ML = 48, MR = 16, MT = 22, MB = 34
const PW = VW - ML - MR
const PH = VH - MT - MB

function toX(f: number) { return ML + (f / MAX_F) * PW }
function toY(g: number) { return MT + PH * (1 - g) }

// ── Axes ────────────────────────────────────────────────────────────────────
function Axes() {
  const freqTicks = [0, 200, 400, 600, 800, 1000]
  const gainTicks = [0, 0.5, 1]
  return (
    <g>
      {/* grid */}
      {gainTicks.map(g => (
        <line key={g} x1={ML} y1={toY(g)} x2={ML + PW} y2={toY(g)}
          stroke="#e2e8f0" strokeWidth={g === 0 ? 1 : 0.75} />
      ))}
      {freqTicks.map(f => (
        <line key={f} x1={toX(f)} y1={MT} x2={toX(f)} y2={MT + PH}
          stroke="#e2e8f0" strokeWidth={0.75} />
      ))}
      {/* axes */}
      <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#94a3b8" strokeWidth={1.5} />
      {/* x labels */}
      {freqTicks.map(f => (
        <text key={f} x={toX(f)} y={MT + PH + 14} textAnchor="middle" fontSize={9} fill="#64748b">
          {f === 0 ? '0' : f === 1000 ? '1k' : f}
        </text>
      ))}
      {/* y labels */}
      {gainTicks.map(g => (
        <text key={g} x={ML - 6} y={toY(g) + 3} textAnchor="end" fontSize={9} fill="#64748b">
          {g.toFixed(1)}
        </text>
      ))}
      {/* axis titles */}
      <text x={ML + PW / 2} y={VH - 4} textAnchor="middle" fontSize={10} fill="#64748b">Frequency (Hz)</text>
      <text x={11} y={MT + PH / 2} textAnchor="middle" fontSize={10} fill="#64748b"
        transform={`rotate(-90,11,${MT + PH / 2})`}>Gain</text>
    </g>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
const TYPES: { type: FilterType; label: string }[] = [
  { type: 'lowpass',  label: 'Low-pass' },
  { type: 'highpass', label: 'High-pass' },
  { type: 'bandpass', label: 'Band-pass' },
  { type: 'bandstop', label: 'Band-stop (Notch)' },
]

const DESCRIPTIONS: Record<FilterType, string> = {
  lowpass:  'Passes frequencies below the cutoff; attenuates high frequencies. The roll-off steepness depends on filter order.',
  highpass: 'Passes frequencies above the cutoff; attenuates low frequencies.',
  bandpass: 'Passes a band of frequencies between two cutoffs; attenuates everything outside. Center frequency = midpoint between cutoffs.',
  bandstop: 'Rejects a band of frequencies (notch); passes everything else. Used to remove a specific interference frequency.',
}

const EXAMPLES: Record<FilterType, string> = {
  lowpass:  '🏠 Sound through a wall — only low frequencies pass through the structure.',
  highpass: '📞 Phone removes low rumble; the PSTN low cut is ~300 Hz.',
  bandpass: '📞 Telephone band: 300–3,400 Hz. Human speech intelligibility is preserved in this range.',
  bandstop: '🔌 Notch filter removes 60 Hz electrical hum from audio recordings.',
}

export default function FilterExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [type, setType]   = useState<FilterType>('lowpass')
  const [fc1, setFc1]     = useState(300)
  const [fc2, setFc2]     = useState(600)

  const isBand = type === 'bandpass' || type === 'bandstop'
  const loFc = Math.min(fc1, fc2)
  const hiFc = Math.max(fc1, fc2)

  // Build SVG path for frequency response curve
  const { curvePath, fillPath } = useMemo(() => {
    const pts: string[] = []
    const steps = PW * 2
    for (let i = 0; i <= steps; i++) {
      const f = (i / steps) * MAX_F
      const g = gain(f, type, fc1, fc2)
      const x = ML + (i / steps) * PW
      const y = toY(g)
      pts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
    }
    const curve = pts.join(' ')
    const fill = curve + ` L${ML + PW},${MT + PH} L${ML},${MT + PH} Z`
    return { curvePath: curve, fillPath: fill }
  }, [type, fc1, fc2])

  // Passband / stopband region labels
  const regionLabels = useMemo(() => {
    const labels: { x: number; y: number; text: string; color: string }[] = []
    const midY = MT + PH * 0.25
    const stopY = MT + PH * 0.75

    if (type === 'lowpass') {
      labels.push({ x: ML + (loFc / MAX_F) * PW / 2, y: midY, text: 'Passband', color: '#2563eb' })
      labels.push({ x: ML + (loFc / MAX_F) * PW + (PW - (loFc / MAX_F) * PW) / 2, y: stopY, text: 'Stopband', color: '#94a3b8' })
    } else if (type === 'highpass') {
      labels.push({ x: ML + PW * 0.15, y: stopY, text: 'Stopband', color: '#94a3b8' })
      labels.push({ x: ML + (fc1 / MAX_F) * PW + (PW - (fc1 / MAX_F) * PW) / 2, y: midY, text: 'Passband', color: '#2563eb' })
    } else if (type === 'bandpass') {
      labels.push({ x: ML + (loFc / MAX_F) * PW / 2, y: stopY, text: 'Stop', color: '#94a3b8' })
      labels.push({ x: ML + ((loFc + hiFc) / 2 / MAX_F) * PW, y: midY, text: 'Passband', color: '#2563eb' })
      labels.push({ x: ML + (hiFc / MAX_F) * PW + (PW - (hiFc / MAX_F) * PW) / 2, y: stopY, text: 'Stop', color: '#94a3b8' })
    } else {
      labels.push({ x: ML + (loFc / MAX_F) * PW / 2, y: midY, text: 'Pass', color: '#2563eb' })
      labels.push({ x: ML + ((loFc + hiFc) / 2 / MAX_F) * PW, y: stopY, text: 'Stopband', color: '#94a3b8' })
      labels.push({ x: ML + (hiFc / MAX_F) * PW + (PW - (hiFc / MAX_F) * PW) / 2, y: midY, text: 'Pass', color: '#2563eb' })
    }
    return labels
  }, [type, fc1, fc2, loFc, hiFc])

  const cutoffs = isBand ? [loFc, hiFc] : [fc1]

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 not-prose
                      flex items-center justify-center" style={{ minHeight: 260 }}>
        <span className="text-sm text-blue-400">Loading filter explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
        Interactive · Filter Explorer
      </p>

      {/* Filter type selector */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TYPES.map(({ type: t, label }) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              type === t
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG frequency response */}
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full rounded-xl bg-white border border-slate-100 mb-4">
        <defs>
          <linearGradient id="fe-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
          </linearGradient>
        </defs>

        <Axes />

        {/* Fill under curve */}
        <path d={fillPath} fill="url(#fe-fill)" />

        {/* Response curve */}
        <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />

        {/* Cutoff marker lines */}
        {cutoffs.map((fc, i) => (
          <g key={i}>
            <line x1={toX(fc)} y1={MT} x2={toX(fc)} y2={MT + PH}
              stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" />
            <text x={toX(fc) + 3} y={MT + 11} fontSize={9} fill="#b45309">
              {isBand ? `fc${i + 1}` : 'fc'} = {fc} Hz
            </text>
          </g>
        ))}

        {/* Region labels */}
        {regionLabels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize={9}
            fill={l.color} fontWeight="600" opacity={0.7}>{l.text}</text>
        ))}

        {/* Bandwidth label for band filters */}
        {isBand && (
          <g>
            <text x={toX((loFc + hiFc) / 2)} y={MT + PH + 26}
              textAnchor="middle" fontSize={9} fill="#7c3aed">
              BW = {hiFc - loFc} Hz · fc = {Math.round((loFc + hiFc) / 2)} Hz
            </text>
          </g>
        )}
      </svg>

      {/* Sliders */}
      <div className="space-y-3">
        {!isBand ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-700 w-40 shrink-0">
              Cutoff (fc): <strong>{fc1} Hz</strong>
            </span>
            <input type="range" min={50} max={950} value={fc1}
              onChange={e => setFc1(Number(e.target.value))}
              className="flex-1 accent-blue-600" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-700 w-40 shrink-0">
                Lower cutoff (fc1): <strong>{loFc} Hz</strong>
              </span>
              <input type="range" min={50} max={850} value={fc1}
                onChange={e => setFc1(Number(e.target.value))}
                className="flex-1 accent-blue-600" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-700 w-40 shrink-0">
                Upper cutoff (fc2): <strong>{hiFc} Hz</strong>
              </span>
              <input type="range" min={150} max={950} value={fc2}
                onChange={e => setFc2(Number(e.target.value))}
                className="flex-1 accent-blue-600" />
            </div>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 space-y-1">
        <p className="text-sm text-blue-900">{DESCRIPTIONS[type]}</p>
        <p className="text-xs text-blue-600 italic">{EXAMPLES[type]}</p>
      </div>
    </div>
  )
}