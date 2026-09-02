#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  CATEGORIES,
  DEMO_NOTION,
  INBOX_STATUSES,
  PRIORITIES,
  TASK_STATUSES,
  processFeedback,
} from '../src/feedback-ops.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadJson(rel) {
  return JSON.parse(await readFile(join(root, rel), 'utf8'));
}

async function loadSample(name) {
  return loadJson(join('samples', name));
}

function textOf(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map((t) => t.text.content).join('');
  if (prop.rich_text) return prop.rich_text.map((t) => t.text.content).join('');
  if (prop.select) return prop.select.name;
  if (prop.email) return prop.email;
  if (prop.date) return prop.date.start;
  if ('checkbox' in prop) return prop.checkbox;
  if ('number' in prop) return prop.number;
  return prop;
}

test('samples directory includes required example files', async () => {
  const files = await readdir(join(root, 'samples'));
  for (const name of [
    'bug.example.json',
    'feature.example.json',
    'billing.example.json',
    'praise.example.json',
    'empty-body.example.json',
    'approval-approved.example.json',
  ]) {
    assert.ok(files.includes(name), `missing ${name}`);
  }
});

test('bug sample classifies High / Tasked and drafts a waiting-approval task', async () => {
  const result = processFeedback(await loadSample('bug.example.json'));
  assert.equal(result.classification.category, CATEGORIES.BUG);
  assert.equal(result.classification.priority, PRIORITIES.HIGH);
  assert.equal(result.classification.inboxStatus, INBOX_STATUSES.TASKED);
  assert.match(result.summary, /40|truncat|CSV|full strings/i);
  assert.equal(textOf(result.notion.task.properties.Status), TASK_STATUSES.WAITING_APPROVAL);
  assert.equal(textOf(result.notion.task.properties['Approval needed']), true);
  assert.equal(textOf(result.notion.task.properties.Task), 'Fix CSV product-name truncation');
  assert.equal(result.sent, false);
});

test('feature sample classifies Feature request / Medium', async () => {
  const result = processFeedback(await loadSample('feature.example.json'));
  assert.equal(result.classification.category, CATEGORIES.FEATURE);
  assert.equal(result.classification.priority, PRIORITIES.MEDIUM);
  assert.equal(result.classification.inboxStatus, INBOX_STATUSES.TASKED);
  assert.match(result.summary, /tag|filter|portal/i);
  assert.equal(textOf(result.notion.task.properties.Task), 'Roadmap: portal feedback tag filters');
  assert.equal(result.sent, false);
});

test('billing sample classifies Billing / High and mentions invoice 4821', async () => {
  const result = processFeedback(await loadSample('billing.example.json'));
  assert.equal(result.classification.category, CATEGORIES.BILLING);
  assert.equal(result.classification.priority, PRIORITIES.HIGH);
  assert.equal(result.classification.inboxStatus, INBOX_STATUSES.TASKED);
  assert.match(result.summary, /4821|setup fee|twice/i);
  assert.equal(textOf(result.notion.task.properties.Task), 'Issue credit memo for double setup fee');
  assert.equal(textOf(result.notion.task.properties.Status), TASK_STATUSES.WAITING_APPROVAL);
  assert.equal(result.sendGate.approved, false);
  assert.equal(result.sent, false);
});

test('praise sample classifies Praise / Low and archives without a send', async () => {
  const result = processFeedback(await loadSample('praise.example.json'));
  assert.equal(result.classification.category, CATEGORIES.PRAISE);
  assert.equal(result.classification.priority, PRIORITIES.LOW);
  assert.equal(result.classification.inboxStatus, INBOX_STATUSES.CLOSED);
  assert.equal(textOf(result.notion.task.properties.Status), TASK_STATUSES.DONE);
  assert.equal(textOf(result.notion.task.properties['Approval needed']), false);
  assert.equal(result.sent, false);
});

test('empty-body sample is Ambiguous, Classified, no task, retries log', async () => {
  const result = processFeedback(await loadSample('empty-body.example.json'));
  assert.equal(result.classification.category, CATEGORIES.AMBIGUOUS);
  assert.equal(result.classification.inboxStatus, INBOX_STATUSES.CLASSIFIED);
  assert.equal(result.notion.task, null);
  assert.match(result.summary, /empty body/i);
  assert.ok(result.notion.retries.length >= 1);
  const classifyHold = result.notion.retries.find(
    (row) => textOf(row.properties.Stage) === 'Classify',
  );
  assert.ok(classifyHold, 'expected Classify-stage retry row');
  assert.equal(textOf(classifyHold.properties.Resolved), false);
  assert.equal(result.sent, false);
});

test('approval-approved still has sent === false (mock contract)', async () => {
  const result = processFeedback(await loadSample('approval-approved.example.json'));
  assert.equal(result.classification.category, CATEGORIES.BILLING);
  assert.equal(result.sendGate.approved, true);
  assert.equal(result.sent, false);
  assert.equal(result.sendGate.sent, false);
  assert.equal(textOf(result.notion.task.properties.Status), TASK_STATUSES.APPROVED);
  assert.equal(textOf(result.notion.task.properties['Approval needed']), false);
  assert.match(textOf(result.notion.task.properties['Reply draft']), /credit memo/i);
  assert.match(result.sendGate.blockedReason, /mock/i);
});

