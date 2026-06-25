import {
  BookOpenCheck,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react'

import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import VoiceTeacher from '../../components/studentDashboard/VoiceTeacher'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import useTeacherState from '../../hooks/useTeacherState'
import { parseDisplayContent } from '../../utils/contentParser'
import { getConversation } from '../../services/tutorService'
import {
  startVoiceLesson,
  askFollowUp,
  generateQuiz,
  submitVoiceQuestion,
} from '../../services/voiceLearningService'
import TeacherStage from '../../components/voiceLearning/TeacherStage'
import QuizPanel from '../../components/voiceLearning/QuizPanel'

export default function StudentVoiceLearning() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refetch } = useStudentWorkspace()
  const { isRecording, error: recorderError, startRecording, stopRecording } = useVoiceRecorder()
  const teacher = useTeacherState()

  const [topic, setTopic] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonData, setLessonData] = useState(null)
  const [voiceText, setVoiceText] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState('')
  const [notice, setNotice] = useState('')
  const [quizQuestions, setQuizQuestions] = useState([])
  const [autoPlayVoice, setAutoPlayVoice] = useState(false)

  const loadLesson = async (id) => {
    const conversation = await getConversation(id)
    if (conversation.conversation_type !== 'voice') return

    setConversationId(conversation._id)
    setLessonTitle(conversation.title || 'Voice lesson')
    const lastAssistant = [...(conversation.messages || [])]
      .reverse()
      .find((message) => message.role === 'assistant')
    if (lastAssistant) {
      setLessonContent(lastAssistant.documentation || lastAssistant.content || '')
    }
  }

  useEffect(() => {
    const lessonId = searchParams.get('lesson')
    if (lessonId) loadLesson(lessonId).catch(console.error)
  }, [searchParams])

  const handleStartLesson = async (event) => {
    event?.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setNotice('')
    setQuizQuestions([])
    teacher.setThinking('Generating lesson...')

    try {
      const response = await startVoiceLesson(trimmed, conversationId)
      setConversationId(response.conversation_id)
      setLessonTitle(response.conversation?.title || trimmed)

      // Parse content ONCE
      const doc = response.documentation || response.answer || ''
      setLessonContent(parseDisplayContent(doc))
      setLessonData(response.lesson || null)
      setVoiceText(response.voiceText || response.answer || '')

      // State flow: thinking → writing → (auto-play voice → speaking)
      teacher.setWriting('Writing on board...')
      setTimeout(() => {
        teacher.setIdle()
        setAutoPlayVoice(true) // triggers voice auto-play
      }, 1500)

      await refetch({ silent: true })
    } catch (err) {
      console.error(err)
      setNotice('Unable to generate lesson. Please try again.')
      teacher.setError('Lesson generation failed')
      setTimeout(() => teacher.setIdle(), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceQuestion = async () => {
    const trimmed = voiceQuestion.trim()
    if (!trimmed || loading) return

    setLoading(true)
    teacher.setThinking('Processing your question...')
    try {
      const response = await askFollowUp(trimmed, conversationId)
      setConversationId(response.conversation_id)

      const doc = response.documentation || response.answer || ''
      setLessonContent(parseDisplayContent(doc))
      setLessonData(response.lesson || null)
      setVoiceText(response.voiceText || response.answer || '')
      setVoiceQuestion('')

      teacher.setWriting('Updating board...')
      setTimeout(() => {
        teacher.setIdle()
        setAutoPlayVoice(true)
      }, 1000)
    } catch (err) {
      console.error(err)
      setNotice('Unable to answer question.')
      teacher.setError('Failed to answer question')
      setTimeout(() => teacher.setIdle(), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordToggle = async () => {
    if (isRecording) {
      const blob = await stopRecording()
      if (blob) {
        const result = await submitVoiceQuestion(blob, conversationId)
        setNotice(result.message)
      }
      return
    }
    await startRecording()
  }

  const handleGenerateQuiz = async () => {
    if (!lessonContent) {
      alert('Generate a lesson first.')
      return
    }
    teacher.transition('generating_quiz', 'Generating quiz...')
    try {
      const result = await generateQuiz(lessonTitle || topic, lessonContent)
      setQuizQuestions(result.questions || [])
      teacher.setIdle()
    } catch (err) {
      console.error(err)
      setNotice('Quiz generation failed.')
      teacher.setIdle()
    }
  }

  const handleVoiceStatusChange = useCallback(
    (voiceStatus) => {
      if (voiceStatus === 'playing') {
        teacher.setSpeaking()
      } else if (voiceStatus === 'stopped' || voiceStatus === 'paused') {
        // Only go idle if we're currently speaking
        if (teacher.status === 'speaking') {
          teacher.setIdle()
        }
      }
    },
    [teacher]
  )

  return (
    <div className="space-y-5">
      {/* Topic Input Section */}
      <section className="rounded-2xl border border-green-primary/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
          Voice Learning
        </p>
        <h1 className="mt-1 text-3xl font-bold text-text">Learn with your AI teacher</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Enter a topic to generate structured course notes and a spoken lesson — like having a real
          teacher.
        </p>

        <form onSubmit={handleStartLesson} className="mt-5 flex flex-wrap gap-3">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={loading}
            placeholder='Try "Teach MongoDB" or "Explain Neural Networks"'
            className="min-w-[16rem] flex-1 rounded-xl border border-green-primary/15 px-4 py-3 text-sm outline-none focus:border-green-primary"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-green-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating lesson...' : 'Start lesson'}
          </button>
        </form>
      </section>

      {/* Teacher Stage + Voice + Quiz */}
      <div className="space-y-5">
        {/* Virtual teacher classroom */}
        <TeacherStage
          status={teacher.status}
          lessonTitle={lessonTitle}
          lessonContent={lessonContent}
          lesson={lessonData}
        />

        {/* Voice Player */}
        <VoiceTeacher
          text={lessonContent}
          voiceText={voiceText}
          autoPlay={autoPlayVoice}
          onStatusChange={handleVoiceStatusChange}
        />

        {/* Interaction Panel */}
        <div className="rounded-2xl border border-green-primary/10 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-text">Ask with voice or text</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleRecordToggle}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                isRecording
                  ? 'bg-red-100 text-red-700'
                  : 'border border-green-primary/15 text-green-primary'
              }`}
              type="button"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {isRecording ? 'Stop recording' : 'Record audio'}
            </button>

            {lessonContent && (
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-green-primary/15 px-4 py-2 text-sm font-bold text-green-primary disabled:opacity-50"
                type="button"
              >
                <BookOpenCheck className="h-4 w-4" />
                Generate Quiz
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={voiceQuestion}
              onChange={(event) => setVoiceQuestion(event.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVoiceQuestion()}
              placeholder="Or type a follow-up question..."
              className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleVoiceQuestion}
              disabled={loading || !voiceQuestion.trim()}
              className="rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              type="button"
            >
              Ask
            </button>
          </div>

          {(notice || recorderError) && (
            <p className="mt-3 text-sm text-gray-600">{notice || recorderError}</p>
          )}
        </div>

        {/* Quiz Panel */}
        {quizQuestions.length > 0 && (
          <QuizPanel questions={quizQuestions} topic={lessonTitle || topic} />
        )}
z      </div>
    </div>
  )
}
