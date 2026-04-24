// components/Chapter03Quiz.tsx
// Chapter 3 quiz questions, pre-loaded into ChapterQuiz.
// Usage in MDX: <Chapter03Quiz />

import ChapterQuiz from '@/components/ChapterQuiz'

const questions = [
  {
    question: "The word 'filter' originates from Medieval Latin 'filtrum,' meaning:",
    options: [
      "A device for separating frequencies",
      "A piece of felt used to strain liquids",
      "A mathematical transform of a signal",
      "The passband of a system",
    ],
    correct: 1,
    explanation:
      "Filtrum was a piece of felt used to strain liquids — the original physical filter. The modern signal-processing sense extends this: a filter passes some components and blocks others, just as felt passes liquid while blocking solids.",
  },
  {
    question: "A telephone system that passes only 300–3,400 Hz is best described as a:",
    options: [
      "Low-pass filter with cutoff at 3,400 Hz",
      "High-pass filter with cutoff at 300 Hz",
      "Band-pass filter with cutoffs at 300 Hz and 3,400 Hz",
      "Band-stop filter centered at 1,850 Hz",
    ],
    correct: 2,
    explanation:
      "The telephone passes a band between two cutoff frequencies (300 Hz lower, 3,400 Hz upper), which is the definition of a band-pass filter. The bandwidth is 3,400 − 300 = 3,100 Hz and the center frequency is approximately 1,850 Hz.",
  },
  {
    question: "The Q (quality) factor of a resonant system is defined as:",
    options: [
      "Q = BW / f₀",
      "Q = f₀ / BW",
      "Q = f₀ × BW",
      "Q = 1 / (f₀ × BW)",
    ],
    correct: 1,
    explanation:
      "Q = f₀ / BW, where f₀ is the resonant frequency and BW is the −3 dB bandwidth. A high-Q system has a narrow bandwidth relative to its resonant frequency — it is lightly damped and rings for a long time.",
  },
  {
    question: "According to time-frequency duality, which of the following is true?",
    options: [
      "A short burst of sound must have a narrow frequency spectrum",
      "A long-lasting pure tone must contain many frequency components",
      "A perfectly brief impulse contains equal energy at all frequencies",
      "Narrowing the bandwidth of a signal makes it shorter in time",
    ],
    correct: 2,
    explanation:
      "An ideal impulse is perfectly localized in time and therefore has infinite bandwidth — energy at every frequency equally. This is the extreme case of time-frequency duality: maximum time localization → maximum frequency spread.",
  },
  {
    question: "A system with high Q (e.g., Q = 50) will:",
    options: [
      "Respond broadly across many frequencies and decay quickly",
      "Respond narrowly near its resonant frequency and ring for a long time",
      "Have a wider bandwidth than a low-Q system",
      "Have a shorter time constant than a low-Q system",
    ],
    correct: 1,
    explanation:
      "High Q means the bandwidth BW = f₀/Q is small (narrow resonance peak) and the time constant τ = Q/(π·f₀) is long (slow decay). A tuning fork with Q ≈ 1,000 rings for seconds; a car door with Q ≈ 2 goes 'thud' and stops immediately.",
  },
  {
    question: "Convolution in the time domain corresponds to what operation in the frequency domain?",
    options: [
      "Addition",
      "Convolution",
      "Multiplication",
      "Division",
    ],
    correct: 2,
    explanation:
      "The convolution theorem states that convolution in time (y = x ∗ h) is equivalent to multiplication in frequency (Y(f) = X(f) · H(f)). This is why filtering is often performed by multiplying spectra — it is mathematically equivalent to convolving with the impulse response but often faster to compute.",
  },
  {
    question: "Which property of an LTI system guarantees that sinusoids in produce sinusoids out (at the same frequency)?",
    options: [
      "Time-invariance only",
      "Additivity only",
      "Homogeneity only",
      "Linearity (homogeneity + additivity)",
    ],
    correct: 3,
    explanation:
      "Linearity — the combination of homogeneity (proportional scaling) and additivity (superposition) — ensures that a sinusoidal input produces a sinusoidal output at the same frequency. An LTI system can only change the amplitude and phase of each frequency component, never create new ones.",
  },
  {
    question: "Amplitude modulation (AM) of a carrier at fc Hz by a modulator at fm Hz produces spectral energy at:",
    options: [
      "fc only",
      "fm only",
      "fc, fc + fm, and fc − fm",
      "fc × fm and fc / fm",
    ],
    correct: 2,
    explanation:
      "Multiplying the carrier by the modulator (amplitude modulation) is multiplication in time, which corresponds to convolution in frequency. A single modulating frequency fm produces sidebands at fc ± fm, plus the original carrier at fc.",
  },
  {
    question: "Which type of distortion involves the creation of new frequency components not present in the original signal?",
    options: [
      "Frequency distortion (linear distortion)",
      "Transient distortion (windowing)",
      "Amplitude (nonlinear) distortion",
      "Phase distortion",
    ],
    correct: 2,
    explanation:
      "Nonlinear (amplitude) distortion violates homogeneity — the output is not proportional to the input. This breaks the LTI property and introduces harmonics and intermodulation products: new frequencies not present in the input. Frequency distortion and windowing distortion are still linear effects.",
  },
  {
    question: "The impulse response h(t) of a system and its transfer function H(f) are related by:",
    options: [
      "H(f) is the derivative of h(t)",
      "H(f) is the Fourier transform of h(t)",
      "h(t) is the square of H(f)",
      "They are the same function with different notation",
    ],
    correct: 1,
    explanation:
      "H(f) = ℱ{h(t)}: the transfer function is the Fourier transform of the impulse response. This is why measuring the impulse response (e.g., firing a starter pistol in a concert hall) and taking its spectrum gives the room's frequency response — the same information, viewed from two complementary domains.",
  },
]

export default function Chapter03Quiz() {
  return <ChapterQuiz title="Chapter 3 Quiz" questions={questions} />
}