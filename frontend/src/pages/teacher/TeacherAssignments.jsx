import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Plus, Trash2, Eye, X, MessageSquare, Star,
  Calendar, FileText, Bot, Send, CheckCircle, Download,
  AlertTriangle, Sparkles, Edit3, Upload
} from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [subsLoading, setSubsLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', due_date: '', total_marks: 100 })

  // Evaluation state
  const [evalLoading, setEvalLoading] = useState({}) // submissionId -> bool
  const [evalData, setEvalData] = useState({}) // submissionId -> { teacher_marks, teacher_feedback }
  const [expandedSub, setExpandedSub] = useState(null)
  const [publishLoading, setPublishLoading] = useState({})

  const fetchAssignments = async () => {
    try { setLoading(true); const res = await teacherService.getAssignments(); setAssignments(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await teacherService.createAssignment(formData)
      setFormData({ title: '', subject: '', description: '', due_date: '', total_marks: 100 })
      setShowCreate(false)
      fetchAssignments()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try { await teacherService.deleteAssignment(id); fetchAssignments() } catch (err) { console.error(err) }
  }

  const viewSubmissions = async (assignment) => {
    setShowSubmissions(assignment)
    setSubsLoading(true)
    setExpandedSub(null)
    try {
      const res = await teacherService.getAssignment(assignment._id)
      setSubmissions(res.data.submissions || [])
    } catch {
      setSubmissions([])
    } finally {
      setSubsLoading(false)
    }
  }

  const refreshSubmissions = async () => {
    if (!showSubmissions) return
    try {
      const res = await teacherService.getAssignment(showSubmissions._id)
      setSubmissions(res.data.submissions || [])
    } catch { /* keep current */ }
  }

  // --- AI Evaluation ---
  const handleAIEvaluate = async (subId) => {
    setEvalLoading(prev => ({ ...prev, [subId]: true }))
    try {
      const res = await teacherService.aiEvaluate(subId)
      const aiResult = res.data.evaluation || {}
      // Pre-fill teacher fields with AI suggestions so teacher can edit
      setEvalData(prev => ({
        ...prev,
        [subId]: {
          teacher_marks: aiResult.suggested_marks ?? '',
          teacher_feedback: aiResult.feedback ?? '',
        }
      }))
      await refreshSubmissions()
      setExpandedSub(subId)
    } catch (err) {
      alert('AI evaluation failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setEvalLoading(prev => ({ ...prev, [subId]: false }))
    }
  }

  // --- Manual Evaluation ---
  const handleManualSave = async (subId) => {
    const data = evalData[subId] || {}
    if (data.teacher_marks === '' || data.teacher_marks === undefined) {
      alert('Please enter marks before saving.')
      return
    }
    setEvalLoading(prev => ({ ...prev, [subId]: true }))
    try {
      await teacherService.manualEvaluate(subId, {
        teacher_marks: Number(data.teacher_marks),
        teacher_feedback: data.teacher_feedback || '',
      })
      await refreshSubmissions()
    } catch (err) {
      alert('Failed to save evaluation: ' + (err.response?.data?.detail || err.message))
    } finally {
      setEvalLoading(prev => ({ ...prev, [subId]: false }))
    }
  }

  // --- Publish Marks ---
  const handlePublish = async (subId) => {
    if (!window.confirm('Publish marks? The student will be notified and can see their marks.')) return
    setPublishLoading(prev => ({ ...prev, [subId]: true }))
    try {
      await teacherService.publishMarks(subId)
      await refreshSubmissions()
    } catch (err) {
      alert('Failed to publish: ' + (err.response?.data?.detail || err.message))
    } finally {
      setPublishLoading(prev => ({ ...prev, [subId]: false }))
    }
  }

  const getDueStatus = (due) => {
    if (!due) return { label: 'No Due Date', cls: 'teacher-badge-info' }
    const d = new Date(due), now = new Date()
    if (d < now) return { label: 'Expired', cls: 'teacher-badge-danger' }
    const diff = (d - now) / 86400000
    if (diff < 3) return { label: 'Due Soon', cls: 'teacher-badge-warning' }
    return { label: 'Active', cls: 'teacher-badge-success' }
  }

  const getEvalBadge = (sub) => {
    if (sub.published) return { label: 'Published', cls: 'teacher-badge-success' }
    if (sub.teacher_marks !== null && sub.teacher_marks !== undefined) return { label: 'Evaluated', cls: 'teacher-badge-purple' }
    if (sub.evaluation_status === 'ai_evaluated') return { label: 'AI Draft', cls: 'teacher-badge-warning' }
    return { label: 'Pending', cls: 'teacher-badge-info' }
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    try { return new Date(iso).toLocaleString() } catch { return iso }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-slate-500 text-sm mt-1">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Create Assignment</button>
      </div>

      {assignments.length === 0 ? (
        <div className="teacher-empty-state">
          <ClipboardList className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No assignments yet</p>
          <button onClick={() => setShowCreate(true)} className="teacher-btn-primary mt-4"><Plus className="h-4 w-4" /> Create Assignment</button>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const status = getDueStatus(a.due_date)
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg truncate">{a.title}</h3>
                      <span className={`teacher-badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{a.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {a.subject}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due: {a.due_date || 'Not set'}</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Marks: {a.total_marks}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {a.submission_count || 0} submissions</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewSubmissions(a)} className="teacher-btn-secondary text-xs py-1.5 px-3"><Eye className="h-3.5 w-3.5" /> Submissions</button>
                    <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Create Assignment Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Create Assignment</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="teacher-modal-body space-y-4">
                  <div><label className="teacher-label">Title *</label><input className="teacher-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Assignment title" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="teacher-label">Subject *</label><input className="teacher-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="Subject" /></div>
                    <div><label className="teacher-label">Total Marks</label><input className="teacher-input" type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})} /></div>
                  </div>
                  <div><label className="teacher-label">Due Date</label><input className="teacher-input" type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
                  <div><label className="teacher-label">Description</label><textarea className="teacher-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Assignment description and instructions" rows={4} /></div>
                </div>
                <div className="teacher-modal-footer">
                  <button type="button" onClick={() => setShowCreate(false)} className="teacher-btn-secondary">Cancel</button>
                  <button type="submit" className="teacher-btn-primary">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submissions & Evaluation Modal ── */}
      <AnimatePresence>
        {showSubmissions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowSubmissions(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="teacher-modal" style={{ maxWidth: '56rem' }}
              onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Submissions — {showSubmissions.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Total Marks: {showSubmissions.total_marks} · {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowSubmissions(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <div className="teacher-modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {subsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="teacher-empty-state py-8">
                    <Upload className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((sub) => {
                      const evalBadge = getEvalBadge(sub)
                      const isExpanded = expandedSub === sub._id
                      const currentEval = evalData[sub._id] || {
                        teacher_marks: sub.teacher_marks ?? sub.ai_suggested_marks ?? '',
                        teacher_feedback: sub.teacher_feedback ?? sub.ai_feedback ?? '',
                      }

                      return (
                        <div key={sub._id} className="rounded-xl border border-slate-200 overflow-hidden">
                          {/* Submission Header */}
                          <div className="p-4 bg-slate-50">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-green-primary/15 flex items-center justify-center text-sm font-bold text-green-primary">
                                  {(sub.student_name || sub.student_email || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-700 text-sm">{sub.student_name || 'Unknown'}</p>
                                  <p className="text-xs text-slate-400">{sub.student_email} {sub.student_id && `· ID: ${sub.student_id}`}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`teacher-badge ${evalBadge.cls}`}>{evalBadge.label}</span>
                                {sub.teacher_marks !== null && sub.teacher_marks !== undefined && (
                                  <span className="teacher-badge teacher-badge-success">
                                    <Star className="h-3 w-3 mr-1" /> {sub.teacher_marks}/{showSubmissions.total_marks}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                              <span>Submitted: {formatTime(sub.submitted_at)}</span>
                              {sub.file_path && (
                                <a
                                  href={`http://127.0.0.1:8000${sub.file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-green-primary hover:underline"
                                >
                                  <Download className="h-3 w-3" /> {sub.original_filename || 'Download File'}
                                </a>
                              )}
                              {sub.submission_text && (
                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Has text</span>
                              )}
                            </div>

                            {/* Submission text preview */}
                            {sub.submission_text && (
                              <p className="mt-2 text-sm text-slate-500 line-clamp-2 bg-white p-2 rounded-lg border border-slate-100">
                                {sub.submission_text}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {!sub.published && (
                            <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-t border-slate-100">
                              {/* AI Evaluate */}
                              <button
                                onClick={() => handleAIEvaluate(sub._id)}
                                disabled={evalLoading[sub._id]}
                                className="teacher-btn-secondary text-xs py-1.5 px-3"
                              >
                                {evalLoading[sub._id] ? (
                                  <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Evaluating...</>
                                ) : (
                                  <><Bot className="h-3.5 w-3.5" /> AI Evaluate</>
                                )}
                              </button>

                              {/* Manual Evaluate / Edit */}
                              <button
                                onClick={() => setExpandedSub(isExpanded ? null : sub._id)}
                                className="teacher-btn-secondary text-xs py-1.5 px-3"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> {sub.teacher_marks !== null && sub.teacher_marks !== undefined ? 'Edit Marks' : 'Manual Evaluate'}
                              </button>

                              {/* Publish — only if marks are set */}
                              {sub.teacher_marks !== null && sub.teacher_marks !== undefined && (
                                <button
                                  onClick={() => handlePublish(sub._id)}
                                  disabled={publishLoading[sub._id]}
                                  className="teacher-btn-primary text-xs py-1.5 px-3"
                                  style={{ background: '#059669' }}
                                >
                                  {publishLoading[sub._id] ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</>
                                  ) : (
                                    <><Send className="h-3.5 w-3.5" /> Publish Marks</>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Published indicator */}
                          {sub.published && (
                            <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2 text-sm text-emerald-700">
                              <CheckCircle className="h-4 w-4" />
                              Published on {formatTime(sub.published_at)} · Final: {sub.final_marks}/{showSubmissions.total_marks}
                            </div>
                          )}

                          {/* AI Results Preview (if AI evaluated) */}
                          {sub.ai_evaluation && !isExpanded && !sub.published && (
                            <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100/50">
                              <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> AI Suggestion (Draft)
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>Marks: {sub.ai_suggested_marks}/{showSubmissions.total_marks}</span>
                                <span>Grade: {sub.ai_evaluation.grade || '—'}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.ai_feedback}</p>
                            </div>
                          )}

                          {/* Expanded Evaluation Form (for manual or AI override) */}
                          <AnimatePresence>
                            {isExpanded && !sub.published && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-slate-100"
                              >
                                <div className="p-4 space-y-4 bg-slate-50/50">
                                  {/* AI details if available */}
                                  {sub.ai_evaluation && (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                      <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                                        <Sparkles className="h-3.5 w-3.5" /> AI Evaluation Details (Draft — Edit below to override)
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                        <div><strong>AI Marks:</strong> {sub.ai_suggested_marks}/{showSubmissions.total_marks}</div>
                                        <div><strong>Grade:</strong> {sub.ai_evaluation.grade || '—'}</div>
                                      </div>
                                      <p className="text-xs text-slate-600 mt-2"><strong>Feedback:</strong> {sub.ai_feedback}</p>
                                      {sub.ai_strengths?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-semibold text-green-700">Strengths:</p>
                                          <ul className="list-disc list-inside text-xs text-slate-600">
                                            {sub.ai_strengths.map((s, i) => <li key={i}>{s}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {sub.ai_weaknesses?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-semibold text-red-700">Weaknesses:</p>
                                          <ul className="list-disc list-inside text-xs text-slate-600">
                                            {sub.ai_weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {sub.ai_improvements?.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-semibold text-blue-700">Suggestions:</p>
                                          <ul className="list-disc list-inside text-xs text-slate-600">
                                            {sub.ai_improvements.map((im, i) => <li key={i}>{im}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> AI is only an assistant. You are the final authority.
                                      </p>
                                    </div>
                                  )}

                                  {/* Teacher marks + feedback form */}
                                  <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                                    <div>
                                      <label className="teacher-label">Your Marks (out of {showSubmissions.total_marks}) *</label>
                                      <input
                                        className="teacher-input"
                                        type="number"
                                        min="0"
                                        max={showSubmissions.total_marks}
                                        placeholder={`0 – ${showSubmissions.total_marks}`}
                                        value={currentEval.teacher_marks}
                                        onChange={e => setEvalData(prev => ({
                                          ...prev,
                                          [sub._id]: { ...currentEval, teacher_marks: e.target.value }
                                        }))}
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleManualSave(sub._id)}
                                      disabled={evalLoading[sub._id]}
                                      className="teacher-btn-primary text-xs py-2.5 px-4"
                                    >
                                      {evalLoading[sub._id] ? 'Saving...' : 'Save Evaluation'}
                                    </button>
                                  </div>
                                  <div>
                                    <label className="teacher-label">Your Feedback</label>
                                    <textarea
                                      className="teacher-textarea"
                                      rows={3}
                                      placeholder="Write your feedback for the student..."
                                      value={currentEval.teacher_feedback}
                                      onChange={e => setEvalData(prev => ({
                                        ...prev,
                                        [sub._id]: { ...currentEval, teacher_feedback: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
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
