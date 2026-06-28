---
name: inspiration-deck
description: Curated visual inspiration deck distilled from 25 professional web/product design screenshots in screenshots/. Each entry has an extractable pattern, USE / ADAPT / ALT-DIRECTION verdict (never REJECT — the design system is open to rebuild), and Tadfuq Al-Khayr mapping. Activate when designing a screen, picking a layout pattern, choosing between motion/depth/gradient approaches, or sourcing visual ideas. Covers KPI rows, sidebar nav, comments threads, gradient orbs, connector lines, neumorphic surfaces, frosted CTAs, pinned-paper cards, comparison frames, and 18 cross-cutting principles. Companion to creative-fx (effects), design-references (sources), and frontend-design.
---

> **POLICY (per [[feedback-no-design-rejects]]):** No pattern in this deck is REJECTED.
> Verdicts are:
> - **USE** — fits the current brand snapshot directly.
> - **ADAPT** — needs token / palette / RTL transformation (described inline).
> - **ALT-DIRECTION** — would shift the brand register (toward consumer-toy / neumorphism / NFT-dark / monospace-techy / etc.). Valid candidate if a new design system embraces that direction.
> The design system may be rebuilt — every pattern stays on the table.

# inspiration-deck — Visual Pattern Library

> ACTIVATION: choosing a layout, hero, card style, nav pattern, dashboard composition,
> comment thread, CTA surface, or motion/depth approach for Tadfuq Al-Khayr.
> Every entry references a real screenshot in `screenshots/<file>.jpg`.

## §0 — HOW TO USE

When designing any screen:
1. Scan §2 (per-image entries) for the closest functional match (dashboard? hero? card grid?).
2. Read the **Take / Reject** verdict — never paste a pattern wholesale.
3. Apply the **Tadfuq mapping** (RTL flip, brand tokens, dept color, Arabic-typography fit).
4. Pass through `creative-fx` and `design-references` GATES before committing.

## §1 — CROSS-CUTTING PRINCIPLES (extracted from all 25)

| # | Principle | Where it shows up | Take for Tadfuq |
|---|-----------|-------------------|-----------------|
| 1 | **Big bold display headline → 1-line gray subtitle → single CTA** | IMG12, IMG13, IMG15, IMG16 | YES — universal hero pattern. Use Arabic display weight (avoid extra-bold faux-bold). |
| 2 | **Soft off-white BG with floating cards** (not pure white) | IMG1, IMG2, IMG10, IMG15, IMG20, IMG21 | YES — `--c-canvas: oklch(98% 0.005 90)` warm off-white; cards on `--c-surface` slightly lighter. |
| 3 | **KPI row of 4-5 numbers + delta arrow** at top of dashboards | IMG2, IMG3, IMG16 | YES — admin "cases this week" overview. Arrow + color-coded delta (green up / coral down). |
| 4 | **3-pane app shell**: left list / center editor / right comments | IMG1 | YES — case detail page: list of cases / case body / discussion thread. |
| 5 | **Connector lines** through layouts (process / wiring / stepper) | IMG3 (workflow), IMG6 (wire trace), IMG9 (stepper), IMG23 (vertical) | YES — case timeline + dept-handoff visualization. Use `--c-line` thin stroke. |
| 6 | **Status color triad**: green=ok, amber=warn, coral=fail | IMG2 (delta), IMG7 (checkmark), IMG21 (clauses) | YES — case status flags. Use OKLCH equivalents to keep harmony with dept palette. |
| 7 | **Pill nav at top with centered logo + right CTA** | IMG12, IMG16, IMG18 | ADAPT — RTL: logo right, CTA left. Glass background. |
| 8 | **Sidebar nav: icons collapsed / labeled expanded, active = dark pill** | IMG2, IMG3 | YES — RTL-flipped to right side. Active state: `--c-navy` filled pill, white icon. |
| 9 | **Stat card delta with arrow + percentage** | IMG2, IMG3, IMG16 | YES — small grey label, big number, delta below in `--c-success` / `--c-danger`. |
| 10 | **Gradient orb card as feature anchor** (pure color, no content) | IMG17 | ADAPT — for "campaigns" or "initiatives" surface using dept-OKLCH gradients. |
| 11 | **Frosted/glass CTA banner with bottom glow** | IMG11, IMG13 | ADAPT — final-call sections ("تبرّع الآن" / "سجّل"). Glow in `--c-gold`. |
| 12 | **Comparison frame** (A vs B side-by-side) | IMG5, IMG8, IMG14, IMG18, IMG24 | YES — "before / after" case states, plan comparisons, theme toggles. |
| 13 | **Mini-mockup illustration inside feature card** | IMG10, IMG18, IMG20 | ADAPT — use actual project screenshots scaled small inside feature cards. |
| 14 | **Comments / reactions column** (emoji counts + reply) | IMG1 | YES — case discussion thread. Reactions: ✓ مفيد / ❤️ أتفق / 🔥 عاجل. |
| 15 | **Workflow step card with "X days" gap pill between** | IMG3 | YES — case timeline between handoffs ("بعد ٣ أيام تم التحويل لقسم..."). |
| 16 | **3D illustrated cards for differentiation** | IMG4, IMG22 | ALT-DIRECTION — shifts register toward consumer-product. Valid candidate if new system embraces 3D illustration as a signature device. |
| 17 | **Dark monospace "technical/data" register** | IMG6, IMG7 | ALT-DIRECTION — shifts register toward data-protocol/dev-tool aesthetic. Note: pair with Arabic font that has good mono companion (e.g., IBM Plex). |
| 18 | **Neumorphic radio/3D spheres for selection** | IMG23, IMG24 | ALT-DIRECTION — shifts register toward soft-skeuomorphic. Valid if the new system uses neumorphism as a coherent surface language. |

