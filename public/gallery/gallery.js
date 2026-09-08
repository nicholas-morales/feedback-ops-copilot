import {
  FLOW_BADGE,
  NOTHING_AUTO_SENDS,
  PORTFOLIO_LINKS,
  QUEUE_COLUMNS,
  QUEUE_FIXTURES,
  SHIP_SCENARIOS,
  applyApprove,
  applyEdit,
  applyReject,
  canApprove,
  canEdit,
  canReject,
  captionsText,
  createGateTicket,
} from './hitl.js';

const THEME_KEY = 'fo-theme';
const DEFAULT_THEME = 'dark';

/** @type {object} */
let ticket = createGateTicket();
const original = createGateTicket();

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
  if (/(high|bug|churn|blocked)/.test(v)) return 'hot';
  if (/(medium|feature)/.test(v)) return 'warn';
  if (/(low|praise|approved)/.test(v)) return 'ok';
  return 'info';
}

function renderQueue() {
  for (const col of QUEUE_COLUMNS) {
    const list = document.querySelector(`[data-col="${col}"] .board-list`);
    if (!list) continue;
    const items = QUEUE_FIXTURES.filter((row) => row.column === col);
    list.innerHTML = items
      .map(
        (row) => `<article class="after-card">
          <span class="badge ${badgeClass(row.column)}">${escapeHtml(row.column)}</span>
          <p>${escapeHtml(row.task)}</p>
          <p class="after-meta">${escapeHtml(row.urgency)} · sent: false</p>
        </article>`,
      )
      .join('');
  }
}

function renderGate() {
  const body = document.getElementById('detail-body');
  const meta = document.getElementById('draft-meta');
  const editor = document.getElementById('draft-editor');
  const flag = document.getElementById('sent-flag');
  const reason = document.getElementById('sent-reason');
  const log = document.getElementById('audit-log');

  if (body) {
    body.innerHTML = `
      <div class="kv">
        <div class="row"><div class="k">From</div><div class="v"><span class="mono">${escapeHtml(ticket.from)}</span></div></div>
        <div class="row"><div class="k">Subject</div><div class="v">${escapeHtml(ticket.subject)}</div></div>
        <div class="row"><div class="k">Task</div><div class="v">${escapeHtml(ticket.task)}</div></div>
        <div class="row"><div class="k">Decision</div><div class="v">${escapeHtml(ticket.decision)}</div></div>
        <div class="row"><div class="k">sent</div><div class="v"><code>${escapeHtml(String(ticket.sent))}</code></div></div>
      </div>`;
  }
  if (meta) {
    if (ticket.rejected) meta.textContent = 'Rejected · unsent';
    else if (ticket.approved) meta.textContent = 'Approved · unsent';
    else if (ticket.decision === 'edited') meta.textContent = 'Edited · gate locked';
    else meta.textContent = 'Awaiting human';
  }
  if (editor && document.activeElement !== editor) {
    editor.value = ticket.draft;
  }
  if (flag) flag.textContent = `sent: ${String(ticket.sent)}`;
  if (reason) reason.textContent = ticket.sendGate?.blockedReason || 'Gate locked.';
  if (log) {
    log.innerHTML = (ticket.audit ?? [])
      .map((row) => `<li><span class="mono">${escapeHtml(row.at)}</span> — ${escapeHtml(row.line)}</li>`)
      .join('');
  }

  const approveBtn = document.getElementById('btn-approve');
  const editBtn = document.getElementById('btn-edit');
  const rejectBtn = document.getElementById('btn-reject');
  if (approveBtn) approveBtn.disabled = !canApprove(ticket);
  if (editBtn) editBtn.disabled = !canEdit(ticket);
  if (rejectBtn) rejectBtn.disabled = !canReject(ticket);
}

function onApprove() {
  ticket = applyApprove(ticket);
  renderGate();
}

function onEdit() {
  const editor = document.getElementById('draft-editor');
  ticket = applyEdit(ticket, editor?.value ?? ticket.draft);
  renderGate();
}

function onReject() {
  ticket = applyReject(ticket);
  renderGate();
}

function onReset() {
  ticket = structuredClone(original);
  renderGate();
}

function captionRows() {
  return [
    ...SHIP_SCENARIOS.map((s) => ({ title: `${s.number} ${s.title}`, text: s.caption })),
    { title: 'Flow', text: FLOW_BADGE },
    { title: 'Badge', text: NOTHING_AUTO_SENDS },
    { title: 'Portfolio', text: PORTFOLIO_LINKS.work },
    { title: 'Demo', text: PORTFOLIO_LINKS.demo },
  ];
}

function renderCaptions() {
  const list = document.getElementById('caption-list');
  if (!list) return;
  list.innerHTML = captionRows()
    .map(
      (row, i) => `<li>
        <div class="caption-row">
          <strong>${escapeHtml(row.title)}</strong>
          <button class="btn btn-secondary btn-sm caption-copy" type="button" data-caption-index="${i}">Copy</button>
        </div>
        <p class="caption-body">${escapeHtml(row.text)}</p>
      </li>`,
    )
    .join('');
}

async function writeClipboard(text, okMessage) {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = okMessage;
  } catch {
    if (status) status.textContent = 'Copy failed — select the list instead.';
  }
}

async function copyCaptions() {
  await writeClipboard(captionsText(), 'Copied all captions.');
}

async function copyOneCaption(index) {
  const row = captionRows()[index];
  if (!row) return;
  await writeClipboard(`${row.title} — ${row.text}`, `Copied ${row.title}.`);
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

function main() {
  initTheme();
  initMobileNav();
  renderQueue();
  renderGate();
  renderCaptions();

  document.getElementById('btn-approve')?.addEventListener('click', onApprove);
  document.getElementById('btn-edit')?.addEventListener('click', onEdit);
  document.getElementById('btn-reject')?.addEventListener('click', onReject);
  document.getElementById('btn-reset')?.addEventListener('click', onReset);
  document.getElementById('copy-captions')?.addEventListener('click', () => {
    copyCaptions().catch(() => {});
  });
  document.getElementById('caption-list')?.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('.caption-copy') : null;
    if (!button) return;
    const index = Number(button.getAttribute('data-caption-index'));
    if (Number.isInteger(index)) {
      copyOneCaption(index).catch(() => {});
    }
  });
}

main();
