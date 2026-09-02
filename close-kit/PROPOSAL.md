# Proposal — Feedback Ops Copilot

**$500 fixed / 48 hours** to wire *one* agreed source → classify / summarize → Notion Inbox + Tasks → human-approved reply draft → retries log.

**Optional door: $199 same-day audit.** Written mapping of five sanitized tickets onto this pattern. The $199 is **credited** toward the $500 build if you start within 7 days (you pay $301 remaining).

Mock proof already exists. Fictional data. **Not Verde Comply.** Send stays **off** unless you later sign a written “send is on” note (separate quote).

---

## What’s included ($500 / 48h)

1. One ingest source: mailbox *or* form webhook *or* a CSV/JSON drop you already have.
2. Classify + one-line summary into a Notion **Inbox / Feedback** DB (Category, Priority, Status, Summary, From, Received).
3. Related **Task** (Next action, Reply draft, Approval needed).
4. **Human send gate** — no reply leaves unless a human clears Approval needed. Default: send stays off.
5. **Retries / Exceptions** log (empty body, API 429, send-gate block) with retry count + resolved checkbox.
6. 15-minute handoff: approve a draft, replay a retry, where secrets live (**your** vault, never this repo).

## What’s included ($199 same-day audit)

1. Review one source (or the public mock if you have not shared a sample yet).
2. Map **five** anonymized tickets onto Inbox / Tasks / Retries.
3. Written gap report: what the $500 build will and will not do on *your* stack.
4. Go / no-go + the conversion number ($301 remaining if you start within 7 days).

---

## What’s out (not in this fee)

- Gmail / Google Workspace OAuth on *your* domain (you grant access; I do not take mailbox admin).
- Connecting live SMTP / Gmail send. Build and audit keep **send off**.
- Custom LLM training or “as smart as our senior CS lead.”
- Slack / Linear / Intercom / Zendesk / HubSpot two-way sync.
- SLA, on-call, or 24/7 monitoring.
- Production n8n hosting, SSO, or a public webhook.
- Rewriting your CS playbook.
- Anything that writes to a production mailbox without a written “send is on” note from you.
- Client credentials, paid API keys, or production deploys in this repo or the handoff zip.

Add-ons (separate quote): extra sources, extra Notion properties, Slack notify, or turning send **on** after you watch the gate.

---

## Acceptance criteria (you can run these without me)

| # | Check | Passes when |
| --- | --- | --- |
| 1 | `npm test` | Exits 0 on the proof repo (Node 18+). No secrets required. |
| 2 | Workflow stays dark | Mock workflow `"active": false`. No webhook / schedule / Gmail / SMTP nodes. |
| 3 | Notion HTTP inert | Notion HTTP node is disabled and **not** wired. |
| 4 | Five categories | Bug, Feature request, Billing, Praise, Ambiguous classify as labeled. |
| 5 | Empty body hold | Empty body → Ambiguous / Classified, **no Task**, Classify-stage retry unresolved. |
| 6 | Send gate | Approved billing draft → Task Status **Approved**, Approval needed **off**, **`sent === false`**. |
| 7 | Schema match | Upsert JSON properties match Inbox / Tasks / Retries. |
| 8 | 15-minute replay | A stranger follows [INSTALL-15MIN.md](./INSTALL-15MIN.md) (or `npm run demo:15min`) Inbox → Task → Approved draft → Retries. |

On the paid build we swap “repo samples” for **five of your sanitized tickets** and tick the same boxes in *your* Notion.

Audit acceptance: you receive the five-ticket map + gap report the same calendar day you pay and share the sample (or we use the public mock).

---

## Price and terms

- **Build:** $500 fixed. 50% to start, 50% when checks 1–8 pass. Clock starts when the start payment and the source choice land. Done in **48 hours**.
- **Audit:** $199 fixed, same day. Credited in full toward the $500 build for 7 days.
- No retainers. No surprise hours. If the source is messier than one mailbox/form, we stop and requote before writing more.

---

## Next step (reply with one line)

Reply **START $500** and name the source (mailbox / form / CSV), **or** reply **AUDIT $199**.

Attach a 10-row anonymized sample if you have one. If not, we use the public mock and the [15-minute smoke](./INSTALL-15MIN.md).

Proof you can click now:

- Notion demo (fictional): https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482
- Repo (inactive workflow, no secrets): https://github.com/nickerios101-cpu/feedback-ops-copilot

— Nick
