'use client'

// components/ModulationExplorer.tsx
// Visualizes Amplitude Modulation (AM) and Frequency Modulation (FM).
// AM tab also shows the frequency-domain spectrum (sidebands).
// Usage in MDX: <ModulationExplorer />

import { useState, useMemo, useEffect } from 'react'

type ModType = 'AM' | 'FM'

// ── SVG layout ────────────────────────────────────────────────────────────────
const VW = 580
const ROW_H = 90
const ML = 90, MR = 16, MT = 18, MB = 14
const PW = VW - ML - MR
const SAMPLES = 800
const T_MAX = 0.04   // 40 ms shown

function tX(t: number) { return ML + (t / T_MAX) * PW }
function tY(v: number, cy: number, scale = 0.85) {
  return cy - v * (ROW_H / 2 - 4) * scale
}

// ── Row labels ────────────────────────────────────────────────────────────────
const ROW_LABELS_AM = ['Carrier c(t)', 'Modulator m(t)', 'AM Output x(t)', 'Spectrum X(f)']
const ROW_LABELS_FM = ['Carrier c(t)', 'Modulator m(t)', 'FM Output x(t)']

// ── Simple waveform path ──────────────────────────────────────────────────────
function wavePath(samples: number[], cy: number): string {
  return samples.map((v, i) => {
    const t = (i / (samples.length - 1)) * T_MAX
    const x = tX(t), y = tY(v, cy)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
}

// ── AM spectrum (show 3 lines: fc-fm, fc, fc+fm) ─────────────────────────────
function AMSpectrum({
  fc, fm, depth, cy, specH,
}: {
  fc: number; fm: number; depth: number; cy: number; specH: number
}) {
  const F_MAX = fc + fm * 2.5
  const fX = (f: number) => ML + (f / F_MAX) * PW
  const fY = (amp: number) => cy + specH / 2 - amp * (specH - 8)

  const lines = [
    { f: fc - fm, amp: depth / 2, label: `fc–fm\n${fc - fm} Hz` },
    { f: fc,      amp: 1.0,       label: `fc\n${fc} Hz` },
    { f: fc + fm, amp: depth / 2, label: `fc+fm\n${fc + fm} Hz` },
  ]

  return (
    <g>
      {/* baseline */}
      <line x1={ML} y1={cy + specH / 2} x2={ML + PW} y2={cy + specH / 2} stroke="#e2e8f0" strokeWidth={1} />
      {/* freq ticks */}
      {[0, fc - fm, fc, fc + fm, F_MAX].map(f => (
        <line key={f} x1={fX(f)} y1={cy + specH / 2} x2={fX(f)} y2={cy + specH / 2 + 4}
          stroke="#cbd5e1" strokeWidth={0.75} />
      ))}
      {/* spectral lines */}
      {lines.map(({ f, amp, label }) => (
        <g key={f}>
          <line x1={fX(f)} y1={fY(amp)} x2={fX(f)} y2={cy + specH / 2}
            stroke="#ea580c" strokeWidth={3} strokeLinecap="round" />
          {label.split('\n').map((txt, i) => (
            <text key={i} x={fX(f)} y={cy + specH / 2 + 14 + i * 10}
              textAnchor="middle" fontSize={8} fill="#78350f">{txt}</text>
          ))}
        </g>
      ))}
      {/* axis */}
      <line x1={ML} y1={cy + specH / 2} x2={ML + PW} y2={cy + specH / 2} stroke="#94a3b8" />
      <text x={ML + PW / 2} y={cy + specH / 2 + 34} textAnchor="middle" fontSize={9} fill="#64748b">Frequency (Hz)</text>
      <text x={ML - 4} y={cy + specH / 2 + 4} textAnchor="end" fontSize={9} fill="#64748b">Amplitude</text>
    </g>
  )
}

// ── Waveform row ──────────────────────────────────────────────────────────────
function WaveRow({
  path, cy, label, color,
}: {
  path: string; cy: number; label: string; color: string
}) {
  return (
    <g>
      {/* row background */}
      <rect x={ML} y={cy - ROW_H / 2 + 2} width={PW} height={ROW_H - 4}
        fill={color + '08'} rx={4} />
      {/* zero line */}
      <line x1={ML} y1={cy} x2={ML + PW} y2={cy} stroke="#e2e8f0" strokeWidth={1} />
      {/* waveform */}
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {/* row label */}
      <text x={ML - 6} y={cy + 4} textAnchor="end" fontSize={9} fill={color} fontWeight="600">{label}</text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ModulationExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [modType, setModType] = useState<ModType>('AM')
  const [fc,    setFc]    = useState(400)   // carrier frequency (Hz)
  const [fm,    setFm]    = useState(50)    // modulator frequency (Hz)
  const [depth, setDepth] = useState(0.8)   // modulation depth / index

  // ── Generate waveforms ──────────────────────────────────────────────────────
  const { carrier, modulator, output } = useMemo(() => {
    const carr: number[] = [], mod: number[] = [], out: number[] = []
    for (let i = 0; i <= SAMPLES; i++) {
      const t = (i / SAMPLES) * T_MAX
      const c = Math.cos(2 * Math.PI * fc * t)
      const m = Math.cos(2 * Math.PI * fm * t)
      carr.push(c)
      mod.push(m)
      if (modType === 'AM') {
        out.push((1 + depth * m) * c)
      } else {
        // FM: instantaneous frequency = fc + depth * fm * m(t)
        // phase integral of cos = sin / (2π * fm * depth)
        const fmIdx = depth * fc   // peak frequency deviation (Hz)
        out.push(Math.cos(2 * Math.PI * fc * t + (fmIdx / fm) * Math.sin(2 * Math.PI * fm * t)))
      }
    }
    return { carrier: carr, modulator: mod, output: out }
  }, [fc, fm, depth, modType])

  // ── SVG heights ─────────────────────────────────────────────────────────────
  const specH   = modType === 'AM' ? 90 : 0
  const nRows   = modType === 'AM' ? 4 : 3
  const svgH    = MT + nRows * (ROW_H + 8) + specH + MB + 10

  const rowCenters = Array.from({ length: 3 }, (_, i) => MT + i * (ROW_H + 8) + ROW_H / 2)
  const specCY     = rowCenters[2] + ROW_H / 2 + 8 + specH / 2

  const labels = modType === 'AM' ? ROW_LABELS_AM : ROW_LABELS_FM
  const colors = ['#6366f1', '#0891b2', '#16a34a', '#ea580c']

  // Defer SVG render until client is hydrated to prevent floating-point
  // mismatches between Node.js server math and browser math.
  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-5 not-prose
                      flex items-center justify-center" style={{ minHeight: 320 }}>
        <span className="text-sm text-orange-400">Loading modulation explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">
        Interactive · Modulation Explorer
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        {(['AM', 'FM'] as ModType[]).map(t => (
          <button key={t} onClick={() => setModType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              modType === t
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'
            }`}>
            {t === 'AM' ? 'Amplitude Modulation (AM)' : 'Frequency Modulation (FM)'}
          </button>
        ))}
      </div>

      {/* Waveform SVG */}
      <svg viewBox={`0 0 ${VW} ${svgH}`} className="w-full rounded-xl bg-white border border-slate-100 mb-4">
        {/* time axis */}
        {[0, 10, 20, 30, 40].map(ms => (
          <g key={ms}>
            <line x1={tX(ms / 1000)} y1={MT} x2={tX(ms / 1000)} y2={svgH - MB}
              stroke="#f1f5f9" strokeWidth={0.75} />
            <text x={tX(ms / 1000)} y={svgH - 4} textAnchor="middle" fontSize={8} fill="#94a3b8">{ms}ms</text>
          </g>
        ))}

        {/* Carrier row */}
        <WaveRow path={wavePath(carrier, rowCenters[0])}
          cy={rowCenters[0]} label={labels[0]} color={colors[0]} />

        {/* Modulator row */}
        <WaveRow path={wavePath(modulator, rowCenters[1])}
          cy={rowCenters[1]} label={labels[1]} color={colors[1]} />

        {/* Output row */}
        {modType === 'AM' && (
          // AM: draw envelope lines
          (() => {
            const envTop = Array.from({ length: SAMPLES + 1 }, (_, i) => {
              const t = (i / SAMPLES) * T_MAX
              const m = Math.cos(2 * Math.PI * fm * t)
              return 1 + depth * m
            })
            const envBot = envTop.map(v => -v)
            const epTop = envTop.map((v, i) => `${i === 0 ? 'M' : 'L'}${tX((i / SAMPLES) * T_MAX)},${tY(v, rowCenters[2])}`).join(' ')
            const epBot = envBot.map((v, i) => `${i === 0 ? 'M' : 'L'}${tX((i / SAMPLES) * T_MAX)},${tY(v, rowCenters[2])}`).join(' ')
            return (
              <g>
                <path d={epTop} fill="none" stroke="#16a34a" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
                <path d={epBot} fill="none" stroke="#16a34a" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
              </g>
            )
          })()
        )}
        <WaveRow path={wavePath(output, rowCenters[2])}
          cy={rowCenters[2]} label={labels[2]} color={colors[2]} />

        {/* AM Spectrum */}
        {modType === 'AM' && (
          <AMSpectrum fc={fc} fm={fm} depth={depth} cy={specCY} specH={specH} />
        )}

        {/* FM annotation */}
        {modType === 'FM' && (
          <text x={ML + PW / 2} y={rowCenters[2] + ROW_H / 2 + 16}
            textAnchor="middle" fontSize={9} fill="#64748b" fontStyle="italic">
            Instantaneous frequency varies: fc ± {Math.round(depth * fc)} Hz  (peak deviation)
          </text>
        )}
      </svg>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-700 w-44 shrink-0">
            Carrier frequency (fc): <strong>{fc} Hz</strong>
          </span>
          <input type="range" min={100} max={800} step={10} value={fc}
            onChange={e => setFc(Number(e.target.value))} className="flex-1 accent-orange-500" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-700 w-44 shrink-0">
            Modulator frequency (fm): <strong>{fm} Hz</strong>
          </span>
          <input type="range" min={5} max={120} step={5} value={fm}
            onChange={e => setFm(Number(e.target.value))} className="flex-1 accent-orange-500" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-700 w-44 shrink-0">
            {modType === 'AM' ? 'Modulation depth (m):' : 'Modulation index (β):'} <strong>{depth.toFixed(2)}</strong>
          </span>
          <input type="range" min={0.05} max={1} step={0.05} value={depth}
            onChange={e => setDepth(Number(e.target.value))} className="flex-1 accent-orange-500" />
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-xs text-orange-900 space-y-1">
        {modType === 'AM' ? (
          <>
            <p><strong>AM:</strong> x(t) = (1 + m·cos 2πf<sub>m</sub>t) · cos 2πf<sub>c</sub>t</p>
            <p>Spectrum shows three lines: the carrier at f<sub>c</sub>, and sidebands at f<sub>c</sub> ± f<sub>m</sub>. Multiplying in time = convolution in frequency.</p>
          </>
        ) : (
          <>
            <p><strong>FM:</strong> x(t) = cos(2πf<sub>c</sub>t + β·sin 2πf<sub>m</sub>t)</p>
            <p>The carrier frequency varies around f<sub>c</sub>. Higher β → more frequency swing. FM is used in broadcast radio (88–108 MHz) because it is more resistant to amplitude noise.</p>
          </>
        )}
      </div>
    </div>
  )
}