import { useParams, useNavigate } from 'react-router-dom'
import { GENDERS, MODALITIES } from '../data/constants'
import { db } from '../utils/storage'
import { getAgeCategoryFromBirthDate, formatDateBR, getInitials } from '../utils/helpers'
import { getAthleteHistory } from '../hooks/useRanking'
import { Chip, BeltChip, PlacementChip, StatCard, EmptyState, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'

export default function AthleteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const athlete = db.athletes.getById(id)

  if (!athlete) {
    return (
      <EmptyState
        title="Atleta não encontrado"
        description="Ele pode ter sido removido."
        action={<Button onClick={() => navigate('/atletas')}>Voltar para Atletas</Button>}
      />
    )
  }

  const { results, totalPoints } = getAthleteHistory(id)
  const genderLabel = GENDERS.find(g => g.id === athlete.gender)?.label || '—'
  const ageCategory = getAgeCategoryFromBirthDate(athlete.birthDate)
  const unit = db.trainingUnits.getById(athlete.trainingUnitId)

  return (
    <div>
      {/* Voltar */}
      <button
        onClick={() => navigate('/atletas')}
        className="flex items-center gap-1.5 text-[#1B4FA8] font-semibold text-sm mb-5 hover:underline"
      >
        <EvaIcon name="arrow-back-outline" size={16} fill="currentColor" />
        Voltar para Atletas
      </button>

      {/* Header do atleta */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-14 h-14 rounded-full bg-[#E6EFFC] text-[#1B4FA8] border-2 border-[#1B4FA8] flex items-center justify-center text-xl font-extrabold flex-shrink-0">
          {getInitials(athlete.name)}
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#0D1B35]">{athlete.name}</h2>
          <div className="flex gap-2 flex-wrap mt-1.5">
            <Chip variant="default">{genderLabel}</Chip>
            {ageCategory && <Chip variant="category">{ageCategory.label}</Chip>}
            <BeltChip beltId={athlete.belt} />
            {unit && <Chip variant="default">{unit.label}</Chip>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Pontuação total" value={totalPoints} />
        <StatCard label="Resultados" value={results.length} />
        <StatCard label="Nascimento" value={formatDateBR(athlete.birthDate)} />
      </div>

      {/* Histórico */}
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-3">
        Histórico em competições
      </h3>

      {results.length === 0 ? (
        <EmptyState
          title="Nenhum resultado lançado"
          description="Os resultados aparecerão aqui após serem lançados na tela de Resultados."
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Competição', 'Data', 'Tipo', 'Modalidade', 'Inscrição', 'Colocação', 'Pontos'].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>

          {results.map((r, i, arr) => {
            const modLabel = MODALITIES.find(m => m.id === r.modality)?.label || r.modality
            return (
              <div
                key={r.id}
                className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-1.5 md:gap-4 px-4 py-3 text-sm
                  ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}
              >
                <span className="font-semibold text-[#0D1B35]">{r.competition.name}</span>
                <span className="text-[#4A5568]">{formatDateBR(r.competition.date)}</span>
                <span><Chip variant="default">{r.competitionType?.label || '—'}</Chip></span>
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
