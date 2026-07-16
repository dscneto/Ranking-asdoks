import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/':              'Ranking',
  '/atletas':       'Atletas',
  '/competicoes':   'Competições',
  '/resultados':    'Lançar Resultados',
  '/tipos':         'Tipos de Competição',
  '/configuracoes': 'Configurações',
  '/usuarios':      'Usuários',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { loading } = useAuth()
  const location = useLocation()

  const title = Object.entries(TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'ASDOKS'

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-6 w-full">
          {loading ? (
            <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">
              Carregando...
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}