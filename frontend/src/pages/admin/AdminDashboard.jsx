import { useEffect, useState } from 'react'
import {
  Activity,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import adminService from '../../services/adminService'

const kpiCards = [
  { key: 'totalStudents', label: 'Total Students', hint: 'Learners on platform', icon: GraduationCap, tone: 'students' },
  { key: 'totalTeachers', label: 'Total Teachers', hint: 'Teaching accounts', icon: Users, tone: 'teachers' },
  { key: 'totalClasses', label: 'Total Classes', hint: 'Active class spaces', icon: Building2, tone: 'classes' },
  { key: 'totalAssignments', label: 'Total Assignments', hint: 'Published coursework', icon: ClipboardList, tone: 'assignments' },
  { key: 'pendingTeachers', label: 'Pending Approvals', hint: 'Teacher applications waiting', icon: UserPlus, tone: 'pending' },
  { key: 'totalResources', label: 'Total Resources', hint: 'Learning assets stored', icon: Database, tone: 'resources' },
]

const insightCards = [
  { key: 'activeUsers', label: 'Active Users', hint: 'Signed in within 24 hours', icon: Activity, tone: 'activity' },
  { key: 'approvedTeachers', label: 'Approved Teachers', hint: 'Ready to teach', icon: UserCheck, tone: 'approved' },
  { key: 'rejectedTeachers', label: 'Rejected Teachers', hint: 'Application declines', icon: XCircle, tone: 'rejected' },
  { key: 'platformUsage', label: 'Platform Usage', hint: 'Tracked AI interactions', icon: Sparkles, tone: 'usage' },
]

const healthMeta = {
  api: { label: 'API Status', icon: Activity },
  database: { label: 'Database Status', icon: Database },
  ai: { label: 'AI Status', icon: Bot },
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(value) {
  if (!value) return 'No timestamp available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No timestamp available'
  return date.toLocaleString()
}

function getInitials(name) {
  if (!name) return 'AD'
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AD'
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <article className={`admin-metric-card admin-tone-${tone}`}>
      <div className="admin-metric-card__header">
        <div>
          <p className="admin-eyebrow">{label}</p>
          <strong>{formatNumber(value)}</strong>
        </div>
        <div className="admin-metric-card__icon">
          <Icon size={20} />
        </div>
      </div>
      <p className="admin-metric-card__hint">{hint}</p>
    </article>
  )
}

function LoadingCard() {
  return (
    <article className="admin-metric-card admin-metric-card--loading" aria-hidden="true">
      <div className="admin-loading-line admin-loading-line--sm" />
      <div className="admin-loading-line admin-loading-line--lg" />
      <div className="admin-loading-line admin-loading-line--md" />
    </article>
  )
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state__icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

function PanelList({ items, renderItem, emptyTitle, emptyMessage, emptyIcon: EmptyIcon }) {
  if (!items.length) {
    return <EmptyState icon={EmptyIcon} title={emptyTitle} message={emptyMessage} />
  }

  return <div className="admin-panel-list">{items.map(renderItem)}</div>
}

function PanelLoading() {
  return (
    <div className="admin-panel-list">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="admin-list-item admin-list-item--loading" key={index} aria-hidden="true">
          <div className="admin-list-item__main">
            <div className="admin-loading-line admin-loading-line--md" />
            <div className="admin-loading-line admin-loading-line--sm" />
          </div>
          <div className="admin-loading-pill" />
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService
      .dashboard()
      .then((response) => setData(response.data))
      .catch((err) => setError(err.response?.data?.detail || 'Unable to load dashboard'))
  }, [])

  const adminName = user?.name || 'Administrator'
  const adminRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'
  const healthEntries = Object.entries(data?.systemHealth || { api: 'operational', database: 'operational', ai: 'operational' })
  const registrations = data?.recentRegistrations || []
  const activities = data?.recentActivities || []

  return (
    <section className="admin-page admin-dashboard">
      <section className="admin-hero">
        <div className="admin-hero__content">
          <p className="admin-hero__eyebrow">Admin workspace</p>
          <h1>Welcome back, Administrator</h1>
          <p className="admin-hero__description">
            Manage platform operations, users, approvals and system health from one place.
          </p>

          <div className="admin-hero__profile">
            <div className="admin-hero__avatar">{getInitials(adminName)}</div>
            <div className="admin-hero__identity">
              <strong>{adminName}</strong>
              <div className="admin-hero__meta">
                <span>Role: {adminRole}</span>
                <span>Access: Full Access</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="admin-health-card">
          <div className="admin-health-card__header">
            <div>
              <p className="admin-eyebrow admin-eyebrow--light">System Health</p>
              <h2>Operational overview</h2>
            </div>
            <span className="admin-status-chip admin-status-chip--hero">
              <CheckCircle2 size={16} />
              Stable
            </span>
          </div>

          <div className="admin-health-list">
            {healthEntries.map(([key, status]) => {
              const normalizedStatus = String(status || 'unknown').toLowerCase()
              const meta = healthMeta[key] || { label: key.toUpperCase(), icon: ShieldCheck }
              const Icon = meta.icon

              return (
                <div className="admin-health-row" key={key}>
                  <div className="admin-health-row__service">
                    <div className="admin-health-row__icon">
                      <Icon size={16} />
                    </div>
                    <span>{meta.label}</span>
                  </div>
                  <span className={`admin-status-chip admin-status-chip--${normalizedStatus}`}>
                    <i />
                    {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                  </span>
                </div>
              )
            })}
          </div>
        </aside>
      </section>

      {error ? <div className="admin-error-banner">{error}</div> : null}

      <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <p className="admin-section__eyebrow">Overview</p>
            <h2>Core platform KPIs</h2>
          </div>
        </div>
        <div className="admin-metric-grid">
          {data
            ? kpiCards.map((card) => <MetricCard key={card.key} {...card} value={data[card.key]} />)
            : Array.from({ length: kpiCards.length }).map((_, index) => <LoadingCard key={index} />)}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <p className="admin-section__eyebrow">Workspace</p>
            <h2>Recent registrations and activity</h2>
          </div>
        </div>

        <div className="admin-workspace-grid">
          <article className="admin-panel admin-panel--workspace">
            <div className="admin-panel__header">
              <div>
                <p className="admin-eyebrow">New users</p>
                <h3>Recent Registrations</h3>
              </div>
              <span className="admin-panel__count">{formatNumber(registrations.length)}</span>
            </div>

            {data ? (
              <PanelList
                items={registrations}
                emptyTitle="No recent registrations"
                emptyMessage="New student and teacher signups will appear here."
                emptyIcon={UserPlus}
                renderItem={(entry) => (
                  <div className="admin-list-item" key={entry._id || entry.email}>
                    <div className="admin-list-item__main">
                      <strong>{entry.name || entry.email || 'Unknown user'}</strong>
                      <p>{entry.email || 'Email unavailable'}</p>
                    </div>
                    <div className="admin-list-item__meta">
                      <span className={`admin-badge ${String(entry.role || '').toLowerCase()}`}>{entry.role || 'User'}</span>
                      <time>{formatDate(entry.created_at)}</time>
                    </div>
                  </div>
                )}
              />
            ) : (
              <PanelLoading />
            )}
          </article>

          <article className="admin-panel admin-panel--workspace">
            <div className="admin-panel__header">
              <div>
                <p className="admin-eyebrow">Timeline</p>
                <h3>Recent Activity</h3>
              </div>
              <span className="admin-panel__count">{formatNumber(activities.length)}</span>
            </div>

            {data ? (
              <PanelList
                items={activities}
                emptyTitle="No recent activity"
                emptyMessage="Administrative actions and system events will appear here."
                emptyIcon={Activity}
                renderItem={(entry) => (
                  <div className="admin-list-item" key={entry._id || `${entry.message}-${entry.created_at}`}>
                    <div className="admin-list-item__main">
                      <strong>{entry.message || 'Activity recorded'}</strong>
                      <p>{entry.actor || entry.type || 'System event'}</p>
                    </div>
                    <div className="admin-list-item__meta">
                      <span className="admin-badge neutral">{entry.type || 'log'}</span>
                      <time>{formatDate(entry.created_at)}</time>
                    </div>
                  </div>
                )}
              />
            ) : (
              <PanelLoading />
            )}
          </article>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__header">
          <div>
            <p className="admin-section__eyebrow">Insights</p>
            <h2>Platform health and adoption</h2>
          </div>
        </div>
        <div className="admin-metric-grid admin-metric-grid--insights">
          {data
            ? insightCards.map((card) => <MetricCard key={card.key} {...card} value={data[card.key]} />)
            : Array.from({ length: insightCards.length }).map((_, index) => <LoadingCard key={index} />)}
        </div>
      </section>
    </section>
  )
}
