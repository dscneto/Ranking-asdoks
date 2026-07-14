// ─── Categorias de Idade ────────────────────────────────────────────────────
export const AGE_CATEGORIES = [
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
]

// ─── Faixas ─────────────────────────────────────────────────────────────────
export const BELTS = [
  { id: 'branca',   label: 'Branca',   bg: '#FFFFFF', color: '#4A5568', border: '#DDE1EA' },
  { id: 'amarela',  label: 'Amarela',  bg: '#FEF3C7', color: '#92610A', border: '#E9B84A' },
  { id: 'vermelha', label: 'Vermelha', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  { id: 'laranja',  label: 'Laranja',  bg: '#FFEDD5', color: '#9A3412', border: '#FDBA74' },
  { id: 'verde',    label: 'Verde',    bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  { id: 'roxa',     label: 'Roxa',     bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
  { id: 'marrom',   label: 'Marrom',   bg: '#F5F0EB', color: '#78350F', border: '#D4A574' },
  { id: 'preta',    label: 'Preta',    bg: '#1F2937', color: '#F9FAFB', border: '#374151' },
]

// ─── Gênero ──────────────────────────────────────────────────────────────────
export const GENDERS = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino',  label: 'Feminino'  },
]

// ─── Modalidades ─────────────────────────────────────────────────────────────
export const MODALITIES = [
  { id: 'inscricao',                  label: 'Inscrição'                        },
  { id: 'kata_individual',            label: 'Kata Individual'                  },
  { id: 'kata_equipe',                label: 'Kata Equipe'                      },
  { id: 'kumite_individual',          label: 'Kumitê Individual'                },
  { id: 'kumite_equipe',              label: 'Kumitê Equipe'                    },
  { id: 'kumite_equipe_revezamento',  label: 'Kumitê Equipe com Revezamento'    },
]

// ─── Colocações ──────────────────────────────────────────────────────────────
export const PLACEMENTS = [
  { id: 'gold',   label: '1º lugar (Ouro)',   short: '1º', emoji: '🥇' },
  { id: 'silver', label: '2º lugar (Prata)',  short: '2º', emoji: '🥈' },
  { id: 'bronze', label: '3º lugar (Bronze)', short: '3º', emoji: '🥉' },
]

// ─── Tipos de Competição padrão ───────────────────────────────────────────────
export const DEFAULT_COMPETITION_TYPES = [
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
]

// ─── Unidades de Treinamento padrão ──────────────────────────────────────────
export const DEFAULT_TRAINING_UNITS = [
  { id: 'unidade_1', label: 'Unidade 1' },
  { id: 'unidade_2', label: 'Unidade 2' },
]
