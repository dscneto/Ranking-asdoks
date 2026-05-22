// src/pages/ResultadosPage.jsx
// =====================================================
// PÁGINA DE RESULTADOS
//
// Aqui você registra o desempenho de cada atleta
// em cada competição (kumitê e/ou kata).
//
// Fluxo:
//  1. Seleciona a competição
//  2. Vê os atletas disponíveis
//  3. Define a colocação de cada atleta em cada modalidade
// =====================================================

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../data/AppContext';
import { CONFIG_COMPETICOES } from '../data/mockData';
import { calcularPontos, formatarData, corFaixa } from '../utils/calculos';
import { Medal, ChevronDown, Save, Trash2, Trophy } from 'lucide-react';
import './ResultadosPage.css';

// Opções de colocação
const COLOCACOES = [
  { valor: '', label: 'Não participou' },
  { valor: 'ouro', label: '🥇 1º Lugar (Ouro)' },
  { valor: 'prata', label: '🥈 2º Lugar (Prata)' },
  { valor: 'bronze', label: '🥉 3º Lugar (Bronze)' },
  { valor: 'participacao', label: '🎽 Participação' },
];

export default function ResultadosPage() {
  const { atletas, competicoes, registrarResultado, removerResultado } = useAppContext();

  // Competição selecionada no filtro
  const [competicaoId, setCompeticaoId] = useState('');

  // Estado local das alterações pendentes
  // Estrutura: { 'atletaId-modalidade': 'colocacao' }
  const [alteracoesPendentes, setAlteracoesPendentes] = useState({});

  // Mensagem de sucesso ao salvar
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Competição selecionada (objeto completo)
  const competicaoSelecionada = useMemo(
    () => competicoes.find(c => c.id === competicaoId),
    [competicoes, competicaoId]
  );

  // Ordena as competições da mais recente
  const competicoesOrdenadas = useMemo(
    () => [...competicoes].sort((a, b) => new Date(b.data) - new Date(a.data)),
    [competicoes]
  );

  // Retorna a colocação atual de um atleta em uma modalidade
  // Prioridade: alteração pendente > salvo no contexto
  function getColocacao(atletaId, modalidade) {
    const chave = `${atletaId}-${modalidade}`;
    if (chave in alteracoesPendentes) return alteracoesPendentes[chave];
    if (!competicaoSelecionada) return '';
    const resultado = competicaoSelecionada.resultados.find(
      r => r.atletaId === atletaId && r.modalidade === modalidade
    );
    return resultado?.colocacao || '';
  }

  // Ao mudar o select de colocação, registra como alteração pendente
  function alterarColocacao(atletaId, modalidade, colocacao) {
    const chave = `${atletaId}-${modalidade}`;
    setAlteracoesPendentes(ant => ({ ...ant, [chave]: colocacao }));
  }

  // Salva todas as alterações pendentes de uma vez
  function salvarTudo() {
    if (!competicaoSelecionada) return;

    Object.entries(alteracoesPendentes).forEach(([chave, colocacao]) => {
      const [atletaId, modalidade] = chave.split('-');
      if (colocacao === '') {
        // Vazio = removeu o resultado
        removerResultado(competicaoSelecionada.id, atletaId, modalidade);
      } else {
        registrarResultado(competicaoSelecionada.id, { atletaId, modalidade, colocacao });
      }
    });

    setAlteracoesPendentes({});
    setMensagemSucesso('Resultados salvos com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  }

  // Quantas alterações existem
  const totalPendentes = Object.keys(alteracoesPendentes).length;

  // Ao trocar de competição, limpa alterações pendentes
  function trocarCompeticao(id) {
    setCompeticaoId(id);
    setAlteracoesPendentes({});
  }

  return (
    <div className="resultados-page fade-in">
      {/* Header */}
      <div className="pagina-header">
        <div>
          <h1 className="pagina-titulo">
            <Medal size={26} aria-hidden="true" />
            Resultados
          </h1>
          <p className="pagina-subtitulo">Registre as colocações de cada atleta por competição</p>
        </div>

        {/* Botão salvar (aparece só com pendências) */}
        {totalPendentes > 0 && (
          <button className="btn-primario btn-salvar-flutuante" onClick={salvarTudo}>
            <Save size={16} aria-hidden="true" />
            Salvar {totalPendentes} alteraç{totalPendentes > 1 ? 'ões' : 'ão'}
          </button>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {mensagemSucesso && (
        <div className="mensagem-sucesso" role="alert">
          ✅ {mensagemSucesso}
        </div>
      )}

      {/* ===== SELETOR DE COMPETIÇÃO ===== */}
      <div className="card seletor-competicao">
        <div className="campo-form">
          <label htmlFor="selecionar-competicao">
            <Trophy size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} aria-hidden="true" />
            Selecione a competição
          </label>
          <div className="select-wrapper">
            <select
              id="selecionar-competicao"
              value={competicaoId}
              onChange={e => trocarCompeticao(e.target.value)}
            >
              <option value="">— Escolha uma competição —</option>
              {competicoesOrdenadas.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.nome} ({formatarData(comp.data)})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-icone" aria-hidden="true" />
          </div>
        </div>

        {/* Info da competição selecionada */}
        {competicaoSelecionada && (
          <div className="competicao-info-banner">
            <div
              className="banner-cor"
              style={{ background: CONFIG_COMPETICOES[competicaoSelecionada.tipo]?.cor }}
            />
            <div>
              <div className="banner-nome">{competicaoSelecionada.nome}</div>
              <div className="banner-detalhes">
                {formatarData(competicaoSelecionada.data)} · {competicaoSelecionada.local}
              </div>
            </div>
            <div className="banner-pontuacao">
              {Object.entries(CONFIG_COMPETICOES[competicaoSelecionada.tipo]?.kumite || {}).map(([col, pts]) => (
                <span key={col} className="pontos-pill">
                  {col === 'ouro' && '🥇'}
                  {col === 'prata' && '🥈'}
                  {col === 'bronze' && '🥉'}
                  {col === 'participacao' && '🎽'}
                  {pts} pts
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== TABELA DE RESULTADOS ===== */}
      {!competicaoId ? (
        <div className="lista-vazia">
          <Medal size={48} aria-hidden="true" />
          <p>Selecione uma competição para registrar os resultados.</p>
        </div>
      ) : atletas.length === 0 ? (
        <div className="lista-vazia">
          <p>Nenhum atleta cadastrado. Vá para a aba Atletas primeiro.</p>
        </div>
      ) : (
        <div className="card resultados-tabela-container">
          {/* Instrução */}
          <p className="instrucao">
            Defina a colocação de cada atleta em Kumitê e/ou Kata. Deixe em branco se o atleta não participou daquela modalidade. Clique em <strong>Salvar</strong> quando terminar.
          </p>

          <table className="resultados-tabela" role="table">
            <thead>
              <tr>
                <th>Atleta</th>
                <th className="col-modalidade">
                  <span className="modalidade-kumite">Kumitê</span>
                  <span className="modalidade-pts">
                    (ouro: {CONFIG_COMPETICOES[competicaoSelecionada?.tipo]?.kumite.ouro} pts)
                  </span>
                </th>
                <th className="col-modalidade">
                  <span className="modalidade-kata">Kata</span>
                  <span className="modalidade-pts">
                    (ouro: {CONFIG_COMPETICOES[competicaoSelecionada?.tipo]?.kata.ouro} pts)
                  </span>
                </th>
                <th className="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              {atletas.map(atleta => {
                const colocacaoKumite = getColocacao(atleta.id, 'kumite');
                const colocacaoKata = getColocacao(atleta.id, 'kata');
                const pontosKumite = colocacaoKumite
                  ? calcularPontos(competicaoSelecionada.tipo, 'kumite', colocacaoKumite)
                  : 0;
                const pontosKata = colocacaoKata
                  ? calcularPontos(competicaoSelecionada.tipo, 'kata', colocacaoKata)
                  : 0;
                const totalAtleta = pontosKumite + pontosKata;

                // Verifica se tem alguma alteração pendente para esse atleta
                const temPendencia =
                  `${atleta.id}-kumite` in alteracoesPendentes ||
                  `${atleta.id}-kata` in alteracoesPendentes;

                return (
                  <tr
                    key={atleta.id}
                    className={`resultado-linha ${temPendencia ? 'linha-pendente' : ''}`}
                  >
                    {/* Nome do atleta */}
                    <td>
                      <div className="atleta-nome-linha">
                        <div
                          className="faixa-bolinha"
                          style={{ background: corFaixa(atleta.faixa) }}
                          aria-hidden="true"
                        />
                        <div>
                          <div className="atleta-nome">{atleta.nome}</div>
                          <div className="atleta-academia">{atleta.academia}</div>
                        </div>
                      </div>
                    </td>

                    {/* Select Kumitê */}
                    <td>
                      <div className="celula-modalidade">
                        <select
                          value={colocacaoKumite}
                          onChange={e => alterarColocacao(atleta.id, 'kumite', e.target.value)}
                          className={`select-colocacao ${colocacaoKumite ? `select-${colocacaoKumite}` : ''}`}
                          aria-label={`Colocação de ${atleta.nome} em Kumitê`}
                        >
                          {COLOCACOES.map(op => (
                            <option key={op.valor} value={op.valor}>{op.label}</option>
                          ))}
                        </select>
                        {colocacaoKumite && (
                          <span className="pts-badge">+{pontosKumite} pts</span>
                        )}
                      </div>
                    </td>

                    {/* Select Kata */}
                    <td>
                      <div className="celula-modalidade">
                        <select
                          value={colocacaoKata}
                          onChange={e => alterarColocacao(atleta.id, 'kata', e.target.value)}
                          className={`select-colocacao ${colocacaoKata ? `select-${colocacaoKata}` : ''}`}
                          aria-label={`Colocação de ${atleta.nome} em Kata`}
                        >
                          {COLOCACOES.map(op => (
                            <option key={op.valor} value={op.valor}>{op.label}</option>
                          ))}
                        </select>
                        {colocacaoKata && (
                          <span className="pts-badge">+{pontosKata} pts</span>
                        )}
                      </div>
                    </td>

                    {/* Total de pontos */}
                    <td>
                      {totalAtleta > 0 ? (
                        <span className="total-pontos">{totalAtleta}</span>
                      ) : (
                        <span className="texto-suave">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Botão salvar no rodapé da tabela */}
          {totalPendentes > 0 && (
            <div className="rodape-salvar">
              <span className="pendentes-aviso">
                {totalPendentes} alteraç{totalPendentes > 1 ? 'ões' : 'ão'} não salva{totalPendentes > 1 ? 's' : ''}
              </span>
              <button className="btn-primario" onClick={salvarTudo}>
                <Save size={16} aria-hidden="true" />
                Salvar tudo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
