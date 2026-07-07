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
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import adminService from '../../services/adminService'



const overviewMeta = [
  { key: 'totalStudents', label: 'Total Students', icon: GraduationCap, getValue: (d) => d?.totalStudents || 0 },
  { key: 'totalTeachers', label: 'Total Teachers', icon: Users, getValue: (d) => d?.totalTeachers || 0 },
  { key: 'totalClasses', label: 'Total Classes', icon: Building2, getValue: (d) => d?.totalClasses || 0 },
]

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
  const registrations = data?.recentRegistrations || []
  const activities = data?.recentActivities || []

  return (
    <section className="admin-page admin-dashboard">
      <section className="admin-hero">
        <div className="admin-hero__content">
          <p className="admin-hero__eyebrow">Admin workspace</p>
          <h1>Welcome back, Administrator</h1>
          <p className="admin-hero__description">
            Manage your learning ecosystem, users, classes, AI services, and platform operations from one place.
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
              <p className="admin-eyebrow admin-eyebrow--light">Platform Overview</p>
              <h2 className="text-sm font-semibold mt-1">Real-time insights across your learning ecosystem</h2>
            </div>
            <span className="admin-status-chip admin-status-chip--hero">
              <Activity size={16} />
              Active
            </span>
          </div>

          <div className="admin-health-list">
            {overviewMeta.map((meta) => {
              const Icon = meta.icon
              const value = meta.getValue(data)

              return (
                <div className="admin-health-row" key={meta.key}>
                  <div className="admin-health-row__service">
                    <div className="admin-health-row__icon">
                      <Icon size={16} />
                    </div>
                    <span>{meta.label}</span>
                  </div>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-bold border border-green-100">
                    {formatNumber(value)}
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
            <p className="admin-section__eyebrow">Workspace</p>
            <h2>Recent registrations and activity</h2>
          </div>
        </div>

        <div className="admin-workspace-grid items-start">
          <article className="admin-panel admin-panel--workspace self-start">
            <div className="admin-panel__header">
              <div>
                <p className="admin-eyebrow">New users</p>
                <h3>Recent Registrations</h3>
              </div>
              <div className="flex items-center gap-3">
                {registrations.length > 3 && (
                  <button className="text-sm font-semibold text-green-primary hover:underline">
                    View All
                  </button>
                )}
                <span className="admin-panel__count">{formatNumber(registrations.length)}</span>
              </div>
            </div>

            {data ? (
              <PanelList
                items={[...registrations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)}
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

          <article className="admin-panel admin-panel--workspace self-start">
            <div className="admin-panel__header">
              <div>
                <p className="admin-eyebrow">Timeline</p>
                <h3>Recent Activity</h3>
              </div>
              <div className="flex items-center gap-3">
                {activities.length > 3 && (
                  <button className="text-sm font-semibold text-green-primary hover:underline">
                    View All
                  </button>
                )}
                <span className="admin-panel__count">{formatNumber(activities.length)}</span>
              </div>
            </div>

            {data ? (
              <PanelList
                items={[...activities].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3)}
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


    </section>
  )
}
