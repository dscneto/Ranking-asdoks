// src/index.js
// =====================================================
// PONTO DE ENTRADA DO REACT
//
// Este arquivo inicializa a aplicação React e a "monta"
// dentro do elemento <div id="root"> do public/index.html
// =====================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';   // Estilos globais
import App from './App'; // Componente raiz

// Cria a raiz do React e renderiza o App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode: destaca problemas potenciais em desenvolvimento
  // (renderiza componentes duas vezes em dev para detectar efeitos colaterais)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
