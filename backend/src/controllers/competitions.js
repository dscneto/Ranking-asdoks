import pool from '../db/pool.js'

// GET /api/competitions
export async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT c.*, ct.label AS competition_type_label,
            ct.points_enrollment, ct.points_gold, ct.points_silver, ct.points_bronze
     FROM competitions c
     LEFT JOIN competition_types ct ON c.competition_type_id = ct.id
     ORDER BY c.date DESC`
  )
  res.json(rows)
}

// GET /api/competitions/:id
export async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT c.*, ct.label AS competition_type_label,
            ct.points_enrollment, ct.points_gold, ct.points_silver, ct.points_bronze
     FROM competitions c
     LEFT JOIN competition_types ct ON c.competition_type_id = ct.id
     WHERE c.id = $1`,
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Competição não encontrada' })
  res.json(rows[0])
}

// POST /api/competitions
export async function create(req, res) {
  const { name, date, location, competition_type_id } = req.body
  if (!name || !date || !location || !competition_type_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }
  const { rows } = await pool.query(
    `INSERT INTO competitions (name, date, location, competition_type_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, date, location, competition_type_id]
  )
  res.status(201).json(rows[0])
}

// PUT /api/competitions/:id
export async function update(req, res) {
  const { name, date, location, competition_type_id } = req.body
  const { rows } = await pool.query(
    `UPDATE competitions
     SET name=$1, date=$2, location=$3, competition_type_id=$4, updated_at=NOW()
     WHERE id=$5 RETURNING *`,
    [name, date, location, competition_type_id, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Competição não encontrada' })
  res.json(rows[0])
}

// DELETE /api/competitions/:id
export async function remove(req, res) {
  const { rowCount } = await pool.query(
    'DELETE FROM competitions WHERE id = $1', [req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Competição não encontrada' })
  res.status(204).send()
}
