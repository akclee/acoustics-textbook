// components/Chapter04Quiz.tsx
// Chapter 4 quiz questions, pre-loaded into ChapterQuiz.
// Usage in MDX: <Chapter04Quiz />

import ChapterQuiz from '@/components/ChapterQuiz'

const questions = [
  {
    question: "Why do acousticians use a logarithmic (decibel) scale rather than a linear scale for sound levels?",
    options: [
      "Because logarithms are easier to calculate by hand",
      "Because audible sound intensities span roughly 14 orders of magnitude, making a linear scale impractical, and perceived loudness itself grows approximately logarithmically",
      "Because decibels are an SI unit defined by international standards",
      "Because linear scales cannot represent negative values, and pressures can be negative",
    ],
    correct: 1,
    explanation:
      "The intensity of audible sound ranges from ~10⁻¹² W/m² (threshold of hearing) to ~100 W/m² (jet engine) — a ratio of 10¹⁴. A linear scale would be unworkably compressed at one end. More importantly, the auditory system itself responds logarithmically: equal dB steps correspond to equal perceived loudness increments, making the decibel scale perceptually meaningful as well as mathematically convenient.",
  },
  {
    question: "A sound has an intensity of 10⁻⁸ W/m². What is its intensity level in dB IL (reference: 10⁻¹² W/m²)?",
    options: [
      "8 dB IL",
      "20 dB IL",
      "40 dB IL",
      "80 dB IL",
    ],
    correct: 2,
    explanation:
      "dB IL = 10 · log₁₀(10⁻⁸ / 10⁻¹²) = 10 · log₁₀(10⁴) = 10 × 4 = 40 dB IL. A useful shortcut: the exponent difference (−8 − (−12) = 4) multiplied by 10 gives the answer directly because the intensities are exact powers of 10.",
  },
  {
    question: "The formula for dB SPL uses a factor of 20 (not 10) in front of the logarithm. The reason is:",
    options: [
      "Pressure is measured in different units than intensity",
      "Sound pressure level is always twice the intensity level",
      "Intensity is proportional to pressure squared, so log(P²) = 2·log(P), introducing the factor of 2",
      "The reference pressure of 20 μPa requires a correction factor of 2",
    ],
    correct: 2,
    explanation:
      "Because I ∝ P², taking 10·log(I) = 10·log(P²) = 10·2·log(P) = 20·log(P). This means the dB SPL and dB IL formulas give the same numerical answer for the same physical sound — a doubling of pressure (+6 dB SPL) corresponds to a quadrupling of intensity (+6 dB IL). The factor of 20 is purely a consequence of the I ∝ P² relationship.",
  },
  {
    question: "Two identical loudspeakers producing 80 dB SPL each are played simultaneously at the same location. The combined level is approximately:",
    options: [
      "80 dB SPL (no change — you can't add dB)",
      "83 dB SPL",
      "160 dB SPL",
      "90 dB SPL",
    ],
    correct: 1,
    explanation:
      "Two identical incoherent sources double the total intensity. A doubling of intensity = +3 dB. So 80 + 3 = 83 dB SPL. The common mistake of adding 80 + 80 = 160 dB treats decibels as if they were linear quantities, which they are not. You can only add intensities (or mean-square pressures), not decibels directly.",
  },
  {
    question: "dB(A) (A-weighted decibels) differs from dB SPL because:",
    options: [
      "dB(A) uses a different reference pressure than 20 μPa",
      "dB(A) applies a frequency-dependent filter that attenuates low and very high frequencies to match the ear's sensitivity",
      "dB(A) measures peak level rather than RMS level",
      "dB(A) only applies to outdoor noise measurements",
    ],
    correct: 1,
    explanation:
      "A-weighting applies a filter whose shape approximates the inverse of the 40-phon equal-loudness contour, strongly attenuating frequencies below ~500 Hz and gently attenuating very high frequencies. The result is a level that better predicts perceived loudness than unweighted dB SPL, which is why dB(A) is the international standard for noise regulations, occupational exposure limits, and environmental assessments.",
  },
  {
    question: "Under the equal-energy rule for occupational noise, the maximum exposure at 88 dB(A) is 4 hours (half of the 8-hour limit at 85 dB(A)). How long is the maximum exposure at 91 dB(A)?",
    options: [
      "4 hours",
      "3 hours",
      "2 hours",
      "1 hour",
    ],
    correct: 2,
    explanation:
      "Each +3 dB halves the allowable exposure time: 85 dB(A) → 8 h; 88 dB(A) → 4 h; 91 dB(A) → 2 h; 94 dB(A) → 1 h. The equal-energy rule reflects the fact that the same total acoustic energy dose — regardless of level or duration — produces the same cochlear damage. An 8-hour exposure at 85 dB(A) delivers the same energy as a 2-hour exposure at 91 dB(A).",
  },
  {
    question: "A point source in a free field produces 100 dB SPL at 1 m. What is the level at 8 m?",
    options: [
      "94 dB SPL",
      "88 dB SPL",
      "82 dB SPL",
      "76 dB SPL",
    ],
    correct: 2,
    explanation:
      "The inverse-square law: every doubling of distance = −6 dB. From 1 m to 8 m is three doublings (1→2→4→8), so the level drops by 3 × 6 = 18 dB. 100 − 18 = 82 dB SPL. Alternatively: ΔL = 20·log₁₀(1/8) = 20·log₁₀(0.125) = 20·(−0.9) = −18 dB.",
  },
  {
    question: "Compared to a point source (sphere), a long straight road with steady traffic behaves as a line source. As you double your distance from a line source, the level decreases by approximately:",
    options: [
      "3 dB",
      "6 dB",
      "10 dB",
      "0 dB — line sources don't attenuate",
    ],
    correct: 0,
    explanation:
      "A line source radiates energy in expanding cylindrical (not spherical) wavefronts. The surface area of a cylinder grows as 2πrL — proportional to distance r rather than r². Therefore intensity ∝ 1/r and ΔL = 10·log(d₁/d₂) = 10·log(1/2) = −3 dB per doubling. This is why road traffic noise is harder to reduce with distance than a single point source.",
  },
  {
    question: "Reverberation time T₆₀ is defined as the time for the reverberant sound energy to decay by:",
    options: [
      "3 dB after the source stops",
      "10 dB after the source stops",
      "60 dB after the source stops",
      "Half its initial value after the source stops",
    ],
    correct: 2,
    explanation:
      "T₆₀ (RT60) is the time in seconds for the sound pressure level to fall by 60 dB after the source ceases. This corresponds to the energy falling to one-millionth of its initial value (10⁻⁶). The 60 dB criterion was chosen by Wallace Sabine because it represents the practical limit of audibility: a sound that decays 60 dB below its source level is inaudible in all but the most anechoic environments.",
  },
  {
    question: "A room has a volume of 500 m³ and a total absorption of 25 sabins. Using Sabine's formula T₆₀ = 0.161V/A, what is the reverberation time?",
    options: [
      "0.5 s",
      "1.6 s",
      "3.2 s",
      "8.0 s",
    ],
    correct: 2,
    explanation:
      "T₆₀ = 0.161 × 500 / 25 = 80.5 / 25 = 3.22 s. This is quite long — typical of a large, hard-surfaced space like a gymnasium or empty hall. For speech intelligibility, T₆₀ should be around 0.5–0.8 s; this room would need substantial additional absorption (carpets, acoustic panels, upholstered seating) to be suitable for speech.",
  },
]

export default function Chapter04Quiz() {
  return <ChapterQuiz title="Chapter 4 Quiz" questions={questions} />
}
