import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import AppLayout from './components/layout/AppLayout'
import RankingPage from './pages/RankingPage'
import AthletesPage from './pages/AthletesPage'
import AthleteDetailPage from './pages/AthleteDetailPage'
import CompetitionsPage from './pages/CompetitionsPage'
import ResultsPage from './pages/ResultsPage'
import CompetitionTypesPage from './pages/CompetitionTypesPage'
import SettingsPage from './pages/SettingsPage'
import { db } from './utils/storage'

// Seed na primeira execução
db.seedIfEmpty()

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<RankingPage />} />
          <Route path="atletas" element={<AthletesPage />} />
          <Route path="atletas/:id" element={<AthleteDetailPage />} />
          <Route path="competicoes" element={<CompetitionsPage />} />
          <Route path="resultados" element={<ResultsPage />} />
          <Route path="tipos" element={<CompetitionTypesPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
