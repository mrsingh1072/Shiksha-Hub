import api from './api'

const teacherService = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),

  // Classes
  getClasses: () => api.get('/teacher/classes/'),
  createClass: (data) => api.post('/teacher/classes/', data),
  getClass: (id) => api.get(`/teacher/classes/${id}`),
  getPendingRequests: (classId) =>
    api.get(`/teacher/classes/${classId}/requests`),

  approveStudent: (classId, requestId) =>
    api.post(`/teacher/classes/${classId}/approve/${requestId}`),

  rejectStudent: (classId, requestId) =>
    api.post(`/teacher/classes/${classId}/reject/${requestId}`),
  updateClass: (id, data) => api.put(`/teacher/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/teacher/classes/${id}`),

  // Students
  getStudents: () => api.get('/teacher/students/'),
  searchStudents: (query) => api.get(`/teacher/students/search?q=${query}`),
  getStudent: (email) => api.get(`/teacher/students/${encodeURIComponent(email)}`),

  // Assignments
  getAssignments: () => api.get('/teacher/assignments/'),
  createAssignment: (data) => api.post('/teacher/assignments/', data),
  getAssignment: (id) => api.get(`/teacher/assignments/${id}`),
  updateAssignment: (id, data) => api.put(`/teacher/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/teacher/assignments/${id}`),
  addFeedback: (id, data) => api.post(`/teacher/assignments/${id}/feedback`, data),

  // Assignment Submissions & Evaluation
  getSubmissions: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  aiEvaluate: (submissionId) => api.post(`/evaluation/ai/${submissionId}`),
  manualEvaluate: (submissionId, data) => api.post(`/evaluation/manual/${submissionId}`, data),
  publishMarks: (submissionId) => api.post(`/evaluation/publish/${submissionId}`),
  getEvaluation: (submissionId) => api.get(`/evaluation/${submissionId}`),

  // Exams
  getExams: () => api.get('/teacher/exams/'),
  createExam: (data) => api.post('/teacher/exams/', data),
  generateExam: (data) => api.post('/teacher/exams/generate', data),
  getExam: (id) => api.get(`/teacher/exams/${id}`),
  updateExam: (id, data) => api.put(`/teacher/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/teacher/exams/${id}`),
  getExamResults: (id) => api.get(`/teacher/exams/${id}/results`),

  // Question Bank
  getQuestions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return api.get(`/teacher/question-bank/?${params}`)
  },
  searchQuestions: (query) => api.get(`/teacher/question-bank/search?q=${query}`),
  addQuestion: (data) => api.post('/teacher/question-bank/', data),
  updateQuestion: (id, data) => api.put(`/teacher/question-bank/${id}`, data),
  deleteQuestion: (id) => api.delete(`/teacher/question-bank/${id}`),

  // AI Assistant
  aiChat: (data) => api.post('/teacher/ai/chat', data),
  getAIHistory: () => api.get('/teacher/ai/history'),
  deleteAIHistory: (id) => api.delete(`/teacher/ai/history/${id}`),

  // Attendance
  markAttendance: (data) => api.post('/teacher/attendance/', data),
  getAttendance: (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    return api.get(`/teacher/attendance/?${params}`)
  },
  getAttendanceReport: (classId) => api.get(`/teacher/attendance/report?class_id=${classId}`),

  // Classroom Announcements
  getClassAnnouncements: (classId) =>
    api.get(`/teacher/classes/${classId}/teacher-announcements`),

  getTeacherClassAnnouncements: (classId) =>
    api.get(`/teacher/classes/${classId}/teacher-announcements`),

  createClassAnnouncement: (classId, data) =>
    api.post(`/teacher/classes/${classId}/announcements`, data),

  updateClassAnnouncement: (classId, announcementId, data) =>
    api.put(`/teacher/classes/${classId}/announcements/${announcementId}`, data),

  deleteClassAnnouncement: (classId, announcementId) =>
    api.delete(`/teacher/classes/${classId}/announcements/${announcementId}`),

  // Class Exams (per-class)
  getClassExams: (classId) =>
    api.get(`/teacher/classes/${classId}/exams`),

  getClassExam: (classId, examId) =>
    api.get(`/teacher/classes/${classId}/exams/${examId}`),

  createClassExamManual: (classId, data) =>
    api.post(`/teacher/classes/${classId}/exams/manual`, data),

  generateClassExamAI: (classId, data) =>
    api.post(`/teacher/classes/${classId}/exams/ai`, data),

  updateClassExam: (classId, examId, data) =>
    api.put(`/teacher/classes/${classId}/exams/${examId}`, data),

  startClassExam: (classId, examId) =>
    api.post(`/teacher/classes/${classId}/exams/${examId}/start`),

  publishClassExam: (classId, examId) =>
    api.post(`/teacher/classes/${classId}/exams/${examId}/publish`),

  publishExamResults: (classId, examId) =>
    api.post(`/teacher/classes/${classId}/exams/${examId}/publish-results`),

  deleteClassExam: (classId, examId) =>
    api.delete(`/teacher/classes/${classId}/exams/${examId}`),

  getExamSubmissions: (classId, examId) =>
    api.get(`/teacher/classes/${classId}/exams/${examId}/submissions`),

  publishExamResults: (classId, examId) =>
    api.post(`/teacher/classes/${classId}/exams/${examId}/publish`),

  // Resources
  getResources: (classId) => api.get(`/teacher/resources/${classId ? `?class_id=${classId}` : ''}`),
  uploadResource: (formData) => api.post('/teacher/resources/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResource: (id) => api.delete(`/teacher/resources/${id}`),

  // Profile
  getProfile: () => api.get('/profile/'),
  updateProfile: (data) => api.put('/profile/', data),
  uploadPhoto: (formData) => api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: () => api.delete('/profile/photo'),
}

export default teacherService

