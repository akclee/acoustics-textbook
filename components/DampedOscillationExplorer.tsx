'use client'

// components/DampedOscillationExplorer.tsx
// Animated spring-mass-dashpot showing three damping regimes.
// Left: physical animation (spring + dashpot + mass).
// Right: time-domain displacement curve with exponential envelope.
// Sliders for damping ratio ζ and natural frequency f₀.
// Usage in MDX: <DampedOscillationExplorer />

import { useState, useEffect, useRef, useMemo } from 'react'

// ── Physics ────────────────────────────────────────────────────────────────────
// x(t) = displacement from equilibrium, initial conditions x(0) = 1, x'(0) = 0

function displacement(t: number, zeta: number, omega0: number): number {
  if (zeta < 1) {
    // Underdamped: oscillatory decay
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta)
    return Math.exp(-zeta * omega0 * t) *
      (Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t))
  } else if (zeta === 1 || Math.abs(zeta - 1) < 0.01) {
    // Critically damped
    return Math.exp(-omega0 * t) * (1 + omega0 * t)
  } else {
    // Overdamped
    const r1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1))
    const r2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1))
    const A = -r2 / (r1 - r2)
    const B =  r1 / (r1 - r2)
    return A * Math.exp(r1 * t) + B * Math.exp(r2 * t)
  }
}

function envelope(t: number, zeta: number, omega0: number): number {
  return Math.exp(-zeta * omega0 * t)
}

// ── Layout ─────────────────────────────────────────────────────────────────────
const VW = 580
const ANIM_W = 180   // spring-mass animation panel
const PLOT_X = ANIM_W + 20
const PLOT_W = VW - PLOT_X - 12
const VH = 220
const MT = 22, MB = 28, ML_PLOT = 30

// Spring zigzag path centred in ANIM_W
function springPath(y1: number, y2: number, cx: number, coils = 7): string {
  const len = y2 - y1
  const step = len / (coils * 2 + 2)
  const amp = 14
  let d = `M${cx},${y1} L${cx},${y1 + step}`
  for (let i = 0; i < coils; i++) {
    const yMid = y1 + step + i * step * 2
    d += ` L${cx + amp},${yMid + step} L${cx - amp},${yMid + step * 2}`
  }
  d += ` L${cx},${y2 - step} L${cx},${y2}`
  return d
}

// Dashpot path (cylinder + piston rod) to the right of spring
function dashpotPath(y1: number, y2: number, cx: number): {
  outer: string; piston: string; rod: string; cap: string
} {
  const midY = (y1 + y2) / 2
  const bodyH = (y2 - y1) * 0.4
  const bodyTop = midY - bodyH / 2 + 10
  const bodyBot = midY + bodyH / 2 + 10
  return {
    outer: `M${cx - 8},${bodyTop} L${cx - 8},${bodyBot} L${cx + 8},${bodyBot} L${cx + 8},${bodyTop}`,
    piston: `M${cx - 6},${midY + 10} L${cx + 6},${midY + 10}`,
    rod: `M${cx},${y2} L${cx},${bodyBot}`,
    cap: `M${cx},${y1} L${cx},${bodyTop}`,
  }
}

