import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, ClipboardList, FileText, TrendingUp, CalendarCheck } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, classRes, assignRes] = await Promise.allSettled([
          teacherService.getDashboard(),
          teacherService.getClasses(),
          teacherService.getAssignments(),
        ])
        setData({
          dashboard: dashRes.status === 'fulfilled' ? dashRes.value.data : {},
          classes: classRes.status === 'fulfilled' ? classRes.value.data : [],
          assignments: assignRes.status === 'fulfilled' ? assignRes.value.data : [],
        })
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  const d = data?.dashboard || {}
  const classes = data?.classes || []
  const assignments = data?.assignments || []

  const overviewStats = [
    { label: 'Total Students', value: d.totalStudents || 0, icon: Users, color: '#2F5D50' },
    { label: 'Total Classes', value: d.totalClasses || 0, icon: BarChart3, color: '#6B8E23' },
    { label: 'Assignments', value: d.assignmentsCreated || 0, icon: ClipboardList, color: '#0891b2' },
    { label: 'Submissions', value: d.submissionsReceived || 0, icon: FileText, color: '#059669' },
    { label: 'Avg Score', value: `${d.averageScore || 0}%`, icon: TrendingUp, color: '#dc2626' },
    { label: 'Pending Reviews', value: d.pendingReviews || 0, icon: CalendarCheck, color: '#d97706' },
  ]

  const itemV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your teaching performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={itemV} className="teacher-stat-card text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: stat.color + '15' }}>
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Class Overview</h2>
          {classes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No classes created yet</p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls, i) => (
                <div key={cls._id} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-slate-600 truncate">{cls.class_name}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((cls.student_count || 0) * 10, 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-green-primary to-green-secondary flex items-center justify-end pr-2"
                    >
                      <span className="text-[0.65rem] text-white font-bold">{cls.student_count || 0}</span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-400 w-16 text-right">{cls.student_count || 0} students</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Assignment Completion */}
        <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Assignment Submissions</h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No assignments created yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 8).map((a, i) => {
                const subs = a.submission_count || 0
                const maxSubs = Math.max(...assignments.map(x => x.submission_count || 0), 1)
                return (
                  <div key={a._id} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-slate-600 truncate">{a.title}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(subs / maxSubs) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-end pr-2"
                      >
                        {subs > 0 && <span className="text-[0.65rem] text-white font-bold">{subs}</span>}
                      </motion.div>
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">{subs}</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Performance Distribution */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 rounded-xl">
            <p className="text-4xl font-bold text-green-primary">{d.totalClasses || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Active Classes</p>
            <div className="mt-3 h-2 bg-green-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-primary rounded-full" style={{ width: `${Math.min((d.totalClasses || 0) * 20, 100)}%` }} />
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
            <p className="text-4xl font-bold text-cyan-600">{d.submissionsReceived || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Submissions</p>
            <div className="mt-3 h-2 bg-cyan-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${d.submissionsReceived ? Math.min(d.submissionsReceived * 5, 100) : 0}%` }} />
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
            <p className="text-4xl font-bold text-amber-600">{d.averageScore || 0}%</p>
            <p className="text-sm text-slate-500 mt-1">Average Score</p>
            <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${d.averageScore || 0}%` }} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
