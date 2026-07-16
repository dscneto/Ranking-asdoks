import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '../utils/api'
import { Button, EmptyState, PageHeader } from '../components/ui'
import Modal from '../components/ui/Modal'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

function UserForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name:     initial?.name   || '',
    email:    initial?.email  || '',
    password: '',
    role:     initial?.role   || 'professor',
    active:   initial?.active ?? true,
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
        <div className="col-span-2">
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>{initial ? 'Nova senha (deixe em branco para manter)' : 'Senha'}</label>
          <input type="password" className={inputCls} value={form.password} onChange={e => set('password', e.target.value)} required={!initial} placeholder={initial ? '••••••••' : ''} />
        </div>
        <div>
          <label className={labelCls}>Perfil</label>
          <select className={inputCls} value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {initial && (
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.active} onChange={e => set('active', e.target.value === 'true')}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#DDE1EA]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : (initial ? 'Salvar' : 'Criar usuário')}
        </Button>
      </div>
    </form>
  )
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [modal, setModal]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setUsers(await usersApi.getAll())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email, role: form.role, active: form.active }
      if (form.password) payload.password = form.password

      if (modal.mode === 'edit') {
        await usersApi.update(modal.user.id, payload)
        showToast('Usuário atualizado.')
      } else {
        if (!form.password) { showToast('Senha é obrigatória.', 'error'); return }
        await usersApi.create(payload)
        showToast('Usuário criado.')
      }
      setModal(null); load()
    } catch (e) { showToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Excluir "${user.name}"?`)) return
    try { await usersApi.remove(user.id); showToast('Usuário excluído.'); load() }
    catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários com acesso ao sistema."
        action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Usuário</Button>}
      />

      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuário cadastrado"
          action={<Button onClick={() => setModal({ mode: 'add' })}>+ Novo Usuário</Button>}
        />
      ) : (
        <div className="bg-white border border-[#DDE1EA] rounded-xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b border-[#DDE1EA] bg-[#F5F6F8]">
            {['Nome', 'Email', 'Perfil', 'Status', ''].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#A8AFBC]">{h}</span>
            ))}
          </div>

          {users.map((user, i, arr) => (
            <div key={user.id} className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#DDE1EA]' : ''}`}>
              <span className="font-semibold text-[#0D1B35]">{user.name}</span>
              <span className="text-sm text-[#4A5568]">{user.email}</span>
              <span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${user.role === 'admin' ? 'bg-[#E6EFFC] text-[#0D3278]' : 'bg-[#F5F6F8] text-[#4A5568] border border-[#DDE1EA]'}`}>
                  {user.role === 'admin' ? 'Admin' : 'Professor'}
                </span>
              </span>
              <span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${user.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => setModal({ mode: 'edit', user })} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-[#1B4FA8] hover:bg-[#E6EFFC] transition-colors">
                  <EvaIcon name="edit-2-outline" size={16} fill="currentColor" />
                </button>
                <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg text-[#A8AFBC] hover:text-red-600 hover:bg-red-50 transition-colors">
                  <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Editar Usuário' : 'Novo Usuário'}>
        {modal && <UserForm initial={modal.user} onSave={handleSave} onCancel={() => setModal(null)} loading={saving} />}
      </Modal>
    </div>
  )
}