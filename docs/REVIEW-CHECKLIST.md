# Feedback Ops Copilot — pre-merge review checklist

Use this on the redesigned buyer page before merging or deploying. Check every box only after inspecting the exact item. Fail the section if any row is wrong.

**Branch:** `cursor/dark-first-royal-type-3f49`  
**Page:** `public/index.html`  
**Theme:** **dark-first** default + `#theme-toggle` / `#theme-toggle-mobile`, persisted as `localStorage.fo-theme`

---

## Visual quality

- [ ] Dark is the default first paint (no stored theme, no system-preference flip to light)
- [ ] Light theme: warm paper `#F7F6F3`, forest accent, no neon gradients or glowing blobs
- [ ] Dark theme: warm charcoal paper `#121110`, pale-sage accent, not a simple invert of the light page
- [ ] Typography: Newsreader headlines + Iowan/Palatino fallback, IBM Plex Sans body, IBM Plex Mono for `sent` / code
- [ ] Readability: body ~18px / 1.7 leading; UI chrome ≥13px; muted text still contrast-safe
- [ ] Header: brand + nav + theme toggle align; no wrapping collisions at 1280px
- [ ] Hero: headline + lede + two CTAs; contract panel sits beside on desktop
- [ ] Contract panel: Mock contract, `send disabled`, four facts, `$199 audit → $500 build`
- [ ] Principles: three cards (01 / 02 / 03), even spacing, hover border only
- [ ] Demo console: toolbar tabs, terracotta send-gate bar, two panels, no clipped copy
- [ ] Inbox table: header row readable; active row tinted; badges remain distinct
- [ ] Pricing: $500 featured card emphasized; $199 and $250 secondary
- [ ] Proof + footer: three cards, disclaimer, OFFER.md + GitHub links
- [ ] Dark theme: header, hero, contract, principles, demo, table, pricing, proof, footer all use dark tokens (no leftover white slabs)
- [ ] Status colors (hot / warn / ok / info) remain distinguishable in both themes
- [ ] No robot/brain art, stock illustrations, fake logos, fake testimonials, or fake metrics

## Interaction / behavior (HITL)

- [ ] Default sample loads (approved billing) with `sent: false`
- [ ] Tab **Empty body · hold** → Task panel: “No Task created”; inbox Status = Classified
- [ ] Tab **Billing · approved** → Task Status = Approved, Approval needed = false, send gate still `sent: false`
- [ ] Tab **Billing · waiting** → Approval needed = true; send gate blocked for approval
- [ ] Clicking an inbox table row loads that sample and highlights the row
- [ ] Keyboard on tabs: ArrowRight / ArrowLeft / Home / End move selection and update panels
- [ ] Keyboard on table row: Enter or Space loads that sample
- [ ] Theme toggle switches light ↔ dark immediately
- [ ] Reload after choosing a theme keeps the same theme (no flash of the opposite theme)
- [ ] Clearing `localStorage.fo-theme` returns to dark (the designed default)
- [ ] Demo error state: with `demo-data.json` blocked, alert + Retry appear; Retry recovers
- [ ] Loading spinners appear only while samples are fetching
- [ ] Empty-state copy is used (no Task / no retries) instead of blank panels
- [ ] Nothing sends. No Gmail. No live SMTP. Workflow stays mock.

## Responsive

- [ ] Desktop ≥960px: hero 2-col, principles 3-col, demo 2-col, pricing 3-col
- [ ] Tablet ~768–960px: stacks to 1-col; contract panel still readable; table scrolls horizontally
- [ ] Mobile ≤720px: hamburger menu works; theme toggle stays visible; sample tabs wrap
- [ ] Mobile hero CTAs stack full-width
- [ ] Mobile send-gate label wraps without overlapping the flag
- [ ] No horizontal page scroll except inside the inbox table
- [ ] Sticky header does not cover the first heading after `#demo` / `#offer` jumps

## Accessibility

- [ ] Skip link appears on first Tab and lands on `#main`
- [ ] Theme toggle has a clear name (“Switch to dark/light theme”) and `aria-pressed`
- [ ] Focus-visible rings on links, buttons, tabs, table rows, theme toggle, menu toggle
- [ ] Tablist: selected tab `aria-selected="true"`, others `-1` tabindex
- [ ] Contrast: body text vs paper, muted text vs paper, primary button label, send-gate text — both themes
- [ ] Badges are not color-only: they also show the status word
- [ ] `prefers-reduced-motion: reduce` stops smooth-scroll and spinner spin
- [ ] Mobile menu: `aria-expanded` toggles; Escape or in-page link closes it
- [ ] `color-scheme` and `theme-color` meta update with the theme
- [ ] Images/icons: brand mark is CSS-only; no missing alt on content images

## Content / commercial truth

- [ ] Prices shown: **$500 / 48 hours**, **$199** same-day audit, **$250** Notion-only
- [ ] Audit credits toward the $500 founding build
- [ ] `sent === false` / send disabled / no Gmail / no live SMTP appear on the page
- [ ] Empty body creates no Task — stated in contract panel and proven in the demo
- [ ] Approved draft remains unsent — stated and proven
- [ ] “Not Verde Comply” in the footer
- [ ] Notion demo and public repo links open the real destinations
- [ ] No leftover $350 / 72h copy
- [ ] Fictional `*.example` senders only; no secrets

## Performance

- [ ] Static files only (`public/`); no framework bundle
- [ ] Fonts: Google Fonts preconnect present; page usable if fonts fail
- [ ] Theme boot script is inline in `<head>` and runs before CSS paint of the wrong theme
- [ ] `demo-data.json` is one fetch; switching samples does not refetch
- [ ] No layout jump when samples replace the loading placeholders

## Release gates

- [ ] `npm test` — all tests pass (including theme + checklist assertions)
- [ ] `npm run smoke` — passes and still prints the 3-minute demo path
- [ ] Light desktop + dark desktop + light mobile + dark mobile screenshots reviewed
- [ ] `docs/REVIEW-CHECKLIST.md` still matches the page (no stale section names)
- [ ] Draft PR updated; **do not merge** and **do not deploy production** until Nick signs this list
- [ ] Send stays off. n8n stays inactive. No Gmail OAuth. No secrets in git.

---

**Reviewer:** ________________  
**Date:** ________________  
**Verdict:** Pass / Fail  
**Notes:**
