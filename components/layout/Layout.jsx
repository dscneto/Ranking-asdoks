// src/components/layout/Layout.jsx
// =====================================================
// COMPONENTE DE LAYOUT PRINCIPAL
//
// Envolve toda a aplicação com:
// - Sidebar de navegação (menu lateral)
// - Área de conteúdo principal
//
// No mobile, a sidebar vira um menu hamburguer.
// =====================================================

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users, Trophy, Medal, BarChart3, Menu, X, ChevronRight
} from 'lucide-react';
import './Layout.css';

// Itens do menu de navegação
// 'to' é o caminho da rota (definido no App.jsx)
const MENU_ITENS = [
  { to: '/',             icone: BarChart3, label: 'Ranking'      },
  { to: '/atletas',      icone: Users,     label: 'Atletas'      },
  { to: '/competicoes',  icone: Trophy,    label: 'Competições'  },
  { to: '/resultados',   icone: Medal,     label: 'Resultados'   },
];

export default function Layout({ children }) {
  // Estado para controlar se o menu mobile está aberto
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  // Descobre o título da página atual para o header mobile
  const paginaAtual = MENU_ITENS.find(item => item.to === location.pathname);
  const tituloPagina = paginaAtual?.label || 'Ranking Karatê';

  return (
    <div className="layout">
      {/* ===== OVERLAY MOBILE (fundo escuro quando menu abre) ===== */}
      {menuAberto && (
        <div
          className="overlay-mobile"
          onClick={() => setMenuAberto(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR / MENU LATERAL ===== */}
      <aside className={`sidebar ${menuAberto ? 'aberta' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icone">空</div>
          <div className="logo-texto">
            <span className="logo-titulo">KARATÊ</span>
            <span className="logo-subtitulo">RANKING</span>
          </div>
          {/* Botão de fechar (só mobile) */}
          <button
            className="btn-fechar-menu"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Itens de navegação */}
        <nav className="sidebar-nav" aria-label="Menu principal">
          {MENU_ITENS.map(({ to, icone: Icone, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}  // 'end' garante match exato só para a raiz
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-ativo' : ''}`
              }
              onClick={() => setMenuAberto(false)}
            >
              <Icone size={20} aria-hidden="true" />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-seta" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da sidebar */}
        <div className="sidebar-rodape">
          <p>Sistema de Ranking</p>
          <p>v1.0.0</p>
        </div>
      </aside>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="conteudo-principal">
        {/* Header mobile (visível só em telas pequenas) */}
        <header className="header-mobile">
          <button
            className="btn-menu-hamburguer"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="header-mobile-titulo">{tituloPagina}</h1>
          <div style={{ width: 40 }} /> {/* Espaçador para centralizar título */}
        </header>

        {/* Área onde as páginas são renderizadas */}
        <div className="pagina-conteudo">
          {children}
        </div>
      </main>
    </div>
  );
}
