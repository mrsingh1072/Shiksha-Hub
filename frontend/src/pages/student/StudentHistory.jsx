import {
  BookOpen,
  MessageSquareText,
  Pencil,
  Sparkles,
  Trash2,
  Volume2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, EmptyState, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'
import MarkdownMessage from '../../components/studentDashboard/MarkdownMessage'
import { formatExamCard, parseDisplayContent } from '../../utils/contentParser'
import { deleteHistoryRecord } from '../../services/historyService'
import { listVoiceLessons } from '../../services/voiceLearningService'
import {
  deleteConversation,
  listConversations,
  renameConversation,
} from '../../services/tutorService'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'tutor', label: 'Tutor Chats' },
  { id: 'voice', label: 'Voice Lessons' },
  { id: 'exam', label: 'Practice Exams' },
]

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function HistoryCard({ icon: Icon, title, subtitle, meta, badge, children }) {
  return (
    <DashboardCard className="transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-green-primary/10 p-3 text-green-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-text">{title}</h3>
              {subtitle && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{subtitle}</p>}
              {meta && <p className="mt-2 text-xs text-gray-400">{meta}</p>}
            </div>
            {badge}
          </div>
          {children}
        </div>
      </div>
    </DashboardCard>
  )
}

export default function StudentHistory() {
  const navigate = useNavigate()
  const { dashboard, refetch } = useStudentWorkspace()
  const { exams, tutor } = dashboard

  const [activeTab, setActiveTab] = useState('all')
  const [tutorChats, setTutorChats] = useState([])
  const [voiceLessons, setVoiceLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const legacyTutor = tutor?.recentChats || []

  const loadData = async () => {
    setLoading(true)
    try {
      const [chats, lessons] = await Promise.all([
        listConversations('tutor'),
        listVoiceLessons(),
      ])
      setTutorChats(chats)
      setVoiceLessons(lessons)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const allItems = useMemo(() => {
    const chatItems = [
      ...tutorChats.map((item) => ({
        id: `chat-${item._id}`,
        rawId: item._id,
        type: 'tutor',
        title: item.title || 'Tutor chat',
        subtitle: `${item.messages?.length || 0} messages`,
        date: item.updated_at || item.created_at,
        source: 'tutor_chat',
      })),
      ...legacyTutor
        .filter((item) => !tutorChats.some((chat) => chat.title === item.title))
        .map((item) => ({
          id: `legacy-${item.id}`,
          rawId: item.id,
          type: 'tutor',
          title: parseDisplayContent(item.title),
          subtitle: parseDisplayContent(item.answer).slice(0, 120),
          date: item.createdAt,
          source: 'legacy',
        })),
    ]

    const voiceItems = voiceLessons.map((item) => {
      const lastAssistant = [...(item.messages || [])]
        .reverse()
        .find((message) => message.role === 'assistant')
      return {
        id: `voice-${item._id}`,
        rawId: item._id,
        type: 'voice',
        title: item.title || 'Voice lesson',
        subtitle: parseDisplayContent(
          lastAssistant?.documentation || lastAssistant?.content || ''
        ).slice(0, 140),
        date: item.updated_at || item.created_at,
        source: 'voice_lesson',
      }
    })

    const examItems = exams.map((exam) => {
      const card = formatExamCard(exam)
      return {
        id: `exam-${exam.id}`,
        rawId: exam.id,
        type: 'exam',
        title: card.title,
        subtitle: card.summary,
        percentage: card.percentage,
        status: card.status,
        weakTopics: exam.weakTopics || [],
        date: exam.createdAt,
        source: 'exam',
      }
    })

    return [...chatItems, ...voiceItems, ...examItems].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    )
  }, [tutorChats, voiceLessons, legacyTutor, exams])

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return allItems
    if (activeTab === 'tutor') return allItems.filter((item) => item.type === 'tutor')
    if (activeTab === 'voice') return allItems.filter((item) => item.type === 'voice')
    return allItems.filter((item) => item.type === 'exam')
  }, [allItems, activeTab])

  const handleOpen = (item) => {
    if (item.source === 'tutor_chat' || item.source === 'legacy') {
      navigate(`/student/tutor?conversation=${item.rawId}`)
      return
    }
    if (item.source === 'voice_lesson') {
      navigate(`/student/voice-learning?lesson=${item.rawId}`)
      return
    }
    if (item.source === 'exam') {
      navigate('/student/exams')
    }
  }

  const handleRename = async (item) => {
    const title = renameValue.trim()
    if (!title || !['tutor_chat', 'voice_lesson'].includes(item.source)) return

    await renameConversation(item.rawId, title)
    setRenamingId(null)
    setRenameValue('')
    await loadData()
  }

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this history item?')) return

    if (item.source === 'tutor_chat' || item.source === 'voice_lesson') {
      await deleteConversation(item.rawId)
      await loadData()
    } else if (item.source === 'exam' || item.source === 'legacy') {
      await deleteHistoryRecord(item.rawId)
      await refetch({ silent: true })
      await loadData()
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="History"
        title="Your learning history"
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/student/tutor" className="rounded-xl border border-green-primary/15 px-4 py-2 text-sm font-bold text-green-primary">
              AI Tutor
            </Link>
            <Link to="/student/voice-learning" className="rounded-xl bg-green-primary px-4 py-2 text-sm font-bold text-white">
              Voice Learning
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              activeTab === tab.id
                ? 'bg-green-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-green-primary/10 hover:bg-cream'
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <DashboardCard><p className="text-sm text-gray-500">Loading history...</p></DashboardCard>
      ) : !filteredItems.length ? (
        <EmptyState icon={MessageSquareText} title="No history yet" message="Tutor chats, voice lessons, and exam attempts will appear here." />
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => {
            const Icon =
              item.type === 'exam' ? BookOpen : item.type === 'voice' ? Volume2 : MessageSquareText

            return (
              <HistoryCard
                key={item.id}
                icon={Icon}
                title={item.title}
                subtitle={item.subtitle}
                meta={formatDate(item.date)}
                badge={
                  item.status ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === 'Passed' ? 'bg-green-primary/10 text-green-primary' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.percentage ? `${item.percentage} • ` : ''}{item.status}
                    </span>
                  ) : null
                }
              >
                {item.weakTopics?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.weakTopics.map((topic) => (
                      <span key={topic} className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-amber-700">{topic}</span>
                    ))}
                  </div>
                )}

                {expandedId === item.id && (
                  <div className="mt-4 rounded-xl border border-green-primary/10 bg-cream/40 p-4">
                    <MarkdownMessage content={item.subtitle} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => handleOpen(item)} className="rounded-lg bg-green-primary px-3 py-2 text-xs font-bold text-white" type="button">
                    {item.type === 'tutor' ? 'Continue' : item.type === 'voice' ? 'Open lesson' : 'View'}
                  </button>

                  {['tutor_chat', 'voice_lesson'].includes(item.source) && renamingId === item.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="rounded-lg border px-2 py-1 text-sm" />
                      <button onClick={() => handleRename(item)} className="rounded-lg bg-green-primary px-2 py-1 text-xs font-bold text-white" type="button">Save</button>
                      <button onClick={() => setRenamingId(null)} className="rounded-lg border px-2 py-1 text-xs font-bold" type="button">Cancel</button>
                    </div>
                  ) : (
                    <>
                      {['tutor_chat', 'voice_lesson'].includes(item.source) && (
                        <button
                          onClick={() => { setRenamingId(item.id); setRenameValue(item.title) }}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold"
                          type="button"
                        >
                          <Pencil className="h-3 w-3" /> Rename
                        </button>
                      )}
                      {(item.type === 'voice' || item.type === 'tutor') && (
                        <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="rounded-lg border px-3 py-2 text-xs font-bold" type="button">
                          {expandedId === item.id ? 'Hide preview' : 'Preview'}
                        </button>
                      )}
                      <button onClick={() => handleDelete(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600" type="button">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </HistoryCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
