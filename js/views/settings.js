/**
 * views/settings.js
 * Gerencia unidades de treinamento e fornece backup (exportar/importar JSON)
 * e reset dos dados — já que tudo é salvo no localStorage do navegador.
 */

function renderSettingsView(container) {
  const units = db.trainingUnits.getAll();

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h2>Configurações</h2>
        <p>Gerencie unidades de treinamento e os dados salvos neste navegador.</p>
      </div>
    </div>

    <h3 style="font-size:17px;margin-bottom:12px;">Unidades de treinamento</h3>
    <div class="card" style="margin-bottom:24px;">
      <div id="unitsList" class="flex flex-wrap gap-8" style="margin-bottom:16px;"></div>
      <form id="addUnitForm" class="flex gap-8" style="flex-wrap:wrap;">
        <input type="text" id="newUnitInput" placeholder="Ex: Unidade Centro" style="flex:1;min-width:200px;" required />
        <button type="submit" class="btn btn--secondary">+ Adicionar Unidade</button>
      </form>
    </div>

    <h3 style="font-size:17px;margin-bottom:12px;">Dados do sistema</h3>
    <div class="card">
      <p class="text-muted mt-0" style="font-size:13.5px;">
        Todos os dados (atletas, competições, resultados) são salvos diretamente neste navegador.
        Limpar o histórico do navegador ou usar outro dispositivo não traz os dados automaticamente —
        use exportar/importar para fazer backup ou transferir os dados.
      </p>
      <div class="flex gap-8 flex-wrap" style="margin-top:14px;">
        <button class="btn btn--secondary" id="exportDataBtn">Exportar backup (.json)</button>
        <button class="btn btn--secondary" id="importDataBtn">Importar backup</button>
        <input type="file" id="importFileInput" accept="application/json" style="display:none;" />
        <button class="btn btn--danger" id="resetDataBtn">Apagar todos os dados</button>
      </div>
    </div>
  `;

  renderUnitsList();

  document.getElementById('addUnitForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newUnitInput');
    const label = input.value.trim();
    if (!label) return;
    db.trainingUnits.add({ label });
    input.value = '';
    renderUnitsList();
    showToast('Unidade adicionada.');
  });

  document.getElementById('exportDataBtn').addEventListener('click', exportBackup);
  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput').addEventListener('change', handleImportFile);

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    confirmAction(
      'Tem certeza que deseja apagar <strong>todos os dados</strong> (atletas, competições, resultados, tipos e unidades)? Esta ação não pode ser desfeita. Considere exportar um backup antes.',
      () => {
        db.clearAll();
        db.seedIfEmpty();
        showToast('Todos os dados foram apagados.');
        navigateTo('ranking');
      }
    );
  });
}

function renderUnitsList() {
  const units = db.trainingUnits.getAll();
  const listEl = document.getElementById('unitsList');
  if (units.length === 0) {
    listEl.innerHTML = '<span class="text-muted">Nenhuma unidade cadastrada.</span>';
    return;
  }
  listEl.innerHTML = units.map((unit) => `
    <span class="chip chip--category" style="display:flex;align-items:center;gap:8px;">
      ${escapeHTML(unit.label)}
      <button data-unit-id="${unit.id}" class="icon-btn" style="width:18px;height:18px;" aria-label="Remover unidade">
        <svg viewBox="0 0 24 24" width="12" height="12"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </button>
    </span>
  `).join('');

  listEl.querySelectorAll('[data-unit-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.unitId;
      const inUse = db.athletes.getAll().some((a) => a.trainingUnitId === id);
      if (inUse) {
        showToast('Esta unidade está em uso por atletas cadastrados e não pode ser removida.', 'error');
        return;
      }
      db.trainingUnits.remove(id);
      renderUnitsList();
      showToast('Unidade removida.');
    });
  });
}

function exportBackup() {
  const data = db.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ranking-karate-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exportado.');
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      confirmAction(
        'Importar este backup vai <strong>substituir todos os dados atuais</strong>. Deseja continuar?',
        () => {
          db.importAll(data);
          showToast('Backup importado com sucesso.');
          navigateTo('ranking');
        }
      );
    } catch (err) {
      showToast('Arquivo inválido. Verifique se é um backup exportado pelo próprio sistema.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}
