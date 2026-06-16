import api from './api'

export function parseExamResponse(exam) {
  if (!exam) {
    throw new Error('Empty exam response')
  }

  if (typeof exam === 'object') {
    return exam
  }

  const trimmed = String(exam).trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('No JSON found in exam response')
  }

  return JSON.parse(jsonMatch[0])
}

export async function generateExam(data) {
  const response = await api.post('/ai/exam/', {
    subject: data.subject,
    difficulty: data.difficulty,
    questions: data.questions,
  })

  return response.data
}

export async function generateExamFromLesson(data) {
  const response = await api.post('/ai/exam/from-lesson', {
    lesson_text: data.lessonText,
    conversation_context: data.conversationContext || '',
    subject: data.subject || 'Lesson Quiz',
    questions: data.questions || 5,
  })

  return response.data
}

export async function submitExamResult(data) {
  const response = await api.post('/ai/exam/submit', {
    subject: data.subject,
    score: data.score,
    total: data.total,
    weak_topics: data.weakTopics || [],
    wrong_answers: data.wrongAnswers || [],
  })

  return response.data
}

export function normalizeAnswer(value) {
  return String(value || '').trim().toLowerCase()
}

export function isAnswerCorrect(selected, correct) {
  return normalizeAnswer(selected) === normalizeAnswer(correct)
}

export function buildWeakTopics(questions, answers) {
  const topics = questions
    .map((question, index) => {
      if (isAnswerCorrect(answers[index], question.answer)) return null
      return question.topic || question.question?.split(' ').slice(0, 4).join(' ')
    })
    .filter(Boolean)

  return [...new Set(topics)]
}

export function buildWrongAnswers(questions, answers) {
  return questions
    .map((question, index) => {
      if (isAnswerCorrect(answers[index], question.answer)) return null
      return {
        question: question.question,
        selected: answers[index] || '',
        correct: question.answer,
        topic: question.topic || '',
      }
    })
    .filter(Boolean)
}
