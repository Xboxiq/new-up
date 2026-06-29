---
inclusion: always
---

# Atelier rebuild — working brief (read me first)

This repo (`Xboxiq/new-up`) is **تدفّق الخير / Tadfuq Al-Khayr** — an Arabic-first,
RTL, civic **subscriber-services operations platform** (electricity utility, Rasafa:
subscriptions / technical / billing / complaints). We are building a **ground-up design
of the homepage and app** under **`atelier/`** — a *new design of the same project*, not a
different project.

## The law
`design.md` (repo root) is the single source of design truth — read it before any UI work.
Identity: **Walnut Ivory** canvas + **Royal Indigo** (the only action colour) + **Heritage
Crimson** (urgent/lead) + **Warm Gilt** (ceremonial only) + four OKLCH **section hues**
(CS Cobalt · CT Bronze · CB Teal · CA Rosewood); dark = **Indigo Dusk**. Voice: "civic
atelier at golden hour." One signature per screen.

## The mechanism (how this build works)
- **No build step.** Static `atelier/index.html` + vanilla JS; in-browser only.
- **Token namespace `--at-*`** in `atelier/tokens.css` (mirrors design.md §1/§17.1; never
  aliased to `--f-*`/`--nl-*` so it never collides). Dark via `:root[data-theme="dark"]`.
- **Data is reused, never re-invented:** `../data.js` (SERVICES, SECTIONS, PRICING,
  RECENT_CASES, KPIS, getAdvisories, fmt/fmtIQD) + `../final_branches_data.js` (BRANCHES,
  MAHALLA_INDEX, BRANCH_MAP, BRANCH_STATS).
- **Files:** `tokens.css` (core) · `system.css` (components, class prefix `.at-`) ·
  `icons.js` (bespoke domain SVG icons, `window.AtelierIcons`) · `art.js` (illustration
  tiers spot3d/lineMesh/iso, `window.AtelierArt`) · `app.js` (vanilla renderer + router +
  pure helpers on `window.AtelierHelpers`) · `index.html` (loads icons→art→app).
- **Icons:** Material Symbols `.ms` (wght 300 monoline) is the workhorse; bespoke
  `AtelierIcons` for featured bento / accordion / dock brand. **Never emoji.**

## Non-negotiable guardrails (anti-slop)
- **Tokens only** — no raw hex/px accents outside `tokens.css`.
- **Logical properties only** — `inline/block`, `inset-inline-start`… never `left/right`.
- Depth = `--at-hairline` inset + indigo soft `--at-lift` (light) / glow (dark). No flat grey shadows.
- `tnum` + slashed-zero on all numerals/IDs/money. Mono **eyebrow** for structural labels.
- One action colour (indigo); section hue 1:1 per domain; gold ceremonial-only; crimson urgent/lead.
- Motion: `transform/opacity/filter/color` only; damped spring `--at-spring` (≤6% overshoot);
  exit faster than enter; **honour `prefers-reduced-motion`**.
- Headline emphasis on Arabic = **colour/weight contrast, never serif-italic** (design.md §2).
- One signature per screen. Glass on chrome only, kept readable (surface ≥ 72%).

## Skills to activate (in repo: `.agents/skills/`, `.kiro/skills/`)
`refero-design` (any UI) · `frontend-design` · `design-taste-frontend` · `impeccable`
(slop detector — `npx impeccable detect <path>` should return `[]`) · `animate` &
`design-motion-principles` (motion) · `creative-fx` (gradient/glass/grain/kinetic refs) ·
`ui-ux-pro-max` (styles/palettes search) · `handoff` (this brief follows it).

## Component base (external sources → native rebuilds)
External UI sources (21st.dev/shadcn) are **never installed** (no-build vanilla project). They are
curated and rebuilt on `--at-*` per `design.md §10`. The adopted base + verdicts + rebuild specs live in
`.kiro/steering/component-library.md` (manual) — **read it before building any new primitive**. Built so
far from that base: `.at-copy` (copy mono refs) and `.at-announce` (announcement bar §6.3b).

