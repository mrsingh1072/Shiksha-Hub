export const buildStudentId = (student) => {
  if (student?.studentId) return student.studentId
  if (student?.userId) return student.userId

  const prefix = student?.studentType === 'college' ? 'TTC' : 'TTS'
  return `${prefix}----`
}

export const getEducationDetails = (student = {}) => {
  if (student.studentType === 'college' || student.collegeName || student.degree || student.course) {
    return {
      institutionType: 'College',
      institutionName: student.collegeName || student.branch || student.college || 'College information pending',
      level: student.degree || student.yearSemester || student.semester || 'Academic level pending',
      detail: student.course || student.department || 'Course details pending',
    }
  }

  return {
    institutionType: 'School',
    institutionName: student.schoolName || 'School information pending',
    level: student.studentClass || 'Class information pending',
    detail: 'Academic profile',
  }
}

const getValue = (result, fallback) => (result.status === 'fulfilled' ? result.value : fallback)

const normalizeStudent = (dashboard = {}, profile = {}) => ({
  studentId: dashboard.studentId || dashboard.userId || profile.studentId || profile.userId || '',
  userId: dashboard.userId || profile.userId || '',
  studentType: dashboard.studentType || profile.studentType || '',
  name: dashboard.studentName || dashboard.name || profile.name || 'Student',
  email: dashboard.email || profile.email || '',
  phone: dashboard.phone || profile.phone || '',
  schoolName: dashboard.schoolName || profile.schoolName || '',
  studentClass: dashboard.studentClass || profile.studentClass || '',
  collegeName: dashboard.collegeName || profile.collegeName || profile.college || '',
  degree: dashboard.degree || profile.degree || '',
  course: dashboard.course || profile.course || '',
  yearSemester: dashboard.yearSemester || profile.yearSemester || '',
  branch: dashboard.branch || profile.branch || '',
  semester: dashboard.semester || profile.semester || '',
  division: profile.division || '',
  rollNumber: profile.roll_number || '',
  bio: profile.bio || '',
  profilePhoto: profile.profilePhoto || '',
  emailVerified: profile.emailVerified || false,
  phoneVerified: profile.phoneVerified || false,
  preferences: profile.preferences || {
    language: 'en',
    theme: 'light',
    notifications: {
      assignments: true,
      exams: true,
      tutor: true,
      announcements: true,
    },
  },
})

const normalizeAssignments = (assignments = [], submissions = [], studentEmail = '') => {
  const studentSubmissions = submissions.filter((submission) => submission.student_email === studentEmail)

  return assignments.map((assignment) => {
    const submission = studentSubmissions.find((item) => item.assignment_id === assignment._id)

    // Determine evaluation status
    let evaluationStatus = 'Not submitted'
    if (submission) {
      if (submission.published) evaluationStatus = 'Published'
      else if (submission.teacher_marks !== null && submission.teacher_marks !== undefined) evaluationStatus = 'Evaluated'
      else if (submission.evaluation_status === 'ai_evaluated') evaluationStatus = 'Under Review'
      else evaluationStatus = 'Submitted'
    }

    return {
      id: assignment._id,
      title: assignment.title || 'Untitled assignment',
      subject: assignment.subject || 'General',
      description: assignment.description || '',
      dueDate: assignment.due_date || '',
      teacherName: assignment.teacher_name || '',
      teacherEmail: assignment.teacher_email || '',
      totalMarks: assignment.total_marks || 100,
      status: submission ? 'Submitted' : 'Pending',
      evaluationStatus,
      evaluation: submission?.evaluation || '',
      // Submission details
      submissionId: submission?._id || null,
      submittedAt: submission?.submitted_at || '',
      filePath: submission?.file_path || '',
      originalFilename: submission?.original_filename || '',
      submissionText: submission?.submission_text || '',
      // Marks — only visible if published
      published: submission?.published || false,
      publishedAt: submission?.published_at || '',
      finalMarks: submission?.published ? (submission?.final_marks ?? submission?.teacher_marks) : null,
      teacherFeedback: submission?.published ? (submission?.final_feedback ?? submission?.teacher_feedback ?? '') : '',
      aiFeedback: submission?.published ? (submission?.ai_feedback ?? '') : '',
      aiStrengths: submission?.published ? (submission?.ai_strengths ?? []) : [],
      aiWeaknesses: submission?.published ? (submission?.ai_weaknesses ?? []) : [],
      aiImprovements: submission?.published ? (submission?.ai_improvements ?? []) : [],
    }
  })
}

