/**
 * views/competitions.js
 * Cadastro, edição, exclusão e listagem de competições.
 */

function renderCompetitionsView(container) {
  const competitions = db.competitions.getAll();
  const types = db.competitionTypes.getAll();

  if (types.length === 0) {
    container.innerHTML = `
      <div class="empty-state card">
        <h3>Cadastre um tipo de competição primeiro</h3>
        <p>Cada competição precisa de um tipo (com pesos de pontuação) já cadastrado.</p>
        <button class="btn btn--primary" onclick="navigateTo('tipos')">Ir para Tipos de Competição</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Competições</h2>
        <p>${competitions.length} competiç${competitions.length === 1 ? 'ão cadastrada' : 'ões cadastradas'}</p>
      </div>
      <button class="btn btn--primary" id="newCompetitionBtn">+ Nova Competição</button>
    </div>

    ${competitions.length === 0 ? `
      <div class="empty-state card">
        <h3>Nenhuma competição cadastrada</h3>
        <p>Cadastre a primeira competição para depois lançar resultados.</p>
        <button class="btn btn--primary" onclick="document.getElementById('newCompetitionBtn').click()">+ Nova Competição</button>
      </div>
    ` : renderCompetitionsTable(competitions)}
  `;

  document.getElementById('newCompetitionBtn').addEventListener('click', () => openCompetitionForm());

  container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openCompetitionForm(btn.dataset.competitionId));
  });
  container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.competitionId;
      const competition = db.competitions.getById(id);
      confirmAction(
        `Tem certeza que deseja excluir <strong>${escapeHTML(competition.name)}</strong>? Os resultados lançados nela também serão removidos.`,
        () => {
          db.competitions.remove(id);
          const remainingResults = db.results.getAll().filter((r) => r.competitionId !== id);
          db.results.replaceAll(remainingResults);
          showToast('Competição excluída.');
          renderCompetitionsView(container);
        }
      );
    });
  });
}

function renderCompetitionsTable(competitions) {
  const rows = competitions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((comp) => `
      <tr>
        <td data-label="Nome"><strong>${escapeHTML(comp.name)}</strong></td>
        <td data-label="Data">${formatDateBR(comp.date)}</td>
        <td data-label="Local">${escapeHTML(comp.location)}</td>
        <td data-label="Tipo">${escapeHTML(getCompetitionTypeLabel(comp.competitionTypeId))}</td>
        <td data-label="Ações">
          <div class="cell-actions">
            <button class="btn btn--ghost btn--sm" data-action="edit" data-competition-id="${comp.id}">Editar</button>
            <button class="btn btn--danger btn--sm" data-action="delete" data-competition-id="${comp.id}">Excluir</button>
          </div>
        </td>
      </tr>
    `).join('');

  return `
    <div class="table-wrap table-wrap--responsive">
      <table>
        <thead><tr><th>Nome</th><th>Data</th><th>Local</th><th>Tipo</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function openCompetitionForm(competitionId = null) {
  const competition = competitionId ? db.competitions.getById(competitionId) : null;
  const types = db.competitionTypes.getAll();
  const isEdit = !!competition;

  openModal(isEdit ? 'Editar Competição' : 'Nova Competição', `
    <form id="competitionForm">
      <div class="form-grid">
        <div class="form-field form-field--full">
          <label for="compName">Nome da competição</label>
          <input type="text" id="compName" required value="${competition ? escapeHTML(competition.name) : ''}" placeholder="Ex: Copa Regional de Karatê" />
        </div>

        <div class="form-field">
          <label for="compDate">Data</label>
          <input type="date" id="compDate" required value="${competition?.date || ''}" />
        </div>

        <div class="form-field">
          <label for="compType">Tipo de competição</label>
          <select id="compType" required>
            ${buildOptions(types, { selected: competition?.competitionTypeId, placeholder: 'Selecione' })}
          </select>
        </div>

        <div class="form-field form-field--full">
          <label for="compLocation">Local</label>
          <input type="text" id="compLocation" required value="${competition ? escapeHTML(competition.location) : ''}" placeholder="Ex: Ginásio Municipal" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" id="cancelCompBtn">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEdit ? 'Salvar alterações' : 'Cadastrar competição'}</button>
      </div>
    </form>
  `, {
    onMount: () => {
      document.getElementById('cancelCompBtn').addEventListener('click', closeModal);
      document.getElementById('competitionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('compName').value.trim(),
          date: document.getElementById('compDate').value,
          competitionTypeId: document.getElementById('compType').value,
          location: document.getElementById('compLocation').value.trim(),
        };

        if (!payload.name || !payload.date || !payload.competitionTypeId || !payload.location) {
          showToast('Preencha todos os campos.', 'error');
          return;
        }

        if (isEdit) {
          db.competitions.update(competition.id, payload);
          showToast('Competição atualizada.');
        } else {
          db.competitions.add(payload);
          showToast('Competição cadastrada.');
        }

        closeModal();
        handleRouteChange();
      });
    },
  });
}
