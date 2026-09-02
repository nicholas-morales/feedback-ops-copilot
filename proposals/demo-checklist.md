# 3-minute demo checklist

Use this on a sales call. All data is fictional (`*.example`). Do **not** connect Gmail or activate n8n.

**Notion:** https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482  
**Repo:** https://github.com/nickerios101-cpu/feedback-ops-copilot  
**Offer:** [OFFER.md](../OFFER.md)  
**Buyer one-pager:** [docs/BUYER-ONE-PAGER.md](../docs/BUYER-ONE-PAGER.md)  
**Smoke (tests + this path):** `npm run smoke`

---

## Before the call (90 seconds)

- [ ] Open the Notion demo in a clean browser window (no other client names on screen).
- [ ] Optional: `npm test` in the repo so you can flash a green terminal.
- [ ] Optional: n8n on **localhost:5679**, workflow imported, **inactive**, Test workflow already run on pinned billing sample.
- [ ] Tab order: Notion demo → repo README → `samples/approval-approved.example.json`.

## Talking track

| Time | Say | Show |
| --- | --- | --- |
| 0:00 | “You asked for n8n + Notion that turns client feedback into tracked work with a human gate before any reply. Mock only — fictional data.” | Demo page title |
| 0:20 | “Inbox already has Category, Priority, Summary filled.” | High **Billing** + **Bug** rows |
| 0:50 | “Empty body does not blindly create a task.” | `Re: (no subject)` → Status **Classified**, Category **Ambiguous** |
| 1:10 | “Matching Task: Next action + Approval needed.” | Tasks DB, relation back to feedback |
| 1:40 | “Approved draft — checkbox off, still **never auto-sent**.” | **Issue credit memo for double setup fee** — read the reply |
| 2:10 | “Waiting approval still blocks send.” | CSV truncation task + Retries “Send gate blocked” |
| 2:30 | “Exceptions: 429 retried; empty-body still open.” | Retries / Exceptions |
| 2:50 | “Same pattern on your inbox for $500 / 48h — or a $199 same-day audit that credits into the $500 build. Send stays off until you flip it.” | [OFFER.md](../OFFER.md) acceptance table |

## If they ask to see n8n

- [ ] Workflow toggle is **off**
- [ ] Only trigger is **Mock Ingest** (manual)
- [ ] **Notion HTTP (disabled / unconnected)** is grey, no wires, no credentials
- [ ] Output of **Retries Log** has `sent: false`
- [ ] Do not add a Gmail/SMTP node “just to show them”

## If they ask to see code

```bash
npm test
node scripts/run-sample.mjs samples/approval-approved.example.json
```

Point at `"sent": false` and the Task `Status: Approved` / `Approval needed: false`.

## Close

- [ ] Ask: founding $500 / 48h (n8n + Notion), $199 same-day audit → $500 build, or $250 Notion-only?
- [ ] Ask: one source — mailbox, form, or CSV?
- [ ] Send the repo + Notion link in chat so they can replay without you.
- [ ] Do not promise send-on, Intercom, or a production host in this fee.
