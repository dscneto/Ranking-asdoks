/**
 * api.js — Fase 2
 * Substitui o storage.js. Mesma interface, mas faz fetch para o backend.
 * Os componentes e pages não precisam saber de onde os dados vêm.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

const get    = (path)         => request('GET',    path)
const post   = (path, body)   => request('POST',   path, body)
const put    = (path, body)   => request('PUT',    path, body)
const del    = (path)         => request('DELETE', path)

// ─── Atletas ──────────────────────────────────────────────────────────────────
export const athletesApi = {
  getAll:  ()          => get('/athletes'),
  getById: (id)        => get(`/athletes/${id}`),
  create:  (data)      => post('/athletes', data),
  update:  (id, data)  => put(`/athletes/${id}`, data),
  remove:  (id)        => del(`/athletes/${id}`),
  history: (id)        => get(`/athletes/${id}/history`),
}

// ─── Competições ──────────────────────────────────────────────────────────────
export const competitionsApi = {
  getAll:  ()          => get('/competitions'),
  getById: (id)        => get(`/competitions/${id}`),
  create:  (data)      => post('/competitions', data),
  update:  (id, data)  => put(`/competitions/${id}`, data),
  remove:  (id)        => del(`/competitions/${id}`),
}

// ─── Tipos de competição ──────────────────────────────────────────────────────
export const competitionTypesApi = {
  getAll:  ()          => get('/competition-types'),
  getById: (id)        => get(`/competition-types/${id}`),
  create:  (data)      => post('/competition-types', data),
  update:  (id, data)  => put(`/competition-types/${id}`, data),
  remove:  (id)        => del(`/competition-types/${id}`),
}

// ─── Unidades de treinamento ──────────────────────────────────────────────────
export const trainingUnitsApi = {
  getAll:  ()          => get('/training-units'),
  create:  (data)      => post('/training-units', data),
  update:  (id, data)  => put(`/training-units/${id}`, data),
  remove:  (id)        => del(`/training-units/${id}`),
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
    if (filters.gender)        params.set('gender', filters.gender)
    if (filters.ageCategoryId) params.set('ageCategoryId', filters.ageCategoryId)
    if (filters.modality)      params.set('modality', filters.modality)
    const qs = params.toString()
    return get(`/ranking${qs ? '?' + qs : ''}`)
  },
}
