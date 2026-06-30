/**
 * views/results.js — identidade ASDOKS
 */

let _resultsViewState = { competitionId: '', modality: '' };

function renderResultsView(container) {
  const competitions = db.competitions.getAll();
  const athletes = db.athletes.getAll();

  if (competitions.length === 0 || athletes.length === 0) {
    container.innerHTML = `
      <div class="empty-state card">
        <h3>Cadastre atletas e competições primeiro</h3>
        <p>Você precisa de pelo menos um atleta e uma competição cadastrados para lançar resultados.</p>
        <div class="flex gap-8" style="justify-content:center;">
          ${athletes.length === 0 ? '<button class="btn btn--primary" onclick="navigateTo(\'atletas\')">Cadastrar Atletas</button>' : ''}
          ${competitions.length === 0 ? '<button class="btn btn--primary" onclick="navigateTo(\'competicoes\')">Cadastrar Competições</button>' : ''}
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Lançar Resultados</h2>
        <p>Escolha a competição e a modalidade para lançar inscrições e colocações.</p>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <div class="form-grid">
        <div class="form-field">
          <label for="resultCompetitionSelect">Competição</label>
          <select id="resultCompetitionSelect">
            ${buildOptions(
              competitions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
              { labelKey: 'name', selected: _resultsViewState.competitionId, placeholder: 'Selecione a competição' }
            )}
          </select>
        </div>
        <div class="form-field">
          <label for="resultModalitySelect">Modalidade</label>
          <select id="resultModalitySelect">
            ${buildOptions(MODALITIES, { selected: _resultsViewState.modality, placeholder: 'Selecione a modalidade' })}
          </select>
        </div>
      </div>
    </div>

    <div id="resultsFormArea"></div>
  `;

  const compSel = document.getElementById('resultCompetitionSelect');
  const modSel  = document.getElementById('resultModalitySelect');

  const refresh = () => {
    _resultsViewState.competitionId = compSel.value;
    _resultsViewState.modality = modSel.value;
    renderResultsFormArea();
  };

  compSel.addEventListener('change', refresh);
  modSel.addEventListener('change', refresh);
  renderResultsFormArea();
}

function renderResultsFormArea() {
  const area = document.getElementById('resultsFormArea');
  const { competitionId, modality } = _resultsViewState;

  if (!competitionId || !modality) {
    area.innerHTML = `
      <div class="empty-state card">
        <h3>Selecione competição e modalidade</h3>
        <p>Os atletas aparecerão aqui para você marcar inscrição e colocação.</p>
      </div>`;
    return;
  }

  const competition = db.competitions.getById(competitionId);
  const competitionType = db.competitionTypes.getById(competition.competitionTypeId);
  const athletes = db.athletes.getAll().slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const existingResults = db.results.getAll().filter(
    (r) => r.competitionId === competitionId && r.modality === modality
  );
  const existingByAthlete = Object.fromEntries(existingResults.map((r) => [r.athleteId, r]));

  area.innerHTML = `
    <div class="card" style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div>
        <strong style="font-size:15px;">${escapeHTML(competition.name)}</strong>
        <span style="color:var(--text-muted);margin-left:8px;">${escapeHTML(getModalityLabel(modality))}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span class="chip chip--neutral">Inscrição: <strong>${competitionType.points.enrollment}pts</strong></span>
        <span class="chip chip--gold">🥇 ${competitionType.points.gold}pts</span>
        <span class="chip chip--silver">🥈 ${competitionType.points.silver}pts</span>
        <span class="chip chip--bronze">🥉 ${competitionType.points.bronze}pts</span>
      </div>
    </div>

    <form id="resultsForm">
      <div class="table-wrap table-wrap--responsive">
        <table>
          <thead>
            <tr><th>Atleta</th><th>Inscrito</th><th>Colocação</th><th>Pontos</th></tr>
          </thead>
          <tbody>
            ${athletes.map((a) => renderAthleteResultRow(a, existingByAthlete[a.id], competitionType)).join('')}
          </tbody>
        </table>
      </div>

      <div class="form-actions" style="margin-top:16px;">
        <button type="submit" class="btn btn--primary">Salvar resultados</button>
      </div>
    </form>
  `;

  area.querySelectorAll('[data-athlete-row]').forEach((row) => {
    const checkbox      = row.querySelector('[data-role="enrolled"]');
    const placementSel  = row.querySelector('[data-role="placement"]');
    const pointsCell    = row.querySelector('[data-role="points"]');
    const updatePts = () => {
      pointsCell.textContent = calculateResultPoints(
        { enrolled: checkbox.checked, placement: placementSel.value || null },
        competitionType
      ) + ' pts';
    };
    checkbox.addEventListener('change', updatePts);
    placementSel.addEventListener('change', updatePts);
  });

  document.getElementById('resultsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveAllResults(competitionId, modality, athletes);
  });
}

function renderAthleteResultRow(athlete, existing, competitionType) {
  const enrolled  = existing?.enrolled || false;
  const placement = existing?.placement || '';
  const points    = existing ? calculateResultPoints(existing, competitionType) : 0;

  return `
    <tr data-athlete-row data-athlete-id="${athlete.id}">
      <td data-label="Atleta">
        <strong>${escapeHTML(athlete.name)}</strong>
        <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
          ${renderAgeCategoryTag(athlete.birthDate)}
          ${renderBeltTag(athlete.belt)}
        </div>
      </td>
      <td data-label="Inscrito">
        <label class="checkbox-row">
          <input type="checkbox" data-role="enrolled" ${enrolled ? 'checked' : ''} />
          <span style="font-size:13px;color:var(--text-secondary);">+${competitionType.points.enrollment}pts</span>
        </label>
      </td>
      <td data-label="Colocação">
        <select data-role="placement" style="min-width:160px;">
          <option value="">Sem colocação</option>
          <option value="gold"   ${placement === 'gold'   ? 'selected' : ''}>🥇 1º lugar</option>
          <option value="silver" ${placement === 'silver' ? 'selected' : ''}>🥈 2º lugar</option>
          <option value="bronze" ${placement === 'bronze' ? 'selected' : ''}>🥉 3º lugar</option>
        </select>
      </td>
      <td data-label="Pontos"><span class="points-value" data-role="points">${points} pts</span></td>
    </tr>
  `;
}

function saveAllResults(competitionId, modality, athletes) {
  const allResults = db.results.getAll();
  const otherResults = allResults.filter(
    (r) => !(r.competitionId === competitionId && r.modality === modality)
  );

  const newResults = [];
  document.querySelectorAll('[data-athlete-row]').forEach((row) => {
    const athleteId = row.dataset.athleteId;
    const enrolled  = row.querySelector('[data-role="enrolled"]').checked;
    const placement = row.querySelector('[data-role="placement"]').value || null;
    if (enrolled || placement) {
      const existing = allResults.find(
        (r) => r.athleteId === athleteId && r.competitionId === competitionId && r.modality === modality
      );
      newResults.push({
        id:          existing?.id || uid('result'),
        createdAt:   existing?.createdAt || new Date().toISOString(),
        athleteId, competitionId, modality, enrolled, placement,
      });
    }
  });

  db.results.replaceAll([...otherResults, ...newResults]);
  showToast('Resultados salvos com sucesso.');
}
