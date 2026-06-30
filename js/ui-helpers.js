/**
 * ui-helpers.js — identidade ASDOKS
 */

// ---------- Toast ----------
let toastTimeout = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast is-visible is-${type}`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

// ---------- Modal ----------
const modalOverlay = () => document.getElementById('modalOverlay');

function openModal(title, bodyHTML, { onMount } = {}) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  modalOverlay().classList.add('is-open');
  if (typeof onMount === 'function') onMount();
}

function closeModal() {
  modalOverlay().classList.remove('is-open');
  document.getElementById('modalBody').innerHTML = '';
}

function setupModalDismissHandlers() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modalOverlay().addEventListener('click', (e) => {
    if (e.target === modalOverlay()) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay().classList.contains('is-open')) closeModal();
  });
}

function confirmAction(message, onConfirm) {
  openModal('Confirmar ação', `
    <p style="margin-top:0;color:var(--text-secondary);font-size:14px;">${message}</p>
    <div class="form-actions">
      <button class="btn btn--ghost" id="confirmCancelBtn">Cancelar</button>
      <button class="btn btn--danger" id="confirmOkBtn">Confirmar</button>
    </div>
  `, {
    onMount: () => {
      document.getElementById('confirmCancelBtn').addEventListener('click', closeModal);
      document.getElementById('confirmOkBtn').addEventListener('click', () => { closeModal(); onConfirm(); });
    },
  });
}

// ---------- Formatação ----------
function formatDateBR(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------- Chips / Tags ASDOKS ----------

// Faixa: cores reais (guia §07)
const BELT_STYLES = {
  branca:   { bg: '#FFFFFF', color: '#4A5568', border: '#DDE1EA' },
  amarela:  { bg: '#FEF3C7', color: '#92610A', border: '#E9B84A' },
  vermelha: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  laranja:  { bg: '#FFEDD5', color: '#9A3412', border: '#FDBA74' },
  verde:    { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  roxa:     { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
  marrom:   { bg: '#F5F0EB', color: '#78350F', border: '#D4A574' },
  preta:    { bg: '#1F2937', color: '#F9FAFB', border: '#374151' },
};

function renderBeltTag(beltId) {
  const belt = BELTS.find((b) => b.id === beltId);
  if (!belt) return '<span class="chip chip--neutral">—</span>';
  const s = BELT_STYLES[beltId] || { bg: '#F5F6F8', color: '#4A5568', border: '#DDE1EA' };
  return `<span class="chip" style="background:${s.bg};color:${s.color};border:1.5px solid ${s.border};">${belt.label}</span>`;
}

function renderAgeCategoryTag(birthDate) {
  const cat = getAgeCategoryFromBirthDate(birthDate);
  if (!cat) return '<span class="chip chip--neutral">—</span>';
  return `<span class="chip chip--category">${cat.label}</span>`;
}

function getModalityLabel(modalityId) {
  return MODALITIES.find((m) => m.id === modalityId)?.label || modalityId;
}

function getTrainingUnitLabel(unitId) {
  return db.trainingUnits.getById(unitId)?.label || '—';
}

function getCompetitionTypeLabel(typeId) {
  return db.competitionTypes.getById(typeId)?.label || '—';
}

// ---------- Select options ----------
function buildOptions(items, { valueKey = 'id', labelKey = 'label', selected = '', placeholder = null } = {}) {
  let html = '';
  if (placeholder) html += `<option value="">${placeholder}</option>`;
  html += items.map((item) => {
    const value = item[valueKey];
    const label = item[labelKey];
    const sel = String(value) === String(selected) ? 'selected' : '';
    return `<option value="${escapeHTML(value)}" ${sel}>${escapeHTML(label)}</option>`;
  }).join('');
  return html;
}