const normalizeHistory = (history = []) =>
  [...history]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .map((item) => ({
      id: item._id,
      type: item.type || 'activity',
      title: item.title || item.question || `${item.type || 'Activity'} session`,
      answer: item.answer || '',
      subject: item.subject || '',
      score: typeof item.score === 'number' ? item.score : null,
      total: typeof item.total === 'number' ? item.total : null,
      percentage: typeof item.percentage === 'number' ? item.percentage : null,
      passed: typeof item.passed === 'boolean' ? item.passed : null,
      status: item.status || (item.passed == null ? '' : item.passed ? 'Passed' : 'Failed'),
      weakTopics: Array.isArray(item.weak_topics) ? item.weak_topics : [],
      createdAt: item.created_at || '',
    }))

const countHistoryByType = (history, type) =>
  history.filter((item) => item.type === type).length

const ACTIVITY_TYPES = ['chat', 'tutor', 'notes', 'exam', 'assignment']

const computeStudyStreak = (history = [], conversations = []) => {
  const dates = new Set(
    [...history, ...conversations]
      .map((item) => {
        const date = new Date(item.createdAt || item.created_at || item.updated_at || 0)
        if (Number.isNaN(date.getTime())) return null
        return date.toISOString().slice(0, 10)
      })
      .filter(Boolean)
  )

  if (!dates.size) return 0

  let streak = 0
  const cursor = new Date()

  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (!dates.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

const computeWeakSubjects = (exams = [], stats = {}) => {
  const topicCounts = {}

  exams.forEach((exam) => {
    exam.weakTopics.forEach((topic) => {
      if (!topic) return
      topicCounts[topic] = (topicCounts[topic] || 0) + 1
    })
  })

  const fromExams = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)

  if (fromExams.length) return fromExams.slice(0, 6)
  return stats.weakTopics || []
}

const computeStrongSubjects = (exams = []) => {
  const subjectScores = {}

  exams.forEach((exam) => {
    if (exam.percentage == null) return
    const subject = exam.subject || exam.title?.replace('Exam Attempt - ', '') || 'General'
    if (!subjectScores[subject]) {
      subjectScores[subject] = []
    }
    subjectScores[subject].push(exam.percentage)
  })

  return Object.entries(subjectScores)
    .map(([subject, scores]) => ({
      subject,
      average: scores.reduce((sum, value) => sum + value, 0) / scores.length,
    }))
    .filter((item) => item.average >= 70)
    .sort((a, b) => b.average - a.average)
    .map((item) => item.subject)
    .slice(0, 6)
}

const computeStudyTimeMinutes = (lessonsCompleted, tutorSessions, practiceExams) =>
  lessonsCompleted * 20 + tutorSessions * 10 + practiceExams * 15

const formatStudyTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

const countVoiceLessons = (conversations = []) =>
  conversations.filter(
    (conversation) => conversation.conversation_type === 'voice'
  ).length

const countTutorSessions = (conversations = [], fallback = 0) => {
  const tutorChats = conversations.filter(
    (conversation) =>
      !conversation.conversation_type || conversation.conversation_type === 'tutor'
  ).length
  return Math.max(fallback, tutorChats)
}

const computeAverageExamScore = (exams = [], stats = {}) => {
  if (typeof stats.averageExamScore === 'number' && stats.averageExamScore > 0) {
    return stats.averageExamScore
  }

  const scored = exams.filter((exam) => typeof exam.percentage === 'number')
  if (!scored.length) return 0

  const total = scored.reduce((sum, exam) => sum + exam.percentage, 0)
  return Math.round(total / scored.length)
}

export const buildStudentWorkspace = ({
  dashboard = {},
  profile = {},
  assignments = [],
  submissions = [],
  history = [],
  stats = {},
  conversations = [],
  notifications = [],
}) => {
  const student = normalizeStudent(dashboard, profile)
  const normalizedAssignments = normalizeAssignments(assignments, submissions, student.email)
  const normalizedHistory = normalizeHistory(history)
  const pendingAssignments = normalizedAssignments.filter((assignment) => assignment.status === 'Pending')
  const submittedAssignments = normalizedAssignments.filter((assignment) => assignment.status === 'Submitted')
  const examHistoryCount = countHistoryByType(normalizedHistory, 'exam')
  const tutorHistoryCount = countHistoryByType(normalizedHistory, 'tutor')
  const historyActivityTotal = ACTIVITY_TYPES.reduce(
    (sum, type) => sum + countHistoryByType(normalizedHistory, type),
    0
  )
  const tutorSessions = countTutorSessions(
    conversations,
    stats.tutorCount ?? dashboard.tutorCount ?? tutorHistoryCount
  )
  const lessonsCompleted = countVoiceLessons(conversations)
  const practiceExamsAttempted = stats.examCount ?? dashboard.examsGenerated ?? examHistoryCount
  const studyTimeMinutes = computeStudyTimeMinutes(
    lessonsCompleted,
    tutorSessions,
    practiceExamsAttempted
  )
  const assignmentsSubmitted = dashboard.assignmentsSubmitted ?? submittedAssignments.length
  const totalActivities =
    stats.totalActivities ?? dashboard.totalActivities ?? historyActivityTotal
  const examRecords = normalizedHistory.filter((item) => item.type === 'exam')
  const averageExamScore = computeAverageExamScore(examRecords, stats)
  const weakSubjects = computeWeakSubjects(examRecords, stats)
  const strongSubjects = computeStrongSubjects(examRecords)
  const studyStreak = computeStudyStreak(normalizedHistory, conversations)
  const progressBase = assignments.length + practiceExamsAttempted + tutorSessions
  const progressDone = assignmentsSubmitted + practiceExamsAttempted + tutorSessions
  const conversationActivity = conversations.map((conversation) => ({
    id: conversation._id,
    type: conversation.conversation_type === 'voice' ? 'voice' : 'tutor',
    title: conversation.title || (conversation.conversation_type === 'voice' ? 'Voice lesson' : 'Tutor conversation'),
    createdAt: conversation.updated_at || conversation.created_at || '',
  }))
  const mergedRecentActivity = [...normalizedHistory, ...conversationActivity]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)

  return {
    student,
    overview: {
      studyStreak,
      totalActivities,
      pendingAssignments: pendingAssignments.length,
      submittedAssignments: assignmentsSubmitted,
      practiceExamsAttempted,
      tutorSessions,
      lessonsCompleted,
      studyTimeMinutes,
      studyTimeLabel: formatStudyTime(studyTimeMinutes),
      averageExamScore,
      weakTopics: weakSubjects,
      overallProgress: progressBase > 0 ? Math.min(100, Math.round((progressDone / progressBase) * 100)) : 0,
    },
    assignments: normalizedAssignments,
    recentAssignments: normalizedAssignments.slice(0, 4),
    recentActivity: mergedRecentActivity,
    exams: examRecords,
    tutor: {
      recentChats: normalizedHistory.filter((item) => item.type === 'tutor').slice(0, 8),
      savedNotes: normalizedHistory.filter((item) => item.type === 'notes').slice(0, 8),
    },
    analytics: {
  accuracy:
    totalActivities > 0
      ? Math.min(
          100,
          Math.round(
            ((assignmentsSubmitted +
              practiceExamsAttempted +
              tutorSessions) /
              totalActivities) *
              100
          )
        )
      : 0,

  strongSubjects,
  weakSubjects,
      learningTrends: [
        { label: 'Assignments', value: assignmentsSubmitted },
        { label: 'Exams', value: practiceExamsAttempted },
        { label: 'Tutor', value: tutorSessions },
        { label: 'Notes', value: stats.notesCount ?? dashboard.notesGenerated ?? 0 },
      ],
    },
    notifications: notifications.map((item) => ({
  id: item._id,
  type: item.type,
  title: item.title,
  message: item.message,
  time: item.created_at,
  read: item.read,
})),
  }
}

export const workspaceFromSettled = ([dashboard, profile, assignments, submissions, history, stats, conversations,notifications]) =>
  buildStudentWorkspace({
    dashboard: getValue(dashboard, {}),
    profile: getValue(profile, {}),
    assignments: getValue(assignments, []),
    submissions: getValue(submissions, []),
    history: getValue(history, []),
    stats: getValue(stats, {}),
    conversations: getValue(conversations, []),
    notifications: getValue(notifications, []),
  })
