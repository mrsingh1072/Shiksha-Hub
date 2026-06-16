import api from './api'

export async function createTutorVoice(text) {
  const response = await api.post('/avatar/voice', { text })
  return response.data
}

export async function fetchVoiceAudio(filename) {
  const response = await api.get(`/avatar/audio/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  })
  return response.data
}
