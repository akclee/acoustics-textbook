'use client'

// components/SineWaveExplorer.tsx
// Interactive SVG sine wave visualizer with sliders for amplitude, frequency, and phase.
// Usage in MDX:  <SineWaveExplorer />

import { useState, useEffect } from 'react'

const W = 600
const H = 200
const CY = H / 2   // vertical center
const POINTS = 400 // SVG path resolution

function buildPath(A: number, f: number, phi: number): string {
  const pts: string[] = []
  for (let i = 0; i <= POINTS; i++) {
    const x = (i / POINTS) * W
    // Map x → t in [0, 2] cycles of the base period
    const t = (i / POINTS) * 2 * Math.PI * 2
    const y = CY - A * (H * 0.42) * Math.sin(f * t + phi)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-blue-600">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500 cursor-pointer"
      />
    </div>
  )
}

export default function SineWaveExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [A, setA] = useState(1.0)      // amplitude (normalized)
  const [f, setF] = useState(1.0)      // relative frequency multiplier
  const [phi, setPhi] = useState(0.0)  // phase offset in radians

  const path = buildPath(A, f, phi)

  // Approximate period annotation: width / (f * 2) in SVG units
  const periodPx = W / (f * 2)

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-6
                      flex items-center justify-center" style={{ minHeight: 260 }}>
        <span className="text-sm text-slate-400">Loading sine wave explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Interactive: Sine Wave Explorer
      </p>

      {/* SVG canvas */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-xl bg-white border border-slate-100"
        aria-label="Interactive sine wave diagram"
      >
        {/* Grid lines */}
        <line x1={0} y1={CY} x2={W} y2={CY} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={0} y1={CY - H * 0.42} x2={W} y2={CY - H * 0.42}
              stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={0} y1={CY + H * 0.42} x2={W} y2={CY + H * 0.42}
              stroke="#f1f5f9" strokeWidth={1} strokeDasharray="4 4" />

        {/* Amplitude annotation */}
        <line x1={12} y1={CY} x2={12} y2={CY - A * H * 0.42}
              stroke="#f59e0b" strokeWidth={1.5} />
        <text x={16} y={CY - (A * H * 0.42) / 2} fontSize={10}
              fill="#d97706" dominantBaseline="middle" fontFamily="monospace">
          A
        </text>

        {/* Period annotation (first cycle) */}
        {periodPx > 30 && (
          <>
            <line x1={0} y1={H - 12} x2={periodPx} y2={H - 12}
                  stroke="#6366f1" strokeWidth={1} />
            <line x1={0} y1={H - 18} x2={0} y2={H - 6}
                  stroke="#6366f1" strokeWidth={1} />
            <line x1={periodPx} y1={H - 18} x2={periodPx} y2={H - 6}
                  stroke="#6366f1" strokeWidth={1} />
            <text x={periodPx / 2} y={H - 14} fontSize={10}
                  fill="#6366f1" textAnchor="middle" dominantBaseline="auto"
                  fontFamily="monospace">
              T
            </text>
          </>
        )}

        {/* The wave */}
        <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Sliders */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Slider
          label="Amplitude (A)"
          value={A}
          min={0.1}
          max={2}
          step={0.05}
          display={A.toFixed(2)}
          onChange={setA}
        />
        <Slider
          label="Frequency (f)"
          value={f}
          min={0.5}
          max={4}
          step={0.25}
          display={`${f.toFixed(2)}×`}
          onChange={setF}
        />
        <Slider
          label="Phase (φ)"
          value={phi}
          min={-Math.PI}
          max={Math.PI}
          step={0.1}
          display={`${phi.toFixed(2)} rad`}
          onChange={setPhi}
        />
      </div>

      <p className="text-xs text-slate-400 mt-4 leading-relaxed">
        Drag the sliders to see how each parameter changes the wave shape.{' '}
        <strong className="text-amber-600">A</strong> sets the peak displacement,{' '}
        <strong className="text-blue-600">f</strong> sets how many cycles appear,
        and <strong className="text-indigo-600">φ</strong> shifts the wave left or right.{' '}
        <strong className="text-indigo-600">T</strong> marks the duration of one complete cycle.
      </p>
    </div>
  )
}