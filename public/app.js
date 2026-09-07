const THEME_KEY = 'fo-theme';
const DEFAULT_THEME = 'dark';
/** Public root path on Vercel (`outputDirectory: public`). Relative + /public fallbacks cover local and mis-rooted deploys. */
const DEMO_DATA_PATHS = [
  '/demo-data.json',
  new URL('./demo-data.json', import.meta.url).href,
  './demo-data.json',
  '/public/demo-data.json',
];

/** @type {Array<object>|null} */
let samples = null;
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

function badgeClass(value) {
  const v = String(value ?? '').toLowerCase();
  if (v === 'false') return 'hot';
  if (/(high|bug|blocked)/.test(v)) return 'hot';
  if (/(medium|waiting|ambiguous|classified)/.test(v)) return 'warn';
  if (/(low|approved|done|closed|resolved|praise|true)/.test(v)) return 'ok';
  return 'info';
}

function badge(value) {
  return `<span class="badge ${badgeClass(value)}">${escapeHtml(String(value))}</span>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function kv(rows) {
  return rows
    .map(([k, v]) => `<div class="row"><div class="k">${escapeHtml(k)}</div><div class="v">${v}</div></div>`)
    .join('');
}

function setPanelUpdating(updating) {
  for (const el of document.querySelectorAll('.panel-body')) {
    el.classList.toggle('is-updating', updating);
  }
}

function renderSample(sample) {
  if (!sample) return;

  activeId = sample.id;
  setPanelUpdating(true);

  requestAnimationFrame(() => {
    const inbox = sample.inbox ?? {};

    const sentFlag = document.getElementById('sent-flag');
    const sentReason = document.getElementById('sent-reason');
    if (sentFlag) sentFlag.textContent = `sent: ${String(sample.sent)}`;
    if (sentReason) sentReason.textContent = sample.sendGate?.blockedReason ?? '';

    const sourcePanel = document.getElementById('source-panel');
    if (sourcePanel) {
      sourcePanel.textContent =
        `From: ${sample.input.from}\nSubject: ${sample.input.subject}\n\n${sample.input.body || '(empty body)'}`;
    }

    const inboxPanel = document.getElementById('inbox-panel');
    if (inboxPanel) {
      inboxPanel.innerHTML = kv([
        ['Subject', escapeHtml(inbox.Subject || '(no subject)')],
        ['From', `<span class="mono">${escapeHtml(inbox.From || '')}</span>`],
        ['Category', badge(inbox.Category)],
        ['Priority', badge(inbox.Priority)],
        ['Status', badge(inbox.Status)],
        ['Summary', escapeHtml(inbox.Summary || '')],
        ['Received', escapeHtml(inbox.Received || '')],
        ['Why', escapeHtml(sample.classification?.reason || '')],
      ]);
    }

    const taskPanel = document.getElementById('task-panel');
    if (taskPanel) {
      if (!sample.task) {
        taskPanel.innerHTML =
          '<p class="empty-state">No Task created. Empty-body and Ambiguous items stay Classified until a human triages them.</p>';
      } else {
        const t = sample.task;
        taskPanel.innerHTML = `${kv([
          ['Task', escapeHtml(t.Task)],
          ['Status', badge(t.Status)],
          ['Approval needed', badge(t['Approval needed'] ? 'true' : 'false')],
          ['Next action', escapeHtml(t['Next action'])],
        ])}<pre class="reply-draft" aria-label="Reply draft">${escapeHtml(t['Reply draft'])}</pre>`;
      }
    }

    const retryPanel = document.getElementById('retry-panel');
    if (retryPanel) {
      const retries = sample.retries ?? [];
      retryPanel.innerHTML = retries.length
        ? retries
            .map(
              (r) =>
                `<div class="row"><div class="k">${escapeHtml(r.Stage)}</div><div class="v">${escapeHtml(r.Event)}<br><span class="mono">${escapeHtml(r.Error)}</span><br>resolved: ${badge(r.Resolved)}</div></div>`,
            )
            .join('')
        : '<p class="empty-state">No retry rows for this sample.</p>';
    }

    setActive(sample.id);
    highlightTableRow(sample.id);
    setPanelUpdating(false);
  });
}

function renderTable(allSamples) {
  const tbody = document.getElementById('inbox-table');
  if (!tbody) return;

  tbody.innerHTML = allSamples
    .map((s) => {
      const task = s.task ? s.task.Status : '— no Task —';
      const isActive = s.id === activeId ? ' is-active' : '';
      return `<tr data-id="${escapeHtml(s.id)}" tabindex="0" role="button" aria-label="Load ${escapeHtml(s.label)}" class="${isActive.trim()}">
        <td>${escapeHtml(s.inbox.Subject)}</td>
        <td>${badge(s.inbox.Category)}</td>
        <td>${badge(s.inbox.Priority)}</td>
        <td>${badge(s.inbox.Status)}</td>
        <td>${escapeHtml(task)}</td>
        <td class="mono">${escapeHtml(String(s.sent))}</td>
      </tr>`;
    })
    .join('');

  for (const row of tbody.querySelectorAll('tr[data-id]')) {
    row.addEventListener('click', () => selectSample(row.dataset.id));
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectSample(row.dataset.id);
      }
    });
  }
}

function highlightTableRow(id) {
  for (const row of document.querySelectorAll('#inbox-table tr[data-id]')) {
    const active = row.dataset.id === id;
    row.classList.toggle('is-active', active);
    row.setAttribute('aria-current', active ? 'true' : 'false');
  }
}

function setActive(id) {
  for (const btn of document.querySelectorAll('button.sample')) {
    const active = btn.dataset.id === id;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.tabIndex = active ? 0 : -1;
  }
}

function selectSample(id) {
  const sample = samples?.find((s) => s.id === id);
  if (!sample) return;
  renderSample(sample);
  history.replaceState(null, '', `#demo=${id}`);

  const btn = document.querySelector(`button.sample[data-id="${id}"]`);
  btn?.focus({ preventScroll: true });
}

