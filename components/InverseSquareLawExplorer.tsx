'use client'

// components/InverseSquareLawExplorer.tsx
// Interactive visualisation of the inverse-square law.
// Left: overhead view of expanding wavefronts with SPL colour-coded rings.
// Right: SPL vs distance log-scale plot with −6 dB/doubling annotation.
// Slider: source level at 1 m (60–120 dB SPL).
// Usage in MDX: <InverseSquareLawExplorer />

import { useState, useEffect, useMemo } from 'react'

// ── Layout ─────────────────────────────────────────────────────────────────────
const VW = 580
const VH = 240
const MAP_W = 220   // overhead map panel
const PLOT_X = MAP_W + 16
const PLOT_W = VW - PLOT_X - 12
const MT = 28, MB = 32, ML_P = 36

// Distances shown in the overhead map (in metres, where map is 1px = 1m equivalent scaled)
const MAP_DISTANCES = [1, 2, 4, 8, 16, 32]
const MAP_SCALE = (MAP_W * 0.44) / 32   // px per metre in map

// Colour for a given dB SPL value (green → yellow → orange → red)
function spl2color(spl: number): string {
  const t = Math.max(0, Math.min(1, (spl - 30) / 90))   // 30→120 dB maps to 0→1
  if (t < 0.33) {
    const s = t / 0.33
    return `rgb(${Math.round(40 + 60 * s)},${Math.round(180 - 20 * s)},${Math.round(80 - 40 * s)})`
  } else if (t < 0.66) {
    const s = (t - 0.33) / 0.33
    return `rgb(${Math.round(100 + 130 * s)},${Math.round(160 - 80 * s)},${Math.round(40 - 20 * s)})`
  } else {
    const s = (t - 0.66) / 0.34
    return `rgb(${Math.round(230 + 25 * s)},${Math.round(80 - 60 * s)},${Math.round(20)})`
  }
}

// SPL at distance d given source level at 1 m
function splAt(d: number, l1m: number): number {
  return l1m - 20 * Math.log10(d)
}

// ── Plot axes ──────────────────────────────────────────────────────────────────
const PLOT_D_MIN = 1
const PLOT_D_MAX = 64
const PLOT_SPL_MIN = 30
const PLOT_SPL_MAX = 130

function plotX(d: number): number {
  return PLOT_X + ML_P + (Math.log10(d / PLOT_D_MIN) / Math.log10(PLOT_D_MAX / PLOT_D_MIN)) * PLOT_W
}

