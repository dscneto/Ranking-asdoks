/**
 * router.js
 * Router simples baseado em hash (#/rota). Cada view exporta uma função
 * render(container, params) registrada em ROUTES.
 */

const ROUTES = {
  ranking: { title: 'Ranking', render: renderRankingView },
  atletas: { title: 'Atletas', render: renderAthletesView },
  'atleta-detalhe': { title: 'Detalhe do Atleta', render: renderAthleteDetailView },
  competicoes: { title: 'Competições', render: renderCompetitionsView },
  resultados: { title: 'Lançar Resultados', render: renderResultsView },
  tipos: { title: 'Tipos de Competição', render: renderCompetitionTypesView },
  configuracoes: { title: 'Configurações', render: renderSettingsView },
};

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, ''); // remove '#' ou '#/'
  const [path, queryString] = hash.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => { params[key] = value; });
  }
  return { route: segments[0] || 'ranking', segmentId: segments[1] || null, params };
}

function navigateTo(routeWithParams) {
  window.location.hash = `#/${routeWithParams}`;
}

function handleRouteChange() {
  const { route, segmentId, params } = parseHash();
  const routeConfig = ROUTES[route] || ROUTES.ranking;

  // Atualiza item ativo no menu
  document.querySelectorAll('.nav-menu__item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.route === route);
  });

  // Atualiza título da topbar
  document.getElementById('pageTitle').textContent = routeConfig.title;

  // Renderiza a view
  const container = document.getElementById('appContent');
  container.innerHTML = '';
  routeConfig.render(container, { id: segmentId, ...params });

  // Fecha o drawer mobile ao navegar
  closeMobileNav();

  // Volta o scroll ao topo
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', handleRouteChange);
