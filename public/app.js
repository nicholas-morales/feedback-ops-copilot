const ticket = document.getElementById('ticket');
const out = document.getElementById('out');
const classifyBtn = document.getElementById('classify');
const loopBtn = document.getElementById('loop-btn');

async function rpc(name, args) {
  const res = await fetch('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name, arguments: args },
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return body;
}

function show(value) {
  out.textContent = JSON.stringify(value, null, 2);
}

if (classifyBtn) {
  classifyBtn.addEventListener('click', async () => {
    try {
      const result = await rpc('classify_feedback', { text: ticket.value });
      show(result);
    } catch (err) {
      show({
        error: err.message,
        hint: 'Serve this page with npm start (FO_GATE_MODE=local). Opening the HTML file cannot reach /mcp.',
      });
    }
  });
}

if (loopBtn) {
  loopBtn.addEventListener('click', async () => {
    try {
      const classified = await rpc('classify_feedback', { text: ticket.value });
      const inbox = await rpc('upsert_inbox_item', { text: ticket.value });
      const task = await rpc('upsert_task', { text: ticket.value });
      const gate = await rpc('get_send_gate', {});
      show({ classified, inbox, task, gate });
    } catch (err) {
      show({ error: err.message, sent: false });
    }
  });
}
