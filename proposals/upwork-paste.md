# Upwork proposal (paste)

Hi — I already built the exact pattern this job describes (n8n + Notion, human gate before any reply). You can click through a **mock** end-to-end in three minutes before we talk money.

**Notion demo (fictional clients only):**
https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482

**Public proof repo (no secrets, workflow inactive):**
https://github.com/nickerios101-cpu/feedback-ops-copilot

What the mock does:

1. Ingest a client feedback email (JSON — no Gmail connected)
2. Classify + one-line summary (Bug / Feature / Billing / Praise / Ambiguous)
3. Upsert Inbox + Task in Notion (Next action, Reply draft, Approval needed)
4. Human approval send gate — **nothing is sent**, even on the “approved” sample
5. Retries / Exceptions log (empty body, rate limit, send-gate block)

I keep send **off** on purpose. You watch the gate, then we decide if a sender ever gets connected.

**Founding price:** $500, done in 48 hours, against a written acceptance table (same checks as `OFFER.md` / `docs/BUYER-ONE-PAGER.md` in the repo). Optional **$199 same-day audit** credits in full toward the $500 build if you convert. Notion-only (your workspace, no n8n wiring) is $250.

**Not included:** live Gmail OAuth on your domain, turning send on, Slack/Intercom sync, or hosting n8n in production.

If you want a live look: I’ll screen-share the Notion demo + `npm test` (Node 18, no install beyond that) and we map your five real tickets onto the same properties.

— Nick
