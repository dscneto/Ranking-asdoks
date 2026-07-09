export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message)

  // Erro de violação de constraint do PostgreSQL
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Operação inválida: registro referenciado por outro dado' })
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' })
  }

  res.status(500).json({ error: 'Erro interno do servidor' })
}
