'use client'

// components/DampingExplorer.tsx
// Shows how the Q (quality) factor controls both the time-domain decay
// and the width of the resonance peak in the frequency domain.
// Usage in MDX: <DampingExplorer />

import { useState, useMemo, useEffect } from 'react'

const F0      = 200     // resonant frequency (Hz) — fixed for clarity
const T_MAX   = 0.06    // seconds shown in time panel
const F_MAX   = 500     // Hz shown in frequency panel
const SAMPLES = 600     // path resolution

// ── SVG layout ───────────────────────────────────────────────────────────────
const VW = 580, VH = 210
const GAP = 24
const ML = 46, MR = 16, MT = 28, MB = 32
const PW = (VW - ML - MR - GAP) / 2
const PH = VH - MT - MB

function tX(t: number) { return ML + (t / T_MAX) * PW }
function tY(v: number) { return MT + PH / 2 - v * (PH / 2) * 0.92 }
function fX(f: number) { return ML + PW + GAP + (f / F_MAX) * PW }
function fY(g: number) { return MT + PH * (1 - g * 0.92) }

// ── Axes helper ──────────────────────────────────────────────────────────────
function Panel({
  title, x0, xLabel, yLabel, children,
}: {
  title: string; x0: number; xLabel: string; yLabel: string; children: React.ReactNode
}) {
  return (
    <g>
      <text x={x0 + PW / 2} y={MT - 8} textAnchor="middle" fontSize={10} fill="#6d28d9" fontWeight="700">
        {title}
      </text>
      {/* bounding box */}
      <line x1={x0}      y1={MT}      x2={x0 + PW} y2={MT}      stroke="#ede9fe" />
      <line x1={x0}      y1={MT + PH} x2={x0 + PW} y2={MT + PH} stroke="#7c3aed" strokeWidth={1.2} />
      <line x1={x0}      y1={MT}      x2={x0}      y2={MT + PH} stroke="#7c3aed" strokeWidth={1.2} />
      <line x1={x0 + PW} y1={MT}      x2={x0 + PW} y2={MT + PH} stroke="#ede9fe" />
      {/* axis labels */}
      <text x={x0 + PW / 2} y={VH - 4} textAnchor="middle" fontSize={9} fill="#64748b">{xLabel}</text>
      <text x={x0 - 36} y={MT + PH / 2} textAnchor="middle" fontSize={9} fill="#64748b"
        transform={`rotate(-90,${x0 - 36},${MT + PH / 2})`}>{yLabel}</text>
      {children}
    </g>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DampingExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [Q, setQ] = useState(6)

  const bandwidth = +(F0 / Q).toFixed(1)
  const tau       = Q / (Math.PI * F0)   // time constant (seconds)

  const label =
    Q <= 1  ? 'overdamped'  :
    Q <= 3  ? 'strongly damped' :
    Q <= 8  ? 'moderate damping' :
    Q <= 15 ? 'lightly damped' : 'nearly lossless'

  // ── Time domain: decaying sinusoid ─────────────────────────────────────────
  const { timePath, envPath } = useMemo(() => {
    const wave: string[] = [], topEnv: string[] = [], botEnv: string[] = []
    for (let i = 0; i <= SAMPLES; i++) {
      const t   = (i / SAMPLES) * T_MAX
      const env = Math.exp(-t / tau)
      const val = env * Math.cos(2 * Math.PI * F0 * t)
      const x   = tX(t), y = tY(val)
      wave.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
      topEnv.push(i === 0 ? `M${tX(t)},${tY(env)}` : `L${tX(t)},${tY(env)}`)
      botEnv.push(`${i === 0 ? 'M' : 'L'}${tX(t)},${tY(-env)}`)
    }
    return {
      timePath: wave.join(' '),
      envPath:  topEnv.join(' ') + ' ' + [...botEnv].reverse().join(' ').replace(/M/, 'L') + ' Z',
    }
  }, [tau])

  // ── Frequency domain: Lorentzian resonance peak ────────────────────────────
  const { freqPath, freqFill } = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= SAMPLES; i++) {
      const f = (i / SAMPLES) * F_MAX
      const ratio = f === 0 ? -Infinity : (f / F0 - F0 / f)
      const g     = f === 0 ? 0 : 1 / Math.sqrt(1 + Q * Q * ratio * ratio)
      const x = fX(f), y = fY(g)
      pts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`)
    }
    const curve = pts.join(' ')
    const fill  = curve + ` L${fX(F_MAX)},${MT + PH} L${fX(0)},${MT + PH} Z`
    return { freqPath: curve, freqFill: fill }
  }, [Q])

  // ── Time-axis tick marks ───────────────────────────────────────────────────
  const timeTicks = [0, 0.02, 0.04, 0.06]
  const freqTicks = [0, 100, 200, 300, 400, 500]

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 not-prose
                      flex items-center justify-center" style={{ minHeight: 260 }}>
        <span className="text-sm text-violet-400">Loading damping explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">
        Interactive · Damping &amp; Resonance
      </p>
      <p className="text-sm text-violet-800 mb-4">
        Resonant frequency f₀ = {F0} Hz &nbsp;·&nbsp;
        Q = <strong>{Q.toFixed(1)}</strong> ({label}) &nbsp;·&nbsp;
        Bandwidth = <strong>{bandwidth} Hz</strong> &nbsp;·&nbsp;
        Ring-down τ ≈ <strong>{(tau * 1000).toFixed(1)} ms</strong>
      </p>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full rounded-xl bg-white border border-violet-100 mb-4">

        {/* ── Time domain panel ── */}
        <Panel title="Time Domain" x0={ML} xLabel="Time (ms)" yLabel="Amplitude">
          {/* zero line */}
          <line x1={ML} y1={tY(0)} x2={ML + PW} y2={tY(0)} stroke="#ddd6fe" strokeDasharray="3 3" />
          {/* envelope fill */}
          <path d={envPath} fill="#c4b5fd" opacity={0.18} />
          {/* waveform */}
          <path d={timePath} fill="none" stroke="#7c3aed" strokeWidth={1.8} />
          {/* time-constant marker */}
          {tau < T_MAX && (() => {
            const x = tX(tau)
            return (
              <g>
                <line x1={x} y1={MT} x2={x} y2={MT + PH} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
                <text x={x + 3} y={MT + 11} fontSize={8} fill="#b45309">τ</text>
              </g>
            )
          })()}
          {/* x ticks */}
          {timeTicks.map(t => (
            <g key={t}>
              <line x1={tX(t)} y1={MT + PH} x2={tX(t)} y2={MT + PH + 4} stroke="#94a3b8" />
              <text x={tX(t)} y={MT + PH + 14} textAnchor="middle" fontSize={8} fill="#64748b">
                {(t * 1000).toFixed(0)}
              </text>
            </g>
          ))}
          {/* y ticks */}
          {[-1, 0, 1].map(v => (
            <g key={v}>
              <line x1={ML - 3} y1={tY(v)} x2={ML} y2={tY(v)} stroke="#94a3b8" />
              <text x={ML - 6} y={tY(v) + 3} textAnchor="end" fontSize={8} fill="#64748b">{v}</text>
            </g>
          ))}
        </Panel>

        {/* ── Frequency domain panel ── */}
        <Panel title="Frequency Domain" x0={ML + PW + GAP} xLabel="Frequency (Hz)" yLabel="Gain">
          {/* fill */}
          <path d={freqFill} fill="#c4b5fd" opacity={0.22} />
          {/* resonance curve */}
          <path d={freqPath} fill="none" stroke="#7c3aed" strokeWidth={2} />
          {/* f0 marker */}
          {(() => {
            const x = fX(F0)
            return (
              <g>
                <line x1={x} y1={MT} x2={x} y2={MT + PH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" />
                <text x={x + 3} y={MT + 11} fontSize={8} fill="#b45309">f₀ = {F0} Hz</text>
              </g>
            )
          })()}
          {/* bandwidth bracket at –3 dB (gain = 0.707) */}
          {(() => {
            const g3dB   = 1 / Math.sqrt(2)
            const bwY    = fY(g3dB)
            const halfBW = bandwidth / 2
            const x1 = fX(Math.max(0, F0 - halfBW))
            const x2 = fX(Math.min(F_MAX, F0 + halfBW))
            return (
              <g>
                <line x1={x1} y1={bwY} x2={x2} y2={bwY} stroke="#9333ea" strokeWidth={1} />
                <line x1={x1} y1={bwY - 4} x2={x1} y2={bwY + 4} stroke="#9333ea" strokeWidth={1} />
                <line x1={x2} y1={bwY - 4} x2={x2} y2={bwY + 4} stroke="#9333ea" strokeWidth={1} />
                <text x={(x1 + x2) / 2} y={bwY - 5} textAnchor="middle" fontSize={8} fill="#7c3aed">
                  BW = {bandwidth} Hz
                </text>
                <text x={fX(F_MAX) - 4} y={bwY + 3} textAnchor="end" fontSize={7.5} fill="#7c3aed">–3 dB</text>
              </g>
            )
          })()}
          {/* y ticks */}
          {[0, 0.5, 1].map(g => (
            <g key={g}>
              <line x1={ML + PW + GAP - 3} y1={fY(g)} x2={ML + PW + GAP} y2={fY(g)} stroke="#94a3b8" />
              <text x={ML + PW + GAP - 5} y={fY(g) + 3} textAnchor="end" fontSize={8} fill="#64748b">{g.toFixed(1)}</text>
            </g>
          ))}
          {/* x ticks */}
          {freqTicks.map(f => (
            <g key={f}>
              <line x1={fX(f)} y1={MT + PH} x2={fX(f)} y2={MT + PH + 4} stroke="#94a3b8" />
              <text x={fX(f)} y={MT + PH + 14} textAnchor="middle" fontSize={8} fill="#64748b">{f}</text>
            </g>
          ))}
        </Panel>
      </svg>

      {/* Q slider */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-violet-800 w-44 shrink-0">
          Q factor: <strong>{Q.toFixed(1)}</strong>
          <span className="text-violet-500 ml-1 font-normal">({label})</span>
        </span>
        <input
          type="range" min={0.5} max={25} step={0.5} value={Q}
          onChange={e => setQ(Number(e.target.value))}
          className="flex-1 accent-violet-600"
        />
      </div>

      <p className="text-xs text-violet-700 mt-3 leading-relaxed">
        <strong>Higher Q</strong> → narrow peak, long ring-down (weakly damped). &nbsp;
        <strong>Lower Q</strong> → broad peak, fast decay (strongly damped). &nbsp;
        This is time-frequency duality: a narrow bandwidth requires a long time signal to establish it.
      </p>
    </div>
  )
}