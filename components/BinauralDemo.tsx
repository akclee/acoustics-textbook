'use client'

// components/BinauralDemo.tsx
// Interactive demonstration of binaural cues for sound localization.
// Sliders control ITD (interaural time difference, ±630 µs) and
// ILD (interaural level difference, ±20 dB). An overhead-view SVG
// shows the estimated sound-source angle. A Web Audio API button
// lets students actually hear the lateralization effect.
// Usage in MDX: <BinauralDemo />

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Geometry ──────────────────────────────────────────────────────────────────
// ITD → angle (simplified duplex model for low frequencies)
// Max ITD at 90° ≈ 630 µs  (d/c where d ≈ 0.215 m, c = 343 m/s)
const MAX_ITD_US = 630   // µs
const MAX_ILD_DB = 20    // dB

function itdToAngle(itdUs: number): number {
  // Linear approximation: angle (deg) = ITD / MAX_ITD * 90
  return (itdUs / MAX_ITD_US) * 90
}

function ildToAngle(ildDb: number): number {
  return (ildDb / MAX_ILD_DB) * 90
}

function combinedAngle(itdUs: number, ildDb: number): number {
  // Weight ITD more at low freq, ILD more at high freq — use simple average
  const a = (itdToAngle(itdUs) + ildToAngle(ildDb)) / 2
  return Math.max(-90, Math.min(90, a))
}

// ── SVG layout ────────────────────────────────────────────────────────────────
const SVG_W = 320
const SVG_H = 280
const CX = SVG_W / 2
const CY = SVG_H / 2 + 10
const HEAD_R = 38
const EAR_R  = 7
const SPACE_R = 120   // radius of sound-source dot

// ── Colour helpers ────────────────────────────────────────────────────────────
function angleToColor(angleDeg: number): string {
  const t = (angleDeg + 90) / 180  // 0 = far left, 1 = far right
  const hue = Math.round(t * 200 + 20)
  return `hsl(${hue},80%,45%)`
}

