import pool from '../db/pool.js'

// GET /api/coaches
export async function getAll(req, res) {
    const { rows } = await pool.query(
        `SELECT c.*, u.label AS training_unit_label
     FROM coaches c
     LEFT JOIN training_units u ON c.training_unit_id = u.id
     ORDER BY c.name ASC`
    )
    res.json(rows)
}

// GET /api/coaches/:id
export async function getById(req, res) {
    const { rows } = await pool.query(
        `SELECT c.*, u.label AS training_unit_label
     FROM coaches c
     LEFT JOIN training_units u ON c.training_unit_id = u.id
     WHERE c.id = $1`,
        [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Professor não encontrado' })
    res.json(rows[0])
}

// POST /api/coaches
export async function create(req, res) {
    const { name, email, phone, training_unit_id, active } = req.body
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' })
    const { rows } = await pool.query(
        `INSERT INTO coaches (name, email, phone, training_unit_id, active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, email || null, phone || null, training_unit_id || null, active ?? true]
    )
    res.status(201).json(rows[0])
}

// PUT /api/coaches/:id
export async function update(req, res) {
    const { name, email, phone, training_unit_id, active } = req.body
    const { rows } = await pool.query(
        `UPDATE coaches
     SET name=$1, email=$2, phone=$3, training_unit_id=$4, active=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
        [name, email || null, phone || null, training_unit_id || null, active ?? true, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Professor não encontrado' })
    res.json(rows[0])
}

// DELETE /api/coaches/:id
export async function remove(req, res) {
    const { rowCount } = await pool.query(
        'DELETE FROM coaches WHERE id = $1', [req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Professor não encontrado' })
    res.status(204).send()
}

// GET /api/coaches/:id/athletes — atletas vinculados a um professor
export async function getAthletes(req, res) {
    const { rows } = await pool.query(
        `SELECT a.*, u.label AS training_unit_label
     FROM athletes a
     JOIN athlete_coaches ac ON ac.athlete_id = a.id
     LEFT JOIN training_units u ON a.training_unit_id = u.id
     WHERE ac.coach_id = $1
     ORDER BY a.name ASC`,
        [req.params.id]
    )
    res.json(rows)
}

// GET /api/coaches/ranking — ranking de professores por pontuação dos alunos
export async function getRanking(req, res) {
    const { rows } = await pool.query(
        `SELECT
       c.id,
       c.name,
       c.email,
       c.phone,
       c.active,
       u.label AS training_unit_label,
       COUNT(DISTINCT ac.athlete_id) AS athletes_count,
       COALESCE(SUM(
         CASE WHEN r.enrolled THEN ct.points_enrollment ELSE 0 END +
         CASE r.placement
           WHEN 'gold'   THEN ct.points_gold
           WHEN 'silver' THEN ct.points_silver
           WHEN 'bronze' THEN ct.points_bronze
           ELSE 0
         END
       ), 0) AS total_points
     FROM coaches c
     LEFT JOIN training_units u        ON c.training_unit_id = u.id
     LEFT JOIN athlete_coaches ac      ON ac.coach_id = c.id
     LEFT JOIN results r               ON r.athlete_id = ac.athlete_id
     LEFT JOIN competitions comp       ON r.competition_id = comp.id
     LEFT JOIN competition_types ct    ON comp.competition_type_id = ct.id
     WHERE c.active = TRUE
     GROUP BY c.id, c.name, c.email, c.phone, c.active, u.label
     ORDER BY total_points DESC, c.name ASC`
    )
    res.json(rows)
}

// PUT /api/athletes/:id/coaches — atualiza professores vinculados a um atleta
export async function updateAthleteCoaches(req, res) {
    const { coachIds } = req.body
    const athleteId = req.params.id

    if (!Array.isArray(coachIds)) {
        return res.status(400).json({ error: 'coachIds deve ser um array' })
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await client.query('DELETE FROM athlete_coaches WHERE athlete_id = $1', [athleteId])
        for (const coachId of coachIds) {
            await client.query(
                'INSERT INTO athlete_coaches (athlete_id, coach_id) VALUES ($1, $2)',
                [athleteId, coachId]
            )
        }
        await client.query('COMMIT')
        res.json({ athleteId, coachIds })
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

// GET /api/athletes/:id/coaches — professores vinculados a um atleta
export async function getAthleteCoaches(req, res) {
    const { rows } = await pool.query(
        `SELECT c.*
     FROM coaches c
     JOIN athlete_coaches ac ON ac.coach_id = c.id
     WHERE ac.athlete_id = $1
     ORDER BY c.name ASC`,
        [req.params.id]
    )
    res.json(rows)
}