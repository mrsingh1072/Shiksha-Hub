import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity, BarChart3, BellRing, BookOpen, Bot, Building2, ClipboardList,
  Database, FileQuestion, GraduationCap, LayoutDashboard, LogOut, Menu,
  ShieldCheck, UserCircle, Users, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import './admin.css'

const nav = [
  ['dashboard', 'Dashboard', LayoutDashboard], ['students', 'Students', GraduationCap],
  ['teachers', 'Teachers', Users], ['classes', 'Classes', Building2],
  ['assignments', 'Assignments', ClipboardList], ['exams', 'Exams', BookOpen],
  ['question-bank', 'Question Bank', FileQuestion], ['resources', 'Resources', Database],
  ['announcements', 'Announcements', BellRing], ['analytics', 'Analytics', BarChart3], ['logs', 'System Logs', Activity],
  ['profile', 'Profile', UserCircle],
]

function getInitials(name) {
  if (!name) return 'AD'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'AD'
}

export default function AdminDashboardLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <>
      <div className="admin-brand">
        <div className="admin-logo"><ShieldCheck size={20} /></div>
        <div><strong>EduVerse</strong><span>Control Center</span></div>
        <button className="admin-close" onClick={() => setOpen(false)}><X size={20} /></button>
      </div>
      <nav className="admin-nav">
        {nav.map(([path, label, Icon]) => (
          <NavLink key={path} to={`/admin/${path}`} onClick={() => setOpen(false)}
            className={({ isActive }) => isActive ? 'active' : ''}>
            <Icon size={18} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 p-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="admin-avatar shrink-0">{getInitials(user?.name)}</div>
          <div className="admin-account__details min-w-0">
            <strong className="block truncate text-sm text-white">{user?.name || 'Platform Administrator'}</strong>
            <span className="block truncate text-xs text-gray-400">{user?.email || 'admin@eduverse.ai'}</span>
          </div>
        </div>
        <button 
          onClick={signOut} 
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-300 border border-white/10 hover:border-red-500/50 py-2.5 text-sm font-bold transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="admin-shell">
      {open && <button className="admin-overlay" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <aside className={open ? 'admin-sidebar open' : 'admin-sidebar'}>{sidebar}</aside>
      <main className="admin-main">
        <header className="admin-mobile-head">
          <button onClick={() => setOpen(true)}><Menu /></button><strong>Control Center</strong>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
