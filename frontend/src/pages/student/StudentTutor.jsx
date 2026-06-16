import { MessageSquarePlus, Send, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import MarkdownMessage from '../../components/studentDashboard/MarkdownMessage'
import { parseDisplayContent } from '../../utils/contentParser'
import {
  askTutor,
  createConversation,
  getConversation,
} from '../../services/tutorService'

export default function StudentTutor() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { refetch } = useStudentWorkspace()

  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationTitle, setConversationTitle] = useState('New chat')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatEndRef = useRef(null)
  const teachHandledRef = useRef(false)

  const currentTopic = useMemo(() => {
    const firstUser = messages.find((message) => message.role === 'user')
    return firstUser?.content?.slice(0, 60) || 'Ask anything to begin'
  }, [messages])

  const loadConversation = async (conversationId) => {
    if (!conversationId) {
      setMessages([])
      setConversationTitle('New chat')
      return
    }

    const conversation = await getConversation(conversationId)
    if (conversation.conversation_type === 'voice') return

    setMessages(conversation.messages || [])
    setConversationTitle(conversation.title || 'Chat')
  }

  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    const teachTopics = searchParams.get('teach')

    if (conversationId) {
      setActiveConversationId(conversationId)
      getConversation(conversationId)
        .then((conversation) => {
          if (conversation.conversation_type === 'voice') {
            navigate(`/student/voice-learning?lesson=${conversationId}`)
            return
          }
          return loadConversation(conversationId)
        })
        .catch(console.error)
      return
    }

    if (teachTopics && !teachHandledRef.current) {
      teachHandledRef.current = true
      const prompt = `Explain these weak topics clearly with examples: ${teachTopics}`

      const startTeachAgain = async () => {
        setLoading(true)
        try {
          const response = await askTutor(prompt)
          setActiveConversationId(response.conversation_id)
          setMessages(response.conversation?.messages || [])
          setConversationTitle(response.conversation?.title || 'Revision chat')
          setSearchParams({})
          await refetch({ silent: true })
        } catch (err) {
          console.error(err)
          setError('Unable to start revision chat.')
        } finally {
          setLoading(false)
        }
      }

      startTeachAgain()
    }
  }, [searchParams, setSearchParams, refetch])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleNewChat = async () => {
    const conversation = await createConversation()
    setActiveConversationId(conversation._id)
    setMessages([])
    setConversationTitle(conversation.title || 'New chat')
    setQuestion('')
    setError('')
  }

  const handleAsk = async (event) => {
    event?.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError('')

    try {
      const response = await askTutor(trimmed, activeConversationId)
      setActiveConversationId(response.conversation_id)
      setMessages(response.conversation?.messages || [])
      setConversationTitle(response.conversation?.title || conversationTitle)
      setQuestion('')
      await refetch({ silent: true })
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Unable to reach the AI tutor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-green-primary/10 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">AI Tutor</p>
            <h1 className="truncate text-lg font-bold text-text">{conversationTitle}</h1>
            <p className="truncate text-sm text-gray-500">Topic: {currentTopic}</p>
          </div>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-2 rounded-xl border border-green-primary/15 bg-white px-4 py-2 text-sm font-bold text-green-primary shadow-sm transition hover:bg-cream"
            type="button"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {!messages.length && !loading && (
            <div className="rounded-2xl border border-dashed border-green-primary/20 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-primary/10 text-green-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-text">How can I help you study?</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Ask doubts, follow up with more questions, and keep everything in one conversation — just like ChatGPT.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.created_at}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-green-primary text-white'
                    : 'border border-green-primary/10 bg-white text-text shadow-sm'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MarkdownMessage content={parseDisplayContent(message.content)} />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-green-primary/10 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                Tutor is thinking...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-green-primary/10 bg-white px-4 py-4 sm:px-6">
        <form onSubmit={handleAsk} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-green-primary/15 bg-cream/40 p-2 shadow-sm">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={loading}
              rows={1}
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none disabled:opacity-60"
              placeholder="Message your tutor..."
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleAsk(event)
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-primary text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  )
}
