# Contra / Upwork — paste-ready blurbs

Use these as-is. Do not add a third price. Do not promise send-on or a production host.

**Primary:** $500 / 48h build. **Door:** $199 same-day audit (credited toward the build for 7 days).

---

## Short (Contra DM / Upwork first message)

n8n + Notion that turns a feedback inbox into tracked tasks with a **human gate before any reply**. Send stays off.

15-min mock (fictional, no secrets, no paid APIs):
https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482

Repo (`npm test` / `npm run demo:15min`, Node 18 only):
https://github.com/nickerios101-cpu/feedback-ops-copilot

**$500 / 48h** — one source → classify → Notion Inbox/Tasks → approval gate → retries log.
**$199 same-day audit** — five-ticket map + gap report; credited if you start the build within 7 days.

Reply START $500 or AUDIT $199.

— Nick

---

## Long (gig listing / full proposal)

**Title:** Feedback inbox → Notion tasks in 48h (n8n, human send gate)

I wire one feedback source into Notion so every message becomes a classified inbox row, a task with a reply draft, and a retries log — with a human approval gate so **nothing sends** until you say so.

You can click the mock before we talk money. Fictional clients. No Gmail connected. No credentials in git.

**Live Notion demo:** https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482
**Public proof:** https://github.com/nickerios101-cpu/feedback-ops-copilot
**Buyer smoke (15 min, Node 18, no secrets):** `npm test` then `npm run demo:15min`

What the mock already proves:

1. Ingest fictional email JSON (no Gmail).
2. Classify + one-line summary (Bug / Feature / Billing / Praise / Ambiguous).
3. Upsert Inbox + Task (Next action, Reply draft, Approval needed).
4. Human send gate — `sent` stays false even on the “approved” sample.
5. Retries / Exceptions (empty body, rate limit, send-gate block).

**Fixed offer**

- **Build — $500 / 48 hours.** One agreed source (mailbox *or* form *or* CSV/JSON drop) → classify → Notion Inbox + Tasks → approval gate → retries log + 15-minute handoff. 50% to start, 50% when you can replay the acceptance checks.
- **Audit — $199 same day.** I map five sanitized tickets onto this schema and send a written gap report. If you start the $500 build within 7 days, the $199 is credited (you pay $301 remaining).

**Not included:** Gmail / Workspace OAuth on your domain, turning send on, Slack / Intercom / Zendesk / HubSpot sync, SLA / on-call, production n8n hosting, a public webhook, or any production mailbox write. Add-ons are a separate quote after you watch the gate.

**How we start:** reply START $500 + mailbox/form/CSV, or AUDIT $199. Attach a 10-row anonymized sample if you have one; otherwise we use the public mock.

— Nick
