import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AGE_CATEGORIES, GENDERS, MODALITIES } from '../data/constants'
import { rankingApi } from '../utils/api'
import { getInitials } from '../utils/helpers'
import { Chip, BeltChip, EmptyState, PageHeader, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'

export default function RankingPage() {
  const navigate = useNavigate()
  const { isAuth } = useAuth()
  const [filters, setFilters] = useState({ gender: '', ageCategoryId: '', modality: '' })
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    rankingApi.get(filters)
      .then(setRanking)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const hasFilter = filters.gender || filters.ageCategoryId || filters.modality
  const clearFilters = () => setFilters({ gender: '', ageCategoryId: '', modality: '' })

  const selectCls = "border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] min-w-[160px] focus:outline-none focus:border-[#1B4FA8]"

  return (
    <div>
      <PageHeader
        title="Ranking Geral"
        description="Pontuação acumulada por inscrições e colocações em todas as competições."
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-5 p-4 bg-white border border-[#DDE1EA] rounded-xl shadow-sm">
        <select className={selectCls} value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}>
          <option value="">Todos os gêneros</option>
          {GENDERS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <select className={selectCls} value={filters.ageCategoryId} onChange={e => setFilters(f => ({ ...f, ageCategoryId: e.target.value }))}>
          <option value="">Todas as categorias</option>
          {AGE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className={`${selectCls} min-w-[180px]`} value={filters.modality} onChange={e => setFilters(f => ({ ...f, modality: e.target.value }))}>
          <option value="">Todas as modalidades</option>
          {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {hasFilter && <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>}
      </div>

      {/* Estados */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-[#A8AFBC] gap-2">
          <EvaIcon name="loader-outline" size={20} fill="currentColor" />
          <span className="text-sm">Carregando ranking...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && ranking.length === 0 && (
        <EmptyState
          title={hasFilter ? 'Nenhum atleta encontrado' : 'Nenhum atleta cadastrado'}
          description={hasFilter ? 'Tente ajustar os filtros.' : 'Cadastre atletas e lance resultados para ver o ranking.'}
          action={!hasFilter && <Button onClick={() => navigate('/atletas')}>Cadastrar Atletas</Button>}
        />
      )}

      {!loading && !error && ranking.length > 0 && (
        <div className="flex flex-col gap-2 w-full">
          {ranking.map((entry, index) => {
            const pos = index + 1
            const isGold = pos === 1
            const isSilver = pos === 2
            const isBronze = pos === 3
            const genderLabel = GENDERS.find(g => g.id === entry.gender)?.label || '—'

            // Calcula categoria de idade a partir da age retornada pelo banco
            const age = Number(entry.age)
            const ageCategory = AGE_CATEGORIES.find(c => age >= c.minAge && (c.maxAge === null || age <= c.maxAge))

            return (
              <div
                key={entry.id}
                onClick={() => navigate(`/atletas/${entry.id}`)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/atletas/${entry.id}`)}
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
                  {getInitials(entry.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-[#0D1B35] truncate">
                    {(() => {
                      const parts = entry.name.trim().split(/\s+/)
                      return isAuth ? entry.name : parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0]
                      })()}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    <Chip variant="default">{genderLabel}</Chip>
                    {ageCategory && <Chip variant="category">{ageCategory.label}</Chip>}
                    <BeltChip beltId={entry.belt} />
                    {entry.competitions_count > 0 && <Chip variant="default">{entry.competitions_count} compet.</Chip>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-extrabold ${isGold ? 'text-[#C9940A]' : 'text-[#1B4FA8]'}`}>
                    {entry.total_points}
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
