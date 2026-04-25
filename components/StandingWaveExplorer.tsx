'use client'

// components/StandingWaveExplorer.tsx
// Interactive visualisation of standing wave modes on a string and in open/closed pipes.
// Harmonic selector (n = 1–6), mode switcher (string / open pipe / closed pipe),
// animated wave, node/antinode markers, and frequency readout.
// Usage in MDX: <StandingWaveExplorer />

import { useState, useEffect, useRef, useMemo } from 'react'

// ── Layout ─────────────────────────────────────────────────────────────────────
const VW = 580
const ML = 36, MR = 36
const PW = VW - ML - MR   // plot width
const CY = 80             // centre y of string / pipe
const AMP = 52            // max antinode amplitude
const PIPE_H = 36         // half-height of pipe walls

// ── Tube types ─────────────────────────────────────────────────────────────────
type TubeType = 'string' | 'open' | 'closed'

const TUBE_LABELS: Record<TubeType, string> = {
  string: 'String (fixed–fixed)',
  open:   'Open pipe (open–open)',
  closed: 'Closed pipe (open–closed)',
}

// For a fixed-fixed string or open-open pipe: antinodes at n equally spaced positions
// For a closed-open pipe (closed at LEFT, open at RIGHT): only odd n; (2n−1)/4 wavelengths
// We normalise x from 0 (left) to 1 (right).

// Returns the displacement amplitude envelope at position x ∈ [0,1]
// for harmonic n, given the tube type.
function envelope(x: number, n: number, tube: TubeType): number {
  if (tube === 'string' || tube === 'open') {
    // sin(n·π·x) — nodes at x=0,1; (n−1) interior nodes
    return Math.sin(n * Math.PI * x)
  } else {
    // closed at left (node), open at right (antinode)
    // only odd n; pattern = sin((2n−1)·π·x / 2)
    return Math.sin((2 * n - 1) * Math.PI * x / 2)
  }
}

// Whether a given harmonic n is valid for the tube type
function validHarmonic(n: number, tube: TubeType): boolean {
  if (tube === 'closed') return n % 2 === 1  // odd only
  return true
}

// ── Frequency display ──────────────────────────────────────────────────────────
// Use relative values (f₁ = 1 for string/open; f₁ = 0.5 for closed since v/4L)
function freqLabel(n: number, tube: TubeType): string {
  if (tube === 'closed') {
    return `f = ${2 * n - 1} × (v / 4L)`
  }
  return `f = ${n} × (v / 2L) = ${n}f₁`
}

function harmonicLabel(n: number, tube: TubeType): string {
  if (tube === 'closed') {
    const ord = ['1st', '3rd', '5th', '7th', '9th', '11th']
    return `${ord[n - 1] ?? `${2*n-1}th`} harmonic`
  }
  const ord = ['Fundamental (1st harmonic)', '2nd harmonic', '3rd harmonic',
               '4th harmonic', '5th harmonic', '6th harmonic']
  return ord[n - 1] ?? `${n}th harmonic`
}

// ── SVG path from envelope ─────────────────────────────────────────────────────
function makePath(n: number, tube: TubeType, phase: number, nPts = 200): string {
  const pts: string[] = []
  for (let i = 0; i <= nPts; i++) {
    const x = i / nPts
    const svgX = ML + x * PW
    const svgY = CY - AMP * envelope(x, n, tube) * Math.cos(phase)
    pts.push(`${i === 0 ? 'M' : 'L'}${svgX.toFixed(1)},${svgY.toFixed(1)}`)
  }
  return pts.join(' ')
}

// Node positions (x ∈ [0,1]) — include endpoints for string/closed; not for open ends
function nodePositions(n: number, tube: TubeType): number[] {
  const nodes: number[] = []
  if (tube === 'string') {
    for (let i = 0; i <= n; i++) nodes.push(i / n)
  } else if (tube === 'open') {
    for (let i = 0; i <= n; i++) nodes.push(i / n)
  } else {
    // closed end is a node; there are n nodes total (including closed end)
    const total = 2 * n - 1  // number of quarter-wavelengths
    for (let i = 0; i < n; i++) {
      nodes.push((2 * i) / total)
    }
  }
  return nodes
}