function plotY(spl: number): number {
  return MT + VH - MB - MT - ((spl - PLOT_SPL_MIN) / (PLOT_SPL_MAX - PLOT_SPL_MIN)) * (VH - MT - MB)
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function InverseSquareLawExplorer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [l1m, setL1m] = useState(94)   // dB SPL at 1 m
  const [hoverD, setHoverD] = useState<number | null>(null)

  // Cursor distance from plot X position
  function handlePlotMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const svgX = (e.clientX - rect.left) * (VW / rect.width)
    if (svgX < PLOT_X + ML_P || svgX > PLOT_X + ML_P + PLOT_W) { setHoverD(null); return }
    const frac = (svgX - PLOT_X - ML_P) / PLOT_W
    const d = PLOT_D_MIN * Math.pow(PLOT_D_MAX / PLOT_D_MIN, frac)
    setHoverD(d)
  }

  // SPL curve path
  const curvePath = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 200; i++) {
      const d = PLOT_D_MIN * Math.pow(PLOT_D_MAX / PLOT_D_MIN, i / 200)
      const spl = splAt(d, l1m)
      if (spl < PLOT_SPL_MIN || spl > PLOT_SPL_MAX) continue
      const x = plotX(d), y = plotY(spl)
      pts.push(`${pts.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [l1m])

  // −6 dB doubling annotation points
  const d1 = 4, d2 = 8
  const spl1 = splAt(d1, l1m)
  const spl2 = splAt(d2, l1m)
  const annX1 = plotX(d1), annY1 = plotY(spl1)
  const annX2 = plotX(d2), annY2 = plotY(spl2)

  const distTicks = [1, 2, 4, 8, 16, 32, 64]
  const splTicks  = [40, 60, 80, 100, 120]

  const hoverSpl = hoverD !== null ? splAt(hoverD, l1m) : null

  const CX_MAP = MAP_W / 2
  const CY_MAP = VH / 2

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 280 }}>
        <span className="text-sm text-emerald-400">Loading inverse-square law explorer…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
        Interactive · Inverse-Square Law Explorer
      </p>
      <p className="text-sm text-emerald-800 mb-4">
        Set the source level at 1 m. The rings show SPL at each distance; the plot shows how level falls with distance.
        Every doubling of distance = <strong>−6 dB</strong>. Hover over the plot to read off levels.
      </p>

      <svg viewBox={`0 0 ${VW} ${VH}`}
        className="w-full rounded-xl bg-white border border-slate-100 mb-4"
        onMouseMove={handlePlotMove}
        onMouseLeave={() => setHoverD(null)}>

        {/* ── Overhead map ── */}
        {/* Title */}
        <text x={CX_MAP} y={MT - 8} textAnchor="middle" fontSize={9.5} fill="#047857" fontWeight="700">
          Overhead View
        </text>

        {/* Wavefront rings */}
        {MAP_DISTANCES.slice().reverse().map(d => {
          const r = d * MAP_SCALE
          const spl = splAt(d, l1m)
          const col = spl2color(spl)
          return (
            <circle key={d} cx={CX_MAP} cy={CY_MAP} r={r}
              fill={col} opacity={0.18} stroke={col} strokeWidth={1.5} />
          )
        })}

        {/* Distance labels on map */}
        {MAP_DISTANCES.map(d => {
          const spl = splAt(d, l1m)
          return (
            <text key={d}
              x={CX_MAP + d * MAP_SCALE + 4}
              y={CY_MAP - 3}
              fontSize={7.5} fill="#374151">
              {d}m
            </text>
          )
        })}

        {/* Source dot */}
        <circle cx={CX_MAP} cy={CY_MAP} r={6} fill="#059669" />
        <text x={CX_MAP} y={CY_MAP + 16} textAnchor="middle" fontSize={8} fill="#047857" fontWeight="700">
          {l1m} dB @ 1m
        </text>

        {/* Panel divider */}
        <line x1={MAP_W + 6} y1={MT - 4} x2={MAP_W + 6} y2={VH - MB + 4}
          stroke="#e2e8f0" strokeWidth={1} />

        {/* ── SPL vs distance plot ── */}
        {/* Axes */}
        <line x1={PLOT_X + ML_P} y1={MT} x2={PLOT_X + ML_P} y2={VH - MB}
          stroke="#94a3b8" strokeWidth={1.2} />
        <line x1={PLOT_X + ML_P} y1={VH - MB} x2={PLOT_X + ML_P + PLOT_W} y2={VH - MB}
          stroke="#94a3b8" strokeWidth={1.2} />

        {/* Grid lines and ticks */}
        {splTicks.map(s => {
          const y = plotY(s)
          return (
            <g key={s}>
              <line x1={PLOT_X + ML_P} y1={y} x2={PLOT_X + ML_P + PLOT_W} y2={y}
                stroke="#f1f5f9" strokeWidth={1} />
              <text x={PLOT_X + ML_P - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#64748b">{s}</text>
            </g>
          )
        })}
        {distTicks.map(d => {
          const x = plotX(d)
          return (
            <g key={d}>
              <line x1={x} y1={MT} x2={x} y2={VH - MB} stroke="#f1f5f9" strokeWidth={1} />
              <line x1={x} y1={VH - MB} x2={x} y2={VH - MB + 4} stroke="#94a3b8" />
              <text x={x} y={VH - MB + 13} textAnchor="middle" fontSize={8} fill="#64748b">{d}</text>
            </g>
          )
        })}

        {/* Axis labels */}
        <text x={PLOT_X + ML_P + PLOT_W / 2} y={VH - 3} textAnchor="middle" fontSize={9} fill="#64748b">
          Distance (m) — log scale
        </text>
        <text x={PLOT_X + 6} y={MT + (VH - MT - MB) / 2} textAnchor="middle" fontSize={9} fill="#64748b"
          transform={`rotate(-90,${PLOT_X + 6},${MT + (VH - MT - MB) / 2})`}>
          dB SPL
        </text>

        {/* Title */}
        <text x={PLOT_X + ML_P + PLOT_W / 2} y={MT - 8} textAnchor="middle"
          fontSize={9.5} fill="#047857" fontWeight="700">
          SPL vs Distance
        </text>

        {/* SPL curve */}
        <path d={curvePath} fill="none" stroke="#059669" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* −6 dB per doubling annotation */}
        {spl1 >= PLOT_SPL_MIN && spl2 >= PLOT_SPL_MIN && spl1 <= PLOT_SPL_MAX && spl2 <= PLOT_SPL_MAX && (
          <g>
            {/* Horizontal bracket */}
            <line x1={annX1} y1={annY1} x2={annX2} y2={annY1}
              stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="3 2" />
            <line x1={annX1} y1={annY1 - 4} x2={annX1} y2={annY1 + 4} stroke="#f59e0b" strokeWidth={1.2} />
            <line x1={annX2} y1={annY1 - 4} x2={annX2} y2={annY1 + 4} stroke="#f59e0b" strokeWidth={1.2} />
            <text x={(annX1 + annX2) / 2} y={annY1 - 6} textAnchor="middle" fontSize={7.5} fill="#b45309">×2 dist.</text>
            {/* Vertical drop */}
            <line x1={annX2} y1={annY1} x2={annX2} y2={annY2}
              stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="3 2" />
            <text x={annX2 + 4} y={(annY1 + annY2) / 2 + 3} fontSize={8} fill="#b45309" fontWeight="700">
              −6 dB
            </text>
          </g>
        )}

        {/* Hover cursor */}
        {hoverD !== null && hoverSpl !== null && hoverSpl >= PLOT_SPL_MIN && hoverSpl <= PLOT_SPL_MAX && (
          <g>
            <line x1={plotX(hoverD)} y1={MT} x2={plotX(hoverD)} y2={VH - MB}
              stroke="#059669" strokeWidth={1} opacity={0.5} />
            <circle cx={plotX(hoverD)} cy={plotY(hoverSpl)} r={4}
              fill="#059669" stroke="white" strokeWidth={1.5} />
            <rect x={plotX(hoverD) - 36} y={plotY(hoverSpl) - 22} width={72} height={16}
              fill="white" stroke="#d1fae5" rx={3} />
            <text x={plotX(hoverD)} y={plotY(hoverSpl) - 10} textAnchor="middle"
              fontSize={8.5} fill="#059669" fontWeight="700">
              {hoverD.toFixed(1)} m → {hoverSpl.toFixed(1)} dB
            </text>
          </g>
        )}
      </svg>

      {/* Source level slider */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-xs font-medium text-slate-700 w-48 shrink-0">
          Source level at 1 m: <strong className="text-emerald-700">{l1m} dB SPL</strong>
        </span>
        <input type="range" min={60} max={120} step={1} value={l1m}
          onChange={e => setL1m(Number(e.target.value))}
          className="flex-1 accent-emerald-600" />
      </div>

      {/* Distance readout table */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
        <p className="text-xs font-semibold text-emerald-700 mb-2">Level at each distance</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono">
          {MAP_DISTANCES.map(d => {
            const spl = splAt(d, l1m)
            return (
              <span key={d} style={{ color: spl2color(spl) }} className="font-semibold">
                {d} m: {spl.toFixed(0)} dB
              </span>
            )
          })}
        </div>
        <p className="text-xs text-emerald-600 mt-2">
          Each doubling of distance reduces the level by <strong>6 dB</strong> (intensity drops to ¼).
          The colour scale runs from green (quiet) through yellow and orange to red (loud).
        </p>
      </div>
    </div>
  )
}
