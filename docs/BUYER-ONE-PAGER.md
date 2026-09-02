# Feedback Ops Copilot — buyer one-pager

**$500 / 48 hours** to wire one source → classify → Notion Inbox + Tasks → human-approved reply draft → retries log.

**$199 same-day audit** if you want a five-ticket map + gap report first. Credited toward the $500 build for 7 days ($301 remaining).

Mock proof. Fictional data. **Not Verde Comply.** Send stays **off**.

---

## Pain

Client feedback lands in email or a form and dies there.

- Nobody classifies it (bug vs billing vs feature vs praise).
- Nothing becomes a task with a next action.
- Replies go out with no paper trail — or never go out.
- Empty bodies and API failures have no exception log.

You want a tracked inbox, not another chatbot that auto-replies.

---

## Deliverables

**Build — $500 / 48h**

1. One ingest source (mailbox *or* form webhook *or* a CSV/JSON drop you already have).
2. Classify + one-line summary into a Notion **Inbox / Feedback** DB (Category, Priority, Status, Summary, From, Received).
3. Related **Task** (Next action, Reply draft, Approval needed).
4. **Human send gate** — no reply leaves unless a human clears Approval needed. Default: send stays off.
5. **Retries / Exceptions** log (empty body, API 429, send-gate block).
6. 15-minute handoff: approve a draft, replay a retry, where secrets live (your vault).

**Audit — $199 same day**

- Five anonymized tickets mapped onto Inbox / Tasks / Retries.
- Written gap report + go/no-go.
- $199 credited if you start the $500 build within 7 days.

**Acceptance:** you run `npm test` and the 15-minute smoke. 50% to start the build, 50% when the eight checks in [OFFER.md](../OFFER.md) pass.

---

## Exclusions (not in this fee)

- Gmail / Google Workspace OAuth on *your* domain (you grant access; I do not take mailbox admin).
- Connecting live SMTP / Gmail send. Mock and founding install keep **send off**.
- Custom LLM training or “as smart as our senior CS lead.”
- Slack / Linear / Intercom / Zendesk / HubSpot two-way sync.
- SLA, on-call, or 24/7 monitoring.
- Production n8n hosting, SSO, or a public webhook.
- Rewriting your CS playbook.
- Anything that writes to a production mailbox without a written “send is on” note from you.

Add-ons (separate quote): extra sources, extra Notion properties, Slack notify, or turning send **on** after you watch the gate.

---

## Proof (click before we talk)

| What | Link |
| --- | --- |
| Live Notion demo (fictional) | https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482 |
| Public repo (inactive workflow, no secrets) | https://github.com/nickerios101-cpu/feedback-ops-copilot |
| Price, scope, 8 acceptance checks | [OFFER.md](../OFFER.md) |
| Close kit (proposal, email, 15-min smoke) | [close-kit/](../close-kit/) |
| Green tests + printed 15-min path | `npm test` or `npm run demo:15min` |

What the mock already shows: five categories, empty-body hold (no Task), approved billing draft with **`sent === false`**, retries log. No Gmail. No auto-send. No credentials in git.

---

## How we start

1. You pick **build $500 / 48h** or **audit $199**.
2. You share a 10-row anonymized sample (or we use the public mock).
3. I deliver in 48 hours (build) or the same day (audit) against [OFFER.md](../OFFER.md).
4. You replay Inbox → Task → Approved draft → Retries. If a build check fails, I fix it before the remainder.

No retainers. No surprise hours. If the source is messier than one mailbox/form, we stop and requote.

Reply **START $500** or **AUDIT $199**.

— Nick
