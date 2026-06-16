import { BookOpen, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  buildWeakTopics,
  buildWrongAnswers,
  generateExam,
  generateExamFromLesson,
  isAnswerCorrect,
  parseExamResponse,
  submitExamResult,
} from '../../services/examService'

import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'

import {
  DashboardCard,
  SectionHeader,
} from '../../components/studentDashboard/DashboardPrimitives'

function ResultBadge({ passed, status }) {
  const label = status || (passed ? 'Passed' : 'Failed')
  const passedState = status ? status === 'Passed' : passed

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        passedState ? 'bg-green-primary/10 text-green-primary' : 'bg-red-100 text-red-700'
      }`}
    >
      {label}
    </span>
  )
}

export default function StudentExams() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dashboard, refetch } = useStudentWorkspace()
  const { overview } = dashboard

  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [questions, setQuestions] = useState(10)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [generatedExam, setGeneratedExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [resultSummary, setResultSummary] = useState(null)

  const totalQuestions = generatedExam?.questions?.length || 0
  const answeredCount = Object.keys(answers).length
  const progressPercent = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const weakTopicsFromResult = useMemo(
    () => resultSummary?.weakTopics || [],
    [resultSummary]
  )

  useEffect(() => {
    const lessonState = location.state
    if (!lessonState?.fromLesson || !lessonState?.lessonText) return

    const startLessonQuiz = async () => {
      try {
        setLoading(true)
        const response = await generateExamFromLesson({
          lessonText: lessonState.lessonText,
          conversationContext: lessonState.conversationContext || '',
          subject: lessonState.subject || 'Lesson Quiz',
          questions: 5,
        })

        const parsedExam = parseExamResponse(response.exam)
        setSubject(response.subject || lessonState.subject || 'Lesson Quiz')
        setGeneratedExam(parsedExam)
        setAnswers({})
        setCurrentQuestion(0)
        setShowReview(false)
        setResultSummary(null)
        navigate(location.pathname, { replace: true, state: null })
      } catch (error) {
        console.error(error)
        alert('Failed to generate quiz from lesson')
      } finally {
        setLoading(false)
      }
    }

    startLessonQuiz()
  }, [location.state, location.pathname, navigate])

  const handleGenerateExam = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject')
      return
    }

    try {
      setLoading(true)

      const response = await generateExam({
        subject,
        difficulty,
        questions: Number(questions),
      })

      const parsedExam = parseExamResponse(response.exam)

      if (!parsedExam?.questions?.length) {
        throw new Error('Exam response did not include questions')
      }

      setGeneratedExam(parsedExam)
      setAnswers({})
      setCurrentQuestion(0)
      setShowReview(false)
      setResultSummary(null)
    } catch (error) {
      console.error(error)
      alert('Failed to generate exam')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (questionIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }))
  }

  const handleSubmitExam = async () => {
    if (!generatedExam?.questions) return

    if (answeredCount < generatedExam.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }

    let correct = 0

    generatedExam.questions.forEach((question, index) => {
      if (isAnswerCorrect(answers[index], question.answer)) {
        correct += 1
      }
    })

    const weakTopics = buildWeakTopics(generatedExam.questions, answers)
    const wrongAnswers = buildWrongAnswers(generatedExam.questions, answers)
    const percentage = Math.round((correct / generatedExam.questions.length) * 100)
    const passed = percentage >= 40

    try {
      setSubmitting(true)

      const response = await submitExamResult({
        subject,
        score: correct,
        total: generatedExam.questions.length,
        weakTopics,
        wrongAnswers,
      })

      setResultSummary({
        score: correct,
        total: generatedExam.questions.length,
        percentage,
        passed,
        status: response.status || (passed ? 'Passed' : 'Failed'),
        weakTopics: response.weak_topics || weakTopics,
        wrongAnswers,
      })
      setShowReview(true)
      await refetch({ silent: true })
    } catch (error) {
      console.error(error)
      alert('Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  const activeQuestion = generatedExam?.questions?.[currentQuestion]

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Practice Exams"
        title="Exam Practice"
        action={
          <button
            onClick={handleGenerateExam}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-primary px-4 py-2 text-sm font-bold text-white shadow-glow transition hover:bg-green-secondary disabled:opacity-60"
            type="button"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Generating...' : 'Generate Exam'}
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard>
          <p className="text-sm font-bold text-gray-500">Exams Attempted</p>
          <p className="mt-2 text-3xl font-bold text-green-primary">{overview.practiceExamsAttempted}</p>
        </DashboardCard>

        <DashboardCard>
          <p className="text-sm font-bold text-gray-500">Average Score</p>
          <p className="mt-2 text-3xl font-bold text-green-primary">{overview.averageExamScore || 0}%</p>
        </DashboardCard>

        <DashboardCard className="md:col-span-2">
          <p className="mb-4 text-xl font-bold text-text">Generate Practice Exam</p>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Subject (DBMS, Java, CN...)"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-lg border p-3"
            />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-lg border p-3"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input
              type="number"
              min="1"
              max="50"
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
              className="rounded-lg border p-3"
            />
          </div>
        </DashboardCard>
      </div>

      {generatedExam?.questions?.length > 0 && !showReview && (
        <DashboardCard>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-text">{subject} Practice Exam</h3>
              <p className="mt-1 text-sm text-gray-500">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
            <div className="min-w-[12rem]">
              <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-500">
                <span>Progress</span>
                <span>{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-green-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {generatedExam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`h-9 w-9 rounded-full text-sm font-bold transition ${
                  currentQuestion === index
                    ? 'bg-green-primary text-white'
                    : answers[index]
                      ? 'bg-green-primary/10 text-green-primary'
                      : 'bg-cream text-gray-600'
                }`}
                type="button"
              >
                {index + 1}
              </button>
            ))}
          </div>

          {activeQuestion && (
            <div className="rounded-xl border border-green-primary/10 p-5">
              <h4 className="mb-4 text-lg font-bold">
                Q{currentQuestion + 1}. {activeQuestion.question}
              </h4>

              <div className="space-y-3">
                {activeQuestion.options.map((option, optionIndex) => {
                  const selected = answers[currentQuestion] === option
                  return (
                    <label
                      key={optionIndex}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        selected
                          ? 'border-green-primary bg-green-primary/5'
                          : 'border-green-primary/10 hover:bg-cream/70'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-green-primary' : 'border-gray-300'
                        }`}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-green-primary" />}
                      </span>
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        checked={selected}
                        onChange={() => handleOptionSelect(currentQuestion, option)}
                        className="sr-only"
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQuestion((value) => Math.max(0, value - 1))}
              disabled={currentQuestion === 0}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-50"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleSubmitExam}
              disabled={submitting || answeredCount < totalQuestions}
              className="rounded-lg bg-green-primary px-6 py-3 font-bold text-white disabled:opacity-50"
              type="button"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>

            <button
              onClick={() => setCurrentQuestion((value) => Math.min(totalQuestions - 1, value + 1))}
              disabled={currentQuestion >= totalQuestions - 1}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-50"
              type="button"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </DashboardCard>
      )}

      {showReview && resultSummary && (
        <DashboardCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-text">Exam Summary</h3>
              <p className="mt-1 text-sm text-gray-500">{subject}</p>
            </div>
            <ResultBadge passed={resultSummary.passed} status={resultSummary.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-bold text-gray-500">Score</p>
              <p className="mt-2 text-3xl font-bold text-green-primary">
                {resultSummary.score}/{resultSummary.total}
              </p>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-bold text-gray-500">Percentage</p>
              <p className="mt-2 text-3xl font-bold text-green-primary">{resultSummary.percentage}%</p>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-bold text-gray-500">Status</p>
              <p className="mt-2 text-3xl font-bold text-green-primary">{resultSummary.status}</p>
            </div>
          </div>

          {weakTopicsFromResult.length > 0 && (
            <div className="mt-6 rounded-xl border border-gold/20 bg-gold/10 p-4">
              <p className="text-sm font-bold text-amber-800">Weak Topics</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {weakTopicsFromResult.map((topic) => (
                  <span key={topic} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
                    {topic}
                  </span>
                ))}
              </div>
              <Link
                to={`/student/tutor?teach=${encodeURIComponent(weakTopicsFromResult.join(', '))}`}
                className="mt-4 inline-flex rounded-lg bg-green-primary px-4 py-2 text-sm font-bold text-white"
              >
                Teach Me Again
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h4 className="text-lg font-bold text-text">Answer Review</h4>
            {generatedExam.questions.map((question, index) => {
              const selected = answers[index]
              const correct = isAnswerCorrect(selected, question.answer)
              return (
                <div
                  key={index}
                  className={`rounded-xl border p-4 ${
                    correct ? 'border-green-primary/20 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-text">Q{index + 1}. {question.question}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        correct ? 'bg-green-primary/10 text-green-primary' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {correct ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Your answer: {selected || 'Not answered'}</p>
                  {!correct && (
                    <p className="mt-1 text-sm font-semibold text-green-primary">
                      Correct answer: {question.answer}
                    </p>
                  )}
                  {question.topic && (
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
                      Topic: {question.topic}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </DashboardCard>
      )}

      <DashboardCard className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text">Exam history</h2>
          <p className="mt-1 text-sm text-gray-500">
            View all attempts, scores, and weak topics on the History page.
          </p>
        </div>
        <Link
          to="/student/history"
          className="inline-flex rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white"
        >
          Open History
        </Link>
      </DashboardCard>
    </div>
  )
}