test('every sample (and processFeedback) never sets sent true', async () => {
  const files = (await readdir(join(root, 'samples'))).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const result = processFeedback(await loadSample(file));
    assert.equal(result.sent, false, `${file} sent`);
    assert.equal(result.sendGate.sent, false, `${file} sendGate.sent`);
  }
});

test('Notion upsert JSON matches Inbox / Tasks / Retries demo schemas', async () => {
  const result = processFeedback(await loadSample('billing.example.json'));
  const inbox = result.notion.inbox;
  assert.equal(inbox.parent.database_id, DEMO_NOTION.inboxDatabaseId);
  for (const key of ['Subject', 'From', 'Category', 'Priority', 'Status', 'Summary', 'Received']) {
    assert.ok(inbox.properties[key], `inbox missing ${key}`);
  }
  assert.equal(inbox.properties.From.email, 'ap@brightline-studio.example');
  assert.ok(inbox.properties.Subject.title[0].text.content);

  const task = result.notion.task;
  assert.equal(task.parent.database_id, DEMO_NOTION.tasksDatabaseId);
  for (const key of ['Task', 'Status', 'Approval needed', 'Next action', 'Reply draft']) {
    assert.ok(task.properties[key], `task missing ${key}`);
  }

  const approved = processFeedback(await loadSample('approval-approved.example.json'));
  const gateRow = approved.notion.retries.find(
    (row) => textOf(row.properties.Stage) === 'Send gate',
  );
  assert.ok(gateRow);
  assert.equal(gateRow.parent.database_id, DEMO_NOTION.retriesDatabaseId);
  for (const key of ['Event', 'Stage', 'Error', 'Retry count', 'Resolved', 'Occurred']) {
    assert.ok(gateRow.properties[key], `retry missing ${key}`);
  }
});

test('n8n mock workflow is inactive, manual-only, and has no mail senders', async () => {
  const workflow = await loadJson('n8n/feedback-ops-copilot.mock.json');
  assert.equal(workflow.active, false);
  assert.ok(Array.isArray(workflow.nodes) && workflow.nodes.length > 0);

  const types = workflow.nodes.map((n) => n.type);
  const banned = types.filter((t) =>
    /gmail|emailSend|smtp|microsoftOutlook|mailchimp/i.test(t),
  );
  assert.deepEqual(banned, []);

  const triggers = workflow.nodes.filter((n) => /trigger/i.test(n.type));
  assert.ok(
    triggers.every((n) => n.type === 'n8n-nodes-base.manualTrigger'),
    'on-demand OFF: only a manual trigger is allowed',
  );
  assert.ok(
    !types.some((t) => /scheduleTrigger|cron|webhook/i.test(t)),
    'no schedule/webhook (on-demand OFF)',
  );

  const notionHttp = workflow.nodes.find(
    (n) => n.type === 'n8n-nodes-base.httpRequest' && /notion/i.test(n.name),
  );
  assert.ok(notionHttp, 'expected a Notion HTTP node');
  assert.equal(notionHttp.disabled, true);
  assert.ok(!notionHttp.credentials, 'Notion HTTP must be unconnected (no credentials)');

  const connectedNames = new Set();
  for (const [source, ports] of Object.entries(workflow.connections || {})) {
    connectedNames.add(source);
    for (const outputs of Object.values(ports)) {
      for (const branch of outputs) {
        for (const target of branch || []) {
          if (target?.node) connectedNames.add(target.node);
        }
      }
    }
  }
  assert.ok(
    !connectedNames.has(notionHttp.name),
    'Notion HTTP must stay unconnected',
  );

  const names = workflow.nodes.map((n) => n.name).join(' | ');
  assert.match(names, /classif/i);
  assert.match(names, /summar/i);
  assert.match(names, /approval|send gate/i);
  assert.match(names, /retr/i);

  const blob = JSON.stringify(workflow);
  assert.doesNotMatch(blob, /sk-[A-Za-z0-9]{10,}/);
  assert.doesNotMatch(blob, /secret_[A-Za-z0-9]+/);
  assert.doesNotMatch(blob, /ntn_[A-Za-z0-9]+/);
});

const NOTION_DEMO = 'https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482';
const REPO_URL = 'https://github.com/nickerios101-cpu/feedback-ops-copilot';

