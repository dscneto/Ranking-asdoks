import pool from '../db/pool.js'

// GET /api/competition-types
export async function getAll(req, res) {
  const { rows } = await pool.query(
    'SELECT * FROM competition_types ORDER BY points_gold DESC'
  )
  res.json(rows)
}

// GET /api/competition-types/:id
export async function getById(req, res) {
  const { rows } = await pool.query(
    'SELECT * FROM competition_types WHERE id = $1', [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Tipo não encontrado' })
  res.json(rows[0])
}

// POST /api/competition-types
export async function create(req, res) {
  const { label, points_enrollment, points_gold, points_silver, points_bronze } = req.body
  if (!label) return res.status(400).json({ error: 'Nome do tipo é obrigatório' })
  const { rows } = await pool.query(
    `INSERT INTO competition_types (label, points_enrollment, points_gold, points_silver, points_bronze)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [label, points_enrollment ?? 0, points_gold ?? 0, points_silver ?? 0, points_bronze ?? 0]
  )
  res.status(201).json(rows[0])
}

// PUT /api/competition-types/:id
export async function update(req, res) {
  const { label, points_enrollment, points_gold, points_silver, points_bronze } = req.body
  const { rows } = await pool.query(
    `UPDATE competition_types
     SET label=$1, points_enrollment=$2, points_gold=$3, points_silver=$4, points_bronze=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [label, points_enrollment, points_gold, points_silver, points_bronze, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Tipo não encontrado' })
  res.json(rows[0])
}

// DELETE /api/competition-types/:id
export async function remove(req, res) {
  // Verifica se está em uso
  const { rows } = await pool.query(
    'SELECT id FROM competitions WHERE competition_type_id = $1 LIMIT 1', [req.params.id]
  )
  if (rows[0]) {
    return res.status(409).json({ error: 'Este tipo está em uso por competições e não pode ser excluído' })
  }
  await pool.query('DELETE FROM competition_types WHERE id = $1', [req.params.id])
  res.status(204).send()
}
