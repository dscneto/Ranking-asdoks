import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { GENDERS, MODALITIES, AGE_CATEGORIES } from '../data/constants'
import { athletesApi } from '../utils/api'
import { formatDateBR, getInitials } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { Chip, BeltChip, PlacementChip, StatCard, EmptyState, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'

export default function AthleteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuth } = useAuth()
  const [athlete, setAthlete] = useState(null)
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([athletesApi.getById(id), athletesApi.history(id)])
      .then(([a, h]) => { setAthlete(a); setHistory(h) })
      .catch(() => setAthlete(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>
  )

  if (!athlete) return (
    <EmptyState
      title="Atleta não encontrado"
      action={<Button onClick={() => navigate('/')}>Voltar ao Ranking</Button>}
    />
  )

  const age = new Date().getFullYear() - new Date(athlete.birth_date).getFullYear()
  const ageCategory = AGE_CATEGORIES.find(c => age >= c.minAge && (c.maxAge === null || age <= c.maxAge))

  // Visitantes veem só o primeiro nome
  const parts = athlete.name.trim().split(/\s+/)
  const displayName = isAuth
    ? athlete.name
    : `${parts[0]} ${parts[parts.length - 1]}`

  return (
    <div>
      {/* Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[#1B4FA8] font-semibold text-sm mb-5 hover:underline"
      >
        <EvaIcon name="arrow-back-outline" size={16} fill="currentColor" />
        Voltar
      </button>

      {/* Header do atleta */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-14 h-14 rounded-full bg-[#E6EFFC] text-[#1B4FA8] border-2 border-[#1B4FA8] flex items-center justify-center text-xl font-extrabold flex-shrink-0">
          {getInitials(athlete.name)}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#0D1B35]">{displayName}</h2>
          <div className="flex gap-2 flex-wrap mt-1.5">
            {ageCategory && <Chip variant="category">{ageCategory.label}</Chip>}
            <BeltChip beltId={athlete.belt} />
            {/* Dados restritos */}
            {isAuth && (
              <>
                <Chip variant="default">
                  {GENDERS.find(g => g.id === athlete.gender)?.label || '—'}
                </Chip>
                <Chip variant="default">{athlete.training_unit_label || '—'}</Chip>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Pontuação total" value={history?.totalPoints ?? 0} />
        <StatCard label="Resultados" value={history?.results?.length ?? 0} />
        {isAuth && (
          <StatCard label="Nascimento" value={formatDateBR(athlete.birth_date)} />
        )}
      </div>

      {/* Histórico */}
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-3">
        Histórico em competições
      </h3>

      {!history?.results?.length ? (
        <EmptyState
          title="Nenhum resultado lançado"
          description="Os resultados aparecerão aqui após serem lançados."
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-3 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Competição','Data','Tipo','Modalidade','Inscrição','Colocação','Pontos'].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>

          {history.results.map((r, i, arr) => {
            const modLabel = MODALITIES.find(m => m.id === r.modality)?.label || r.modality
            return (
              <div
                key={r.id}
                className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-1.5 md:gap-3 px-4 py-3 text-sm ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}
              >
                <span className="font-semibold text-[#0D1B35]">{r.competition_name}</span>
                <span className="text-[#4A5568]">{formatDateBR(r.competition_date)}</span>
                <span><Chip variant="default">{r.competition_type_label}</Chip></span>
                <span><Chip variant="modality">{modLabel}</Chip></span>
                <span>{r.enrolled ? <Chip variant="category">Sim</Chip> : <Chip variant="default">Não</Chip>}</span>
                <span><PlacementChip placement={r.placement} /></span>
                <span className="font-extrabold text-[#1B4FA8]">{r.points} pts</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}