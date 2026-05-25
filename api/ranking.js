// api/ranking.js
// =====================================================
// ENDPOINT: /api/ranking
//
//   GET /api/ranking                     → ranking geral
//   GET /api/ranking?genero=feminino     → só feminino
//   GET /api/ranking?modalidade=kumite   → só kumitê
//   GET /api/ranking?categoriaIdade=sub16 → só sub-16
//
// O cálculo dos pontos é feito direto no SQL,
// o que é muito mais eficiente do que baixar tudo
// e calcular no JavaScript.
// =====================================================

const pool = require('./_db');

// Limites de idade por categoria
const CATEGORIAS_IDADE = [
  { id: 'sub10',  minAnos: 0,  maxAnos: 9  },
  { id: 'sub12',  minAnos: 10, maxAnos: 11 },
  { id: 'sub14',  minAnos: 12, maxAnos: 13 },
  { id: 'sub16',  minAnos: 14, maxAnos: 15 },
  { id: 'sub18',  minAnos: 16, maxAnos: 17 },
  { id: 'adulto', minAnos: 18, maxAnos: 34 },
  { id: 'master', minAnos: 35, maxAnos: 99  },
];

// SQL CASE que transforma tipo+modalidade+colocacao em pontos
// Extraído como constante para não repetir no código
const CASE_PONTOS = `
  CASE
    WHEN r.modalidade = 'kumite' THEN
      CASE c.tipo
        WHEN 'mundial'    THEN CASE r.colocacao WHEN 'ouro' THEN 100 WHEN 'prata' THEN 70 WHEN 'bronze' THEN 50 ELSE 20 END
        WHEN 'pan'        THEN CASE r.colocacao WHEN 'ouro' THEN 80  WHEN 'prata' THEN 55 WHEN 'bronze' THEN 40 ELSE 15 END
        WHEN 'brasileiro' THEN CASE r.colocacao WHEN 'ouro' THEN 60  WHEN 'prata' THEN 40 WHEN 'bronze' THEN 30 ELSE 10 END
        WHEN 'baiano'     THEN CASE r.colocacao WHEN 'ouro' THEN 30  WHEN 'prata' THEN 20 WHEN 'bronze' THEN 15 ELSE 5  END
        WHEN 'clube'      THEN CASE r.colocacao WHEN 'ouro' THEN 15  WHEN 'prata' THEN 10 WHEN 'bronze' THEN 7  ELSE 3  END
        ELSE 0
      END
    WHEN r.modalidade = 'kata' THEN
      CASE c.tipo
        WHEN 'mundial'    THEN CASE r.colocacao WHEN 'ouro' THEN 100 WHEN 'prata' THEN 70 WHEN 'bronze' THEN 50 ELSE 20 END
        WHEN 'pan'        THEN CASE r.colocacao WHEN 'ouro' THEN 80  WHEN 'prata' THEN 55 WHEN 'bronze' THEN 40 ELSE 15 END
        WHEN 'brasileiro' THEN CASE r.colocacao WHEN 'ouro' THEN 60  WHEN 'prata' THEN 40 WHEN 'bronze' THEN 30 ELSE 10 END
        WHEN 'baiano'     THEN CASE r.colocacao WHEN 'ouro' THEN 30  WHEN 'prata' THEN 20 WHEN 'bronze' THEN 15 ELSE 5  END
        WHEN 'clube'      THEN CASE r.colocacao WHEN 'ouro' THEN 15  WHEN 'prata' THEN 10 WHEN 'bronze' THEN 7  ELSE 3  END
        ELSE 0
      END
    ELSE 0
  END
`;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido' });

  try {
    const { genero, modalidade, categoriaIdade } = req.query;

    // Monta filtros dinamicamente
    const condicoes = [];
    const params    = [];
    let   idx       = 1;

    if (genero && genero !== 'todos') {
      condicoes.push(`a.genero = $${idx++}`);
      params.push(genero);
    }

    if (modalidade && modalidade !== 'geral') {
      condicoes.push(`(r.modalidade = $${idx++} OR r.modalidade IS NULL)`);
      params.push(modalidade);
    }

    // Filtro de idade: converte categoria em faixa de datas de nascimento
    if (categoriaIdade && categoriaIdade !== 'todos') {
      const cat = CATEGORIAS_IDADE.find(c => c.id === categoriaIdade);
      if (cat) {
        // Calcula datas de nascimento correspondentes à faixa etária
        condicoes.push(`
          DATE_PART('year', AGE(NOW(), a.nascimento)) >= $${idx++}
          AND DATE_PART('year', AGE(NOW(), a.nascimento)) <= $${idx++}
        `);
        params.push(cat.minAnos, cat.maxAnos);
      }
    }

    const whereClause = condicoes.length > 0
      ? 'WHERE ' + condicoes.join(' AND ')
      : '';

    const resultado = await pool.query(`
      SELECT
        a.id,
        a.nome,
        a.genero,
        a.nascimento,
        a.faixa,
        a.academia,

        -- Total de pontos
        COALESCE(SUM(${CASE_PONTOS}), 0)::int                          AS "totalPontos",

        -- Pontos separados por modalidade
        COALESCE(SUM(CASE WHEN r.modalidade='kumite' THEN ${CASE_PONTOS} ELSE 0 END), 0)::int AS "pontosKumite",
        COALESCE(SUM(CASE WHEN r.modalidade='kata'   THEN ${CASE_PONTOS} ELSE 0 END), 0)::int AS "pontosKata",

        -- Contagem de medalhas
        COUNT(CASE WHEN r.colocacao='ouro'         THEN 1 END)::int AS "totalOuros",
        COUNT(CASE WHEN r.colocacao='prata'        THEN 1 END)::int AS "totalPratas",
        COUNT(CASE WHEN r.colocacao='bronze'       THEN 1 END)::int AS "totalBronzes",
        COUNT(CASE WHEN r.colocacao='participacao' THEN 1 END)::int AS "totalParticipacoes",

        -- Histórico detalhado de cada competição
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'competicaoId',   c.id,
              'competicaoNome', c.nome,
              'competicaoTipo', c.tipo,
              'data',           c.data,
              'modalidade',     r.modalidade,
              'colocacao',      r.colocacao,
              'pontos',         ${CASE_PONTOS}
            ) ORDER BY c.data DESC
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS historico

      FROM atletas a
      LEFT JOIN resultados r  ON r.atleta_id = a.id
      LEFT JOIN competicoes c ON c.id = r.competicao_id
      ${whereClause}
      GROUP BY a.id
      ORDER BY
        "totalPontos"  DESC,
        "totalOuros"   DESC,
        "totalPratas"  DESC
    `, params);

    return res.status(200).json(resultado.rows);

  } catch (erro) {
    console.error('Erro em /api/ranking:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}
