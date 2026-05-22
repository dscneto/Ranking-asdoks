# 🥋 Sistema de Ranking de Karatê

Aplicação web/mobile em React para gerenciar o ranking de atletas de karatê,
com suporte a múltiplas competições, modalidades (Kumitê e Kata) e filtros.

---

## 📁 Estrutura de Pastas

```
src/
├── App.jsx                    ← Componente raiz + rotas
├── index.js                   ← Ponto de entrada do React
├── index.css                  ← Estilos globais e variáveis CSS
│
├── data/
│   ├── mockData.js            ← Dados iniciais + configuração de competições
│   └── AppContext.js          ← Estado global (Context API)
│
├── utils/
│   └── calculos.js            ← Funções puras: pontos, idades, ranking
│
├── components/
│   └── layout/
│       ├── Layout.jsx         ← Sidebar + estrutura da página
│       └── Layout.css
│
└── pages/
    ├── RankingPage.jsx        ← Página principal com tabela de classificação
    ├── RankingPage.css
    ├── AtletasPage.jsx        ← CRUD de atletas
    ├── AtletasPage.css
    ├── CompeticoesPage.jsx    ← CRUD de competições
    ├── CompeticoesPage.css
    ├── ResultadosPage.jsx     ← Registro de resultados por competição
    └── ResultadosPage.css
```

---

## 🚀 Como Rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 16 ou superior
- npm (vem junto com o Node.js)

### Passo a passo

```bash
# 1. Instalar dependências (só na primeira vez)
npm install

# 2. Rodar em modo desenvolvimento
npm start
# Abre em http://localhost:3000

# 3. Gerar versão de produção
npm run build
# Cria a pasta /build pronta para deploy
```

---

## 🏆 Como Usar o Sistema

### 1. Cadastrar Atletas
- Vá em **Atletas** → clique em **Novo Atleta**
- Preencha nome, gênero, data de nascimento, faixa e academia
- A categoria de idade é calculada automaticamente

### 2. Cadastrar Competições
- Vá em **Competições** → clique em **Nova Competição**
- Escolha o tipo (determina o peso das medalhas)
- Preencha nome, data e local

### 3. Registrar Resultados
- Vá em **Resultados**
- Selecione uma competição
- Para cada atleta, escolha a colocação em Kumitê e/ou Kata
- Clique em **Salvar**

### 4. Ver o Ranking
- Vá em **Ranking**
- Use os filtros de Gênero, Categoria de Idade e Modalidade
- Clique em um atleta para ver seu histórico detalhado

---

## ⚙️ Personalizar Pontuações

Edite o arquivo `src/data/mockData.js`, seção `CONFIG_COMPETICOES`:

```js
mundial: {
  nome: 'Mundial',
  cor: '#C0392B',
  kumite: { ouro: 100, prata: 70, bronze: 50, participacao: 20 },
  kata:   { ouro: 100, prata: 70, bronze: 50, participacao: 20 },
},
```

---

## 💾 Dados

Os dados são salvos no **LocalStorage** do navegador automaticamente.
Isso significa que os dados persistem entre sessões no mesmo dispositivo.

Para integrar com um banco de dados real:
1. Remova as inicializações do `localStorage` no `AppContext.js`
2. Substitua as funções por chamadas a uma API (fetch/axios)

---

## 📱 Mobile

A aplicação é totalmente responsiva:
- No mobile, a sidebar vira um menu hamburguer
- A tabela de ranking oculta colunas menos importantes
- Todos os modais são adaptados para telas pequenas
