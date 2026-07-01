import { useMemo } from 'react'
import { db } from '../utils/storage'
import { getAgeCategoryFromBirthDate, calculateResultPoints } from '../utils/helpers'

function getEnrichedResults() {
  const competitions     = db.competitions.getAll()
  const competitionTypes = db.competitionTypes.getAll()
  const results          = db.results.getAll()

  const compById = Object.fromEntries(competitions.map((c) => [c.id, c]))
  const typeById = Object.fromEntries(competitionTypes.map((t) => [t.id, t]))

  return results
    .map((r) => {
      const competition = compById[r.competitionId]
      if (!competition) return null
      const type   = typeById[competition.competitionTypeId]
      const points = calculateResultPoints(r, type)
      return { ...r, competition, competitionType: type || null, points }
    })
    .filter(Boolean)
}

export function buildRanking(filters = {}) {
  const athletes        = db.athletes.getAll()
  const enrichedResults = getEnrichedResults()

  const filteredAthletes = athletes.filter((a) => {
    if (filters.gender && a.gender !== filters.gender) return false
    const cat = getAgeCategoryFromBirthDate(a.birthDate)
    if (filters.ageCategoryId && cat?.id !== filters.ageCategoryId) return false
    return true
  })

  const resultsByAthlete = {}
  enrichedResults.forEach((r) => {
    if (filters.modality && r.modality !== filters.modality) return
    if (!resultsByAthlete[r.athleteId]) resultsByAthlete[r.athleteId] = []
    resultsByAthlete[r.athleteId].push(r)
  })

  return filteredAthletes
    .map((athlete) => {
      const athleteResults = resultsByAthlete[athlete.id] || []
      const totalPoints    = athleteResults.reduce((sum, r) => sum + r.points, 0)
      return {
        athlete,
        ageCategory:       getAgeCategoryFromBirthDate(athlete.birthDate),
        totalPoints,
        competitionsCount: new Set(athleteResults.map((r) => r.competitionId)).size,
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

export function getAthleteHistory(athleteId) {
  const results = getEnrichedResults()
    .filter((r) => r.athleteId === athleteId)
    .sort((a, b) => new Date(b.competition.date) - new Date(a.competition.date))
  return {
    results,
    totalPoints: results.reduce((sum, r) => sum + r.points, 0),
  }
}
