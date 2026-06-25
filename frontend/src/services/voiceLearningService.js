import api from './api'

export async function listVoiceLessons() {
  const response = await api.get('/ai/tutor/conversations', {
    params: { type: 'voice' },
  })
  return response.data
}

export async function createVoiceLesson(title = 'New lesson') {
  const response = await api.post('/ai/tutor/conversations', {
    title,
    conversation_type: 'voice',
  })
  return response.data
}

export async function startVoiceLesson(topic, conversationId = null) {
  const response = await api.post('/voice-learning/teach', {
    topic,
    conversation_id: conversationId,
  })
  return response.data
}

export async function askFollowUp(question, conversationId = null) {
  const response = await api.post('/voice-learning/ask', {
    question,
    conversation_id: conversationId,
  })
  return response.data
}

export async function generateQuiz(topic, lessonContent = '', numQuestions = 5) {
  const response = await api.post('/voice-learning/quiz', {
    topic,
    lesson_content: lessonContent,
    num_questions: numQuestions,
  })
  return response.data
}

export async function evaluateAnswer(question, answer) {
  const response = await api.post('/voice-learning/evaluate', {
    question,
    answer,
  })
  return response.data
}

export async function generateRoadmap(goal, durationWeeks = 8) {
  const response = await api.post('/voice-learning/roadmap', {
    goal,
    duration_weeks: durationWeeks,
  })
  return response.data
}

/**
 * Future endpoint placeholder for voice question transcription.
 */
export async function submitVoiceQuestion(_audioBlob, conversationId) {
  return {
    message: 'Voice question transcription will be available in a future update.',
    conversation_id: conversationId,
  }
}
