import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Lock, Bell, Palette, Info, Eye, EyeOff, Check, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

export default function TeacherSettings() {
  const { user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [notifications, setNotifications] = useState({
    assignments: true,
    exams: true,
    announcements: true,
    submissions: true,
  })
  const [theme, setTheme] = useState(localStorage.getItem('teacher-theme') || 'light')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' }); return
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return
    }
    setPasswordSaving(true)
    try {
      await api.post('/auth/change-password', {
        current_password: passwordForm.current,
        new_password: passwordForm.newPass
      })
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' })
    } finally { setPasswordSaving(false) }
  }

  const toggleTheme = (t) => {
    setTheme(t)
    localStorage.setItem('teacher-theme', t)
  }

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const itemV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Account Settings */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings className="h-5 w-5 text-green-primary" /> Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="teacher-label">Email</label>
            <p className="text-sm text-slate-600 py-2 px-3 bg-slate-50 rounded-lg">{user?.email || '—'}</p>
          </div>
          <div>
            <label className="teacher-label">Role</label>
            <p className="text-sm py-2 px-3 bg-slate-50 rounded-lg">
              <span className="teacher-badge teacher-badge-info">Teacher</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-red-500" /> Security</h3>
        {passwordMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-sm mb-4 flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {passwordMsg.type === 'success' ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />} {passwordMsg.text}
          </motion.div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
            { key: 'newPass', label: 'New Password', placeholder: 'Enter new password' },
            { key: 'confirm', label: 'Confirm Password', placeholder: 'Confirm new password' },
          ].map(f => (
            <div key={f.key}>
              <label className="teacher-label">{f.label}</label>
              <div className="relative">
                <input className="teacher-input pr-10" type={showPassword[f.key] ? 'text' : 'password'} placeholder={f.placeholder}
                  value={passwordForm[f.key]} onChange={e => setPasswordForm({...passwordForm, [f.key]: e.target.value})} required />
                <button type="button" onClick={() => setShowPassword({...showPassword, [f.key]: !showPassword[f.key]})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword[f.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={passwordSaving} className="teacher-btn-primary">
            {passwordSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock className="h-4 w-4" />}
            Change Password
          </button>
        </form>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-500" /> Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'assignments', label: 'Assignment Updates', desc: 'Get notified when students submit assignments' },
            { key: 'exams', label: 'Exam Notifications', desc: 'Get notified about exam completions' },
            { key: 'announcements', label: 'Announcement Alerts', desc: 'Get notified about system announcements' },
            { key: 'submissions', label: 'New Submissions', desc: 'Get notified when new submissions arrive' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">{n.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
              </div>
              <div className={`teacher-toggle ${notifications[n.key] ? 'active' : ''}`} onClick={() => toggleNotif(n.key)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Palette className="h-5 w-5 text-green-secondary" /> Appearance</h3>
        <div className="flex gap-3">
          <button onClick={() => toggleTheme('light')}
            className={`flex-1 p-4 rounded-xl border-2 transition ${theme === 'light' ? 'border-green-primary bg-green-primary/10' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Light</p>
          </button>
          <button onClick={() => toggleTheme('dark')}
            className={`flex-1 p-4 rounded-xl border-2 transition ${theme === 'dark' ? 'border-green-primary bg-green-primary/10' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="w-10 h-10 rounded-lg bg-slate-800 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Dark</p>
          </button>
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={itemV} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-cyan-500" /> About</h3>
        <div className="space-y-2 text-sm text-slate-500">
          <p><span className="font-medium text-slate-700">Version:</span> 1.0.0</p>
          <p><span className="font-medium text-slate-700">Platform:</span> Shiksha Hub — Teacher Module</p>
          <p><span className="font-medium text-slate-700">Support:</span> support@shiksha-hub.com</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
