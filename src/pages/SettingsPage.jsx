import { useState, useEffect, useCallback } from 'react'
import { trainingUnitsApi } from '../utils/api'
import { PageHeader, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

export default function SettingsPage() {
  const { showToast } = useToast()
  const [units, setUnits] = useState([])
  const [newUnit, setNewUnit] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => { setLoading(true); setUnits(await trainingUnitsApi.getAll()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const addUnit = async (e) => {
    e.preventDefault()
    const label = newUnit.trim()
    if (!label) return
    try { await trainingUnitsApi.create({ label }); setNewUnit(''); load(); showToast('Unidade adicionada.') }
    catch (e) { showToast(e.message, 'error') }
  }

  const removeUnit = async (unit) => {
    try { await trainingUnitsApi.remove(unit.id); load(); showToast('Unidade removida.') }
    catch (e) { showToast(e.message, 'error') }
  }

  const sectionCls = "bg-white border border-[#DDE1EA] rounded-xl shadow-sm p-5 mb-5"
  const sectionTitle = "text-[11px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-4"

  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie unidades de treinamento." />

      <div className={sectionCls}>
        <h3 className={sectionTitle}>Unidades de treinamento</h3>
        {loading ? <p className="text-sm text-[#A8AFBC]">Carregando...</p> : (
          <div className="flex flex-wrap gap-2 mb-4">
            {units.length === 0 ? <span className="text-sm text-[#A8AFBC]">Nenhuma unidade cadastrada.</span>
              : units.map(unit => (
                <span key={unit.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[#E6EFFC] text-[#0D3278] border border-[#B8CEED]">
                  {unit.label}
                  <button onClick={() => removeUnit(unit)} className="hover:text-red-500 transition-colors"><EvaIcon name="close-outline" size={14} fill="currentColor" /></button>
                </span>
              ))}
          </div>
        )}
        <form onSubmit={addUnit} className="flex gap-2">
          <input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Ex: Unidade Centro" className="flex-1 border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]" required />
          <Button type="submit" variant="secondary">+ Adicionar</Button>
        </form>
      </div>

      <div className={sectionCls}>
        <h3 className={sectionTitle}>Sobre o sistema</h3>
        <p className="text-sm text-[#4A5568]">ASDOKS Ranking Karatê — Fase 2. Dados armazenados em PostgreSQL (Neon). Backend Node.js + Express.</p>
      </div>
    </div>
  )
}
