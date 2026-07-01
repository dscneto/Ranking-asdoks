import { AGE_CATEGORIES } from '../data/constants'

// ─── Idade & Categoria ────────────────────────────────────────────────────────
export function calculateAge(birthDateISO, refDate = new Date()) {
  const birth = new Date(birthDateISO + 'T00:00:00')
  let age = refDate.getFullYear() - birth.getFullYear()
  const hadBirthday =
    refDate.getMonth() > birth.getMonth() ||
    (refDate.getMonth() === birth.getMonth() && refDate.getDate() >= birth.getDate())
  if (!hadBirthday) age--
  return age
}

export function getAgeCategoryFromBirthDate(birthDateISO, refDate = new Date()) {
  if (!birthDateISO) return null
  const age = calculateAge(birthDateISO, refDate)
  return AGE_CATEGORIES.find(
    (cat) => age >= cat.minAge && (cat.maxAge === null || age <= cat.maxAge)
  ) || null
}

// ─── Pontuação ────────────────────────────────────────────────────────────────
export function calculateResultPoints(result, competitionType) {
  if (!competitionType?.points) return 0
  let total = 0
  if (result.enrolled) total += competitionType.points.enrollment || 0
  if (result.placement && competitionType.points[result.placement] != null)
    total += competitionType.points[result.placement]
  return total
}

// ─── Formatação ───────────────────────────────────────────────────────────────
export function formatDateBR(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── ID único ─────────────────────────────────────────────────────────────────
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