## §2 — PER-IMAGE ENTRIES

### IMG1 — `screenshots/20260625_203518.jpg` — Form builder 3-pane shell
**Pattern:** SaaS app with left card-list, center form-block editor, right comment thread with emoji reactions (heart, thumb, fire, ✓ counts).
**Take:** 3-pane shell, comment thread with **reaction-count chips** (e.g., `❤️ 2  👍 5  🔥 8  ✅ 2`), `Hide Reply` collapse pattern.
**Alt-direction:** generic gray neutral palette — current snapshot uses warm off-white, but a cool-neutral redesign is on the table.
**Tadfuq map:** case-detail page = list of dept cases (right pane, RTL) / case body (center) / community-comments (left pane). Reaction chips: ✓ مفيد / ❤️ أتفق / 🔥 عاجل.

### IMG2 — `screenshots/20260625_203520.jpg` — Deals analytics dashboard
**Pattern:** Left sidebar (icon+label) → top KPI row of 5 cards (Total deals / Win rate / Total amount / Total weight / Avg sales cycle) with arrow-delta → 3 chart cards row (bar / line / horizontal box).
**Take:** the exact **KPI-row + chart-row** dashboard skeleton. Mint accent for "Execute with AI" dark pill CTA.
**Alt-direction:** mint as primary brand color — current snapshot uses navy + gold; mint-primary is a candidate for a refreshed system targeting calm/wellness register.
**Tadfuq map:** `/admin/dashboard` — KPI row: قضايا جديدة / مغلقة / متأخّرة / متوسط زمن الإغلاق / رضا المراجع. Chart row: حجم القضايا شهريًا / توزيع حسب القسم / متوسط زمن المعالجة.

### IMG3 — `screenshots/20260625_203521.jpg` — Email campaign workflow
**Pattern:** Sidebar → top KPI row (Total/Not started/Active/Complete/Opened) → vertical workflow: step card with title + "New thread" tag, then "3 days" gap pill, then next step card. Side-mini stats per step.
**Take:** the **gap-pill between sequential steps** (e.g., `⏱ 3 days`) — perfect for showing time-passage in a case timeline. Per-step stats column on the right.
**Alt-direction:** orange brand — saturated/energetic register; candidate if new system wants high-urgency feel.
**Tadfuq map:** case progression timeline. "تم استلام البلاغ → [بعد ٢٤ ساعة] → تحويل للقسم → [٣ أيام] → بدء المعالجة".

### IMG4 — `screenshots/20260625_203605.jpg` — 3D feature cards on dark
**Pattern:** Wordmark + small partner-logos strip → two large dark cards in slight 3D perspective, each with a glossy 3D icon (lime green for one, white for the other), inset mini-mockup, large title.
**Take:** the **3-card numbered feature row** below ("01 / 02 / 03" labels). The dark-card on light-canvas contrast.
**Alt-direction:** lime green spotlight + perspective tilt — NFT/Web3-adjacent register. Candidate if a futuristic/tech-forward redesign is chosen.
**Tadfuq map:** landing page "كيف يعمل تدفّق الخير" — 3 dark cards numbered ١ / ٢ / ٣ with inline icon (from ItsHover) + title + 1-line description. Flat, no 3D tilt.

