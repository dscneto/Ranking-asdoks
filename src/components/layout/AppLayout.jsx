import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const TITLES = {
  '/':              'Ranking',
  '/atletas':       'Atletas',
  '/competicoes':   'Competições',
  '/resultados':    'Lançar Resultados',
  '/tipos':         'Tipos de Competição',
  '/configuracoes': 'Configurações',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const title = Object.entries(TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'ASDOKS'

  return (
    <div className="flex min-h-screen bg-[#F5F6F8]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[252px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1200px] w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
