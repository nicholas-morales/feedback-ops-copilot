import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { processFeedback } from '../src/feedback-ops.mjs';
import { handleMcpMessage, loadPricing, mcpInitializeResult } from '../src/mcp/server.mjs';
import { TOOL_DEFS, TOOL_NAMES, runTool } from '../src/mcp/tools.mjs';
import { getSendGate, isSendLikeTool } from '../src/mcp/send-gate.mjs';
import { checkLicense } from '../src/mcp/license.mjs';
import { createStore, resetStore } from '../src/mcp/store.mjs';
import { handleHttpRequest } from '../src/mcp/http.mjs';
import { cursorDeeplink, cursorInstallUrl } from '../src/mcp/cursor-link.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function sample(name) {
  return JSON.parse(read(`samples/${name}`));
}

function call(name, args, ctx) {
  return runTool(name, args, ctx);
}

function structured(name, args, ctx) {
  return call(name, args, ctx).structuredContent;
}

test('B1 same five categories on samples', () => {
  const expected = {
    'bug.example.json': 'Bug',
    'feature.example.json': 'Feature request',
    'billing.example.json': 'Billing',
    'praise.example.json': 'Praise',
    'empty-body.example.json': 'Ambiguous',
  };
  for (const [file, category] of Object.entries(expected)) {
    const result = processFeedback(sample(file));
    assert.equal(result.classification.category, category, file);
  }
});

test('B2 empty body hold — no Task, retry unresolved, sent false', () => {
  const store = createStore();
  const result = structured('upsert_task', { json: sample('empty-body.example.json') }, { store });
  assert.equal(result.taskCreated, false);
  assert.equal(result.task, null);
  assert.equal(result.inbox.category, 'Ambiguous');
  assert.equal(result.inbox.status, 'Classified');
  assert.equal(result.sent, false);
  assert.equal(result.retry.resolved, false);
});

test('B3 send gate — approved draft stays sent false', () => {
  const store = createStore();
  const result = structured('upsert_task', { json: sample('approval-approved.example.json') }, { store });
  assert.equal(result.task.status, 'Approved');
  assert.equal(result.task.approvalNeeded, false);
  assert.equal(result.task.sent, false);
  assert.equal(result.sent, false);
  assert.equal(processFeedback(sample('approval-approved.example.json')).sent, false);
});

test('B4 tool list has no send_reply / SMTP / Gmail', () => {
  assert.deepEqual(TOOL_NAMES, [
    'classify_feedback',
    'upsert_inbox_item',
    'upsert_task',
    'list_awaiting_approval',
    'log_exception',
    'get_send_gate',
  ]);
  const blob = TOOL_DEFS.map((t) => t.name).join(' ');
  assert.equal(blob.includes('send_reply'), false);
  assert.equal(blob.toLowerCase().includes('smtp'), false);
  assert.equal(blob.toLowerCase().includes('gmail'), false);
  assert.equal(isSendLikeTool('send_reply'), true);
});

test('B5 no Gmail OAuth in repo surface', () => {
  const files = [
    'src/mcp/server.mjs',
    'src/mcp/tools.mjs',
    'src/mcp/http.mjs',
    'api/mcp.js',
    'package.json',
  ];
  for (const file of files) {
    const text = read(file);
    assert.equal(/gmail\.googleapis|https:\/\/mail\.google|scope=.+gmail/i.test(text), false, file);
  }
});

test('B6 no training / fine-tune surface', () => {
  const text = read('src/mcp/tools.mjs') + read('src/feedback-ops.mjs');
  assert.equal(/fine-?tune|dataset upload|custom model endpoint/i.test(text), false);
});

test('B7 schema match Inbox / Tasks / Retries properties', () => {
  const result = processFeedback(sample('billing.example.json'));
  const inboxKeys = Object.keys(result.notion.inbox.properties);
  const taskKeys = Object.keys(result.notion.task.properties);
  for (const key of ['Subject', 'From', 'Category', 'Priority', 'Status', 'Summary', 'Received']) {
    assert.ok(inboxKeys.includes(key), key);
  }
  for (const key of ['Task', 'Status', 'Approval needed', 'Next action', 'Reply draft']) {
    assert.ok(taskKeys.includes(key), key);
  }
  assert.ok(result.notion.retries.length >= 1);
  assert.ok(result.notion.retries[0].properties.Event);
});

test('classify_feedback returns HITL fields', () => {
  const store = createStore();
  const billing = structured('classify_feedback', { json: sample('billing.example.json') }, { store });
  assert.equal(billing.category, 'Billing');
  assert.equal(billing.priority, 'High');
  assert.equal(billing.wouldCreateTask, true);
  assert.equal(billing.sent, false);
});

test('list_awaiting_approval does not auto-approve', () => {
  const store = createStore();
  structured('upsert_task', { json: sample('bug.example.json') }, { store });
  const listed = structured('list_awaiting_approval', {}, { store });
  assert.equal(listed.count, 1);
  assert.equal(listed.tasks[0].approvalNeeded, true);
  assert.equal(listed.sent, false);
});

test('send-like tool call logs retry and stays false', () => {
  const store = createStore();
  const result = call('send_reply', { text: 'please send' }, { store });
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.sent, false);
  assert.equal(store.retries.size, 1);
});

test('get_send_gate default and phrase', () => {
  const off = getSendGate({});
  assert.deepEqual(
    { sent: off.sent, send_is_on: off.send_is_on, has_send_reply_tool: off.has_send_reply_tool },
    { sent: false, send_is_on: false, has_send_reply_tool: false },
  );
  const on = getSendGate({ FO_GATE_BUYER_NOTE: 'buyer wrote send is on yesterday' });
  assert.equal(on.send_is_on, true);
  assert.equal(on.sent, false);
});

