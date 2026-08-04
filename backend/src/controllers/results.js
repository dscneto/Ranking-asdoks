import pool from '../db/pool.js'

// GET /api/results?competitionId=&modality=
export async function getByCompetitionAndModality(req, res) {
  const { competitionId, modality } = req.query
  if (!competitionId || !modality) {
    return res.status(400).json({ error: 'competitionId e modality são obrigatórios' })
  }
  const { rows } = await pool.query(
    `SELECT r.*, a.name AS athlete_name, a.belt, a.gender, a.birth_date
     FROM results r
     JOIN athletes a ON r.athlete_id = a.id
     WHERE r.competition_id = $1 AND r.modality = $2
     ORDER BY a.name ASC`,
    [competitionId, modality]
  )
  res.json(rows)
}

// POST /api/results/save
// Salva todos os resultados de uma competição+modalidade de uma vez
// (substitui os existentes — mesmo comportamento da Fase 1)
export async function saveResults(req, res) {
  const { competitionId, modality, entries } = req.body
  // entries: [{ athleteId, enrolled, placement }]

  if (!competitionId || !modality || !Array.isArray(entries)) {
    return res.status(400).json({ error: 'Dados inválidos' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Remove resultados antigos desta combinação
    await client.query(
      'DELETE FROM results WHERE competition_id = $1 AND modality = $2',
      [competitionId, modality]
    )

    // Insere os novos (apenas os que têm inscrição ou colocação)
    const filtered = entries.filter(e => e.enrolled || e.placement)
    for (const entry of filtered) {
      await client.query(
        `INSERT INTO results (athlete_id, competition_id, modality, enrolled, placement)
         VALUES ($1, $2, $3, $4, $5)`,
        [entry.athleteId, competitionId, modality, entry.enrolled ?? false, entry.placement || null]
      )
    }

    await client.query('COMMIT')
    res.json({ saved: filtered.length })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// GET /api/ranking?gender=&ageCategoryId=&modality=&coachId=&trainingUnitId=
export async function getRanking(req, res) {
  const { gender, ageCategoryId, modality, coachId, trainingUnitId } = req.query

  const AGE_FILTERS = {
    mirim_a: [0, 5],
    mirim_b: [6, 7],
    mirim_c: [8, 9],
    infantil_a: [10, 11],
    infantil_b: [12, 13],
    infanto: [14, 15],
    juvenil: [16, 17],
    senior_a: [18, 34],
    senior_b: [35, 44],
    senior_c: [45, 999],
  }

  const conditions = ['1=1']
  const params = []

  if (gender) {
    params.push(gender)
    conditions.push(`a.gender = $${params.length}`)
  }

  if (ageCategoryId && AGE_FILTERS[ageCategoryId]) {
    const [min, max] = AGE_FILTERS[ageCategoryId]
    params.push(min, max)
    conditions.push(
      `EXTRACT(YEAR FROM AGE(a.birth_date)) BETWEEN $${params.length - 1} AND $${params.length}`
    )
  }

  if (trainingUnitId) {
    params.push(trainingUnitId)
    conditions.push(`a.training_unit_id = $${params.length}`)
  }

  if (coachId) {
    params.push(coachId)
    conditions.push(
      `EXISTS (SELECT 1 FROM athlete_coaches ac WHERE ac.athlete_id = a.id AND ac.coach_id = $${params.length})`
    )
  }

  let modalityCondition = ''
  if (modality) {
    params.push(modality)
    modalityCondition = `AND r.modality = $${params.length}`
  }

  const sql = `
    SELECT
      a.id,
      a.name,
      a.gender,
      a.birth_date,
      a.belt,
      a.training_unit_id,
      u.label AS training_unit_label,
      EXTRACT(YEAR FROM AGE(a.birth_date))::int AS age,
      COALESCE(SUM(
        CASE WHEN r.enrolled THEN ct.points_enrollment ELSE 0 END +
        CASE r.placement
          WHEN 'gold'   THEN ct.points_gold
          WHEN 'silver' THEN ct.points_silver
          WHEN 'bronze' THEN ct.points_bronze
          ELSE 0
        END
      ), 0) AS total_points,
      COUNT(DISTINCT r.competition_id) AS competitions_count
    FROM athletes a
    LEFT JOIN training_units u ON a.training_unit_id = u.id
    LEFT JOIN results r ON r.athlete_id = a.id ${modalityCondition}
    LEFT JOIN competitions c ON r.competition_id = c.id
    LEFT JOIN competition_types ct ON c.competition_type_id = ct.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY a.id, a.name, a.gender, a.birth_date, a.belt, a.training_unit_id, u.label
    ORDER BY total_points DESC, a.name ASC
  `

  const { rows } = await pool.query(sql, params)
  res.json(rows)
}

// GET /api/athletes/:id/history
// Histórico completo de um atleta com pontuação calculada
export async function getAthleteHistory(req, res) {
  const { rows } = await pool.query(
    `SELECT
      r.*,
      c.name  AS competition_name,
      c.date  AS competition_date,
      ct.label AS competition_type_label,
      (
        CASE WHEN r.enrolled THEN ct.points_enrollment ELSE 0 END +
        CASE r.placement
          WHEN 'gold'   THEN ct.points_gold
          WHEN 'silver' THEN ct.points_silver
          WHEN 'bronze' THEN ct.points_bronze
          ELSE 0
        END
      ) AS points
     FROM results r
     JOIN competitions c ON r.competition_id = c.id
     JOIN competition_types ct ON c.competition_type_id = ct.id
     WHERE r.athlete_id = $1
     ORDER BY c.date DESC`,
    [req.params.id]
  )
  const totalPoints = rows.reduce((sum, r) => sum + Number(r.points), 0)
  res.json({ results: rows, totalPoints })
}

// GET /api/results/all — retorna todos os resultados para cache offline
export async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT r.*,
            c.name  AS competition_name,
            c.date  AS competition_date,
            ct.label AS competition_type_label,
            (
              CASE WHEN r.enrolled THEN ct.points_enrollment ELSE 0 END +
              CASE r.placement
                WHEN 'gold'   THEN ct.points_gold
                WHEN 'silver' THEN ct.points_silver
                WHEN 'bronze' THEN ct.points_bronze
                ELSE 0
              END
            ) AS points
     FROM results r
     JOIN competitions c ON r.competition_id = c.id
     JOIN competition_types ct ON c.competition_type_id = ct.id
     ORDER BY c.date DESC`
  )
  res.json(rows)
}