### IMG5 — `screenshots/20260625_204128.jpg` — A/B mobile mockup comparison
**Pattern:** Two iPhone frames labeled "Vibe code" vs "Revamp" comparing wellness app. Left: small mint ring chart. Right: oversized purple ring chart.
**Take:** the **comparison-frame device** for showing "before / after" screen redesigns. Soft pastel ring chart with big % center.
**Alt-direction:** purple primary — outside current triad. Candidate for a softer/wellness-leaning redesign.
**Tadfuq map:** changelog / version-diff page for case-form layouts. Use navy ring + gold center number.

### IMG6 — `screenshots/20260625_204344.jpg` — Eigen Explorer dashboard (red state)
**Pattern:** Dark canvas, monospace headline "EigenExplorer - Explore and secure the ideas of tomo...", chart card tilted, **red wire** traces from chart down to a glowing red X dot. Floating icon-rail on left.
**Take:** the **traced connector wire** from a UI element to a status indicator. Strong visual cue.
**Alt-direction:** monospace + crypto-explorer dark aesthetic. Candidate if new system embraces a data/protocol register (works well with Arabic mono companions like IBM Plex Arabic Mono).
**Tadfuq map:** maybe a "live connection" indicator with thin gold wire from sidebar icon to status badge, but light-themed.

### IMG7 — `screenshots/20260625_204346.jpg` — Eigen Explorer (green state)
**Pattern:** Same layout as IMG6 but state flipped: white selected pill on "TVL", green wire to green ✓ checkmark.
**Take:** the **two-state pair** (red-fail / green-ok) for animating state transitions. Wire color swaps with status.
**Tadfuq map:** form submission state transition. Red wire = validation error, green wire = success.

### IMG8 — `screenshots/20260625_204418.jpg` — Nav variant exploration (v.1 / v.2 / v.3)
**Pattern:** Three rounded-pill nav variants stacked, each with active-item glow. v.1 = pill with green dot, v.2 = floating tab dip, v.3 = pill with subtle green dot under active.
**Take:** the **variant-exploration practice** itself — always design 3 nav variants before picking one. Active-state options: filled pill / dip / dot-underline.
**Alt-direction:** dark-only presentation — extend to light variants for a dual-theme system if needed.
**Tadfuq map:** when adding a new section nav (e.g., case-tabs: تفاصيل / مرفقات / مناقشة), explore 3 variants. Apply gold dot indicator on active.

### IMG9 — `screenshots/20260625_204535.jpg` — Onboarding checklist card
**Pattern:** Soft white card "Get Started" → 3 items with circle-checkboxes vertically connected by dotted line. Active item: filled pink circle with glow + bold title. User chip below.
**Take:** the **vertical dotted connector** between stepper items + the **glow on active circle**. Profile chip with plan tag.
**Alt-direction:** pink glow — current snapshot uses gold; pink glow is a candidate for a warmer/softer redesign.
**Tadfuq map:** new-employee onboarding modal: 1) أكمل ملفك → 2) فعّل التنبيهات → 3) جرّب أوّل بلاغ. Gold-glow on active step.

### IMG10 — `screenshots/20260625_204750.jpg` — Feature grid 2x3 with mini-mockups
**Pattern:** "Why Choose Us" pill badge → big headline → 2x3 grid of feature cards, each with purple-accent mini-mockup illustration + bold short title + 1-line description.
**Take:** the **2x3 feature grid** with mini-mockup illustrations inside each card (not stock 3D icons — actual product UI scaled).
**Alt-direction:** purple unified accent across all cards — current snapshot uses per-dept OKLCH variation; unified-accent is a valid candidate.
**Tadfuq map:** landing "لماذا تدفّق الخير؟" — 6 feature cards, each with a tiny app screenshot inside.

