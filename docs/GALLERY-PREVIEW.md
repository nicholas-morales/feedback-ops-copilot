# Gallery preview notes — Parallel outbound

Draft only. Do not merge. Do not deploy production. Do not connect live send.

## Gallery routes

| Route | What to open |
| --- | --- |
| `/gallery` | Three locked ship scenarios |
| `/demo/gallery` | Alias → `/gallery` |
| `/` | Existing HITL buyer demo |
| https://feedback-ops-copilot.vercel.app | Public demo (when preview is live) |
| https://verdelabs.cloud/work | Portfolio embed field |

## Screenshot / Loom checklist (Parallel)

Dark-first. Phone crop last. Use the **exact** captions in [GALLERY-CAPTIONS.md](./GALLERY-CAPTIONS.md).

1. **Hero** — flow badge `Feedback → Classify → Notion Inbox → Approve gate → Send (human)` + **Nothing auto-sends**
2. **01 Before dump** — `#gallery-before` untagged pile
3. **01 After board** — `#gallery-after` columns **Bug / Feature / Praise / Churn risk**, `sent: false`
4. **02 Draft card** — `#draft-card` + **Approve / Edit / Reject** + audit log + **Nothing auto-sends**
5. **02 After Approve** — decision Approved · unsent; `sent: false`; audit line
6. **03 Autopilot** — `#autopilot-card` red **auto-sent**
7. **03 Ritual** — `#ritual-card` green **approved 2m ago**
8. **Captions** — `#captions` (or paste pack)
9. **Phone 390px** — stacked 01/02/03, full-width gate buttons, readable captions (no clipped emails or paste-pack overflow)

## HITL contract (do not break on camera)

- Approve / Edit / Reject **never** send.
- `sent: false` on every gallery action.
- No Notion, Twilio, Slack, Gmail, or SMTP writes.

## Paste pack

[GALLERY-CAPTIONS.md](./GALLERY-CAPTIONS.md)

Portfolio field stays **https://verdelabs.cloud/work**. Demo link **https://feedback-ops-copilot.vercel.app**. Do not paste a raw preview URL into portfolio fields.
