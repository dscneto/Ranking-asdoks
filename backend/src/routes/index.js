import { Router } from 'express'
import * as athletes from '../controllers/athletes.js'
import * as competitions from '../controllers/competitions.js'
import * as competitionTypes from '../controllers/competitionTypes.js'
import * as trainingUnits from '../controllers/trainingUnits.js'
import * as results from '../controllers/results.js'

const router = Router()

// ─── Atletas ──────────────────────────────────────────────────────────────────
router.get   ('/athletes',          athletes.getAll)
router.get   ('/athletes/:id',      athletes.getById)
router.post  ('/athletes',          athletes.create)
router.put   ('/athletes/:id',      athletes.update)
router.delete('/athletes/:id',      athletes.remove)

// Histórico do atleta
router.get('/athletes/:id/history', results.getAthleteHistory)

// ─── Competições ──────────────────────────────────────────────────────────────
router.get   ('/competitions',      competitions.getAll)
router.get   ('/competitions/:id',  competitions.getById)
router.post  ('/competitions',      competitions.create)
router.put   ('/competitions/:id',  competitions.update)
router.delete('/competitions/:id',  competitions.remove)

// ─── Tipos de competição ──────────────────────────────────────────────────────
router.get   ('/competition-types',      competitionTypes.getAll)
router.get   ('/competition-types/:id',  competitionTypes.getById)
router.post  ('/competition-types',      competitionTypes.create)
router.put   ('/competition-types/:id',  competitionTypes.update)
router.delete('/competition-types/:id',  competitionTypes.remove)

// ─── Unidades de treinamento ──────────────────────────────────────────────────
router.get   ('/training-units',     trainingUnits.getAll)
router.post  ('/training-units',     trainingUnits.create)
router.put   ('/training-units/:id', trainingUnits.update)
router.delete('/training-units/:id', trainingUnits.remove)

// ─── Resultados & Ranking ─────────────────────────────────────────────────────
router.get ('/results',       results.getByCompetitionAndModality)
router.post('/results/save',  results.saveResults)
router.get ('/ranking',       results.getRanking)

export default router
