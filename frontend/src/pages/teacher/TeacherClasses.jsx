import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Plus, Copy, Users, Trash2, Edit3, X, Check, BookOpen } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [createdCode, setCreatedCode] = useState(null)
  const [formData, setFormData] = useState({ class_name: '', subject: '', semester: '', section: '', description: '' })

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await teacherService.getClasses()
      setClasses(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClasses() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await teacherService.createClass(formData)
      setCreatedCode({ code: res.data.class_code, link: res.data.join_link })
      setFormData({ class_name: '', subject: '', semester: '', section: '', description: '' })
      fetchClasses()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return
    try {
      await teacherService.deleteClass(id)
      fetchClasses()
    } catch (err) { console.error(err) }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your classes and sections</p>
        </div>
        <button onClick={() => { setShowModal(true); setCreatedCode(null) }} className="teacher-btn-primary">
          <Plus className="h-4 w-4" /> Create Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="teacher-empty-state">
          <GraduationCap className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No classes yet</p>
          <p className="text-sm text-slate-400 mt-1">Create your first class to get started</p>
          <button onClick={() => setShowModal(true)} className="teacher-btn-primary mt-4">
            <Plus className="h-4 w-4" /> Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => (
            <motion.div key={cls._id} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
              className="teacher-card">
              <div className="h-2 bg-gradient-to-r from-green-primary to-green-secondary" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{cls.class_name}</h3>
                    <span className="teacher-badge teacher-badge-info mt-1">{cls.subject}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(cls._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>Semester: <span className="font-medium text-slate-700">{cls.semester || '—'}</span></p>
                  <p>Section: <span className="font-medium text-slate-700">{cls.section || '—'}</span></p>
                  {cls.description && <p className="text-xs text-slate-400 line-clamp-2">{cls.description}</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>{cls.student_count || 0} students</span>
                  </div>
                  <button onClick={() => copyToClipboard(cls.class_code)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-green-primary bg-green-primary/10 px-2.5 py-1 rounded-lg hover:bg-green-primary/15 transition">
                    <Copy className="h-3 w-3" /> {cls.class_code}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="teacher-modal" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">{createdCode ? 'Class Created!' : 'Create New Class'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              {createdCode ? (
                <div className="teacher-modal-body text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-slate-600">Share this code with your students:</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-3xl font-bold text-green-primary tracking-widest">{createdCode.code}</p>
                  </div>
                  <button onClick={() => { copyToClipboard(createdCode.code); }} className="teacher-btn-primary mx-auto">
                    <Copy className="h-4 w-4" /> Copy Code
                  </button>
                  <button onClick={() => setShowModal(false)} className="teacher-btn-secondary mx-auto block">Done</button>
                </div>
              ) : (
                <form onSubmit={handleCreate}>
                  <div className="teacher-modal-body space-y-4">
                    <div>
                      <label className="teacher-label">Class Name *</label>
                      <input className="teacher-input" value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} required placeholder="e.g. Data Structures" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="teacher-label">Subject *</label>
                        <input className="teacher-input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label className="teacher-label">Semester</label>
                        <input className="teacher-input" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} placeholder="e.g. Fall 2026" />
                      </div>
                    </div>
                    <div>
                      <label className="teacher-label">Section</label>
                      <input className="teacher-input" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="e.g. A" />
                    </div>
                    <div>
                      <label className="teacher-label">Description</label>
                      <textarea className="teacher-textarea" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description of this class" rows={3} />
                    </div>
                  </div>
                  <div className="teacher-modal-footer">
                    <button type="button" onClick={() => setShowModal(false)} className="teacher-btn-secondary">Cancel</button>
                    <button type="submit" className="teacher-btn-primary">Create Class</button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
