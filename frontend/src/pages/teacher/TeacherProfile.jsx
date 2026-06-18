import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserCircle, Save, Camera, Trash2, X, Check, Mail, Phone, Briefcase, BookOpen, GraduationCap } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({})
  const [subjectInput, setSubjectInput] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await teacherService.getProfile()
        setProfile(res.data)
        setFormData(res.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await teacherService.updateProfile(formData)
      setProfile(formData)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('photo', file)
    try {
      const res = await teacherService.uploadPhoto(fd)
      setProfile(prev => ({ ...prev, profilePhoto: res.data?.filename || res.data?.profilePhoto }))
      setFormData(prev => ({ ...prev, profilePhoto: res.data?.filename || res.data?.profilePhoto }))
    } catch (err) { console.error(err) }
  }

  const addSubject = () => {
    if (!subjectInput.trim()) return
    const current = formData.subjects || []
    if (!current.includes(subjectInput.trim())) {
      setFormData({ ...formData, subjects: [...current, subjectInput.trim()] })
    }
    setSubjectInput('')
  }

  const removeSubject = (idx) => {
    setFormData({ ...formData, subjects: (formData.subjects || []).filter((_, i) => i !== idx) })
  }

  const cancel = () => { setFormData(profile); setEditing(false) }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  const photoUrl = profile?.profilePhoto ? `http://127.0.0.1:8000/profile/photo/${profile.profilePhoto}` : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
      <div className="teacher-page-header">
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="teacher-btn-primary">Edit Profile</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancel} className="teacher-btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="teacher-btn-primary">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        )}
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <Check className="h-4 w-4" /> Profile updated successfully!
        </motion.div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-green-primary via-green-secondary to-green-primary" />
        <div className="px-6 pb-6 -mt-14">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-green-primary/10 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-green-primary">
                  {(profile?.name || 'T').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-primary flex items-center justify-center cursor-pointer shadow-lg hover:bg-green-primary/80 transition">
                <Camera className="h-4 w-4 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold text-slate-800">{profile?.name || 'Teacher'}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {profile?.email}</span>
              {profile?.department && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profile.department}</span>}
              {profile?.designation && <span className="teacher-badge teacher-badge-info">{profile.designation}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><UserCircle className="h-5 w-5 text-green-primary" /> Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="teacher-label">Full Name</label>
            {editing ? <input className="teacher-input" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              : <p className="text-sm text-slate-700 py-2">{profile?.name || '—'}</p>}
          </div>
          <div>
            <label className="teacher-label">Email</label>
            <p className="text-sm text-slate-500 py-2">{profile?.email || '—'}</p>
          </div>
          <div>
            <label className="teacher-label">Phone</label>
            {editing ? <input className="teacher-input" value={formData.phone || formData.mobile || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              : <p className="text-sm text-slate-700 py-2">{profile?.phone || profile?.mobile || '—'}</p>}
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-green-secondary" /> Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="teacher-label">Qualification</label>
            {editing ? <input className="teacher-input" value={formData.qualification || ''} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. Ph.D. Computer Science" />
              : <p className="text-sm text-slate-700 py-2">{profile?.qualification || '—'}</p>}
          </div>
          <div>
            <label className="teacher-label">Department</label>
            {editing ? <input className="teacher-input" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
              : <p className="text-sm text-slate-700 py-2">{profile?.department || '—'}</p>}
          </div>
          <div>
            <label className="teacher-label">Experience (years)</label>
            {editing ? <input className="teacher-input" type="number" value={formData.experience || ''} onChange={e => setFormData({...formData, experience: e.target.value})} />
              : <p className="text-sm text-slate-700 py-2">{profile?.experience || '—'} years</p>}
          </div>
          <div>
            <label className="teacher-label">Designation</label>
            {editing ? <input className="teacher-input" value={formData.designation || ''} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Associate Professor" />
              : <p className="text-sm text-slate-700 py-2">{profile?.designation || '—'}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="teacher-label">Bio</label>
            {editing ? <textarea className="teacher-textarea" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} placeholder="Tell us about yourself..." />
              : <p className="text-sm text-slate-700 py-2">{profile?.bio || '—'}</p>}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-cyan-500" /> Subjects</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(editing ? formData.subjects : profile?.subjects)?.map((sub, i) => (
            <span key={i} className="teacher-badge teacher-badge-info text-sm py-1 px-3 flex items-center gap-1.5">
              {sub}
              {editing && <button onClick={() => removeSubject(i)} className="hover:text-red-500"><X className="h-3 w-3" /></button>}
            </span>
          ))}
          {(!editing && (!profile?.subjects || profile.subjects.length === 0)) && <p className="text-sm text-slate-400">No subjects added</p>}
        </div>
        {editing && (
          <div className="flex gap-2">
            <input className="teacher-input flex-1" placeholder="Add a subject..." value={subjectInput} onChange={e => setSubjectInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())} />
            <button type="button" onClick={addSubject} className="teacher-btn-secondary">Add</button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
