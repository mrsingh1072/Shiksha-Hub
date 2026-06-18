import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Trash2, BookOpen, ClipboardList, HelpCircle, FileText, FolderOpen, Copy, Check } from 'lucide-react'
import teacherService from '../../services/teacherService'

const quickActions = [
  { type: 'lesson_plan', label: 'Lesson Plan', icon: BookOpen, color: '#2F5D50', prompt: 'Generate a detailed lesson plan for: ' },
  { type: 'assignment', label: 'Assignment', icon: ClipboardList, color: '#6B8E23', prompt: 'Create a comprehensive assignment for: ' },
  { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: '#0891b2', prompt: 'Generate a quiz with questions and answers for: ' },
  { type: 'notes', label: 'Notes', icon: FileText, color: '#059669', prompt: 'Create detailed teaching notes for: ' },
  { type: 'resources', label: 'Resources', icon: FolderOpen, color: '#d97706', prompt: 'Suggest teaching resources and materials for: ' },
]

export default function TeacherAIAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('general')
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    teacherService.getAIHistory().then(res => setHistory(res.data)).catch(() => {})
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input, type: selectedType }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await teacherService.aiChat({ message: input, type: selectedType })
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response, type: res.data.type }])
      teacherService.getAIHistory().then(r => setHistory(r.data)).catch(() => {})
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally { setLoading(false) }
  }

  const selectQuickAction = (action) => {
    setSelectedType(action.type)
    setInput(action.prompt)
  }

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteHistory = async (id) => {
    try { await teacherService.deleteAIHistory(id); setHistory(prev => prev.filter(h => h._id !== id)) } catch {}
  }

  const loadHistory = (item) => {
    setMessages([
      { role: 'user', content: item.question, type: item.type },
      { role: 'ai', content: item.answer, type: item.type }
    ])
  }

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Teaching Assistant</h1>
          <p className="text-slate-500 text-sm mt-1">Generate lesson plans, assignments, quizzes, and more</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(action => {
          const Icon = action.icon
          return (
            <button key={action.type} onClick={() => selectQuickAction(action)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${
                selectedType === action.type ? 'border-green-primary/30 bg-green-primary/10 text-green-primary' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              <Icon className="h-4 w-4" style={{ color: action.color }} /> {action.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col" style={{ height: '65vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">AI Teaching Assistant</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md">Choose a quick action above or type your request below. I can help you create lesson plans, assignments, quizzes, notes, and more.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative group ${msg.role === 'user' ? 'teacher-chat-user' : 'teacher-chat-ai'}`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  {msg.role === 'ai' && (
                    <button onClick={() => copyText(msg.content, i)} className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition bg-white/80 hover:bg-white shadow-sm">
                      {copied === i ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="teacher-chat-ai flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-green-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-green-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input className="teacher-input flex-1" placeholder="Ask me anything about teaching..." value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} disabled={loading} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} className="teacher-btn-primary px-4">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ maxHeight: '65vh' }}>
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Chat History</h3>
          </div>
          <div className="overflow-y-auto p-3 space-y-1.5" style={{ maxHeight: 'calc(65vh - 3.5rem)' }}>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No history yet</p>
            ) : history.slice(0, 30).map(item => (
              <div key={item._id} className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer group transition" onClick={() => loadHistory(item)}>
                <p className="text-xs font-medium text-slate-600 truncate">{item.question}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="teacher-badge teacher-badge-info text-[0.6rem]">{item.type}</span>
                  <button onClick={e => { e.stopPropagation(); deleteHistory(item._id) }} className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
