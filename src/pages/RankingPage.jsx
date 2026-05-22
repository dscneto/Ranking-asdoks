// src/pages/RankingPage.jsx
// =====================================================
// PÁGINA DE RANKING
//
// Exibe a tabela de classificação dos atletas com filtros
// por: gênero, faixa etária e modalidade.
// =====================================================

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../data/AppContext';
import { calcularRanking, filtrarRanking, calcularIdade, getCategoriaIdade, corFaixa, formatarData } from '../utils/calculos';
import { CATEGORIAS_IDADE, CONFIG_COMPETICOES } from '../data/mockData';
import { Trophy, Medal, Filter, ChevronDown, ChevronUp, User } from 'lucide-react';
import './RankingPage.css';

export default function RankingPage() {
  const { atletas, competicoes } = useAppContext();

  // ---- FILTROS ----
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [filtroIdade, setFiltroIdade] = useState('todos');
  const [filtroModalidade, setFiltroModalidade] = useState('geral');

  // Estado para controlar qual linha está expandida (mostra histórico)
  const [atletaExpandido, setAtletaExpandido] = useState(null);

  // ---- CÁLCULO DO RANKING ----
  // useMemo recalcula só quando atletas/competições mudam
  // (evita recalcular a cada render desnecessário)
  const rankingCompleto = useMemo(
    () => calcularRanking(atletas, competicoes),
    [atletas, competicoes]
  );

  const rankingFiltrado = useMemo(
    () => filtrarRanking(rankingCompleto, filtroGenero, filtroIdade, filtroModalidade),
    [rankingCompleto, filtroGenero, filtroIdade, filtroModalidade]
  );

  // ---- FUNÇÕES AUXILIARES ----
  function toggleExpandir(atletaId) {
    setAtletaExpandido(anterior => anterior === atletaId ? null : atletaId);
  }

  function medalhaIcone(posicao) {
    if (posicao === 1) return '🥇';
    if (posicao === 2) return '🥈';
    if (posicao === 3) return '🥉';
    return posicao;
  }

  function classeColocacao(colocacao) {
    if (colocacao === 'ouro') return 'badge badge-ouro';
    if (colocacao === 'prata') return 'badge badge-prata';
    if (colocacao === 'bronze') return 'badge badge-bronze';
    return 'badge badge-participacao';
  }

  return (
    <div className="ranking-page fade-in">
      {/* ===== CABEÇALHO ===== */}
      <div className="ranking-header">
        <div>
          <h1 className="ranking-titulo">
            <Trophy size={28} aria-hidden="true" />
            Ranking Geral
          </h1>
          <p className="ranking-subtitulo">
            {rankingFiltrado.length} atleta{rankingFiltrado.length !== 1 ? 's' : ''} classificado{rankingFiltrado.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="card filtros-container">
        <div className="filtros-titulo">
          <Filter size={16} aria-hidden="true" />
          Filtros
        </div>
        <div className="filtros-grid">
          {/* Filtro de Gênero */}
          <div className="campo-form">
            <label htmlFor="filtro-genero">Gênero</label>
            <select
              id="filtro-genero"
              value={filtroGenero}
              onChange={e => setFiltroGenero(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>

          {/* Filtro de Idade */}
          <div className="campo-form">
            <label htmlFor="filtro-idade">Categoria de Idade</label>
            <select
              id="filtro-idade"
              value={filtroIdade}
              onChange={e => setFiltroIdade(e.target.value)}
            >
              <option value="todos">Todas</option>
              {CATEGORIAS_IDADE.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Modalidade */}
          <div className="campo-form">
            <label htmlFor="filtro-modalidade">Modalidade</label>
            <select
              id="filtro-modalidade"
              value={filtroModalidade}
              onChange={e => setFiltroModalidade(e.target.value)}
            >
              <option value="geral">Geral (Kumitê + Kata)</option>
              <option value="kumite">Somente Kumitê</option>
              <option value="kata">Somente Kata</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== TABELA DE RANKING ===== */}
      {rankingFiltrado.length === 0 ? (
        <div className="lista-vazia">
          <Medal size={48} aria-hidden="true" />
          <p>Nenhum atleta encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="card ranking-tabela-container">
          <table className="ranking-tabela" role="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Pos.</th>
                <th>Atleta</th>
                <th className="col-ocultar-mobile">Idade / Cat.</th>
                <th className="col-ocultar-mobile">Medalhas</th>
                <th>Pontos</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {rankingFiltrado.map((entrada, index) => {
                const posicao = index + 1;
                const idade = calcularIdade(entrada.atleta.nascimento);
                const categoria = getCategoriaIdade(entrada.atleta.nascimento);
                const expandido = atletaExpandido === entrada.atleta.id;

                return (
                  <React.Fragment key={entrada.atleta.id}>
                    {/* ---- LINHA PRINCIPAL ---- */}
                    <tr
                      className={`ranking-linha ${posicao <= 3 ? `top-${posicao}` : ''} ${expandido ? 'expandida' : ''}`}
                      onClick={() => toggleExpandir(entrada.atleta.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Posição */}
                      <td className="celula-posicao">
                        <span className={`badge-posicao posicao-${posicao <= 3 ? posicao : 'outro'}`}>
                          {medalhaIcone(posicao)}
                        </span>
                      </td>

                      {/* Nome e Academia */}
                      <td>
                        <div className="atleta-nome-linha">
                          {/* Indicador de faixa */}
                          <div
                            className="faixa-bolinha"
                            style={{ background: corFaixa(entrada.atleta.faixa) }}
                            title={`Faixa ${entrada.atleta.faixa}`}
                            aria-label={`Faixa ${entrada.atleta.faixa}`}
                          />
                          <div>
                            <div className="atleta-nome">{entrada.atleta.nome}</div>
                            <div className="atleta-academia">{entrada.atleta.academia}</div>
                          </div>
                        </div>
                      </td>

                      {/* Idade e Categoria */}
                      <td className="col-ocultar-mobile">
                        <div>{idade} anos</div>
                        <div className="texto-suave">{categoria.nome}</div>
                      </td>

                      {/* Medalhas */}
                      <td className="col-ocultar-mobile">
                        <div className="medalhas-linha">
                          {entrada.totalOuros > 0 && (
                            <span className="badge badge-ouro">🥇 {entrada.totalOuros}</span>
                          )}
                          {entrada.totalPratas > 0 && (
                            <span className="badge badge-prata">🥈 {entrada.totalPratas}</span>
                          )}
                          {entrada.totalBronzes > 0 && (
                            <span className="badge badge-bronze">🥉 {entrada.totalBronzes}</span>
                          )}
                          {entrada.totalOuros === 0 && entrada.totalPratas === 0 && entrada.totalBronzes === 0 && (
                            <span className="texto-suave">—</span>
                          )}
                        </div>
                      </td>

                      {/* Pontos */}
                      <td>
                        <span className="pontos-destaque">{entrada.totalPontos}</span>
                        <div className="texto-suave" style={{ fontSize: 11 }}>pontos</div>
                      </td>

                      {/* Botão expandir */}
                      <td>
                        {expandido
                          ? <ChevronUp size={16} className="texto-suave" aria-hidden="true" />
                          : <ChevronDown size={16} className="texto-suave" aria-hidden="true" />
                        }
                      </td>
                    </tr>

                    {/* ---- LINHA DE DETALHES (expandida) ---- */}
                    {expandido && (
                      <tr className="linha-detalhes">
                        <td colSpan={6}>
                          <div className="detalhes-container">
                            {/* Pontos por modalidade */}
                            <div className="detalhes-pontos">
                              <div className="detalhe-card">
                                <div className="detalhe-valor">{entrada.pontosPorModalidade.kumite}</div>
                                <div className="detalhe-label">Kumitê</div>
                              </div>
                              <div className="detalhe-card">
                                <div className="detalhe-valor">{entrada.pontosPorModalidade.kata}</div>
                                <div className="detalhe-label">Kata</div>
                              </div>
                              <div className="detalhe-card">
                                <div className="detalhe-valor">{entrada.totalParticipacoes}</div>
                                <div className="detalhe-label">Participações</div>
                              </div>
                            </div>

                            {/* Histórico de competições */}
                            {entrada.historico.length > 0 ? (
                              <div className="historico">
                                <h4>Histórico de Competições</h4>
                                <div className="historico-lista">
                                  {entrada.historico
                                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                                    .map((h, i) => (
                                    <div key={i} className="historico-item">
                                      <div
                                        className="historico-cor"
                                        style={{ background: CONFIG_COMPETICOES[h.competicaoTipo]?.cor || '#999' }}
                                      />
                                      <div className="historico-info">
                                        <div className="historico-nome">{h.competicaoNome}</div>
                                        <div className="historico-detalhes">
                                          {formatarData(h.data)} · {h.modalidade === 'kumite' ? 'Kumitê' : 'Kata'}
                                        </div>
                                      </div>
                                      <span className={classeColocacao(h.colocacao)}>
                                        {h.colocacao === 'ouro' && '🥇 Ouro'}
                                        {h.colocacao === 'prata' && '🥈 Prata'}
                                        {h.colocacao === 'bronze' && '🥉 Bronze'}
                                        {h.colocacao === 'participacao' && '🎽 Participou'}
                                      </span>
                                      <span className="historico-pontos">+{h.pontos} pts</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="texto-suave" style={{ fontSize: 13 }}>
                                Nenhuma competição registrada ainda.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