function buildTabs(allSamples) {
  const nav = document.getElementById('sample-nav');
  const loading = document.getElementById('tabs-loading');
  if (!nav) return;

  if (loading) loading.remove();

  for (const sample of allSamples) {
    const btn = document.createElement('button');
    btn.className = 'sample';
    btn.type = 'button';
    btn.role = 'tab';
    btn.dataset.id = sample.id;
    btn.id = `tab-${sample.id}`;
    btn.textContent = sample.label;
    btn.title = sample.walkthrough;
    btn.setAttribute('aria-selected', 'false');
    btn.tabIndex = -1;
    btn.addEventListener('click', () => selectSample(sample.id));
    btn.addEventListener('keydown', onTabKeydown);
    nav.appendChild(btn);
  }
}

function onTabKeydown(e) {
  const tabs = [...document.querySelectorAll('button.sample')];
  const idx = tabs.indexOf(e.currentTarget);
  if (idx < 0) return;

  let next = idx;
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = tabs.length - 1;
  else return;

  e.preventDefault();
  selectSample(tabs[next].dataset.id);
  tabs[next].focus();
}

function showError(message) {
  const err = document.getElementById('demo-error');
  const text = document.getElementById('demo-error-text');
  if (text) text.textContent = message;
  if (err) err.hidden = false;

  for (const id of ['inbox-panel', 'task-panel', 'retry-panel']) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
    }
  }
}

function hideError() {
  const err = document.getElementById('demo-error');
  if (err) err.hidden = true;
}

function resolveInitialId(allSamples) {
  const hash = location.hash;
  if (hash.startsWith('#demo=')) return hash.slice(6);
  const params = new URLSearchParams(hash.replace('#', '?'));
  return params.get('demo') || 'approval-approved';
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

  for (const link of mobileNav.querySelectorAll('a[href^="#"]')) {
    link.addEventListener('click', close);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
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

async function loadDemo() {
  hideError();

  const payload = await fetchDemoData();

  samples = payload.samples;
  buildTabs(samples);
  renderTable(samples);

  const wanted = resolveInitialId(samples);
  const initial = samples.find((s) => s.id === wanted) || samples[1] || samples[0];
  renderSample(initial);
}

async function main() {
  initTheme();
  initMobileNav();

  const retryBtn = document.getElementById('demo-retry');
  retryBtn?.addEventListener('click', () => {
    loadDemo().catch((err) => showError(`Demo failed to load: ${err.message}`));
  });

  try {
    await loadDemo();
  } catch (err) {
    showError(`Demo failed to load: ${err.message}`);
  }
}

main();
