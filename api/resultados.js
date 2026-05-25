// api/resultados.js
// =====================================================
// ENDPOINT: /api/resultados
//
//   POST   /api/resultados   → registra/atualiza resultado
//   DELETE /api/resultados   → remove resultado
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
    // ---- POST: registra resultado (UPSERT) ----
    // UPSERT = INSERT se não existe, UPDATE se já existe
    if (req.method === 'POST') {
      const { atletaId, competicaoId, modalidade, colocacao } = req.body;

      if (!atletaId || !competicaoId || !modalidade || !colocacao) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      const resultado = await pool.query(
        `INSERT INTO resultados (atleta_id, competicao_id, modalidade, colocacao)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (atleta_id, competicao_id, modalidade)
         DO UPDATE SET colocacao = EXCLUDED.colocacao
         RETURNING *`,
        [atletaId, competicaoId, modalidade, colocacao]
      );

      return res.status(201).json(resultado.rows[0]);
    }

    // ---- DELETE: remove resultado ----
    if (req.method === 'DELETE') {
      const { atletaId, competicaoId, modalidade } = req.body;

      await pool.query(
        `DELETE FROM resultados
         WHERE atleta_id=$1 AND competicao_id=$2 AND modalidade=$3`,
        [atletaId, competicaoId, modalidade]
      );

      return res.status(200).json({ mensagem: 'Resultado removido' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (erro) {
    console.error('Erro em /api/resultados:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