test('B9 unlicensed hosted call is 401 and does not write', () => {
  const store = createStore();
  const env = { FO_GATE_MODE: 'hosted', FO_GATE_LICENSE_KEYS: 'seat-b-key' };
  const denied = checkLicense({ authorization: '', transport: 'http', env });
  assert.equal(denied.ok, false);
  assert.equal(denied.status, 401);

  const rpc = handleMcpMessage(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'upsert_inbox_item', arguments: { json: sample('billing.example.json') } },
    },
    { store, env, transport: 'http', authorization: '' },
  );
  assert.equal(rpc.error.data.status, 401);
  assert.equal(store.inbox.size, 0);
});

test('licensed hosted call may write memory store only', () => {
  const store = createStore();
  const env = { FO_GATE_MODE: 'hosted', FO_GATE_LICENSE_KEYS: 'seat-b-key' };
  const rpc = handleMcpMessage(
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: 'upsert_inbox_item', arguments: { json: sample('billing.example.json') } },
    },
    { store, env, transport: 'http', authorization: 'Bearer seat-b-key' },
  );
  assert.equal(rpc.result.structuredContent.inbox.category, 'Billing');
  assert.equal(store.inbox.size, 1);
});

test('stdio / local mode does not need a key', () => {
  const ok = checkLicense({ transport: 'stdio', env: { FO_GATE_MODE: 'hosted' } });
  assert.equal(ok.ok, true);
  assert.equal(ok.sku, 'A');
});

test('B8 / B10 HTTP health + initialize + local classify', async () => {
  const store = createStore();
  const env = { FO_GATE_MODE: 'local' };
  const server = createServer((req, res) => {
    handleHttpRequest(req, res, { store, env }).catch((err) => {
      res.statusCode = 500;
      res.end(err.message);
    });
  });
  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    const healthBody = await health.json();
    assert.equal(healthBody.status, 'ok');
    assert.equal(healthBody.sent, false);
    assert.equal(healthBody.tools.includes('send_reply'), false);

    const init = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
    });
    assert.equal(init.status, 200);
    const initBody = await init.json();
    assert.equal(initBody.result.serverInfo.name, 'fo-gate');

    const listed = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list' }),
    });
    const listedBody = await listed.json();
    const names = listedBody.result.tools.map((t) => t.name);
    assert.deepEqual(names, TOOL_NAMES);
    assert.equal(names.includes('send_reply'), false);

    const classify = await fetch(`${base}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'classify_feedback', arguments: { json: sample('billing.example.json') } },
      }),
    });
    const classified = await classify.json();
    assert.equal(classified.result.structuredContent.category, 'Billing');

    const landing = await fetch(`${base}/`);
    assert.equal(landing.status, 200);
    const landingHtml = await landing.text();
    assert.match(landingHtml, /\$19/);
    assert.match(landingHtml, /\$49/);

    const pricing = await fetch(`${base}/pricing`);
    assert.equal(pricing.status, 200);
    const pricingHtml = await pricing.text();
    assert.match(pricingHtml, /\$500/);
    assert.match(pricingHtml, /\$199/);
  } finally {
    await new Promise((resolvePromise) => server.close(resolvePromise));
  }
});

test('B11 Cursor deeplink is an install link, not Marketplace publish', () => {
  const url = cursorInstallUrl();
  const deep = cursorDeeplink();
  assert.match(url, /^https:\/\/cursor\.com\/install-mcp\?/);
  assert.match(deep, /^cursor:\/\/anysphere\.cursor-deeplink\/mcp\/install\?/);
  assert.equal(url.includes('marketplace'), false);
  const landing = read('public/index.html');
  assert.match(landing, /cursor\.com\/install-mcp|stdio MCP|bin\/fo-gate/);
});

test('pricing config locks B $19 and C $49 plus cash SKUs', () => {
  const pricing = loadPricing();
  assert.equal(pricing.skus.B.priceUsd, 19);
  assert.equal(pricing.skus.B.seats, 1);
  assert.equal(pricing.skus.C.priceUsd, 49);
  assert.equal(pricing.skus.C.seats, 5);
  assert.equal(pricing.cash.audit.priceUsd, 199);
  assert.equal(pricing.cash.founding.priceUsd, 500);
  assert.equal(pricing.cash.founding.hours, 48);
  assert.equal(pricing.noRoiClaims, true);
  const names = pricing.products.map((p) => p.id);
  assert.ok(names.includes('fo-gate'));
  assert.ok(names.includes('lead-ops-gate'));
});

test('landing + pricing copy sells seats and founding without ROI invention', () => {
  const landing = read('public/index.html') + read('public/pricing.html') + read('README.md');
  assert.match(landing, /\$19/);
  assert.match(landing, /\$49/);
  assert.match(landing, /\$199/);
  assert.match(landing, /\$500/);
  assert.match(landing, /Lead Ops Gate/);
  assert.equal(/[0-9]+x ROI|save \$\d+k|guaranteed return/i.test(landing), false);
  assert.match(landing, /Nick is the seller|Nick Trevino/);
  assert.match(landing, /sent/);
});

test('initialize lists expected server', () => {
  const init = mcpInitializeResult();
  assert.equal(init.serverInfo.name, 'fo-gate');
  assert.match(init.instructions, /sent stays false/);
});

test('resetStore clears memory', () => {
  const store = createStore();
  structured('upsert_task', { json: sample('bug.example.json') }, { store });
  resetStore(store);
  assert.equal(store.tasks.size, 0);
});

test('repo does not add Chrome manifest or registry publish files', () => {
  const names = readdirSync(ROOT);
  assert.equal(names.includes('manifest.json'), false);
  assert.equal(names.includes('server.json'), false);
});
