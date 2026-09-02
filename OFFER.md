# Offer — Feedback Ops Copilot (founding)

**$500 / 48 hours** to wire *your* inbox (or form) → classify/summarize → Notion Inbox + Tasks → human-approved reply draft → retries log.

**$199 same-day audit** if you want a written five-ticket map + gap report first. The $199 is **credited** toward the $500 build if you start within 7 days (you pay $301 remaining).

This repo is the **mock proof**. The paid job is the same pattern on your stack. Not Verde Comply.

Demo (fictional): [Feedback Ops Copilot (mock)](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482)

Close kit (proposal, email, 15-min smoke, blurbs, handoff list): [close-kit/](./close-kit/)

Send-ready one-pager: [docs/BUYER-ONE-PAGER.md](./docs/BUYER-ONE-PAGER.md)

---

## What $500 / 48h includes

1. n8n workflow (or equivalent) that ingests **one** agreed source: email mailbox *or* form webhook *or* a CSV/JSON drop you already have.
2. Classify + one-line summary into a Notion **Inbox / Feedback** DB (Category, Priority, Status, Summary, From, Received).
3. Upsert a related **Task** (Next action, Reply draft, Approval needed).
4. **Human send gate** — no reply leaves the building unless a human clears Approval needed. Default: send stays off until you explicitly ask to connect a sender.
5. **Retries / Exceptions** log (empty body, API 429, send-gate block) with retry count + resolved checkbox.
6. 15-minute handoff: how to approve a draft, how to replay a retry, where the secrets live (your vault, not this repo).

## What $199 same-day audit includes

- Review one source (or the public mock if you have not shared a sample yet).
- Map **five** anonymized tickets onto Inbox / Tasks / Retries.
- Written gap report: what the $500 build will and will not do on *your* stack.
- Go / no-go + the conversion number ($301 remaining if you start the build within 7 days).

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
| 8 | 15-minute walkthrough | Using [the Notion demo](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482) + [close-kit/INSTALL-15MIN.md](./close-kit/INSTALL-15MIN.md) (or `npm run demo:15min`), a stranger can follow Inbox → Task → Approved draft → Retries. |

For a paid install, we swap “this repo’s samples” for **five of your sanitized tickets** and tick the same boxes in *your* Notion.

Audit acceptance: five-ticket map + gap report the same calendar day you pay and share a sample (or we use the public mock).

---

## How we start

1. You pick **build ($500 / 48h)** or **audit ($199 same day)**.
2. You share a 10-row anonymized sample (or we use the public mock).
3. Build: I deliver in 48 hours against the table above. Audit: same-day written report; $199 credited for 7 days.
4. You run `npm test` / `npm run demo:15min`. If a build row fails, I fix it before you pay the remainder (50% to start, 50% on checks 1–8).

No retainers. No surprise hours. If the source is messier than one mailbox/form, we stop and requote before writing more.

Reply **START $500** or **AUDIT $199**. Close kit: [close-kit/](./close-kit/).
