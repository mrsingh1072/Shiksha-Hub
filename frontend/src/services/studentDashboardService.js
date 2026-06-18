import api from './api'
import { workspaceFromSettled } from '../utils/studentDashboardData'

const read = (request) => request.then((response) => response.data)

export async function fetchStudentDashboard() {
  const results = await Promise.allSettled([
  read(api.get('/student/dashboard')),
  read(api.get('/profile/')),
  read(api.get('/student/assignments')),
  read(api.get('/submissions/')),
  read(api.get('/history/me')),
  read(api.get('/analytics/dashboard')),
  read(api.get('/ai/tutor/conversations')),
])

  // Only treat 401 (token expired / missing) as a fatal auth failure.
  // 403 (wrong role) from optional endpoints should not crash the dashboard.
  const authFailure = results.find(
    (result) => result.status === 'rejected' && result.reason?.response?.status === 401
  )

  if (authFailure) {
    throw authFailure.reason
  }

  return workspaceFromSettled(results)
}

export async function updateStudentProfile(profile) {
  const response = await api.put('/profile/', {
    name: profile.name || '',
    phone: profile.phone || '',
    studentType: profile.studentType || '',
    schoolName: profile.schoolName || '',
    studentClass: profile.studentClass || '',
    collegeName: profile.collegeName || '',
    degree: profile.degree || '',
    course: profile.course || profile.branch || '',
    yearSemester: profile.yearSemester || profile.semester || '',
    college: profile.collegeName || profile.college || '',
    branch: profile.branch || profile.course || '',
    semester: profile.semester || profile.yearSemester || '',
    division: profile.division || '',
    roll_number: profile.rollNumber || '',
    department: profile.department || profile.course || '',
    subjects: profile.subjects || [],
    designation: '',
    experience: 0,
    bio: profile.bio || '',
    preferences: profile.preferences || undefined,
  })

  return response.data
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function removeProfilePhoto() {
  const response = await api.delete('/profile/photo')
  return response.data
}
