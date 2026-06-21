import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, ClipboardList, FileText, Clock,
  TrendingUp, Plus, CalendarCheck, Megaphone, BarChart3,
  ArrowRight, BookOpen, Bot, CheckCircle, AlertCircle
} from 'lucide-react'

export default function TeacherDashboard() {
  const { dashboard } = useOutletContext()

const navigate = useNavigate()

const performancePercentage =
  dashboard?.submissionsReceived > 0
    ? Math.round(
        ((dashboard.submissionsReceived - dashboard.pendingReviews) /
          dashboard.submissionsReceived) *
          100
      )
    : 0

    const stats = [
  {
    label: 'Total Submissions',
    value: dashboard?.submissionsReceived || 0,
    icon: FileText,
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    label: 'Avg Student Score',
    value: dashboard?.averageScore ? `${dashboard.averageScore}%` : '0%',
    icon: TrendingUp,
    color: '#dc2626',
    bg: '#fef2f2',
  },
]

  const quickActions = [
    { label: 'Create Class', icon: GraduationCap, path: '/teacher/classes', color: '#2F5D50' },
    { label: 'Create Assignment', icon: ClipboardList, path: '/teacher/assignments', color: '#6B8E23' },
    { label: 'Create Exam', icon: FileText, path: '/teacher/exams', color: '#0891b2' },
    { label: 'Take Attendance', icon: CalendarCheck, path: '/teacher/attendance', color: '#059669' },
    { label: 'Announcement', icon: Megaphone, path: '/teacher/announcements', color: '#d97706' },
    { label: 'AI Assistant', icon: Bot, path: '/teacher/ai-assistant', color: '#dc2626' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'submission': return <FileText className="h-4 w-4" />
      case 'announcement': return <Megaphone className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'submission': return '#2F5D50'
      case 'announcement': return '#d97706'
      default: return '#059669'
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diff = now - date
      const mins = Math.floor(diff / 60000)
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    } catch {
      return ''
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
  variants={itemVariants}
  className="relative overflow-hidden rounded-[1.75rem] border border-green-primary/10 shadow-2xl shadow-green-primary/20 min-h-[420px]"
  style={{
    background: 'linear-gradient(135deg, #2F5D50 0%, #3d7a6a 50%, #6B8E23 100%)',
  }}
>
  <div className="grid items-start gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">

    {/* Left Side */}
    <div className="relative z-10 lex flex-col justify-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
        Teacher Dashboard
      </p>

      <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
        Welcome back, {dashboard?.teacherName || 'Teacher'} 👋
      </h1>

      <p className="mt-3 text-green-100 text-sm md:text-base max-w-2xl">
        Manage classes, assignments, submissions and student progress from one place.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Teacher ID
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {dashboard?.teacherId || 'N/A'}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Qualification
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {dashboard?.qualification?.toUpperCase() || 'N/A'}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Experience
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {dashboard?.experience || 0} Years
          </p>
        </div>
      </div>
    </div>

    {/* Right Side */}
    <div className="rounded-[1.5rem] bg-white p-5 shadow-xl">
  <div className="grid grid-cols-[1fr_auto] gap-6 items-center">
    <div>
      <h3 className="text-lg font-bold text-slate-800">
        Teaching Performance
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Review completion rate
      </p>
    </div>

    <div className="relative flex h-36 w-36 items-center justify-center mx-auto">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#E5E7EB"
          strokeWidth="10"
          fill="none"
        />

        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="#2F5D50"
          strokeWidth="10"
          fill="none"
          strokeDasharray="314"
          strokeDashoffset={
            314 - (314 * performancePercentage) / 100
          }
          strokeLinecap="round"
        />
      </svg>

      <span className="text-4xl font-bold text-green-primary">
        {performancePercentage}%
      </span>
    </div>
  </div>

  <div className="mt-5 grid grid-cols-2 gap-3">
  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Students</p>
    <p className="text-2xl font-bold">
      {dashboard?.totalStudents || 0}
    </p>
  </div>

  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Classes</p>
    <p className="text-2xl font-bold">
      {dashboard?.totalClasses || 0}
    </p>
  </div>

  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Assignments</p>
    <p className="text-2xl font-bold">
      {dashboard?.assignmentsCreated || 0}
    </p>
  </div>

  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Pending Reviews</p>
    <p className="text-2xl font-bold">
      {dashboard?.pendingReviews || 0}
    </p>
  </div>

  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Submissions</p>
    <p className="text-2xl font-bold">
      {dashboard?.submissionsReceived || 0}
    </p>
  </div>

  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs text-slate-400">Avg Score</p>
    <p className="text-2xl font-bold">
      {dashboard?.averageScore || 0}%
    </p>
  </div>
</div>
</div>

  </div>

  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
</motion.div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="teacher-stat-card"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: stat.bg }}
              >
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <span className="text-xs font-semibold text-green-primary bg-green-primary/10 px-2.5 py-1 rounded-full">
              Live Feed
            </span>
          </div>
          <div className="p-5">
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-1">
                {dashboard.recentActivity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="teacher-activity-item">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: getActivityColor(activity.type) + '15',
                        color: getActivityColor(activity.type)
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatTime(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="teacher-empty-state py-8">
                <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No recent activity yet</p>
                <p className="text-xs text-slate-300 mt-1">Activity will appear as you create content</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Upcoming Deadlines</h2>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="p-5">
            {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {dashboard.upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-green-primary/20 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-700">{deadline.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-green-primary bg-green-primary/10 px-2 py-0.5 rounded font-medium">
                        {deadline.subject}
                      </span>
                      <span className="text-xs text-slate-400">
                        Due: {deadline.due_date || 'Not set'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="teacher-empty-state py-8">
                <CalendarCheck className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="teacher-quick-action group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    background: action.color + '12',
                    color: action.color,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-green-primary transition-colors">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
