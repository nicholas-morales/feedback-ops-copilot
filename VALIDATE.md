# VALIDATE — Feedback Ops HITL MCP (Phase 1 only)

**Status:** VALIDATE complete (PR #7). **Build in progress on this branch** — SKUs **B ($19/mo operator)** and **C ($49/mo workspace, 5 seats)** named, plus cash **$199 audit / $500 founding**. Still **do not publish, do not merge, do not deploy production.**

| Field | Value |
| --- | --- |
| EC | [Payout Scout pursue #2 — MCP/Chrome plugin ship](https://app.notion.com/p/3d0eb1cdb78b81d5bf41c84fe2bcc7af) |
| Lane | E — MCP / Chrome plugin |
| Phase | 1 — Validate |
| Repo | [nicholas-morales/feedback-ops-copilot](https://github.com/nicholas-morales/feedback-ops-copilot) |
| Live proof | [https://feedback-ops-copilot.vercel.app](https://feedback-ops-copilot.vercel.app) |
| Notion mock | [Demo — Feedback Ops Copilot (mock)](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482) |
| Cloud agent | [Scout #1: MCP/Chrome FO Validate only](https://cursor.com/agents/bc-0636cf79-75cc-4f9a-a796-11e24c8c9b5b) |
| Soft CAP | $25 on-demand (this run: research + docs only) |
| FO cash | Primary. Parallel owns Contra outbound. This listing is a hedge, not Friday cash. |

**Hard stops (this phase and the later Build phase until Nick writes otherwise):**

- No Chrome Web Store submit, no MCP registry publish, no Cursor Marketplace submit.
- No new Cursor MCPs/plugins. Existing GitHub only.
- No Gmail OAuth. No live SMTP. No custom model training.
- No claim/comment on third-party repos.
- `sent` stays `false` until a buyer writes **"send is on"**.
- FO outbound is not this lane’s job.

---

## 1. Wedge (one pick)

**Ship: Feedback Ops HITL MCP — a remote MCP server that runs the existing FO loop inside Cursor / Claude / ChatGPT.**

Working name: **FO Gate**.

**The workflow (do not invent a new product):**

1. Ingest a pasted client message, form payload, or JSON ticket (not Gmail).
2. Classify + one-line summary → Notion **Inbox / Feedback** (Category, Priority, Status, Summary, From, Received).
3. Upsert a related **Task** (Next action, Reply draft, Approval needed).
4. Human approve-before-send. Drafts exist. **Nothing sends.**
5. Failures write **Retries / Exceptions** (empty body, API 429, send-gate block).

This is the same pattern already proven in the Notion mock and the FO demo: ingest → classify/summarize → task upsert → human-approved reply draft → exception/retry log ([FO mock demo](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482); [FO founding offer on PR #1](https://github.com/nicholas-morales/feedback-ops-copilot/pull/1)).

### Why MCP, not Chrome, for the first paid listing

| Test | MCP (pick) | Chrome (defer) |
| --- | --- | --- |
| Reuses FO proof | Tools wrap the same classify / upsert / send-gate contract already in `src/feedback-ops.mjs` on the mock branches | Would rebuild capture UI; FO has no extension today |
| Buyer who will pay | Agencies / ops leads already in Cursor or Claude + Notion | Inbox operators in Gmail — already served |
| “List” path | Free: official MCP Registry + Smithery (self-hosted) + Cursor install deeplink | Chrome Web Store: one-time developer fee, review, privacy policy, Manifest V3 |
| “Charge” path | Stripe/license on the existing Vercel host. Registries do **not** pay creators | Stripe/Whop outside the store; Google no longer processes extension payments |
| MVP constraint: no Gmail OAuth | Fits. Paste / JSON / form webhook only | Gmail-in-page capture is the obvious Chrome feature and is **out of MVP** |
| Lean / $25 CAP | One Node MCP + existing Vercel project | Store assets, CWS review, Gmail-adjacent policy risk |
| Differentiation | FO schema + HITL `sent === false` vs generic Notion MCP | Competes with MailNotes / Inbox2Action on their home turf |

Chrome is the wrong first SKU. The paid Gmail→Notion Chrome lane already exists ([MailNotes](https://mailnotes.es/en) at Free / €9/mo; [Inbox2Action](https://inbox2action.com/) Free / Pro / Teams $24/mo). Those products read Gmail. FO cannot. A selection-only Chrome capture (highlight text → same FO API, no Gmail scopes) is a **Phase-2 client**, not the listing.

Cursor Marketplace is also not the first list. Publisher submit is manual review ([Cursor forum: marketplace/publish](https://forum.cursor.com/t/unable-to-test-or-publish-the-cursor-plugin-for-scalekit/153341); [Manufact on Cursor Marketplace](https://manufact.com/blog/distribute-mcp-server-across-directories)). Use a [Cursor MCP install deeplink](https://cursor.com/docs/mcp/install-links.md) on the FO demo page instead. No new Cursor plugin for *this* workspace.

### Why this workflow, not another FO/ops idea

Rejected wedges:

| Idea | Why not |
| --- | --- |
| Generic Notion MCP wrapper | Official hosted Notion MCP already exists ([Notion Help](https://www.notion.com/help/notion-mcp); endpoint `https://mcp.notion.com/mcp`) |
| Bug-repro / Claude Code pipeline | [Feedback Pipeline MCP](https://glama.ai/mcp/servers/ericNotion/feedback-pipeline-mcp) already occupies “Notion agent → reproduce bug → build fix” |
| Canny-style feedback portal | [Canny MCP](https://canny.io/features/mcp) is 55+ tools, paid-plan only, product-feedback not agency inbox HITL |
| Auto-send / Gmail reply | Forbidden. Send stays off. Parallel owns Contra outbound |
| Fine-tuned classifier | Forbidden. No custom model training. Keyword stub now; hosted LLM later as a *call*, not a train |

**The sellable difference:** a locked FO schema (Inbox / Tasks / Retries) plus a send gate that cannot be “accidentally on.” Official Notion MCP will happily write whatever the model asks. FO Gate will not send.

---

## 2. Competitive skim

Brief. Adjacent listings only. No claims on those repos.

### MCP / agent directories

| Listing | What it is | Price signal | Gap FO can occupy |
| --- | --- | --- | --- |
| [Official Notion MCP](https://www.notion.com/help/notion-mcp) | Hosted workspace CRUD for Claude / ChatGPT / Cursor | Included with Notion; OAuth | Generic pages/DBs. No FO categories, no Approval needed, no `sent === false` contract |
| [Canny MCP](https://canny.io/features/mcp) | 55+ tools: query ideas, themes, ARR, reply in Canny | [Any paid Canny plan](https://canny.io/pricing) (Pro from $79/mo yearly at 100 tracked users on the public calculator) | Product portal, not agency client-inbox → Notion task → HITL draft |
| [Feedback Pipeline MCP (Glama)](https://glama.ai/mcp/servers/ericNotion/feedback-pipeline-mcp) | Notion custom agent → Playwright repro → Claude Code fix | Free / unclaimed; inactive on Glama | Dev bug pipeline. No classify→Inbox→approve-before-send |
| [Notion Agent Hub](https://github.com/tysoncung/notion-agent-hub) | Generic Notion task queue (Pending → Running → Done) + research/GitHub/content agents | Open source | HITL is “you created the task.” No FO schema, no send gate |
| [La Growth Machine + Notion MCP reply manager](https://lagrowthmachine.com/notion-mcp/) | Classify campaign replies, draft, write Notion, human approve, then send via LGM | LGM product | Outbound campaign replies. FO is inbound client feedback; send stays off |

Registry reality (2026): Glama / Smithery / PulseMCP / mcp.so are **discovery**, not app stores with a checkout ([registries compared](https://thinkneo.ai/blog/mcp-registries-compared-20260714); [where to list](https://linklyhq.com/blog/mcp-server-directories)). [Smithery listing is free](https://apis.io/plans/smithery-ai/smithery-ai-plans-pricing/); hosted RPCs are what they bill. Several write-ups state Smithery does **not** pay creators ([mcpize Smithery guide](https://mcpize.com/alternatives/smithery)). Charge on Vercel, list for discovery.

Official publish path when Nick later says publish: `server.json` + `mcp-publisher` against [github.com/modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) (preview; GitHub OIDC namespace `io.github.nicholas-morales/...`). Downstream indexes (Glama, PulseMCP, GitHub MCP / VS Code `@mcp`) crawl that registry ([distribution notes](https://www.synscribe.com/agentic-discovery/mcp-server-distribution)).

### Chrome Web Store (adjacent, not the MVP)

| Listing | What it is | Price signal | Gap |
| --- | --- | --- | --- |
| [MailNotes](https://chromewebstore.google.com/detail/mailnotes-ai-email-to-not/ldffdggefcjgdlgmnkgfjjjhciiphkgh) | Gmail → AI summary → Notion DB; edit properties before save | [Free 10 credits / €9/mo Pro](https://mailnotes.es/en) | Save-to-Notion, not HITL reply drafts. Gmail + CASA Tier 2. FO cannot copy this ingest |
| [Inbox2Action](https://chromewebstore.google.com/detail/inbox2action-the-power-of/ojhacngljnekkhhhjblmfcenopaphpjg) | Gmail → Notion tasks, labels, pipeline widget | [Free / Pro / Teams $24/mo](https://inbox2action.com/) | Task capture + sync. No classify taxonomy, no send gate, no Retries DB |
| [Upwex](https://chromewebstore.google.com/detail/upwex-ai-tools-for-upwork/pmipgiahphnifpajbfnpahjfkanpfabf) | Upwork job score, proposals, auto-bid, Pipedrive | Paid Upwork toolkit | Outbound / bidding. Not client-feedback ops. FO outbound is not this lane |
| Bardeen Upwork→Notion playbooks | Scrape job post → Notion page | Bardeen subscription | Job capture, not feedback HITL |

Chrome store economics: Google requires a [one-time developer registration fee](https://developer.chrome.com/docs/webstore/register) (public Chrome posts still cite **$5** for a new publisher; [dashboard role blog](https://developer.chrome.com/blog/cws-role-expansion-developer-dashboard)). Native Chrome Web Store payments are gone; the seller is you, via a third-party processor, with mandatory disclosure if basic features are paid ([Accepting Payment policy](https://developer.chrome.com/docs/webstore/program-policies/accepting-payment); [Developer Agreement §3](https://developer.chrome.com/docs/webstore/program-policies/terms)).

**Competitive conclusion:** nobody lists “FO schema + approve-before-send + `sent` stays false” as an MCP. Gmail→Notion Chrome is crowded and requires OAuth FO has banned. List MCP. Charge seats. Keep Chrome as a later no-Gmail capture client.

---

## 3. MVP surface

Reuse the mock schema. Do not redesign the databases.

### Inbox / Feedback

Already in the [mock Inbox DB](https://app.notion.com/p/e7ef4cee56c14c42a2976b82980830a8): Subject, From, Received, Category (`Bug` / `Feature request` / `Billing` / `Praise` / `Ambiguous`), Priority (`High` / `Medium` / `Low`), Status (`New` → `Classified` → `Tasked` → `Closed`), Summary.

### Tasks

Already in the [mock Tasks DB](https://app.notion.com/p/9bc2938020014c3182bacca4f626bc3f): Task, Related feedback, Next action, Reply draft, Approval needed, Status (`Open` / `Waiting approval` / `Approved` / `Done`).

### Retries / Exceptions

Empty-body hold, API 429, send-gate block. Same as the mock.

### MCP tools (Build phase — do not implement now)

| Tool | Does | Must not |
| --- | --- | --- |
| `classify_feedback` | Category + Priority + one-line Summary from pasted text / JSON | Call Gmail. Train a model |
| `upsert_inbox_item` | Write Inbox row; Status `Classified` or `Tasked` | Create a Task for empty-body / Ambiguous-hold |
| `upsert_task` | Related Task + Next action + Reply draft; Approval needed **on** unless already approved in Notion | Flip send |
| `list_awaiting_approval` | Tasks where Approval needed is on or Status is `Waiting approval` | Auto-approve |
| `log_exception` | Retries row (empty body, 429, send-gate) | Retry send |
| `get_send_gate` | Returns `{ sent: false, send_is_on: false }` until buyer writes “send is on” | Expose `send_reply` |

No `send_reply` tool in MVP. If a host model asks to send, the server returns the send-gate block and writes a Retries row. Same contract as `samples/approval-approved.example.json` on the mock branches: Status Approved, Approval needed off, **`sent === false`**.

### Auth / runtime

- Remote MCP on the existing Vercel project (or a `/mcp` route beside the public demo).
- Buyer brings a Notion internal integration token scoped to *their* Inbox / Tasks / Retries.
- License key or Stripe customer id in `Authorization`. No Gmail scopes.
- Classifier: keep the deterministic keyword stub for the free/local path; optional hosted LLM call later (no training).
- Transport: Streamable HTTP. Also ship a local `npx` stdio binary that talks to the same code for air-gapped demos.

### Out of MVP

- Gmail / Workspace OAuth, SMTP, “send is on.”
- Slack / Linear / Intercom / Zendesk two-way.
- Custom model training.
- Chrome Web Store package.
- Cursor Marketplace plugin.
- New MCPs added to *this* Cursor workspace.

---

## 4. Pricing options Nick can set

Nick sets price. These are options, not a publish order. Weekend ~$1k stays **FO cash** (Contra / Fiverr). Listing seats will not hit $1k this weekend.

Align with what is already stamped:

- FO founding: **$500 / 48h**, **$199 same-day audit** (credits into $500), **$250 Notion-only** ([OFFER.md on PR #1](https://github.com/nicholas-morales/feedback-ops-copilot/pull/1)).
- Fiverr kit (draft, not listed): **$199 / 3d**, **$399 / 5d**, **$500 / 7d** (MCP/Chrome *sketch* is the $500 Fiverr tier — [Lane F #1](https://app.notion.com/p/3d0eb1cdb78b818399f7c376717f981d)). Do not collide those SKUs with this listing.

Comps for a *product* seat, not a freelance gig:

| Comp | Seat-ish price |
| --- | --- |
| MailNotes Pro | €9/mo ([mailnotes.es](https://mailnotes.es/en)) |
| Inbox2Action Teams | $24/mo for 5 ([inbox2action.com](https://inbox2action.com/)) |
| Canny MCP | Bundled in paid Canny; Pro ~$79/mo yearly at 100 tracked users ([canny.io/pricing](https://canny.io/pricing)) |

**Menu Nick can pick from (hosted MCP, not Fiverr):**

| SKU | Suggested band | What the buyer gets | When to use |
| --- | --- | --- | --- |
| A. Local / proof | $0 | `npx` stdio, mock classify, no hosted Notion writes | Directory listing + FO demo traffic |
| B. Operator seat | $19/mo or $149/yr | Hosted MCP, 500 classify/mo, their Notion DBs, HITL drafts, send gate locked | Default paid listing |
| C. Workspace | $49/mo (up to 5 seats) | Shared Inbox/Tasks, Retries view, higher cap | Agency of 2–5 |
| D. Wire-up (service) | Keep **$199 / $500 / 48h** | Existing FO install. MCP is how they *use* it after | Cash now. Do not replace Contra/Fiverr with seats |

Do **not** undercut the $500 founding install with a $19 seat that includes custom Notion wiring. Seat = hosted tools + their token. Wiring = the freelance SKU.

Charge on Vercel (Stripe Checkout or Stripe Payment Link). Registries and Chrome do not take a cut if you bill yourself. If basic hosted features require payment, say so on the landing page (same honesty rule Chrome writes down for extensions — [Accepting Payment](https://developer.chrome.com/docs/webstore/program-policies/accepting-payment)).

---

## 5. Ship path (Vercel vs store vs both)

**Recommended: Vercel first. Registry second. Chrome later or never.**

```
FO demo (already live)
    → /mcp remote server + license check     [Build, after Nick Approved]
    → Stripe Payment Link on the same host   [Build]
    → Cursor deeplink on the demo page       [Build]
    → official MCP Registry + Smithery       [Publish, only if Nick says publish]
    → Chrome capture client (no Gmail)       [Separate EC, not this MVP]
```

| Step | Where | Cost to list | When |
| --- | --- | --- | --- |
| 1. Hosted MCP + landing | Existing [feedback-ops-copilot.vercel.app](https://feedback-ops-copilot.vercel.app) | $0 extra host (Hobby/Pro already) | Build |
| 2. Cursor install link | [MCP install links](https://cursor.com/docs/mcp/install-links.md) | $0 | Build |
| 3. Official MCP Registry | [modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) via `mcp-publisher` | $0 | Publish phase |
| 4. Smithery (self-hosted / external) | [Smithery listing is $0](https://apis.io/plans/smithery-ai/smithery-ai-plans-pricing/) | $0 to list; do not buy hosted RPCs unless needed | Publish phase |
| 5. Chrome Web Store | [Register](https://developer.chrome.com/docs/webstore/register) + review | One-time publisher fee; review delay; third-party billing | **Not this MVP** |
| 6. Cursor Marketplace | [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) manual review | Time + open-source expectation in secondary write-ups | **Not this MVP** |

**Both** (Vercel + store) is the long-term shape only if seats convert *and* Nick opens a Chrome EC. Same API, two clients. Do not build two clients in one Build.

Do not publish anything in this Validate run.

---

## 6. Acceptance checks (later Build phase)

Nick must flip the EC to **Build** + **Approved for Cursor** before anyone implements. When that happens, a Build agent should pass all of these — and nothing else.

### Product / safety

| # | Check | Passes when |
| --- | --- | --- |
| B1 | Same five categories | Bug, Feature request, Billing, Praise, Ambiguous match `samples/` on the mock branches |
| B2 | Empty body hold | Empty body → Category Ambiguous, Status Classified, **no Task**, Retries row unresolved |
| B3 | Send gate | Approved task, Approval needed off, **`sent === false`** |
| B4 | No send tool | Tool list has no `send_reply` / SMTP / Gmail |
| B5 | No Gmail OAuth | Manifest, OAuth clients, and MCP env have no Google mail scopes |
| B6 | No training | No fine-tune job, no dataset upload, no custom model endpoint |
| B7 | Schema match | Upsert JSON matches mock Inbox / Tasks / Retries properties |

### Packaging

| # | Check | Passes when |
| --- | --- | --- |
| B8 | Remote MCP | `GET /health` 200 on the Vercel preview; MCP initialize succeeds with a test key |
| B9 | License miss | Unlicensed call → 401 and **no Notion write** |
| B10 | Local stdio | `npx` path classifies a sample without network Notion |
| B11 | Cursor deeplink | Demo page has an install link that prompts Cursor (not a Marketplace submit) |
| B12 | Dark by default | No production activate, no public webhook that writes a buyer’s live Inbox without their token |

### Listing (Publish phase only — not Build)

| # | Check | Passes when |
| --- | --- | --- |
| P1 | Nick wrote **OK TO LIST** (or **publish**) on the EC | No registry/CWS submit before that sentence |
| P2 | `server.json` name is `io.github.nicholas-morales/fo-gate` (or Nick’s chosen slug) | Matches GitHub OIDC namespace |
| P3 | Landing states paid hosted features and that **Nick, not the registry, is the seller** | Same honesty bar as [CWS payment policy](https://developer.chrome.com/docs/webstore/program-policies/accepting-payment) |
| P4 | Privacy page: Notion token stored for the buyer’s workspace only; no email bodies retained beyond the classify call | Live URL on the Vercel host |

### Stop criteria (kill or pause)

Stop the Build (or refuse to open it) if any of these are true:

- FO Friday cash is at risk (this lane stays Parallel).
- Scope creeps to Gmail OAuth, SMTP, or “just turn send on.”
- Scope creeps to a Chrome Web Store submit in the same PR as the MCP.
- On-demand spend would exceed the soft **$25** CAP without Nick raising it.
- Buyer wants custom model training.
- Someone asks to comment/claim a third-party MCP or CWS listing.

---

## 7. Later Build — suggested file map (do not create now)

When Build is approved, keep it inside this repo:

```
src/feedback-ops.mjs          # already on mock branches — classify / gate
src/mcp/server.mjs            # tools table above
src/mcp/send-gate.mjs         # sent === false
app/mcp/route.ts              # or api/mcp — Vercel remote transport
VALIDATE.md                   # this file; do not delete
```

Do not add Cursor project MCP config. Do not add a Chrome `manifest.json` in the first Build unless Nick opens a separate Chrome EC.

---

## 8. Listing copy (draft only — not submitted)

**Name:** FO Gate — Feedback Ops HITL

**One-liner:** Classify client feedback into Notion Inbox + Tasks, draft the reply, and refuse to send until a human says so.

**Longer:** Paste a ticket. FO Gate tags Bug / Feature / Billing / Praise / Ambiguous, upserts your Notion Inbox and a related Task with a reply draft, and keeps `sent` false. Empty bodies hold. Approvals do not send. Built for agencies that already live in Notion and Cursor — not another Gmail scraper.

**Do not claim:** “replaces Notion MCP,” “sends email,” “trained on your mailbox,” “listed on Chrome Web Store.”

---

## 9. This run’s stop

Phase 1 complete when this file is on a **draft PR**.

- [x] One wedge picked (FO Gate MCP)
- [x] Competitive skim
- [x] MVP + pricing options + ship path
- [x] Build-phase acceptance + stop criteria
- [x] Draft PR, no merge, no store, no registry

**Build follow-up (this repo, draft PR):** SKUs B + C named. MVP tools live under `src/mcp/`. Landing + `/pricing` sell seats and founding. Local demo: `npm test && npm start`. Still no registry/CWS publish, no merge, no Gmail, no SMTP.

**Next human action:** Walk the local demo. Do not merge until Nick says so.

---

## Sources

- [Payout Scout pursue #2 — MCP/Chrome plugin ship (EC)](https://app.notion.com/p/3d0eb1cdb78b81d5bf41c84fe2bcc7af) (Sep 2026)
- [Demo — Feedback Ops Copilot (mock)](https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482) (Sep 2026)
- [Inbox / Feedback (mock) schema](https://app.notion.com/p/e7ef4cee56c14c42a2976b82980830a8) (Sep 2026)
- [Tasks (mock) schema](https://app.notion.com/p/9bc2938020014c3182bacca4f626bc3f) (Sep 2026)
- [Payout Scout Lane F #1 — Fiverr seller + FO Gig](https://app.notion.com/p/3d0eb1cdb78b818399f7c376717f981d) (Sep 2026)
- [FO live demo](https://feedback-ops-copilot.vercel.app)
- [FO mock proof PR #1 (OFFER.md / README)](https://github.com/nicholas-morales/feedback-ops-copilot/pull/1) (Sep 2026)
- [Connect AI tools with Notion MCP](https://www.notion.com/help/notion-mcp)
- [Canny MCP Server](https://canny.io/features/mcp)
- [Canny pricing](https://canny.io/pricing)
- [Feedback Pipeline MCP (Glama)](https://glama.ai/mcp/servers/ericNotion/feedback-pipeline-mcp)
- [tysoncung/notion-agent-hub](https://github.com/tysoncung/notion-agent-hub)
- [Notion MCP: What It Does & How to Connect It (LGM)](https://lagrowthmachine.com/notion-mcp/)
- [MCP registries compared (ThinkNEO)](https://thinkneo.ai/blog/mcp-registries-compared-20260714) (Jul 2026)
- [Where to List Your MCP Server (Linkly)](https://linklyhq.com/blog/mcp-server-directories)
- [Official MCP Registry](https://github.com/modelcontextprotocol/registry)
- [MCP server distribution (Synscribe)](https://www.synscribe.com/agentic-discovery/mcp-server-distribution)
- [Smithery plans](https://apis.io/plans/smithery-ai/smithery-ai-plans-pricing/)
- [Smithery guide (mcpize)](https://mcpize.com/alternatives/smithery)
- [Cursor MCP install links](https://cursor.com/docs/mcp/install-links.md)
- [Cursor Marketplace publish thread](https://forum.cursor.com/t/unable-to-test-or-publish-the-cursor-plugin-for-scalekit/153341)
- [Distribute MCP across ChatGPT / Claude / Cursor (Manufact)](https://manufact.com/blog/distribute-mcp-server-across-directories) (Aug 2026)
- [MailNotes Chrome listing](https://chromewebstore.google.com/detail/mailnotes-ai-email-to-not/ldffdggefcjgdlgmnkgfjjjhciiphkgh)
- [MailNotes pricing](https://mailnotes.es/en)
- [Inbox2Action Chrome listing](https://chromewebstore.google.com/detail/inbox2action-the-power-of/ojhacngljnekkhhhjblmfcenopaphpjg)
- [Inbox2Action pricing](https://inbox2action.com/)
- [Upwex Chrome listing](https://chromewebstore.google.com/detail/upwex-ai-tools-for-upwork/pmipgiahphnifpajbfnpahjfkanpfabf)
- [Chrome Web Store register](https://developer.chrome.com/docs/webstore/register)
- [CWS role expansion / $5 publisher fee](https://developer.chrome.com/blog/cws-role-expansion-developer-dashboard)
- [CWS Accepting Payment](https://developer.chrome.com/docs/webstore/program-policies/accepting-payment)
- [CWS Developer Agreement](https://developer.chrome.com/docs/webstore/program-policies/terms)
