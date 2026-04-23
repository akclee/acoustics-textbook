// components/Chapter01Quiz.tsx
// Chapter 1 quiz questions, pre-loaded into ChapterQuiz.
// Usage in MDX: <Chapter01Quiz />

import ChapterQuiz from '@/components/ChapterQuiz'

const questions = [
  {
    question: "What does the Greek root of 'acoustics' (ακουστικός) mean?",
    options: [
      "The science of waves",
      "Of or for hearing",
      "The study of vibration",
      "Sound traveling through air",
    ],
    correct: 1,
    explanation:
      "Acoustics derives from the Greek ακουστικός (akoustikos), meaning 'of or for hearing.' Its Latin cousin sonus gives us the words sonic, ultrasonic, and infrasonic.",
  },
  {
    question: "Which statement correctly distinguishes sound from light?",
    options: [
      "Light requires a medium to travel; sound does not",
      "Sound is a transverse wave; light is a longitudinal wave",
      "Sound requires a medium to travel; light does not",
      "Light travels more slowly than sound in air",
    ],
    correct: 2,
    explanation:
      "Sound is a mechanical, longitudinal wave that needs a physical medium (air, water, steel) to propagate. Light is an electromagnetic, transverse wave that can travel through a vacuum — which is why 'In space, no one can hear you scream' is scientifically accurate.",
  },
  {
    question: "Approximately what is the upper limit of the normal human audible frequency range?",
    options: ["2,000 Hz", "10,000 Hz", "20,000 Hz", "200,000 Hz"],
    correct: 2,
    explanation:
      "The human audible range is approximately 20 Hz to 20,000 Hz (20 kHz). Sounds below 20 Hz are infrasound; sounds above 20 kHz are ultrasound. This upper limit declines with age, particularly at high frequencies.",
  },
  {
    question: "In the sinusoid equation p(t) = A · sin(2πft + φ), what does φ (phi) represent?",
    options: [
      "The peak amplitude of the wave",
      "The frequency in Hertz",
      "The period in seconds",
      "The starting phase in radians",
    ],
    correct: 3,
    explanation:
      "φ (phi) is the starting phase — it specifies where in its cycle the sinusoid begins at t = 0. Two sinusoids with the same A and f but different φ values look like shifted versions of each other.",
  },
  {
    question: "A 500 Hz tone has a period of:",
    options: ["500 seconds", "0.5 seconds", "2 milliseconds", "20 milliseconds"],
    correct: 2,
    explanation:
      "Period T = 1/f = 1/500 = 0.002 seconds = 2 milliseconds. High frequency means short period; low frequency means long period.",
  },
  {
    question:
      "Sound travels at ~343 m/s in air and ~1,480 m/s in water. The wavelength of a 1,000 Hz tone in water is:",
    options: [
      "34.3 cm — the same as in air",
      "1.48 m — longer than in air",
      "0.23 m — shorter than in air",
      "Wavelength does not depend on the medium",
    ],
    correct: 1,
    explanation:
      "λ = v/f. In water: λ = 1480/1000 = 1.48 m. In air: λ = 343/1000 = 0.343 m. Because sound travels faster in water, its wavelength at the same frequency is much longer.",
  },
  {
    question:
      "When two identical sinusoids are added exactly out of phase (180° difference), the result is:",
    options: [
      "A wave with doubled amplitude",
      "A wave with doubled frequency",
      "Silence — the waves cancel completely",
      "A wave shifted 90° in phase",
    ],
    correct: 2,
    explanation:
      "This is destructive interference. When two sinusoids of the same frequency and amplitude are 180° out of phase, their positive and negative peaks coincide and cancel perfectly. This is the principle behind noise-canceling headphones.",
  },
  {
    question: "The 'missing fundamental' refers to the phenomenon where:",
    options: [
      "A speaker system cannot reproduce the lowest frequencies",
      "Listeners perceive a pitch matching f₀ even when f₀ is removed from the signal",
      "The fundamental frequency is always louder than its harmonics",
      "High-frequency harmonics are inaudible to older listeners",
    ],
    correct: 1,
    explanation:
      "The auditory system infers pitch from the spacing between harmonics, not just the presence of f₀. If a 200 Hz fundamental is removed but harmonics at 400, 600, and 800 Hz remain, listeners still hear a pitch of 200 Hz — the brain reconstructs the missing fundamental from the harmonic pattern.",
  },
  {
    question: "A periodic complex sound (like a sustained vowel) has:",
    options: [
      "A continuous spectrum with energy spread across all frequencies",
      "A line spectrum with energy only at the fundamental and its harmonics",
      "No measurable spectrum",
      "A spectrum identical to white noise",
    ],
    correct: 1,
    explanation:
      "Periodic sounds have a line spectrum — discrete energy spikes at f₀, 2f₀, 3f₀, etc. Aperiodic sounds (noise, impulses) have a continuous spectrum. This distinguishes voiced speech (periodic) from noise-like consonants (aperiodic).",
  },
  {
    question:
      "According to time-frequency duality, which statement is true?",
    options: [
      "A signal can be perfectly localized in both time and frequency simultaneously",
      "Higher frequency signals always have shorter wavelengths in any medium",
      "A perfectly time-localized impulse must contain energy at all frequencies equally",
      "The Fourier transform only applies to periodic signals",
    ],
    correct: 2,
    explanation:
      "Time-frequency duality states that perfect localization in time requires infinite spread in frequency, and vice versa. An ideal impulse contains equal energy at every frequency. This is why a very brief sound cannot have a well-defined pitch — pitch perception requires the signal to persist long enough to establish a frequency.",
  },
]

export default function Chapter01Quiz() {
  return <ChapterQuiz title="Chapter 1 Quiz" questions={questions} />
}