// src/utils/calculos.js
// =====================================================
// FUNÇÕES UTILITÁRIAS
//
// Funções puras (recebem dados, retornam dados, sem
// efeitos colaterais) que são reutilizadas em vários
// lugares da aplicação.
// =====================================================

import { CONFIG_COMPETICOES, CATEGORIAS_IDADE } from '../data/mockData';

// --------------------------------------------------
// Calcula a idade em anos a partir da data de nascimento
// Exemplo: calcularIdade('2005-06-15') → 19
// --------------------------------------------------
export function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();

  // Se ainda não fez aniversário esse ano, subtrai 1
  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }
  return idade;
}

// --------------------------------------------------
// Retorna a categoria de idade de um atleta
// Exemplo: getCategoriaIdade('2008-05-10') → { id: 'sub18', nome: 'Juvenil', ... }
// --------------------------------------------------
export function getCategoriaIdade(dataNascimento) {
  const idade = calcularIdade(dataNascimento);
  return CATEGORIAS_IDADE.find(cat => idade >= cat.minAnos && idade <= cat.maxAnos) || CATEGORIAS_IDADE[CATEGORIAS_IDADE.length - 1];
}

// --------------------------------------------------
// Calcula os pontos de um resultado específico
// Parâmetros:
//   tipoCompeticao: 'baiano', 'brasileiro', etc.
//   modalidade:     'kumite' ou 'kata'
//   colocacao:      'ouro', 'prata', 'bronze', 'participacao'
// Retorna: número de pontos
// --------------------------------------------------
export function calcularPontos(tipoCompeticao, modalidade, colocacao) {
  const config = CONFIG_COMPETICOES[tipoCompeticao];
  if (!config) return 0;
  const configModalidade = config[modalidade];
  if (!configModalidade) return 0;
  return configModalidade[colocacao] || 0;
}

// --------------------------------------------------
// Calcula o ranking completo de todos os atletas
//
// Retorna um array de objetos, cada um contendo:
// {
//   atleta: { ...dadosDoAtleta },
//   totalPontos: 150,
//   totalOuros: 2,
//   totalPratas: 1,
//   totalBronzes: 0,
//   pontosPorModalidade: { kumite: 100, kata: 50 },
//   historico: [ { competicao, modalidade, colocacao, pontos } ]
// }
// --------------------------------------------------
export function calcularRanking(atletas, competicoes) {
  // Cria um mapa para acumular pontos de cada atleta
  // atletaId → { pontos, ouros, pratas, bronzes, historico, pontosPorModalidade }
  const mapaAtletas = {};

  atletas.forEach(atleta => {
    mapaAtletas[atleta.id] = {
      atleta,
      totalPontos: 0,
      totalOuros: 0,
      totalPratas: 0,
      totalBronzes: 0,
      totalParticipacoes: 0,
      pontosPorModalidade: { kumite: 0, kata: 0 },
      historico: [],
    };
  });

  // Percorre todas as competições e seus resultados
  competicoes.forEach(competicao => {
    competicao.resultados.forEach(resultado => {
      const entrada = mapaAtletas[resultado.atletaId];
      if (!entrada) return; // atleta não existe mais, ignora

      const pontos = calcularPontos(competicao.tipo, resultado.modalidade, resultado.colocacao);

      entrada.totalPontos += pontos;
      entrada.pontosPorModalidade[resultado.modalidade] += pontos;

      // Contagem de medalhas
      if (resultado.colocacao === 'ouro')         entrada.totalOuros++;
      else if (resultado.colocacao === 'prata')   entrada.totalPratas++;
      else if (resultado.colocacao === 'bronze')  entrada.totalBronzes++;
      else if (resultado.colocacao === 'participacao') entrada.totalParticipacoes++;

      entrada.historico.push({
        competicaoId: competicao.id,
        competicaoNome: competicao.nome,
        competicaoTipo: competicao.tipo,
        data: competicao.data,
        modalidade: resultado.modalidade,
        colocacao: resultado.colocacao,
        pontos,
      });
    });
  });

  // Converte o mapa em array e ordena por pontos (maior primeiro)
  return Object.values(mapaAtletas).sort((a, b) => {
    if (b.totalPontos !== a.totalPontos) return b.totalPontos - a.totalPontos;
    // Desempate: quem tem mais ouros
    if (b.totalOuros !== a.totalOuros) return b.totalOuros - a.totalOuros;
    // Desempate 2: quem tem mais pratas
    return b.totalPratas - a.totalPratas;
  });
}

// --------------------------------------------------
// Filtra o ranking por gênero e/ou categoria de idade
// Parâmetros:
//   ranking:        array retornado por calcularRanking()
//   filtroGenero:   'masculino', 'feminino' ou 'todos'
//   filtroIdade:    id da categoria (ex: 'sub16') ou 'todos'
//   filtroModalidade: 'kumite', 'kata' ou 'geral'
// --------------------------------------------------
export function filtrarRanking(ranking, filtroGenero, filtroIdade, filtroModalidade) {
  return ranking
    .filter(entrada => {
      // Filtro de gênero
      if (filtroGenero !== 'todos' && entrada.atleta.genero !== filtroGenero) return false;

      // Filtro de idade
      if (filtroIdade !== 'todos') {
        const cat = getCategoriaIdade(entrada.atleta.nascimento);
        if (cat.id !== filtroIdade) return false;
      }

      return true;
    })
    .map(entrada => {
      // Se filtro de modalidade, usa só pontos da modalidade escolhida
      if (filtroModalidade === 'kumite' || filtroModalidade === 'kata') {
        return {
          ...entrada,
          totalPontos: entrada.pontosPorModalidade[filtroModalidade],
        };
      }
      return entrada;
    })
    .sort((a, b) => b.totalPontos - a.totalPontos);
}

// --------------------------------------------------
// Formata uma data ISO ('2024-04-20') para exibição ('20/04/2024')
// --------------------------------------------------
export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// --------------------------------------------------
// Retorna o emoji + label da colocação
// --------------------------------------------------
export function labelColocacao(colocacao) {
  const mapa = {
    ouro:          { emoji: '🥇', label: '1º Lugar' },
    prata:         { emoji: '🥈', label: '2º Lugar' },
    bronze:        { emoji: '🥉', label: '3º Lugar' },
    participacao:  { emoji: '🎽', label: 'Participação' },
  };
  return mapa[colocacao] || { emoji: '', label: colocacao };
}

// --------------------------------------------------
// Retorna a cor da faixa para exibição visual
// --------------------------------------------------
export function corFaixa(faixa) {
  const cores = {
    branca:    '#f5f5f5',
    amarela:   '#f1c40f',
    laranja:   '#e67e22',
    verde:     '#27ae60',
    azul:      '#2980b9',
    roxa:      '#8e44ad',
    marrom:    '#795548',
    preta:     '#212121',
  };
  return cores[faixa] || '#999';
}
