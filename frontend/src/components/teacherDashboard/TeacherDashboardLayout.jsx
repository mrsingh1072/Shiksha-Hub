import { useState, useEffect } from 'react'
import { NavLink, Outlet, useOutletContext, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList, FileText,
  Database, Bot, CalendarCheck, Megaphone, FolderOpen, BarChart3,
  UserCircle, Settings, LogOut, Menu, X, Bell
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import teacherService from '../../services/teacherService'
import '../../pages/teacher/teacherDashboard.css'

const navItems = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/classes', label: 'Classes', icon: GraduationCap },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/teacher/exams', label: 'Exams', icon: FileText },
  { to: '/teacher/question-bank', label: 'Question Bank', icon: Database },
  { to: '/teacher/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/teacher/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/teacher/resources', label: 'Resources', icon: FolderOpen },
  { to: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/teacher/notifications', label: 'Notifications', icon: Bell },
  { to: '/teacher/profile', label: 'Profile', icon: UserCircle },
  { to: '/teacher/settings', label: 'Settings', icon: Settings },
]

export function useTeacherWorkspace() {
  return useOutletContext()
}

export default function TeacherDashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const [dashboardRes, notificationsRes] = await Promise.all([
        teacherService.getDashboard(),
        teacherService.getNotifications().catch(() => ({ data: [] }))
      ])
      
      setDashboard({
        ...dashboardRes.data,
        notifications: notificationsRes.data || []
      })
      setError(null)
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const notifications = dashboard?.notifications || []
  const unreadCount = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-green-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <p className="text-xl font-bold text-slate-800">{error}</p>
          <p className="mt-2 text-slate-500">Please sign in again to continue.</p>
          <button onClick={handleLogout} className="mt-4 teacher-btn-primary">
            Sign In Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-layout min-h-screen bg-cream text-text">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-green-primary/10 bg-white/95 backdrop-blur px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100">
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-sm font-bold text-white">
                E
              </div>
              <span className="font-bold text-green-primary">Shiksha Hub</span>
            </div>
          </div>
          <button onClick={handleLogout} className="rounded-lg p-2 text-slate-500 hover:text-green-primary">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-green-primary/10 bg-white/95 backdrop-blur lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-green-primary/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-base font-bold text-white">
                    E
                  </div>
                  <div>
                    <p className="font-bold text-green-primary text-sm">Shiksha Hub</p>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400">Teacher Workspace</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-green-primary">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                          isActive
                            ? 'teacher-nav-active'
                            : 'text-gray-600 hover:bg-cream hover:text-green-primary'
                        }`
                      }
                    >
                      <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                      {item.label}
                      {item.label === 'Notifications' && unreadCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-green-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-green-primary/20 flex items-center justify-center text-sm font-bold text-green-primary">
                    {dashboard?.teacherName?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{dashboard?.teacherName || 'Teacher'}</p>
                    <p className="text-xs text-gray-400 truncate">{dashboard?.email || user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-primary/20 px-4 py-2 text-sm font-bold text-green-primary transition hover:bg-green-primary hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside
          className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-green-primary/10 bg-white/95 backdrop-blur lg:flex"
        >
          <div className="shrink-0 p-5 border-b border-green-primary/10">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-base font-bold text-white shadow-lg shadow-green-primary/30">
                E
              </div>
              <div>
                <p className="font-bold text-green-primary text-sm tracking-tight">Shiksha Hub</p>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gray-400">Teacher Workspace</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                      isActive
                        ? 'teacher-nav-active'
                        : 'text-gray-600 hover:bg-cream hover:text-green-primary'
                    }`
                  }
                >
                  <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                  {item.label}
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="shrink-0 p-4 border-t border-green-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-green-primary/20 flex items-center justify-center text-sm font-bold text-green-primary">
                {dashboard?.teacherName?.charAt(0)?.toUpperCase() || 'T'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text truncate">{dashboard?.teacherName || 'Teacher'}</p>
                <p className="text-xs text-gray-400 truncate">{dashboard?.email || user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-green-primary/20 px-4 py-2.5 text-sm font-bold text-green-primary transition hover:bg-green-primary hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen min-w-0 flex-1 lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Outlet context={{ dashboard, refetch: fetchDashboard }} />
          </div>
        </main>
      </div>
    </div>
  )
}
