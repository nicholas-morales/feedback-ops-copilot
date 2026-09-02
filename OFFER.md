# Offer — Feedback Ops Copilot (founding)

**$500 / 48 hours** to wire *your* inbox (or form) → classify/summarize → Notion Inbox + Tasks → human-approved reply draft → retries log.

**$199 same-day audit** (optional upsell): I map five of your sanitized tickets onto the mock, pick the source, and give you a go/no-go the same day. If you start the founding build, the $199 **credits in full toward the $500** (you pay the $301 remainder to start the 48h clock).

**$250 Notion-only** if you already have n8n (or another runner) and only want the data model, properties, views, and upsert JSON.

This repo is the **mock proof**. The paid job is the same pattern on your stack. Not Verde Comply.

Demo (fictional): [Feedback Ops Copilot (mock)](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482)

> Changelog: founding was $350 / 72h; now **$500 / 48h**, plus optional **$199 same-day audit → $500 build**.

---

## What $500 / 48h includes

1. n8n workflow (or equivalent) that ingests **one** agreed source: email mailbox *or* form webhook *or* a CSV/JSON drop you already have.
2. Classify + one-line summary into a Notion **Inbox / Feedback** DB (Category, Priority, Status, Summary, From, Received).
3. Upsert a related **Task** (Next action, Reply draft, Approval needed).
4. **Human send gate** — no reply leaves the building unless a human clears Approval needed. Default: send stays off until you explicitly ask to connect a sender.
5. **Retries / Exceptions** log (empty body, API 429, send-gate block) with retry count + resolved checkbox.
6. 15-minute handoff: how to approve a draft, how to replay a retry, where the secrets live (your vault, not this repo).

## What the $199 same-day audit includes

- Same-day review of one mailbox/form (or the public mock if you cannot share yet).
- Five sanitized tickets classified onto Inbox / Tasks / Retries.
- Written recommendation: founding **$500 / 48h** vs Notion-only **$250**.
- Convert path: the $199 applies in full to the $500 founding build if you green-light it.

## What $250 Notion-only includes

- The three DBs (Inbox, Tasks, Retries) in *your* workspace, same properties as the demo.
- Sample rows + one approved credit-memo draft.
- The upsert JSON contract (`src/feedback-ops.mjs` / workflow Code nodes) so your builder can attach a runner later.

---

## Exclusions (not in this fee)

- Gmail / Google Workspace OAuth setup on *your* domain (you grant access; I do not take mailbox admin).
- Connecting a live SMTP / Gmail send node. Mock and founding install keep **send off**.
- Custom LLM training, fine-tunes, or “make it as smart as our senior CS lead.”
- Slack / Linear / Intercom / Zendesk / HubSpot two-way sync.
- SLA, on-call, or 24/7 monitoring.
- Production n8n hosting, SSO, or a public webhook on the open internet.
- Rewriting your existing CS playbook or hiring/training your team.
- Anything that writes to a production mailbox without a written “send is on” note from you.

Add-ons (separate quote): extra sources, extra Notion properties, Slack notify, or turning send **on** after you watch the gate.

---

## Measurable acceptance checks

You can run these without me on the call.

| # | Check | Passes when |
| --- | --- | --- |
| 1 | `npm test` | Exits 0 on this repo (Node 18+). |
| 2 | Workflow stays dark | `n8n/feedback-ops-copilot.mock.json` has `"active": false`. No webhook / schedule / Gmail / SMTP nodes. |
| 3 | Notion HTTP inert | The Notion HTTP node is `disabled: true` and **not** in `connections`. |
| 4 | Five categories | Bug, Feature request, Billing, Praise, Ambiguous (empty-body) classify as labeled in `samples/`. |
| 5 | Empty body hold | `empty-body.example.json` → Category Ambiguous, Status Classified, **no Task**, Classify-stage retry row unresolved. |
| 6 | Send gate | `approval-approved.example.json` → Task Status **Approved**, Approval needed **off**, and **`sent === false`**. |
| 7 | Schema match | Upsert JSON properties match the demo Inbox / Tasks / Retries DBs. |
| 8 | 3-minute walkthrough | Using [the Notion demo](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482) + [proposals/demo-checklist.md](./proposals/demo-checklist.md), a stranger can follow Inbox → Task → Approved draft → Retries. |

For a paid install, we swap “this repo’s samples” for **five of your sanitized tickets** and tick the same boxes in *your* Notion.

---

## How we start

1. You pick **founding ($500 / 48h)**, **same-day audit ($199, credits into the $500 build)**, or **Notion-only ($250)**.
2. You share a 10-row anonymized sample (or we use the public mock).
3. Founding delivers in 48 hours against the table above. The audit is same-day.
4. You run `npm test` / the demo checklist. If a row fails, I fix it before you pay the remainder (50% to start, 50% on checks 1–8). Audit is due same day; credited if you convert.

No retainers. No surprise hours. If the source is messier than one mailbox/form, we stop and requote before writing more.
