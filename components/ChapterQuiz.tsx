'use client'

// components/ChapterQuiz.tsx
// Interactive multiple-choice quiz rendered at the end of each chapter.
// Pass `questions` as a prop (defined in the MDX file).
// Students answer all questions, then submit to see their score + explanations.

import { useState } from 'react'

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number   // 0-based index of the correct option
  explanation: string
}

interface Props {
  questions: QuizQuestion[]
  title?: string
}

export default function ChapterQuiz({ questions = [], title = 'Chapter Quiz' }: Props) {
  const [selected, setSelected] = useState<(number | null)[]>(
    () => Array(questions.length).fill(null)
  )
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) return null

  const answered = selected.filter(s => s !== null).length
  const score = submitted
    ? selected.filter((s, i) => s === questions[i].correct).length
    : 0
  const pct = Math.round((score / questions.length) * 100)

  function handleSelect(qi: number, oi: number) {
    if (submitted) return
    setSelected(prev => prev.map((v, i) => (i === qi ? oi : v)))
  }

  function handleSubmit() {
    if (answered < questions.length) return
    setSubmitted(true)
    // scroll to top of quiz
    document.getElementById('chapter-quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleReset() {
    setSelected(Array(questions.length).fill(null))
    setSubmitted(false)
  }

  return (
    <div id="chapter-quiz" className="my-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Score banner (post-submit) */}
      {submitted && (
        <div className={`rounded-2xl px-6 py-4 mb-8 flex items-center justify-between ${
          pct >= 80 ? 'bg-green-50 border border-green-200' :
          pct >= 60 ? 'bg-amber-50 border border-amber-200' :
                      'bg-red-50 border border-red-200'
        }`}>
          <div>
            <p className={`text-lg font-bold ${
              pct >= 80 ? 'text-green-800' : pct >= 60 ? 'text-amber-800' : 'text-red-800'
            }`}>
              {score} / {questions.length} correct ({pct}%)
            </p>
            <p className={`text-sm ${
              pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {pct === 100 ? 'Perfect score — excellent work!' :
               pct >= 80  ? 'Great job! Review the explanations below for any you missed.' :
               pct >= 60  ? 'Good effort. Read through the explanations to strengthen your understanding.' :
                            'Keep reviewing — the explanations below will help clarify the key ideas.'}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm font-semibold underline text-slate-500 hover:text-slate-800 ml-4 shrink-0"
          >
            Retake
          </button>
        </div>
      )}

      {/* Questions */}
      <ol className="space-y-8">
        {questions.map((q, qi) => {
          const sel = selected[qi]
          const isCorrect = submitted && sel === q.correct
          const isWrong   = submitted && sel !== null && sel !== q.correct

          return (
            <li key={qi} className={`rounded-2xl border p-6 transition-colors ${
              !submitted              ? 'border-slate-200 bg-white' :
              isCorrect               ? 'border-green-200 bg-green-50' :
              isWrong                 ? 'border-red-200 bg-red-50' :
                                        'border-slate-200 bg-white'
            }`}>
              {/* Question text */}
              <p className="text-base font-semibold text-gray-900 mb-4 leading-snug">
                <span className="text-slate-400 font-normal mr-1">{qi + 1}.</span>{' '}
                {q.question}
              </p>

              {/* Options */}
              <ul className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected  = sel === oi
                  const isThisRight = submitted && oi === q.correct
                  const isThisWrong = submitted && isSelected && oi !== q.correct

                  return (
                    <li key={oi}>
                      <button
                        onClick={() => handleSelect(qi, oi)}
                        disabled={submitted}
                        className={[
                          'w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-colors leading-snug',
                          submitted
                            ? isThisRight
                              ? 'bg-green-100 border-green-400 text-green-900 font-semibold'
                              : isThisWrong
                                ? 'bg-red-100 border-red-400 text-red-900'
                                : 'border-slate-200 text-slate-500 bg-white'
                            : isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium'
                              : 'border-slate-200 text-gray-800 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer',
                        ].join(' ')}
                      >
                        <span className="font-mono text-xs mr-2 opacity-50">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                        {submitted && isThisRight && (
                          <span className="ml-2 text-green-600">✓</span>
                        )}
                        {submitted && isThisWrong && (
                          <span className="ml-2 text-red-500">✗</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* Explanation (post-submit) */}
              {submitted && (
                <div className={`mt-4 text-sm rounded-lg px-4 py-3 leading-relaxed ${
                  isCorrect ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  <strong>Explanation: </strong>{q.explanation}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Submit / progress */}
      {!submitted && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {answered} of {questions.length} answered
          </p>
          <button
            onClick={handleSubmit}
            disabled={answered < questions.length}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit answers
          </button>
        </div>
      )}
    </div>
  )
}