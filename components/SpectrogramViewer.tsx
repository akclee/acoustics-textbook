'use client'

// components/SpectrogramViewer.tsx
// Canvas-based spectrogram of synthetic vowel sounds.
// Synthesises formant-filtered noise in-browser, computes a short-time
// Fourier transform (STFT), and renders it as a heatmap.
// Vowel selector, formant overlay toggle, and broadband/narrowband toggle.
// Usage in MDX: <SpectrogramViewer />

import { useState, useMemo, useEffect, useRef } from 'react'

// ── Vowel definitions ─────────────────────────────────────────────────────────
// Formant frequencies in Hz: [F1, F2, F3], bandwidths [B1, B2, B3]
// Source: average male speaker, Peterson & Barney (1952) / Hillenbrand et al.
type Vowel = {
  label: string
  ipa: string
  example: string
  F: [number, number, number]
  B: [number, number, number]
  f0: number
}

const VOWELS: Vowel[] = [
  { label: '/i/',  ipa: 'i',  example: '"bead"', F: [270,  2290, 3010], B: [60,  90,  100], f0: 120 },
  { label: '/ɪ/',  ipa: 'ɪ',  example: '"bid"',  F: [390,  1990, 2550], B: [70,  100, 120], f0: 120 },
  { label: '/æ/',  ipa: 'æ',  example: '"bad"',  F: [660,  1720, 2410], B: [80,  100, 110], f0: 120 },
  { label: '/ɑ/',  ipa: 'ɑ',  example: '"bod"',  F: [730,  1090, 2440], B: [90,  110, 120], f0: 120 },
  { label: '/u/',  ipa: 'u',  example: '"booed"', F: [300,  870,  2240], B: [60,  80,  110], f0: 120 },
]

// ── Signal synthesis ──────────────────────────────────────────────────────────
const SR       = 16000   // sample rate (Hz)
const DUR      = 0.25    // signal duration (s)
const N_SAMPS  = Math.round(SR * DUR)

// Generate voiced source: impulse train at f0
function voicedSource(f0: number, n: number, sr: number): Float32Array {
  const out = new Float32Array(n)
  const period = Math.round(sr / f0)
  for (let i = 0; i < n; i += period) {
    out[i] = 1.0
  }
  return out
}

// Simple all-pole (IIR biquad) formant filter
// H(z) = 1 / (1 - 2*r*cos(2πf/sr)*z⁻¹ + r²*z⁻²)
function formantFilter(signal: Float32Array, f: number, bw: number, sr: number): Float32Array {
  const r = Math.exp(-Math.PI * bw / sr)
  const a1 = -2 * r * Math.cos(2 * Math.PI * f / sr)
  const a2 = r * r
  const out = new Float32Array(signal.length)
  for (let i = 0; i < signal.length; i++) {
    out[i] = signal[i]
      - a1 * (i >= 1 ? out[i - 1] : 0)
      - a2 * (i >= 2 ? out[i - 2] : 0)
  }
  return out
}

// Cascade three formant filters
function synthesiseVowel(v: Vowel): Float32Array {
  let sig = voicedSource(v.f0, N_SAMPS, SR)
  for (let k = 0; k < 3; k++) {
    sig = formantFilter(sig, v.F[k], v.B[k], SR)
  }
  // Normalise
  const peak = Math.max(...sig.map(Math.abs)) || 1
  return sig.map(s => s / peak * 0.9) as unknown as Float32Array
}

// ── STFT ──────────────────────────────────────────────────────────────────────
const FRAME_SHIFT = 64    // samples between frames

function hannWindow(len: number): Float32Array {
  const w = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (len - 1)))
  }
  return w
}

