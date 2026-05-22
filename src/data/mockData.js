// src/data/mockData.js
// =====================================================
// ARQUIVO DE DADOS INICIAIS (simulando um banco de dados)
// Quando você integrar com um backend, substitua esses
// dados por chamadas à API (fetch, axios, etc.)
// =====================================================

import { v4 as uuidv4 } from 'uuid';

// --------------------------------------------------
// CONFIGURAÇÃO DAS COMPETIÇÕES
// Cada competição tem um peso diferente para:
//   - pontos por ouro, prata e bronze
//   - pontos só por participar
// Esses pesos são separados por modalidade (kumite / kata)
// --------------------------------------------------
export const CONFIG_COMPETICOES = {
  mundial: {
    nome: 'Mundial',
    cor: '#C0392B',
    corTexto: '#fff',
    kumite: { ouro: 100, prata: 70, bronze: 50, participacao: 20 },
    kata:   { ouro: 100, prata: 70, bronze: 50, participacao: 20 },
  },
  pan: {
    nome: 'Campeonato Pan-Americano',
    cor: '#8E44AD',
    corTexto: '#fff',
    kumite: { ouro: 80, prata: 55, bronze: 40, participacao: 15 },
    kata:   { ouro: 80, prata: 55, bronze: 40, participacao: 15 },
  },
  brasileiro: {
    nome: 'Campeonato Brasileiro',
    cor: '#2471A3',
    corTexto: '#fff',
    kumite: { ouro: 60, prata: 40, bronze: 30, participacao: 10 },
    kata:   { ouro: 60, prata: 40, bronze: 30, participacao: 10 },
  },
  baiano: {
    nome: 'Campeonato Baiano',
    cor: '#1E8449',
    corTexto: '#fff',
    kumite: { ouro: 30, prata: 20, bronze: 15, participacao: 5 },
    kata:   { ouro: 30, prata: 20, bronze: 15, participacao: 5 },
  },
  clube: {
    nome: 'Campeonato de Clube',
    cor: '#D68910',
    corTexto: '#fff',
    kumite: { ouro: 15, prata: 10, bronze: 7, participacao: 3 },
    kata:   { ouro: 15, prata: 10, bronze: 7, participacao: 3 },
  },
};

// --------------------------------------------------
// FAIXAS ETÁRIAS para filtros de ranking
// Você pode adicionar ou remover categorias aqui
// --------------------------------------------------
export const CATEGORIAS_IDADE = [
  { id: 'sub10',    nome: 'Sub-10',    minAnos: 0,  maxAnos: 9  },
  { id: 'sub12',    nome: 'Sub-12',    minAnos: 10, maxAnos: 11 },
  { id: 'sub14',    nome: 'Sub-14',    minAnos: 12, maxAnos: 13 },
  { id: 'sub16',    nome: 'Sub-16',    minAnos: 14, maxAnos: 15 },
  { id: 'sub18',    nome: 'Juvenil',   minAnos: 16, maxAnos: 17 },
  { id: 'adulto',   nome: 'Adulto',    minAnos: 18, maxAnos: 34 },
  { id: 'master',   nome: 'Master',    minAnos: 35, maxAnos: 999 },
];

// --------------------------------------------------
// ATLETAS DE EXEMPLO
// Cada atleta tem: id único, nome, gênero, data de nascimento,
// faixa, academia e foto (opcional)
// --------------------------------------------------
export const atletasIniciais = [
  {
    id: uuidv4(),
    nome: 'João Carlos Silva',
    genero: 'masculino',
    nascimento: '2000-03-15',
    faixa: 'preta',
    academia: 'Dojo Central',
    foto: null,
  },
  {
    id: uuidv4(),
    nome: 'Ana Paula Ferreira',
    genero: 'feminino',
    nascimento: '2002-07-22',
    faixa: 'marrom',
    academia: 'Dojo Central',
    foto: null,
  },
  {
    id: uuidv4(),
    nome: 'Lucas Mendes',
    genero: 'masculino',
    nascimento: '2008-11-05',
    faixa: 'azul',
    academia: 'Shotokan Bahia',
    foto: null,
  },
  {
    id: uuidv4(),
    nome: 'Mariana Costa',
    genero: 'feminino',
    nascimento: '2006-04-18',
    faixa: 'verde',
    academia: 'Shotokan Bahia',
    foto: null,
  },
  {
    id: uuidv4(),
    nome: 'Pedro Oliveira',
    genero: 'masculino',
    nascimento: '1990-09-30',
    faixa: 'preta',
    academia: 'Clube Atletismo VDC',
    foto: null,
  },
];

// --------------------------------------------------
// COMPETIÇÕES DE EXEMPLO
// Cada competição tem: id, tipo (chave do CONFIG_COMPETICOES),
// nome personalizado, data, local e resultados dos atletas
// --------------------------------------------------
export const competicoesIniciais = [
  {
    id: uuidv4(),
    tipo: 'baiano',
    nome: 'Campeonato Baiano 2024',
    data: '2024-04-20',
    local: 'Salvador, BA',
    resultados: [], // preenchido via cadastro
  },
  {
    id: uuidv4(),
    tipo: 'clube',
    nome: 'Copa dos Clubes - 1ª Etapa 2024',
    data: '2024-02-10',
    local: 'Vitória da Conquista, BA',
    resultados: [],
  },
];
