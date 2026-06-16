import api from './api'
import { workspaceFromSettled } from '../utils/studentDashboardData'

const read = (request) => request.then((response) => response.data)

export async function fetchStudentDashboard() {
  const results = await Promise.allSettled([
  read(api.get('/student/dashboard')),
  read(api.get('/profile/')),
  read(api.get('/teacher/assignments/')),
  read(api.get('/submissions/')),
  read(api.get('/history/me')),
  read(api.get('/analytics/dashboard')),
  read(api.get('/ai/tutor/conversations')),
])

  const authFailure = results.find(
    (result) => result.status === 'rejected' && [401, 403].includes(result.reason?.response?.status)
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
