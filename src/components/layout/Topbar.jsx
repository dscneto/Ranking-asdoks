import EvaIcon from '../ui/EvaIcon'

export default function Topbar({ onMenuClick, title }) {
  return (
    <header className="h-[60px] flex items-center gap-3 px-4 lg:px-6 bg-white border-b border-[#DDE1EA] sticky top-0 z-40">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#4A5568] hover:bg-[#E6EFFC] hover:text-[#1B4FA8] transition-colors"
        aria-label="Abrir menu"
      >
        <EvaIcon name="menu-2" size={22} fill="currentColor" />
      </button>
      <h1 className="text-lg font-bold text-[#0D1B35]">{title}</h1>
    </header>
  )
}
