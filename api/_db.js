// api/_db.js
// =====================================================
// CONEXÃO COM O NEON (PostgreSQL na nuvem)
//
// O underscore no nome (_db.js) é uma convenção do
// Vercel: arquivos começando com _ dentro de /api
// NÃO viram endpoints públicos. É só para uso interno.
//
// O Neon usa SSL obrigatoriamente — por isso
// passamos a connection string com ?sslmode=require
// =====================================================

const { Pool } = require('pg');

// O Vercel injeta automaticamente as variáveis de ambiente
// que você configurar no painel (Settings → Environment Variables)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necessário para o Neon funcionar
  },
  max: 1, // Em funções serverless, 1 conexão por instância é suficiente
});

module.exports = pool;
