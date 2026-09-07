import {
  AFTER_CAPTION,
  BEFORE_CAPTION,
  GALLERY_STEPS,
  NOTHING_AUTO_SENDS,
  applyApprove,
  applyHumanSend,
  boardColumn,
  canApprove,
  canHumanSend,
  seedGalleryBoard,
} from './hitl.js';

const THEME_KEY = 'fo-theme';
const DEFAULT_THEME = 'dark';
const DEMO_DATA_PATHS = [
  '/demo-data.json',
  new URL('../demo-data.json', import.meta.url).href,
  '../demo-data.json',
  '/public/demo-data.json',
];

/** @type {Array<object>} */
let originals = [];
/** @type {Array<object>} */
let board = [];
/** @type {string|null} */
let activeId = null;

function defaultTheme() {
  return DEFAULT_THEME;
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme, persist) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.colorScheme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'dark' ? '#121110' : '#F7F6F3');

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode */
    }
  }

  const nextLabel = next === 'dark' ? 'Light' : 'Dark';
  const aria = next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  for (const btn of document.querySelectorAll('.theme-toggle')) {
    btn.setAttribute('aria-label', aria);
    btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  }
  const desktopText = document.getElementById('theme-toggle-text');
  if (desktopText) desktopText.textContent = nextLabel;
  const mobileText = document.getElementById('theme-toggle-mobile-text');
  if (mobileText) mobileText.textContent = nextLabel;
}

function initTheme() {
  applyTheme(readStoredTheme() || currentTheme() || defaultTheme(), false);
  for (const btn of document.querySelectorAll('.theme-toggle')) {
    btn.addEventListener('click', () => {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function badgeClass(value) {
  const v = String(value ?? '').toLowerCase();
  if (v === 'false') return 'hot';
  if (/(high|bug|blocked|billing)/.test(v)) return 'hot';
  if (/(medium|waiting|ambiguous|classified|feature)/.test(v)) return 'warn';
  if (/(low|approved|done|closed|resolved|praise|true)/.test(v)) return 'ok';
  return 'info';
}

function badge(value) {
  return `<span class="badge ${badgeClass(value)}">${escapeHtml(String(value))}</span>`;
}

function columnFor(item) {
  return boardColumn(item);
}

function activeItem() {
  return board.find((item) => item.id === activeId) || null;
}

function replaceItem(next) {
  board = board.map((item) => (item.id === next.id ? next : item));
}

function updateBanner(item) {
  const flag = document.getElementById('sent-flag');
  const reason = document.getElementById('sent-reason');
  if (flag) flag.textContent = `sent: ${String(item?.sent ?? false)}`;
  if (reason) {
    reason.textContent =
      item?.sendGate?.blockedReason ||
      'Mock contract: approve prepares a draft. Only Send (human) can mark sent — locally, with no live write.';
  }
}

function renderBoard() {
  const lists = {
    waiting: document.getElementById('col-waiting'),
    approved: document.getElementById('col-approved'),
    sent: document.getElementById('col-sent'),
  };

  for (const key of Object.keys(lists)) {
    if (lists[key]) lists[key].innerHTML = '';
  }

  for (const item of board) {
    const col = lists[columnFor(item)];
    if (!col) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `ticket-card${item.id === activeId ? ' is-active' : ''}`;
    btn.dataset.id = item.id;
    btn.setAttribute('aria-pressed', item.id === activeId ? 'true' : 'false');
    const title = item.task?.Task || item.inbox?.Subject || item.label;
    btn.innerHTML = `${badge(item.inbox?.Category || 'Held')}<p>${escapeHtml(title)}</p><p class="after-meta">sent: ${escapeHtml(String(item.sent))}</p>`;
    btn.addEventListener('click', () => selectItem(item.id));
    col.appendChild(btn);
  }

  for (const key of Object.keys(lists)) {
    if (lists[key] && lists[key].children.length === 0) {
      lists[key].innerHTML = '<p class="empty-state">None</p>';
    }
  }
}

function renderDetail(item) {
  const body = document.getElementById('detail-body');
  const meta = document.getElementById('detail-meta');
  const approveBtn = document.getElementById('btn-approve');
  const sendBtn = document.getElementById('btn-send');

  if (!item || !body) return;

  if (meta) {
    const col = boardColumn(item);
    if (col === 'sent') meta.textContent = 'Human sent (demo)';
    else if (col === 'approved') meta.textContent = 'Approved · unsent';
    else meta.textContent = item.label || item.id;
  }

  if (!item.task) {
    body.innerHTML = `<p class="empty-state">No Task created. Empty-body and Ambiguous items stay Classified until a human triages them.</p>
      <p class="after-meta">sent: ${escapeHtml(String(item.sent))}</p>`;
  } else {
    body.innerHTML = `
      <div class="kv">
        <div class="row"><div class="k">Task</div><div class="v">${escapeHtml(item.task.Task)}</div></div>
        <div class="row"><div class="k">Status</div><div class="v">${badge(item.task.Status)}</div></div>
        <div class="row"><div class="k">Approval needed</div><div class="v">${badge(item.task['Approval needed'] ? 'true' : 'false')}</div></div>
        <div class="row"><div class="k">sent</div><div class="v"><code>${escapeHtml(String(item.sent))}</code></div></div>
        <div class="row"><div class="k">Channel</div><div class="v">${escapeHtml(item.sendGate?.channel || 'none')}</div></div>
      </div>
      <pre class="reply-draft" aria-label="Reply draft">${escapeHtml(item.task['Reply draft'] || '')}</pre>`;
  }

  if (approveBtn) {
    approveBtn.disabled = !canApprove(item);
  }
  if (sendBtn) {
    sendBtn.disabled = !canHumanSend(item);
  }
}

function selectItem(id) {
  const item = board.find((row) => row.id === id);
  if (!item) return;
  activeId = id;
  updateBanner(item);
  renderBoard();
  renderDetail(item);
}

function onApprove() {
  const item = activeItem();
  if (!item) return;
  const next = applyApprove(item);
  replaceItem(next);
  selectItem(next.id);
}

function onHumanSend() {
  const item = activeItem();
  if (!item) return;
  const next = applyHumanSend(item);
  replaceItem(next);
  selectItem(next.id);
}

function onReset() {
  const original = originals.find((row) => row.id === activeId);
  if (!original) return;
  replaceItem(structuredClone(original));
  selectItem(activeId);
}

function captionsText() {
  const lines = [
    BEFORE_CAPTION,
    AFTER_CAPTION,
    ...GALLERY_STEPS.map((step) => `${step.number} ${step.label} — ${step.caption}`),
    `${NOTHING_AUTO_SENDS}. Approve never sends. Demo send is local only.`,
  ];
  return lines.join('\n');
}

function renderCaptions() {
  const list = document.getElementById('caption-list');
  if (!list) return;
  const rows = [
    { title: 'Before', text: BEFORE_CAPTION },
    { title: 'After', text: AFTER_CAPTION },
    ...GALLERY_STEPS.map((step) => ({
      title: `${step.number} ${step.label}`,
      text: step.caption,
    })),
  ];
  list.innerHTML = rows
    .map((row) => `<li><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.text)}</span></li>`)
    .join('');
}

async function copyCaptions() {
  const status = document.getElementById('copy-status');
  const text = captionsText();
  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = 'Copied.';
  } catch {
    if (status) status.textContent = 'Copy failed — select the list instead.';
  }
}

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    mobileNav.hidden = open;
  });

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
  };

  for (const link of mobileNav.querySelectorAll('a')) {
    link.addEventListener('click', close);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
}

