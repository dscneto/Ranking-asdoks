// src/pages/AtletasPage.jsx
// =====================================================
// PÁGINA DE ATLETAS
//
// Lista todos os atletas cadastrados.
// Permite: adicionar, editar e remover atletas.
// O formulário aparece em um modal (caixa flutuante).
// =====================================================

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../data/AppContext';
import { calcularIdade, getCategoriaIdade, corFaixa } from '../utils/calculos';
import { UserPlus, Edit2, Trash2, User, Search, X } from 'lucide-react';
import './AtletasPage.css';

// Dados vazios para o formulário de novo atleta
const ATLETA_VAZIO = {
  nome: '',
  genero: 'masculino',
  nascimento: '',
  faixa: 'branca',
  academia: '',
};

// Lista de faixas disponíveis para o select
const FAIXAS = ['branca', 'amarela', 'laranja', 'verde', 'azul', 'roxa', 'marrom', 'preta'];

export default function AtletasPage() {
  const { atletas, adicionarAtleta, editarAtleta, removerAtleta } = useAppContext();

  // ---- ESTADOS ----
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [atletaEditando, setAtletaEditando] = useState(null); // null = novo atleta
  const [formDados, setFormDados] = useState(ATLETA_VAZIO);
  const [erros, setErros] = useState({});
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);

  // ---- FILTRAGEM POR BUSCA ----
  const atletasFiltrados = atletas.filter(atleta =>
    atleta.nome.toLowerCase().includes(busca.toLowerCase()) ||
    atleta.academia?.toLowerCase().includes(busca.toLowerCase())
  );

  // ---- FUNÇÕES DO MODAL ----

  // Abre o modal para adicionar novo atleta
  function abrirModalNovo() {
    setAtletaEditando(null);
    setFormDados(ATLETA_VAZIO);
    setErros({});
    setModalAberto(true);
  }

  // Abre o modal para editar atleta existente
  function abrirModalEditar(atleta) {
    setAtletaEditando(atleta.id);
    setFormDados({
      nome: atleta.nome,
      genero: atleta.genero,
      nascimento: atleta.nascimento,
      faixa: atleta.faixa,
      academia: atleta.academia || '',
    });
    setErros({});
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setAtletaEditando(null);
    setFormDados(ATLETA_VAZIO);
    setErros({});
  }

  // ---- ATUALIZAR CAMPO DO FORMULÁRIO ----
  // Chamada toda vez que o usuário digita em um campo
  function atualizarCampo(campo, valor) {
    setFormDados(anterior => ({ ...anterior, [campo]: valor }));
    // Remove o erro do campo ao começar a digitar
    if (erros[campo]) {
      setErros(anterior => ({ ...anterior, [campo]: '' }));
    }
  }

  // ---- VALIDAÇÃO ----
  function validarFormulario() {
    const novosErros = {};
    if (!formDados.nome.trim()) novosErros.nome = 'Nome é obrigatório';
    if (!formDados.nascimento) novosErros.nascimento = 'Data de nascimento é obrigatória';
    if (!formDados.academia.trim()) novosErros.academia = 'Academia é obrigatória';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0; // retorna true se sem erros
  }

  // ---- SALVAR ----
  function salvarAtleta(e) {
    e.preventDefault(); // Previne recarregar a página
    if (!validarFormulario()) return;

    if (atletaEditando) {
      // Edição: atualiza o atleta existente
      editarAtleta(atletaEditando, formDados);
    } else {
      // Novo: cria com id único
      adicionarAtleta({ ...formDados, id: uuidv4(), foto: null });
    }
    fecharModal();
  }

  // ---- EXCLUSÃO ----
  function confirmarExclusao(id) { setConfirmandoExclusao(id); }
  function cancelarExclusao() { setConfirmandoExclusao(null); }
  function executarExclusao() {
    removerAtleta(confirmandoExclusao);
    setConfirmandoExclusao(null);
  }

  return (
    <div className="atletas-page fade-in">
      {/* ===== CABEÇALHO ===== */}
      <div className="pagina-header">
        <div>
          <h1 className="pagina-titulo">
            <User size={26} aria-hidden="true" />
            Atletas
          </h1>
          <p className="pagina-subtitulo">
            {atletas.length} atleta{atletas.length !== 1 ? 's' : ''} cadastrado{atletas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primario" onClick={abrirModalNovo}>
          <UserPlus size={18} aria-hidden="true" />
          Novo Atleta
        </button>
      </div>

      {/* ===== BARRA DE BUSCA ===== */}
      <div className="barra-busca">
        <Search size={16} className="busca-icone" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar por nome ou academia..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          aria-label="Buscar atletas"
        />
        {busca && (
          <button className="busca-limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ===== LISTA DE ATLETAS ===== */}
      {atletasFiltrados.length === 0 ? (
        <div className="lista-vazia">
          <User size={48} aria-hidden="true" />
          <p>{busca ? 'Nenhum atleta encontrado para essa busca.' : 'Nenhum atleta cadastrado ainda.'}</p>
          {!busca && (
            <button className="btn-primario" onClick={abrirModalNovo} style={{ marginTop: '1rem' }}>
              <UserPlus size={16} />
              Cadastrar primeiro atleta
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {atletasFiltrados.map(atleta => {
            const idade = calcularIdade(atleta.nascimento);
            const categoria = getCategoriaIdade(atleta.nascimento);
            const excluindo = confirmandoExclusao === atleta.id;

            return (
              <div key={atleta.id} className={`card atleta-card ${excluindo ? 'card-excluindo' : ''}`}>
                {/* Avatar + info principal */}
                <div className="atleta-card-topo">
                  {/* Avatar com inicial do nome */}
                  <div className="atleta-avatar">
                    {atleta.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="atleta-card-info">
                    <div className="atleta-card-nome">{atleta.nome}</div>
                    <div className="atleta-card-academia">{atleta.academia}</div>
                  </div>
                  {/* Indicador de faixa */}
                  <div
                    className="faixa-tag"
                    style={{
                      background: corFaixa(atleta.faixa),
                      color: atleta.faixa === 'branca' || atleta.faixa === 'amarela' ? '#333' : 'white'
                    }}
                    title={`Faixa ${atleta.faixa}`}
                  >
                    {atleta.faixa.charAt(0).toUpperCase() + atleta.faixa.slice(1)}
                  </div>
                </div>

                {/* Dados secundários */}
                <div className="atleta-card-dados">
                  <div className="atleta-dado">
                    <span className="dado-label">Idade</span>
                    <span className="dado-valor">{idade} anos</span>
                  </div>
                  <div className="atleta-dado">
                    <span className="dado-label">Categoria</span>
                    <span className="dado-valor">{categoria.nome}</span>
                  </div>
                  <div className="atleta-dado">
                    <span className="dado-label">Gênero</span>
                    <span className="dado-valor">
                      {atleta.genero === 'masculino' ? '♂ Masc.' : '♀ Fem.'}
                    </span>
                  </div>
                </div>

                {/* Confirmação de exclusão */}
                {excluindo ? (
                  <div className="confirmacao-exclusao">
                    <p>Tem certeza que deseja excluir <strong>{atleta.nome}</strong>?</p>
                    <div className="confirmacao-botoes">
                      <button className="btn-perigo" onClick={executarExclusao}>
                        Sim, excluir
                      </button>
                      <button className="btn-neutro" onClick={cancelarExclusao}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Botões de ação */
                  <div className="atleta-card-acoes">
                    <button className="btn-neutro" onClick={() => abrirModalEditar(atleta)}>
                      <Edit2 size={14} aria-hidden="true" />
                      Editar
                    </button>
                    <button className="btn-perigo" onClick={() => confirmarExclusao(atleta.id)}>
                      <Trash2 size={14} aria-hidden="true" />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL DE FORMULÁRIO ===== */}
      {modalAberto && (
        <>
          {/* Overlay escuro atrás do modal */}
          <div className="modal-overlay" onClick={fecharModal} aria-hidden="true" />

          {/* Caixa do modal */}
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
            <div className="modal-header">
              <h2 id="modal-titulo">
                {atletaEditando ? 'Editar Atleta' : 'Novo Atleta'}
              </h2>
              <button className="modal-fechar" onClick={fecharModal} aria-label="Fechar modal">
                <X size={20} />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={salvarAtleta} className="modal-form" noValidate>
              {/* Nome */}
              <div className={`campo-form ${erros.nome ? 'campo-erro' : ''}`}>
                <label htmlFor="atleta-nome">Nome completo *</label>
                <input
                  id="atleta-nome"
                  type="text"
                  placeholder="Ex: João Carlos Silva"
                  value={formDados.nome}
                  onChange={e => atualizarCampo('nome', e.target.value)}
                  maxLength={100}
                />
                {erros.nome && <span className="erro-mensagem">{erros.nome}</span>}
              </div>

              {/* Linha: Gênero + Data de nascimento */}
              <div className="form-linha-dupla">
                <div className="campo-form">
                  <label htmlFor="atleta-genero">Gênero</label>
                  <select
                    id="atleta-genero"
                    value={formDados.genero}
                    onChange={e => atualizarCampo('genero', e.target.value)}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>

                <div className={`campo-form ${erros.nascimento ? 'campo-erro' : ''}`}>
                  <label htmlFor="atleta-nascimento">Data de nascimento *</label>
                  <input
                    id="atleta-nascimento"
                    type="date"
                    value={formDados.nascimento}
                    onChange={e => atualizarCampo('nascimento', e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Não permite data futura
                  />
                  {erros.nascimento && <span className="erro-mensagem">{erros.nascimento}</span>}
                </div>
              </div>

              {/* Linha: Faixa + Academia */}
              <div className="form-linha-dupla">
                <div className="campo-form">
                  <label htmlFor="atleta-faixa">Faixa</label>
                  <select
                    id="atleta-faixa"
                    value={formDados.faixa}
                    onChange={e => atualizarCampo('faixa', e.target.value)}
                  >
                    {FAIXAS.map(f => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`campo-form ${erros.academia ? 'campo-erro' : ''}`}>
                  <label htmlFor="atleta-academia">Academia / Clube *</label>
                  <input
                    id="atleta-academia"
                    type="text"
                    placeholder="Ex: Dojo Central"
                    value={formDados.academia}
                    onChange={e => atualizarCampo('academia', e.target.value)}
                    maxLength={80}
                  />
                  {erros.academia && <span className="erro-mensagem">{erros.academia}</span>}
                </div>
              </div>

              {/* Preview de faixa */}
              {formDados.faixa && (
                <div className="faixa-preview">
                  <div
                    className="faixa-preview-cor"
                    style={{ background: corFaixa(formDados.faixa) }}
                  />
                  <span>Faixa {formDados.faixa}</span>
                </div>
              )}

              {/* Botões */}
              <div className="modal-acoes">
                <button type="button" className="btn-neutro" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primario">
                  {atletaEditando ? 'Salvar alterações' : 'Cadastrar atleta'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
