/**
 * views/athletes.js
 * Cadastro, edição, exclusão e listagem de atletas.
 */

function renderAthletesView(container) {
  const athletes = db.athletes.getAll();
  const units = db.trainingUnits.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Atletas</h2>
        <p>${athletes.length} atleta${athletes.length === 1 ? '' : 's'} cadastrado${athletes.length === 1 ? '' : 's'}</p>
      </div>
      <button class="btn btn--primary" id="newAthleteBtn">+ Novo Atleta</button>
    </div>

    ${athletes.length === 0 ? renderAthletesEmptyState() : renderAthletesTable(athletes, units)}
  `;

  document.getElementById('newAthleteBtn').addEventListener('click', () => openAthleteForm());

  if (athletes.length > 0) {
    container.querySelectorAll('tbody tr[data-athlete-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return; // não navega ao clicar em botão de ação
        navigateTo(`atleta-detalhe/${row.dataset.athleteId}`);
      });
    });
    container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => openAthleteForm(btn.dataset.athleteId));
    });
    container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.athleteId;
        const athlete = db.athletes.getById(id);
        confirmAction(
          `Tem certeza que deseja excluir <strong>${escapeHTML(athlete.name)}</strong>? Os resultados lançados para ele também serão removidos.`,
          () => {
            db.athletes.remove(id);
            const allResults = db.results.getAll().filter((r) => r.athleteId !== id);
            db.results.replaceAll(allResults);
            showToast('Atleta excluído.');
            renderAthletesView(container);
          }
        );
      });
    });
  }
}

function renderAthletesEmptyState() {
  return `
    <div class="empty-state card">
      <h3>Nenhum atleta cadastrado</h3>
      <p>Cadastre o primeiro atleta para começar a montar o ranking.</p>
      <button class="btn btn--primary" onclick="openAthleteForm()">+ Novo Atleta</button>
    </div>
  `;
}

function renderAthletesTable(athletes, units) {
  const rows = athletes
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((athlete) => {
      const unitLabel = getTrainingUnitLabel(athlete.trainingUnitId);
      const genderLabel = GENDERS.find((g) => g.id === athlete.gender)?.label || '—';
      return `
        <tr data-athlete-id="${athlete.id}" class="is-clickable">
          <td data-label="Nome"><strong>${escapeHTML(athlete.name)}</strong></td>
          <td data-label="Gênero">${genderLabel}</td>
          <td data-label="Categoria">${renderAgeCategoryTag(athlete.birthDate)}</td>
          <td data-label="Faixa">${renderBeltTag(athlete.belt)}</td>
          <td data-label="Unidade">${escapeHTML(unitLabel)}</td>
          <td data-label="Ações">
            <div class="cell-actions">
              <button class="btn btn--ghost btn--sm" data-action="edit" data-athlete-id="${athlete.id}">Editar</button>
              <button class="btn btn--danger btn--sm" data-action="delete" data-athlete-id="${athlete.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="table-wrap table-wrap--responsive">
      <table>
        <thead>
          <tr>
            <th>Nome</th><th>Gênero</th><th>Categoria</th><th>Faixa</th><th>Unidade</th><th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function openAthleteForm(athleteId = null) {
  const athlete = athleteId ? db.athletes.getById(athleteId) : null;
  const units = db.trainingUnits.getAll();
  const isEdit = !!athlete;

  openModal(isEdit ? 'Editar Atleta' : 'Novo Atleta', `
    <form id="athleteForm">
      <div class="form-grid">
        <div class="form-field form-field--full">
          <label for="athleteName">Nome completo</label>
          <input type="text" id="athleteName" required value="${athlete ? escapeHTML(athlete.name) : ''}" placeholder="Ex: João da Silva" />
        </div>

        <div class="form-field">
          <label for="athleteGender">Gênero</label>
          <select id="athleteGender" required>
            ${buildOptions(GENDERS, { selected: athlete?.gender, placeholder: 'Selecione' })}
          </select>
        </div>

        <div class="form-field">
          <label for="athleteBirthDate">Data de nascimento</label>
          <input type="date" id="athleteBirthDate" required value="${athlete?.birthDate || ''}" />
        </div>

        <div class="form-field">
          <label for="athleteBelt">Faixa</label>
          <select id="athleteBelt" required>
            ${buildOptions(BELTS, { selected: athlete?.belt, placeholder: 'Selecione' })}
          </select>
        </div>

        <div class="form-field">
          <label for="athleteUnit">Unidade de treinamento</label>
          <select id="athleteUnit" required>
            ${buildOptions(units, { selected: athlete?.trainingUnitId, placeholder: 'Selecione' })}
          </select>
        </div>

        <div class="form-field form-field--full" id="ageCategoryPreview">
          <label>Categoria de idade (automática)</label>
          <div class="chip chip--category" style="width:fit-content;" id="ageCategoryPreviewTag">
            ${athlete ? renderAgeCategoryTag(athlete.birthDate) : '—'}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" id="cancelAthleteBtn">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEdit ? 'Salvar alterações' : 'Cadastrar atleta'}</button>
      </div>
    </form>
  `, {
    onMount: () => {
      document.getElementById('cancelAthleteBtn').addEventListener('click', closeModal);

      const birthInput = document.getElementById('athleteBirthDate');
      const preview = document.getElementById('ageCategoryPreviewTag');
      birthInput.addEventListener('change', () => {
        preview.outerHTML = `<div class="chip chip--category" style="width:fit-content;" id="ageCategoryPreviewTag">${birthInput.value ? renderAgeCategoryTag(birthInput.value) : '—'}</div>`;
      });

      document.getElementById('athleteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('athleteName').value.trim(),
          gender: document.getElementById('athleteGender').value,
          birthDate: document.getElementById('athleteBirthDate').value,
          belt: document.getElementById('athleteBelt').value,
          trainingUnitId: document.getElementById('athleteUnit').value,
        };

        if (!payload.name || !payload.gender || !payload.birthDate || !payload.belt || !payload.trainingUnitId) {
          showToast('Preencha todos os campos.', 'error');
          return;
        }

        if (isEdit) {
          db.athletes.update(athlete.id, payload);
          showToast('Atleta atualizado.');
        } else {
          db.athletes.add(payload);
          showToast('Atleta cadastrado.');
        }

        closeModal();
        handleRouteChange();
      });
    },
  });
}
