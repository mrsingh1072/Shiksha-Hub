import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Eye, Search, ShieldCheck, Trash2, UserCheck, UserPlus, UserX, Users } from 'lucide-react'
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

function primary(record) {
  return record.name || record.title || record.class_name || record.question_text || record.file_name || 'Untitled'
}

function secondary(record) {
  return record.email || record.teacher_email || record.subject || record.description || record.userId || 'Not available'
}

function recordStatus(record) {
  return record.status || record.role || record.file_type || (record.students ? `${record.students.length} enrolled` : 'active')
}

function formatDate(value) {
  if (!value) return 'No timestamp available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No timestamp available'
  return date.toLocaleString()
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function sentenceCase(value) {
  const text = String(value || '').replace(/[_-]/g, ' ').trim()
  if (!text) return 'Unknown'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'Not available'
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(', ') : 'No items'
  if (typeof value === 'object') return 'Structured data available'
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  return String(value)
}

function statusClass(value) {
  const normalized = String(value || '').toLowerCase()
  if (['approved', 'active', 'student', 'teacher'].includes(normalized)) return 'active'
  if (['pending'].includes(normalized)) return 'pending'
  if (['rejected', 'suspended'].includes(normalized)) return 'rejected'
  return 'neutral'
}

function StatCard({ label, value, hint, tone = 'students', icon: Icon }) {
  return (
    <article className={`admin-metric-card admin-tone-${tone}`}>
      <div className="admin-metric-card__header">
        <div>
          <p className="admin-eyebrow">{label}</p>
          <strong>{value}</strong>
        </div>
        {Icon ? <div className="admin-metric-card__icon"><Icon size={20} /></div> : null}
      </div>
      {hint ? <p className="admin-metric-card__hint">{hint}</p> : null}
    </article>
  )
}

function DetailSection({ title, entries }) {
  const visibleEntries = entries.filter((entry) => entry.value !== undefined)
  if (!visibleEntries.length) return null

  return (
    <section className="admin-detail-section">
      <div className="admin-detail-section__header">
        <p className="admin-eyebrow">Details</p>
        <h3>{title}</h3>
      </div>
      <div className="admin-detail-grid admin-detail-grid--workspace">
        {visibleEntries.map((entry) => (
          <div key={entry.label}>
            <span>{entry.label}</span>
            {entry.badge ? <strong><span className={`admin-badge ${statusClass(entry.badge)}`}>{sentenceCase(entry.badge)}</span></strong> : <strong>{formatValue(entry.value)}</strong>}
          </div>
        ))}
      </div>
    </section>
  )
}

function DetailModal({ detail, kind, onClose }) {
  const baseEntries = [
    { label: 'Name', value: detail.name },
    { label: 'Email', value: detail.email },
    { label: 'Role', value: detail.role, badge: detail.role },
    { label: 'Status', value: detail.status, badge: detail.status },
    { label: 'Created', value: formatDate(detail.created_at) },
    { label: 'Last Login', value: detail.last_login ? formatDate(detail.last_login) : undefined },
  ]

  const studentEntries = [
    { label: 'Student ID', value: detail.userId },
    { label: 'Phone', value: detail.phone },
    { label: 'AI Tutor Usage', value: detail.aiTutorUsage },
    { label: 'Assignments', value: detail.assignments?.length },
    { label: 'Exam Scores', value: detail.examScores?.length },
    { label: 'Attendance Records', value: detail.attendance?.length },
  ]

  const teacherEntries = [
    { label: 'Subject', value: detail.subject },
    { label: 'Qualification', value: detail.qualification },
    { label: 'Experience', value: detail.experience ? `${detail.experience} Years` : undefined },
    { label: 'Assignments Created', value: detail.assignmentsCreated },
    { label: 'Classes', value: detail.classes?.length },
    { label: 'Approval Email Error', value: detail.approval_email_error },
  ]

  const contentEntries = [
    { label: 'Title', value: detail.title || detail.class_name || detail.file_name || detail.question_text },
    { label: 'Subject', value: detail.subject },
    { label: 'Teacher Email', value: detail.teacher_email },
    { label: 'File Type', value: detail.file_type, badge: detail.file_type },
    { label: 'Description', value: detail.description },
  ]

  const activityEntries = [
    { label: 'Recent Activity Items', value: detail.activityHistory?.length },
    { label: 'Recent Activity', value: detail.activityHistory?.slice(0, 3).map((item) => item.message).join(', ') || undefined },
  ]

  const title = primary(detail)
  const subtitle = kind === 'teachers' ? 'Teacher application overview' : kind === 'students' ? 'Student account overview' : 'Record overview'

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <article className="admin-modal admin-modal--workspace" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <p className="admin-eyebrow">Detail View</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="admin-btn secondary" onClick={onClose}>Close</button>
        </div>
        <div className="admin-modal__content">
          <DetailSection title="Identity" entries={baseEntries} />
          {(kind === 'students') ? <DetailSection title="Student Workspace" entries={[...studentEntries, ...activityEntries]} /> : null}
          {(kind === 'teachers') ? <DetailSection title="Teacher Workspace" entries={[...teacherEntries, ...activityEntries]} /> : null}
          {!['students', 'teachers'].includes(kind) ? <DetailSection title="Record Information" entries={contentEntries} /> : null}
        </div>
      </article>
    </div>
  )
}