// ── Web Audio helpers ─────────────────────────────────────────────────────────
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BinauralDemo() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [itd, setItd] = useState(0)     // µs, positive = sound to the right
  const [ild, setIld] = useState(0)     // dB, positive = louder in right ear
  const [playing, setPlaying] = useState(false)
  const [audioReady, setAudioReady] = useState(true)

  const audioCtxRef   = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const leftGainRef   = useRef<GainNode | null>(null)
  const rightGainRef  = useRef<GainNode | null>(null)
  const mergerRef     = useRef<ChannelMergerNode | null>(null)

  const angle = combinedAngle(itd, ild)
  const color = angleToColor(angle)

  const sourceAngleRad = (angle - 90) * (Math.PI / 180)  // SVG: 0° = top
  const sourceX = CX + SPACE_R * Math.cos(sourceAngleRad)
  const sourceY = CY + SPACE_R * Math.sin(sourceAngleRad)

  // ── Update live audio parameters ────────────────────────────────────────────
  const updateAudio = useCallback((newItd: number, newIld: number) => {
    if (!audioCtxRef.current || !playing) return
    const ctx = audioCtxRef.current
    const now = ctx.currentTime

    // ILD: split gain between ears
    const leftDb  = newIld <= 0 ? 0 : -newIld
    const rightDb = newIld >= 0 ? 0 :  newIld
    leftGainRef.current?.gain.setTargetAtTime(dbToLinear(leftDb), now, 0.02)
    rightGainRef.current?.gain.setTargetAtTime(dbToLinear(rightDb), now, 0.02)
    // ITD: we approximate with a tiny gain offset note — true delay requires
    // DelayNode (added on play)
  }, [playing])

  // ── Start/stop audio ────────────────────────────────────────────────────────
  const startAudio = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx

      // Oscillator (500 Hz tone — within phase-locking range for ITD demo)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 500
      oscillatorRef.current = osc

      // Stereo channel merger
      const merger = ctx.createChannelMerger(2)
      mergerRef.current = merger

      // Gain nodes for ILD
      const leftGain  = ctx.createGain()
      const rightGain = ctx.createGain()
      leftGainRef.current  = leftGain
      rightGainRef.current = rightGain

      // Left channel delay node (for ITD)
      const leftDelay  = ctx.createDelay(0.01)
      const rightDelay = ctx.createDelay(0.01)

      const itdSec = Math.abs(itd) * 1e-6
      if (itd > 0) {
        // Sound to the right: left ear delayed
        leftDelay.delayTime.value  = itdSec
        rightDelay.delayTime.value = 0
      } else {
        leftDelay.delayTime.value  = 0
        rightDelay.delayTime.value = itdSec
      }

      // ILD
      const leftDb  = ild <= 0 ? 0 : -ild
      const rightDb = ild >= 0 ? 0 :  ild
      leftGain.gain.value  = dbToLinear(leftDb)  * 0.4
      rightGain.gain.value = dbToLinear(rightDb) * 0.4

      // Wire: osc → delay → gain → merger → destination
      osc.connect(leftDelay)
      osc.connect(rightDelay)
      leftDelay.connect(leftGain)
      rightDelay.connect(rightGain)
      leftGain.connect(merger,  0, 0)
      rightGain.connect(merger, 0, 1)
      merger.connect(ctx.destination)

      osc.start()
      setPlaying(true)
    } catch {
      setAudioReady(false)
    }
  }, [itd, ild])

  const stopAudio = useCallback(() => {
    oscillatorRef.current?.stop()
    oscillatorRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    setPlaying(false)
  }, [])

  // Auto-stop on unmount
  useEffect(() => () => { stopAudio() }, [stopAudio])

  // Slider change handlers — update audio live
  const handleItd = (v: number) => {
    setItd(v)
    updateAudio(v, ild)
  }
  const handleIld = (v: number) => {
    setIld(v)
    updateAudio(itd, v)
  }

  const itdLabel = itd === 0 ? '0 µs (centre)' : `${itd > 0 ? '+' : ''}${itd} µs (${itd > 0 ? 'right' : 'left'})`
  const ildLabel = ild === 0 ? '0 dB (centre)' : `${ild > 0 ? '+' : ''}${ild} dB (louder in ${ild > 0 ? 'right' : 'left'} ear)`

  const angleLabel = angle === 0
    ? 'directly ahead'
    : `${Math.abs(angle).toFixed(0)}° to the ${angle > 0 ? 'right' : 'left'}`

  if (!mounted) {
    return (
      <div className="my-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 not-prose flex items-center justify-center" style={{ minHeight: 320 }}>
        <span className="text-sm text-violet-400">Loading binaural demo…</span>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-1">
        Interactive · Binaural Cues for Sound Localization
      </p>
      <p className="text-sm text-violet-800 mb-4">
        Adjust the <strong>ITD</strong> (interaural time difference) and <strong>ILD</strong> (interaural level difference) to see and
        hear how the brain estimates where a sound is coming from. Use headphones for the best effect.
      </p>

      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* ── SVG overhead view ── */}
        <div className="flex-shrink-0 mx-auto">
          <svg width={SVG_W} height={SVG_H} className="rounded-xl bg-white border border-slate-100">

            {/* Spatial reference circles */}
            {[SPACE_R * 0.5, SPACE_R].map(r => (
              <circle key={r} cx={CX} cy={CY} r={r}
                fill="none" stroke="#f1f5f9" strokeWidth={1} />
            ))}
            {/* Angle guidelines */}
            {[-90, -45, 0, 45, 90].map(a => {
              const rad = (a - 90) * Math.PI / 180
              return (
                <line key={a}
                  x1={CX} y1={CY}
                  x2={CX + SPACE_R * Math.cos(rad)}
                  y2={CY + SPACE_R * Math.sin(rad)}
                  stroke="#f1f5f9" strokeWidth={1} />
              )
            })}
            {/* Angle labels */}
            {[-90, -45, 45, 90].map(a => {
              const rad = (a - 90) * Math.PI / 180
              const lx = CX + (SPACE_R + 14) * Math.cos(rad)
              const ly = CY + (SPACE_R + 14) * Math.sin(rad)
              return (
                <text key={a} x={lx} y={ly + 4} textAnchor="middle"
                  fontSize={9} fill="#cbd5e1">{Math.abs(a)}°</text>
              )
            })}
            <text x={CX} y={CY - SPACE_R - 8} textAnchor="middle" fontSize={9} fill="#cbd5e1">0° (front)</text>

            {/* Sound source dot */}
            <circle cx={sourceX} cy={sourceY} r={10}
              fill={color} opacity={0.9} />
            <circle cx={sourceX} cy={sourceY} r={14}
              fill={color} opacity={0.15} />
            <text x={sourceX} y={sourceY + 4} textAnchor="middle"
              fontSize={10} fill="white" fontWeight="700">♪</text>

            {/* Lines from source to ears */}
            <line x1={sourceX} y1={sourceY}
              x2={CX - HEAD_R - EAR_R} y2={CY}
              stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
            <line x1={sourceX} y1={sourceY}
              x2={CX + HEAD_R + EAR_R} y2={CY}
              stroke={color} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />

            {/* Head */}
            <circle cx={CX} cy={CY} r={HEAD_R}
              fill="#f8fafc" stroke="#e2e8f0" strokeWidth={2} />
            {/* Nose */}
            <ellipse cx={CX} cy={CY - HEAD_R + 6} rx={5} ry={7}
              fill="#e2e8f0" />

            {/* Left ear */}
            <ellipse cx={CX - HEAD_R - EAR_R + 2} cy={CY} rx={EAR_R} ry={EAR_R * 1.4}
              fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.5} />
            <text x={CX - HEAD_R - EAR_R * 2 - 4} y={CY + 4}
              textAnchor="end" fontSize={9} fill="#64748b" fontWeight="600">L</text>

            {/* Right ear */}
            <ellipse cx={CX + HEAD_R + EAR_R - 2} cy={CY} rx={EAR_R} ry={EAR_R * 1.4}
              fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1.5} />
            <text x={CX + HEAD_R + EAR_R * 2 + 4} y={CY + 4}
              textAnchor="start" fontSize={9} fill="#64748b" fontWeight="600">R</text>

            {/* Angle arc */}
            {angle !== 0 && (() => {
              const startRad = -Math.PI / 2
              const endRad   = sourceAngleRad
              const r        = 28
              const sx = CX + r * Math.cos(startRad)
              const sy = CY + r * Math.sin(startRad)
              const ex = CX + r * Math.cos(endRad)
              const ey = CY + r * Math.sin(endRad)
              const large = Math.abs(angle) > 180 ? 1 : 0
              const sweep = angle > 0 ? 1 : 0
              return (
                <path d={`M${sx},${sy} A${r},${r} 0 ${large},${sweep} ${ex},${ey}`}
                  fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
              )
            })()}

            {/* Perceived location label */}
            <text x={CX} y={SVG_H - 10} textAnchor="middle"
              fontSize={10} fill="#475569" fontWeight="600">
              Perceived: {angleLabel}
            </text>
          </svg>
        </div>

        {/* ── Controls ── */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* ITD slider */}
          <div>
            <div className="text-xs font-semibold text-violet-700 mb-1">
              Interaural Time Difference (ITD)
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Used for <strong>low frequencies</strong> (&lt;1.5 kHz) — the ear that hears first signals the sound's side.
            </div>
            <input
              type="range" min={-MAX_ITD_US} max={MAX_ITD_US} step={10}
              value={itd}
              onChange={e => handleItd(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>−630 µs (left)</span>
              <span className="font-semibold text-violet-700">{itdLabel}</span>
              <span>+630 µs (right)</span>
            </div>
          </div>

          {/* ILD slider */}
          <div>
            <div className="text-xs font-semibold text-violet-700 mb-1">
              Interaural Level Difference (ILD)
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Used for <strong>high frequencies</strong> (&gt;1.5 kHz) — the head casts an acoustic shadow, attenuating the far ear.
            </div>
            <input
              type="range" min={-MAX_ILD_DB} max={MAX_ILD_DB} step={0.5}
              value={ild}
              onChange={e => handleIld(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>−20 dB (left)</span>
              <span className="font-semibold text-violet-700">{ildLabel}</span>
              <span>+20 dB (right)</span>
            </div>
          </div>

          {/* Play button */}
          <div>
            <div className="text-xs font-semibold text-violet-700 mb-2">
              Hear it (500 Hz tone) — use headphones!
            </div>
            {audioReady ? (
              <button
                onClick={playing ? stopAudio : startAudio}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  playing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {playing ? '⏹ Stop' : '▶ Play tone'}
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Web Audio not available in this browser.</p>
            )}
            {playing && (
              <p className="text-xs text-violet-600 mt-2">
                Move the sliders while the tone plays to hear the sound shift position.
              </p>
            )}
          </div>

          {/* Cue summary */}
          <div className="rounded-xl bg-violet-50 border border-violet-100 px-4 py-3 text-xs text-violet-900 space-y-1">
            <p><strong>ITD:</strong> {itd === 0 ? 'Equal arrival time at both ears → centre' : `${Math.abs(itd)} µs earlier at ${itd > 0 ? 'right' : 'left'} ear → sound from ${itd > 0 ? 'right' : 'left'}`}</p>
            <p><strong>ILD:</strong> {ild === 0 ? 'Equal level at both ears → centre' : `${Math.abs(ild).toFixed(1)} dB louder in ${ild > 0 ? 'right' : 'left'} ear → sound from ${ild > 0 ? 'right' : 'left'}`}</p>
            <p><strong>Combined:</strong> Estimated source is <strong>{angleLabel}</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
