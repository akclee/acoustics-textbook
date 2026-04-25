// components/Chapter02Quiz.tsx
// Chapter 2 quiz questions, pre-loaded into ChapterQuiz.
// Usage in MDX: <Chapter02Quiz />

import ChapterQuiz from '@/components/ChapterQuiz'

const questions = [
  {
    question: "In simple harmonic motion, the restoring force on a mass displaced by distance x from equilibrium is given by Hooke's Law. Which expression is correct?",
    options: [
      "F = k·x (force in same direction as displacement)",
      "F = −k·x (force opposite to displacement)",
      "F = m·x (force proportional to mass)",
      "F = −m·x² (force proportional to displacement squared)",
    ],
    correct: 1,
    explanation:
      "Hooke's Law states F = −k·x. The minus sign is essential: the force always points back toward equilibrium, opposing the displacement. Without this sign the force would push the mass further away rather than pulling it back, and no oscillation would occur.",
  },
  {
    question: "The natural frequency of a mass-spring system is fₙ = (1/2π)√(k/m). If you double the mass while keeping stiffness constant, the natural frequency:",
    options: [
      "Doubles",
      "Halves",
      "Decreases by a factor of √2",
      "Stays the same",
    ],
    correct: 2,
    explanation:
      "fₙ ∝ 1/√m, so doubling m multiplies fₙ by 1/√2 ≈ 0.707 — a decrease by a factor of √2. Intuitively, a heavier mass has more inertia and takes longer to complete each oscillation cycle, lowering the frequency.",
  },
  {
    question: "A tuning fork has a high Q factor (Q ≈ 1000). What does this mean in practice?",
    options: [
      "It responds to a wide range of frequencies and decays quickly",
      "It responds to a narrow range of frequencies and rings for a long time",
      "It is louder than a low-Q resonator",
      "It produces more harmonics than a low-Q resonator",
    ],
    correct: 1,
    explanation:
      "A high-Q system has a narrow resonance peak (selective frequency response) and a slow amplitude decay — it rings for many cycles before dying away. Q ≈ 1000 means the tuning fork completes about 1000 oscillations before its amplitude falls to a small fraction of its initial value. A car door with Q ≈ 2 goes 'thud' and stops almost immediately.",
  },
  {
    question: "For a string fixed at both ends, which of the following correctly describes when standing waves occur?",
    options: [
      "When the string length equals an integer number of full wavelengths",
      "When the string length equals an integer number of half-wavelengths",
      "When the string length equals an integer number of quarter-wavelengths",
      "Standing waves occur at any frequency on a fixed string",
    ],
    correct: 1,
    explanation:
      "A fixed-fixed string has displacement nodes (zero motion) at both ends. This forces the string length to contain an exact integer number of half-wavelengths: L = n·(λ/2), giving resonant frequencies fₙ = n·v/(2L). Only these special frequencies produce the constructive interference needed for a stable standing wave pattern.",
  },
  {
    question: "Mersenne's Law states that the fundamental frequency of a string is f₁ = (1/2L)·√(T/μ). A guitarist presses a fret to shorten the vibrating string from 65 cm to 32.5 cm. The pitch of the note:",
    options: [
      "Rises by one octave (doubles)",
      "Rises by one semitone",
      "Falls by one octave (halves)",
      "Stays the same — frets don't change pitch",
    ],
    correct: 0,
    explanation:
      "Halving the string length L doubles the fundamental frequency f₁ (since f₁ ∝ 1/L). Doubling the frequency raises the pitch by exactly one octave. This is why frets are spaced logarithmically — each successive fret shortens the string by the same ratio (the 12th root of 2) to produce equal semitone steps.",
  },
  {
    question: "A cylindrical pipe closed at one end and open at the other (like a clarinet) supports only odd harmonics. Why?",
    options: [
      "The closed end absorbs even harmonics",
      "The boundary conditions (displacement node at closed end, antinode at open end) only allow an odd number of quarter-wavelengths to fit in the tube",
      "Even harmonics travel faster and escape from the open end",
      "The reed at the closed end selectively blocks even harmonics",
    ],
    correct: 1,
    explanation:
      "The closed end forces a displacement node; the open end forces a displacement antinode. The only standing wave patterns that satisfy both conditions simultaneously have an odd number of quarter-wavelengths fitting in the tube (1, 3, 5, … quarter-wavelengths). This corresponds to harmonic numbers n = 1, 3, 5, … — the odd harmonics only. Even harmonics would require a node or antinode at the wrong place.",
  },
  {
    question: "The 'stick-slip' mechanism of a bowed violin string produces which type of waveform?",
    options: [
      "A pure sine wave containing only the fundamental frequency",
      "A square wave containing only odd harmonics",
      "A sawtooth-like wave containing all harmonics",
      "A random noise signal with no harmonic structure",
    ],
    correct: 2,
    explanation:
      "The bow grips the string with friction and drags it sideways until string tension overcomes friction, causing the string to snap back rapidly — then the bow catches it again. This repeated stick-slip cycle produces a waveform resembling a sawtooth wave, which contains all harmonics (f, 2f, 3f, …) with amplitudes that fall as 1/n. This rich harmonic content gives bowed strings their bright, penetrating timbre.",
  },
  {
    question: "A flute (open-open pipe, length ~60 cm) and a clarinet (open-closed pipe, ~60 cm) are compared. Using v = 343 m/s, approximately what are their fundamental frequencies?",
    options: [
      "Flute: 286 Hz; Clarinet: 143 Hz",
      "Flute: 143 Hz; Clarinet: 286 Hz",
      "Both: 286 Hz",
      "Both: 572 Hz",
    ],
    correct: 0,
    explanation:
      "Open-open: f₁ = v/(2L) = 343/(2 × 0.6) ≈ 286 Hz. Open-closed: f₁ = v/(4L) = 343/(4 × 0.6) ≈ 143 Hz. The clarinet's fundamental is half that of the flute because only a quarter-wavelength (not a half-wavelength) fits in the tube. This is why a clarinet sounds lower than a flute of similar physical length.",
  },
  {
    question: "Which of the following correctly explains why brass instrument bells are flared rather than simply open cylinders?",
    options: [
      "The flare increases the tube length, lowering the pitch",
      "The flare reduces air resistance to make the instrument easier to play",
      "The flare transforms the acoustic impedance so that even harmonics are supported, completing the full harmonic series",
      "The flare has no acoustic effect — it is purely cosmetic",
    ],
    correct: 2,
    explanation:
      "Without the bell flare, a cylindrical tube closed at the mouthpiece would produce only odd harmonics (like a clarinet). The flare progressively changes the acoustic impedance toward the open end, modifying the boundary condition so that even harmonics are also supported. This completes the harmonic series and makes it possible for the player to navigate smoothly across all registers using lip tension.",
  },
  {
    question: "Unlike strings and pipes, struck bars (marimba, xylophone) and drum membranes produce inharmonic overtones. What does 'inharmonic' mean, and what is its perceptual consequence?",
    options: [
      "The overtones are integer multiples of the fundamental, producing a clear pitch",
      "The overtones are not integer multiples of the fundamental, making it harder to perceive a definite pitch",
      "The overtones are all at the same frequency, producing a pure tone",
      "The overtones decay faster than the fundamental, making the sound brighter over time",
    ],
    correct: 1,
    explanation:
      "Inharmonic means the overtone frequencies are not simple integer multiples of the fundamental — they don't fit the pattern f, 2f, 3f, … Harmonic overtones fuse perceptually into a single pitched tone; inharmonic overtones sound more 'noisy' or 'bell-like' and make it harder for the auditory system to assign a single definite pitch. This is why drums typically lack tonal centre, while marimba makers laboriously tune bars by undercutting to bring specific overtones into more musical relationships.",
  },
]

export default function Chapter02Quiz() {
  return <ChapterQuiz title="Chapter 2 Quiz" questions={questions} />
}