## Inspiration sources (extract the *principle*, rebuild on tokens — never copy)
Apple Liquid Glass · Vercel (crisp mono) · Origin (lit-window cards) · Seed (lift-by-colour) ·
Notion (calm density) · gradientbuttons.colorion (tonal CTA) · backgrounds.supply (grain/mesh) ·
neuform (telemetry/accordion) · designmd.supply (swatch-trio) · getdesign.md (directory table) ·
coverflow + open-design (draughtsman framing). See `design.md` §10/§18 + `creative-fx/references/`.

## Visual-feedback loop
Reference screenshots live in `screenshots/` (25 imgs) and the inspiration dossier in `design.md`.
When judging aesthetics: change small → screenshot → compare → repeat (don't value-check alone).

## What's built (status)
Home is complete: liquid-glass **dock** (signature) · **«المنضدة» concierge** (intent bar routing
services/branches/mahallas/cases/fees, ⌘K) · **golden-hour sunline** (workday 08:00→16:00) ·
**featured lit-window bento** (3D-spot + bespoke icons) · unified **Ledger** stream · domain
**accordion** · quick-access (fav/recent/most, localStorage) · **gilt seal** · tips + notifications ·
extension slots (Vercel/Notion/Figma/Skills). Tabs: services directory / branches / fees /
complaints / requests / updates. World-class button vocabulary + bespoke animated icons + gradients.
**Core work loop done:** service **form flow** (connected vertical stepper §6.6, 3 steps:
subscriber → details → review-with-advisories) → **gilt receipt** (§6.7: drawn gold seal settling on
a damped spring, mono `tnum` reference, circular-check summary, ceremonial download). Wired via
`openService(code)` → `state.form` → submit → `state.receipt`; `go(tab)` clears them; host apps can
still override with `window.AtelierNav`. Screenshot analysis is documented in `atelier/VISUAL-FEEDBACK.md`.
**CA reports signature done:** the complaints/reports (CA) view now opens with the **dark telemetry
dashboard** (design.md §6.12) as its one signature — a deliberate **Indigo-Dusk island** (`.at-darkzone`
supplies the dark tokens in both themes), flat (no glass behind data), with a mono `tnum` **KPI strip**
(today / open / urgent / collected), a **four-domain distribution chart** in the section hues (never
rainbow), a scrollable **live feed** of real cases (status dot · mono ref · state · time) filterable by
**priority** (الكل/عاجل/قيادة/اعتيادي), and **one** crimson draughtsman connector on the URGENT metric.
Derived purely from `RECENT_CASES` + `KPIS` via `AtelierHelpers.caTelemetry` (self-checked); the old
standalone CA cases-table is folded into the feed. Quiet CA service cards sit beneath ("monitor, then file").
**Concierge intent compiler done:** «المنضدة» now compiles a full Arabic operator sentence into a
structured, pre-fillable request. `AtelierHelpers.parseIntent` (pure, self-checked vs real data) scores
an action from a verb-lexicon mapped to real service codes + name-token overlap, resolves a mahalla number
to its branch via `MAHALLA_INDEX` (32→4), and matches a type within the service's `TYPE_OPTS`. The desk
renders an "understood" read-back card (section-hued identity + mono chips: domain · branch · mahalla ·
type) with an indigo "ابدأ الطلب" that opens the stepper pre-filled via `openService(code, prefill)`. It
is the first keyboard option. Full skill-driven write-up + decision ledger in `atelier/VISUAL-FEEDBACK.md` §10.

## Next (small → big, per the build order)
1. Polish the small details first: focus states, tab/keyboard order, AA contrast in dark,
   skeleton loaders, empty/error states — then larger screens.
2. ~~Service **form flow** (connected stepper §6.6) → **gilt receipt** (§6.7)~~ — **DONE**.
3. Branch **mahalla map**, ~~**dark telemetry** dashboard for CA (§6.12)~~ **DONE**, Cover Flow onboarding (§6.8).
4. ~~Intent **parsing** in the concierge (full-sentence → pre-filled service+branch)~~ **DONE** (intent _compiler_).
5. Verify each change: `impeccable detect` → `[]`; logical-props/emoji scan; 375/768/1440;
   toggle dark; reduced-motion. Run JS via `env -u NODE_OPTIONS node --check`.

## Review / handoff
Work ships on branch **`feat/atelier-redesign`** → **PR #2**. A paste-ready continuation
prompt lives at `atelier/CONTINUE.md`. Push via the github power (never `git push` directly);
always to a branch + PR.
