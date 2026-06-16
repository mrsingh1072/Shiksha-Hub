import api from './api'

export async function deleteHistoryRecord(historyId) {
  const response = await api.delete(`/history/${historyId}`)
  return response.data
}

export async function getHistoryByType(type) {
  const response = await api.get(`/history/type/${type}`)
  return response.data
}
