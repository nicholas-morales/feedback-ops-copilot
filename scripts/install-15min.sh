#!/usr/bin/env bash
# 15-minute buyer install / smoke. Mock only: no Gmail, no auto-send, no secrets, no paid APIs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Feedback Ops Copilot — 15-minute install / smoke ==="
echo "Mock only. No Gmail. No auto-send. No secrets. No paid APIs. On-demand OFF."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "Need Node 18+. Install LTS from https://nodejs.org — then re-run."
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Need Node 18+ (found $(node -v))."
  exit 1
fi

echo "Node $(node -v) — running npm test"
echo

npm test

echo
echo "=== Three proofs (billing / empty-body / approved-still-not-sent) ==="
echo

node --input-type=module <<'EOF'
import { readFile } from 'node:fs/promises';
import { processFeedback } from './src/feedback-ops.mjs';

async function load(rel) {
  return processFeedback(JSON.parse(await readFile(rel, 'utf8')));
}

const billing = await load('samples/billing.example.json');
if (billing.classification.category !== 'Billing' || billing.sent !== false) {
  throw new Error('billing sample failed the mock contract');
}
console.log('billing:     Billing / High / tasked, sent=false');

const empty = await load('samples/empty-body.example.json');
if (empty.classification.category !== 'Ambiguous' || empty.notion.task !== null || empty.sent !== false) {
  throw new Error('empty-body sample failed the mock contract');
}
console.log('empty-body:  Ambiguous / Classified / no Task, sent=false');

const approved = await load('samples/approval-approved.example.json');
if (approved.sendGate.approved !== true || approved.sent !== false) {
  throw new Error('approval-approved sample failed the mock contract');
}
console.log('approved:    Task Approved, approval off, sent=false');
EOF

cat <<'EOF'

=== Minutes 8–15 — click path (no secrets) ===

  Notion demo (fictional):
    https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482

  Walk Inbox → Task → Approved draft → Retries
    1. High Billing + Bug already classified
    2. Empty body held — Ambiguous / Classified, no Task
    3. Task has Next action + Approval needed
    4. Approved credit-memo draft — checkbox off, sent still false
    5. Retries: empty-body open; send-gate block on waiting-approval

  Full script: close-kit/INSTALL-15MIN.md
  Optional n8n glance (not required): localhost:5679, workflow INACTIVE, no credentials

=== Close ===
  Primary:  $500 / 48h build
  Optional: $199 same-day audit (credited toward the $500 build for 7 days)

  Reply START $500 (mailbox / form / CSV) or AUDIT $199

Do not connect Gmail. Do not activate n8n. Do not add secrets. Do not deploy.
EOF
