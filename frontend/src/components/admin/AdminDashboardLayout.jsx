import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity, BarChart3, BellRing, BookOpen, Bot, Building2, ClipboardList,
  Database, FileQuestion, GraduationCap, LayoutDashboard, LogOut, Menu,
  Settings, ShieldCheck, UserCircle, Users, X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import './admin.css'

const nav = [
  ['dashboard', 'Dashboard', LayoutDashboard], ['students', 'Students', GraduationCap],
  ['teachers', 'Teachers', Users], ['classes', 'Classes', Building2],
  ['assignments', 'Assignments', ClipboardList], ['exams', 'Exams', BookOpen],
  ['question-bank', 'Question Bank', FileQuestion], ['resources', 'Resources', Database],
  ['announcements', 'Announcements', BellRing], ['analytics', 'Analytics', BarChart3],
  ['ai-monitoring', 'AI Monitoring', Bot], ['logs', 'System Logs', Activity],
  ['profile', 'Profile', UserCircle], ['settings', 'Settings', Settings],
]

export default function AdminDashboardLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = () => { logout(); navigate('/login', { replace: true }) }

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
      <div className="admin-account">
        <div className="admin-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
        <div><strong>{user?.name || 'Administrator'}</strong><span>{user?.email}</span></div>
        <button onClick={signOut} title="Sign out"><LogOut size={18} /></button>
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

