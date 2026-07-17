import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RankingPage from './pages/RankingPage'
import AthletesPage from './pages/AthletesPage'
import AthleteDetailPage from './pages/AthleteDetailPage'
import CompetitionsPage from './pages/CompetitionsPage'
import ResultsPage from './pages/ResultsPage'
import CompetitionTypesPage from './pages/CompetitionTypesPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth()

  // Aguarda verificar o token antes de redirecionar
  if (loading) return (
    <div className="flex justify-center py-16 text-[#A8AFBC] text-sm">
      Carregando...
    </div>
  )

  return isAuth ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            {/* Públicas — qualquer visitante acessa */}
            <Route index element={<RankingPage />} />
            <Route path="competicoes" element={<CompetitionsPage />} />
            <Route path="tipos" element={<CompetitionTypesPage />} />

            {/* Protegidas — redireciona para login se não autenticado */}
            <Route path="atletas" element={<PrivateRoute><AthletesPage /></PrivateRoute>} />
            <Route path="atletas/:id" element={<PrivateRoute><AthleteDetailPage /></PrivateRoute>} />
            <Route path="resultados" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
            <Route path="configuracoes" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="usuarios" element={<PrivateRoute><UsersPage /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}