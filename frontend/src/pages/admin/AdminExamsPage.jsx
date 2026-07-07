import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileText, Search, Trash2, Eye, Calendar, CheckCircle, Clock, PlayCircle } from 'lucide-react'
import adminService from '../../services/adminService'

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

function determineStatus(exam) {
  if (exam.status === 'draft') return 'Draft'
  
  if (exam.start_time && exam.end_time) {
    const now = new Date()
    const start = new Date(exam.start_time)
    const end = new Date(exam.end_time)
    
    if (now < start) return 'Scheduled'
    if (now >= start && now <= end) return 'Active'
    if (now > end) return 'Ended'
  }
  
  if (exam.status === 'published' || exam.status === 'active') return 'Published'
  
  return 'Unknown'
}

function StatusBadge({ status }) {
  let colorClass = 'bg-gray-100 text-gray-700'
  if (status === 'Draft') colorClass = 'bg-yellow-50 text-yellow-700'
  if (status === 'Published') colorClass = 'bg-blue-50 text-blue-700'
  if (status === 'Scheduled') colorClass = 'bg-purple-50 text-purple-700'
  if (status === 'Active') colorClass = 'bg-green-50 text-green-700 border-green-200 border'
  if (status === 'Ended') colorClass = 'bg-red-50 text-red-700'
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, tone = 'students' }) {
  return (
    <article className={`admin-metric-card admin-tone-${tone}`}>
      <div className="admin-metric-card__header">
        <div>
          <p className="admin-eyebrow">{label}</p>
          <strong>{value}</strong>
        </div>
        {Icon && (
          <div className="admin-metric-card__icon">
            <Icon size={20} />
          </div>
        )}
      </div>
    </article>
  )
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSemester, setFilterSemester] = useState('')

  const fetchExams = useCallback(() => {
    setLoading(true)
    adminService
      .getAllExams()
      .then((res) => setExams(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Unable to load exams'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) return
    try {
      await adminService.deleteAllExamsItem(id)
      setExams(exams.filter(e => e._id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete exam')
    }
  }

  // Enriched exams with computed status
  const enrichedExams = useMemo(() => {
    return exams.map(e => ({
      ...e,
      computedStatus: determineStatus(e)
    }))
  }, [exams])

  // Computed Options for Filters
  const teachers = useMemo(() => [...new Set(enrichedExams.map(e => e.teacher_name).filter(Boolean))], [enrichedExams])
  const classes = useMemo(() => [...new Set(enrichedExams.map(e => e.class_name).filter(c => c && c !== 'N/A'))], [enrichedExams])
  const subjects = useMemo(() => [...new Set(enrichedExams.map(e => e.subject).filter(Boolean))], [enrichedExams])
  const semesters = useMemo(() => [...new Set(enrichedExams.map(e => e.semester).filter(s => s && s !== 'N/A'))], [enrichedExams])

  // Filtering Logic
  const filteredExams = useMemo(() => {
    return enrichedExams.filter(exam => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || 
        (exam.title && exam.title.toLowerCase().includes(q)) ||
        (exam.teacher_name && exam.teacher_name.toLowerCase().includes(q))
        
      const matchesTeacher = !filterTeacher || exam.teacher_name === filterTeacher
      const matchesClass = !filterClass || exam.class_name === filterClass
      const matchesSubject = !filterSubject || exam.subject === filterSubject
      const matchesStatus = !filterStatus || exam.computedStatus === filterStatus
      const matchesSemester = !filterSemester || exam.semester === filterSemester
      
      return matchesSearch && matchesTeacher && matchesClass && matchesSubject && matchesStatus && matchesSemester
    })
  }, [enrichedExams, searchQuery, filterTeacher, filterClass, filterSubject, filterStatus, filterSemester])

  // Stats computation
  const stats = useMemo(() => {
    return {
      total: enrichedExams.length,
      published: enrichedExams.filter(e => e.computedStatus === 'Published').length,
      draft: enrichedExams.filter(e => e.computedStatus === 'Draft').length,
      active: enrichedExams.filter(e => e.computedStatus === 'Active').length,
      scheduled: enrichedExams.filter(e => e.computedStatus === 'Scheduled').length,
      ended: enrichedExams.filter(e => e.computedStatus === 'Ended').length,
    }
  }, [enrichedExams])

  return (
    <section className="admin-page admin-workspace-page">
      <div className="admin-workspace-hero admin-workspace-hero--plain">
        <div>
          <p className="admin-workspace-hero__eyebrow">Workspace</p>
          <h1>Exam Management</h1>
          <p>Complete visibility and control over all exams across the platform.</p>
        </div>
      </div>
      
      {error && <div className="admin-error-banner">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard label="Total Exams" value={stats.total} icon={FileText} tone="students" />
        <StatCard label="Active Exams" value={stats.active} icon={PlayCircle} tone="approved" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} tone="teachers" />
        <StatCard label="Ended / Past" value={stats.ended} icon={CheckCircle} tone="classes" />
        <StatCard label="Published" value={stats.published} icon={CheckCircle} tone="usage" />
        <StatCard label="Drafts" value={stats.draft} icon={Clock} tone="pending" />
      </div>

      <div className="admin-toolbar-card flex flex-wrap items-center gap-4">
        <label className="admin-search-field admin-search-field--wide flex-1 min-w-[250px]">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Exam Title or Teacher Name..."
            className="admin-input admin-input--ghost"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        
        <div className="flex flex-wrap items-center gap-3">
          <select className="admin-select" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
            <option value="">All Teachers</option>
            {teachers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="admin-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="admin-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="admin-select" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="admin-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Active">Active</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="admin-table-wrap admin-table-wrap--elevated admin-table-wrap--workspace">
        <table className="admin-table whitespace-nowrap">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Class Info</th>
                <th>Stats</th>
                <th>Status</th>
                <th>Timing</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">Loading exams...</td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">No exams found matching your criteria.</td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam._id}>
                    <td>
                      <strong className="block text-gray-900">{exam.title || 'Untitled Exam'}</strong>
                      <span className="text-xs text-gray-500">Created: {formatDate(exam.created_at)}</span>
                    </td>
                    <td>{exam.subject || 'N/A'}</td>
                    <td>
                      <span className="block font-medium text-gray-900">{exam.teacher_name}</span>
                      <span className="text-xs text-gray-500">{exam.teacher_email}</span>
                    </td>
                    <td>
                      {exam.class_name !== 'N/A' ? (
                        <>
                          <span className="block text-gray-900">{exam.class_name}</span>
                          <span className="text-xs text-gray-500">Sem {exam.semester} | Sec {exam.section}</span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No Class Assigned</span>
                      )}
                    </td>
                    <td>
                      <span className="block text-sm">{exam.total_questions || 0} Qs</span>
                      <span className="text-xs text-gray-500">{exam.total_marks || 0} Marks | {exam.duration || 0}m</span>
                    </td>
                    <td>
                      <StatusBadge status={exam.computedStatus} />
                    </td>
                    <td>
                      {exam.start_time ? (
                        <>
                          <span className="block text-xs">Start: {formatDate(exam.start_time)}</span>
                          <span className="block text-xs">End: {formatDate(exam.end_time)}</span>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 text-gray-500 hover:text-green-700 bg-gray-50 hover:bg-green-50 rounded-md transition-colors"
                          title="View Details (Implementation Pending)"
                          onClick={() => alert(`View details for: ${exam.title}\n(Read-only modal to be fully integrated as requested)`)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="p-2 text-gray-500 hover:text-red-700 bg-gray-50 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Exam"
                          onClick={() => handleDelete(exam._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  )
}
