import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  History,
  MessageSquareText,
  PlayCircle,
  TrendingUp,
} from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, EmptyState, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'
import { ProgressRing } from '../../components/studentDashboard/AnalyticsCharts'
import { buildStudentId, getEducationDetails } from '../../utils/studentDashboardData'

function StatTile({ icon: Icon, label, value, hint, to, delay = 0 }) {
  const content = (
    <DashboardCard delay={delay} className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-primary/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-text">{value}</p>
          {hint && <p className="mt-2 text-sm text-gray-500">{hint}</p>}
        </div>
        <div className="rounded-2xl bg-green-primary/10 p-3 text-green-primary transition group-hover:bg-green-primary group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </DashboardCard>
  )

  return to ? <Link to={to} className="block h-full">{content}</Link> : content
}

function QuickAction({ icon: Icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-green-primary/10 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-primary/25 hover:shadow-lg hover:shadow-green-primary/10"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-green-primary/10 p-3 text-green-primary transition group-hover:bg-green-primary group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-text">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:text-green-primary" />
    </Link>
  )
}

function CompactList({ items, emptyTitle, emptyMessage, renderItem }) {
  if (!items.length) {
    return <EmptyState icon={History} title={emptyTitle} message={emptyMessage} />
  }

  return <div className="divide-y divide-green-primary/10">{items.map(renderItem)}</div>
}

const activityLabels = {
  tutor: 'AI Tutor',
  voice: 'Voice lesson',
  exam: 'Practice exam',
  notes: 'Notes',
  assignment: 'Assignment',
  chat: 'Chat',
}

export default function StudentDashboard() {
  const { dashboard } = useStudentWorkspace()
  const { student, overview, recentActivity, analytics } = dashboard
  const education = getEducationDetails(student)
  const studentId = buildStudentId(student)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[1.75rem] border border-green-primary/10 bg-gradient-to-br from-green-primary via-green-secondary to-[#1f5d45] text-white shadow-2xl shadow-green-primary/20">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Student dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {student.name.split(' ')[0]}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              A focused overview of your learning progress, recent activity, and the fastest paths back into study mode.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Student ID</p>
                <p className="mt-2 text-xl font-bold">{studentId}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">{education.institutionType}</p>
                <p className="mt-2 truncate font-bold">{education.institutionName}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Study streak</p>
                <p className="mt-2 text-xl font-bold">{overview.studyStreak} days</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 text-text shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500">Overall progress</p>
                <p className="mt-1 text-sm text-gray-400">Assignments, exams, and tutor activity combined</p>
              </div>
              <ProgressRing value={overview.overallProgress} label="" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-cream px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Pending</p>
                <p className="mt-1 text-2xl font-bold text-text">{overview.pendingAssignments}</p>
              </div>
              <div className="rounded-xl bg-cream px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Submitted</p>
                <p className="mt-1 text-2xl font-bold text-text">{overview.submittedAssignments}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Overview" title="Learning statistics" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatTile delay={0.05} icon={GraduationCap} label="Lessons completed" value={overview.lessonsCompleted || 0} hint="Voice learning sessions" to="/student/voice-learning" />
          <StatTile delay={0.1} icon={MessageSquareText} label="Tutor sessions" value={overview.tutorSessions || 0} hint="AI tutor conversations" to="/student/tutor" />
          <StatTile delay={0.15} icon={BookOpen} label="Practice exams" value={overview.practiceExamsAttempted || 0} hint="Attempts recorded" to="/student/exams" />
          <StatTile delay={0.2} icon={TrendingUp} label="Average score" value={`${overview.averageExamScore || 0}%`} hint="Across practice exams" to="/student/analytics" />
          <StatTile delay={0.25} icon={Clock3} label="Study time" value={overview.studyTimeLabel || '0m'} hint="Estimated learning time" to="/student/analytics" />
          <StatTile delay={0.3} icon={CheckCircle2} label="Recent activity" value={overview.totalActivities || 0} hint="Tracked learning events" to="/student/history" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard className="p-6">
          <SectionHeader eyebrow="Actions" title="Quick actions" />
          <div className="grid gap-3">
            <QuickAction icon={PlayCircle} title="Continue learning" description="Resume your latest voice lesson or tutor chat" to="/student/history" />
            <QuickAction icon={GraduationCap} title="Start new lesson" description="Open Voice Learning with a fresh lesson" to="/student/voice-learning" />
            <QuickAction icon={BookOpen} title="Take practice exam" description="Launch a new practice exam session" to="/student/exams" />
            <QuickAction icon={History} title="View history" description="Browse tutor, voice, and exam activity" to="/student/history" />
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Timeline</p>
              <h2 className="text-xl font-bold text-text">Recent activity</h2>
            </div>
            <Link to="/student/history" className="text-sm font-bold text-green-primary">View all</Link>
          </div>
          <CompactList
            items={recentActivity}
            emptyTitle="No activity yet"
            emptyMessage="Your tutor chats, voice lessons, and exam attempts will appear here."
            renderItem={(activity) => (
              <div key={activity.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-text">{activity.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {activityLabels[activity.type] || activity.type}
                    {activity.createdAt ? ` · ${new Date(activity.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
            )}
          />
        </DashboardCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardCard className="p-6">
          <SectionHeader eyebrow="Performance" title="Strong subjects" />
          <div className="flex flex-wrap gap-2">
            {analytics.strongSubjects.length ? analytics.strongSubjects.map((subject) => (
              <span key={subject} className="rounded-full bg-green-primary/10 px-4 py-2 text-sm font-bold text-green-primary">
                {subject}
              </span>
            )) : <p className="text-sm text-gray-500">Complete more evaluated work to unlock subject insights.</p>}
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <SectionHeader eyebrow="Focus areas" title="Weak topics" />
          <div className="flex flex-wrap gap-2">
            {overview.weakTopics?.length ? overview.weakTopics.map((topic) => (
              <Link
                key={topic}
                to={`/student/tutor?teach=${encodeURIComponent(topic)}`}
                className="rounded-full bg-gold/15 px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-gold/25"
              >
                {topic}
              </Link>
            )) : <p className="text-sm text-gray-500">No weak areas detected yet.</p>}
          </div>
          {overview.weakTopics?.length > 0 && (
            <Link
              to={`/student/tutor?teach=${encodeURIComponent(overview.weakTopics.join(', '))}`}
              className="mt-5 inline-flex rounded-xl bg-green-primary px-4 py-2.5 text-sm font-bold text-white"
            >
              Teach me again
            </Link>
          )}
        </DashboardCard>
      </section>
    </div>
  )
}
