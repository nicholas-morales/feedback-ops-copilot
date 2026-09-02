const dataUrl = new URL('./demo-data.json', import.meta.url);

function badgeClass(value) {
  const v = String(value || '').toLowerCase();
  if (/(high|bug|blocked|false)/.test(v) && v === 'false') return 'hot';
  if (/(high|bug|blocked)/.test(v)) return 'hot';
  if (/(medium|waiting|ambiguous|classified)/.test(v)) return 'warn';
  if (/(low|approved|done|closed|resolved|praise)/.test(v)) return 'ok';
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

function renderSample(sample) {
  const inbox = sample.inbox || {};
  document.getElementById('sent-flag').textContent = `sent: ${String(sample.sent)}`;
  document.getElementById('sent-reason').textContent = sample.sendGate.blockedReason;

  document.getElementById('source-panel').textContent =
    `From: ${sample.input.from}\nSubject: ${sample.input.subject}\n\n${sample.input.body || '(empty body)'}`;

  document.getElementById('inbox-panel').innerHTML = kv([
    ['Subject', escapeHtml(inbox.Subject || '(no subject)')],
    ['From', `<span class="mono">${escapeHtml(inbox.From || '')}</span>`],
    ['Category', badge(inbox.Category)],
    ['Priority', badge(inbox.Priority)],
    ['Status', badge(inbox.Status)],
    ['Summary', escapeHtml(inbox.Summary || '')],
    ['Received', escapeHtml(inbox.Received || '')],
    ['Why', escapeHtml(sample.classification.reason)],
  ]);

  if (!sample.task) {
    document.getElementById('task-panel').innerHTML =
      '<p class="v">No Task created. Empty-body / Ambiguous items stay Classified until a human triages them.</p>';
  } else {
    const t = sample.task;
    document.getElementById('task-panel').innerHTML = `${kv([
      ['Task', escapeHtml(t.Task)],
      ['Status', badge(t.Status)],
      ['Approval needed', badge(t['Approval needed'] ? 'true' : 'false')],
      ['Next action', escapeHtml(t['Next action'])],
    ])}<div class="mail" style="margin-top:10px">${escapeHtml(t['Reply draft'])}</div>`;
  }

  const retries = sample.retries || [];
  document.getElementById('retry-panel').innerHTML = retries.length
    ? retries
        .map(
          (r) =>
            `<div class="row"><div class="k">${escapeHtml(r.Stage)}</div><div class="v">${escapeHtml(r.Event)}<br><span class="mono">${escapeHtml(r.Error)}</span><br>resolved: ${badge(r.Resolved)}</div></div>`,
        )
        .join('')
    : '<p class="v">No retry rows.</p>';
}

function renderTable(samples) {
  document.getElementById('inbox-table').innerHTML = samples
    .map((s) => {
      const task = s.task ? s.task.Status : '— no Task —';
      return `<tr>
        <td>${escapeHtml(s.inbox.Subject)}</td>
        <td>${badge(s.inbox.Category)}</td>
        <td>${badge(s.inbox.Priority)}</td>
        <td>${badge(s.inbox.Status)}</td>
        <td>${escapeHtml(task)}</td>
        <td class="mono">${escapeHtml(String(s.sent))}</td>
      </tr>`;
    })
    .join('');
}

function setActive(id) {
  for (const btn of document.querySelectorAll('button.sample')) {
    btn.classList.toggle('active', btn.dataset.id === id);
  }
}

async function main() {
  const payload = await fetch(dataUrl).then((r) => {
    if (!r.ok) throw new Error(`demo-data.json ${r.status}`);
    return r.json();
  });

  const nav = document.getElementById('sample-nav');
  for (const sample of payload.samples) {
    const btn = document.createElement('button');
    btn.className = 'sample';
    btn.type = 'button';
    btn.dataset.id = sample.id;
    btn.textContent = sample.label;
    btn.title = sample.walkthrough;
    btn.addEventListener('click', () => {
      setActive(sample.id);
      renderSample(sample);
      history.replaceState(null, '', `#demo=${sample.id}`);
    });
    nav.appendChild(btn);
  }

  renderTable(payload.samples);

  const wanted = new URLSearchParams(location.hash.replace('#', '?')).get('demo')
    || (location.hash.startsWith('#demo=') ? location.hash.slice(6) : 'approval-approved');
  const initial = payload.samples.find((s) => s.id === wanted) || payload.samples[1] || payload.samples[0];
  setActive(initial.id);
  renderSample(initial);
}

main().catch((err) => {
  document.getElementById('inbox-panel').textContent = `Demo failed to load: ${err.message}`;
});
