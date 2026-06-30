/**
 * scoring.js
 * Regras de negócio: cálculo de pontos por resultado e montagem do ranking.
 *
 * Regra de pontuação (confirmada com o usuário):
 * - Se o atleta se inscreveu na modalidade, ganha os pontos de "inscrição"
 *   do tipo de competição (independente de colocação).
 * - Se além disso ele ficou em 1º, 2º ou 3º, ganha (cumulativamente) os
 *   pontos daquela colocação.
 * - Pontuação total do atleta = soma de tudo, em todas competições/modalidades.
 */

/**
 * Calcula os pontos de UM resultado (uma linha: atleta + competição + modalidade).
 * @param {object} result - { enrolled: bool, placement: 'gold'|'silver'|'bronze'|null }
 * @param {object} competitionType - tipo de competição com .points
 * @returns {number}
 */
function calculateResultPoints(result, competitionType) {
  if (!competitionType || !competitionType.points) return 0;
  let total = 0;
  if (result.enrolled) {
    total += competitionType.points.enrollment || 0;
  }
  if (result.placement && competitionType.points[result.placement] != null) {
    total += competitionType.points[result.placement];
  }
  return total;
}

/**
 * Junta resultados + competições + tipos para produzir uma lista "enriquecida"
 * de resultados, cada um já com os pontos calculados e dados da competição anexados.
 */
function getEnrichedResults() {
  const competitions = db.competitions.getAll();
  const competitionTypes = db.competitionTypes.getAll();
  const results = db.results.getAll();

  const competitionsById = Object.fromEntries(competitions.map((c) => [c.id, c]));
  const typesById = Object.fromEntries(competitionTypes.map((t) => [t.id, t]));

  return results
    .map((r) => {
      const competition = competitionsById[r.competitionId];
      if (!competition) return null;
      const type = typesById[competition.competitionTypeId];
      const points = calculateResultPoints(r, type);
      return {
        ...r,
        competition,
        competitionType: type || null,
        points,
      };
    })
    .filter(Boolean);
}

/**
 * Monta o ranking geral, com filtros opcionais.
 * @param {object} filters - { gender, ageCategoryId, modality }
 * @returns {Array} lista ordenada por pontos desc: { athlete, totalPoints, breakdown }
 */
function buildRanking(filters = {}) {
  const athletes = db.athletes.getAll();
  const enrichedResults = getEnrichedResults();

  const filteredAthletes = athletes.filter((athlete) => {
    if (filters.gender && athlete.gender !== filters.gender) return false;
    const ageCategory = getAgeCategoryFromBirthDate(athlete.birthDate);
    if (filters.ageCategoryId && (!ageCategory || ageCategory.id !== filters.ageCategoryId)) {
      return false;
    }
    return true;
  });

  const resultsByAthlete = {};
  enrichedResults.forEach((r) => {
    if (filters.modality && r.modality !== filters.modality) return;
    if (!resultsByAthlete[r.athleteId]) resultsByAthlete[r.athleteId] = [];
    resultsByAthlete[r.athleteId].push(r);
  });

  const ranking = filteredAthletes.map((athlete) => {
    const athleteResults = resultsByAthlete[athlete.id] || [];
    const totalPoints = athleteResults.reduce((sum, r) => sum + r.points, 0);
    const ageCategory = getAgeCategoryFromBirthDate(athlete.birthDate);
    return {
      athlete,
      ageCategory,
      totalPoints,
      competitionsCount: new Set(athleteResults.map((r) => r.competitionId)).size,
      resultsCount: athleteResults.length,
    };
  });

  ranking.sort((a, b) => b.totalPoints - a.totalPoints);
  return ranking;
}

/**
 * Retorna o histórico completo de um atleta: todas competições/modalidades
 * em que ele tem resultado lançado, ordenado por data desc.
 */
function getAthleteHistory(athleteId) {
  const enrichedResults = getEnrichedResults().filter((r) => r.athleteId === athleteId);
  enrichedResults.sort((a, b) => new Date(b.competition.date) - new Date(a.competition.date));
  const totalPoints = enrichedResults.reduce((sum, r) => sum + r.points, 0);
  return { results: enrichedResults, totalPoints };
}