function dftMagFrame(frame: Float32Array, fftLen: number): Float32Array {
  const re = new Float32Array(fftLen)
  const im = new Float32Array(fftLen)
  const n = frame.length
  for (let k = 0; k <= fftLen / 2; k++) {
    let r = 0, m = 0
    for (let i = 0; i < n; i++) {
      const θ = 2 * Math.PI * k * i / fftLen
      r += frame[i] * Math.cos(θ)
      m -= frame[i] * Math.sin(θ)
    }
    re[k] = r; im[k] = m
  }
  const mag = new Float32Array(fftLen / 2 + 1)
  for (let k = 0; k <= fftLen / 2; k++) {
    mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k])
  }
  return mag
}

type StftResult = {
  frames: Float32Array[]   // each frame: magnitude spectrum [0..fftLen/2]
  fftLen: number
  nFrames: number
}

function computeStft(signal: Float32Array, fftLen: number): StftResult {
  const win = hannWindow(fftLen)
  const frames: Float32Array[] = []
  const hop = FRAME_SHIFT
  for (let start = 0; start + fftLen <= signal.length; start += hop) {
    const frame = new Float32Array(fftLen)
    for (let i = 0; i < fftLen; i++) {
      frame[i] = signal[start + i] * win[i]
    }
    frames.push(dftMagFrame(frame, fftLen))
  }
  return { frames, fftLen, nFrames: frames.length }
}

// ── Canvas rendering ──────────────────────────────────────────────────────────
const CANVAS_W = 540
const CANVAS_H = 220
const F_MAX_SHOW = 5000   // Hz shown in spectrogram

function magToColor(db: number, dbFloor: number): [number, number, number] {
  // db in [dbFloor, 0]  →  colour from dark blue → teal → yellow → white
  const t = Math.max(0, Math.min(1, (db - dbFloor) / (-dbFloor)))
  if (t < 0.33) {
    const s = t / 0.33
    return [Math.round(20 * s), Math.round(20 + 60 * s), Math.round(80 + 80 * s)]
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33
    return [Math.round(20 + 200 * s), Math.round(80 + 120 * s), Math.round(160 - 80 * s)]
  } else {
    const s = (t - 0.66) / 0.34
    return [Math.round(220 + 35 * s), Math.round(200 + 55 * s), Math.round(80 + 175 * s)]
  }
}