test('repo docs link the offer, buyer one-pager, and the Notion demo', async () => {
  const readme = await readFile(join(root, 'README.md'), 'utf8');
  const offer = await readFile(join(root, 'OFFER.md'), 'utf8');
  assert.match(readme, /OFFER\.md/);
  assert.match(readme, /BUYER-ONE-PAGER\.md/);
  assert.match(readme, /npm test/);
  assert.match(readme, /npm run smoke|smoke-demo\.sh/);
  assert.match(readme, /5679/);
  assert.match(readme, new RegExp(NOTION_DEMO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(offer, /\$350/);
  assert.match(offer, /\$250/);
  assert.match(offer, /72h|72 hours/i);
  assert.match(offer, /Acceptance/i);
  assert.match(offer, /BUYER-ONE-PAGER\.md/);
});

test('OFFER.md and proposals match $350/72h founding and $250 Notion-only', async () => {
  const files = [
    'OFFER.md',
    'docs/BUYER-ONE-PAGER.md',
    'proposals/upwork-paste.md',
    'proposals/contra-dm.md',
    'proposals/demo-checklist.md',
  ];
  for (const rel of files) {
    const text = await readFile(join(root, rel), 'utf8');
    assert.match(text, /\$350/, `${rel} missing $350`);
    assert.match(text, /\$250/, `${rel} missing $250`);
    assert.match(text, /72h|72 hours/i, `${rel} missing 72h`);
    assert.match(text, /Notion-only/i, `${rel} missing Notion-only`);
    assert.match(text, /send/i, `${rel} should mention send stays off`);
    assert.doesNotMatch(text, /gmail\.com|sk-[A-Za-z0-9]{10,}|ntn_[A-Za-z0-9]+|secret_[A-Za-z0-9]+/i);
  }
});

test('buyer one-pager is one page: pain, deliverables, exclusions, proof links', async () => {
  const pager = await readFile(join(root, 'docs/BUYER-ONE-PAGER.md'), 'utf8');
  assert.match(pager, /## Pain/i);
  assert.match(pager, /## Deliverables/i);
  assert.match(pager, /## Exclusions/i);
  assert.match(pager, /## Proof/i);
  assert.match(pager, /\$350/);
  assert.match(pager, /\$250/);
  assert.match(pager, /72 hours/i);
  assert.match(pager, /Notion-only/i);
  assert.match(pager, new RegExp(NOTION_DEMO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(pager, new RegExp(REPO_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(pager, /human (send )?gate|Approval needed/i);
  assert.match(pager, /send stays \*\*off\*\*|send stays off|keep \*\*send off\*\*/i);
  assert.doesNotMatch(pager, /Gmail OAuth setup on \*your\* domain[\s\S]*I will connect/i);
  const lines = pager.split('\n').length;
  assert.ok(lines <= 120, `buyer one-pager should stay one page (got ${lines} lines)`);
});

test('smoke-demo.sh runs npm test and prints the 3-min demo path', async () => {
  const smoke = await readFile(join(root, 'scripts/smoke-demo.sh'), 'utf8');
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.match(smoke, /^#!/);
  assert.match(smoke, /npm test/);
  assert.match(smoke, /3-min(?:ute)? demo path/i);
  assert.match(smoke, new RegExp(NOTION_DEMO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(smoke, new RegExp(REPO_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(smoke, /Inbox → Task → Approved draft → Retries/);
  assert.match(smoke, /\$350/);
  assert.match(smoke, /\$250/);
  assert.match(smoke, /No Gmail/);
  assert.match(smoke, /No auto-send|sent still false/);
  assert.match(smoke, /Do not add secrets/);
  assert.equal(pkg.scripts.smoke, 'bash scripts/smoke-demo.sh');
  assert.doesNotMatch(smoke, /sk-[A-Za-z0-9]{10,}|ntn_[A-Za-z0-9]+|secret_[A-Za-z0-9]+/);
});

test('public buyer demo is a static click-through of the mock contract', async () => {
  const html = await readFile(join(root, 'public/index.html'), 'utf8');
  const css = await readFile(join(root, 'public/styles.css'), 'utf8');
  const js = await readFile(join(root, 'public/app.js'), 'utf8');
  const vercel = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
  const demo = JSON.parse(await readFile(join(root, 'public/demo-data.json'), 'utf8'));

  assert.match(html, /\$350/);
  assert.match(html, /\$250/);
  assert.match(html, /sent === false/);
  assert.match(html, /Not Verde/);
  assert.match(html, new RegExp(NOTION_DEMO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, new RegExp(REPO_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, /id="demo"/);
  assert.match(css, /--accent/);
  assert.match(js, /demo-data\.json/);
  assert.equal(vercel.outputDirectory, 'public');
  assert.equal(vercel.framework, null);

  const approved = demo.samples.find((s) => s.id === 'approval-approved');
  const empty = demo.samples.find((s) => s.id === 'empty-body');
  assert.ok(approved && empty, 'demo-data missing required samples');
  assert.equal(approved.sent, false);
  assert.equal(approved.task.Status, 'Approved');
  assert.equal(approved.task['Approval needed'], false);
  assert.equal(empty.task, null);
  assert.equal(empty.classification.category, 'Ambiguous');
  assert.ok(
    demo.samples.every((s) => s.sent === false),
    'every demo sample must keep sent false',
  );

  const live = processFeedback(await loadSample('approval-approved.example.json'));
  assert.equal(approved.summary, live.summary);
  assert.doesNotMatch(html, /sk-[A-Za-z0-9]{10,}|ntn_[A-Za-z0-9]+|secret_[A-Za-z0-9]+/);
});
