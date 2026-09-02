# After payment — files the buyer gets

Tick these on handoff. **Mock-safe:** no client credentials, no production email, no paid API keys, no external sends, no production deploy.

---

## If they paid $500 / 48h (build)

Hand over a zip or a private folder. Every file below is *their* copy, not this public mock’s secrets (there are none).

- [ ] **n8n workflow (or equivalent runner)** for the one agreed source — imported in *their* n8n, left **inactive** until they say otherwise.
- [ ] **Ingest contract** — mailbox *or* form webhook *or* CSV/JSON drop, documented in one page (field names only, no passwords).
- [ ] **Notion Inbox / Feedback DB** in *their* workspace (Category, Priority, Status, Summary, From, Received) + the views they need to replay the demo.
- [ ] **Notion Tasks DB** (Next action, Reply draft, Approval needed) related to Inbox.
- [ ] **Notion Retries / Exceptions DB** (Event, Stage, Error, Retry count, Resolved, Occurred).
- [ ] **Upsert JSON contract** — the Inbox / Task / Retry payloads their runner posts (same shape as `src/feedback-ops.mjs`).
- [ ] **Five sanitized tickets** mapped through classify → task (or hold) → send gate. No live customer email addresses.
- [ ] **Acceptance table** from [PROPOSAL.md](./PROPOSAL.md) with checks 1–8 ticked (or a written fail + fix before the remainder).
- [ ] **15-minute handoff notes** — how to approve a draft, how to replay a retry, where secrets live (**their** vault).
- [ ] **This public repo** as the mock reference: https://github.com/nickerios101-cpu/feedback-ops-copilot
- [ ] **This close kit** (`close-kit/`) so they can replay the smoke without you.

Do **not** put in the zip: Notion tokens, Gmail OAuth client secrets, SMTP passwords, production webhook URLs, or an activated workflow.

---

## If they paid $199 (same-day audit)

- [ ] **Five-ticket map** (anonymized) → Category / Priority / Inbox status / Task or hold / retry row.
- [ ] **Gap report** (1–2 pages): what the $500 build will and will not do on their stack.
- [ ] **Go / no-go** plus the conversion line: $199 credited for 7 days; **$301** remaining to start the build.
- [ ] **Links** to the Notion demo, this repo, and [INSTALL-15MIN.md](./INSTALL-15MIN.md).

If they convert, start the $500 checklist above. Do not re-charge the $199.

---

## Never delivered (either path)

- Client credentials or `.env` files
- Production mailbox access or a live send
- Paid model / paid API accounts
- External emails, Slack posts, or webhook calls from this repo
- A production deploy or a public n8n URL
- An activated / scheduled / webhook-triggered workflow (on-demand **OFF**)

---

## Your close checklist (internal)

- [ ] Payment landed ($500 start half, or $199 audit).
- [ ] Source chosen (mailbox / form / CSV) or audit using the public mock.
- [ ] Buyer can run `npm test` and `npm run demo:15min` without you.
- [ ] Remainder collected only after acceptance checks 1–8 (build path).
- [ ] Thread only quotes $500 / 48h or $199 audit.
