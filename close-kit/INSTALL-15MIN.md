# 15-minute install / smoke (buyer)

Replay the mock end-to-end. **No secrets. No paid APIs. No Gmail. No production email. No deploy.**

Needs **Node 18+** only. Docker is optional and not required to pass.

Clock starts when you clone. Stop at minute 15. Do not add credentials. Do not activate n8n.

---

## 0:00 — Prerequisites (1 min)

```bash
node -v    # v18 or newer
git --version
```

If Node is missing, install it from https://nodejs.org (LTS). Do not create a Notion integration. Do not copy any API keys.

---

## 0:01 — Clone and verify (3 min)

```bash
git clone https://github.com/nickerios101-cpu/feedback-ops-copilot.git
cd feedback-ops-copilot
npm test
```

**Pass:** process exits 0. Every sample keeps `sent === false`. The mock workflow stays inactive, manual-only, with Notion HTTP disabled and unwired.

Same tests plus the printed 3-minute talking track:

```bash
npm run smoke
```

---

## 0:04 — Run the three proofs (4 min)

```bash
node scripts/run-sample.mjs samples/billing.example.json
node scripts/run-sample.mjs samples/empty-body.example.json
node scripts/run-sample.mjs samples/approval-approved.example.json
```

| Sample | You should see |
| --- | --- |
| `billing.example.json` | Category **Billing**, High, Task “Issue credit memo…”, `sent: false` |
| `empty-body.example.json` | Category **Ambiguous**, Status **Classified**, `task: null`, a Classify-stage retry |
| `approval-approved.example.json` | Task Status **Approved**, Approval needed **false**, **`sent: false`** |

Or run the guided script (prints this path after the tests):

```bash
npm run demo:15min
```

---

## 0:08 — Click the live Notion demo (5 min)

Open https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482

Walk **Inbox → Task → Approved draft → Retries**:

1. Inbox: High **Billing** and **Bug** already classified.
2. `Re: (no subject)` is **Ambiguous / Classified** — no Task.
3. Matching Task has Next action + Approval needed.
4. **Issue credit memo for double setup fee** — approved, checkbox off, still never sent.
5. Retries: empty-body still open; send-gate block on the waiting-approval bug.

All names are `*.example`. There is no live mailbox behind this page.

---

## 0:13 — Optional n8n glance (2 min, skip if you want)

Only if you already have Docker and want to *look* at the graph. **Not required to buy.**

```bash
docker run --rm -it --name feedback-ops-n8n -p 5679:5678 -e N8N_SECURE_COOKIE=false n8nio/n8n
```

Import `n8n/feedback-ops-copilot.mock.json`. Leave it **inactive**. Open **Mock Ingest** → Test workflow. Confirm the grey **Notion HTTP (disabled / unconnected)** node has no wires.

Do not add credentials. Do not click Activate. Do not add a Gmail/SMTP node.

---

## 0:15 — Stop

You have seen classify → Notion JSON → human gate → retries, with send off.

Reply **START $500** for the 48h build (name mailbox / form / CSV) or **AUDIT $199**.

Do not send this repo secrets. Do not deploy it. On-demand stays **OFF**.
