#!/usr/bin/env bash
# Smoke the mock proof, then print the 3-minute Contra/Upwork demo path.
# Mock only: no Gmail, no auto-send, no secrets.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Feedback Ops Copilot — smoke + 3-min demo path ==="
echo "Mock only. No Gmail. No auto-send. No secrets in this repo."
echo

npm test

cat <<'EOF'

=== 3-minute demo path ===
Open these two tabs, then talk Inbox → Task → Approved draft → Retries.

  1. Notion demo (fictional data)
     https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482

  2. This repo
     https://github.com/nickerios101-cpu/feedback-ops-copilot

Talking track (proposals/demo-checklist.md):

  0:00  Pain + mock disclaimer (fictional clients, send off)
  0:20  Inbox: High Billing + Bug already classified
  0:50  Empty body held — Ambiguous / Classified, no Task
  1:10  Matching Task: Next action + Approval needed
  1:40  Approved credit-memo draft — checkbox off, sent still false
  2:10  Waiting approval still blocks send (CSV truncation)
  2:30  Retries: 429 retried; empty-body still open
  2:50  Close: $500 / 48h founding, $199 same-day audit (credits toward $500), or $250 Notion-only. Send stays off.

Optional one-sample proof:

  node scripts/run-sample.mjs samples/approval-approved.example.json

Buyer sheet:  docs/BUYER-ONE-PAGER.md
Offer + checks: OFFER.md
Do not connect Gmail. Do not activate n8n. Do not add secrets.
EOF
