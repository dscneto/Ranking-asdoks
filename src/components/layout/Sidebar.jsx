import { NavLink, useNavigate } from 'react-router-dom'
import EvaIcon from '../ui/EvaIcon'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/ASDOKS_LOGO.png'

const PUBLIC_NAV = [
  { to: '/', label: 'Ranking', icon: 'award' },
  { to: '/competicoes', label: 'Competições', icon: 'calendar' },
  { to: '/tipos', label: 'Tipos de Competição', icon: 'layers' },
]

const PRIVATE_NAV = [
  { to: '/atletas', label: 'Atletas', icon: 'people' },
  { to: '/resultados', label: 'Lançar Resultados', icon: 'bar-chart-2' },
  { to: '/usuarios', label: 'Usuários', icon: 'person' },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings-2' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { isAuth, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    onClose()
  }

  const navItems = isAuth ? [...PUBLIC_NAV, ...PRIVATE_NAV] : PUBLIC_NAV

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(13,50,120,0.45)] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-[220px]
        bg-[#0D3278] flex flex-col
        transition-transform duration-200 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
          <img
            src={logo}
            alt="ASDOKS"
            className="w-full max-w-[160px] mx-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors ml-2 flex-shrink-0"
          >
            <EvaIcon name="close" size={18} fill="currentColor" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-[13px] font-medium transition-all
                ${isActive
                  ? 'bg-[#1B4FA8] text-white shadow-[0_4px_12px_rgba(27,79,168,0.25)]'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <EvaIcon name={icon} size={16} fill="currentColor" className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer — login/logout */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          {isAuth ? (
            <div>
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                {/* Avatar com iniciais */}
                <div className="w-8 h-8 rounded-full bg-[#1B4FA8] border-2 border-white/20 flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0">
                  {user.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-[12px] font-semibold truncate">{user.name}</p>
                  <p className="text-white/35 text-[10px] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/65 hover:bg-white/10 hover:text-white transition-all"
              >
                <EvaIcon name="log-out-outline" size={16} fill="currentColor" />
                Sair
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/65 hover:bg-white/10 hover:text-white transition-all"
            >
              <EvaIcon name="log-in-outline" size={16} fill="currentColor" />
              Entrar
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}