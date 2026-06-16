import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload'
import AccountSecurity from '../../components/profile/AccountSecurity'
import { updateStudentProfile } from '../../services/studentDashboardService'
import { buildStudentId, getEducationDetails } from '../../utils/studentDashboardData'
import { validateEmail, validatePhone } from '../../utils/validation'

function Field({ label, name, value, onChange, disabled = false, type = 'text' }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="mt-2 w-full rounded-xl border border-green-primary/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-primary focus:ring-2 focus:ring-green-primary/15 disabled:bg-cream disabled:text-gray-500"
      />
    </label>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-green-primary/10 bg-white px-4 py-3">
      <span className="text-sm font-semibold text-text">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-green-primary/20 text-green-primary focus:ring-green-primary/20"
      />
    </label>
  )
}

export default function StudentProfile() {
  const { dashboard, refetch } = useStudentWorkspace()
  const { student } = dashboard
  const education = getEducationDetails(student)
  const [form, setForm] = useState(student)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(student)
  }, [student])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handlePreferenceChange = (key, value) => {
    setForm((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: value,
      },
    }))
  }

  const handleNotificationChange = (key, value) => {
    setForm((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        notifications: {
          ...current.preferences.notifications,
          [key]: value,
        },
      },
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setStatus('')
    setError('')

    if (!form.name?.trim()) {
      setError('Full name is required.')
      setIsSaving(false)
      return
    }

    if (!validateEmail(form.email)) {
      setError('A valid email address is required.')
      setIsSaving(false)
      return
    }

    if (form.phone && !validatePhone(form.phone)) {
      setError('Enter a valid mobile number.')
      setIsSaving(false)
      return
    }

    try {
      await updateStudentProfile(form)
      await refetch({ silent: true })
      setStatus('Profile updated successfully.')
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerified = async (flags) => {
    setForm((current) => ({ ...current, ...flags }))
    await refetch({ silent: true })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Profile"
        title="Your learning identity"
        action={
          <div className="rounded-full bg-green-primary/10 px-4 py-2 text-sm font-bold text-green-primary">
            {buildStudentId(student)}
          </div>
        }
      />

      <DashboardCard className="p-6">
        <ProfilePhotoUpload
          profilePhoto={form.profilePhoto}
          onUploaded={() => refetch({ silent: true })}
          onRemoved={() => refetch({ silent: true })}
        />
        <div className="mt-6 border-t border-green-primary/10 pt-6">
          <p className="text-2xl font-bold text-text">{student.name}</p>
          <p className="text-gray-500">{student.email}</p>
          <p className="mt-2 text-sm font-bold text-green-primary">
            {education.institutionName} · {education.level}
          </p>
        </div>
      </DashboardCard>

      <form onSubmit={handleSubmit} className="space-y-6">
        <DashboardCard className="p-6">
          <h2 className="mb-5 text-lg font-bold text-text">Personal information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Email" name="email" value={form.email} onChange={handleChange} disabled />
            <Field label="Mobile number" name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <h2 className="mb-5 text-lg font-bold text-text">Academic information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="School name" name="schoolName" value={form.schoolName} onChange={handleChange} />
            <Field label="Class" name="studentClass" value={form.studentClass} onChange={handleChange} />
            <Field label="College name" name="collegeName" value={form.collegeName} onChange={handleChange} />
            <Field label="Course" name="course" value={form.course || form.branch} onChange={handleChange} />
            <Field label="Degree" name="degree" value={form.degree} onChange={handleChange} />
            <Field label="Branch" name="branch" value={form.branch || form.course} onChange={handleChange} />
            <Field label="Semester" name="semester" value={form.semester || form.yearSemester} onChange={handleChange} />
            <Field label="Year / semester" name="yearSemester" value={form.yearSemester || form.semester} onChange={handleChange} />
            <Field label="Division" name="division" value={form.division} onChange={handleChange} />
            <Field label="Roll number" name="rollNumber" value={form.rollNumber} onChange={handleChange} />
            <div className="md:col-span-2">
              <Field label="Bio" name="bio" value={form.bio} onChange={handleChange} />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-6">
          <h2 className="mb-5 text-lg font-bold text-text">Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-gray-600">Language</span>
              <select
                value={form.preferences?.language || 'en'}
                onChange={(event) => handlePreferenceChange('language', event.target.value)}
                className="mt-2 w-full rounded-xl border border-green-primary/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-600">Theme</span>
              <select
                value={form.preferences?.theme || 'light'}
                onChange={(event) => handlePreferenceChange('theme', event.target.value)}
                className="mt-2 w-full rounded-xl border border-green-primary/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-primary/15"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </label>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm font-bold text-gray-600">Notification preferences</p>
            <ToggleRow
              label="Assignment reminders"
              checked={form.preferences?.notifications?.assignments ?? true}
              onChange={(value) => handleNotificationChange('assignments', value)}
            />
            <ToggleRow
              label="Exam updates"
              checked={form.preferences?.notifications?.exams ?? true}
              onChange={(value) => handleNotificationChange('exams', value)}
            />
            <ToggleRow
              label="Tutor activity"
              checked={form.preferences?.notifications?.tutor ?? true}
              onChange={(value) => handleNotificationChange('tutor', value)}
            />
            <ToggleRow
              label="Announcements"
              checked={form.preferences?.notifications?.announcements ?? true}
              onChange={(value) => handleNotificationChange('announcements', value)}
            />
          </div>
        </DashboardCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">Email is managed by your account. Other fields save to your EduVerse profile.</p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-primary/20 transition hover:bg-green-secondary disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        {status && <div className="rounded-xl bg-green-primary/10 px-4 py-3 text-sm font-bold text-green-primary">{status}</div>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>}
      </form>

      <AccountSecurity student={form} onVerified={handleVerified} />
    </div>
  )
}
