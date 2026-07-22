import { useState, useEffect, useCallback } from 'react'
import { trainingUnitsApi } from '../utils/api'
import { getAll, putItem, deleteItem } from '../services/indexedDB'
import { offlineWrite } from '../hooks/useOfflineData'
import { PageHeader, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'
import { useSyncStatus } from '../context/SyncContext'

export default function SettingsPage() {
  const { showToast } = useToast()
  const { refreshPendingCount } = useSyncStatus()
  const [units, setUnits]     = useState([])
  const [newUnit, setNewUnit] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (navigator.onLine) {
        setUnits(await trainingUnitsApi.getAll())
      } else {
        setUnits(await getAll('trainingUnits'))
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const addUnit = async (e) => {
    e.preventDefault()
    const label = newUnit.trim()
    if (!label) return
    try {
      const tempId = `temp_${Date.now()}`
      await offlineWrite('POST', '/training-units', { label },
        () => putItem('trainingUnits', { id: tempId, label })
      )
      setNewUnit('')
      load()
      showToast(navigator.onLine ? 'Unidade adicionada.' : 'Salvo offline. Será sincronizado em breve.')
      await refreshPendingCount()
    } catch (e) { showToast(e.message, 'error') }
  }

  const removeUnit = async (unit) => {
    try {
      await offlineWrite('DELETE', `/training-units/${unit.id}`, null,
        () => deleteItem('trainingUnits', unit.id)
      )
      load()
      showToast(navigator.onLine ? 'Unidade removida.' : 'Remoção salva offline.')
      await refreshPendingCount()
    } catch (e) { showToast(e.message, 'error') }
  }

  const sectionCls  = "bg-white border border-[#DDE1EA] rounded-xl shadow-sm p-5 mb-5"
  const sectionTitle = "text-[11px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-4"

  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie unidades de treinamento." />

      <div className={sectionCls}>
        <h3 className={sectionTitle}>Unidades de treinamento</h3>
        {loading ? (
          <p className="text-sm text-[#A8AFBC]">Carregando...</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {units.length === 0
              ? <span className="text-sm text-[#A8AFBC]">Nenhuma unidade cadastrada.</span>
              : units.map(unit => (
                <span key={unit.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[#E6EFFC] text-[#0D3278] border border-[#B8CEED]">
                  {unit.label}
                  <button onClick={() => removeUnit(unit)} className="hover:text-red-500 transition-colors">
                    <EvaIcon name="close-outline" size={14} fill="currentColor" />
                  </button>
                </span>
              ))
            }
          </div>
        )}
        <form onSubmit={addUnit} className="flex gap-2">
          <input
            value={newUnit}
            onChange={e => setNewUnit(e.target.value)}
            placeholder="Ex: Unidade Centro"
            className="flex-1 border border-[#C4CADB] rounded-lg px-3 py-2 text-sm bg-white text-[#0D1B35] focus:outline-none focus:border-[#1B4FA8]"
            required
          />
          <Button type="submit" variant="secondary">+ Adicionar</Button>
        </form>
      </div>

      <div className={sectionCls}>
        <h3 className={sectionTitle}>Sobre o sistema</h3>
        <p className="text-sm text-[#4A5568]">
          ASDOKS Ranking Karatê — Fase 4. Dados sincronizados com PostgreSQL (Neon).
          Funciona offline com cache local via IndexedDB.
        </p>
      </div>
    </div>
  )
}