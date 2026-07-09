import pool from '../db/pool.js'

// GET /api/athletes
export async function getAll(req, res) {
  const { rows } = await pool.query(
    `SELECT a.*, u.label AS training_unit_label
     FROM athletes a
     LEFT JOIN training_units u ON a.training_unit_id = u.id
     ORDER BY a.name ASC`
  )
  res.json(rows)
}

// GET /api/athletes/:id
export async function getById(req, res) {
  const { rows } = await pool.query(
    `SELECT a.*, u.label AS training_unit_label
     FROM athletes a
     LEFT JOIN training_units u ON a.training_unit_id = u.id
     WHERE a.id = $1`,
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Atleta não encontrado' })
  res.json(rows[0])
}

// POST /api/athletes
export async function create(req, res) {
  const { name, gender, birth_date, belt, training_unit_id } = req.body
  if (!name || !gender || !birth_date || !belt || !training_unit_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }
  const { rows } = await pool.query(
    `INSERT INTO athletes (name, gender, birth_date, belt, training_unit_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, gender, birth_date, belt, training_unit_id]
  )
  res.status(201).json(rows[0])
}

// PUT /api/athletes/:id
export async function update(req, res) {
  const { name, gender, birth_date, belt, training_unit_id } = req.body
  const { rows } = await pool.query(
    `UPDATE athletes
     SET name=$1, gender=$2, birth_date=$3, belt=$4, training_unit_id=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [name, gender, birth_date, belt, training_unit_id, req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Atleta não encontrado' })
  res.json(rows[0])
}

// DELETE /api/athletes/:id
export async function remove(req, res) {
  const { rowCount } = await pool.query(
    'DELETE FROM athletes WHERE id = $1', [req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Atleta não encontrado' })
  res.status(204).send()
}
