import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODALITIES } from '../data/constants'
import { db } from '../utils/storage'
import { getAgeCategoryFromBirthDate, calculateResultPoints, uid } from '../utils/helpers'
import { Chip, BeltChip, EmptyState, PageHeader, Button } from '../components/ui'
import { useToast } from '../context/ToastContext'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const competitions = db.competitions.getAll().slice().sort((a, b) => new Date(b.date) - new Date(a.date))
  const athletes = db.athletes.getAll().slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const [competitionId, setCompetitionId] = useState('')
  const [modality, setModality] = useState('')
  const [entries, setEntries] = useState([]) // [{athleteId, enrolled, placement}]

  const competition = db.competitions.getById(competitionId)
  const compType = competition ? db.competitionTypes.getById(competition.competitionTypeId) : null

  // Carrega resultados existentes quando muda competição/modalidade
  useEffect(() => {
    if (!competitionId || !modality) { setEntries([]); return }
    const existing = db.results.getAll().filter(r => r.competitionId === competitionId && r.modality === modality)
    const byAthlete = Object.fromEntries(existing.map(r => [r.athleteId, r]))
    setEntries(athletes.map(a => ({
      athleteId: a.id,
      enrolled: byAthlete[a.id]?.enrolled || false,
      placement: byAthlete[a.id]?.placement || '',
    })))
  }, [competitionId, modality])

  const updateEntry = (athleteId, patch) => {
    setEntries(prev => prev.map(e => e.athleteId === athleteId ? { ...e, ...patch } : e))
  }

  const handleSave = () => {
    if (!competitionId || !modality) return
    const allResults = db.results.getAll()
    const others = allResults.filter(r => !(r.competitionId === competitionId && r.modality === modality))
    const newResults = entries
      .filter(e => e.enrolled || e.placement)
      .map(e => {
        const existing = allResults.find(r => r.athleteId === e.athleteId && r.competitionId === competitionId && r.modality === modality)
        return { id: existing?.id || uid('result'), createdAt: existing?.createdAt || new Date().toISOString(), ...e, competitionId, modality }
      })
    db.results.replaceAll([...others, ...newResults])
    showToast('Resultados salvos com sucesso.')
  }

  if (competitions.length === 0 || athletes.length === 0) {
    return (
      <EmptyState
        title="Cadastre atletas e competições primeiro"
        description="Você precisa de pelo menos um atleta e uma competição para lançar resultados."
        action={
          <div className="flex gap-2 justify-center flex-wrap">
            {athletes.length === 0 && <Button onClick={() => navigate('/atletas')}>Cadastrar Atletas</Button>}
            {competitions.length === 0 && <Button variant="secondary" onClick={() => navigate('/competicoes')}>Cadastrar Competições</Button>}
          </div>
        }
      />
    )
  }

  const selectCls = "border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8] w-full"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <div>
      <PageHeader title="Lançar Resultados" description="Escolha a competição e a modalidade para lançar inscrições e colocações." />

      {/* Seletores */}
      <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Competição</label>
            <select className={selectCls} value={competitionId} onChange={e => setCompetitionId(e.target.value)}>
              <option value="">Selecione a competição</option>
              {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Modalidade</label>
            <select className={selectCls} value={modality} onChange={e => setModality(e.target.value)}>
              <option value="">Selecione a modalidade</option>
              {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de atletas */}
      {competitionId && modality && compType ? (
        <>
          {/* Info da pontuação */}
          <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-[#0D1B35]">{competition.name}</span>
            <span className="text-[#A8AFBC]">·</span>
            <span className="text-sm text-[#4A5568]">{MODALITIES.find(m => m.id === modality)?.label}</span>
            <div className="ml-auto flex gap-2 flex-wrap">
              <Chip variant="default">Inscrição: <strong>{compType.points.enrollment}pts</strong></Chip>
              <Chip variant="gold">🥇 {compType.points.gold}pts</Chip>
              <Chip variant="silver">🥈 {compType.points.silver}pts</Chip>
              <Chip variant="bronze">🥉 {compType.points.bronze}pts</Chip>
            </div>
          </div>

          <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden mb-4">
            {/* Header desktop */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
              {['Atleta', 'Inscrito', 'Colocação', 'Pontos'].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
              ))}
            </div>

            {athletes.map((athlete, i, arr) => {
              const entry = entries.find(e => e.athleteId === athlete.id) || { enrolled: false, placement: '' }
              const ageCategory = getAgeCategoryFromBirthDate(athlete.birthDate)
              const pts = calculateResultPoints({ enrolled: entry.enrolled, placement: entry.placement || null }, compType)

              return (
                <div key={athlete.id} className={`grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-3 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
                  <div>
                    <div className="font-semibold text-[#0D1B35] text-sm">{athlete.name}</div>
                    <div className="flex gap-1.5 mt-1">
                      {ageCategory && <Chip variant="category">{ageCategory.label}</Chip>}
                      <BeltChip beltId={athlete.belt} />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.enrolled}
                      onChange={e => updateEntry(athlete.id, { enrolled: e.target.checked })}
                      className="w-4 h-4 accent-[#1B4FA8]"
                    />
                    <span className="text-sm text-[#4A5568]">+{compType.points.enrollment}pts</span>
                  </label>

                  <select
                    value={entry.placement}
                    onChange={e => updateEntry(athlete.id, { placement: e.target.value })}
                    className="border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
                  >
                    <option value="">Sem colocação</option>
                    <option value="gold">🥇 1º lugar</option>
                    <option value="silver">🥈 2º lugar</option>
                    <option value="bronze">🥉 3º lugar</option>
                  </select>

                  <div className="font-extrabold text-[#1B4FA8] text-sm flex items-center">{pts} pts</div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar resultados</Button>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white border border-[#DDE1EA] rounded-xl shadow-sm text-[#A8AFBC]">
          <p className="text-sm">Selecione a competição e a modalidade para ver os atletas.</p>
        </div>
      )}
    </div>
  )
}
