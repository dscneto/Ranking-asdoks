// src/App.jsx
// =====================================================
// COMPONENTE RAIZ DA APLICAÇÃO
//
// Aqui ficam:
// 1. O Provider do contexto global (AppProvider)
// 2. O BrowserRouter para gerenciar rotas de URL
// 3. As rotas da aplicação (qual URL → qual página)
//
// ESTRUTURA DE ROTAS:
//   /            → RankingPage   (página inicial)
//   /atletas     → AtletasPage
//   /competicoes → CompeticoesPage
//   /resultados  → ResultadosPage
// =====================================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './data/AppContext';
import Layout from './components/layout/Layout';
import RankingPage from './pages/RankingPage';
import AtletasPage from './pages/AtletasPage';
import CompeticoesPage from './pages/CompeticoesPage';
import ResultadosPage from './pages/ResultadosPage';

export default function App() {
  return (
    // AppProvider: fornece os dados globais para TODOS os componentes abaixo
    <AppProvider>
      {/* BrowserRouter: habilita a navegação por URL */}
      <BrowserRouter>
        {/* Layout: sidebar + área principal */}
        <Layout>
          {/* Routes: renderiza apenas a rota que corresponde à URL atual */}
          <Routes>
            {/* Página inicial: Ranking */}
            <Route path="/" element={<RankingPage />} />

            {/* Cadastro de atletas */}
            <Route path="/atletas" element={<AtletasPage />} />

            {/* Cadastro de competições */}
            <Route path="/competicoes" element={<CompeticoesPage />} />

            {/* Registro de resultados */}
            <Route path="/resultados" element={<ResultadosPage />} />

            {/* Rota 404: URL não encontrada */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '4rem', color: '#7F8C8D' }}>
                <h2 style={{ fontSize: 48, fontFamily: 'Bebas Neue, sans-serif' }}>404</h2>
                <p>Página não encontrada.</p>
              </div>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}