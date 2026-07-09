/**
 * migrate.js
 * Cria todas as tabelas do banco se não existirem.
 * Rode com: npm run migrate
 */
import 'dotenv/config'
import pool from './pool.js'

const SQL = `
-- ─── Unidades de treinamento ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_units (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Atletas ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athletes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               VARCHAR(150) NOT NULL,
  gender             VARCHAR(20)  NOT NULL CHECK (gender IN ('masculino', 'feminino')),
  birth_date         DATE         NOT NULL,
  belt               VARCHAR(20)  NOT NULL,
  training_unit_id   UUID REFERENCES training_units(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tipos de competição ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competition_types (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label              VARCHAR(100) NOT NULL,
  points_enrollment  INTEGER NOT NULL DEFAULT 0,
  points_gold        INTEGER NOT NULL DEFAULT 0,
  points_silver      INTEGER NOT NULL DEFAULT 0,
  points_bronze      INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Competições ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(150) NOT NULL,
  date                 DATE         NOT NULL,
  location             VARCHAR(200) NOT NULL,
  competition_type_id  UUID REFERENCES competition_types(id) ON DELETE RESTRICT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Resultados ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  competition_id  UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  modality        VARCHAR(50) NOT NULL,
  enrolled        BOOLEAN NOT NULL DEFAULT FALSE,
  placement       VARCHAR(10) CHECK (placement IN ('gold', 'silver', 'bronze') OR placement IS NULL),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Um atleta só pode ter um resultado por competição+modalidade
  UNIQUE (athlete_id, competition_id, modality)
);

-- ─── Índices para performance ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_athletes_training_unit ON athletes(training_unit_id);
CREATE INDEX IF NOT EXISTS idx_competitions_type ON competitions(competition_type_id);
CREATE INDEX IF NOT EXISTS idx_results_athlete ON results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_results_competition ON results(competition_id);
CREATE INDEX IF NOT EXISTS idx_results_modality ON results(modality);

-- ─── Seed: tipos de competição padrão ────────────────────────────────────────
INSERT INTO competition_types (label, points_enrollment, points_gold, points_silver, points_bronze)
SELECT * FROM (VALUES
  ('Copas e Municipais',    25,  50,  25, 15),
  ('Campeonatos Estaduais', 45,  90,  45, 25),
  ('Campeonatos Nacionais', 50, 120,  60, 30),
  ('Campeonatos Mundiais',  75, 150,  75, 35)
) AS t(label, pe, pg, ps, pb)
WHERE NOT EXISTS (SELECT 1 FROM competition_types LIMIT 1);
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('🔄 Executando migrations...')
    await client.query(SQL)
    console.log('✅ Banco de dados pronto!')
  } catch (err) {
    console.error('❌ Erro na migration:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
