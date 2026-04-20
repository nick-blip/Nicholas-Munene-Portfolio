const BASE = '/api'
const tok = () => localStorage.getItem('token')

async function req(method, path, body, isForm = false) {
  const headers = {}
  if (!isForm) headers['Content-Type'] = 'application/json'
  if (tok()) headers['Authorization'] = `Bearer ${tok()}`
  const res = await fetch(BASE + path, {
    method, headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  })
  if (res.status === 401) { localStorage.removeItem('token'); window.location.hash = '#/login'; return }
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Request failed') }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('text/csv')) return res.blob()
  return res.json()
}

export const api = {
  login: (u, p) => req('POST', '/auth/login', { username: u, password: p }),
  me: () => req('GET', '/auth/me'),
  changePw: (c, n) => req('POST', '/auth/change-password', { current_password: c, new_password: n }),

  trainModels: () => req('POST', '/models/train?use_synthetic=true'),
  modelStatus: () => req('GET', '/models/status'),
  metrics: () => req('GET', '/models/metrics'),
  predictStudent: (data) => req('POST', '/models/predict/student', data),
  predictBatch: (file) => { const fd = new FormData(); fd.append('file', file); return req('POST', '/models/predict/batch', fd, true) },
  sampleCSV: () => req('GET', '/models/sample-csv'),

  getStudents: () => req('GET', '/students/'),
  countStudents: () => req('GET', '/students/count'),
  addStudent: (data) => req('POST', '/students/', data),
  deleteStudent: (id) => req('DELETE', `/students/${id}`),
  seedSynthetic: (n) => req('POST', `/students/seed-synthetic?n=${n}`),
  uploadCSV: (file) => { const fd = new FormData(); fd.append('file', file); return req('POST', '/students/upload-csv', fd, true) },
  downloadTemplate: () => req('GET', '/students/download-template'),
  getPredictions: () => req('GET', '/students/predictions'),
  getAnalytics: () => req('GET', '/students/analytics'),
}
