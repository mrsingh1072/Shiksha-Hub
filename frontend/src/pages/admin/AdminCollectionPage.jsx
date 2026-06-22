import { useCallback, useEffect, useState } from 'react'
import { Eye, Search, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react'
import adminService from '../../services/adminService'

const labels = {
  students: ['Students', 'Manage learner access and inspect academic activity.'],
  teachers: ['Teachers', 'Approve educators and oversee their platform activity.'],
  classes: ['Classes', 'Monitor enrollment and class ownership.'],
  assignments: ['Assignments', 'Review platform assignments and submission activity.'],
  exams: ['Exams', 'Monitor assessments, results, and publishing status.'],
  questions: ['Question Bank', 'Moderate shared assessment questions.'],
  resources: ['Resources', 'Review uploaded learning files and storage usage.'],
}
const primary = x => x.name || x.title || x.class_name || x.question_text || x.file_name || 'Untitled'
const secondary = x => x.email || x.teacher_email || x.subject || x.description || x.userId || ''
const recordStatus = x => x.status || x.role || x.file_type || (x.students ? `${x.students.length} enrolled` : 'active')

export default function AdminCollectionPage({ kind, users = false }) {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [detail, setDetail] = useState(null)
  const [title, description] = labels[kind] || [kind, 'Platform management']

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { search }
      if (filter) params.status = filter
      const response = users
        ? await adminService[kind](params)
        : await adminService.content(kind, { search })
      setRows(response.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load records')
    } finally {
      setLoading(false)
    }
  }, [kind, users, search, filter])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const remove = async row => {
    if (!window.confirm(`Permanently delete "${primary(row)}"?`)) return
    try {
      users
        ? await adminService.deleteUser(row._id)
        : await adminService.deleteContent(kind, row._id)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Delete failed')
    }
  }

  const setStudentState = async (row, next) => {
    try {
      await adminService.setUserStatus(row._id, next)
      setNotice(`${primary(row)} marked ${next}.`)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Update failed')
    }
  }

  const reviewTeacher = async (row, decision) => {
    try {
      const response = decision === 'approved'
        ? await adminService.approveTeacher(row._id)
        : await adminService.rejectTeacher(row._id)
      const mailNote = decision === 'approved'
        ? (response.data.email_sent ? ' Approval email sent.' : ' Approved, but email delivery failed.')
        : ''
      setNotice(`${response.data.message}.${mailNote}`)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Teacher review failed')
    }
  }

  const inspect = async row => {
    if (!users) {
      setDetail(row)
      return
    }
    try {
      setDetail((await adminService.user(row._id)).data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Unable to load details')
    }
  }

  const approveQuestion = async row => {
    await adminService.approveQuestion(row._id)
    load()
  }

  const assignTeacher = async row => {
    const email = window.prompt('Teacher email', row.teacher_email || '')
    if (!email) return
    try {
      await adminService.assignTeacher(row._id, email)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Assignment failed')
    }
  }

  const pendingTeachers = kind === 'teachers'
    ? rows.filter(row => row.status === 'pending')
    : []

  const actionButtons = row => (
    <div className="admin-actions">
      <button className="admin-btn secondary" onClick={() => inspect(row)} title="View application">
        <Eye size={14} />
      </button>
      {kind === 'teachers' && row.status !== 'approved' && (
        <button className="admin-btn secondary" onClick={() => reviewTeacher(row, 'approved')} title="Approve teacher">
          <UserCheck size={14} />
        </button>
      )}
      {kind === 'teachers' && row.status !== 'rejected' && (
        <button className="admin-btn danger" onClick={() => reviewTeacher(row, 'rejected')} title="Reject teacher">
          <UserX size={14} />
        </button>
      )}
      {kind === 'students' && (
        <>
          <button className="admin-btn secondary" onClick={() => setStudentState(row, 'active')} title="Activate">
            <UserCheck size={14} />
          </button>
          <button className="admin-btn danger" onClick={() => setStudentState(row, 'suspended')} title="Suspend">
            <UserX size={14} />
          </button>
        </>
      )}
      {kind === 'classes' && (
        <button className="admin-btn secondary" onClick={() => assignTeacher(row)} title="Assign teacher">
          <UserCheck size={14} />
        </button>
      )}
      {kind === 'questions' && row.status !== 'approved' && (
        <button className="admin-btn secondary" onClick={() => approveQuestion(row)} title="Approve">
          <ShieldCheck size={14} />
        </button>
      )}
      <button className="admin-btn danger" onClick={() => remove(row)} title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  )

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div><h1>{title}</h1><p>{description}</p></div>
        <div className="admin-status"><i />{rows.length} records</div>
      </div>

      {kind === 'teachers' && (
        <article className="admin-panel admin-pending-panel">
          <div className="admin-section-heading">
            <div><h2>Pending Teacher Requests</h2><p>Applications requiring administrator review.</p></div>
            <span className="admin-count">{pendingTeachers.length}</span>
          </div>
          {pendingTeachers.length ? pendingTeachers.slice(0, 6).map(row => (
            <div className="admin-list-row" key={row._id}>
              <div><strong>{primary(row)}</strong><span>{row.email} � {row.subject || 'Subject not provided'}</span></div>
              {actionButtons(row)}
            </div>
          )) : <div className="admin-empty compact">No pending teacher applications.</div>}
        </article>
      )}

      <div className="admin-tools">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--ev-text-muted)' }} />
          <input className="admin-input" style={{ paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} />
        </div>
        {users && (
          <select className="admin-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {kind === 'teachers' ? <><option>pending</option><option>approved</option><option>rejected</option></> : <><option>active</option><option>suspended</option></>}
          </select>
        )}
      </div>

      {notice && <div className="admin-notice">{notice}</div>}
      {error && <div className="admin-error">{error}</div>}

      {loading ? <div className="admin-empty">Loading records...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name / title</th><th>Owner / context</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row._id}>
                  <td>{primary(row)}</td><td>{secondary(row)}</td>
                  <td><span className={`admin-badge ${row.status || ''}`}>{recordStatus(row)}</span></td>
                  <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : ''}</td>
                  <td>{actionButtons(row)}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="5"><div className="admin-empty">No matching records found.</div></td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="admin-modal-backdrop" onClick={() => setDetail(null)}>
          <article className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-head"><div><h2>{primary(detail)}</h2><p>Full application record</p></div><button className="admin-btn secondary" onClick={() => setDetail(null)}>Close</button></div>
            <div className="admin-detail-grid">
              {Object.entries(detail).filter(([key]) => key !== 'password').map(([key, value]) => (
                <div key={key}><span>{key.replace(/([A-Z_])/g, ' $1')}</span><strong>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}</strong></div>
              ))}
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

