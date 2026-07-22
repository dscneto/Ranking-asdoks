import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { competitionTypesApi } from '../utils/api'
import { getAll, putItem, deleteItem } from '../services/indexedDB'
import { offlineWrite } from '../hooks/useOfflineData'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'
import { useSyncStatus } from '../context/SyncContext'

function TypeForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    label:      initial?.label             || '',
    enrollment: initial?.points_enrollment ?? '',
    gold:       initial?.points_gold       ?? '',
    silver:     initial?.points_silver     ?? '',
    bronze:     initial?.points_bronze     ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <form onSubmit={e => {
      e.preventDefault()
      onSave({
        label:             form.label,
        points_enrollment: Number(form.enrollment),
        points_gold:       Number(form.gold),
        points_silver:     Number(form.silver),
        points_bronze:     Number(form.bronze),
      })
    }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome</label>
          <input className={inputCls} value={form.label} onChange={e => set('label', e.target.value)} required />
        </div>
        {[['enrollment','Inscrição'],['gold','1º lugar (Ouro)'],['silver','2º lugar (Prata)'],['bronze','3º lugar (Bronze)']].map(([k, l]) => (
          <div key={k}>
            <label className={labelCls}>{l} (pts)</label>
            <input type="number" min="0" className={inputCls} value={form[k]} onChange={e => set(k, e.target.value)} required />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : (initial ? 'Salvar' : 'Cadastrar')}</Button>
      </div>
    </form>
  )
}

export default function CompetitionTypesPage() {
  const { isAuth } = useAuth()
  const { showToast } = useToast()
  const { refreshPendingCount } = useSyncStatus()
  const [types, setTypes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [modal, setModal]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (navigator.onLine) {
        const t = await competitionTypesApi.getAll()
        setTypes(t.sort((a, b) => a.points_gold - b.points_gold))
      } else {
        const t = await getAll('competitionTypes')
        setTypes(t.sort((a, b) => a.points_gold - b.points_gold))
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (modal.mode === 'edit') {
        await offlineWrite('PUT', `/competition-types/${modal.type.id}`, data,
          () => putItem('competitionTypes', { ...modal.type, ...data })
        )
        showToast(navigator.onLine ? 'Tipo atualizado.' : 'Salvo offline. Será sincronizado em breve.')
      } else {
        const tempId = `temp_${Date.now()}`
        await offlineWrite('POST', '/competition-types', data,
          () => putItem('competitionTypes', { id: tempId, ...data })
        )
        showToast(navigator.onLine ? 'Tipo cadastrado.' : 'Salvo offline. Será sincronizado em breve.')
      }
      await refreshPendingCount()
      setModal(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (type) => {
    if (!confirm(`Excluir "${type.label}"?`)) return
    try {
      await offlineWrite('DELETE', `/competition-types/${type.id}`, null,
        () => deleteItem('competitionTypes', type.id)
      )
      showToast(navigator.onLine ? 'Tipo excluído.' : 'Exclusão salva offline.')
      await refreshPendingCount()
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Tipos de Competição"
        description="Pesos de pontuação para cada tipo de competição."
        action={isAuth && <Button onClick={() => setModal({ mode: 'add' })}>+ Novo Tipo</Button>}
      />

      {types.length === 0 ? (
        <EmptyState
          title="Nenhum tipo cadastrado"
          action={isAuth && <Button onClick={() => setModal({ mode: 'add' })}>+ Novo Tipo</Button>}
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Tipo','Inscrição','Ouro','Prata','Bronze',''].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>
          {types.map((type, i, arr) => (
            <div key={type.id} className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
              <span className="font-semibold text-[#0D1B35]">{type.label}</span>
              {['points_enrollment','points_gold','points_silver','points_bronze'].map(k => (
                <span key={k} className="font-bold text-[#1B4FA8]">{type[k]} pts</span>
              ))}
              {isAuth && (
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ mode: 'edit', type })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                    <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                  </button>
                  <button onClick={() => handleDelete(type)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                    <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Tipo' : 'Novo Tipo'}>
        {modal && <TypeForm initial={modal.type} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />}
      </Modal>
    </div>
  )
}