// ── Regime info ────────────────────────────────────────────────────────────────
function regimeInfo(zeta: number): { label: string; color: string; desc: string } {
  if (zeta < 0.99) return {
    label: 'Underdamped',
    color: '#2563eb',
    desc: 'Oscillates past equilibrium before settling — typical of tuning forks, bells, resonant systems.',
  }
  if (zeta < 1.05) return {
    label: 'Critically damped',
    color: '#16a34a',
    desc: 'Returns to equilibrium as fast as possible without overshooting — ideal for instrument mutes and door closers.',
  }
  return {
    label: 'Overdamped',
    color: '#d97706',
    desc: 'Returns slowly without oscillating — like a car shock absorber or a padded drum surface.',
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function DampedOscillationExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [zeta,   setZeta]   = useState(0.15)
  const [f0,     setF0]     = useState(3)      // Hz
  const [elapsed, setElapsed] = useState(0)

  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  const omega0 = 2 * Math.PI * f0
  const T_SHOW = Math.max(4 / (zeta * f0 + 0.1), 3 / f0, 1.5)  // show ~4 time constants or ~3 periods

  // Reset animation on param change
  useEffect(() => {
    startRef.current = null
    setElapsed(0)
  }, [zeta, f0])

  // Animation loop
  useEffect(() => {
    if (!mounted) return
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now
      const t = (now - startRef.current) / 1000
      setElapsed(t % (T_SHOW + 0.5))   // loop
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [mounted, T_SHOW])

  const regime = regimeInfo(zeta)

  // ── Time plot ──────────────────────────────────────────────────────────────
  const N_PLOT = 300
  const plotPath = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= N_PLOT; i++) {
      const t = (i / N_PLOT) * T_SHOW
      const x = displacement(t, zeta, omega0)
      const svgX = PLOT_X + ML_PLOT + (t / T_SHOW) * PLOT_W
      const svgY = VH / 2 - x * (VH / 2 - MT - 4) * 0.88
      pts.push(`${i === 0 ? 'M' : 'L'}${svgX.toFixed(1)},${svgY.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [zeta, omega0, T_SHOW])

  const envTopPath = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= N_PLOT; i++) {
      const t = (i / N_PLOT) * T_SHOW
      const e = envelope(t, zeta, omega0)
      const svgX = PLOT_X + ML_PLOT + (t / T_SHOW) * PLOT_W
      const svgY = VH / 2 - e * (VH / 2 - MT - 4) * 0.88
      pts.push(`${i === 0 ? 'M' : 'L'}${svgX.toFixed(1)},${svgY.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [zeta, omega0, T_SHOW])

  const envBotPath = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= N_PLOT; i++) {
      const t = (i / N_PLOT) * T_SHOW
      const e = envelope(t, zeta, omega0)
      const svgX = PLOT_X + ML_PLOT + (t / T_SHOW) * PLOT_W
      const svgY = VH / 2 + e * (VH / 2 - MT - 4) * 0.88
      pts.push(`${i === 0 ? 'M' : 'L'}${svgX.toFixed(1)},${svgY.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [zeta, omega0, T_SHOW])

  // ── Spring-mass animation ─────────────────────────────────────────────────
  const CEIL_Y = 16
  const MASS_H = 24
  const MASS_W = 44
  const CX_SPRING  = ANIM_W * 0.38
  const CX_DASHPOT = ANIM_W * 0.70
  const REST_Y = VH * 0.54   // equilibrium mass top
  const MAX_DISP = 48

  const xNow = displacement(elapsed % (T_SHOW + 0.5), zeta, omega0)
  const massTopY = REST_Y - xNow * MAX_DISP

  const spring1 = springPath(CEIL_Y + 6, massTopY, CX_SPRING)
  const dp = dashpotPath(CEIL_Y + 6, massTopY + MASS_H / 2, CX_DASHPOT)

  // Current-time marker on plot
  const markerX = PLOT_X + ML_PLOT + Math.min(elapsed / T_SHOW, 1) * PLOT_W

  // Derived display values
  const tauSec   = 1 / (zeta * omega0)
  const omegaD   = zeta < 1 ? omega0 * Math.sqrt(1 - zeta * zeta) : 0
  const fD       = omegaD / (2 * Math.PI)

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 280 }}>
        <span className="text-sm text-blue-400">Loading damped oscillation explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
        Interactive · Damped Oscillation Explorer
      </p>
      <p className="text-sm text-blue-800 mb-4">
        Adjust the <strong>damping ratio ζ</strong> and <strong>natural frequency</strong> to see how the oscillation decays.
        Watch the mass animate on the left while the displacement trace builds on the right.
      </p>

      {/* SVG */}
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full rounded-xl bg-white border border-slate-100 mb-4">

        {/* ── Animation panel ── */}
        {/* Ceiling */}
        <rect x={4} y={CEIL_Y - 6} width={ANIM_W - 8} height={8} rx={2} fill="#94a3b8" />
        <line x1={4} y1={CEIL_Y - 6} x2={ANIM_W - 4} y2={CEIL_Y - 6} stroke="#64748b" strokeWidth={1} />
        {/* Hatch marks on ceiling */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={10 + i * 16} y1={CEIL_Y - 10} x2={6 + i * 16} y2={CEIL_Y - 6}
            stroke="#94a3b8" strokeWidth={1} />
        ))}

        {/* Equilibrium dashed line */}
        <line x1={8} y1={REST_Y + MASS_H / 2} x2={ANIM_W - 4} y2={REST_Y + MASS_H / 2}
          stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />
        <text x={ANIM_W - 6} y={REST_Y + MASS_H / 2 - 3} textAnchor="end"
          fontSize={8} fill="#94a3b8">equilibrium</text>

        {/* Spring */}
        <path d={spring1} fill="none" stroke="#3b82f6" strokeWidth={2.2} strokeLinecap="round" />

        {/* Dashpot body */}
        <path d={dp.outer} fill="none" stroke="#64748b" strokeWidth={1.8} />
        <path d={dp.piston} fill="none" stroke="#475569" strokeWidth={2.5} strokeLinecap="round" />
        <path d={dp.rod} fill="none" stroke="#64748b" strokeWidth={1.5} />
        <path d={dp.cap} fill="none" stroke="#64748b" strokeWidth={1.5} />

        {/* Ceiling attachment dots */}
        <circle cx={CX_SPRING}  cy={CEIL_Y + 6} r={3} fill="#3b82f6" />
        <circle cx={CX_DASHPOT} cy={CEIL_Y + 6} r={3} fill="#64748b" />

        {/* Mass */}
        <rect
          x={(ANIM_W - MASS_W) / 2} y={massTopY}
          width={MASS_W} height={MASS_H} rx={4}
          fill={regime.color} opacity={0.9}
        />
        <text x={ANIM_W / 2} y={massTopY + MASS_H / 2 + 4} textAnchor="middle"
          fontSize={9} fill="white" fontWeight="700">m</text>

        {/* Labels */}
        <text x={CX_SPRING - 18} y={REST_Y + 26} textAnchor="middle"
          fontSize={8} fill="#3b82f6" fontWeight="600">spring</text>
        <text x={CX_DASHPOT + 18} y={REST_Y + 26} textAnchor="middle"
          fontSize={8} fill="#64748b" fontWeight="600">dashpot</text>

        {/* Panel divider */}
        <line x1={ANIM_W + 8} y1={MT} x2={ANIM_W + 8} y2={VH - MB}
          stroke="#e2e8f0" strokeWidth={1} />

        {/* ── Time plot ── */}
        {/* Axes */}
        <line x1={PLOT_X + ML_PLOT} y1={MT} x2={PLOT_X + ML_PLOT} y2={VH - MB}
          stroke="#94a3b8" strokeWidth={1.2} />
        <line x1={PLOT_X + ML_PLOT} y1={VH - MB} x2={PLOT_X + ML_PLOT + PLOT_W} y2={VH - MB}
          stroke="#94a3b8" strokeWidth={1.2} />

        {/* Zero line */}
        <line x1={PLOT_X + ML_PLOT} y1={VH / 2} x2={PLOT_X + ML_PLOT + PLOT_W} y2={VH / 2}
          stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />

        {/* Envelope (underdamped only) */}
        {zeta < 0.99 && (
          <>
            <path d={envTopPath} fill="none" stroke={regime.color} strokeWidth={1}
              strokeDasharray="4 3" opacity={0.5} />
            <path d={envBotPath} fill="none" stroke={regime.color} strokeWidth={1}
              strokeDasharray="4 3" opacity={0.5} />
          </>
        )}

        {/* Displacement curve */}
        <path d={plotPath} fill="none" stroke={regime.color} strokeWidth={2.2}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Current-time marker */}
        {elapsed < T_SHOW && (
          <line x1={markerX} y1={MT} x2={markerX} y2={VH - MB}
            stroke={regime.color} strokeWidth={1.2} opacity={0.6} />
        )}

        {/* Axis labels */}
        <text x={PLOT_X + ML_PLOT + PLOT_W / 2} y={VH - 4} textAnchor="middle"
          fontSize={9} fill="#64748b">Time (s)</text>
        <text x={PLOT_X + 8} y={VH / 2 + 4} textAnchor="middle"
          fontSize={9} fill="#64748b"
          transform={`rotate(-90,${PLOT_X + 8},${VH / 2})`}>x(t)</text>

        {/* Time tick at T_SHOW */}
        <text x={PLOT_X + ML_PLOT + PLOT_W} y={VH - MB + 12} textAnchor="middle"
          fontSize={8} fill="#94a3b8">{T_SHOW.toFixed(1)}</text>
        <text x={PLOT_X + ML_PLOT} y={VH - MB + 12} textAnchor="middle"
          fontSize={8} fill="#94a3b8">0</text>

        {/* Title */}
        <text x={PLOT_X + ML_PLOT + PLOT_W / 2} y={MT - 6} textAnchor="middle"
          fontSize={10} fill={regime.color} fontWeight="700">
          {regime.label}
        </text>

        {/* τ annotation */}
        {tauSec < T_SHOW && (() => {
          const tx = PLOT_X + ML_PLOT + (tauSec / T_SHOW) * PLOT_W
          return (
            <g>
              <line x1={tx} y1={MT + 2} x2={tx} y2={VH - MB}
                stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" opacity={0.8} />
              <text x={tx + 3} y={MT + 13} fontSize={8} fill="#b45309">τ</text>
            </g>
          )
        })()}
      </svg>

      {/* Sliders */}
      <div className="space-y-3 mb-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-700 w-52 shrink-0">
            Damping ratio ζ: <strong style={{ color: regime.color }}>{zeta.toFixed(2)}</strong>
            <span className="text-slate-400 ml-1 font-normal">({regime.label})</span>
          </span>
          <input type="range" min={0.05} max={2.0} step={0.01} value={zeta}
            onChange={e => setZeta(Number(e.target.value))}
            className="flex-1" style={{ accentColor: regime.color }} />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-700 w-52 shrink-0">
            Natural frequency f₀: <strong>{f0.toFixed(1)} Hz</strong>
          </span>
          <input type="range" min={1} max={8} step={0.5} value={f0}
            onChange={e => setF0(Number(e.target.value))}
            className="flex-1 accent-blue-500" />
        </div>
      </div>

      {/* Info panel */}
      <div className="rounded-xl px-4 py-2.5 text-xs border"
        style={{ background: `${regime.color}12`, borderColor: `${regime.color}40`, color: '#1e293b' }}>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-1.5 font-mono text-xs">
          <span>ζ = {zeta.toFixed(2)}</span>
          <span>f₀ = {f0.toFixed(1)} Hz</span>
          <span>τ = {tauSec.toFixed(2)} s</span>
          {zeta < 0.99 && <span>f_d = {fD.toFixed(2)} Hz</span>}
        </div>
        <p style={{ color: regime.color.replace(')', ', 0.9)').replace('rgb', 'rgba') }}>
          <strong>{regime.label}:</strong> {regime.desc}
        </p>
      </div>

      {/* Regime guide */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-600" />
          <span className="text-slate-600">ζ &lt; 1 — underdamped (oscillatory)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-600" />
          <span className="text-slate-600">ζ ≈ 1 — critically damped</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-600" />
          <span className="text-slate-600">ζ &gt; 1 — overdamped</span>
        </span>
      </div>
    </div>
  )
}