function antinodePositions(n: number, tube: TubeType): number[] {
  const anti: number[] = []
  if (tube === 'string') {
    for (let i = 1; i <= n; i++) anti.push((2 * i - 1) / (2 * n))
  } else if (tube === 'open') {
    for (let i = 1; i <= n; i++) anti.push((2 * i - 1) / (2 * n))
  } else {
    const total = 2 * n - 1
    for (let i = 0; i < n; i++) {
      anti.push((2 * i + 1) / total)
    }
  }
  return anti
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function StandingWaveExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [tube, setTube] = useState<TubeType>('string')
  const [n, setN] = useState(1)
  const [playing, setPlaying] = useState(true)

  const phaseRef = useRef(0)
  const rafRef   = useRef<number | null>(null)
  const [phase, setPhase] = useState(0)

  // Ensure n is valid when tube changes
  useEffect(() => {
    if (tube === 'closed' && n % 2 === 0) setN(n + 1)
  }, [tube])

  // Animation loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }
    let last = performance.now()
    const speed = 2.5  // radians per second
    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      phaseRef.current = (phaseRef.current + speed * dt) % (2 * Math.PI)
      setPhase(phaseRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing])

  const path = useMemo(() => makePath(n, tube, phase), [n, tube, phase])
  const nodes = useMemo(() => nodePositions(n, tube), [n, tube])
  const antinodes = useMemo(() => antinodePositions(n, tube), [n, tube])

  const SVG_H = CY + PIPE_H + 60
  const maxN = tube === 'closed' ? 6 : 6  // always show 6 buttons (some disabled)

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 260 }}>
        <span className="text-sm text-violet-400">Loading standing wave explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">
        Interactive · Standing Wave Explorer
      </p>
      <p className="text-sm text-violet-800 mb-4">
        Select the system type and harmonic number to see the standing wave mode.
        <strong> N</strong> markers show nodes (stationary); <strong>A</strong> markers show antinodes (maximum motion).
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4 items-start">
        {/* Tube type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">System</span>
          <div className="flex flex-col gap-1">
            {(['string', 'open', 'closed'] as TubeType[]).map(t => (
              <button key={t} onClick={() => setTube(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                  tube === t
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'
                }`}>
                {TUBE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Harmonic selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Harmonic (n)</span>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const valid = validHarmonic(i, tube)
              return (
                <button key={i}
                  onClick={() => valid && setN(i)}
                  disabled={!valid}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    n === i && valid
                      ? 'bg-violet-600 text-white shadow-sm'
                      : valid
                        ? 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}>
                  {i}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {tube === 'closed' ? 'Odd harmonics only for open-closed pipe' : ''}
          </p>
        </div>

        {/* Play/pause */}
        <div className="flex flex-col gap-1.5 ml-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Animation</span>
          <button onClick={() => setPlaying(p => !p)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              playing
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-violet-700 border-violet-300 hover:bg-violet-50'
            }`}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${VW} ${SVG_H}`} className="w-full rounded-xl bg-white border border-slate-100 mb-3">

        {/* Pipe / string walls */}
        {tube !== 'string' && (
          <>
            {/* Top wall */}
            <rect x={ML} y={CY - PIPE_H - 4} width={PW} height={4} rx={2}
              fill={tube === 'closed' ? '#6d28d9' : '#8b5cf6'} opacity={0.25} />
            {/* Bottom wall */}
            <rect x={ML} y={CY + PIPE_H} width={PW} height={4} rx={2}
              fill={tube === 'closed' ? '#6d28d9' : '#8b5cf6'} opacity={0.25} />
            {/* Closed left cap */}
            {tube === 'closed' && (
              <rect x={ML - 6} y={CY - PIPE_H - 4} width={6} height={PIPE_H * 2 + 8} rx={2}
                fill="#6d28d9" opacity={0.5} />
            )}
          </>
        )}

        {/* Centreline */}
        <line x1={ML} y1={CY} x2={ML + PW} y2={CY}
          stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

        {/* Fixed endpoint markers for string */}
        {tube === 'string' && (
          <>
            <rect x={ML - 4} y={CY - 18} width={6} height={36} rx={2} fill="#4f46e5" opacity={0.8} />
            <rect x={ML + PW - 2} y={CY - 18} width={6} height={36} rx={2} fill="#4f46e5" opacity={0.8} />
          </>
        )}

        {/* Antinode highlight zones */}
        {antinodes.map((ax, i) => (
          <ellipse key={i}
            cx={ML + ax * PW} cy={CY}
            rx={PW / (2 * (tube === 'closed' ? (2*n-1) : 2*n))} ry={AMP * 0.9}
            fill="#8b5cf6" opacity={0.06} />
        ))}

        {/* Standing wave */}
        <path d={path} fill="none" stroke="#7c3aed" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Mirror path (below centreline) */}
        <path
          d={makePath(n, tube, phase + Math.PI, 200)}
          fill="none" stroke="#7c3aed" strokeWidth={1.5}
          strokeLinejoin="round" strokeLinecap="round" opacity={0.25}
        />

        {/* Node markers */}
        {nodes.map((nx, i) => (
          <g key={i}>
            <circle cx={ML + nx * PW} cy={CY} r={7}
              fill="white" stroke="#7c3aed" strokeWidth={1.5} />
            <text x={ML + nx * PW} y={CY + 4} textAnchor="middle"
              fontSize={8} fill="#7c3aed" fontWeight="700">N</text>
          </g>
        ))}

        {/* Antinode markers */}
        {antinodes.map((ax, i) => (
          <g key={i}>
            <circle cx={ML + ax * PW} cy={CY} r={7}
              fill="#7c3aed" stroke="none" opacity={0.85} />
            <text x={ML + ax * PW} y={CY + 4} textAnchor="middle"
              fontSize={8} fill="white" fontWeight="700">A</text>
          </g>
        ))}

        {/* Endpoint open labels */}
        {tube === 'open' && (
          <>
            <text x={ML} y={CY - PIPE_H - 10} textAnchor="middle"
              fontSize={8} fill="#8b5cf6" fontWeight="600">OPEN</text>
            <text x={ML + PW} y={CY - PIPE_H - 10} textAnchor="middle"
              fontSize={8} fill="#8b5cf6" fontWeight="600">OPEN</text>
          </>
        )}
        {tube === 'closed' && (
          <>
            <text x={ML - 3} y={CY - PIPE_H - 10} textAnchor="middle"
              fontSize={8} fill="#6d28d9" fontWeight="600">CLOSED</text>
            <text x={ML + PW} y={CY - PIPE_H - 10} textAnchor="middle"
              fontSize={8} fill="#8b5cf6" fontWeight="600">OPEN</text>
          </>
        )}

        {/* Info labels */}
        <text x={VW / 2} y={CY + PIPE_H + 22} textAnchor="middle"
          fontSize={11} fill="#4c1d95" fontWeight="700">
          {harmonicLabel(n, tube)}
        </text>
        <text x={VW / 2} y={CY + PIPE_H + 38} textAnchor="middle"
          fontSize={10} fill="#7c3aed">
          {freqLabel(n, tube)}
        </text>
        <text x={VW / 2} y={CY + PIPE_H + 52} textAnchor="middle"
          fontSize={9} fill="#a78bfa">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {antinodes.length} antinode{antinodes.length !== 1 ? 's' : ''}
        </text>
      </svg>

      {/* Explanation */}
      <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-2.5 text-xs text-violet-800">
        {tube === 'string' && (
          <>Both ends are <strong>fixed</strong> — displacement nodes (N) at each end and at {n - 1} interior point{n > 2 ? 's' : ''}. All harmonics n = 1, 2, 3 … exist. Frequency = n × f₁.</>
        )}
        {tube === 'open' && (
          <>Both ends are <strong>open</strong> — pressure nodes (N) at each end. Displacement antinodes (A) at the ends. All harmonics n = 1, 2, 3 … exist. Frequency = n × (v/2L).</>
        )}
        {tube === 'closed' && (
          <>Left end <strong>closed</strong> (displacement node), right end <strong>open</strong> (displacement antinode). Only <strong>odd harmonics</strong> exist — n = 1, 3, 5 … — so the second resonance is 3× the fundamental. Frequency = (2n−1) × (v/4L).</>
        )}
      </div>
    </div>
  )
}
