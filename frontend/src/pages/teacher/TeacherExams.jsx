import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Trash2, X, Sparkles, Eye, Clock, HelpCircle } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showAIGen, setShowAIGen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState(null)
  const [formData, setFormData] = useState({ title: '', subject: '', duration: 30, total_marks: 10, questions: [] })
  const [aiForm, setAiForm] = useState({ subject: '', topic: '', difficulty: 'medium', num_questions: 10 })
  const [newQ, setNewQ] = useState({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' })

  const fetchExams = async () => {
    try { setLoading(true); const res = await teacherService.getExams(); setExams(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchExams() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try { await teacherService.createExam(formData); setFormData({ title: '', subject: '', duration: 30, total_marks: 10, questions: [] }); setShowCreate(false); fetchExams() }
    catch (err) { console.error(err) }
  }

  const addQuestion = () => {
    if (!newQ.question.trim()) return
    setFormData({ ...formData, questions: [...formData.questions, { ...newQ }], total_marks: formData.questions.length + 1 })
    setNewQ({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' })
  }

  const removeQuestion = (idx) => {
    const updated = formData.questions.filter((_, i) => i !== idx)
    setFormData({ ...formData, questions: updated, total_marks: updated.length })
  }

  const generateWithAI = async () => {
    setAiLoading(true)
    try {
      const res = await teacherService.generateExam(aiForm)
      setGeneratedQuestions(res.data)
    } catch (err) { console.error(err) }
    finally { setAiLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return
    try { await teacherService.deleteExam(id); fetchExams() } catch (err) { console.error(err) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exams</h1>
          <p className="text-slate-500 text-sm mt-1">{exams.length} exam{exams.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAIGen(true)} className="teacher-btn-secondary"><Sparkles className="h-4 w-4" /> AI Generate</button>
          <button onClick={() => setShowCreate(true)} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Create Exam</button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="teacher-empty-state">
          <FileText className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No exams yet</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowAIGen(true)} className="teacher-btn-secondary"><Sparkles className="h-4 w-4" /> AI Generate</button>
            <button onClick={() => setShowCreate(true)} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Create Manually</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam, i) => (
            <motion.div key={exam._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="teacher-card">
              <div className="h-1.5 bg-gradient-to-r from-green-primary via-green-secondary to-green-secondary" />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{exam.title}</h3>
                  <button onClick={() => handleDelete(exam._id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-green-primary" /> {exam.subject}</p>
                  <p className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-green-secondary" /> {exam.question_count || exam.questions?.length || 0} questions</p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-400" /> {exam.duration} min</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {exam.ai_generated && <span className="teacher-badge teacher-badge-purple"><Sparkles className="h-3 w-3 mr-0.5" /> AI</span>}
                  <span className={`teacher-badge ${exam.status === 'active' ? 'teacher-badge-success' : 'teacher-badge-warning'}`}>{exam.status || 'draft'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Manual Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Create Exam</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="teacher-modal-body space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="teacher-label">Title *</label><input className="teacher-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                    <div><label className="teacher-label">Subject *</label><input className="teacher-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="teacher-label">Duration (min)</label><input className="teacher-input" type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} /></div>
                    <div><label className="teacher-label">Total Marks</label><input className="teacher-input" type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})} /></div>
                  </div>
                  {/* Add Question Section */}
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Questions ({formData.questions.length})</h3>
                    {formData.questions.map((q, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg mb-2 flex justify-between items-start">
                        <span className="text-sm text-slate-600"><span className="font-bold text-green-primary">Q{i + 1}.</span> {q.question}</span>
                        <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <div className="p-3 bg-green-primary/5 rounded-lg space-y-2 border border-green-primary/10">
                      <input className="teacher-input text-sm" placeholder="Question text" value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2">
                        {newQ.options.map((opt, oi) => (
                          <input key={oi} className="teacher-input text-sm" placeholder={`Option ${oi + 1}`} value={opt}
                            onChange={e => { const opts = [...newQ.options]; opts[oi] = e.target.value; setNewQ({...newQ, options: opts}) }} />
                        ))}
                      </div>
                      <input className="teacher-input text-sm" placeholder="Correct answer" value={newQ.correct_answer} onChange={e => setNewQ({...newQ, correct_answer: e.target.value})} />
                      <button type="button" onClick={addQuestion} className="teacher-btn-secondary text-xs">+ Add Question</button>
                    </div>
                  </div>
                </div>
                <div className="teacher-modal-footer">
                  <button type="button" onClick={() => setShowCreate(false)} className="teacher-btn-secondary">Cancel</button>
                  <button type="submit" className="teacher-btn-primary">Create Exam</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generate Modal */}
      <AnimatePresence>
        {showAIGen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => { setShowAIGen(false); setGeneratedQuestions(null) }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Sparkles className="h-5 w-5 text-green-secondary" /> AI Exam Generator</h2>
                <button onClick={() => { setShowAIGen(false); setGeneratedQuestions(null) }} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="teacher-modal-body space-y-4">
                {!generatedQuestions ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="teacher-label">Subject *</label><input className="teacher-input" value={aiForm.subject} onChange={e => setAiForm({...aiForm, subject: e.target.value})} placeholder="e.g. Mathematics" /></div>
                      <div><label className="teacher-label">Topic</label><input className="teacher-input" value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})} placeholder="e.g. Calculus" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="teacher-label">Difficulty</label>
                        <select className="teacher-select" value={aiForm.difficulty} onChange={e => setAiForm({...aiForm, difficulty: e.target.value})}>
                          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                        </select>
                      </div>
                      <div><label className="teacher-label">Questions</label><input className="teacher-input" type="number" min="1" max="30" value={aiForm.num_questions} onChange={e => setAiForm({...aiForm, num_questions: Number(e.target.value)})} /></div>
                    </div>
                    <button onClick={generateWithAI} disabled={aiLoading || !aiForm.subject} className="teacher-btn-primary w-full justify-center">
                      {aiLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Exam</>}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">✓ Generated {generatedQuestions.total_questions || generatedQuestions.questions?.length || 0} questions successfully!</div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {(generatedQuestions.questions || []).map((q, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                          <p className="font-medium text-slate-700"><span className="text-green-primary font-bold">Q{i + 1}.</span> {q.question}</p>
                          <div className="mt-1 space-y-0.5 ml-4">{(q.options || []).map((o, oi) => <p key={oi} className={`text-xs ${o === q.correct_answer ? 'text-green-600 font-bold' : 'text-slate-400'}`}>{String.fromCharCode(65 + oi)}. {o}</p>)}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setShowAIGen(false); setGeneratedQuestions(null); fetchExams() }} className="teacher-btn-primary w-full justify-center">Done</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