### IMG11 — `screenshots/20260625_204904.jpg` — Frosted pricing card with glow-CTA
**Pattern:** White frosted card, "AI Edge" + "POPULAR" star pill, blue checkmark list, big `$45` price (gradient dollar-sign), bottom-attached **blue gradient CTA bar with halo glow** spilling outside card.
**Take:** the **bottom-attached gradient CTA bar with external glow** — exceptional pattern for hero CTAs. Star "POPULAR" pill at top-right.
**Alt-direction:** blue brand — current snapshot would map to gold-gradient + crimson halo. Blue-primary remains a candidate for a tech/trust redesign.
**Tadfuq map:** "تبرّع الآن" page main CTA card. Gold gradient strip at bottom with subtle crimson glow halo.

### IMG12 — `screenshots/20260625_204948.jpg` — Hero "SHIP CLEAN CODE FASTER WITH CONFIDENCE"
**Pattern:** Pill nav top. Bold heavy display headline left (4-line stack), 1-line gray subtitle, single white CTA button. Right: code mockup card with action chips below ("Attach / Think / Search"). "Trusted by 4000+ startups" + logo strip at bottom.
**Take:** the **heavy stacked display headline** (Arabic equivalent needs careful weight tuning), the **action-chip strip below the mockup**, the trust strip.
**Alt-direction:** monospace display headline — current Arabic-first stack expects display serif/sans. Mono display is a candidate if paired with Arabic mono companion (IBM Plex Arabic Mono, MonoLisa Arabic).
**Tadfuq map:** landing hero: bold Arabic display ("صَوْتُكَ يَصِلُ، وَمَطْلَبُكَ يُنَفَّذُ") + small subtitle + gold CTA. Right: app mockup with chips ("بلاغ / متابعة / مناقشة").

### IMG13 — `screenshots/20260625_205052.jpg` — Frosted blue CTA banner + footer
**Pattern:** Big blue gradient banner "Ready to ditch the chaos?" with white pill CTA, **bottom glow halo** spilling onto canvas. Footer below: brand left, 3 link columns, newsletter form right with subscribe-pill.
**Take:** the **banner-with-bottom-glow** pattern (similar mechanism to IMG11). The **footer with inline newsletter pill** (input + button as one pill).
**Alt-direction:** blue gradient — current snapshot would map to navy→crimson or gold-solid+crimson-halo. Blue-gradient remains a candidate for a calmer/cooler redesign.
**Tadfuq map:** final-call section above footer. Navy→crimson banner with gold CTA + halo. Footer with `قائمة بريديّة` newsletter pill.

### IMG14 — `screenshots/20260625_205205.jpg` — Pricing card A/B (purple CTA vs white CTA)
**Pattern:** Same Pro pricing card twice on dotted-grid dark BG. Left has purple gradient "Get started" CTA. Right has solid white CTA. Otherwise identical.
**Take:** **CTA color A/B variant presentation** — useful when proposing pricing options to user.
**Tadfuq map:** when proposing a primary-CTA color, always show 2 variants on the same dark/light surface for the user to pick.

### IMG15 — `screenshots/20260625_205629.jpg` — "Calm productivity" landing with pinned-paper cards
**Pattern:** Mint-tinted hero with "New" badge, big serif-like headline with **inline calendar-icon between words** ("Calm 📆 productivity"), black-pill CTA. Below: 3 **skewed white paper cards with red push-pins** showing daily tasks / pomodoro / integrations.
**Take:** the **inline-icon-mid-headline** trick (visual rhythm break), the **pinned-paper-card aesthetic** for tactile/announcement surfaces.
**Alt-direction:** mint canvas — cool register; candidate for a wellness/calm-leaning redesign.
**Tadfuq map:** announcements page → pinned-paper cards (`خبر / إعلان / مناسبة`) on warm canvas. Inline-icon trick in section headers.

### IMG16 — `screenshots/20260625_205646.jpg` — "Turn Abandoned Carts" e-commerce landing
**Pattern:** Pill nav top, bold left-aligned headline + description right + dark CTA. Below: floating product cards arranged in arc, central isolated payment-card mockup. Bottom: 3 metric cards (`+31% / $12M+ / 4.9/5`) with labels.
**Take:** the **bottom 3-stat row** (big number + small label) — classic credibility strip. **Floating-cards-in-arc** layout (cards radiating outward from center).
**Alt-direction:** green CTA + checkout chrome — e-commerce register; candidate if the new system needs to communicate "fast action" via green.
**Tadfuq map:** about/impact page bottom stat strip: `+٣٢٪ سرعة الإنجاز / ١٢٫٤ ألف قضيّة / ٤٫٨ تقييم المراجعين`.

