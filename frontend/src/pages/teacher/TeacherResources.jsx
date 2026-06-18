import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Plus, Trash2, X, Upload, Download, FileText, Image, File } from 'lucide-react'
import teacherService from '../../services/teacherService'

const typeIcon = { PDF: FileText, PPT: FileText, PPTX: FileText, DOC: FileText, DOCX: FileText, PNG: Image, JPG: Image, JPEG: Image }
const typeColor = { PDF: '#dc2626', PPT: '#ea580c', PPTX: '#ea580c', DOC: '#2563eb', DOCX: '#2563eb', PNG: '#059669', JPG: '#059669', JPEG: '#059669' }

export default function TeacherResources() {
  const [resources, setResources] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filterClass, setFilterClass] = useState('')
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const fetch = async () => {
    try { setLoading(true); const res = await teacherService.getResources(filterClass); setResources(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch(); teacherService.getClasses().then(r => setClasses(r.data)).catch(() => {}) }, [filterClass])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', title || file.name)
      fd.append('class_id', classId)
      fd.append('description', description)
      await teacherService.uploadResource(fd)
      setShowUpload(false); setFile(null); setTitle(''); setClassId(''); setDescription(''); fetch()
    } catch (err) { console.error(err) }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try { await teacherService.deleteResource(id); fetch() } catch (err) { console.error(err) }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]) }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resources</h1>
          <p className="text-slate-500 text-sm mt-1">{resources.length} file{resources.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <div className="flex gap-2 items-end">
          <select className="teacher-select w-auto" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.class_name}</option>)}
          </select>
          <button onClick={() => setShowUpload(true)} className="teacher-btn-primary"><Plus className="h-4 w-4" /> Upload</button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="teacher-empty-state">
          <FolderOpen className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No resources yet</p>
          <button onClick={() => setShowUpload(true)} className="teacher-btn-primary mt-4"><Upload className="h-4 w-4" /> Upload Resource</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map((r, i) => {
            const Icon = typeIcon[r.file_type] || File
            const color = typeColor[r.file_type] || '#64748b'
            return (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="teacher-card group">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <a href={`http://127.0.0.1:8000/teacher/resources/file/${r.stored_name}`} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-primary hover:bg-green-primary/10"><Download className="h-4 w-4" /></a>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{r.title}</h3>
                  {r.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="teacher-badge" style={{ background: color + '15', color }}>{r.file_type}</span>
                    <span className="text-xs text-slate-400">{formatSize(r.file_size)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setShowUpload(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="teacher-modal" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Upload Resource</h2>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="teacher-modal-body space-y-4">
                  {/* Drop zone */}
                  <div className={`teacher-dropzone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}>
                    <Upload className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    {file ? <p className="text-sm font-semibold text-green-primary">{file.name}</p> : (
                      <><p className="text-sm font-medium text-slate-500">Drag & drop file here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, PPT, DOCX, PNG, JPG (max 50MB)</p></>
                    )}
                    <input ref={fileRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
                  </div>
                  <div><label className="teacher-label">Title</label><input className="teacher-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title (optional)" /></div>
                  <div><label className="teacher-label">Class (optional)</label>
                    <select className="teacher-select" value={classId} onChange={e => setClassId(e.target.value)}>
                      <option value="">No class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.class_name}</option>)}
                    </select>
                  </div>
                  <div><label className="teacher-label">Description</label><textarea className="teacher-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brief description" /></div>
                </div>
                <div className="teacher-modal-footer">
                  <button type="button" onClick={() => setShowUpload(false)} className="teacher-btn-secondary">Cancel</button>
                  <button type="submit" disabled={!file || uploading} className="teacher-btn-primary">
                    {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
