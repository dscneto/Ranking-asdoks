import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

const JWT_SECRET  = process.env.JWT_SECRET || 'asdoks-secret-fallback'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h'

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND active = TRUE',
    [email.toLowerCase().trim()]
  )
  const user = rows[0]

  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Email ou senha incorretos' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user })
}

// GET /api/users
export async function getUsers(req, res) {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, active, created_at FROM users ORDER BY name ASC'
  )
  res.json(rows)
}

// POST /api/users
export async function createUser(req, res) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
  }

  const hash = await bcrypt.hash(password, 10)
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, active, created_at`,
      [name, email.toLowerCase().trim(), hash, role || 'professor']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este email já está cadastrado' })
    }
    throw err
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  const { name, email, password, role, active } = req.body
  const client = await pool.connect()

  try {
    let passwordClause = ''
    const params = [name, email.toLowerCase().trim(), role, active, req.params.id]

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      passwordClause = ', password = $6'
      params.splice(4, 0, hash)
    }

    const { rows } = await client.query(
      `UPDATE users
       SET name=$1, email=$2, role=$3, active=$4${passwordClause}, updated_at=NOW()
       WHERE id=$${params.length} RETURNING id, name, email, role, active`,
      params
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(rows[0])
  } finally {
    client.release()
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta' })
  }
  const { rowCount } = await pool.query(
    'DELETE FROM users WHERE id = $1', [req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Usuário não encontrado' })
  res.status(204).send()
}