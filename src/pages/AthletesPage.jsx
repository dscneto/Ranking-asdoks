import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENDERS, BELTS } from '../data/constants'
import { db } from '../utils/storage'
import { getAgeCategoryFromBirthDate } from '../utils/helpers'
import { Button, Chip, BeltChip, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import EvaIcon from '../components/ui/EvaIcon'

function AthleteForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    gender: initial?.gender || '',
    birthDate: initial?.birthDate || '',
    belt: initial?.belt || '',
    trainingUnitId: initial?.trainingUnitId || '',
  })
  const units = db.trainingUnits.getAll()
  const ageCategory = form.birthDate ? getAgeCategoryFromBirthDate(form.birthDate) : null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.gender || !form.birthDate || !form.belt || !form.trainingUnitId) return
    onSave(form)
  }

  const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8] focus:ring-1 focus:ring-[#1B4FA8]/20"
  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

  return (
    <form onSubmit={handleSubmit}>
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
              : <span className="text-sm text-[#A8AFBC]">Informe a data de nascimento</span>
            }
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{initial ? 'Salvar alterações' : 'Cadastrar atleta'}</Button>
      </div>
    </form>
  )
}

export default function AthletesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [athletes, setAthletes] = useState(() => db.athletes.getAll())
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', athlete?: obj }

  const refresh = () => setAthletes(db.athletes.getAll())

  const handleSave = (form) => {
    if (modal.mode === 'edit') {
      db.athletes.update(modal.athlete.id, form)
      showToast('Atleta atualizado.')
    } else {
      db.athletes.add(form)
      showToast('Atleta cadastrado.')
    }
    setModal(null)
    refresh()
  }

  const handleDelete = (athlete) => {
    if (!confirm(`Excluir "${athlete.name}"? Os resultados deste atleta também serão removidos.`)) return
    db.athletes.remove(athlete.id)
    const remaining = db.results.getAll().filter(r => r.athleteId !== athlete.id)
    db.results.replaceAll(remaining)
    showToast('Atleta excluído.')
    refresh()
  }

  return (
    <div>
      <PageHeader
        title="Atletas"
        description={`${athletes.length} atleta${athletes.length !== 1 ? 's' : ''} cadastrado${athletes.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Atleta</Button>}
      />

      {athletes.length === 0 ? (
        <EmptyState
          title="Nenhum atleta cadastrado"
          description="Cadastre o primeiro atleta para começar a montar o ranking."
          action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Atleta</Button>}
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          {/* Cabeçalho da tabela — só desktop */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Nome', 'Gênero', 'Categoria', 'Faixa', 'Unidade', ''].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>

          {athletes.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((athlete, i, arr) => {
            const genderLabel = GENDERS.find(g => g.id === athlete.gender)?.label || '—'
            const ageCategory = getAgeCategoryFromBirthDate(athlete.birthDate)
            const unit = db.trainingUnits.getById(athlete.trainingUnitId)

            return (
              <div
                key={athlete.id}
                className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}
              >
                <button
                  onClick={() => navigate(`/atletas/${athlete.id}`)}
                  className="text-left font-semibold text-[#0D1B35] hover:text-[#1B4FA8] transition-colors"
                >
                  {athlete.name}
                </button>
                <div className="flex items-center"><Chip variant="default">{genderLabel}</Chip></div>
                <div className="flex items-center">{ageCategory ? <Chip variant="category">{ageCategory.label}</Chip> : '—'}</div>
                <div className="flex items-center"><BeltChip beltId={athlete.belt} /></div>
                <div className="flex items-center text-sm text-[#4A5568]">{unit?.label || '—'}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModal({ mode: 'edit', athlete })}
                    className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors"
                    aria-label="Editar"
                  >
                    <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => handleDelete(athlete)}
                    className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Excluir"
                  >
                    <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Editar Atleta' : 'Novo Atleta'}
      >
        {modal && (
          <AthleteForm
            initial={modal.athlete}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
