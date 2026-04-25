// components/Chapter05Quiz.tsx
// Chapter 5 quiz questions, pre-loaded into ChapterQuiz.
// Usage in MDX: <Chapter05Quiz />

import ChapterQuiz from '@/components/ChapterQuiz'

const questions = [
  {
    question: "The tympanic membrane (eardrum) connects to the cochlea via three small bones. In the correct order from eardrum to cochlea, these ossicles are:",
    options: [
      "Malleus → incus → stapes",
      "Stapes → incus → malleus",
      "Incus → malleus → stapes",
      "Stapes → malleus → incus",
    ],
    correct: 0,
    explanation:
      "The ossicular chain runs malleus → incus → stapes. The malleus (hammer) attaches to the eardrum, the incus (anvil) links the two, and the stapes (stirrup) presses against the oval window of the cochlea. Together they amplify and impedance-match sound from air to the fluid-filled cochlea.",
  },
  {
    question: "The basilar membrane in the cochlea is arranged tonotopically. Which statement correctly describes this arrangement?",
    options: [
      "High frequencies cause maximum displacement near the apex; low frequencies near the base",
      "High frequencies cause maximum displacement near the base; low frequencies near the apex",
      "All frequencies produce maximum displacement at the midpoint of the membrane",
      "The tonotopic map is linear — equal distances correspond to equal frequency steps",
    ],
    correct: 1,
    explanation:
      "The base of the cochlea (near the stapes) is stiff and narrow — it responds best to high frequencies. The apex is wide and floppy — it responds best to low frequencies. The mapping is logarithmic: equal distances along the basilar membrane correspond to equal octave steps, not equal Hz steps.",
  },
  {
    question: "Stevens' Power Law describes the relationship between physical intensity and perceived loudness. If intensity increases by a factor of 10 (10 dB), perceived loudness approximately:",
    options: [
      "Doubles (×2)",
      "Increases by a factor of 10",
      "Increases by a factor of 100",
      "Stays the same",
    ],
    correct: 0,
    explanation:
      "Stevens' law states that loudness L ∝ I^0.3. Increasing intensity by 10× raises loudness by 10^0.3 ≈ 2. This compressive relationship means a tenfold increase in physical intensity is perceived as only a doubling in loudness — the auditory system compresses an enormous dynamic range into a manageable perceptual scale.",
  },
  {
    question: "Equal-loudness contours (ISO 226) show that at moderate listening levels, we are most sensitive to frequencies in the range of approximately:",
    options: [
      "100–500 Hz",
      "1,000–5,000 Hz",
      "8,000–12,000 Hz",
      "All frequencies are equally sensitive",
    ],
    correct: 1,
    explanation:
      "The outer ear resonance boosts frequencies between roughly 1–5 kHz by 10–15 dB, making this the region of greatest sensitivity. At 4 kHz, a sound requires much less SPL to reach a given loudness level than at 100 Hz or 16 kHz. This range overlaps heavily with the frequencies critical for speech intelligibility.",
  },
  {
    question: "Auditory nerve fibers show 'phase locking' — they tend to fire at a specific phase of the basilar membrane vibration cycle. This phenomenon breaks down above approximately:",
    options: [
      "500 Hz",
      "1,000 Hz",
      "3,000–5,000 Hz",
      "10,000 Hz",
    ],
    correct: 2,
    explanation:
      "Phase locking is reliable up to about 3–5 kHz. Below this limit, the brain can count individual neural firings to extract period information (temporal pitch coding). Above it, the refractory period of auditory nerve fibers prevents reliable synchronization, and the brain must rely on the place of excitation on the basilar membrane instead.",
  },
  {
    question: "The Interaural Time Difference (ITD) is the primary cue for localizing sound sources in the horizontal plane at low frequencies. The maximum ITD for a human listener is approximately:",
    options: [
      "60 microseconds",
      "630 microseconds",
      "6 milliseconds",
      "60 milliseconds",
    ],
    correct: 1,
    explanation:
      "The maximum ITD corresponds to a sound arriving at 90° to one side. Given a head diameter of ~18 cm and the speed of sound (~343 m/s), the maximum delay is approximately 0.18/343 ≈ 630 µs. The auditory system can detect ITDs as small as 10 µs — remarkably fine temporal resolution.",
  },
  {
    question: "The vocal tract functions as an acoustic filter (resonator) applied to the source vibration of the vocal folds. The resonant frequencies of this filter are called:",
    options: [
      "Fundamentals",
      "Formants",
      "Partials",
      "Overtones",
    ],
    correct: 1,
    explanation:
      "Formants are the resonant frequencies of the vocal tract tube. They shape which frequencies of the glottal source are amplified. F1, F2, and F3 are the first three formants and are the primary determinants of vowel identity. Changing the position of the tongue and lips changes the shape of the vocal tract and therefore shifts the formant frequencies.",
  },
  {
    question: "The vowel /i/ (as in 'bead') and the vowel /ɑ/ (as in 'bod') are distinguished primarily by their formant frequencies. Which correctly describes the difference?",
    options: [
      "/i/ has high F1 and high F2; /ɑ/ has low F1 and low F2",
      "/i/ has low F1 and high F2; /ɑ/ has high F1 and low F2",
      "/i/ has high F1 and low F2; /ɑ/ has low F1 and high F2",
      "/i/ and /ɑ/ have the same F1 but differ only in F3",
    ],
    correct: 1,
    explanation:
      "/i/ is a high front vowel: the raised tongue creates a low F1 (~270 Hz) and a high F2 (~2,290 Hz). /ɑ/ is a low back vowel: the open jaw raises F1 (~730 Hz) and the retracted tongue lowers F2 (~1,090 Hz). The F1-F2 plane creates a 'vowel space' that maps onto the classic phonetic vowel quadrilateral.",
  },
  {
    question: "Co-articulation in speech refers to:",
    options: [
      "The process by which two speakers synchronize their speech rates",
      "The overlap of articulatory gestures so that each phoneme is influenced by neighboring sounds",
      "The use of two separate articulators (lips and tongue) to produce a single phoneme",
      "The acoustic interference between simultaneously produced vowels",
    ],
    correct: 1,
    explanation:
      "Co-articulation means articulators are always preparing for the next phoneme while completing the current one. The /t/ in 'tulip' is produced differently from the /t/ in 'tool' because the lips are already rounding for the upcoming /u/. This makes speech acoustics highly context-dependent and explains why the same phoneme looks different in every spectrogram.",
  },
  {
    question: "The 'Yanny or Laurel' phenomenon is an example of a bistable auditory illusion. It demonstrates that:",
    options: [
      "The recording contains different audio signals for different listeners",
      "High-frequency hearing loss always causes people to hear 'Laurel'",
      "Perception is an active hypothesis-testing process that can commit to different interpretations of ambiguous input",
      "The brain averages competing percepts and produces a blend of both words",
    ],
    correct: 2,
    explanation:
      "The Yanny/Laurel recording contains spectral energy consistent with both words simultaneously — it is genuinely ambiguous. The perceptual system must commit to one interpretation. Which interpretation wins depends on how the listener's auditory system weights different frequency regions, influenced by hearing profile, playback device, and prior expectation. The illusion demonstrates that perception is constructive, not a passive readout of the physical signal.",
  },
]

export default function Chapter05Quiz() {
  return <ChapterQuiz title="Chapter 5 Quiz" questions={questions} />
}
