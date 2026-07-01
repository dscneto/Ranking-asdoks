import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AGE_CATEGORIES, GENDERS, MODALITIES } from '../data/constants'
import { buildRanking } from '../hooks/useRanking'
import { db } from '../utils/storage'
import { getInitials } from '../utils/helpers'
import { Chip, BeltChip, EmptyState, PageHeader, Button } from '../components/ui'

export default function RankingPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ gender: '', ageCategoryId: '', modality: '' })
  const [ranking, setRanking] = useState([])
  const [noAthletes, setNoAthletes] = useState(false)

  useEffect(() => {
    const r = buildRanking(filters)
    setRanking(r)
    setNoAthletes(db.athletes.count() === 0)
  }, [filters])

  const hasFilter = filters.gender || filters.ageCategoryId || filters.modality
  const clearFilters = () => setFilters({ gender: '', ageCategoryId: '', modality: '' })

  if (noAthletes) {
    return (
      <EmptyState
        title="Nenhum atleta cadastrado"
        description="Cadastre atletas e lance resultados de competições para ver o ranking aqui."
        action={<Button onClick={() => navigate('/atletas')}>Cadastrar Atletas</Button>}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Ranking Geral"
        description="Pontuação acumulada por inscrições e colocações em todas as competições."
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-5 p-4 bg-white border border-[#DDE1EA] rounded-xl shadow-sm">
        <select
          className="border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] min-w-[160px] focus:outline-none focus:border-[#1B4FA8]"
          value={filters.gender}
          onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
        >
          <option value="">Todos os gêneros</option>
          {GENDERS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>

        <select
          className="border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] min-w-[160px] focus:outline-none focus:border-[#1B4FA8]"
          value={filters.ageCategoryId}
          onChange={e => setFilters(f => ({ ...f, ageCategoryId: e.target.value }))}
        >
          <option value="">Todas as categorias</option>
          {AGE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select
          className="border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] min-w-[180px] focus:outline-none focus:border-[#1B4FA8]"
          value={filters.modality}
          onChange={e => setFilters(f => ({ ...f, modality: e.target.value }))}
        >
          <option value="">Todas as modalidades</option>
          {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>
        )}
      </div>

      {/* Lista */}
      {ranking.length === 0 ? (
        <EmptyState title="Nenhum atleta encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((entry, index) => {
            const pos = index + 1
            const isGold = pos === 1
            const isSilver = pos === 2
            const isBronze = pos === 3
            const genderLabel = GENDERS.find(g => g.id === entry.athlete.gender)?.label || '—'

            return (
              <div
                key={entry.athlete.id}
                onClick={() => navigate(`/atletas/${entry.athlete.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/atletas/${entry.athlete.id}`)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-px shadow-sm
                  ${isGold   ? 'bg-[#FEF3C7] border-[#E9B84A]' : ''}
                  ${isSilver ? 'bg-[#E6EFFC] border-[#B8CEED]' : ''}
                  ${!isGold && !isSilver ? 'bg-white border-[#DDE1EA] hover:border-[#1B4FA8]' : ''}
                `}
              >
                <span className={`text-xl font-extrabold w-7 text-center flex-shrink-0
                  ${isGold ? 'text-[#C9940A]' : isSilver ? 'text-[#1B4FA8]' : isBronze ? 'text-[#9A5A1A]' : 'text-[#A8AFBC]'}
                `}>{pos}</span>

                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2
                  ${isGold ? 'bg-[#FDE68A] text-[#92610A] border-[#E9B84A]' : 'bg-[#E6EFFC] text-[#1B4FA8] border-[#B8CEED]'}
                `}>
                  {getInitials(entry.athlete.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-[#0D1B35] truncate">{entry.athlete.name}</div>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    <Chip variant="default">{genderLabel}</Chip>
                    {entry.ageCategory && <Chip variant="category">{entry.ageCategory.label}</Chip>}
                    <BeltChip beltId={entry.athlete.belt} />
                    {entry.competitionsCount > 0 && <Chip variant="default">{entry.competitionsCount} compet.</Chip>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-extrabold ${isGold ? 'text-[#C9940A]' : 'text-[#1B4FA8]'}`}>
                    {entry.totalPoints}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">pts</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
