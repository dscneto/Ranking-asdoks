import pool from '../db/pool.js'

// GET /api/training-units
export async function getAll(req, res) {
  const { rows } = await pool.query('SELECT * FROM training_units ORDER BY label ASC')
  res.json(rows)
}

// POST /api/training-units
export async function create(req, res) {
  const { label } = req.body
  if (!label) return res.status(400).json({ error: 'Nome da unidade é obrigatório' })
  const { rows } = await pool.query(
    'INSERT INTO training_units (label) VALUES ($1) RETURNING *', [label]
  )
  res.status(201).json(rows[0])
}

// PUT /api/training-units/:id
export async function update(req, res) {
  const { label } = req.body
  const { rows } = await pool.query(
    'UPDATE training_units SET label=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
    [label, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Unidade não encontrada' })
  res.json(rows[0])
}

// DELETE /api/training-units/:id
export async function remove(req, res) {
  const { rows } = await pool.query(
    'SELECT id FROM athletes WHERE training_unit_id = $1 LIMIT 1', [req.params.id]
  )
  if (rows[0]) {
    return res.status(409).json({ error: 'Esta unidade está em uso por atletas e não pode ser removida' })
  }
  await pool.query('DELETE FROM training_units WHERE id = $1', [req.params.id])
  res.status(204).send()
}
