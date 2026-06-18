import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Plus, Trash2, Eye, X, MessageSquare, Star, Calendar, FileText } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(null)
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', due_date: '', total_marks: 100 })
  const [feedbackData, setFeedbackData] = useState({})

  const fetch = async () => {
    try { setLoading(true); const res = await teacherService.getAssignments(); setAssignments(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try { await teacherService.createAssignment(formData); setFormData({ title: '', subject: '', description: '', due_date: '', total_marks: 100 }); setShowCreate(false); fetch() }
    catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try { await teacherService.deleteAssignment(id); fetch() } catch (err) { console.error(err) }
  }

  const viewSubmissions = async (assignment) => {
    try {
      const res = await teacherService.getAssignment(assignment._id)
      setShowSubmissions(res.data)
    } catch { setShowSubmissions({ ...assignment, submissions: [] }) }
  }

  const submitFeedback = async (assignmentId, submissionId) => {
    const data = feedbackData[submissionId] || {}
    try {
      await teacherService.addFeedback(assignmentId, { submission_id: submissionId, feedback: data.feedback || '', grade: data.grade ? Number(data.grade) : null })
      viewSubmissions(showSubmissions)
    } catch (err) { console.error(err) }
  }

  const getDueStatus = (due) => {
    if (!due) return { label: 'No Due Date', cls: 'teacher-badge-info' }
    const d = new Date(due), now = new Date()
    if (d < now) return { label: 'Expired', cls: 'teacher-badge-danger' }
    const diff = (d - now) / 86400000
    if (diff < 3) return { label: 'Due Soon', cls: 'teacher-badge-warning' }
    return { label: 'Active', cls: 'teacher-badge-success' }
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

      {/* Create Modal */}
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

      {/* Submissions Modal */}
      <AnimatePresence>
        {showSubmissions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowSubmissions(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Submissions — {showSubmissions.title}</h2>
                <button onClick={() => setShowSubmissions(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="teacher-modal-body">
                {(!showSubmissions.submissions || showSubmissions.submissions.length === 0) ? (
                  <div className="teacher-empty-state py-8"><p className="text-sm text-slate-400">No submissions yet</p></div>
                ) : (
                  <div className="space-y-4">
                    {showSubmissions.submissions.map((sub, i) => (
                      <div key={sub._id || i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-700 text-sm">{sub.student_email}</span>
                          {sub.score !== undefined && <span className="teacher-badge teacher-badge-success"><Star className="h-3 w-3 mr-1" /> {sub.score}/10</span>}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-3">{sub.submission_text || sub.answer || 'No text'}</p>
                        {sub.reviewed ? (
                          <div className="p-2 bg-green-50 rounded-lg text-sm text-green-700"><MessageSquare className="h-3.5 w-3.5 inline mr-1" /> Reviewed: {sub.feedback || 'No feedback'} {sub.grade !== undefined && ` • Grade: ${sub.grade}`}</div>
                        ) : (
                          <div className="flex gap-2 items-end">
                            <div className="flex-1"><input className="teacher-input text-sm" placeholder="Add feedback..." value={feedbackData[sub._id]?.feedback || ''} onChange={e => setFeedbackData({...feedbackData, [sub._id]: {...(feedbackData[sub._id]||{}), feedback: e.target.value}})} /></div>
                            <div className="w-20"><input className="teacher-input text-sm" type="number" placeholder="Grade" value={feedbackData[sub._id]?.grade || ''} onChange={e => setFeedbackData({...feedbackData, [sub._id]: {...(feedbackData[sub._id]||{}), grade: e.target.value}})} /></div>
                            <button onClick={() => submitFeedback(showSubmissions._id, sub._id)} className="teacher-btn-primary text-xs py-2">Submit</button>
                          </div>
                        )}
                      </div>
                    ))}
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
