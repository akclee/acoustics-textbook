'use client'

// components/WindowingDemo.tsx
// Interactive windowing demo.
// A pure sine wave (8 cycles in 256 samples) is shown in the time domain.
// A draggable slider sets the analysis window length (how many samples
// are included). The frequency-domain spectrum updates in real time,
// showing how a short / sharply-cut window causes spectral splatter
// while a Hann window suppresses it.
// Usage in MDX: <WindowingDemo />

import { useState, useMemo, useEffect } from 'react'

// ── Signal parameters ─────────────────────────────────────────────────────────
const N       = 256   // total samples
const FREQ    = 8     // integer → full window is leakage-free (powers-of-2 multiples)
const MAX_BIN = 24    // frequency bins shown (0 … 24)
const DB_FLOOR = -60  // dB floor

// ── SVG layout ────────────────────────────────────────────────────────────────
const VW      = 560
const PANEL_H = 108
const GAP     = 32
const ML = 52, MR = 12, MT = 24, MB = 28
const PW = VW - ML - MR

const timeCY  = MT + PANEL_H / 2
const freqTop = MT + PANEL_H + GAP
const SVG_H   = freqTop + PANEL_H + MB

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Full unwindowed sine, 0 … N-1 */
function fullSine(): number[] {
  return Array.from({ length: N }, (_, n) => Math.sin(2 * Math.PI * FREQ * n / N))
}

/** Apply window to first winLen samples of the sine; zero-pad the rest. */
function applyWindow(sine: number[], winLen: number, type: 'rect' | 'hann'): number[] {
  return sine.map((s, n) => {
    if (n >= winLen) return 0
    const w = type === 'hann'
      ? 0.5 * (1 - Math.cos(2 * Math.PI * n / Math.max(winLen - 1, 1)))
      : 1.0
    return s * w
  })
}

/** DFT magnitude for bins 0 … MAX_BIN. */
function dftMag(signal: number[]): number[] {
  const mags: number[] = []
  for (let k = 0; k <= MAX_BIN; k++) {
    let re = 0, im = 0
    for (let n = 0; n < N; n++) {
      const θ = 2 * Math.PI * k * n / N
      re += signal[n] * Math.cos(θ)
      im -= signal[n] * Math.sin(θ)
    }
    mags.push(Math.sqrt(re * re + im * im))
  }
  return mags
}

// ── SVG path builders ─────────────────────────────────────────────────────────
const tScale = PANEL_H / 2 - 8          // amplitude → pixels

