/**
 * db.js
 * Camada de persistência usando localStorage.
 * Cada "tabela" é um array de objetos guardado sob uma chave própria.
 * Expõe uma API simples de CRUD (db.athletes.getAll(), db.athletes.add(), etc).
 */

const DB_PREFIX = 'karateRanking:';
const DB_VERSION = 1;

const DB_KEYS = {
  athletes: `${DB_PREFIX}athletes`,
  competitions: `${DB_PREFIX}competitions`,
  competitionTypes: `${DB_PREFIX}competitionTypes`,
  trainingUnits: `${DB_PREFIX}trainingUnits`,
  results: `${DB_PREFIX}results`,
  meta: `${DB_PREFIX}meta`,
};

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readRaw(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erro ao ler ${key} do localStorage:`, err);
    return fallback;
  }
}

function writeRaw(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Erro ao gravar ${key} no localStorage:`, err);
    return false;
  }
}

/**
 * Cria uma "tabela" CRUD simples sobre uma chave do localStorage.
 */
function createTable(key) {
  return {
    getAll() {
      return readRaw(key, []);
    },
    getById(id) {
      return this.getAll().find((item) => item.id === id) || null;
    },
    add(item) {
      const all = this.getAll();
      const newItem = { id: uid(), createdAt: new Date().toISOString(), ...item };
      all.push(newItem);
      writeRaw(key, all);
      return newItem;
    },
    update(id, patch) {
      const all = this.getAll();
      const idx = all.findIndex((item) => item.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...patch, id, updatedAt: new Date().toISOString() };
      writeRaw(key, all);
      return all[idx];
    },
    remove(id) {
      const all = this.getAll();
      const filtered = all.filter((item) => item.id !== id);
      writeRaw(key, filtered);
      return filtered.length !== all.length;
    },
    replaceAll(items) {
      writeRaw(key, items);
      return items;
    },
    count() {
      return this.getAll().length;
    },
  };
}

const db = {
  athletes: createTable(DB_KEYS.athletes),
  competitions: createTable(DB_KEYS.competitions),
  competitionTypes: createTable(DB_KEYS.competitionTypes),
  trainingUnits: createTable(DB_KEYS.trainingUnits),
  results: createTable(DB_KEYS.results),

  /**
   * Garante que os dados padrão (tipos de competição, unidades) existam
   * na primeira execução, sem sobrescrever o que o usuário já editou.
   */
  seedIfEmpty() {
    if (this.competitionTypes.count() === 0) {
      DEFAULT_COMPETITION_TYPES.forEach((type) => {
        this.competitionTypes.add({
          label: type.label,
          points: type.points,
          isDefault: true,
          slug: type.id,
        });
      });
    }
    if (this.trainingUnits.count() === 0) {
      DEFAULT_TRAINING_UNITS.forEach((unit) => {
        this.trainingUnits.add({ label: unit.label });
      });
    }
  },

  /**
   * Exporta todo o banco como um objeto único (para backup/exportação).
   */
  exportAll() {
    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      athletes: this.athletes.getAll(),
      competitions: this.competitions.getAll(),
      competitionTypes: this.competitionTypes.getAll(),
      trainingUnits: this.trainingUnits.getAll(),
      results: this.results.getAll(),
    };
  },

  /**
   * Importa um backup gerado por exportAll(), substituindo os dados atuais.
   */
  importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Arquivo de backup inválido.');
    this.athletes.replaceAll(data.athletes || []);
    this.competitions.replaceAll(data.competitions || []);
    this.competitionTypes.replaceAll(data.competitionTypes || []);
    this.trainingUnits.replaceAll(data.trainingUnits || []);
    this.results.replaceAll(data.results || []);
  },

  /**
   * Limpa todos os dados (usado em "resetar sistema").
   */
  clearAll() {
    Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
