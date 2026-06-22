import api from './api'

const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  students: (params = {}) => api.get('/admin/students', { params }),
  teachers: (params = {}) => api.get('/admin/teachers', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  setUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  content: (kind, params = {}) => api.get(`/admin/content/${kind}`, { params }),
  deleteContent: (kind, id) => api.delete(`/admin/content/${kind}/${id}`),
  assignTeacher: (id, teacher_email) => api.patch(`/admin/content/classes/${id}/teacher`, { teacher_email }),
  approveQuestion: (id) => api.patch(`/admin/content/questions/${id}/approve`),
  announcements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  analytics: () => api.get('/admin/analytics'),
  aiMonitoring: () => api.get('/admin/ai-monitoring'),
  logs: (params = {}) => api.get('/admin/logs', { params }),
  profile: () => api.get('/admin/profile'),
  settings: () => api.get('/admin/settings'),
}

export default adminService
