# Feedback Ops Copilot (mock)

n8n + Notion proof for a **client-feedback inbox**: classify → summarize → Notion task upsert → **human-approval send gate** → retries log.

This is Nick’s income-proof repo for Upwork / Contra. **Not Verde Comply.**

**Founding offer:** [$350 / 72 hours](./OFFER.md) (or $250 Notion-only). See [OFFER.md](./OFFER.md) for scope, exclusions, and measurable acceptance checks. One-page buyer sheet: [docs/BUYER-ONE-PAGER.md](./docs/BUYER-ONE-PAGER.md).

**Live Notion demo (fictional data):** [Demo — Feedback Ops Copilot (mock)](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482)

**Clickable buyer preview (public, no SSO):** https://barber-4gmuvoixl-nickerios101-cpus-projects.vercel.app — static walkthrough in [`public/`](./public/). Send stays off, not Verde.

---

## What you get in this repo

| Path | Purpose |
| --- | --- |
| [`n8n/feedback-ops-copilot.mock.json`](./n8n/feedback-ops-copilot.mock.json) | Inactive n8n workflow (manual ingest only) |
| [`src/feedback-ops.mjs`](./src/feedback-ops.mjs) | Deterministic classify / summarize / Notion JSON / send gate |
| [`samples/`](./samples/) | Bug, feature, billing, praise, empty-body, approval-approved |
| [`OFFER.md`](./OFFER.md) | Price, exclusions, acceptance checks |
| [`docs/BUYER-ONE-PAGER.md`](./docs/BUYER-ONE-PAGER.md) | 1-page buyer sheet (pain, deliverables, exclusions, proof) |
| [`proposals/`](./proposals/) | Upwork paste, Contra DM, 3-minute demo checklist |
| [`scripts/smoke-demo.sh`](./scripts/smoke-demo.sh) | `npm test` + printed 3-min demo path (`npm run smoke`) |

Pipeline (mock):

1. **Ingest** — fictional email JSON (no Gmail).
2. **Classify & summarize** — keyword stub (no LLM in this proof).
3. **Notion upsert JSON** — Inbox + Tasks + Retries payloads matching the [demo schema](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482).
4. **Human-approval send gate** — drafts a reply; **`sent` is always `false`**.
5. **Retries log** — empty-body hold, send-gate block, mock “never send”.

---

## Safety (read this)

- **Mock only.** `*.example` senders, no real clients, no production credentials.
- **No secrets in git.** Do not add Notion tokens, Gmail OAuth, or SMTP passwords.
- **No deploy.** Do not expose n8n publicly. Do not activate this workflow.
- **On-demand OFF.** No webhook, no schedule, no Gmail/SMTP nodes. Notion HTTP is **disabled and unconnected**.
- **Never auto-sends.** Even `samples/approval-approved.example.json` keeps `sent: false`.

---

## Verify with `npm test` (no Docker required)

Needs Node 18+.

```bash
git clone https://github.com/nickerios101-cpu/feedback-ops-copilot.git
cd feedback-ops-copilot
npm test
```

Expected: all tests pass (samples classify correctly, Notion JSON matches the demo DBs, workflow stays inactive, `sent === false`).

Same tests plus the printed 3-minute demo path:

```bash
npm run smoke
```

Run one sample through the stub:

```bash
node scripts/run-sample.mjs samples/billing.example.json
```

---

## Optional: inspect the n8n workflow in Docker (port 5679)

Default n8n is 5678. This proof uses **host port 5679** so it will not collide with another local n8n.

```bash
docker run --rm -it \
  --name feedback-ops-n8n \
  -p 5679:5678 \
  -e N8N_SECURE_COOKIE=false \
  n8nio/n8n
```

Open [http://localhost:5679](http://localhost:5679), create a local owner account (stays on your machine), then:

1. **Workflows → ⋯ → Import from File**
2. Choose `n8n/feedback-ops-copilot.mock.json`
3. Leave the workflow **inactive**
4. Open **Mock Ingest** (billing sample is pinned) → **Test workflow**
5. Confirm Classify → Notion JSON → send gate → Retries Log
6. Confirm the grey **Notion HTTP (disabled / unconnected)** node has no wires and is disabled

Do not add credentials. Do not enable the workflow. Do not click Activate.

---

## Samples

| File | Category | What it proves |
| --- | --- | --- |
| `samples/bug.example.json` | Bug / High | CSV truncation → waiting-approval task |
| `samples/feature.example.json` | Feature request / Medium | Portal tag filters → roadmap task |
| `samples/billing.example.json` | Billing / High | Invoice #4821 credit-memo draft |
| `samples/praise.example.json` | Praise / Low | Archive, no send |
| `samples/empty-body.example.json` | Ambiguous | Held at Classified; retries log; no task |
| `samples/approval-approved.example.json` | Billing + approved | Status Approved, checkbox off, **`sent` still false** |

---

## Pitch pack

- [OFFER.md](./OFFER.md) — $350 / 72h founding or $250 Notion-only
- [docs/BUYER-ONE-PAGER.md](./docs/BUYER-ONE-PAGER.md) — 1-page buyer sheet
- [proposals/upwork-paste.md](./proposals/upwork-paste.md)
- [proposals/contra-dm.md](./proposals/contra-dm.md)
- [proposals/demo-checklist.md](./proposals/demo-checklist.md)
- `npm run smoke` — green tests + 3-minute demo path