function makeTimePath(signal: number[], upTo: number): string {
  return Array.from({ length: upTo }, (_, i) => {
    const x = ML + (i / (N - 1)) * PW
    const y = timeCY - signal[i] * tScale
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`
  }).join(' ')
}

function makeFreqPath(mags: number[], peak: number): string {
  return mags.map((v, k) => {
    const db = Math.max(20 * Math.log10(v / peak + 1e-10), DB_FLOOR)
    const x  = ML + (k / MAX_BIN) * PW
    const y  = freqTop + (-db / -DB_FLOOR) * PANEL_H
    return `${k === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(2)}`
  }).join(' ')
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WindowingDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [winLen, setWinLen] = useState(N)   // slider value: 16 … N

  // Pre-compute the full unwindowed sine once
  const sine = useMemo(() => fullSine(), [])

  // Re-compute windowed signals + spectra when winLen changes
  const { rectSig, hannSig, rectSpec, hannSpec, peak, winX, cycleCount } = useMemo(() => {
    const rectSig = applyWindow(sine, winLen, 'rect')
    const hannSig = applyWindow(sine, winLen, 'hann')
    const rectSpec = dftMag(rectSig)
    const hannSpec = dftMag(hannSig)
    // Normalise against the rectangular peak so both spectra share a reference
    const peak = Math.max(...rectSpec, 1e-9)
    const winX = ML + ((winLen - 1) / (N - 1)) * PW
    const cycleCount = (FREQ * winLen / N)
    return { rectSig, hannSig, rectSpec, hannSpec, peak, winX, cycleCount }
  }, [winLen, sine])

  // ── Build SVG paths ─────────────────────────────────────────────────────────
  const fullPath  = makeTimePath(sine, N)
  const rectTPath = makeTimePath(rectSig, winLen)
  const hannTPath = makeTimePath(hannSig, winLen)
  const rectFPath = makeFreqPath(rectSpec, peak)
  const hannFPath = makeFreqPath(hannSpec, peak)

  // True-frequency reference x position
  const trueX = ML + (FREQ / MAX_BIN) * PW

  // ── Dynamic label ───────────────────────────────────────────────────────────
  const isClean = Math.abs(cycleCount - Math.round(cycleCount)) < 0.05
  const cycleLabel = cycleCount.toFixed(2)

  // ── Tick arrays ────────────────────────────────────────────────────────────
  const timeTicks = [0, 64, 128, 192, 256]
  const freqTicks = [0, 4, 8, 12, 16, 20, 24]
  const dbTicks   = [0, -20, -40, -60]

  if (!mounted) {
    return (
      <div
        className="my-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 not-prose
                   flex items-center justify-center"
        style={{ minHeight: 320 }}
      >
        <span className="text-sm text-teal-400">Loading windowing demo…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
        Interactive · Windowing &amp; Spectral Leakage
      </p>
      <p className="text-sm text-teal-800 mb-4">
        Drag the slider to change the <strong>analysis window length</strong>.
        The highlighted region in the time domain shows what gets analysed.
        Notice how the <strong className="text-red-600">rectangular window</strong> (hard cutoff) causes energy to smear
        across many frequency bins, while the <strong className="text-blue-600">Hann window</strong> (smooth taper) keeps it focused.
      </p>

      {/* ── Slider ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xs font-medium text-slate-700 shrink-0 w-56">
          Window: <strong>{winLen} samples</strong> = <strong>{cycleLabel} cycles</strong>
        </span>
        <input
          type="range" min={16} max={N} step={8} value={winLen}
          onChange={e => setWinLen(Number(e.target.value))}
          className="flex-1 accent-teal-500"
        />
        <span className="text-xs text-slate-400 shrink-0 w-16 text-right">{winLen}/{N}</span>
      </div>

      {/* ── SVG ────────────────────────────────────────────────────────────── */}
      <svg viewBox={`0 0 ${VW} ${SVG_H}`} className="w-full rounded-xl bg-white border border-slate-100 mb-3">

        {/* ════ TIME DOMAIN ════════════════════════════════════════════════ */}
        <text x={ML} y={MT - 5} fontSize={9} fill="#64748b" fontWeight="700">TIME DOMAIN</text>

        {/* Window background */}
        <rect x={ML} y={MT} width={winX - ML} height={PANEL_H} fill="#f0fdfa" rx={0} />
        {/* Panel outline */}
        <rect x={ML} y={MT} width={PW} height={PANEL_H} fill="none" stroke="#e2e8f0" strokeWidth={1} rx={2} />
        {/* Zero line */}
        <line x1={ML} y1={timeCY} x2={ML + PW} y2={timeCY} stroke="#e2e8f0" strokeWidth={1} />

        {/* Full unwindowed sine (gray reference) */}
        <path d={fullPath} fill="none" stroke="#cbd5e1" strokeWidth={1} opacity={0.5} />

        {/* Rectangular windowed signal (red) — abrupt cutoff */}
        <path d={rectTPath} fill="none" stroke="#ef4444" strokeWidth={1.8} opacity={0.85} />
        {/* Vertical cutoff line at window edge */}
        {winLen < N && (() => {
          const xi = ML + ((winLen - 1) / (N - 1)) * PW
          const yi = timeCY - rectSig[winLen - 1] * tScale
          return <line x1={xi} y1={yi} x2={xi} y2={timeCY} stroke="#ef4444" strokeWidth={1.8} opacity={0.85} />
        })()}

        {/* Hann windowed signal (blue) — smooth taper */}
        <path d={hannTPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} opacity={0.9} />

        {/* Window boundary marker */}
        <line x1={winX} y1={MT} x2={winX} y2={MT + PANEL_H}
          stroke="#0d9488" strokeWidth={1.5} strokeDasharray="4 3" />
        {winX < ML + PW - 30 && (
          <text x={winX + 4} y={MT + 12} fontSize={8} fill="#0d9488" fontWeight="600">← window</text>
        )}

        {/* Time axis ticks */}
        {timeTicks.map(n => {
          const x = ML + (n / (N - 1)) * PW
          return (
            <g key={n}>
              <line x1={x} y1={MT + PANEL_H} x2={x} y2={MT + PANEL_H + 3} stroke="#cbd5e1" strokeWidth={0.75} />
              <text x={x} y={MT + PANEL_H + 11} textAnchor="middle" fontSize={8} fill="#94a3b8">{n}</text>
            </g>
          )
        })}
        <text x={ML + PW / 2} y={MT + PANEL_H + 22} textAnchor="middle" fontSize={9} fill="#94a3b8">Sample index (n)</text>
        <text x={ML - 6} y={timeCY + 4} textAnchor="end" fontSize={9} fill="#94a3b8">Amp</text>

        {/* ════ FREQUENCY DOMAIN ═══════════════════════════════════════════ */}
        <text x={ML} y={freqTop - 5} fontSize={9} fill="#64748b" fontWeight="700">FREQUENCY DOMAIN (dB, normalised to rect peak)</text>

        {/* Panel */}
        <rect x={ML} y={freqTop} width={PW} height={PANEL_H} fill="#fafafa" rx={2} />

        {/* dB grid */}
        {dbTicks.map(db => {
          const y = freqTop + (-db / -DB_FLOOR) * PANEL_H
          return (
            <g key={db}>
              <line x1={ML} y1={y} x2={ML + PW} y2={y}
                stroke="#e2e8f0" strokeWidth={db === 0 ? 1 : 0.75}
                strokeDasharray={db === 0 ? undefined : '3 3'} />
              <text x={ML - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#94a3b8">{db}</text>
            </g>
          )
        })}

        {/* True frequency marker */}
        <line x1={trueX} y1={freqTop} x2={trueX} y2={freqTop + PANEL_H}
          stroke="#6b7280" strokeWidth={0.8} strokeDasharray="3 3" />
        <text x={trueX + 3} y={freqTop + 11} fontSize={8} fill="#6b7280" fontStyle="italic">bin {FREQ}</text>

        {/* Spectra */}
        <path d={rectFPath} fill="none" stroke="#ef4444" strokeWidth={1.8} strokeLinejoin="round" />
        <path d={hannFPath} fill="none" stroke="#3b82f6" strokeWidth={1.8} strokeLinejoin="round" />

        {/* Frequency axis ticks */}
        {freqTicks.map(k => {
          const x = ML + (k / MAX_BIN) * PW
          return (
            <g key={k}>
              <line x1={x} y1={freqTop + PANEL_H} x2={x} y2={freqTop + PANEL_H + 3} stroke="#cbd5e1" strokeWidth={0.75} />
              <text x={x} y={freqTop + PANEL_H + 11} textAnchor="middle" fontSize={8} fill="#94a3b8">{k}</text>
            </g>
          )
        })}
        <text x={ML + PW / 2} y={freqTop + PANEL_H + 22} textAnchor="middle" fontSize={9} fill="#94a3b8">Frequency bin (k)</text>

      </svg>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 mt-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 border-t border-slate-300 opacity-50" />
          <span className="text-slate-400">Full sine (reference)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 border-t-2 border-red-500" />
          <span><strong>Rectangular</strong> — hard cutoff at window edge</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 border-t-2 border-blue-500" />
          <span><strong>Hann</strong> — amplitude fades to zero at edges</span>
        </div>
      </div>

      {/* ── Dynamic observation callout ─────────────────────────────────────── */}
      <div className={`mt-3 rounded-xl border px-4 py-2.5 text-xs ${
        isClean
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        {isClean ? (
          <p>✓ Window contains <strong>~{Math.round(cycleCount)} complete cycles</strong> — the sine fits exactly, so the rectangular window produces a clean spike with no leakage. Try dragging away from this point to see splatter appear.</p>
        ) : (
          <p>⚠ Window contains <strong>{cycleLabel} cycles</strong> — not a whole number, so the sine is cut mid-cycle. The rectangular window smears energy across bins {FREQ - 3}–{FREQ + 3} and beyond. The Hann window confines most of the leakage to bins {FREQ - 1}–{FREQ + 1}.</p>
        )}
      </div>
    </div>
  )
}