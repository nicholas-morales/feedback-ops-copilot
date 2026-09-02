# Close kit — Feedback Ops Copilot

Sellable pack to **close a $500 / 48h build this week**. Optional same-day door: **$199 audit** (credited toward the build).

Mock proof only. Fictional data. **Not Verde Comply.** Send stays **off**. No secrets. No paid APIs. On-demand **OFF**.

| File | Use when |
| --- | --- |
| [PROPOSAL.md](./PROPOSAL.md) | One-page buyer proposal (scope, in/out, acceptance, CTA) |
| [EMAIL.txt](./EMAIL.txt) | Plain-text email body — paste into Gmail / Contra / Upwork |
| [INSTALL-15MIN.md](./INSTALL-15MIN.md) | 15-minute install / smoke a buyer runs with **no secrets** |
| [GIG-BLURBS.md](./GIG-BLURBS.md) | Contra / Upwork short + long paste |
| [DELIVERABLES-CHECKLIST.md](./DELIVERABLES-CHECKLIST.md) | Files the buyer gets after payment |

Buyer-facing script (Node 18+, no Docker, no install):

```bash
npm run demo:15min
```

Same checks as `npm test` / `npm run smoke`, plus the printed 15-minute path.

---

## Offer (do not freelance a third price)

| Path | Price | Clock | Converts to |
| --- | --- | --- | --- |
| **Build (primary)** | **$500 fixed** | **48 hours** | Done when the acceptance table passes |
| **Audit (optional door)** | **$199 fixed** | **Same day** | $199 credited if they start the $500 build within 7 days (they pay **$301** remaining) |

No hourly. No retainer in this kit. Only these two fixed paths.

---

## Close sequence

1. Send [EMAIL.txt](./EMAIL.txt) or the short blurb in [GIG-BLURBS.md](./GIG-BLURBS.md).
2. Point them at the Notion demo + `npm run demo:15min` (they replay without you).
3. Attach [PROPOSAL.md](./PROPOSAL.md). Ask: **START $500** or **AUDIT $199**.
4. After payment, tick [DELIVERABLES-CHECKLIST.md](./DELIVERABLES-CHECKLIST.md) and hand off.

Proof: [Notion demo](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482) · [repo](https://github.com/nickerios101-cpu/feedback-ops-copilot) · [OFFER.md](../OFFER.md)
