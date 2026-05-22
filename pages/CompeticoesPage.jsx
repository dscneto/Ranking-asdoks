// src/pages/CompeticoesPage.jsx
// =====================================================
// PÁGINA DE COMPETIÇÕES
//
// Lista todas as competições cadastradas.
// Permite: adicionar, editar e remover competições.
// =====================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../data/AppContext';
import { CONFIG_COMPETICOES } from '../data/mockData';
import { formatarData } from '../utils/calculos';
import { Trophy, Plus, Edit2, Trash2, MapPin, Calendar, X } from 'lucide-react';
import './CompeticoesPage.css';

const COMPETICAO_VAZIA = {
  tipo: 'clube',
  nome: '',
  data: '',
  local: '',
};

export default function CompeticoesPage() {
  const { competicoes, adicionarCompeticao, editarCompeticao, removerCompeticao } = useAppContext();

  const [modalAberto, setModalAberto] = useState(false);
  const [competicaoEditando, setCompeticaoEditando] = useState(null);
  const [formDados, setFormDados] = useState(COMPETICAO_VAZIA);
  const [erros, setErros] = useState({});
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);

  // Ordena competições da mais recente para mais antiga
  const competicoesOrdenadas = [...competicoes].sort(
    (a, b) => new Date(b.data) - new Date(a.data)
  );

  function abrirModalNovo() {
    setCompeticaoEditando(null);
    setFormDados(COMPETICAO_VAZIA);
    setErros({});
    setModalAberto(true);
  }

  function abrirModalEditar(comp) {
    setCompeticaoEditando(comp.id);
    setFormDados({
      tipo: comp.tipo,
      nome: comp.nome,
      data: comp.data,
      local: comp.local,
    });
    setErros({});
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCompeticaoEditando(null);
    setErros({});
  }

  function atualizarCampo(campo, valor) {
    setFormDados(ant => {
      const novo = { ...ant, [campo]: valor };
      // Se o tipo muda, sugere um nome automático
      if (campo === 'tipo') {
        novo.nome = CONFIG_COMPETICOES[valor]?.nome || '';
      }
      return novo;
    });
    if (erros[campo]) setErros(ant => ({ ...ant, [campo]: '' }));
  }

  function validar() {
    const novosErros = {};
    if (!formDados.nome.trim()) novosErros.nome = 'Nome é obrigatório';
    if (!formDados.data) novosErros.data = 'Data é obrigatória';
    if (!formDados.local.trim()) novosErros.local = 'Local é obrigatório';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function salvar(e) {
    e.preventDefault();
    if (!validar()) return;

    if (competicaoEditando) {
      editarCompeticao(competicaoEditando, formDados);
    } else {
      adicionarCompeticao({ ...formDados, id: uuidv4(), resultados: [] });
    }
    fecharModal();
  }

  return (
    <div className="competicoes-page fade-in">
      {/* Header */}
      <div className="pagina-header">
        <div>
          <h1 className="pagina-titulo">
            <Trophy size={26} aria-hidden="true" />
            Competições
          </h1>
          <p className="pagina-subtitulo">
            {competicoes.length} competiç{competicoes.length !== 1 ? 'ões' : 'ão'} cadastrada{competicoes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primario" onClick={abrirModalNovo}>
          <Plus size={18} aria-hidden="true" />
          Nova Competição
        </button>
      </div>

      {/* ===== TABELA DE PONTUAÇÃO ===== */}
      <div className="card tabela-pontuacao">
        <h3 className="secao-titulo">Tabela de Pontuação por Tipo</h3>
        <div className="pontuacao-grid">
          {Object.entries(CONFIG_COMPETICOES).map(([key, config]) => (
            <div key={key} className="pontuacao-item">
              <div className="pontuacao-cor" style={{ background: config.cor }} />
              <div className="pontuacao-nome">{config.nome}</div>
              <div className="pontuacao-valores">
                <span title="Ouro">🥇 {config.kumite.ouro}</span>
                <span title="Prata">🥈 {config.kumite.prata}</span>
                <span title="Bronze">🥉 {config.kumite.bronze}</span>
                <span title="Participação">🎽 {config.kumite.participacao}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="nota-tabela">* Pontos iguais para Kumitê e Kata nesta configuração. Edite em <code>src/data/mockData.js</code></p>
      </div>

      {/* ===== LISTA DE COMPETIÇÕES ===== */}
      {competicoesOrdenadas.length === 0 ? (
        <div className="lista-vazia">
          <Trophy size={48} aria-hidden="true" />
          <p>Nenhuma competição cadastrada ainda.</p>
          <button className="btn-primario" onClick={abrirModalNovo} style={{ marginTop: '1rem' }}>
            <Plus size={16} />
            Cadastrar primeira competição
          </button>
        </div>
      ) : (
        <div className="competicoes-lista">
          {competicoesOrdenadas.map(comp => {
            const config = CONFIG_COMPETICOES[comp.tipo];
            const excluindo = confirmandoExclusao === comp.id;

            return (
              <div
                key={comp.id}
                className={`card competicao-card ${excluindo ? 'card-excluindo' : ''}`}
              >
                {/* Faixa colorida no topo */}
                <div className="competicao-faixa" style={{ background: config?.cor || '#999' }} />

                <div className="competicao-corpo">
                  {/* Badge do tipo */}
                  <span
                    className="competicao-tipo-badge"
                    style={{ background: config?.cor || '#999', color: config?.corTexto || '#fff' }}
                  >
                    {config?.nome || comp.tipo}
                  </span>

                  {/* Nome */}
                  <h3 className="competicao-nome">{comp.nome}</h3>

                  {/* Data e Local */}
                  <div className="competicao-meta">
                    <span className="meta-item">
                      <Calendar size={13} aria-hidden="true" />
                      {formatarData(comp.data)}
                    </span>
                    <span className="meta-item">
                      <MapPin size={13} aria-hidden="true" />
                      {comp.local}
                    </span>
                  </div>

                  {/* Contagem de resultados */}
                  <div className="competicao-resultados">
                    <span className="resultados-count">
                      {comp.resultados.length} resultado{comp.resultados.length !== 1 ? 's' : ''} registrado{comp.resultados.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Confirmação de exclusão */}
                  {excluindo ? (
                    <div className="confirmacao-exclusao">
                      <p>Excluir <strong>{comp.nome}</strong>? Todos os resultados serão removidos.</p>
                      <div className="confirmacao-botoes">
                        <button className="btn-perigo" onClick={() => { removerCompeticao(comp.id); setConfirmandoExclusao(null); }}>
                          Sim, excluir
                        </button>
                        <button className="btn-neutro" onClick={() => setConfirmandoExclusao(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="competicao-acoes">
                      <button className="btn-neutro" onClick={() => abrirModalEditar(comp)}>
                        <Edit2 size={14} aria-hidden="true" />
                        Editar
                      </button>
                      <button className="btn-perigo" onClick={() => setConfirmandoExclusao(comp.id)}>
                        <Trash2 size={14} aria-hidden="true" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {modalAberto && (
        <>
          <div className="modal-overlay" onClick={fecharModal} aria-hidden="true" />
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-comp-titulo">
            <div className="modal-header">
              <h2 id="modal-comp-titulo">
                {competicaoEditando ? 'Editar Competição' : 'Nova Competição'}
              </h2>
              <button className="modal-fechar" onClick={fecharModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvar} className="modal-form" noValidate>
              {/* Tipo */}
              <div className="campo-form">
                <label htmlFor="comp-tipo">Tipo de competição</label>
                <select
                  id="comp-tipo"
                  value={formDados.tipo}
                  onChange={e => atualizarCampo('tipo', e.target.value)}
                >
                  {Object.entries(CONFIG_COMPETICOES).map(([key, config]) => (
                    <option key={key} value={key}>{config.nome}</option>
                  ))}
                </select>
              </div>

              {/* Preview de pontuação */}
              {formDados.tipo && (
                <div className="pontuacao-preview">
                  <div className="preview-titulo">Pontuação desta competição (Kumitê / Kata):</div>
                  <div className="preview-valores">
                    <span>🥇 Ouro: <strong>{CONFIG_COMPETICOES[formDados.tipo]?.kumite.ouro} pts</strong></span>
                    <span>🥈 Prata: <strong>{CONFIG_COMPETICOES[formDados.tipo]?.kumite.prata} pts</strong></span>
                    <span>🥉 Bronze: <strong>{CONFIG_COMPETICOES[formDados.tipo]?.kumite.bronze} pts</strong></span>
                    <span>🎽 Part.: <strong>{CONFIG_COMPETICOES[formDados.tipo]?.kumite.participacao} pts</strong></span>
                  </div>
                </div>
              )}

              {/* Nome */}
              <div className={`campo-form ${erros.nome ? 'campo-erro' : ''}`}>
                <label htmlFor="comp-nome">Nome da competição *</label>
                <input
                  id="comp-nome"
                  type="text"
                  placeholder="Ex: Campeonato Baiano 2025"
                  value={formDados.nome}
                  onChange={e => atualizarCampo('nome', e.target.value)}
                  maxLength={120}
                />
                {erros.nome && <span className="erro-mensagem">{erros.nome}</span>}
              </div>

              {/* Data + Local */}
              <div className="form-linha-dupla">
                <div className={`campo-form ${erros.data ? 'campo-erro' : ''}`}>
                  <label htmlFor="comp-data">Data *</label>
                  <input
                    id="comp-data"
                    type="date"
                    value={formDados.data}
                    onChange={e => atualizarCampo('data', e.target.value)}
                  />
                  {erros.data && <span className="erro-mensagem">{erros.data}</span>}
                </div>

                <div className={`campo-form ${erros.local ? 'campo-erro' : ''}`}>
                  <label htmlFor="comp-local">Local *</label>
                  <input
                    id="comp-local"
                    type="text"
                    placeholder="Ex: Salvador, BA"
                    value={formDados.local}
                    onChange={e => atualizarCampo('local', e.target.value)}
                    maxLength={80}
                  />
                  {erros.local && <span className="erro-mensagem">{erros.local}</span>}
                </div>
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-neutro" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn-primario">
                  {competicaoEditando ? 'Salvar alterações' : 'Criar competição'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
