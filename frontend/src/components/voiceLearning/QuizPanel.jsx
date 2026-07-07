import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Send } from 'lucide-react'
import api from '../../services/api'

export default function QuizPanel({ questions = [], topic = '' }) {
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState({})
  const [evaluating, setEvaluating] = useState(null)

  const handleSelect = useCallback((index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }, [])

  const handleEvaluate = useCallback(
    async (index) => {
      const question = questions[index]
      const answer = answers[index]
      if (!answer) return

      setEvaluating(index)
      try {
        const response = await api.post('/voice-learning/evaluate', {
          question,
          answer,
        })
        setResults((prev) => ({ ...prev, [index]: response.data }))
      } catch (err) {
        console.error(err)
        setResults((prev) => ({
          ...prev,
          [index]: { correct: false, feedback: 'Evaluation failed.' },
        }))
      } finally {
        setEvaluating(null)
      }
    },
    [questions, answers]
  )

  if (!questions.length) return null

  return (
    <div className="rounded-2xl border border-green-primary/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Quiz</p>
      <h3 className="mt-1 text-xl font-bold text-text">{topic || 'Practice Quiz'}</h3>

      <div className="mt-5 space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-green-primary/10 p-4">
            <p className="font-bold text-text">
              <span className="text-green-primary">Q{i + 1}.</span> {q.question}
            </p>

            {/* MCQ Options */}
            {q.type === 'mcq' && q.options && (
              <div className="mt-3 space-y-2">
                {q.options.map((opt, j) => {
                  const selected = answers[i] === opt
                  const result = results[i]
                  const isCorrect = result && opt === q.answer
                  const isWrong = result && selected && !result.correct

                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => !results[i] && handleSelect(i, opt)}
                      disabled={!!results[i]}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                        isCorrect
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : isWrong
                            ? 'border-red-400 bg-red-50 text-red-800'
                            : selected
                              ? 'border-green-primary bg-green-primary/5 text-green-primary font-bold'
                              : 'border-gray-200 hover:border-green-primary/30'
                      }`}
                    >
                      {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                      {isWrong && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                      {!result && (
                        <span className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-300" />
                      )}
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text Answer */}
            {q.type !== 'mcq' && !results[i] && (
              <div className="mt-3 flex gap-2">
                <input
                  value={answers[i] || ''}
                  onChange={(e) => handleSelect(i, e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-primary"
                />
              </div>
            )}

            {/* Submit Button */}
            {answers[i] && !results[i] && (
              <button
                onClick={() => handleEvaluate(i)}
                disabled={evaluating === i}
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {evaluating === i ? 'Checking...' : 'Check Answer'}
              </button>
            )}

            {/* Result Feedback */}
            {results[i] && (
              <div
                className={`mt-3 rounded-lg px-4 py-3 text-sm ${
                  results[i].correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
                }`}
              >
                <p className="font-bold">
                  {results[i].correct ? '✅ Correct!' : '💡 Not quite right'}
                </p>
                {results[i].feedback && <p className="mt-1">{results[i].feedback}</p>}
                {q.explanation && (
                  <p className="mt-1 text-xs italic">Explanation: {q.explanation}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
