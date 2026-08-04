const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('asdoks_token')
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

const get = (path) => request('GET', path)
const post = (path, body) => request('POST', path, body)
const put = (path, body) => request('PUT', path, body)
const del = (path) => request('DELETE', path)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () => get('/auth/me'),
}

// ─── Usuários ─────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => get('/users'),
  create: (data) => post('/users', data),
  update: (id, data) => put(`/users/${id}`, data),
  remove: (id) => del(`/users/${id}`),
}

// ─── Professores ──────────────────────────────────────────────────────────────
export const coachesApi = {
  getAll: () => get('/coaches'),
  getById: (id) => get(`/coaches/${id}`),
  create: (data) => post('/coaches', data),
  update: (id, data) => put(`/coaches/${id}`, data),
  remove: (id) => del(`/coaches/${id}`),
  ranking: () => get('/coaches/ranking'),
  athletes: (id) => get(`/coaches/${id}/athletes`),
}

// ─── Atletas ──────────────────────────────────────────────────────────────────
export const athletesApi = {
  getAll: () => get('/athletes'),
  getById: (id) => get(`/athletes/${id}`),
  create: (data) => post('/athletes', data),
  update: (id, data) => put(`/athletes/${id}`, data),
  remove: (id) => del(`/athletes/${id}`),
  history: (id) => get(`/athletes/${id}/history`),
  getCoaches: (id) => get(`/athletes/${id}/coaches`),
  updateCoaches: (id, coachIds) => put(`/athletes/${id}/coaches`, { coachIds }),
}

// ─── Competições ──────────────────────────────────────────────────────────────
export const competitionsApi = {
  getAll: () => get('/competitions'),
  getById: (id) => get(`/competitions/${id}`),
  create: (data) => post('/competitions', data),
  update: (id, data) => put(`/competitions/${id}`, data),
  remove: (id) => del(`/competitions/${id}`),
}

// ─── Tipos de competição ──────────────────────────────────────────────────────
export const competitionTypesApi = {
  getAll: () => get('/competition-types'),
  getById: (id) => get(`/competition-types/${id}`),
  create: (data) => post('/competition-types', data),
  update: (id, data) => put(`/competition-types/${id}`, data),
  remove: (id) => del(`/competition-types/${id}`),
}

// ─── Unidades de treinamento ──────────────────────────────────────────────────
export const trainingUnitsApi = {
  getAll: () => get('/training-units'),
  create: (data) => post('/training-units', data),
  update: (id, data) => put(`/training-units/${id}`, data),
  remove: (id) => del(`/training-units/${id}`),
}

// ─── Resultados & Ranking ─────────────────────────────────────────────────────
export const resultsApi = {
  getByCompetitionAndModality: (competitionId, modality) =>
    get(`/results?competitionId=${competitionId}&modality=${modality}`),
  save: (competitionId, modality, entries) =>
    post('/results/save', { competitionId, modality, entries }),
}

export const rankingApi = {
  get: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.ageCategoryId) params.set('ageCategoryId', filters.ageCategoryId)
    if (filters.modality) params.set('modality', filters.modality)
    if (filters.coachId) params.set('coachId', filters.coachId)
    if (filters.trainingUnitId) params.set('trainingUnitId', filters.trainingUnitId)
    const qs = params.toString()
    return get(`/ranking${qs ? '?' + qs : ''}`)
  },
}