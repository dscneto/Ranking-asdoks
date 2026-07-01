/**
 * storage.js
 * Camada de persistência via localStorage.
 * Fase 1 apenas — na Fase 2 isso será substituído pela API REST.
 */
import { DEFAULT_COMPETITION_TYPES, DEFAULT_TRAINING_UNITS } from '../data/constants'
import { uid } from './helpers'

const PREFIX = 'asdoks:'

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch {}
}

function makeTable(key) {
  return {
    getAll:       ()       => read(key),
    getById:      (id)     => read(key).find((i) => i.id === id) || null,
    add:          (item)   => {
      const all     = read(key)
      const newItem = { id: uid(), createdAt: new Date().toISOString(), ...item }
      write(key, [...all, newItem])
      return newItem
    },
    update:       (id, patch) => {
      const all = read(key)
      const idx = all.findIndex((i) => i.id === id)
      if (idx === -1) return null
      all[idx] = { ...all[idx], ...patch, id, updatedAt: new Date().toISOString() }
      write(key, all)
      return all[idx]
    },
    remove:       (id)     => { write(key, read(key).filter((i) => i.id !== id)) },
    replaceAll:   (items)  => write(key, items),
    count:        ()       => read(key).length,
  }
}

export const db = {
  athletes:         makeTable('athletes'),
  competitions:     makeTable('competitions'),
  competitionTypes: makeTable('competitionTypes'),
  trainingUnits:    makeTable('trainingUnits'),
  results:          makeTable('results'),

  seedIfEmpty() {
    if (this.competitionTypes.count() === 0)
      DEFAULT_COMPETITION_TYPES.forEach((t) =>
        this.competitionTypes.add({ label: t.label, points: t.points, slug: t.id })
      )
    if (this.trainingUnits.count() === 0)
      DEFAULT_TRAINING_UNITS.forEach((u) => this.trainingUnits.add({ label: u.label }))
  },

  exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      athletes:         this.athletes.getAll(),
      competitions:     this.competitions.getAll(),
      competitionTypes: this.competitionTypes.getAll(),
      trainingUnits:    this.trainingUnits.getAll(),
      results:          this.results.getAll(),
    }
  },

  importAll(data) {
    this.athletes.replaceAll(data.athletes || [])
    this.competitions.replaceAll(data.competitions || [])
    this.competitionTypes.replaceAll(data.competitionTypes || [])
    this.trainingUnits.replaceAll(data.trainingUnits || [])
    this.results.replaceAll(data.results || [])
  },

  clearAll() {
    ['athletes','competitions','competitionTypes','trainingUnits','results']
      .forEach((k) => localStorage.removeItem(PREFIX + k))
  },
}
