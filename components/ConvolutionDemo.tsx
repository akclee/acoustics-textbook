'use client'

// components/ConvolutionDemo.tsx
// Visual step-through of discrete convolution.
//
// Scenario: an open field with a single echo.
//   h = [1.0, 0.6]        impulse response: direct + one echo at 60%
//   x = [1.0, 0, 0, 0.8]  input: two sounds separated in time
//   y = h * x             output computed via convolution
//
// Students click "Next step" to reveal output samples one at a time,
// with the contributing products highlighted.

import { useState } from 'react'

// ── Signal definitions ────────────────────────────────────────────────────────
const H = [1.0, 0.6]           // impulse response
const X = [1.0, 0.0, 0.0, 0.8] // input

function convolve(h: number[], x: number[]): number[] {
  const L = h.length + x.length - 1
  const y = new Array(L).fill(0)
  for (let n = 0; n < L; n++) {
    for (let k = 0; k < h.length; k++) {
      const xIdx = n - k
      if (xIdx >= 0 && xIdx < x.length) y[n] += h[k] * x[xIdx]
    }
  }
  return y.map(v => +v.toFixed(3))
}

const Y = convolve(H, X)  // [1.0, 0.6, 0.0, 0.8, 0.48]

// ── Bar-chart SVG constants ──────────────────────────────────────────────────
const BAR_W    = 36
const BAR_GAP  = 8
const MAX_VAL  = 1.0
const CHART_H  = 100
const ML_C     = 20
const MB_C     = 28

// ── Single bar chart ─────────────────────────────────────────────────────────
function BarChart({
  signal,
  label,
  color,
  activeIdx,
  highlightIdxs,
  width,
}: {
  signal: number[]
  label: string
  color: string
  activeIdx?: number          // currently-being-revealed bar (orange)
  highlightIdxs?: number[]    // contributing bars (lighter color)
  width: number
}) {
  const totalBars  = signal.length
  const chartWidth = ML_C + totalBars * (BAR_W + BAR_GAP) + 20

  return (
    <div className="flex flex-col items-start">
      <span className="text-xs font-semibold text-slate-600 mb-1 ml-5">{label}</span>
      <svg width={Math.max(chartWidth, width)} height={CHART_H + MB_C}
        className="rounded-lg bg-slate-50 border border-slate-100">
        {/* baseline */}
        <line x1={ML_C - 4} y1={CHART_H} x2={chartWidth - 4} y2={CHART_H} stroke="#cbd5e1" strokeWidth={1} />
        {signal.map((val, i) => {
          const barH   = Math.abs(val) / MAX_VAL * (CHART_H - 8)
          const x      = ML_C + i * (BAR_W + BAR_GAP)
          const y      = CHART_H - barH
          const isActive    = i === activeIdx
          const isHighlight = highlightIdxs?.includes(i)
          const fill =
            isActive    ? '#f59e0b' :
            isHighlight ? color.replace('6', '3') :
            val === 0   ? '#e2e8f0' : color

          return (
            <g key={i}>
              <rect x={x} y={y} width={BAR_W} height={Math.max(barH, 1)}
                fill={fill} rx={3}
                opacity={val === 0 ? 0.5 : 1}
              />
              {/* value label */}
              {val !== 0 && (
                <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#334155" fontWeight="600">
                  {val}
                </text>
              )}
              {/* index label */}
              <text x={x + BAR_W / 2} y={CHART_H + 16} textAnchor="middle" fontSize={10} fill="#94a3b8">
                {i}
              </text>
              {val === 0 && (
                <text x={x + BAR_W / 2} y={CHART_H - 4} textAnchor="middle" fontSize={9} fill="#cbd5e1">0</text>
              )}
            </g>
          )
        })}
        {/* axis label */}
        <text x={ML_C - 4} y={CHART_H + 26} fontSize={9} fill="#94a3b8">n =</text>
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ConvolutionDemo() {
  const [step, setStep] = useState(-1)   // -1 = not started; 0..Y.length-1 = revealing
  const started = step >= 0
  const done    = step >= Y.length - 1

  // For the current step n, highlight the h[k] and x[n-k] indices that contribute
  const hHighlight: number[] = []
  const xHighlight: number[] = []
  if (step >= 0) {
    for (let k = 0; k < H.length; k++) {
      const xIdx = step - k
      if (xIdx >= 0 && xIdx < X.length) {
        hHighlight.push(k)
        xHighlight.push(xIdx)
      }
    }
  }

  // The y signal revealed so far (unrevealed slots shown as 0)
  const yRevealed = Y.map((v, i) => (i <= step ? v : 0))

  // Equation for current step
  const equationParts: string[] = []
  if (step >= 0) {
    for (let k = 0; k < H.length; k++) {
      const xIdx = step - k
      if (xIdx >= 0 && xIdx < X.length) {
        equationParts.push(`h[${k}]·x[${xIdx}] = ${H[k]}×${X[xIdx]}`)
      }
    }
  }

  const chartW = 240

  return (
    <div className="my-8 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
        Interactive · Convolution Step-Through
      </p>
      <p className="text-sm text-emerald-800 mb-1">
        <strong>Scenario:</strong> An open field with a single echo.
      </p>
      <p className="text-xs text-emerald-700 mb-4">
        <strong>h[n]</strong> = impulse response (direct sound + echo at 60%) &nbsp;·&nbsp;
        <strong>x[n]</strong> = input (two sounds at n=0 and n=3) &nbsp;·&nbsp;
        <strong>y[n] = h * x</strong> = output
      </p>

      {/* Charts */}
      <div className="flex flex-wrap gap-4 mb-4">
        <BarChart signal={H} label="h[n] — Impulse Response" color="#6366f1"
          highlightIdxs={started ? hHighlight : []} width={chartW} />
        <BarChart signal={X} label="x[n] — Input Signal" color="#0891b2"
          highlightIdxs={started ? xHighlight : []} width={chartW} />
      </div>

      {/* Output row */}
      <div className="mb-4">
        <BarChart signal={yRevealed} label="y[n] = h * x — Output (convolution)" color="#059669"
          activeIdx={started ? step : undefined} width={chartW * 2 + 16} />
      </div>

      {/* Equation for current step */}
      {started && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 mb-4 text-sm font-mono text-amber-900">
          <span className="font-semibold">y[{step}]</span> = {equationParts.join(' + ')}
          {' = '}
          <span className="font-bold text-emerald-700">{Y[step]}</span>
          {equationParts.length === 0 && <span className="text-slate-400"> (no overlap — boundary)</span>}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!started ? (
          <button
            onClick={() => setStep(0)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Start step-through
          </button>
        ) : (
          <>
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(s => Math.min(Y.length - 1, s + 1))}
              disabled={done}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              {done ? 'Done ✓' : 'Next step →'}
            </button>
            <button
              onClick={() => setStep(-1)}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-2"
            >
              Reset
            </button>
            <span className="text-xs text-slate-500 ml-auto">
              Step {step + 1} of {Y.length}
            </span>
          </>
        )}
      </div>

      {done && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900">
          <p>
            Notice: each input pulse produces a copy of <strong>h[n]</strong> (direct + echo) in the output.
            The two copies overlap when they are close in time. This is convolution —
            the output is the input signal <em>filtered</em> by the system's impulse response.
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            In the frequency domain: <strong>Y(f) = H(f) · X(f)</strong> — multiplication, not sliding.
          </p>
        </div>
      )}
    </div>
  )
}