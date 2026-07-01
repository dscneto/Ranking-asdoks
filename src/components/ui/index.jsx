import { BELTS, PLACEMENTS } from '../../data/constants'

// ─── Button ───────────────────────────────────────────────────────────────────
const btnBase = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer'

const btnVariants = {
  primary:   'bg-[#1B4FA8] text-white border-[#1B4FA8] hover:bg-[#0D3278] hover:border-[#0D3278] shadow-sm hover:shadow-[0_4px_12px_rgba(27,79,168,0.25)]',
  secondary: 'bg-white text-[#1B4FA8] border-[#1B4FA8] hover:bg-[#E6EFFC]',
  ghost:     'bg-white text-[#4A5568] border-[#C4CADB] hover:bg-[#F5F6F8] hover:border-[#A8AFBC]',
  danger:    'bg-white text-red-600 border-red-600 hover:bg-red-50',
}

export function Button({ variant = 'primary', size = 'md', full = false, children, className = '', ...props }) {
  const sizes = { sm: 'px-3.5 py-1.5 text-xs', md: '', lg: 'px-6 py-3 text-base' }
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${sizes[size]} ${full ? 'w-full justify-center' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
const chipVariants = {
  default:  'bg-[#F5F6F8] text-[#4A5568] border border-[#DDE1EA]',
  category: 'bg-[#E6EFFC] text-[#0D3278]',
  modality: 'bg-[#E6EFFC] text-[#1B4FA8]',
  gold:     'bg-[#FEF3C7] text-[#92610A]',
  silver:   'bg-[#F1F3F7] text-[#4A5568]',
  bronze:   'bg-[#FEE9D6] text-[#9A5A1A]',
}

export function Chip({ variant = 'default', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${chipVariants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ─── BeltChip — cores reais da faixa ─────────────────────────────────────────
export function BeltChip({ beltId }) {
  const belt = BELTS.find((b) => b.id === beltId)
  if (!belt) return <Chip>—</Chip>
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: belt.bg, color: belt.color, border: `1.5px solid ${belt.border}` }}
    >
      {belt.label}
    </span>
  )
}

// ─── PlacementChip ────────────────────────────────────────────────────────────
const placementVariant = { gold: 'gold', silver: 'silver', bronze: 'bronze' }
const placementLabel   = { gold: '🥇 1º lugar', silver: '🥈 2º lugar', bronze: '🥉 3º lugar' }

export function PlacementChip({ placement }) {
  if (!placement) return <span className="text-[#A8AFBC] text-sm">—</span>
  return <Chip variant={placementVariant[placement]}>{placementLabel[placement]}</Chip>
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-16 px-6 bg-white border border-[#DDE1EA] rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-[#0D1B35] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#4A5568] mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-[#DDE1EA] rounded-xl p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-[#1B4FA8]">{value}</div>
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h2 className="text-3xl font-extrabold text-[#0D1B35]">{title}</h2>
        {description && <p className="text-sm text-[#4A5568] mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