function drawSpectrogram(
  canvas: HTMLCanvasElement,
  stft: StftResult,
  showFormants: boolean,
  vowel: Vowel,
  fftLen: number,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  const { frames, nFrames } = stft
  const binHz = SR / fftLen
  const maxBin = Math.floor(F_MAX_SHOW / binHz)

  // Find global max for normalisation
  let globalMax = 1e-9
  for (const frame of frames) {
    for (let k = 0; k <= maxBin; k++) {
      if (frame[k] > globalMax) globalMax = frame[k]
    }
  }
  const DB_FLOOR = -60

  const colW = CANVAS_W / nFrames
  const rowH = CANVAS_H / maxBin

  for (let t = 0; t < nFrames; t++) {
    for (let k = 0; k <= maxBin; k++) {
      const db = 20 * Math.log10(frames[t][k] / globalMax + 1e-10)
      const [r, g, b] = magToColor(db, DB_FLOOR)
      ctx.fillStyle = `rgb(${r},${g},${b})`
      // Frequency axis: k=0 at bottom, k=maxBin at top
      const x = t * colW
      const y = CANVAS_H - (k + 1) * rowH
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(colW) + 1, Math.ceil(rowH) + 1)
    }
  }

  // Formant overlays
  if (showFormants) {
    const formantColors = ['#ef4444', '#3b82f6', '#22c55e']
    const formantLabels = ['F1', 'F2', 'F3']
    for (let fi = 0; fi < 3; fi++) {
      const fHz = vowel.F[fi]
      if (fHz > F_MAX_SHOW) continue
      const y = CANVAS_H - (fHz / binHz / maxBin) * CANVAS_H
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_W, y)
      ctx.strokeStyle = formantColors[fi]
      ctx.lineWidth = 1.8
      ctx.setLineDash([6, 3])
      ctx.stroke()
      ctx.setLineDash([])
      // Label
      ctx.fillStyle = formantColors[fi]
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`${formantLabels[fi]} ${fHz} Hz`, 6, y - 4)
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SpectrogramViewer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [vowelIdx,     setVowelIdx]     = useState(0)
  const [broadband,    setBroadband]    = useState(true)
  const [showFormants, setShowFormants] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const vowel = VOWELS[vowelIdx]
  const fftLen = broadband ? 128 : 512   // broadband = short window; narrowband = long

  const signal = useMemo(() => synthesiseVowel(vowel), [vowelIdx])
  const stft   = useMemo(() => computeStft(signal, fftLen), [signal, fftLen])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return
    drawSpectrogram(canvasRef.current, stft, showFormants, vowel, fftLen)
  }, [stft, showFormants, vowel, fftLen, mounted])

  const binHz  = SR / fftLen
  const maxBin = Math.floor(F_MAX_SHOW / binHz)
  // y-axis tick labels
  const freqTicks = [0, 1000, 2000, 3000, 4000, 5000]

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 280 }}>
        <span className="text-sm text-sky-400">Loading spectrogram viewer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 mb-1">
        Interactive · Vowel Spectrogram with Formants
      </p>
      <p className="text-sm text-sky-800 mb-4">
        Select a vowel to see its synthesised spectrogram — a time-frequency heatmap where brighter colour
        means more energy. Toggle <strong>broadband</strong> (short window, good time resolution) vs
        <strong> narrowband</strong> (long window, reveals individual harmonics). The dashed lines show formant frequencies.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Vowel buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {VOWELS.map((v, i) => (
            <button key={i} onClick={() => setVowelIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                vowelIdx === i
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white border border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}
            >
              {v.label} <span className="text-xs font-normal opacity-75">{v.example}</span>
            </button>
          ))}
        </div>
        {/* Toggles */}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setBroadband(b => !b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              broadband
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
            }`}>
            {broadband ? 'Broadband ✓' : 'Broadband'}
          </button>
          <button onClick={() => setBroadband(b => !b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              !broadband
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
            }`}>
            {!broadband ? 'Narrowband ✓' : 'Narrowband'}
          </button>
          <button onClick={() => setShowFormants(f => !f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showFormants
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}>
            {showFormants ? 'Formants ✓' : 'Formants'}
          </button>
        </div>
      </div>

      {/* Canvas + y-axis */}
      <div className="flex gap-2 items-stretch mb-3">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-right" style={{ width: 44 }}>
          {freqTicks.slice().reverse().map(f => (
            <span key={f} className="text-xs text-slate-400">
              {f === 0 ? '0' : `${f / 1000}k`}
            </span>
          ))}
        </div>
        {/* Spectrogram canvas */}
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 bg-black">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* X-axis label */}
      <div className="flex pl-12 pr-0">
        <span className="text-xs text-slate-400 flex-1 text-center">Time →</span>
      </div>
      <div className="text-center text-xs text-slate-400 mb-3">← Frequency (Hz) on y-axis, Time on x-axis</div>

      {/* Formant table */}
      <div className="rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
        <p className="text-xs font-semibold text-sky-700 mb-2">
          Formant frequencies for {vowel.label} {vowel.example}
        </p>
        <div className="flex gap-6 text-xs">
          {(['F1', 'F2', 'F3'] as const).map((label, fi) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm"
                style={{ background: ['#ef4444','#3b82f6','#22c55e'][fi] }} />
              <span className="font-semibold text-slate-700">{label}:</span>
              <span className="text-slate-600">{vowel.F[fi]} Hz</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-sky-700 mt-2">
          {broadband
            ? 'Broadband: short analysis window gives fine time resolution but smears individual harmonics into bands.'
            : 'Narrowband: long window resolves individual harmonics as separate horizontal lines — look for the striped pattern.'}
        </p>
      </div>
    </div>
  )
}