function downloadCsv(filename, rows) {
  const headers = Object.keys(rows[0] || {})
  const lines = [headers.join(',')]
  rows.forEach((row) => {
    const line = headers.map((header) => {
      const value = row[header]
      const text = Array.isArray(value) ? value.join('; ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
      return `"${text.replaceAll('"', '""')}"`
    }).join(',')
    lines.push(line)
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

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

  const remove = async (row) => {
    if (!window.confirm(`Permanently delete "${primary(row)}"?`)) return
    try {
      if (users) {
        await adminService.deleteUser(row._id)
      } else {
        await adminService.deleteContent(kind, row._id)
      }
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

  const inspect = async (row) => {
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

  const approveQuestion = async (row) => {
    try {
      await adminService.approveQuestion(row._id)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Approval failed')
    }
  }

  const assignTeacher = async (row) => {
    const email = window.prompt('Teacher email', row.teacher_email || '')
    if (!email) return
    try {
      await adminService.assignTeacher(row._id, email)
      load()
    } catch (e) {
      setError(e.response?.data?.detail || 'Assignment failed')
    }
  }

  const pendingTeachers = kind === 'teachers' ? rows.filter((row) => row.status === 'pending') : []
  const approvedTeachers = kind === 'teachers' ? rows.filter((row) => ['approved', 'active', undefined].includes(row.status)).length : 0
  const rejectedTeachers = kind === 'teachers' ? rows.filter((row) => row.status === 'rejected').length : 0

  const summaryCards = useMemo(() => {
    if (kind === 'students') {
      return [
        { label: 'Total Students', value: formatNumber(rows.length), hint: 'Student accounts in this view', tone: 'students', icon: Users },
      ]
    }
    if (kind === 'teachers') {
      return [
        { label: 'Total Teachers', value: formatNumber(rows.length), hint: 'All teacher records in this view', tone: 'teachers', icon: Users },
        { label: 'Pending Approvals', value: formatNumber(pendingTeachers.length), hint: 'Teacher applications awaiting review', tone: 'pending', icon: UserPlus },
        { label: 'Approved Teachers', value: formatNumber(approvedTeachers), hint: 'Approved teaching accounts', tone: 'approved', icon: UserCheck },
        { label: 'Rejected Teachers', value: formatNumber(rejectedTeachers), hint: 'Declined teacher applications', tone: 'rejected', icon: UserX },
      ]
    }
    return []
  }, [kind, rows.length, pendingTeachers.length, approvedTeachers, rejectedTeachers])

  const actionButtons = (row, compact = false) => (
    <div className={`admin-actions ${compact ? 'admin-actions--tight' : ''}`}>
      <button className="admin-btn secondary" onClick={() => inspect(row)} title="View details">
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

  const teacherQueue = kind === 'teachers' ? (
    <article className="admin-panel admin-panel--workspace admin-approval-queue">
      <div className="admin-panel__header admin-panel__header--queue">
        <div>
          <p className="admin-eyebrow">Approval Queue</p>
          <h3>Teacher Approval Queue</h3>
          <p className="admin-panel__description">Review new teaching applications and resolve approvals quickly.</p>
        </div>
        <div className="admin-queue-summary">
          <span className="admin-status-chip admin-status-chip--pending"><i />{formatNumber(pendingTeachers.length)} pending</span>
        </div>
      </div>

      {pendingTeachers.length ? (
        <div className="admin-queue-list">
          {pendingTeachers.slice(0, 5).map((row) => (
            <div className="admin-queue-item" key={row._id}>
              <div className="admin-queue-item__identity">
                <strong>{primary(row)}</strong>
                <p>{row.email}</p>
              </div>
              <div className="admin-queue-item__meta">
                <span className="admin-badge pending">{row.subject || 'Pending Review'}</span>
                <span className="admin-queue-item__time">{formatDate(row.created_at)}</span>
              </div>
              <div className="admin-queue-item__actions">
                {actionButtons(row, true)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-queue-empty">
          <div className="admin-queue-empty__copy">
            <p className="admin-eyebrow">Queue Clear</p>
            <h4>All teacher applications are up to date</h4>
            <p>No pending approvals right now. New requests will land here as soon as they arrive.</p>
          </div>
        </div>
      )}
    </article>
  ) : null

  return (
    <section className="admin-page admin-workspace-page">
      <div className="admin-workspace-hero admin-workspace-hero--plain">
        <div>
          <p className="admin-workspace-hero__eyebrow">Collection</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {kind === 'students' ? (
          <button className="admin-btn" onClick={() => downloadCsv('students-export.csv', rows)} disabled={!rows.length}>
            <Download size={14} />
            Export Students
          </button>
        ) : null}
      </div>

      {summaryCards.length ? (
        <section className={`admin-metric-grid ${kind === 'teachers' ? 'admin-metric-grid--insights' : summaryCards.length === 1 ? 'admin-metric-grid--single' : 'admin-metric-grid--insights'}`}>
          {summaryCards.map((card) => <StatCard key={card.label} {...card} />)}
        </section>
      ) : null}

      {teacherQueue}

      <div className="admin-toolbar-card">
        <label className="admin-search-field admin-search-field--wide">
          <Search size={16} />
          <input className="admin-input admin-input--ghost" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} />
        </label>
        {users ? (
          <select className="admin-select admin-select--wide" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {kind === 'teachers' ? <><option>pending</option><option>approved</option><option>rejected</option></> : <><option>active</option><option>suspended</option></>}
          </select>
        ) : null}
      </div>

      {notice ? <div className="admin-notice">{notice}</div> : null}
      {error ? <div className="admin-error-banner">{error}</div> : null}

      {loading ? <div className="admin-empty">Loading records...</div> : (
        <div className="admin-table-wrap admin-table-wrap--elevated admin-table-wrap--workspace">
          <table className={`admin-table ${kind === 'teachers' ? 'admin-table--teachers' : ''}`}>
            <thead><tr><th>Name / Title</th><th>Owner / Context</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td><div className="admin-table-primary"><strong>{primary(row)}</strong></div></td>
                  <td>{secondary(row)}</td>
                  <td><span className={`admin-badge ${statusClass(row.status || row.role || row.file_type)}`}>{sentenceCase(recordStatus(row))}</span></td>
                  <td>{formatDate(row.created_at)}</td>
                  <td>{actionButtons(row)}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan="5">
                    <div className="admin-empty admin-empty--workspace">
                      <h3>No {title.toLowerCase()} found</h3>
                      <p>Try a broader search or adjust your active filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail ? <DetailModal detail={detail} kind={kind} onClose={() => setDetail(null)} /> : null}
    </section>
  )
}
