import { NavLink } from 'react-router-dom'
import EvaIcon from '../ui/EvaIcon'

const NAV_ITEMS = [
  { to: '/',              label: 'Ranking',            icon: 'award'          },
  { to: '/atletas',       label: 'Atletas',            icon: 'people'         },
  { to: '/competicoes',   label: 'Competições',        icon: 'calendar'       },
  { to: '/resultados',    label: 'Lançar Resultados',  icon: 'bar-chart-2'    },
  { to: '/tipos',         label: 'Tipos de Competição',icon: 'layers'         },
  { to: '/configuracoes', label: 'Configurações',      icon: 'settings-2'     },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(13,50,120,0.45)] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[252px] z-60
        bg-[#0D3278] flex flex-col
        transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B4FA8] border-2 border-white/20 flex items-center justify-center text-white text-xs font-extrabold tracking-tight flex-shrink-0">
              AS
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-extrabold text-[15px] tracking-tight">ASDOKS</span>
              <span className="text-white/45 text-[9px] font-bold uppercase tracking-widest">Ranking Karatê</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <EvaIcon name="close" size={18} fill="currentColor" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-[11px] rounded-lg
                text-[15px] font-medium transition-all
                ${isActive
                  ? 'bg-[#1B4FA8] text-white shadow-[0_4px_12px_rgba(27,79,168,0.25)]'
                  : 'text-white/65 hover:bg-white/9 hover:text-white'
                }
              `}
            >
              <EvaIcon name={icon} size={18} fill="currentColor" className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/35 leading-snug">Associação Dória de Karatê Shotokan</p>
        </div>
      </aside>
    </>
  )
}
