import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../utils/storage'
import { formatDateBR } from '../utils/helpers'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

function CompetitionForm({ initial, onSave, onCancel }) {
  const types = db.competitionTypes.getAll()
  const [form, setForm] = useState({
    name: initial?.name || '',
    date: initial?.date || '',
    competitionTypeId: initial?.competitionTypeId || '',
    location: initial?.location || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8] focus:ring-1 focus:ring-[#1B4FA8]/20"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  if (types.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-[#4A5568] mb-4">Cadastre um tipo de competição antes de criar uma competição.</p>
        <Button variant="secondary" onClick={onCancel}>Fechar</Button>
      </div>
    )
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome da competição</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Copa Regional 2026" required />
        </div>
        <div>
          <label className={labelCls}>Data</label>
          <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Tipo de competição</label>
          <select className={inputCls} value={form.competitionTypeId} onChange={e => set('competitionTypeId', e.target.value)} required>
            <option value="">Selecione</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Local</label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: Ginásio Municipal" required />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial ? 'Salvar alterações' : 'Cadastrar competição'}</Button>
      </div>
    </form>
  )
}

export default function CompetitionsPage() {
  const { showToast } = useToast()
  const [competitions, setCompetitions] = useState(() => db.competitions.getAll())
  const [modal, setModal] = useState(null)

  const refresh = () => setCompetitions(db.competitions.getAll())

  const handleSave = (form) => {
    if (modal.mode === 'edit') {
      db.competitions.update(modal.competition.id, form)
      showToast('Competição atualizada.')
    } else {
      db.competitions.add(form)
      showToast('Competição cadastrada.')
    }
    setModal(null)
    refresh()
  }

  const handleDelete = (comp) => {
    if (!confirm(`Excluir "${comp.name}"? Os resultados desta competição também serão removidos.`)) return
    db.competitions.remove(comp.id)
    db.results.replaceAll(db.results.getAll().filter(r => r.competitionId !== comp.id))
    showToast('Competição excluída.')
    refresh()
  }

  const sorted = competitions.slice().sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      <PageHeader
        title="Competições"
        description={`${competitions.length} competição${competitions.length !== 1 ? 'ões' : ''} cadastrada${competitions.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setModal({ mode: 'add' })}>+ Nova Competição</Button>}
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="Nenhuma competição cadastrada"
          description="Cadastre a primeira competição para depois lançar resultados."
          action={<Button onClick={() => setModal({ mode: 'add' })}>+ Nova Competição</Button>}
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          {sorted.map((comp, i, arr) => {
            const type = db.competitionTypes.getById(comp.competitionTypeId)
            return (
              <div key={comp.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#0D1B35]">{comp.name}</div>
                  <div className="text-xs text-[#A8AFBC] mt-0.5 flex gap-3">
                    <span>{formatDateBR(comp.date)}</span>
                    <span>{comp.location}</span>
                    <span className="text-[#1B4FA8] font-medium">{type?.label || '—'}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ mode: 'edit', competition: comp })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors" aria-label="Editar">
                    <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                  </button>
                  <button onClick={() => handleDelete(comp)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Excluir">
                    <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Competição' : 'Nova Competição'}>
        {modal && <CompetitionForm initial={modal.competition} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  )
}
