import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../utils/storage'
import { PageHeader, Button } from '../components/ui'
import EvaIcon from '../components/ui/EvaIcon'
import { useToast } from '../context/ToastContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [units, setUnits] = useState(() => db.trainingUnits.getAll())
  const [newUnit, setNewUnit] = useState('')

  const refreshUnits = () => setUnits(db.trainingUnits.getAll())

  const addUnit = (e) => {
    e.preventDefault()
    const label = newUnit.trim()
    if (!label) return
    db.trainingUnits.add({ label })
    setNewUnit('')
    refreshUnits()
    showToast('Unidade adicionada.')
  }

  const removeUnit = (unit) => {
    const inUse = db.athletes.getAll().some(a => a.trainingUnitId === unit.id)
    if (inUse) { showToast('Esta unidade está em uso por atletas e não pode ser removida.', 'error'); return }
    db.trainingUnits.remove(unit.id)
    refreshUnits()
    showToast('Unidade removida.')
  }

  const exportBackup = () => {
    const data = db.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asdoks-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup exportado.')
  }

  const importBackup = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!confirm('Importar este backup vai substituir todos os dados atuais. Continuar?')) return
        db.importAll(data)
        showToast('Backup importado com sucesso.')
        navigate('/')
      } catch { showToast('Arquivo inválido.', 'error') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetAll = () => {
    if (!confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) return
    db.clearAll()
    db.seedIfEmpty()
    showToast('Todos os dados foram apagados.')
    navigate('/')
  }

  const sectionCls = "bg-white border border-[#DDE1EA] rounded-xl shadow-sm p-5 mb-5"
  const sectionTitle = "text-[11px] font-bold uppercase tracking-widest text-[#A8AFBC] mb-4"

  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie unidades de treinamento e os dados salvos neste navegador." />

      {/* Unidades de treinamento */}
      <div className={sectionCls}>
        <h3 className={sectionTitle}>Unidades de treinamento</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {units.length === 0 ? (
            <span className="text-sm text-[#A8AFBC]">Nenhuma unidade cadastrada.</span>
          ) : units.map(unit => (
            <span key={unit.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[#E6EFFC] text-[#0D3278] border border-[#B8CEED]">
              {unit.label}
              <button onClick={() => removeUnit(unit)} className="hover:text-red-500 transition-colors" aria-label="Remover">
                <EvaIcon name="close-outline" size={14} fill="currentColor" />
              </button>
            </span>
          ))}
        </div>
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

      {/* Dados */}
      <div className={sectionCls}>
        <h3 className={sectionTitle}>Dados do sistema</h3>
        <p className="text-sm text-[#4A5568] mb-4">
          Todos os dados são salvos neste navegador. Use exportar/importar para fazer backup ou transferir entre dispositivos.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={exportBackup}>
            <EvaIcon name="download-outline" size={16} fill="currentColor" />
            Exportar backup
          </Button>
          <label>
            <Button variant="secondary" as="span">
              <EvaIcon name="upload-outline" size={16} fill="currentColor" />
              Importar backup
            </Button>
            <input type="file" accept="application/json" className="hidden" onChange={importBackup} />
          </label>
          <Button variant="danger" onClick={resetAll}>
            <EvaIcon name="trash-2-outline" size={16} fill="currentColor" />
            Apagar todos os dados
          </Button>
        </div>
      </div>
    </div>
  )
}
