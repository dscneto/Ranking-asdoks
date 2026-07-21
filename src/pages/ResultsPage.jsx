import { useState, useEffect } from 'react'
import { MODALITIES } from '../data/constants'
import { competitionsApi, athletesApi, resultsApi } from '../utils/api'
import { getAll } from '../services/indexedDB'
import { offlineWrite } from '../hooks/useOfflineData'
import { getAgeCategoryFromBirthDate } from '../utils/helpers'
import { Chip, BeltChip, EmptyState, PageHeader, Button } from '../components/ui'
import { useToast } from '../context/ToastContext'
import { useSyncStatus } from '../context/SyncContext'

export default function ResultsPage() {
  const { showToast } = useToast()
  const { refreshPendingCount } = useSyncStatus()
  const [competitions, setCompetitions] = useState([])
  const [athletes, setAthletes]         = useState([])
  const [competitionId, setCompetitionId] = useState('')
  const [modality, setModality]           = useState('')
  const [entries, setEntries]             = useState([])
  const [saving, setSaving]               = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (navigator.onLine) {
          const [c, a] = await Promise.all([competitionsApi.getAll(), athletesApi.getAll()])
          setCompetitions(c)
          setAthletes(a.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        } else {
          const [c, a] = await Promise.all([getAll('competitions'), getAll('athletes')])
          setCompetitions(c.sort((a, b) => new Date(b.date) - new Date(a.date)))
          setAthletes(a.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        }
      } catch (e) {
        showToast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const competition = competitions.find(c => c.id === competitionId)
  const isInscricao = modality === 'inscricao'

  useEffect(() => {
    if (!competitionId || !modality) { setEntries([]); return }

    const loadEntries = async () => {
      try {
        if (navigator.onLine) {
          const existing  = await resultsApi.getByCompetitionAndModality(competitionId, modality)
          const byAthlete = Object.fromEntries(existing.map(r => [r.athlete_id, r]))
          setEntries(athletes.map(a => ({
            athleteId: a.id,
            enrolled:  byAthlete[a.id]?.enrolled  || false,
            placement: byAthlete[a.id]?.placement || '',
          })))
        } else {
          const allResults = await getAll('results')
          const existing   = allResults.filter(r => r.competition_id === competitionId && r.modality === modality)
          const byAthlete  = Object.fromEntries(existing.map(r => [r.athlete_id, r]))
          setEntries(athletes.map(a => ({
            athleteId: a.id,
            enrolled:  byAthlete[a.id]?.enrolled  || false,
            placement: byAthlete[a.id]?.placement || '',
          })))
        }
      } catch {
        setEntries(athletes.map(a => ({ athleteId: a.id, enrolled: false, placement: '' })))
      }
    }
    loadEntries()
  }, [competitionId, modality, athletes])

  const updateEntry = (athleteId, patch) =>
    setEntries(prev => prev.map(e => e.athleteId === athleteId ? { ...e, ...patch } : e))

  const calcPoints = (entry) => {
    if (!competition) return 0
    let pts = 0
    if (isInscricao && entry.enrolled) pts += competition.points_enrollment || 0
    if (!isInscricao) {
      if (entry.placement === 'gold')   pts += competition.points_gold   || 0
      if (entry.placement === 'silver') pts += competition.points_silver || 0
      if (entry.placement === 'bronze') pts += competition.points_bronze || 0
    }
    return pts
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        competitionId,
        modality,
        entries: entries.map(e => ({
          athleteId: e.athleteId,
          enrolled:  isInscricao ? e.enrolled : false,
          placement: isInscricao ? null : (e.placement || null),
        })),
      }
      await offlineWrite('POST', '/results/save', payload)
      showToast(navigator.onLine
        ? 'Resultados salvos com sucesso.'
        : 'Salvo offline. Será sincronizado ao reconectar.'
      )
      await refreshPendingCount()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

  if (!competitions.length || !athletes.length) {
    return (
      <EmptyState
        title="Nenhum dado disponível offline"
        description="Conecte-se à internet para carregar as competições e atletas."
      />
    )
  }

  const selectCls = "border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8] w-full"
  const labelCls  = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <div>
      <PageHeader
        title="Lançar Resultados"
        description="Selecione 'Inscrição' para registrar participação, ou uma modalidade para registrar colocações."
      />

      <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Competição</label>
            <select className={selectCls} value={competitionId} onChange={e => setCompetitionId(e.target.value)}>
              <option value="">Selecione</option>
              {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Modalidade</label>
            <select className={selectCls} value={modality} onChange={e => setModality(e.target.value)}>
              <option value="">Selecione</option>
              {MODALITIES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {competitionId && modality && competition ? (
        <>
          <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-[#0D1B35]">{competition.name}</span>
            <span className="text-[#A8AFBC]">·</span>
            <span className="text-sm text-[#4A5568]">{MODALITIES.find(m => m.id === modality)?.label}</span>
            <div className="ml-auto flex gap-2 flex-wrap">
              {isInscricao
                ? <Chip variant="category">Inscrição: <strong>{competition.points_enrollment}pts</strong></Chip>
                : <>
                    <Chip variant="gold">🥇 {competition.points_gold}pts</Chip>
                    <Chip variant="silver">🥈 {competition.points_silver}pts</Chip>
                    <Chip variant="bronze">🥉 {competition.points_bronze}pts</Chip>
                  </>
              }
            </div>
          </div>

          <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden mb-4">
            <div
              className="hidden md:grid gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]"
              style={{ gridTemplateColumns: isInscricao ? '2fr 1fr 1fr' : '2fr 1.5fr 1fr' }}
            >
              {['Atleta', isInscricao ? 'Inscrito' : 'Colocação', 'Pontos'].map(h => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
              ))}
            </div>

            {athletes.map((athlete) => {
              const entry       = entries.find(e => e.athleteId === athlete.id) || { enrolled: false, placement: '' }
              const ageCategory = getAgeCategoryFromBirthDate(athlete.birth_date)
              return (
                <div
                  key={athlete.id}
                  className="grid gap-3 md:gap-4 px-4 py-3 border-b border-[#DDE1EA] last:border-0"
                  style={{ gridTemplateColumns: isInscricao ? '2fr 1fr 1fr' : '2fr 1.5fr 1fr' }}
                >
                  <div>
                    <div className="font-semibold text-[#0D1B35] text-sm">{athlete.name}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {ageCategory && <Chip variant="category">{ageCategory.label}</Chip>}
                      <BeltChip beltId={athlete.belt} />
                    </div>
                  </div>

                  {isInscricao ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.enrolled}
                        onChange={e => updateEntry(athlete.id, { enrolled: e.target.checked })}
                        className="w-4 h-4 accent-[#1B4FA8]"
                      />
                      <span className="text-sm text-[#4A5568]">+{competition.points_enrollment}pts</span>
                    </label>
                  ) : (
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
                  )}

                  <div className="font-extrabold text-[#1B4FA8] text-sm flex items-center">
                    {calcPoints(entry)} pts
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar resultados'}
            </Button>
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