### IMG17 — `screenshots/20260625_205718.jpg` — Pure gradient orb cards
**Pattern:** 3 large rounded cards (1 wide top + 2 square bottom) with **pure blue-purple gradient orb fading to white**, bottom-left title + 1-line description, top-right white circular ↗ arrow icon.
**Take:** the **gradient-orb as full card surface** (no content image needed — color IS the visual). Tiny title+desc at bottom + arrow-button top-right.
**Tadfuq map:** "اقسام تدفّق الخير" surface — each dept gets a card whose gradient is the dept's OKLCH color radiating from one corner. Same arrow + title pattern.

### IMG18 — `screenshots/20260625_205730.jpg` — 6 feature cards with UI mockups (Contractflow)
**Pattern:** 6 soft cream cards in 3-row grid, each showing a mini-app mockup at top (toggle, alerts, workflow, repository box, alert list, contract diff) + bold title + 1-line description.
**Take:** the **6-card feature deep-dive** with mini-mockup at top of each. Same rhythm as IMG10 but mockups are more functional/detailed.
**Tadfuq map:** features page — 6 cards covering: تقديم بلاغ / متابعة قضيّة / تنبيهات / تحويل بين الأقسام / مكتبة الإجراءات / مقارنة الإصدارات.

### IMG19 — `screenshots/20260625_210202.jpg` — Dark cards with pure-gradient lower-half
**Pattern:** Two dark cards side-by-side, same "Start Working Smarter" content. Top half black with icon+title+subtitle, **bottom half pure radial gradient bleed** (purple-blue left / red-pink right) into a white CTA pill that sits half-on-gradient.
**Take:** the **dark-top / gradient-bottom split card** with CTA straddling the seam. Two-variant treatment for color exploration.
**Alt-direction:** pure decorative gradients without semantic meaning — current bias is toward meaningful color (dept-OKLCH). Decorative gradients are a candidate for purely emotional/marketing surfaces.
**Tadfuq map:** could work for "اختر مكان بلاغك" cards — dark top with dept name, gradient bottom in dept OKLCH color, CTA bridging.

### IMG20 — `screenshots/20260625_210204.jpg` — "Who it's for" persona cards
**Pattern:** Two dark cards: "Marketing Creators" (with grid of social-platform icon circles below) and "Freelance Developers" (with a 3D keyboard-keys illustration with red accent keys).
**Take:** the **persona-card with icon-grid signature** approach — icon grid TELLS who the persona is without prose.
**Alt-direction:** dark-only — extend to light theme if the system supports both modes.
**Tadfuq map:** "لمن تدفّق الخير؟" — cards for: مواطنون / موظفو الأقسام / مديرو الإدارات. Each card's icon-grid = the tools/contexts they use.

### IMG21 — `screenshots/20260625_210218.jpg` — Contract repository 3D card
**Pattern:** Soft cream square card. Center: isometric 3D illustration of a **file box with pink-purple folder protruding**, "Contractflow" stamp. Below box: search-input pill "Agreement for Acme" with cursor + "You" tooltip. Title + description below.
**Take:** the **search-input below a 3D illustration** with a faux cursor showing intent. The **"You" tooltip on cursor** is a charming demo device.
**Alt-direction:** isometric 3D folder illustration — consumer-product register; candidate if new system adopts isometric illustration as a coherent device.
**Tadfuq map:** demo section showing "كيف تبحث عن قضيّتك" — input with cursor + "أنت" tooltip. Use ItsHover icons instead of 3D illustration.

### IMG22 — `screenshots/20260625_210223.jpg` — Notification toggle with status list
**Pattern:** Card with toggle-pill header ("Contractflow" + green-checkmark switch), then list of 4 items: 2 green-scalloped ✓ (Confidentiality, Data Protection) and 2 coral-triangle ⚠ (Termination Clause Missing, Governing Law Missing). Title below.
**Take:** the **toggle-with-status-list-result** pattern. Status icons in scalloped circles (more friendly than circles). Mixed ✓/⚠ list for partial-completion state.
**Tadfuq map:** "تحقّق من قضيّتك" widget on case detail — toggle "تحقّق تلقائي" + list of validation results (مكتمل / مفقود).

