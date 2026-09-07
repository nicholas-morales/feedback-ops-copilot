# Gallery preview notes — Parallel outbound

Draft only. Do not merge. Do not deploy production. Do not connect live send.

## Gallery routes

| Route | What to open |
| --- | --- |
| `/gallery` | Canonical portfolio walkthrough (dark-first) |
| `/demo/gallery` | Alias → `/gallery` |
| `/` | Existing HITL buyer demo (unchanged contract) |
| `/#demo` | Interactive sample console |
| `/demo-data.json` | Fictional fixtures |

Local: serve `public/` then open `http://127.0.0.1:8765/gallery`.

## Screenshot / Loom checklist (Parallel)

Shoot dark-first. Phone crop last. Keep `*.example` senders on screen.

1. **Hero** — headline + prominent **Nothing auto-sends** badge.
2. **Before** — `#gallery-before` Slack/email pile (`14 unread`, missed FWD).
3. **After** — `#gallery-after` HITL board, three cards, `sent: false`.
4. **01 Feedback** — `#gallery-step-feedback` Brightline invoice note.
5. **02 Classify** — `#gallery-step-classify` Billing / High / Tasked.
6. **03 Notion Inbox** — `#gallery-step-notion` upsert + empty-body hold.
7. **04 Approve gate** — `#gallery-step-approve` draft + **Nothing auto-sends**.
8. **05 Send (human)** — `#gallery-step-send` “no live channel”.
9. **HITL board idle** — `#hitl-board` banner `sent: false`; Send disabled.
10. **Approve click** — card moves to **Approved · unsent**; `sent` still `false`.
11. **Send (human) click** — only now may `sent` flip; still no network write.
12. **Captions** — `#captions` list (or paste from [GALLERY-CAPTIONS.md](./GALLERY-CAPTIONS.md)).
13. **Phone** — 390px: stacked before/after, wrap badge, full-width gate buttons.

## HITL contract (do not break on camera)

- Approve path **never** auto-sends.
- `sent: false` until an explicit **Send (human)** click in demo mode.
- Demo send is `demo-local` only — no Notion, Twilio, Slack, Gmail, or SMTP.
- Empty body still creates **no Task**.

## Paste pack

Use [GALLERY-CAPTIONS.md](./GALLERY-CAPTIONS.md) under each still. Portfolio field stays [https://verdelabs.cloud/work](https://verdelabs.cloud/work) — do not paste a raw Vercel preview into portfolio fields.
