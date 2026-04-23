// components/diagrams/FrequencyRangeDiagram.tsx
// Horizontal log-scale diagram showing infrasound / audible / ultrasound bands
// with example sounds annotated above and below the scale.

const W = 660
const H = 180

// Log scale: map Hz → x position across [20, 100000]
const LOG_MIN = Math.log10(1)
const LOG_MAX = Math.log10(200000)
function fx(hz: number): number {
  return ((Math.log10(hz) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * W
}

const AXIS_Y = 100

// Frequency bands
const bands = [
  { label: 'Infrasound', from: 1, to: 20, color: '#e0f2fe', border: '#7dd3fc' },
  { label: 'Audible', from: 20, to: 20000, color: '#dcfce7', border: '#86efac' },
  { label: 'Ultrasound', from: 20000, to: 200000, color: '#fef9c3', border: '#fde047' },
]

// Tick marks
const ticks = [1, 10, 20, 100, 500, 1000, 5000, 10000, 20000, 100000, 200000]
function fmtHz(hz: number): string {
  if (hz >= 1000) return `${hz / 1000}k`
  return `${hz}`
}

// Example sounds: [hz, label, above (true) or below (false)]
const sounds: [number, string, boolean][] = [
  [8, 'Earthquake', true],
  [18, 'Infrasound limit', false],
  [80, 'Male voice (low)', true],
  [300, 'Speech range', false],
  [440, 'Concert A', true],
  [4000, 'Speech clarity', false],
  [8000, 'Consonants', true],
  [20000, 'Hearing limit', false],
  [40000, 'Dog whistle', true],
  [80000, 'Bat echolocation', false],
]

export default function FrequencyRangeDiagram() {
  return (
    <figure className="my-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" aria-label="Frequency range diagram">

          {/* Band fills */}
          {bands.map(b => (
            <rect
              key={b.label}
              x={fx(b.from)} y={AXIS_Y - 18}
              width={fx(b.to) - fx(b.from)} height={36}
              fill={b.color} stroke={b.border} strokeWidth={1}
            />
          ))}

          {/* Band labels inside bands */}
          {bands.map(b => (
            <text
              key={b.label + '-lbl'}
              x={(fx(b.from) + fx(b.to)) / 2}
              y={AXIS_Y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10} fontWeight="600" fill="#374151"
            >
              {b.label}
            </text>
          ))}

          {/* Axis line */}
          <line x1={0} y1={AXIS_Y} x2={W} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={1} />

          {/* Ticks + labels */}
          {ticks.map(hz => {
            const x = fx(hz)
            return (
              <g key={hz}>
                <line x1={x} y1={AXIS_Y + 18} x2={x} y2={AXIS_Y + 25} stroke="#94a3b8" strokeWidth={1} />
                <text x={x} y={AXIS_Y + 34} textAnchor="middle" fontSize={8} fill="#6b7280">
                  {fmtHz(hz)}
                </text>
              </g>
            )
          })}

          {/* Hz label */}
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af">
            Frequency (Hz) — logarithmic scale
          </text>

          {/* Sound annotations */}
          {sounds.map(([hz, label, above]) => {
            const x = fx(hz)
            const y = above ? AXIS_Y - 26 : AXIS_Y + 52
            const lineY1 = above ? AXIS_Y - 20 : AXIS_Y + 20
            const lineY2 = above ? AXIS_Y - 24 : AXIS_Y + 48
            return (
              <g key={label}>
                <line x1={x} y1={lineY1} x2={x} y2={lineY2} stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="2 2" />
                <text x={x} y={y} textAnchor="middle" fontSize={8} fill="#4b5563">{label}</text>
              </g>
            )
          })}

        </svg>
      </div>
      <figcaption className="text-center text-sm text-slate-500 mt-2">
        The frequency spectrum, showing infrasound (&lt;20 Hz), the audible range (20 Hz–20 kHz), and ultrasound (&gt;20 kHz).
      </figcaption>
    </figure>
  )
}