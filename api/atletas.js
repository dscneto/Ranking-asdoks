// api/atletas.js
// =====================================================
// ENDPOINT: /api/atletas
//
// No Vercel, cada arquivo em /api é uma "serverless
// function". Ela não fica rodando o tempo todo —
// só executa quando recebe uma requisição.
//
// O Vercel chama a função exportada como 'default'
// passando (req, res) igual ao Express.
//
// Rotas tratadas aqui:
//   GET    /api/atletas       → lista todos
//   POST   /api/atletas       → cria novo
//   PUT    /api/atletas       → atualiza (id no body)
//   DELETE /api/atletas       → remove (id no body)
// =====================================================

const pool = require('./_db');

// Função auxiliar: adiciona os headers de CORS em toda resposta
// Isso permite que o frontend no Vercel acesse esta API
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  // Requisição OPTIONS = "preflight" do navegador
  // O navegador pergunta antes se pode fazer a requisição
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ---- GET: lista todos os atletas ----
    if (req.method === 'GET') {
      const resultado = await pool.query(
        'SELECT * FROM atletas ORDER BY nome ASC'
      );
      return res.status(200).json(resultado.rows);
    }

    // ---- POST: cria novo atleta ----
    if (req.method === 'POST') {
      const { nome, genero, nascimento, faixa, academia } = req.body;

      if (!nome || !genero || !nascimento || !faixa || !academia) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      const resultado = await pool.query(
        `INSERT INTO atletas (nome, genero, nascimento, faixa, academia)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nome, genero, nascimento, faixa, academia]
      );

      return res.status(201).json(resultado.rows[0]);
    }

    // ---- PUT: atualiza atleta ----
    // O ID vem no body: { id, nome, genero, ... }
    if (req.method === 'PUT') {
      const { id, nome, genero, nascimento, faixa, academia } = req.body;

      if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

      const resultado = await pool.query(
        `UPDATE atletas
         SET nome=$1, genero=$2, nascimento=$3, faixa=$4, academia=$5,
             atualizado_em=NOW()
         WHERE id=$6
         RETURNING *`,
        [nome, genero, nascimento, faixa, academia, id]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Atleta não encontrado' });
      }

      return res.status(200).json(resultado.rows[0]);
    }

    // ---- DELETE: remove atleta ----
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) return res.status(400).json({ erro: 'ID é obrigatório' });

      const resultado = await pool.query(
        'DELETE FROM atletas WHERE id=$1 RETURNING id',
        [id]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: 'Atleta não encontrado' });
      }

      return res.status(200).json({ mensagem: 'Atleta removido com sucesso' });
    }

    // Método não suportado
    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (erro) {
    console.error('Erro em /api/atletas:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
