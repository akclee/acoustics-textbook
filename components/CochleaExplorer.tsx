'use client'

// components/CochleaExplorer.tsx
// Interactive tonotopic map of the unrolled cochlea.
// A logarithmic frequency slider highlights the region of the basilar membrane
// that responds maximally to that frequency, with a traveling-wave envelope.
// Usage in MDX: <CochleaExplorer />

import { useState, useMemo, useEffect } from 'react'

// ── Layout ────────────────────────────────────────────────────────────────────
const VW = 580
const COCHLEA_Y = 70        // top of cochlea band
const COCHLEA_H = 52        // height of basilar membrane band
const ML = 48, MR = 20
const PW = VW - ML - MR    // plot width

// ── Frequency range ───────────────────────────────────────────────────────────
const F_MIN = 20
const F_MAX = 20000

// Greenwood (1990) tonotopic map for human cochlea
// x = position from apex (0 = apex, 1 = base)
// f(x) = A * (10^(a*x) - k)  with A=165.4, a=2.1, k=0.88
// Inverted: x(f) = log10((f/165.4) + 0.88) / 2.1
// Verification: x=0 → 165.4*(1-0.88)≈20 Hz; x=1 → 165.4*(126-0.88)≈20 kHz ✓
function freqToPosition(f: number): number {
  const x = Math.log10(f / 165.4 + 0.88) / 2.1
  // x ranges from ~0 (apex, 20 Hz) to ~1 (base, 20 kHz)
  return Math.max(0, Math.min(1, x))
}

// Map position (0=apex, 1=base) to SVG x-coordinate
// We draw base on the LEFT (stapes) and apex on the RIGHT
function posToX(pos: number): number {
  return ML + (1 - pos) * PW
}

// ── Traveling wave envelope ────────────────────────────────────────────────────
// Approximate BM displacement envelope for a given frequency.
// Peak near characteristic place; steep high-frequency cutoff (basal of peak),
// gradual low-frequency slope (apical of peak).
function makeEnvelope(peakPos: number, n = 120): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= n; i++) {
    const pos = i / n   // 0 = apex, 1 = base
    const svgX = posToX(pos)

    // Distance from peak in position units (positive = basal of peak)
    const d = pos - peakPos

    let amp: number
    if (d > 0) {
      // Basal side (high-freq cutoff): steep exponential drop
      amp = Math.exp(-12 * d)
    } else {
      // Apical side (low-freq slope): gentle exponential rise to peak
      amp = Math.exp(2.5 * d)
    }

    const amplitude = COCHLEA_H * 0.42 * amp
    const cx = COCHLEA_Y + COCHLEA_H / 2
    points.push({ x: svgX, y: cx - amplitude })
  }
  return points
}

// ── Frequency-to-color helper (hue: blue=high, red=low) ───────────────────────
function freqToHue(f: number): number {
  // log-map: 20 Hz → hue 0 (red), 20 kHz → hue 240 (blue)
  const t = (Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN))
  return Math.round(t * 240)
}

// ── Axis tick frequencies ─────────────────────────────────────────────────────
const TICKS = [100, 500, 1000, 2000, 4000, 8000, 16000]

