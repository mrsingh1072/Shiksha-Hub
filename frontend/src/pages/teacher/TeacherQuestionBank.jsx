import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Plus, Trash2, Edit3, X, Search, Filter } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherQuestionBank() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ subject: '', difficulty: '' })
  const [formData, setFormData] = useState({ question_text: '', subject: '', topic: '', difficulty: 'medium', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', explanation: '' })

  const fetchQ = async () => {
    try { setLoading(true); const res = await teacherService.getQuestions(filters); setQuestions(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchQ() }, [filters])

  const filtered = searchQuery ? questions.filter(q => (q.question_text || '').toLowerCase().includes(searchQuery.toLowerCase())) : questions

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) { await teacherService.updateQuestion(editId, formData) }
      else { await teacherService.addQuestion(formData) }
      resetForm(); fetchQ()
    } catch (err) { console.error(err) }
  }

  const resetForm = () => {
    setFormData({ question_text: '', subject: '', topic: '', difficulty: 'medium', question_type: 'mcq', options: ['', '', '', ''], correct_answer: '', explanation: '' })
    setEditId(null); setShowModal(false)
  }

  const editQuestion = (q) => {
    setFormData({ question_text: q.question_text, subject: q.subject, topic: q.topic, difficulty: q.difficulty, question_type: q.question_type || 'mcq', options: q.options || ['', '', '', ''], correct_answer: q.correct_answer, explanation: q.explanation || '' })
    setEditId(q._id); setShowModal(true)
  }

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return
    try { await teacherService.deleteQuestion(id); fetchQ() } catch (err) { console.error(err) }
  }

  const diffBadge = (d) => {
    if (d === 'easy') return 'teacher-badge-success'
    if (d === 'hard') return 'teacher-badge-danger'
    return 'teacher-badge-warning'
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} question{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Add Question</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="teacher-input pl-10" placeholder="Search questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select className="teacher-select w-auto" value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})}>
          <option value="">All Difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <input className="teacher-input w-auto max-w-[200px]" placeholder="Filter by subject" value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})} />
      </div>

      {filtered.length === 0 ? (
        <div className="teacher-empty-state">
          <Database className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No questions found</p>
          <button onClick={() => setShowModal(true)} className="teacher-btn-primary mt-4"><Plus className="h-4 w-4" /> Add Question</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm">{q.question_text}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`teacher-badge ${diffBadge(q.difficulty)}`}>{q.difficulty}</span>
                    <span className="teacher-badge teacher-badge-info">{q.subject}</span>
                    {q.topic && <span className="teacher-badge teacher-badge-purple">{q.topic}</span>}
                    <span className="text-xs text-slate-400">{q.question_type?.toUpperCase() || 'MCQ'}</span>
                  </div>
                  {q.options?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {q.options.map((o, oi) => (
                        <span key={oi} className={`text-xs px-2 py-0.5 rounded ${o === q.correct_answer ? 'bg-green-100 text-green-700 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                          {String.fromCharCode(65 + oi)}. {o}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editQuestion(q)} className="p-1.5 rounded-lg text-slate-400 hover:text-green-primary hover:bg-green-primary/10"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteQuestion(q._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit' : 'Add'} Question</h2>
                <button onClick={resetForm} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="teacher-modal-body space-y-4">
                  <div><label className="teacher-label">Question *</label><textarea className="teacher-textarea" value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} required rows={3} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="teacher-label">Subject *</label><input className="teacher-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required /></div>
                    <div><label className="teacher-label">Topic</label><input className="teacher-input" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} /></div>
                    <div><label className="teacher-label">Difficulty</label>
                      <select className="teacher-select" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div><label className="teacher-label">Question Type</label>
                    <select className="teacher-select" value={formData.question_type} onChange={e => setFormData({...formData, question_type: e.target.value})}>
                      <option value="mcq">Multiple Choice</option><option value="short">Short Answer</option><option value="essay">Essay</option>
                    </select>
                  </div>
                  {formData.question_type === 'mcq' && (
                    <div className="space-y-2">
                      <label className="teacher-label">Options</label>
                      {formData.options.map((opt, oi) => (
                        <input key={oi} className="teacher-input text-sm" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt}
                          onChange={e => { const opts = [...formData.options]; opts[oi] = e.target.value; setFormData({...formData, options: opts}) }} />
                      ))}
                    </div>
                  )}
                  <div><label className="teacher-label">Correct Answer *</label><input className="teacher-input" value={formData.correct_answer} onChange={e => setFormData({...formData, correct_answer: e.target.value})} required /></div>
                  <div><label className="teacher-label">Explanation</label><textarea className="teacher-textarea" value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} rows={2} /></div>
                </div>
                <div className="teacher-modal-footer">
                  <button type="button" onClick={resetForm} className="teacher-btn-secondary">Cancel</button>
                  <button type="submit" className="teacher-btn-primary">{editId ? 'Update' : 'Add'} Question</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
