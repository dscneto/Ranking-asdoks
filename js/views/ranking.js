/**
 * views/ranking.js — identidade ASDOKS (cards §06 do guia)
 */

let _rankingFilters = { gender: '', ageCategoryId: '', modality: '' };

function renderRankingView(container) {
  const athletes = db.athletes.getAll();

  if (athletes.length === 0) {
    container.innerHTML = `
      <div class="empty-state card">
        <h3>Nenhum atleta cadastrado</h3>
        <p>Cadastre atletas e lance resultados de competições para ver o ranking aqui.</p>
        <button class="btn btn--primary" onclick="navigateTo('atletas')">Cadastrar Atletas</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Ranking Geral</h2>
        <p>Pontuação acumulada por inscrições e colocações em todas as competições.</p>
      </div>
    </div>

    <div class="filters-bar">
      <select id="filterGender">
        ${buildOptions(GENDERS, { selected: _rankingFilters.gender, placeholder: 'Todos os gêneros' })}
      </select>
      <select id="filterAgeCategory">
        ${buildOptions(AGE_CATEGORIES, { selected: _rankingFilters.ageCategoryId, placeholder: 'Todas as categorias' })}
      </select>
      <select id="filterModality">
        ${buildOptions(MODALITIES, { selected: _rankingFilters.modality, placeholder: 'Todas as modalidades' })}
      </select>
      <button class="btn btn--ghost btn--sm" id="clearFiltersBtn">Limpar filtros</button>
    </div>

    <div id="rankingListArea"></div>
  `;

  const genderSel = document.getElementById('filterGender');
  const ageSel    = document.getElementById('filterAgeCategory');
  const modSel    = document.getElementById('filterModality');

  const refresh = () => {
    _rankingFilters = { gender: genderSel.value, ageCategoryId: ageSel.value, modality: modSel.value };
    renderRankingList();
  };

  genderSel.addEventListener('change', refresh);
  ageSel.addEventListener('change', refresh);
  modSel.addEventListener('change', refresh);
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    _rankingFilters = { gender: '', ageCategoryId: '', modality: '' };
    renderRankingView(container);
  });

  renderRankingList();
}

function renderRankingList() {
  const area = document.getElementById('rankingListArea');
  const ranking = buildRanking(_rankingFilters);

  if (ranking.length === 0) {
    area.innerHTML = `
      <div class="empty-state card">
        <h3>Nenhum atleta encontrado</h3>
        <p>Tente ajustar os filtros selecionados.</p>
      </div>`;
    return;
  }

  const cards = ranking.map((entry, index) => {
    const pos = index + 1;
    let cardMod = '';
    if (pos === 1) cardMod = 'ranking-card--gold';
    else if (pos === 2) cardMod = 'ranking-card--silver';
    else if (pos === 3) cardMod = 'ranking-card--bronze';

    const genderLabel = GENDERS.find((g) => g.id === entry.athlete.gender)?.label || '—';
    const catLabel    = entry.ageCategory?.label || '—';
    const beltLabel   = BELTS.find((b) => b.id === entry.athlete.belt)?.label || '—';

    return `
      <div class="ranking-card ${cardMod}" data-athlete-id="${entry.athlete.id}" role="button" tabindex="0">
        <span class="ranking-pos">${pos}</span>
        <div class="ranking-avatar">${getInitials(entry.athlete.name)}</div>
        <div class="ranking-info">
          <div class="ranking-name">${escapeHTML(entry.athlete.name)}</div>
          <div class="ranking-meta">
            <span class="chip chip--neutral">${genderLabel}</span>
            <span class="chip chip--category">${catLabel}</span>
            ${renderBeltTag(entry.athlete.belt)}
            ${entry.competitionsCount > 0 ? `<span class="chip chip--neutral">${entry.competitionsCount} compet.</span>` : ''}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="ranking-points">${entry.totalPoints}</div>
          <div class="ranking-points-label">pts</div>
        </div>
      </div>`;
  }).join('');

  area.innerHTML = `<div class="ranking-list">${cards}</div>`;

  area.querySelectorAll('.ranking-card[data-athlete-id]').forEach((card) => {
    const go = () => navigateTo(`atleta-detalhe/${card.dataset.athleteId}`);
    card.addEventListener('click', go);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(); });
  });
}