// ── Region labels on the cochlea ──────────────────────────────────────────────
const REGION_LABELS = [
  { freq: 250,   label: '250 Hz' },
  { freq: 1000,  label: '1 kHz'  },
  { freq: 4000,  label: '4 kHz'  },
  { freq: 16000, label: '16 kHz' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function CochleaExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Log-scale slider: slider value is log10(freq)
  const [logF, setLogF] = useState(Math.log10(1000))
  const freq = Math.round(Math.pow(10, logF))

  const peakPos = useMemo(() => freqToPosition(freq), [freq])
  const peakX   = posToX(peakPos)
  const hue     = freqToHue(freq)
  const color   = `hsl(${hue},80%,48%)`

  const envelope = useMemo(() => makeEnvelope(peakPos), [peakPos])
  const envPath  = envelope.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Mirror path for lower half of wave
  const envPathMirror = envelope.map((p, i) => {
    const cy = COCHLEA_Y + COCHLEA_H / 2
    const mirrorY = 2 * cy - p.y
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${mirrorY.toFixed(1)}`
  }).join(' ')

  const freqLabel = freq >= 1000
    ? `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)} kHz`
    : `${freq} Hz`

  const SVG_H = COCHLEA_Y + COCHLEA_H + 80

  // Region description
  let region = ''
  if (freq < 500)        region = 'apex — low frequencies (vowel pitch, bass)'
  else if (freq < 2000)  region = 'mid-cochlea — speech fundamentals & low harmonics'
  else if (freq < 6000)  region = 'mid-base — speech consonants & high harmonics'
  else                   region = 'base — high frequencies (sibilants, fine detail)'

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 260 }}>
        <span className="text-sm text-emerald-400">Loading cochlea explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
        Interactive · Tonotopic Map of the Cochlea
      </p>
      <p className="text-sm text-emerald-800 mb-4">
        Drag the slider to see where on the basilar membrane a given frequency produces its maximum response.
        The cochlea is shown "unrolled" — the <strong>base</strong> (stapes end) is on the left, the <strong>apex</strong> is on the right.
      </p>

      {/* Slider */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xs font-medium text-slate-700 w-40 shrink-0">
          Frequency: <strong style={{ color }}>{freqLabel}</strong>
        </span>
        <input
          type="range"
          min={Math.log10(F_MIN)}
          max={Math.log10(F_MAX)}
          step={0.005}
          value={logF}
          onChange={e => setLogF(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: color }}
        />
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${VW} ${SVG_H}`} className="w-full rounded-xl bg-white border border-slate-100 mb-3">

        {/* ── Cochlea band (gradient base-to-apex) ── */}
        <defs>
          <linearGradient id="cochleaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* Left = base (high freq, blue), Right = apex (low freq, red) */}
            <stop offset="0%"   stopColor="hsl(240,70%,85%)" />
            <stop offset="30%"  stopColor="hsl(180,70%,85%)" />
            <stop offset="60%"  stopColor="hsl(90,70%,85%)"  />
            <stop offset="100%" stopColor="hsl(0,70%,85%)"   />
          </linearGradient>
          <clipPath id="cochleaClip">
            <rect x={ML} y={COCHLEA_Y} width={PW} height={COCHLEA_H} rx={6} />
          </clipPath>
        </defs>

        {/* Outer rounded rect (the cochlea band) */}
        <rect x={ML} y={COCHLEA_Y} width={PW} height={COCHLEA_H}
          fill="url(#cochleaGrad)" rx={6} />

        {/* Basilar membrane center line */}
        <line x1={ML} y1={COCHLEA_Y + COCHLEA_H / 2}
              x2={ML + PW} y2={COCHLEA_Y + COCHLEA_H / 2}
          stroke="rgba(0,0,0,0.15)" strokeWidth={1} />

        {/* Traveling wave (clipped to cochlea) */}
        <g clipPath="url(#cochleaClip)">
          <path d={envPath} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" opacity={0.9} />
          <path d={envPathMirror} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" opacity={0.9} />
          {/* Fill between envelope and mirror */}
          <path
            d={`${envPath} L${envelope[envelope.length-1].x.toFixed(1)},${(COCHLEA_Y + COCHLEA_H / 2).toFixed(1)} ${envPathMirror.replace('M', 'L')} Z`}
            fill={color}
            opacity={0.15}
          />
        </g>

        {/* Peak marker */}
        <line x1={peakX} y1={COCHLEA_Y - 4} x2={peakX} y2={COCHLEA_Y + COCHLEA_H + 4}
          stroke={color} strokeWidth={2} strokeDasharray="4 3" />
        <circle cx={peakX} cy={COCHLEA_Y + COCHLEA_H / 2} r={5}
          fill={color} stroke="white" strokeWidth={1.5} />

        {/* ── Region tick labels ── */}
        {REGION_LABELS.map(({ freq: lf, label }) => {
          const lpos = freqToPosition(lf)
          const lx   = posToX(lpos)
          return (
            <g key={lf}>
              <line x1={lx} y1={COCHLEA_Y + COCHLEA_H} x2={lx} y2={COCHLEA_Y + COCHLEA_H + 5}
                stroke="#94a3b8" strokeWidth={0.75} />
              <text x={lx} y={COCHLEA_Y + COCHLEA_H + 14} textAnchor="middle"
                fontSize={8} fill="#94a3b8">{label}</text>
            </g>
          )
        })}

        {/* ── Axis labels ── */}
        <text x={ML}      y={COCHLEA_Y + COCHLEA_H + 28} textAnchor="start"  fontSize={9} fill="#64748b" fontWeight="600">
          ← Base (stapes / high freq)
        </text>
        <text x={ML + PW} y={COCHLEA_Y + COCHLEA_H + 28} textAnchor="end"    fontSize={9} fill="#64748b" fontWeight="600">
          Apex (low freq) →
        </text>

        {/* ── Peak frequency label ── */}
        {peakX > ML + 40 && peakX < ML + PW - 40 ? (
          <text x={peakX} y={COCHLEA_Y - 10} textAnchor="middle"
            fontSize={10} fill={color} fontWeight="700">{freqLabel}</text>
        ) : (
          <text x={peakX < ML + 40 ? ML + 4 : ML + PW - 4}
            y={COCHLEA_Y - 10}
            textAnchor={peakX < ML + 40 ? 'start' : 'end'}
            fontSize={10} fill={color} fontWeight="700">{freqLabel}</text>
        )}

        {/* ── Anatomy labels ── */}
        <text x={ML + 10} y={COCHLEA_Y + 14} fontSize={8} fill="hsl(240,50%,40%)" fontWeight="600">STAPES</text>
        <text x={ML + PW - 10} y={COCHLEA_Y + 14} textAnchor="end" fontSize={8} fill="hsl(0,50%,40%)" fontWeight="600">HELICOTREMA</text>

      </svg>

      {/* Dynamic observation */}
      <div className="rounded-xl border px-4 py-2.5 text-xs"
        style={{ background: `hsl(${hue},60%,96%)`, borderColor: `hsl(${hue},60%,80%)`, color: `hsl(${hue},60%,25%)` }}>
        <strong style={{ color }}>{freqLabel}</strong> is processed at the <strong>{region}</strong>.
        {freq < 4000
          ? ' Auditory nerve fibres here show precise phase-locking — the brain can count individual cycles to extract pitch.'
          : ' Phase-locking breaks down at these frequencies; the brain relies mainly on the place of excitation to judge pitch.'}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span>🟣 High-freq region (base)</span>
        <span>🟢 Mid region</span>
        <span>🔴 Low-freq region (apex)</span>
        <span>Colored curve = traveling wave envelope for selected frequency</span>
      </div>
    </div>
  )
}
