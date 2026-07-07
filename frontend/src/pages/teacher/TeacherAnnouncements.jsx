import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, Trash2, Edit3, X, Bell, AlertCircle, Calendar } from 'lucide-react'
import teacherService from '../../services/teacherService'

const typeBadge = { general: 'teacher-badge-info', assignment: 'teacher-badge-purple', reminder: 'teacher-badge-warning' }
const typeLabel = { general: 'General', assignment: 'Assignment', reminder: 'Reminder' }

export default function TeacherAnnouncements({ classId }) {
  const [announcements, setAnnouncements] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '', class_id: '', type: 'general' })

  const fetch = async () => {
    try { 
      setLoading(true); 
      const res = classId 
        ? await teacherService.getClassAnnouncements(classId) 
        : await teacherService.getAnnouncements(); 
      setAnnouncements(res.data) 
    }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch(); teacherService.getClasses().then(r => setClasses(r.data)).catch(() => {}) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) { await teacherService.updateAnnouncement(editId, formData) }
      else { await teacherService.createAnnouncement(formData) }
      resetForm(); fetch()
    } catch (err) { console.error(err) }
  }

  const resetForm = () => { setFormData({ title: '', content: '', class_id: classId || '', type: 'general' }); setEditId(null); setShowModal(false) }

  const editItem = (a) => {
    setFormData({ title: a.title, content: a.content, class_id: a.class_id || '', type: a.type || 'general' })
    setEditId(a._id); setShowModal(true)
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    try { await teacherService.deleteAnnouncement(id); fetch() } catch (err) { console.error(err) }
  }

  const formatDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Create</button>
      </div>

      {announcements.length === 0 ? (
        <div className="teacher-empty-state">
          <Megaphone className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No announcements yet</p>
          <p className="text-sm text-slate-400 mt-1">Create announcements to keep your students informed</p>
          <button onClick={() => setShowModal(true)} className="teacher-btn-primary mt-4"><Plus className="h-4 w-4" /> Create Announcement</button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.type === 'reminder' ? 'bg-amber-50' : a.type === 'assignment' ? 'bg-green-secondary/10' : 'bg-green-primary/10'}`}>
                    {a.type === 'reminder' ? <Bell className="h-5 w-5 text-amber-500" /> : a.type === 'assignment' ? <AlertCircle className="h-5 w-5 text-green-secondary" /> : <Megaphone className="h-5 w-5 text-green-primary" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800">{a.title}</h3>
                      <span className={`teacher-badge ${typeBadge[a.type] || 'teacher-badge-info'}`}>{typeLabel[a.type] || a.type}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{a.content}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(a.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editItem(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-green-primary hover:bg-green-primary/10"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => deleteItem(a._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit' : 'Create'} Announcement</h2>
                <button onClick={resetForm} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="teacher-modal-body space-y-4">
                  <div><label className="teacher-label">Title *</label><input className="teacher-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Announcement title" /></div>
                  <div><label className="teacher-label">Content *</label><textarea className="teacher-textarea" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required rows={4} placeholder="Write your announcement here..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    {!classId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class (Optional)</label>
                        <select value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })} className="teacher-input">
                          <option value="">All Classes (Global)</option>
                          {classes.map(c => <option key={c._id} value={c._id}>{c.class_name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="teacher-label">Type</label>
                      <select className="teacher-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="general">General</option><option value="assignment">Assignment</option><option value="reminder">Reminder</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="teacher-modal-footer">
                  <button type="button" onClick={resetForm} className="teacher-btn-secondary">Cancel</button>
                  <button type="submit" className="teacher-btn-primary">{editId ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