### IMG23 — `screenshots/20260625_210425.jpg` — 4 3D-illustrated dark feature cards
**Pattern:** 2x2 grid of dark cards each with a small 3D illustration: cardboard box with cloud cubes / team-invite tree of avatars / file-sync card with progress / encrypted file transfer with lock icons.
**Take:** the **3D-illustration-as-card-anchor** approach for feature differentiation. Glowing blue tint for cohesion.
**Alt-direction:** 3D illustrations — consumer-product register; the 2x2 grid + per-card mini-illustration is universal, but the 3D rendering itself is a candidate that could anchor a more playful redesign.
**Tadfuq map:** ignore the 3D, take the **2x2 grid + ItsHover animated icon at top + tiny title + 1-line** structure. Tint per dept color.

### IMG24 — `screenshots/20260625_234741.jpg` — Neumorphic stepper
**Pattern:** Soft white card, vertical 3-step stepper. Active step: blue glossy sphere with ↑ icon "Choose Wallet" (bold). Future steps: pale gray sphere "$" and "?". Connector lines vertical.
**Take:** the **vertical stepper structure** (active sphere with icon + label, future steps muted).
**Alt-direction:** glossy neumorphic spheres — soft-skeuomorphic register; candidate if the new system commits to neumorphism as a coherent surface language across all controls.
**Tadfuq map:** case-submission stepper — replace spheres with **flat circles in navy/gray** + ItsHover-animated icon inside active step. Connector: thin `--c-line` stroke.

### IMG25 — `screenshots/20260625_234742.jpg` — Neumorphic plan picker
**Pattern:** White card "Choose your plan", segmented selector with two pills: "Basic / Personal" (gray sphere icon) and "Pro / Most popular" (blue sphere icon + "Best" yellow tag).
**Take:** the **segmented pill plan-selector** with mini-sphere indicator + "Best" yellow corner-tag.
**Alt-direction:** sphere/neumorphic icons — same note as IMG24; full-system commitment makes this coherent.
**Tadfuq map:** if/when account plans exist, use flat radio dots in `--c-navy` / `--c-gold` with "الأكثر طلبًا" corner-tag pill instead of "Best".

## §3 — DESIGN MOVES ALREADY ENCODED IN OTHER SKILLS

To avoid duplication:

| Pattern in screenshots | Already covered by | Notes |
|------------------------|---------------------|-------|
| Frosted glass surfaces (IMG11, IMG13) | `creative-fx` § liquid-glass | Use that skill's playbook, don't re-derive |
| Animated icons everywhere | `feedback-icon-source` memory + `vendor/itshover/` | Port .tsx → SVG, don't use static icons |
| Connector lines/wires (IMG6, IMG7, IMG9, IMG23) | NEW — this skill is the canonical reference | Add to `creative-fx/references/` if pattern proliferates |
| Gradient orbs (IMG17, IMG19) | `creative-fx` § backgrounds + this skill | Combine: orbs use backgrounds.supply technique |
| Comparison frames (IMG5, IMG8, IMG14, IMG18, IMG24) | `frontend-design` + this skill | Pattern itself is generic; brand-fit verdict lives here |

## §4 — TRADE-OFF DESCRIPTION GATE (not a reject gate)

Per [[feedback-no-design-rejects]] — never reject. Before borrowing, describe the tradeoff so the user can decide:

```
1. RTL/Arabic typography fit: does the pattern's type system have a viable Arabic companion?
   (If not — name the gap and propose a companion font.)
2. Color register: which register does this pattern signal? (civic-trust / wellness / tech /
   consumer-product / data-protocol / luxury / etc.) — name it explicitly.
3. Surface language: flat / glass / neumorphic / 3D-illustrated / paper-tactile?
   Note if it would need to propagate system-wide for coherence.
4. Tadfuq mapping: which real surface (case / dept / dashboard / hero / announcement)
   would host this? If none — flag as "pattern looking for a home".
5. GATES (creative-fx): tokens, RTL flip, A11y, Arabic content test — these are
   non-negotiable regardless of brand direction.
```

Output for the user: the pattern + its tradeoffs + which surface it suits. The user picks
the direction. ¬(pre-filtering for them).

## §5 — WHEN TO RE-SCAN THE DECK

Re-read this skill when:
- Starting a new screen/section design from scratch.
- User asks "what would [X site/brand] look like for Tadfuq?".
- Need a fresh hero/feature/CTA composition idea.
- Reviewing an existing screen against best-in-class references.

¬(re-reading mid-implementation — pattern selection happens BEFORE coding starts).
