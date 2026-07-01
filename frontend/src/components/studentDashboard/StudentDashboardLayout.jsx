import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ClipboardList,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Target,
  UserRound,
  Volume2,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useStudentDashboard } from '../../hooks/useStudentDashboard'
import { LoadingSkeleton, DashboardCard } from './DashboardPrimitives'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/student/exams', label: 'Practice Exams', icon: BookOpen },
  { to: '/student/tutor', label: 'AI Tutor', icon: Sparkles },
  { to: '/student/voice-learning', label: 'Voice Learning', icon: Volume2 },
  { to: '/student/history', label: 'History', icon: History },
  { to: '/student/resources', label: 'Resources', icon: FolderOpen },
  { to: '/student/classes', label: 'Classes', icon: Users, },
  { to: '/student/analytics', label: 'Analytics', icon: Target },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
]

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-primary to-green-secondary text-lg font-bold text-white">
        E
      </div>
      <div>
        <p className="text-lg font-bold text-green-primary">EduVerse AI</p>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Student Workspace</p>
      </div>
    </div>
  )
}

function NavItem({ item, compact = false, unreadCount = 0 }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl text-sm font-bold transition ${
          compact ? 'shrink-0 px-4 py-2' : 'px-3 py-2.5'
        } ${isActive ? 'bg-green-primary text-white shadow-glow' : 'text-gray-600 hover:bg-cream hover:text-green-primary'}`
      }
    >
      <div className="flex items-center gap-3">
  <div className="relative">
    <Icon className="h-5 w-5 shrink-0" />

    {item.label === "Notifications" && unreadCount > 0 && (
      <span className="absolute -top-2 -right-2 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </div>

  <span>{item.label}</span>
</div>
    </NavLink>
  )
}

export function useStudentWorkspace() {
  return useOutletContext()
}

export default function StudentDashboardLayout() {
  const { dashboard, isLoading, error, refetch } = useStudentDashboard()
  console.log("Dashboard:", dashboard)
  console.log("Notifications:", dashboard?.notifications)
  const notifications = dashboard?.notifications ?? []

const unreadCount = notifications.filter(
  (notification) => !notification.read
).length
  const { logout } = useAuth()

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <DashboardCard className="max-w-lg text-center">
          <p className="text-xl font-bold text-text">{error}</p>
          <p className="mt-2 text-gray-500">Please sign in again to continue.</p>
        </DashboardCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream text-text">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-green-primary/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <button onClick={logout} className="rounded-lg p-2 text-green-primary" type="button">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
  <NavItem
    key={item.to}
    item={item}
    unreadCount={unreadCount}
  />
))}
        </nav>
      </header>

      <div className="lg:flex">
        {/* Fixed desktop sidebar — never scrolls with content */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-green-primary/10 bg-white/95 backdrop-blur lg:flex">
          <div className="shrink-0 border-b border-green-primary/10 p-5">
            <Brand />
          </div>

          <nav className="flex-1 space-y-1 overflow-hidden px-3 py-4">
  {navItems.map((item) => (
    <NavItem
      key={item.to}
      item={item}
      unreadCount={unreadCount}
    />
  ))}
</nav>

          <div className="shrink-0 space-y-2 border-t border-green-primary/10 p-4">
            <NavLink
              to="/student/profile"
              className="flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm font-bold text-green-primary"
            >
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-primary/20 px-4 py-3 text-sm font-bold text-green-primary transition hover:bg-green-primary hover:text-white"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Scrollable content only */}
        <main className="min-h-screen min-w-0 flex-1 lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Outlet context={{ dashboard, refetch }} />
          </div>
        </main>
      </div>
    </div>
  )
}
