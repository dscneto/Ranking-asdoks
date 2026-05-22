// src/data/AppContext.js
// =====================================================
// CONTEXTO GLOBAL DA APLICAÇÃO
//
// O React Context funciona como um "armazém central"
// de dados que qualquer componente pode acessar sem
// precisar passar props manualmente por toda a árvore.
//
// Como usar em qualquer componente:
//   import { useAppContext } from '../data/AppContext';
//   const { atletas, adicionarAtleta } = useAppContext();
// =====================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { atletasIniciais, competicoesIniciais } from './mockData';

// 1. Cria o contexto (um "recipiente" vazio por enquanto)
const AppContext = createContext();

// 2. O Provider é o componente que envolve toda a aplicação
//    e fornece os dados para todos os filhos
export function AppProvider({ children }) {
  // ---- ESTADO DOS ATLETAS ----
  // useState retorna [valor, funçãoParaAtualizar]
  // O segundo argumento é o valor inicial
  const [atletas, setAtletas] = useState(() => {
    // Tenta carregar do localStorage (memória do navegador)
    // Se não existir, usa os dados iniciais de exemplo
    const salvo = localStorage.getItem('karate_atletas');
    return salvo ? JSON.parse(salvo) : atletasIniciais;
  });

  // ---- ESTADO DAS COMPETIÇÕES ----
  const [competicoes, setCompeticoes] = useState(() => {
    const salvo = localStorage.getItem('karate_competicoes');
    return salvo ? JSON.parse(salvo) : competicoesIniciais;
  });

  // ---- SALVAR NO LOCALSTORAGE ----
  // useEffect executa o código toda vez que 'atletas' mudar
  // Assim os dados persistem mesmo ao recarregar a página
  useEffect(() => {
    localStorage.setItem('karate_atletas', JSON.stringify(atletas));
  }, [atletas]);

  useEffect(() => {
    localStorage.setItem('karate_competicoes', JSON.stringify(competicoes));
  }, [competicoes]);

  // ---- FUNÇÕES DOS ATLETAS ----

  // Adiciona um novo atleta ao array
  function adicionarAtleta(novoAtleta) {
    setAtletas(anterior => [...anterior, novoAtleta]);
  }

  // Atualiza um atleta existente pelo id
  function editarAtleta(id, dadosAtualizados) {
    setAtletas(anterior =>
      anterior.map(atleta =>
        atleta.id === id ? { ...atleta, ...dadosAtualizados } : atleta
      )
    );
  }

  // Remove um atleta pelo id
  function removerAtleta(id) {
    setAtletas(anterior => anterior.filter(atleta => atleta.id !== id));
  }

  // ---- FUNÇÕES DAS COMPETIÇÕES ----

  function adicionarCompeticao(novaCompeticao) {
    setCompeticoes(anterior => [...anterior, novaCompeticao]);
  }

  function editarCompeticao(id, dadosAtualizados) {
    setCompeticoes(anterior =>
      anterior.map(comp =>
        comp.id === id ? { ...comp, ...dadosAtualizados } : comp
      )
    );
  }

  function removerCompeticao(id) {
    setCompeticoes(anterior => anterior.filter(comp => comp.id !== id));
  }

  // Adiciona ou atualiza o resultado de um atleta em uma competição
  // resultado: { atletaId, modalidade, colocacao }
  // modalidade: 'kumite' ou 'kata'
  // colocacao: 'ouro', 'prata', 'bronze', 'participacao'
  function registrarResultado(competicaoId, resultado) {
    setCompeticoes(anterior =>
      anterior.map(comp => {
        if (comp.id !== competicaoId) return comp;

        // Remove resultado anterior do mesmo atleta+modalidade (se existir)
        const resultadosFiltrados = comp.resultados.filter(
          r => !(r.atletaId === resultado.atletaId && r.modalidade === resultado.modalidade)
        );

        return {
          ...comp,
          resultados: [...resultadosFiltrados, resultado],
        };
      })
    );
  }

  function removerResultado(competicaoId, atletaId, modalidade) {
    setCompeticoes(anterior =>
      anterior.map(comp => {
        if (comp.id !== competicaoId) return comp;
        return {
          ...comp,
          resultados: comp.resultados.filter(
            r => !(r.atletaId === atletaId && r.modalidade === modalidade)
          ),
        };
      })
    );
  }

  // ---- VALOR EXPORTADO ----
  // Tudo que está aqui pode ser acessado com useAppContext()
  const valor = {
    atletas,
    competicoes,
    adicionarAtleta,
    editarAtleta,
    removerAtleta,
    adicionarCompeticao,
    editarCompeticao,
    removerCompeticao,
    registrarResultado,
    removerResultado,
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

// 3. Hook customizado para facilitar o uso do contexto
//    Em vez de: useContext(AppContext)
//    Você usa:  useAppContext()
export function useAppContext() {
  const contexto = useContext(AppContext);
  if (!contexto) {
    throw new Error('useAppContext deve ser usado dentro de <AppProvider>');
  }
  return contexto;
}
