import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENDERS, BELTS } from '../data/constants'
import { athletesApi, trainingUnitsApi } from '../utils/api'
import { getAll, putItem, deleteItem } from '../services/indexedDB'
import { offlineWrite } from '../hooks/useOfflineData'
import { getAgeCategoryFromBirthDate } from '../utils/helpers'
import { Button, Chip, BeltChip, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { useSyncStatus } from '../context/SyncContext'
import EvaIcon from '../components/ui/EvaIcon'

function AthleteForm({ initial, units, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name:           initial?.name             || '',
    gender:         initial?.gender           || '',
    birthDate:      initial?.birth_date       || '',
    belt:           initial?.belt             || '',
    trainingUnitId: initial?.training_unit_id || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ageCategory = form.birthDate ? getAgeCategoryFromBirthDate(form.birthDate) : null

  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome completo</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: João da Silva" required />
        </div>
        <div>
          <label className={labelCls}>Gênero</label>
          <select className={inputCls} value={form.gender} onChange={e => set('gender', e.target.value)} required>
            <option value="">Selecione</option>
            {GENDERS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Data de nascimento</label>
          <input type="date" className={inputCls} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Faixa</label>
          <select className={inputCls} value={form.belt} onChange={e => set('belt', e.target.value)} required>
            <option value="">Selecione</option>
            {BELTS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Unidade de treinamento</label>
          <select className={inputCls} value={form.trainingUnitId} onChange={e => set('trainingUnitId', e.target.value)} required>
            <option value="">Selecione</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Categoria de idade (automática)</label>
          <div className="mt-1">
            {ageCategory
              ? <Chip variant="category">{ageCategory.label}</Chip>
              : <span className="text-sm text-[#A8AFBC]">Informe a data de nascimento</span>}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (initial ? 'Salvar alterações' : 'Cadastrar atleta')}
        </Button>
      </div>
    </form>
  )
}

export default function AthletesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { refreshPendingCount } = useSyncStatus()
  const [athletes, setAthletes] = useState([])
  const [units, setUnits]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [modal, setModal]       = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (navigator.onLine) {
        const [a, u] = await Promise.all([athletesApi.getAll(), trainingUnitsApi.getAll()])
        setAthletes(a)
        setUnits(u)
      } else {
        const [a, u] = await Promise.all([getAll('athletes'), getAll('trainingUnits')])
        setAthletes(a.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
        setUnits(u)
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = {
        name:             form.name,
        gender:           form.gender,
        birth_date:       form.birthDate,
        belt:             form.belt,
        training_unit_id: form.trainingUnitId,
      }
      if (modal.mode === 'edit') {
        await offlineWrite('PUT', `/athletes/${modal.athlete.id}`, payload,
          () => putItem('athletes', { ...modal.athlete, ...payload })
        )
        showToast(navigator.onLine ? 'Atleta atualizado.' : 'Salvo offline. Será sincronizado em breve.')
      } else {
        const tempId = `temp_${Date.now()}`
        await offlineWrite('POST', '/athletes', payload,
          () => putItem('athletes', { id: tempId, ...payload })
        )
        showToast(navigator.onLine ? 'Atleta cadastrado.' : 'Salvo offline. Será sincronizado em breve.')
      }
      await refreshPendingCount()
      setModal(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (athlete) => {
    if (!confirm(`Excluir "${athlete.name}"?`)) return
    try {
      await offlineWrite('DELETE', `/athletes/${athlete.id}`, null,
        () => deleteItem('athletes', athlete.id)
      )
      showToast(navigator.onLine ? 'Atleta excluído.' : 'Exclusão salva offline.')
      await refreshPendingCount()
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Atletas"
        description={`${athletes.length} atleta${athletes.length !== 1 ? 's' : ''} cadastrado${athletes.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Atleta</Button>}
      />

      {athletes.length === 0 ? (
        <EmptyState title="Nenhum atleta cadastrado" description="Cadastre o primeiro atleta." action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Atleta</Button>} />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Nome','Gênero','Categoria','Faixa','Unidade',''].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>
          {athletes.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((athlete, i, arr) => {
            const genderLabel = GENDERS.find(g => g.id === athlete.gender)?.label || '—'
            const ageCategory = getAgeCategoryFromBirthDate(athlete.birth_date)
            const unit = units.find(u => u.id === athlete.training_unit_id)
            return (
              <div key={athlete.id} className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
                <button onClick={() => navigate(`/atletas/${athlete.id}`)} className="text-left font-semibold text-[#0D1B35] hover:text-[#1B4FA8] transition-colors">{athlete.name}</button>
                <div className="flex items-center"><Chip variant="default">{genderLabel}</Chip></div>
                <div className="flex items-center">{ageCategory ? <Chip variant="category">{ageCategory.label}</Chip> : '—'}</div>
                <div className="flex items-center"><BeltChip beltId={athlete.belt} /></div>
                <div className="flex items-center text-sm text-[#4A5568]">{unit?.label || athlete.training_unit_label || '—'}</div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setModal({ mode: 'edit', athlete })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                    <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                  </button>
                  <button onClick={() => handleDelete(athlete)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                    <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Atleta' : 'Novo Atleta'}>
        {modal && <AthleteForm initial={modal.athlete} units={units} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />}
      </Modal>
    </div>
  )
}