function showError(message) {
  const err = document.getElementById('demo-error');
  const text = document.getElementById('demo-error-text');
  if (text) text.textContent = message;
  if (err) err.hidden = false;
}

function hideError() {
  const err = document.getElementById('demo-error');
  if (err) err.hidden = true;
}

async function fetchDemoData() {
  let lastError = new Error('Could not load demo data');
  for (const url of DEMO_DATA_PATHS) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        lastError = new Error(`Could not load demo data (${res.status}) from ${url}`);
        continue;
      }
      return res.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError;
}

async function loadBoard() {
  hideError();
  const payload = await fetchDemoData();
  originals = seedGalleryBoard(payload.samples);
  board = originals.map((item) => structuredClone(item));
  const initial = board.find((item) => item.id === 'billing') || board[0];
  if (initial) selectItem(initial.id);
}

async function main() {
  initTheme();
  initMobileNav();
  renderCaptions();

  document.getElementById('btn-approve')?.addEventListener('click', onApprove);
  document.getElementById('btn-send')?.addEventListener('click', onHumanSend);
  document.getElementById('btn-reset')?.addEventListener('click', onReset);
  document.getElementById('copy-captions')?.addEventListener('click', () => {
    copyCaptions().catch(() => {});
  });
  document.getElementById('demo-retry')?.addEventListener('click', () => {
    loadBoard().catch((err) => showError(`Gallery failed to load: ${err.message}`));
  });

  try {
    await loadBoard();
  } catch (err) {
    showError(`Gallery failed to load: ${err.message}`);
  }
}

main();
