import {
  BookOpenCheck,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
} from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
//import AvatarTeacherPlaceholder from '../../components/voiceLearning/AvatarTeacherPlaceholder'
import MarkdownMessage from '../../components/studentDashboard/MarkdownMessage'
import VoiceTeacher from '../../components/studentDashboard/VoiceTeacher'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { parseDisplayContent } from '../../utils/contentParser'
import { getConversation } from '../../services/tutorService'
import {
  createVoiceLesson,
  startVoiceLesson,
  submitVoiceQuestion,
} from '../../services/voiceLearningService'
import TeacherStage from '../../components/voiceLearning/TeacherStage'

export default function StudentVoiceLearning() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refetch } = useStudentWorkspace()
  const { isRecording, error: recorderError, startRecording, stopRecording } = useVoiceRecorder()

  const [topic, setTopic] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voiceQuestion, setVoiceQuestion] = useState('')
  const [avatarStatus, setAvatarStatus] = useState('idle')
  const [notice, setNotice] = useState('')

  const displayLesson = useMemo(
    () => parseDisplayContent(lessonContent),
    [lessonContent]
  )

  const loadLesson = async (id) => {
    const conversation = await getConversation(id)
    if (conversation.conversation_type !== 'voice') return

    setConversationId(conversation._id)
    setLessonTitle(conversation.title || 'Voice lesson')
    const lastAssistant = [...(conversation.messages || [])]
      .reverse()
      .find((message) => message.role === 'assistant')
    setLessonContent(
      parseDisplayContent(lastAssistant?.documentation || lastAssistant?.content || '')
    )
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
    setAvatarStatus('thinking')

    try {
      const response = await startVoiceLesson(trimmed, conversationId)
      setConversationId(response.conversation_id)
      setLessonTitle(response.conversation?.title || trimmed)
      setLessonContent(parseDisplayContent(response.documentation || response.answer || ''))
      setAvatarStatus('idle')
      await refetch({ silent: true })
    } catch (err) {
      console.error(err)
      setNotice('Unable to generate lesson. Please try again.')
      setAvatarStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceQuestion = async () => {
    const trimmed = voiceQuestion.trim()
    if (!trimmed) return

    setLoading(true)
    setAvatarStatus('thinking')
    try {
      const response = await startVoiceLesson(trimmed, conversationId)
      setConversationId(response.conversation_id)
      setLessonContent(parseDisplayContent(response.documentation || response.answer || ''))
      setVoiceQuestion('')
      setAvatarStatus('idle')
    } catch (err) {
      console.error(err)
      setNotice('Unable to answer voice question.')
      setAvatarStatus('idle')
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

  const handleGenerateQuiz = () => {
    if (!displayLesson) {
      alert('Generate a lesson first.')
      return
    }

    navigate('/student/exams', {
      state: {
        fromLesson: true,
        lessonText: displayLesson,
        conversationContext: displayLesson,
        subject: lessonTitle || topic || 'Lesson Quiz',
      },
    })
  }

  const mapVoiceStatusToAvatar = (status) => {
    if (status === 'loading') return 'thinking'
    if (status === 'playing') return 'speaking'
    if (status === 'paused' || status === 'stopped') return 'idle'
    return 'idle'
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-green-primary/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Voice Learning</p>
        <h1 className="mt-1 text-3xl font-bold text-text">Learn with your AI teacher</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Enter a topic to generate structured course notes and a spoken lesson — like Khan Academy with voice.
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

      <div className="space-y-5">
        {/* Course content */}
        {/*
        <section className="rounded-2xl border border-green-primary/10 bg-white shadow-sm">
          <div className="border-b border-green-primary/10 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Course content</p>
            <h2 className="mt-1 text-2xl font-bold text-text">{lessonTitle || 'Your lesson notes'}</h2>
          </div>

          <div className="max-h-[calc(100vh-22rem)] overflow-y-auto px-6 py-6">
            {displayLesson ? (
              <MarkdownMessage content={displayLesson} variant="document" />
            ) : (
              <div className="rounded-2xl border border-dashed border-green-primary/20 bg-cream/40 px-6 py-16 text-center">
                <Volume2 className="mx-auto h-10 w-10 text-green-primary" />
                <p className="mt-4 text-lg font-bold text-text">Lesson notes will appear here</p>
                <p className="mt-2 text-sm text-gray-500">Overview, concepts, examples, code, and practice questions.</p>
              </div>
            )}
          </div>

          {displayLesson && (
            <div className="border-t border-green-primary/10 px-6 py-5">
              <button
                onClick={handleGenerateQuiz}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-primary px-4 py-3 text-sm font-bold text-white"
                type="button"
              >
                <BookOpenCheck className="h-4 w-4" />
                Generate Quiz From This Lesson
              </button>
            </div>
          )}
        </section>
        */}

        {/* Virtual teacher */}
        <section className="space-y-4">

  <TeacherStage
    status={
      loading
        ? 'thinking'
        : mapVoiceStatusToAvatar(avatarStatus)
    }
    lessonTitle={lessonTitle}
    lessonContent={displayLesson}
  />

  <VoiceTeacher
    text={displayLesson}
    onStatusChange={(status) => setAvatarStatus(status)}
  />

  <div className="rounded-2xl border border-green-primary/10 bg-white p-4 shadow-sm">
    <p className="text-sm font-bold text-text">
      Ask with voice or text
    </p>

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
        {isRecording
          ? <MicOff className="h-4 w-4" />
          : <Mic className="h-4 w-4" />
        }

        {isRecording
          ? 'Stop recording'
          : 'Record audio'}
      </button>
    </div>

    <div className="mt-3 flex gap-2">
      <input
        value={voiceQuestion}
        onChange={(event) => setVoiceQuestion(event.target.value)}
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
      <p className="mt-3 text-sm text-gray-600">
        {notice || recorderError}
      </p>
    )}
  </div>

</section>
      </div>
    </div>
  )
}
