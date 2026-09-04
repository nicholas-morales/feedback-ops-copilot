# Competitor compare — adjacent Fiverr / Upwork (honest skim)

**Draft for Scout / Nick. 2026-09-04. Do not publish. Not an apply list.**

Method: public Fiverr gig pages + Fiverr’s own 2026 cost guides + live Upwork buyer posts and freelancer cards. Fiverr HTML often bot-blocks; package numbers below are from search snippets and gig FAQ text, not a logged-in seller dashboard. Treat prices as **directional**, not a census.

Proof we actually ship (click it): https://feedback-ops-copilot.vercel.app

Locked FO Gig (do not silently overwrite): **Basic $199 / Standard $399 / Premium $500** — private kit [fiverr-fo-gig-kit](https://github.com/nicholas-morales/fiverr-fo-gig-kit).

---

## What we have that the cluster does not

Most adjacent gigs sell a **widget, a Notion pretty-page, or a two-app n8n hop**. They do not show a stranger a live HITL contract before checkout.

| FO proof (live on the demo) | Typical chatbot / Notion / triage gig |
| --- | --- |
| Clickable HITL demo — inbox → task → gate → exceptions | Portfolio screenshots, Loom after you pay, or “message me first” |
| Empty body is **held** — no Task invented | Empty / vague input still becomes a ticket, a reply, or a hallucinated row |
| Approved credit-memo draft still **`sent === false`** | “Auto-reply,” “24/7 support,” “bot sends the email” |
| Exceptions log (hold, send-gate block, mock never-send) | Happy-path only; retries are “we’ll fix it in revision” |
| No Gmail. No fake auto-send. Fictional senders | OAuth + live send on day one |
| Classify into Bug / Feature / Billing / Praise / Ambiguous | One “AI agent” that answers everything |

If a buyer wants auto-replies with no paper trail, they should buy the $15–$80 chatbot. We are the wrong seller. That is the wedge.

---

## 1) AI chatbot gigs (Fiverr)

**What they sell:** FAQ / website / Shopify / WhatsApp bots. Train on a URL. Capture leads. Optional Zapier / Make / n8n. Premium adds a Loom handover.

**Price band (live gigs, 2026-09):**

| Seller / source | Basic | Standard | Premium | What you actually get |
| --- | --- | --- | --- | --- |
| [Dhruvkhurana730 — Shopify / 24×7 CS bot](https://www.fiverr.com/dhruvkhurana730/create-ai-chatbot-for-your-shopify) | **$15** | **$40** | **$80** | Core bot 1–2 tasks → 5 tasks → Shopify/Wix/CRM |
| [Kinzaarooj24 — GPT business chatbot](https://www.fiverr.com/kinzaarooj24/create-a-custom-gpt-chatbot-for-your-website-or-business-automation) | **€13.56** (~$15) | **€45.20** (~$50) | **€90.40** (~$100) | Website/FAQ bot → multi-source + lead capture → “full” deploy + Loom. FAQ mentions n8n / Zapier / Make |
| [Fiverr 2026 chatbot-marketing guide](https://www.fiverr.com/resources/guides/costs/chatbot-marketing-expert) | scripts from **$5**; simple setup **~$50–$150** | mid **$150–$300** | **$400+** / marketplace AI-chatbot-dev average **$216**, range **$46–$520** | Rule-based FAQ → AI intent → CRM + NLP. Conversation-script writing is the $5 floor |
| [Fiverr 2026 AI-expert guide](https://www.fiverr.com/resources/guides/costs/ai-expert) | FAQ chatbots **$300–$600** (stated “professional” band) | agents avg **~$295** | custom chatbot-dev avg **~$520** | Guide averages sit **above** the $15–$80 gigs buyers actually see first |

**What they lack vs FO**

- No live “click empty body / sent stays false” proof. The product *is* the auto-send.
- No classify → Notion task → human gate. A chat widget is not an inbox.
- No exceptions schema. Failures are “the bot said the wrong thing.”
- Race-to-$5. A new seller with a $199 Basic looks expensive next to these **until** the demo is the first link.

**Honest:** we will **not** win on cheapest-widget. A $99 Starter is still 6× a $15 Basic. The only reason a buyer pays it is the HITL demo + written gaps, not “I also make chatbots.”

---

## 2) Notion automation gigs (Fiverr)

**What they sell:** dashboards, CRM templates, linked DBs, optional Make / n8n. Agencies sell “operating systems.”

**Price band:**

| Seller / source | Entry | Mid | Top | Notes |
| --- | --- | --- | --- | --- |
| [Notion_crm — template / dashboard](https://www.fiverr.com/notion_crm/build-advance-custom-notion-template-notion-website-and-notion-dashboard) | **€67.50** | **€112.51** | **€193.51** | 1 / 2 / 5 days. “Automation” = relations, rollups, views — not a send gate |
| [Clem_cch — Notion OS + Make](https://www.fiverr.com/clem_cch/deliver-a-bespoke-notion-os-powered-by-make-automations) | Starter OS, **no** automation (gig copy: automations start **~$100**) | Advanced = 3 pages / 3 DBs / 1 Make | Pro = 5 / 5 / 1 + dashboard | Buyer spend shown in **$200–$600** bands |
| [Cynthia_chann — Notion + Make/n8n](https://www.fiverr.com/cynthia_chann/design-notion-template-notion-dashboard-workflows-make-com-and-n8n-automations) | custom quote | **£400–£600** show in reviews/spend | — | “Message me.” Not a fixed HITL product |
| [Aouabchakir / Operflow](https://www.fiverr.com/aouabchakir/create-a-customized-notion-template-in-an-aesthetic-style) | **€200–€400** | **€400–€600** | **€1,000–€1,500** | Certified-consultant OS. 800+ projects claimed |
| [Nociones — PM system](https://www.fiverr.com/nociones/build-a-project-management-system-in-notion) | **$600** / 7d | **$1,000** / 14d | **$1,500** / 30d | Full PM suite. Not feedback ops |

**What they lack vs FO**

- Pretty workspace ≠ classify / hold / send-gate. Empty body still becomes a row if the template has a default.
- Make/n8n extras usually **fire** (email, Slack, task create). They do not advertise `sent === false` after approval.
- No public clickable FO-style mock. You buy a custom OS, then wait 4–30 days.
- High end ($600–$1,500) is a different buyer (agency ops). We should not pretend we are a Notion Certified Partner.

**Honest:** a $67 Notion starter undercuts our locked $199 on “make my Notion nicer.” Our $99 lite only wins if the buyer’s pain is **feedback → tracked work**, not “aesthetic dashboard.”

---

## 3) Support-triage / helpdesk bots (Fiverr + product)

**What they sell:** Zendesk / Freshdesk / Gorgias / Intercom account setup, triggers, chat widgets, “AI triage” that **routes and often auto-replies**.

| Source | Entry | Mid | Top | Notes |
| --- | --- | --- | --- | --- |
| [Teabs_techy — helpdesk setup](https://www.fiverr.com/teabs_techy/zendesk-freshdesk-gorgias-zoho-desk-and-set-up-intercom-for-your-support-system) | **€18.41** | **€138.07** | **€276.14** | 2 / 5 / 7 days. One platform → two platforms → multi + automations |
| [Zendesk Intelligent Triage docs](https://support.zendesk.com/hc/en-us/articles/5222280338202-Intelligent-triage-use-cases-and-workflows) | native add-on (Copilot) | — | — | Official examples include **auto-reply** on refund/sentiment. Opposite of our gate |
| [Pipeline Monk triage writeup](https://pipelinemonk.com/automation/automate-support-ticket-triage/) | Zapier/n8n + Zendesk/Intercom | — | — | Industry default: classify **and** fire the helpdesk |

**What they lack vs FO**

- They optimize for **faster send**, not a visible hold.
- No empty-body “do not invent a Task” contract. Missing fields get a macro or an AI guess.
- FO packages **explicitly exclude** Intercom / Slack / Zendesk / HubSpot two-way sync. We are not in their catalog lane and should not copy their titles.

**Honest:** a buyer who already pays Zendesk Copilot does not need our $99. The buyer who has **email + Notion** and is scared of a bot emailing customers is ours.

---

## 4) n8n / “AI agent” automation gigs (closest cheap substitutes)

These are the listings a “feedback → Notion” buyer will also see.

| Seller | Basic | Standard | Premium | Scope |
| --- | --- | --- | --- | --- |
| [Syed_noor760 — any 2 apps](https://www.fiverr.com/syed_noor760/set-up-an-n8n-workflow-between-any-2-apps) | **$20** | **$50** | **$95** | 2–3 nodes + 60s Loom → 5–7 nodes → 8–12 + AI. Intro pricing, first 10 buyers |
| [Shaikh_rahad — n8n/Make/Zapier](https://www.fiverr.com/shaikh_rahad/build-ai-agents-and-automation-workflows-using-n8n-make-and-zapier) | **$15** (bugfix) | **$145** | **$255** | 1 / 3 / 5 days. “Unlimited revisions.” AI model + Notion listed as skills |
| [Bilal_alvi86 — n8n + AI](https://www.fiverr.com/bilal_alvi86/build-custom-n8n-workflow-automation-with-ai-integrations) | **$50** | **$120** | **$250** | 2–3 steps → webhook+AI → 3 workflows |
| [Quam_samuel — n8n / WhatsApp](https://www.fiverr.com/quam_samuel/n8n-ai-agent-n8n-automation-n8n-workflow-n8n-expert-fix-n8n-api-integration) | **€72** | **€226** | **€362** | 1 workflow / 2 apps → AI or WhatsApp → multi-workflow system |
| [Crissenpai — “actually work”](https://www.fiverr.com/crissenpai/create-advanced-ai-automation-agents-and-workflows-using-n8n) | **$110** | **$500** | **$1,200** | Linear + alerts → AI agent + CRM → “production system” + 45-min handover |

**What they lack vs FO**

- Almost all promise the workflow **runs**. Ours promises the send path **does not**.
- Loom (when included) is a setup video, not “empty body has no Task / approved draft stays `sent: false`.”
- No public HITL demo URL you can click before paying.
- Cheap tiers are node-count SKUs (“2 apps,” “3 steps”). Ours is a **pattern** (classify → task → gate → log).

**Honest:** $20–$50 n8n hops will always look cheaper than our Standard. Do not compete on node count. Compete on the demo + the hold.

---

## 5) Upwork — demand, not a bid list

Skim of **buyer posts** and **freelancer cards** on 2026-09-04. **Not instructions to apply. No Connects. No proposals from this kit.**

### Buyer posts that sit next to FO

| Post | Budget | Why it matters |
| --- | --- | --- |
| [n8n + AI: client feedback emails to Notion tasks](https://www.upwork.com/jobs/~022092522914826194727) (Leonie, FR, 2026-08-26) | **$160** fixed (~€140), 1–2 weeks | Almost the FO story: Gmail label → split feedback → Notion rows; **vague items flagged, not guessed**. 76 proposals. One hire already. |
| [Add AI Triage and Reply Assistance to a Customer Support Inbox](https://www.upwork.com/jobs/~022095518206375349773) (BG, 2026-09-03) | **$1,000** fixed | Classify + urgency + **draft for team approval** + escalate. Human stays responsible. 199 proposals. This is HITL language at 2× our locked Premium. |
| [n8n AI Automation Expert](https://www.upwork.com/jobs/~022092662820990965147) | **$50** | “Client feedback and email management” + Notion task updates + AI chat agent. Racey budget; 27 proposals. |
| [Senior n8n Systems Engineer (Notion, PandaDoc, Xero)](https://www.upwork.com/jobs/~022095504911691826246) | **$50** listed | Pipeline fantasy at a $50 tag. Ignore as a price signal. |
| Notion VA / portal / “quick fix” posts | **$5–$70** | Template and admin work. Not our lane. |

### Freelancer cards (n8n + Notion + chatbot)

Typical **Top Rated** n8n/Make people on the marketplace this morning: **$10–$37/hr**, titles like “AI agent / GHL / Zapier / n8n.” They sell hours and connectors. They do not lead with a public `sent === false` demo.

**Read:** a $160 feedback→Notion job exists *this week*. Our locked **$199 Basic** is in-band for that buyer; **$399 Standard** is a jump. A **$99 Starter** is how a no-review Fiverr seller gets the first yes without looking like a $15 widget.

---

## 6) What we lack (say it)

- **Zero Fiverr reviews / seller level.** Chatbot gigs with 100+ orders will rank above us regardless of price.
- **We refuse the thing they advertise** (live send, Intercom, WhatsApp, 24/7). That loses some buyers on purpose.
- **No custom model.** Several $145–$255 gigs claim “trained on your data.” We will not match that claim.
- **Demo is a mock.** Founding $500/48h language on the Vercel page is **older Contra/Upwork offer copy**. The Fiverr kit is audit + demo + sketch — not a 48h mailbox install. Do not paste the $500/48h founding line into the Gig.
- **Four-tier ladder vs Fiverr’s three slots.** [Fiverr packages](https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig) are Basic / Standard / Premium only. See [REVISED-PASTE.md](REVISED-PASTE.md) for the 3-slot map.

---

## 7) Pricing implication (for the revise)

| Move | Why |
| --- | --- |
| New **Starter $99** (2d, top-3 gaps) | Clears the “$199 is a lot for a stranger with no reviews” objection. Still 6× a $15 bot because the demo is the product. Two Starters or Starter→Standard gets Nick over a **$150–$200 Sep 7 floor**. |
| Keep / slight-cut **Basic $179** | Written top-5 stays the “real audit.” $20 off locked $199. Offer as a Gig extra if Fiverr only has three slots. |
| Cut **Standard $399 → $329** | Lands under Crissenpai’s $500 “AI agent” and under Operflow mid, **with** a Vercel demo + source those gigs do not show. |
| Cut **Premium $500 → $449** | Still below Nociones $600 Notion PM and Crissenpai $1,200. Loom + MCP sketch is the differentiator, not another $50. |

Do **not** drop Starter to $20–$50 to “match n8n hops.” That race deletes the HITL story.

---

## Hard stops (this memo)

- Do not publish the Gig from this repo.
- Do not spend Connects, boost, or buy Promoted Gigs / Seller Plus.
- Do not merge FO from this kit.
- Contra Parallel owns listing neon. This compare does not restyle Contra.
- FO outbound listing copy on Contra stays Parallel’s.

---

## Sources

- [Build an AI chatbot… Kinzaarooj24](https://www.fiverr.com/kinzaarooj24/create-a-custom-gpt-chatbot-for-your-website-or-business-automation) (skimmed 2026-09-04)
- [Build an AI chatbot… Dhruvkhurana730](https://www.fiverr.com/dhruvkhurana730/create-ai-chatbot-for-your-shopify) (skimmed 2026-09-04)
- [Chatbot Expert Costs: 2026 Market Insights — Fiverr](https://www.fiverr.com/resources/guides/costs/chatbot-marketing-expert)
- [AI Experts Cost in 2026 — Fiverr](https://www.fiverr.com/resources/guides/costs/ai-expert)
- [Creating a Gig — Fiverr Help](https://help.fiverr.com/hc/en-us/articles/360010451397-Creating-a-Gig)
- [Fiverr Pricing Packages Strategy 2026](https://fiverrtutorials.com/fiverr-gig-guide/pricing-packages-strategy)
- [Cynthia_chann Notion + Make/n8n](https://www.fiverr.com/cynthia_chann/design-notion-template-notion-dashboard-workflows-make-com-and-n8n-automations)
- [Aouabchakir custom Notion workflow](https://www.fiverr.com/aouabchakir/create-a-customized-notion-template-in-an-aesthetic-style)
- [Nociones Notion PM system](https://www.fiverr.com/nociones/build-a-project-management-system-in-notion)
- [Clem_cch Notion OS + Make](https://www.fiverr.com/clem_cch/deliver-a-bespoke-notion-os-powered-by-make-automations)
- [Notion_crm templates](https://www.fiverr.com/notion_crm/build-advance-custom-notion-template-notion-website-and-notion-dashboard)
- [Teabs_techy helpdesk setup](https://www.fiverr.com/teabs_techy/zendesk-freshdesk-gorgias-zoho-desk-and-set-up-intercom-for-your-support-system)
- [Zendesk Intelligent Triage use cases](https://support.zendesk.com/hc/en-us/articles/5222280338202-Intelligent-triage-use-cases-and-workflows)
- [Pipeline Monk — automate support ticket triage](https://pipelinemonk.com/automation/automate-support-ticket-triage/)
- [Crissenpai n8n / AI agents](https://www.fiverr.com/crissenpai/create-advanced-ai-automation-agents-and-workflows-using-n8n)
- [Shaikh_rahad n8n / Make / Zapier](https://www.fiverr.com/shaikh_rahad/build-ai-agents-and-automation-workflows-using-n8n-make-and-zapier)
- [Syed_noor760 n8n two apps](https://www.fiverr.com/syed_noor760/set-up-an-n8n-workflow-between-any-2-apps)
- [Bilal_alvi86 n8n + AI](https://www.fiverr.com/bilal_alvi86/build-custom-n8n-workflow-automation-with-ai-integrations)
- [Quam_samuel n8n / WhatsApp](https://www.fiverr.com/quam_samuel/n8n-ai-agent-n8n-automation-n8n-workflow-n8n-expert-fix-n8n-api-integration)
- [Upwork — n8n + AI: client feedback emails to Notion tasks](https://www.upwork.com/jobs/~022092522914826194727)
- [Upwork — AI Triage and Reply Assistance](https://www.upwork.com/jobs/~022095518206375349773)
- FO proof: https://feedback-ops-copilot.vercel.app
