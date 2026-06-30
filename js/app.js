/**
 * app.js
 * Ponto de entrada: inicializa o banco (seed), liga os handlers de
 * navegação mobile (hambúrguer/drawer/overlay) e dispara a primeira rota.
 */

function openMobileNav() {
  document.getElementById('sidebar').classList.add('is-open');
  document.getElementById('navOverlay').classList.add('is-visible');
}

function closeMobileNav() {
  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('navOverlay').classList.remove('is-visible');
}

function setupNavigation() {
  document.getElementById('hamburgerBtn').addEventListener('click', openMobileNav);
  document.getElementById('sidebarClose').addEventListener('click', closeMobileNav);
  document.getElementById('navOverlay').addEventListener('click', closeMobileNav);

  // Navegação via clique no menu (evita depender só do hashchange quando já na mesma rota)
  document.querySelectorAll('.nav-menu__item').forEach((item) => {
    item.addEventListener('click', () => closeMobileNav());
  });
}

function init() {
  db.seedIfEmpty();
  setupNavigation();
  setupModalDismissHandlers();

  if (!window.location.hash) {
    window.location.hash = '#/ranking';
  }
  handleRouteChange();
}

document.addEventListener('DOMContentLoaded', init);
