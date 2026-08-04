import { useState, useEffect, useCallback } from 'react'
import { coachesApi, trainingUnitsApi } from '../utils/api'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

function CoachForm({ initial, units, onSave, onCancel, loading }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        email: initial?.email || '',
        phone: initial?.phone || '',
        training_unit_id: initial?.training_unit_id || '',
        active: initial?.active ?? true,
    })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const inputCls = "w-full border border-[#C4CADB] rounded-lg px-3 py-2.5 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
    const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-[#A8AFBC] mb-1"

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form) }}>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className={labelCls}>Nome completo</label>
                    <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: João Silva" required />
                </div>
                <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="Ex: joao@email.com" />
                </div>
                <div>
                    <label className={labelCls}>Telefone</label>
                    <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Ex: (77) 99999-9999" />
                </div>
                <div>
                    <label className={labelCls}>Unidade de treinamento</label>
                    <select className={inputCls} value={form.training_unit_id} onChange={e => set('training_unit_id', e.target.value)}>
                        <option value="">Selecione</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Status</label>
                    <select className={inputCls} value={form.active} onChange={e => set('active', e.target.value === 'true')}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (initial ? 'Salvar alterações' : 'Cadastrar professor')}
                </Button>
            </div>
        </form>
    )
}

export default function CoachesPage() {
    const { showToast } = useToast()
    const [coaches, setCoaches] = useState([])
    const [units, setUnits] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modal, setModal] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        const [c, u] = await Promise.all([coachesApi.getAll(), trainingUnitsApi.getAll()])
        setCoaches(c)
        setUnits(u)
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const handleSave = async (form) => {
        setSaving(true)
        try {
            if (modal.mode === 'edit') {
                await coachesApi.update(modal.coach.id, form)
                showToast('Professor atualizado.')
            } else {
                await coachesApi.create(form)
                showToast('Professor cadastrado.')
            }
            setModal(null)
            load()
        } catch (e) { showToast(e.message, 'error') }
        finally { setSaving(false) }
    }

    const handleDelete = async (coach) => {
        if (!confirm(`Excluir "${coach.name}"?`)) return
        try {
            await coachesApi.remove(coach.id)
            showToast('Professor excluído.')
            load()
        } catch (e) { showToast(e.message, 'error') }
    }

    if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

    return (
        <div>
            <PageHeader
                title="Professores"
                description={`${coaches.length} professor${coaches.length !== 1 ? 'es' : ''} cadastrado${coaches.length !== 1 ? 's' : ''}`}
                action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Professor</Button>}
            />

            {coaches.length === 0 ? (
                <EmptyState
                    title="Nenhum professor cadastrado"
                    description="Cadastre o primeiro professor para vincular aos atletas."
                    action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Professor</Button>}
                />
            ) : (
                <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
                    <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
                        {['Nome', 'Email', 'Telefone', 'Unidade', 'Status', ''].map(h => (
                            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
                        ))}
                    </div>

                    {coaches.map((coach, i, arr) => (
                        <div key={coach.id} className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
                            <span className="font-semibold text-[#0D1B35]">{coach.name}</span>
                            <span className="text-sm text-[#4A5568]">{coach.email || '—'}</span>
                            <span className="text-sm text-[#4A5568]">{coach.phone || '—'}</span>
                            <span className="text-sm text-[#4A5568]">{coach.training_unit_label || '—'}</span>
                            <span>
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${coach.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {coach.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </span>
                            <div className="flex gap-1.5">
                                <button onClick={() => setModal({ mode: 'edit', coach })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                                    <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                                </button>
                                <button onClick={() => handleDelete(coach)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Professor' : 'Novo Professor'}>
                {modal && <CoachForm initial={modal.coach} units={units} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />}
            </Modal>
        </div>
    )
}