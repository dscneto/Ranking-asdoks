import EvaIcon from '../ui/EvaIcon'
import { useSyncStatus } from '../../context/SyncContext'

export default function Topbar({ onMenuClick, title }) {
  const { isOnline, isSyncing, pendingCount, forceSync } = useSyncStatus()

  return (
    <header className="h-[60px] flex items-center gap-3 px-4 lg:px-6 bg-white border-b border-[#DDE1EA] sticky top-0 z-40">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#4A5568] hover:bg-[#E6EFFC] hover:text-[#1B4FA8] transition-colors"
        aria-label="Abrir menu"
      >
        <EvaIcon name="menu-2" size={22} fill="currentColor" />
      </button>

      <h1 className="text-lg font-bold text-[#0D1B35] flex-1">{title}</h1>

      {/* Indicador de status de conexão */}
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6EFFC] text-[#1B4FA8]">
            <EvaIcon name="loader-outline" size={14} fill="currentColor" />
            <span className="text-xs font-semibold hidden sm:block">Sincronizando...</span>
          </div>
        ) : !isOnline ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600">
            <EvaIcon name="wifi-off-outline" size={14} fill="currentColor" />
            <span className="text-xs font-semibold hidden sm:block">Offline</span>
          </div>
        ) : pendingCount > 0 ? (
          <button
            onClick={forceSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
          >
            <EvaIcon name="clock-outline" size={14} fill="currentColor" />
            <span className="text-xs font-semibold hidden sm:block">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
            <EvaIcon name="checkmark-circle-2-outline" size={14} fill="currentColor" />
            <span className="text-xs font-semibold hidden sm:block">Sincronizado</span>
          </div>
        )}
      </div>
    </header>
  )
}