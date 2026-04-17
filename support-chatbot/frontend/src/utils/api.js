const BASE = '/api'

function getToken() { return localStorage.getItem('admin_token') }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (res.status === 401) { localStorage.removeItem('admin_token'); window.location.hash = '/login'; return }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Request failed') }
  return res.json()
}

export const api = {
  login: (username, password) => req('POST', '/auth/login', { username, password }),
  me: () => req('GET', '/auth/me'),
  changePassword: (current_password, new_password) => req('POST', '/auth/change-password', { current_password, new_password }),

  sendMessage: (question, timezone) => req('POST', '/chat/message', { question, timezone }),
  rateMessage: (id, rating) => req('POST', `/chat/rate/${id}`, { rating }),
  getLogs: () => req('GET', '/chat/logs'),

  getKB: () => req('GET', '/kb/'),
  createKBEntry: (keywords, answer) => req('POST', '/kb/', { keywords, answer }),
  updateKBEntry: (id, keywords, answer) => req('PUT', `/kb/${id}`, { keywords, answer }),
  deleteKBEntry: (id) => req('DELETE', `/kb/${id}`),
  promoteToKB: (log_id, keywords, answer) => req('POST', `/kb/promote/${log_id}`, { keywords, answer }),

  getAnalytics: () => req('GET', '/analytics/summary'),
}
