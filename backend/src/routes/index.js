import { Router } from 'express'
import * as athletes from '../controllers/athletes.js'
import * as competitions from '../controllers/competitions.js'
import * as competitionTypes from '../controllers/competitionTypes.js'
import * as trainingUnits from '../controllers/trainingUnits.js'
import * as results from '../controllers/results.js'
import * as auth from '../controllers/auth.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', auth.login)
router.get ('/auth/me',    protect, auth.me)

// ─── Usuários ─────────────────────────────────────────────────────────────────
router.get   ('/users',      protect, auth.getUsers)
router.post  ('/users',      protect, auth.createUser)
router.put   ('/users/:id',  protect, auth.updateUser)
router.delete('/users/:id',  protect, auth.deleteUser)

// ─── Atletas ──────────────────────────────────────────────────────────────────
router.get   ('/athletes',             athletes.getAll)
router.get   ('/athletes/:id',         athletes.getById)
router.post  ('/athletes',             protect, athletes.create)
router.put   ('/athletes/:id',         protect, athletes.update)
router.delete('/athletes/:id',         protect, athletes.remove)
router.get   ('/athletes/:id/history', results.getAthleteHistory)

// ─── Competições ──────────────────────────────────────────────────────────────
router.get   ('/competitions',      competitions.getAll)
router.get   ('/competitions/:id',  competitions.getById)
router.post  ('/competitions',      protect, competitions.create)
router.put   ('/competitions/:id',  protect, competitions.update)
router.delete('/competitions/:id',  protect, competitions.remove)

// ─── Tipos de competição ──────────────────────────────────────────────────────
router.get   ('/competition-types',      competitionTypes.getAll)
router.get   ('/competition-types/:id',  competitionTypes.getById)
router.post  ('/competition-types',      protect, competitionTypes.create)
router.put   ('/competition-types/:id',  protect, competitionTypes.update)
router.delete('/competition-types/:id',  protect, competitionTypes.remove)

// ─── Unidades de treinamento ──────────────────────────────────────────────────
router.get   ('/training-units',     protect, trainingUnits.getAll)
router.post  ('/training-units',     protect, trainingUnits.create)
router.put   ('/training-units/:id', protect, trainingUnits.update)
router.delete('/training-units/:id', protect, trainingUnits.remove)

// ─── Resultados & Ranking ─────────────────────────────────────────────────────
router.get ('/results/all', results.getAll)
router.get ('/results',       protect, results.getByCompetitionAndModality)
router.post('/results/save',  protect, results.saveResults)
router.get ('/ranking',       results.getRanking)

export default router