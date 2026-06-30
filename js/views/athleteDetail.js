/**
 * views/athleteDetail.js — identidade ASDOKS
 */

function renderAthleteDetailView(container, { id }) {
  const athlete = db.athletes.getById(id);

  if (!athlete) {
    container.innerHTML = `
      <div class="empty-state card">
        <h3>Atleta não encontrado</h3>
        <p>Ele pode ter sido removido.</p>
        <button class="btn btn--primary" onclick="navigateTo('atletas')">Voltar para Atletas</button>
      </div>`;
    return;
  }

  const { results, totalPoints } = getAthleteHistory(id);
  const genderLabel = GENDERS.find((g) => g.id === athlete.gender)?.label || '—';
  const unitLabel   = getTrainingUnitLabel(athlete.trainingUnitId);

  container.innerHTML = `
    <a href="#/atletas" class="back-link">← Voltar para Atletas</a>

    <div class="athlete-header">
      <div class="athlete-avatar">${getInitials(athlete.name)}</div>
      <div>
        <h2 style="font-size:22px;font-weight:800;">${escapeHTML(athlete.name)}</h2>
        <div class="athlete-header__meta">
          <span class="chip chip--neutral">${genderLabel}</span>
          ${renderAgeCategoryTag(athlete.birthDate)}
          ${renderBeltTag(athlete.belt)}
          <span class="chip chip--neutral">${escapeHTML(unitLabel)}</span>
        </div>
      </div>
    </div>

    <div class="card-grid">
      <div class="stat-card">
        <div class="stat-card__label">Pontuação total</div>
        <div class="stat-card__value">${totalPoints}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Resultados lançados</div>
        <div class="stat-card__value">${results.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">Nascimento</div>
        <div class="stat-card__value" style="font-size:18px;">${formatDateBR(athlete.birthDate)}</div>
      </div>
    </div>

    <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);">Histórico em competições</h3>
    ${results.length === 0 ? `
      <div class="empty-state card">
        <h3>Nenhum resultado lançado ainda</h3>
        <p>Os resultados aparecerão aqui depois de lançados na tela de Resultados.</p>
      </div>
    ` : renderAthleteHistoryTable(results)}
  `;
}

function renderAthleteHistoryTable(results) {
  const podiumChip = {
    gold:   '<span class="chip chip--gold">1º lugar</span>',
    silver: '<span class="chip chip--silver">2º lugar</span>',
    bronze: '<span class="chip chip--bronze">3º lugar</span>',
  };

  const rows = results.map((r) => `
    <tr>
      <td data-label="Competição"><strong>${escapeHTML(r.competition.name)}</strong></td>
      <td data-label="Data">${formatDateBR(r.competition.date)}</td>
      <td data-label="Tipo"><span class="chip chip--neutral">${escapeHTML(r.competitionType?.label || '—')}</span></td>
      <td data-label="Modalidade"><span class="chip chip--modality">${escapeHTML(getModalityLabel(r.modality))}</span></td>
      <td data-label="Inscrição">${r.enrolled ? '<span class="chip chip--category">Sim</span>' : '<span class="chip chip--neutral">Não</span>'}</td>
      <td data-label="Colocação">${r.placement ? podiumChip[r.placement] : '—'}</td>
      <td data-label="Pontos"><span class="points-value">${r.points} pts</span></td>
    </tr>
  `).join('');

  return `
    <div class="table-wrap table-wrap--responsive">
      <table>
        <thead>
          <tr><th>Competição</th><th>Data</th><th>Tipo</th><th>Modalidade</th><th>Inscrição</th><th>Colocação</th><th>Pontos</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
