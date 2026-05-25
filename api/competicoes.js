// api/competicoes.js
// =====================================================
// ENDPOINT: /api/competicoes
//
//   GET    /api/competicoes   → lista todas
//   POST   /api/competicoes   → cria nova
//   PUT    /api/competicoes   → atualiza (id no body)
//   DELETE /api/competicoes   → remove (id no body)
// =====================================================

const pool = require('./_db');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ---- GET: lista todas as competições ----
    if (req.method === 'GET') {
      const resultado = await pool.query(`
        SELECT
          c.*,
          -- Busca os resultados de cada competição como JSON
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id',         r.id,
                'atletaId',   r.atleta_id,
                'modalidade', r.modalidade,
                'colocacao',  r.colocacao
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS resultados
        FROM competicoes c
        LEFT JOIN resultados r ON r.competicao_id = c.id
        GROUP BY c.id
        ORDER BY c.data DESC
      `);

      return res.status(200).json(resultado.rows);
    }

    // ---- POST: cria nova competição ----
    if (req.method === 'POST') {
      const { tipo, nome, data, local } = req.body;

      if (!tipo || !nome || !data || !local) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      const resultado = await pool.query(
        `INSERT INTO competicoes (tipo, nome, data, local)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [tipo, nome, data, local]
      );

      // Retorna com array de resultados vazio (competição nova)
      return res.status(201).json({ ...resultado.rows[0], resultados: [] });
    }

    // ---- PUT: atualiza competição ----
    if (req.method === 'PUT') {
      const { id, tipo, nome, data, local } = req.body;

      if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

      const resultado = await pool.query(
        `UPDATE competicoes
         SET tipo=$1, nome=$2, data=$3, local=$4
         WHERE id=$5
         RETURNING *`,
        [tipo, nome, data, local, id]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Competição não encontrada' });
      }

      return res.status(200).json(resultado.rows[0]);
    }

    // ---- DELETE: remove competição ----
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

      const resultado = await pool.query(
        'DELETE FROM competicoes WHERE id=$1 RETURNING id',
        [id]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Competição não encontrada' });
      }

      return res.status(200).json({ mensagem: 'Competição removida com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (erro) {
    console.error('Erro em /api/competicoes:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
