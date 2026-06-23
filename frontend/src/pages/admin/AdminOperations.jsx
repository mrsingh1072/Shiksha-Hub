import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  BellRing,
  Bot,
  Brain,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  GraduationCap,
  LayoutList,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
  Wand2,
} from 'lucide-react'
import adminService from '../../services/adminService'

const titles = {
  analytics: ['Analytics', 'Growth and activity indicators across the learning platform.'],
  ai: ['AI Monitoring', 'AI feature demand and provider telemetry.'],
  logs: ['System Logs', 'Security and platform audit trail.'],
  profile: ['Admin Profile', 'Identity is supplied by protected server configuration.'],
  settings: ['System Settings', 'Deployment-managed platform and security configuration.'],
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

function sentenceCase(value) {
  const text = String(value || '').replace(/[_-]/g, ' ').trim()
  if (!text) return 'Unknown'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function statusClass(value) {
  const normalized = String(value || '').toLowerCase()
  if (['operational', 'active', 'enabled', 'healthy', 'managed', 'stable'].includes(normalized)) return 'active'
  if (['disabled', 'rejected', 'failed', 'inactive', 'error', 'down'].includes(normalized)) return 'rejected'
  if (['pending', 'warning'].includes(normalized)) return 'pending'
  return 'neutral'
}

function StatCard({ icon: Icon, label, value, hint, tone = 'students' }) {
  return (
    <article className={`admin-metric-card admin-tone-${tone}`}>
      <div className="admin-metric-card__header">
        <div>
          <p className="admin-eyebrow">{label}</p>
          <strong>{value}</strong>
        </div>
        <div className="admin-metric-card__icon">
          <Icon size={20} />
        </div>
      </div>
      {hint ? <p className="admin-metric-card__hint">{hint}</p> : null}
    </article>
  )
}

function LoadingGrid({ count = 4 }) {
  return (
    <div className="admin-metric-grid">
      {Array.from({ length: count }).map((_, index) => (
        <article className="admin-metric-card admin-metric-card--loading" key={index} aria-hidden="true">
          <div className="admin-loading-line admin-loading-line--sm" />
          <div className="admin-loading-line admin-loading-line--lg" />
          <div className="admin-loading-line admin-loading-line--md" />
        </article>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state__icon"><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

function ChartPlaceholder({ title, description, data = [], colorClass = 'admin-chart-bar' }) {
  const bars = data.length ? data.slice(-8) : Array.from({ length: 8 }).map((_, index) => ({ date: `P${index + 1}`, value: 0 }))
  const maxValue = Math.max(...bars.map((item) => Number(item.value || 0)), 1)

  return (
    <article className="admin-panel admin-chart-card">
      <div className="admin-panel__header">
        <div>
          <p className="admin-eyebrow">Trend</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="admin-panel__description">{description}</p>
      <div className="admin-chart">
        {bars.map((item, index) => {
          const height = Math.max(12, Math.round((Number(item.value || 0) / maxValue) * 100))
          return (
            <div className="admin-chart__column" key={`${item.date || item._id || 'point'}-${index}`}>
              <div className={`${colorClass}`} style={{ height: `${height}%` }} title={`${item.date || 'Point'}: ${formatNumber(item.value)}`} />
              <span>{String(item.date || item._id || index + 1).slice(5) || item.date || `P${index + 1}`}</span>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="admin-section__header">
      <div>
        <p className="admin-section__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description ? <p className="admin-section__description">{description}</p> : null}
      </div>
    </div>
  )
}

function AnalyticsView({ data }) {
  const studentGrowth = data?.studentGrowth || []
  const teacherGrowth = data?.teacherGrowth || []
  const examActivity = data?.examActivity || []
  const assignmentActivity = data?.assignmentActivity || []
  const mostActiveClasses = data?.mostActiveClasses || []
  const aiRequests = data?.aiRequests || 0
  const attendanceRecords = data?.attendanceRecords || 0

  return (
    <div className="admin-workspace-stack">
      <section className="admin-section">
        <SectionHeader eyebrow="Overview" title="Platform analytics" description="Growth, engagement, and instructional activity across EduVerse AI." />
        <div className="admin-metric-grid admin-metric-grid--insights">
          <StatCard icon={GraduationCap} label="Student Growth" value={formatNumber(studentGrowth.reduce((sum, item) => sum + Number(item.value || 0), 0))} hint="New student registrations tracked" tone="students" />
          <StatCard icon={Users} label="Teacher Growth" value={formatNumber(teacherGrowth.reduce((sum, item) => sum + Number(item.value || 0), 0))} hint="Teacher applications and onboarding" tone="teachers" />
          <StatCard icon={Sparkles} label="AI Requests" value={formatNumber(aiRequests)} hint="Tutor and teaching AI demand" tone="usage" />
          <StatCard icon={CheckCircle2} label="Attendance Records" value={formatNumber(attendanceRecords)} hint="Attendance submissions stored" tone="approved" />
        </div>
      </section>

      <section className="admin-section">
        <SectionHeader eyebrow="Trends" title="Growth and activity charts" />
        <div className="admin-two-column-grid">
          <ChartPlaceholder title="Student Growth" description="Recent student registrations." data={studentGrowth} colorClass="admin-chart-bar admin-chart-bar--primary" />
          <ChartPlaceholder title="Teacher Growth" description="Recent teacher registrations." data={teacherGrowth} colorClass="admin-chart-bar admin-chart-bar--secondary" />
          <ChartPlaceholder title="Exam Activity" description="Exam creation volume over time." data={examActivity} colorClass="admin-chart-bar admin-chart-bar--teal" />
          <ChartPlaceholder title="Assignment Activity" description="Assignment publishing volume over time." data={assignmentActivity} colorClass="admin-chart-bar admin-chart-bar--gold" />
        </div>
      </section>

      <section className="admin-section admin-two-column-grid admin-two-column-grid--balanced">
        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Engagement</p>
              <h3>AI Usage</h3>
            </div>
            <div className="admin-metric-card__icon admin-tone-usage"><Sparkles size={20} /></div>
          </div>
          <p className="admin-panel__description">Combined AI tutor and teacher-side assistant demand.</p>
          <div className="admin-spotlight-stat">
            <strong>{formatNumber(aiRequests)}</strong>
            <span>Total AI requests recorded</span>
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Classes</p>
              <h3>Most Active Classes</h3>
            </div>
            <span className="admin-panel__count">{formatNumber(mostActiveClasses.length)}</span>
          </div>
          {mostActiveClasses.length ? (
            <div className="admin-panel-list">
              {mostActiveClasses.map((item) => (
                <div className="admin-list-item" key={item._id || item.class_name}>
                  <div className="admin-list-item__main">
                    <strong>{item.class_name || item.title || 'Untitled class'}</strong>
                    <p>{item.subject || item.teacher_email || 'Context unavailable'}</p>
                  </div>
                  <div className="admin-list-item__meta">
                    <span className="admin-badge neutral">{formatNumber(item.student_count || item.students?.length || 0)} learners</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Building2} title="No active classes yet" message="Class activity will appear here when classes begin recording participation." />
          )}
        </article>
      </section>
    </div>
  )
}

function AiMonitoringView({ data }) {
  const stats = [
    { label: 'Tutor Requests', value: formatNumber(data?.tutorRequests), icon: Bot, tone: 'students', hint: 'Student tutor conversations' },
    { label: 'Voice Requests', value: formatNumber(data?.voiceRequests), icon: Brain, tone: 'activity', hint: 'Voice and avatar sessions' },
    { label: 'Exam Generation', value: formatNumber(data?.examGenerationRequests), icon: Wand2, tone: 'assignments', hint: 'AI-assisted exam creation' },
    { label: 'Teacher AI Requests', value: formatNumber(data?.teacherAIRequests), icon: Users, tone: 'teachers', hint: 'Teacher assistant demand' },
    { label: 'Total Requests', value: formatNumber(data?.totalRequests), icon: Sparkles, tone: 'usage', hint: 'Combined AI workload' },
  ]

  return (
    <div className="admin-workspace-stack">
      <section className="admin-section">
        <SectionHeader eyebrow="Monitoring" title="AI operations" description="A focused view of AI demand, service posture, and provider readiness." />
        <div className="admin-metric-grid admin-metric-grid--five">
          {stats.map((item) => <StatCard key={item.label} {...item} />)}
        </div>
      </section>

      <section className="admin-section admin-three-column-grid">
        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Usage</p>
              <h3>Token Consumption</h3>
            </div>
            <Database size={18} />
          </div>
          <p className="admin-panel__description">Provider-side token telemetry currently supplied by backend configuration.</p>
          <div className="admin-settings-list">
            <div className="admin-settings-row">
              <span>Telemetry</span>
              <strong>{data?.tokenConsumption || 'Provider telemetry not configured'}</strong>
            </div>
            <div className="admin-settings-row">
              <span>Collection</span>
              <span className="admin-badge pending">Managed by backend</span>
            </div>
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Provider</p>
              <h3>Provider Status</h3>
            </div>
            <ShieldCheck size={18} />
          </div>
          <div className="admin-health-list admin-health-list--compact">
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><Bot size={16} /></div><span>Inference Provider</span></div>
              <span className="admin-status-chip admin-status-chip--operational"><i />Operational</span>
            </div>
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><Database size={16} /></div><span>Telemetry Feed</span></div>
              <span className="admin-status-chip admin-status-chip--pending"><i />Managed</span>
            </div>
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Health</p>
              <h3>AI Health Status</h3>
            </div>
            <Activity size={18} />
          </div>
          <div className="admin-health-list admin-health-list--compact">
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><Sparkles size={16} /></div><span>Request Flow</span></div>
              <span className="admin-status-chip admin-status-chip--operational"><i />Healthy</span>
            </div>
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><Clock3 size={16} /></div><span>Latency Watch</span></div>
              <span className="admin-status-chip admin-status-chip--pending"><i />Monitor</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

function LogsView({ data }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const logs = Array.isArray(data) ? data : []

  const eventTypes = useMemo(() => [...new Set(logs.map((item) => item.type).filter(Boolean))], [logs])
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const haystack = [item.message, item.actor, item.type].join(' ').toLowerCase()
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase())
      return matchesType && matchesSearch
    })
  }, [logs, search, typeFilter])

  return (
    <div className="admin-workspace-stack">
      <section className="admin-section">
        <SectionHeader eyebrow="Audit" title="System logs" description="Search and filter platform events without dropping into raw log output." />
        <div className="admin-toolbar-card">
          <label className="admin-search-field">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, users, or log types" className="admin-input admin-input--ghost" />
          </label>
          <select className="admin-select admin-select--wide" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All event types</option>
            {eventTypes.map((type) => <option key={type} value={type}>{sentenceCase(type)}</option>)}
          </select>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-table-wrap admin-table-wrap--elevated">
          <table className="admin-table admin-table--logs">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((item) => (
                <tr key={item._id || `${item.type}-${item.created_at}`}>
                  <td>
                    <div className="admin-table-primary">
                      <strong>{item.message || 'Event recorded'}</strong>
                    </div>
                  </td>
                  <td><span className={`admin-badge ${statusClass(item.type)}`}>{sentenceCase(item.type)}</span></td>
                  <td>{item.actor || 'System'}</td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
              {!filteredLogs.length && (
                <tr>
                  <td colSpan="4">
                    <EmptyState icon={LayoutList} title="No logs match this view" message="Try adjusting your search or filter to reveal additional audit events." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ProfileView({ data }) {
  return (
    <div className="admin-workspace-stack">
      <section className="admin-section admin-two-column-grid admin-two-column-grid--balanced">
        <article className="admin-panel admin-panel--workspace admin-profile-card">
          <div className="admin-profile-card__avatar">
            {(data?.name || 'Platform Administrator').split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="admin-eyebrow">Administrator</p>
            <h3>{data?.name || 'Platform Administrator'}</h3>
            <p className="admin-panel__description">{data?.email || 'No admin email configured'}</p>
          </div>
          <div className="admin-profile-card__meta">
            <span className="admin-badge active">Admin</span>
            <span className={`admin-badge ${statusClass(data?.configurationManaged ? 'managed' : 'pending')}`}>
              {data?.configurationManaged ? 'Configuration managed' : 'Configuration pending'}
            </span>
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Status</p>
              <h3>System Status</h3>
            </div>
            <Shield size={18} />
          </div>
          <div className="admin-health-list admin-health-list--compact">
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><ShieldCheck size={16} /></div><span>Admin Access</span></div>
              <span className="admin-status-chip admin-status-chip--operational"><i />Verified</span>
            </div>
            <div className="admin-health-row">
              <div className="admin-health-row__service"><div className="admin-health-row__icon"><Settings2 size={16} /></div><span>Security Status</span></div>
              <span className="admin-status-chip admin-status-chip--operational"><i />Protected</span>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-section">
        <SectionHeader eyebrow="Details" title="Account details" />
        <div className="admin-detail-grid admin-detail-grid--workspace">
          <div><span>Configuration Level</span><strong>{data?.configurationManaged ? 'Managed configuration' : 'Manual configuration'}</strong></div>
          <div><span>Access Type</span><strong>Full Access</strong></div>
          <div><span>Permissions</span><strong>User management, moderation, analytics, system controls</strong></div>
          <div><span>Role</span><strong>Administrator</strong></div>
        </div>
      </section>
    </div>
  )
}

function SettingRow({ label, value, enabled }) {
  return (
    <div className="admin-settings-row">
      <div>
        <strong>{label}</strong>
        <p>{value}</p>
      </div>
      <button type="button" className={`admin-toggle ${enabled ? 'active' : ''}`} aria-pressed={enabled} disabled />
    </div>
  )
}

function SettingsView({ data }) {
  return (
    <div className="admin-workspace-stack">
      <section className="admin-section admin-two-column-grid admin-two-column-grid--balanced">
        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Platform</p><h3>Platform settings</h3></div><Building2 size={18} /></div>
          <div className="admin-settings-list">
            <div className="admin-settings-row"><span>Platform Name</span><strong>{data?.platformName || 'EduVerse AI'}</strong></div>
            <div className="admin-settings-row"><span>Environment</span><span className={`admin-badge ${statusClass(data?.environment === 'production' ? 'active' : 'pending')}`}>{sentenceCase(data?.environment || 'development')}</span></div>
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Session</p><h3>Session settings</h3></div><CalendarClock size={18} /></div>
          <div className="admin-settings-list">
            <div className="admin-settings-row"><span>Session Duration</span><strong>{formatNumber(data?.sessionHours)} hours</strong></div>
            <div className="admin-settings-row"><span>Configuration Mode</span><span className="admin-badge active">Server managed</span></div>
          </div>
        </article>
      </section>

      <section className="admin-section admin-two-column-grid admin-two-column-grid--balanced">
        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Notifications</p><h3>Notification settings</h3></div><BellRing size={18} /></div>
          <div className="admin-settings-stack">
            <SettingRow label="Notifications" value="Platform-wide admin notices and operational updates" enabled={Boolean(data?.notificationsEnabled)} />
          </div>
        </article>

        <article className="admin-panel admin-panel--workspace">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Security</p><h3>Security settings</h3></div><Shield size={18} /></div>
          <div className="admin-settings-stack">
            <SettingRow label="Admin Registration" value="Controls whether new administrators can self-register" enabled={Boolean(data?.adminRegistration)} />
            <SettingRow label="Security Controls" value="Protected by backend role enforcement and deployment configuration" enabled />
          </div>
        </article>
      </section>
    </div>
  )
}


export function AdminOperationsPage({ mode }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [title, description] = titles[mode]

  useEffect(() => {
    const request = {
      analytics: adminService.analytics,
      ai: adminService.aiMonitoring,
      logs: adminService.logs,
      profile: adminService.profile,
      settings: adminService.settings,
    }[mode]

    request()
      .then((response) => setData(response.data))
      .catch((err) => setError(err.response?.data?.detail || 'Unable to load data'))
  }, [mode])

  const renderContent = () => {
    if (!data) {
      return <LoadingGrid count={mode === 'ai' ? 5 : 4} />
    }

    if (mode === 'analytics') return <AnalyticsView data={data} />
    if (mode === 'ai') return <AiMonitoringView data={data} />
    if (mode === 'logs') return <LogsView data={data} />
    if (mode === 'profile') return <ProfileView data={data} />
    if (mode === 'settings') return <SettingsView data={data} />
    return null
  }

  return (
    <section className="admin-page admin-workspace-page">
      <div className="admin-workspace-hero">
        <div>
          <p className="admin-workspace-hero__eyebrow">Operations</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {error ? <div className="admin-error-banner">{error}</div> : renderContent()}
    </section>
  )
}
