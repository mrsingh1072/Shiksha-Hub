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
  const prompt = `Teach me about "${topic}" as a structured voice lesson.

Include:
- Overview
- Key concepts
- Real examples
- Code snippets where useful
- Short practice questions at the end`

  const response = await api.post('/ai/tutor/', {
    question: prompt,
    conversation_id: conversationId,
    conversation_type: 'voice',
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
