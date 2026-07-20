import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SyncProvider } from './context/SyncContext'
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
        <SyncProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AppLayout />}>
              {/* Públicas */}
              <Route index element={<RankingPage />} />
              <Route path="competicoes" element={<CompetitionsPage />} />
              <Route path="tipos" element={<CompetitionTypesPage />} />
              <Route path="atletas/:id" element={<AthleteDetailPage />} />

              {/* Protegidas */}
              <Route path="atletas" element={<PrivateRoute><AthletesPage /></PrivateRoute>} />
              <Route path="resultados" element={<PrivateRoute><ResultsPage /></PrivateRoute>} />
              <Route path="configuracoes" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="usuarios" element={<PrivateRoute><UsersPage /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SyncProvider>
      </ToastProvider>
    </AuthProvider>
  )
}