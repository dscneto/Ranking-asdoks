/**
 * views/competitionTypes.js
 * Cadastro de tipos de competição, cada um com sua tabela de pesos
 * (inscrição, ouro, prata, bronze). O usuário pode editar os padrões
 * ou criar novos tipos.
 */

function renderCompetitionTypesView(container) {
  const types = db.competitionTypes.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Tipos de Competição</h2>
        <p>Defina os pesos de pontuação de cada tipo. A pontuação de inscrição é dada a todo atleta inscrito; ouro/prata/bronze somam-se a ela.</p>
      </div>
      <button class="btn btn--primary" id="newTypeBtn">+ Novo Tipo</button>
    </div>

    ${types.length === 0 ? `
      <div class="empty-state card">
        <h3>Nenhum tipo cadastrado</h3>
        <p>Cadastre o primeiro tipo de competição com seus pesos de pontuação.</p>
        <button class="btn btn--primary" onclick="document.getElementById('newTypeBtn').click()">+ Novo Tipo</button>
      </div>
    ` : renderTypesTable(types)}
  `;

  document.getElementById('newTypeBtn').addEventListener('click', () => openTypeForm());

  container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => openTypeForm(btn.dataset.typeId));
  });
  container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.typeId;
      const inUse = db.competitions.getAll().some((c) => c.competitionTypeId === id);
      if (inUse) {
        showToast('Este tipo está em uso por competições cadastradas e não pode ser excluído.', 'error');
        return;
      }
      const type = db.competitionTypes.getById(id);
      confirmAction(`Tem certeza que deseja excluir o tipo <strong>${escapeHTML(type.label)}</strong>?`, () => {
        db.competitionTypes.remove(id);
        showToast('Tipo excluído.');
        renderCompetitionTypesView(container);
      });
    });
  });
}

function renderTypesTable(types) {
  const rows = types.map((type) => `
    <tr>
      <td data-label="Tipo"><strong>${escapeHTML(type.label)}</strong></td>
      <td data-label="Inscrição"><span class="points-value">${type.points.enrollment}</span></td>
      <td data-label="Ouro (1º)"><span class="points-value">${type.points.gold}</span></td>
      <td data-label="Prata (2º)"><span class="points-value">${type.points.silver}</span></td>
      <td data-label="Bronze (3º)"><span class="points-value">${type.points.bronze}</span></td>
      <td data-label="Ações">
        <div class="cell-actions">
          <button class="btn btn--ghost btn--sm" data-action="edit" data-type-id="${type.id}">Editar</button>
          <button class="btn btn--danger btn--sm" data-action="delete" data-type-id="${type.id}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="table-wrap table-wrap--responsive">
      <table>
        <thead><tr><th>Tipo</th><th>Inscrição</th><th>Ouro (1º)</th><th>Prata (2º)</th><th>Bronze (3º)</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function openTypeForm(typeId = null) {
  const type = typeId ? db.competitionTypes.getById(typeId) : null;
  const isEdit = !!type;

  openModal(isEdit ? 'Editar Tipo de Competição' : 'Novo Tipo de Competição', `
    <form id="typeForm">
      <div class="form-grid">
        <div class="form-field form-field--full">
          <label for="typeLabel">Nome do tipo</label>
          <input type="text" id="typeLabel" required value="${type ? escapeHTML(type.label) : ''}" placeholder="Ex: Campeonatos Regionais" />
        </div>

        <div class="form-field">
          <label for="typeEnrollment">Pontos por inscrição</label>
          <input type="number" id="typeEnrollment" required min="0" value="${type?.points?.enrollment ?? ''}" />
          <span class="hint">Dado a todo atleta inscrito na modalidade, mesmo sem medalha.</span>
        </div>

        <div class="form-field">
          <label for="typeGold">Pontos 1º lugar (Ouro)</label>
          <input type="number" id="typeGold" required min="0" value="${type?.points?.gold ?? ''}" />
        </div>

        <div class="form-field">
          <label for="typeSilver">Pontos 2º lugar (Prata)</label>
          <input type="number" id="typeSilver" required min="0" value="${type?.points?.silver ?? ''}" />
        </div>

        <div class="form-field">
          <label for="typeBronze">Pontos 3º lugar (Bronze)</label>
          <input type="number" id="typeBronze" required min="0" value="${type?.points?.bronze ?? ''}" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn--ghost" id="cancelTypeBtn">Cancelar</button>
        <button type="submit" class="btn btn--primary">${isEdit ? 'Salvar alterações' : 'Cadastrar tipo'}</button>
      </div>
    </form>
  `, {
    onMount: () => {
      document.getElementById('cancelTypeBtn').addEventListener('click', closeModal);
      document.getElementById('typeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const payload = {
          label: document.getElementById('typeLabel').value.trim(),
          points: {
            enrollment: Number(document.getElementById('typeEnrollment').value),
            gold: Number(document.getElementById('typeGold').value),
            silver: Number(document.getElementById('typeSilver').value),
            bronze: Number(document.getElementById('typeBronze').value),
          },
        };

        if (!payload.label) {
          showToast('Informe o nome do tipo.', 'error');
          return;
        }

        if (isEdit) {
          db.competitionTypes.update(type.id, payload);
          showToast('Tipo atualizado.');
        } else {
          db.competitionTypes.add(payload);
          showToast('Tipo cadastrado.');
        }

        closeModal();
        handleRouteChange();
      });
    },
  });
}
