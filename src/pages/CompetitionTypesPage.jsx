import { useState } from 'react'
import { db } from '../utils/storage'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

function TypeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    label: initial?.label || '',
    enrollment: initial?.points?.enrollment ?? '',
    gold: initial?.points?.gold ?? '',
    silver: initial?.points?.silver ?? '',
    bronze: initial?.points?.bronze ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <form onSubmit={e => {
      e.preventDefault()
      onSave({ label: form.label, points: { enrollment: Number(form.enrollment), gold: Number(form.gold), silver: Number(form.silver), bronze: Number(form.bronze) } })
    }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome do tipo</label>
          <input className={inputCls} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Ex: Campeonatos Regionais" required />
        </div>
        {[['enrollment', 'Inscrição'], ['gold', '1º lugar (Ouro)'], ['silver', '2º lugar (Prata)'], ['bronze', '3º lugar (Bronze)']].map(([key, label]) => (
          <div key={key}>
            <label className={labelCls}>{label} (pts)</label>
            <input type="number" min="0" className={inputCls} value={form[key]} onChange={e => set(key, e.target.value)} required />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial ? 'Salvar alterações' : 'Cadastrar tipo'}</Button>
      </div>
    </form>
  )
}

export default function CompetitionTypesPage() {
  const { showToast } = useToast()
  const [types, setTypes] = useState(() => db.competitionTypes.getAll())
  const [modal, setModal] = useState(null)

  const refresh = () => setTypes(db.competitionTypes.getAll())

  const handleSave = (form) => {
    if (modal.mode === 'edit') { db.competitionTypes.update(modal.type.id, form); showToast('Tipo atualizado.') }
    else { db.competitionTypes.add(form); showToast('Tipo cadastrado.') }
    setModal(null); refresh()
  }

  const handleDelete = (type) => {
    const inUse = db.competitions.getAll().some(c => c.competitionTypeId === type.id)
    if (inUse) { showToast('Este tipo está em uso por competições e não pode ser excluído.', 'error'); return }
    if (!confirm(`Excluir "${type.label}"?`)) return
    db.competitionTypes.remove(type.id); showToast('Tipo excluído.'); refresh()
  }

  return (
    <div>
      <PageHeader
        title="Tipos de Competição"
        description="Configure os pesos de pontuação para cada tipo. A pontuação de inscrição é dada a todo atleta inscrito, independente de medalha."
        action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Tipo</Button>}
      />

      {types.length === 0 ? (
        <EmptyState title="Nenhum tipo cadastrado" description="Cadastre o primeiro tipo de competição com seus pesos de pontuação." action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Tipo</Button>} />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Tipo', 'Inscrição', 'Ouro (1º)', 'Prata (2º)', 'Bronze (3º)', ''].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>
          {types.map((type, i, arr) => (
            <div key={type.id} className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
              <span className="font-semibold text-[#0D1B35]">{type.label}</span>
              {['enrollment', 'gold', 'silver', 'bronze'].map(k => (
                <span key={k} className="font-bold text-[#1B4FA8]">{type.points[k]} pts</span>
              ))}
              <div className="flex gap-1.5">
                <button onClick={() => setModal({ mode: 'edit', type })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                  <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                </button>
                <button onClick={() => handleDelete(type)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                  <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Tipo' : 'Novo Tipo'}>
        {modal && <TypeForm initial={modal.type} onSave={handleSave} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  )
}
