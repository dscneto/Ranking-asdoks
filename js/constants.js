/**
 * constants.js
 * Dados fixos do domínio: categorias de idade, faixas, modalidades
 * e os tipos de competição padrão (o usuário pode criar outros).
 */

// ---------- Categorias de idade ----------
// minAge/maxAge são inclusivos. maxAge null = sem limite superior.
const AGE_CATEGORIES = [
  { id: 'mirim_a',    label: 'Mirim A',    minAge: 0,  maxAge: 5    },
  { id: 'mirim_b',    label: 'Mirim B',    minAge: 6,  maxAge: 7    },
  { id: 'mirim_c',    label: 'Mirim C',    minAge: 8,  maxAge: 9    },
  { id: 'infantil_a', label: 'Infantil A', minAge: 10, maxAge: 11   },
  { id: 'infantil_b', label: 'Infantil B', minAge: 12, maxAge: 13   },
  { id: 'infanto',    label: 'Infanto',    minAge: 14, maxAge: 15   },
  { id: 'juvenil',    label: 'Juvenil',    minAge: 16, maxAge: 17   },
  { id: 'senior_a',   label: 'Senior A',   minAge: 18, maxAge: 34   },
  { id: 'senior_b',   label: 'Senior B',   minAge: 35, maxAge: 44   },
  { id: 'senior_c',   label: 'Senior C',   minAge: 45, maxAge: null },
];

/**
 * Calcula a idade (em anos completos) numa data de referência.
 * @param {string} birthDateISO - 'YYYY-MM-DD'
 * @param {Date} [refDate] - data de referência (default: hoje)
 */
function calculateAge(birthDateISO, refDate = new Date()) {
  const birth = new Date(birthDateISO + 'T00:00:00');
  let age = refDate.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    refDate.getMonth() > birth.getMonth() ||
    (refDate.getMonth() === birth.getMonth() && refDate.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

/**
 * Retorna o objeto de categoria de idade correspondente a uma idade.
 */
function getAgeCategoryByAge(age) {
  return AGE_CATEGORIES.find(
    (cat) => age >= cat.minAge && (cat.maxAge === null || age <= cat.maxAge)
  ) || null;
}

/**
 * Retorna a categoria de idade a partir da data de nascimento.
 */
function getAgeCategoryFromBirthDate(birthDateISO, refDate = new Date()) {
  const age = calculateAge(birthDateISO, refDate);
  return getAgeCategoryByAge(age);
}

// ---------- Faixas (graduação) ----------
// Ordem do grau mais baixo ao mais alto, com uma cor para exibição (tag).
const BELTS = [
  { id: 'branca',   label: 'Branca',   color: '#F2EFE9', textColor: '#161512' },
  { id: 'amarela',  label: 'Amarela',  color: '#E8C547', textColor: '#161512' },
  { id: 'vermelha', label: 'Vermelha', color: '#C1272D', textColor: '#F2EFE9' },
  { id: 'laranja',  label: 'Laranja',  color: '#E07A2F', textColor: '#161512' },
  { id: 'verde',    label: 'Verde',    color: '#3E7D44', textColor: '#F2EFE9' },
  { id: 'roxa',     label: 'Roxa',     color: '#6B4193', textColor: '#F2EFE9' },
  { id: 'marrom',   label: 'Marrom',   color: '#6B4226', textColor: '#F2EFE9' },
  { id: 'preta',    label: 'Preta',    color: '#1C1C1C', textColor: '#F2EFE9' },
];

// ---------- Gênero ----------
const GENDERS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino',  label: 'Feminino' },
];

// ---------- Modalidades de competição ----------
const MODALITIES = [
  { id: 'kata_individual',        label: 'Kata Individual' },
  { id: 'kata_equipe',            label: 'Kata Equipe' },
  { id: 'kumite_individual',      label: 'Kumitê Individual' },
  { id: 'kumite_equipe',          label: 'Kumitê Equipe' },
  { id: 'kumite_equipe_revezamento', label: 'Kumitê Equipe com Revezamento' },
];

// ---------- Colocações pontuáveis ----------
const PLACEMENTS = [
  { id: 'gold',   label: '1º lugar (Ouro)',   short: '1º' },
  { id: 'silver', label: '2º lugar (Prata)',  short: '2º' },
  { id: 'bronze', label: '3º lugar (Bronze)', short: '3º' },
];

// ---------- Tipos de competição padrão (pesos) ----------
// O usuário poderá editar/criar novos tipos pela tela de cadastro.
// Os pesos seguem a regra: enrollment = pontos só por se inscrever
// (equivalente ao valor de prata), gold/silver/bronze = pontos por colocação.
const DEFAULT_COMPETITION_TYPES = [
  {
    id: 'copas_municipais',
    label: 'Copas e Municipais',
    points: { enrollment: 25, gold: 50, silver: 25, bronze: 15 },
  },
  {
    id: 'estaduais',
    label: 'Campeonatos Estaduais',
    points: { enrollment: 45, gold: 90, silver: 45, bronze: 25 },
  },
  {
    id: 'nacionais',
    label: 'Campeonatos Nacionais',
    points: { enrollment: 50, gold: 120, silver: 60, bronze: 30 },
  },
  {
    id: 'mundiais',
    label: 'Campeonatos Mundiais',
    points: { enrollment: 75, gold: 150, silver: 75, bronze: 35 },
  },
];

// ---------- Unidades de treinamento ----------
// Lista inicial editável pelo usuário (armazenada também no localStorage).
const DEFAULT_TRAINING_UNITS = [
  { id: 'unidade_1', label: 'Unidade 1' },
  { id: 'unidade_2', label: 'Unidade 2' },
];
