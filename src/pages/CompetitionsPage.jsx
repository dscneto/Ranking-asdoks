import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { competitionsApi, competitionTypesApi } from '../utils/api'
import { getAll, putItem, deleteItem } from '../services/indexedDB'
import { offlineWrite } from '../hooks/useOfflineData'
import { formatDateBR } from '../utils/helpers'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'
import { useSyncStatus } from '../context/SyncContext'

function CompetitionForm({ initial, types, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    date: initial?.date?.split('T')[0] || '',
    competitionTypeId: initial?.competition_type_id || '',
    location: initial?.location || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Data</label>
          <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Tipo</label>
          <select className={inputCls} value={form.competitionTypeId} onChange={e => set('competitionTypeId', e.target.value)} required>
            <option value="">Selecione</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Local</label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} required />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : (initial ? 'Salvar' : 'Cadastrar')}</Button>
      </div>
    </form>
  )
}

export default function CompetitionsPage() {
  const { isAuth } = useAuth()
  const { showToast } = useToast()
  const { refreshPendingCount } = useSyncStatus()
  const [competitions, setCompetitions] = useState([])
  const [types, setTypes]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [modal, setModal]               = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    if (navigator.onLine) {
      const [c, t] = await Promise.all([competitionsApi.getAll(), competitionTypesApi.getAll()])
      setCompetitions(c)
      setTypes(t)
    } else {
      const [c, t] = await Promise.all([getAll('competitions'), getAll('competitionTypes')])
      setCompetitions(c.sort((a, b) => new Date(b.date) - new Date(a.date)))
      setTypes(t)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        date: form.date,
        location: form.location,
        competition_type_id: form.competitionTypeId,
      }

      if (modal.mode === 'edit') {
        await offlineWrite('PUT', `/competitions/${modal.competition.id}`, payload,
          () => putItem('competitions', { ...modal.competition, ...payload })
        )
        showToast(navigator.onLine ? 'Competição atualizada.' : 'Salvo offline. Será sincronizado em breve.')
      } else {
        const tempId = `temp_${Date.now()}`
        await offlineWrite('POST', '/competitions', payload,
          () => putItem('competitions', { id: tempId, ...payload })
        )
        showToast(navigator.onLine ? 'Competição cadastrada.' : 'Salvo offline. Será sincronizado em breve.')
      }

      await refreshPendingCount()
      setModal(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (comp) => {
    if (!confirm(`Excluir "${comp.name}"?`)) return
    try {
      await offlineWrite('DELETE', `/competitions/${comp.id}`, null,
        () => deleteItem('competitions', comp.id)
      )
      showToast(navigator.onLine ? 'Competição excluída.' : 'Exclusão salva offline.')
      await refreshPendingCount()
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Competições"
        description={`${competitions.length} competição${competitions.length !== 1 ? 'ões' : ''} cadastrada${competitions.length !== 1 ? 's' : ''}`}
        action={isAuth && <Button onClick={() => setModal({ mode: 'add' })}>+ Nova Competição</Button>}
      />

      {competitions.length === 0 ? (
        <EmptyState
          title="Nenhuma competição cadastrada"
          action={isAuth && <Button onClick={() => setModal({ mode: 'add' })}>+ Nova Competição</Button>}
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          {competitions.map((comp, i, arr) => {
            const type = types.find(t => t.id === comp.competition_type_id)
            return (
              <div key={comp.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#0D1B35]">{comp.name}</div>
                  <div className="text-xs text-[#A8AFBC] mt-0.5 flex gap-3 flex-wrap">
                    <span>{formatDateBR(comp.date)}</span>
                    <span>{comp.location}</span>
                    <span className="text-[#1B4FA8] font-medium">
                      {comp.competition_type_label || type?.label || '—'}
                    </span>
                  </div>
                </div>
                {isAuth && (
                  <div className="flex gap-1.5">
                    <button onClick={() => setModal({ mode: 'edit', competition: comp })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                      <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                    </button>
                    <button onClick={() => handleDelete(comp)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                      <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Competição' : 'Nova Competição'}>
        {modal && <CompetitionForm initial={modal.competition} types={types} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />}
      </Modal>
    </div>
  )
}