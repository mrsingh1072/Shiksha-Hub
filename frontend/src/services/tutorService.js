import api from './api'

export async function listConversations(type = null) {
  const response = await api.get('/ai/tutor/conversations', {
    params: type ? { type } : {},
  })
  return response.data
}

export async function createConversation(conversationType = 'tutor') {
  const response = await api.post('/ai/tutor/conversations', {
    conversation_type: conversationType,
  })
  return response.data
}

export async function getConversation(conversationId) {
  const response = await api.get(`/ai/tutor/conversations/${conversationId}`)
  return response.data
}

export async function renameConversation(conversationId, title) {
  const response = await api.patch(`/ai/tutor/conversations/${conversationId}`, { title })
  return response.data
}

export async function deleteConversation(conversationId) {
  const response = await api.delete(`/ai/tutor/conversations/${conversationId}`)
  return response.data
}

export async function askTutor(question, conversationId = null, conversationType = 'tutor') {
  const response = await api.post('/ai/tutor/', {
    question,
    conversation_id: conversationId,
    conversation_type: conversationType,
  })
  return response.data
}
