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
    read(api.get('/student/notifications')),
  ])

  const authFailure = results.find(
    (result) =>
      result.status === 'rejected' &&
      result.reason?.response?.status === 401
  )

  if (authFailure) {
    throw authFailure.reason
  }

  return workspaceFromSettled(results)
}
export async function getGlobalAnnouncements() {
  const response = await api.get('/student/announcements')
  return response.data
}

export async function getStudentResources() {
  const response = await api.get('/student/resources')
  return response.data
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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function removeProfilePhoto() {
  const response = await api.delete('/profile/photo')
  return response.data
}

export async function uploadAssignmentFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/assignment-upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function submitAssignment({
  assignment_id,
  submission_text = '',
  file,
}) {
  const formData = new FormData()

  formData.append('assignment_id', assignment_id)
  formData.append('submission_text', submission_text)

  if (file) {
    formData.append('file', file)
  }

  const response = await api.post('/submissions/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function getStudentNotifications() {
  const response = await api.get('/student/notifications')
  return response.data
}

export async function markNotificationRead(notificationId) {
  const response = await api.put(
    `/student/notifications/${notificationId}/read`
  )
  return response.data
}
export async function getAvailableClasses() {
  const response = await api.get("/teacher/classes/available");
  return response.data;
}

export async function requestClass(classCode) {
  const response = await api.post("/teacher/classes/request", {
    class_code: classCode,
  });

  return response.data;
}
export async function getStudentClass(classId) {
  const response = await api.get(`/student/classes/${classId}`);
  return response.data;
}
export const getClassAnnouncements = async (classId) => {
  const res = await api.get(`/student/classes/${classId}/announcements`);
  return res.data;
};

// ===== Student Exam Services =====
export const getStudentClassExams = async (classId) => {
  const res = await api.get(`/student/classes/${classId}/exams`);
  return res.data;
};

export const startStudentExam = async (examId) => {
  const res = await api.post(`/student/exams/${examId}/start`);
  return res.data;
};

export const saveExamAnswer = async (examId, data) => {
  const res = await api.post(`/student/exams/${examId}/save-answer`, data);
  return res.data;
};

export const submitStudentExam = async (examId, data = {}) => {
  const res = await api.post(`/student/exams/${examId}/submit`, data);
  return res.data;
};
export const getStudentExamResults = async (classId) => {
  const res = await api.get(`/student/classes/${classId}/exam-results`);
  return res.data;
};
