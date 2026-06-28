---
# ───────────────────────────────────────────────────────────────────────────
# newlevel/DESIGN.md — "Tayyār / التيّار" (Current)
# A from-scratch visual language for Tadfuq Al-Khayr operations console.
# Authored 2026-06-28 synthesizing: refero-design (research+lock), design-md
# (grounded token contract), open-design (artifact loop + critique gate),
# impeccable (production craft + anti-slop bans), design-motion-principles
# (frequency-gated motion), creative-fx (one signature/screen), awesome-design-md
# (Linear/Stripe discipline borrowed, not copied).
# Namespace: --nl-*  (never collides with --ms-* Mirsad or --f-* Civic Atelier).
# This DOES NOT replace /design.md or /redesign/DESIGN.md — it is a third, parallel
# direction living entirely under newlevel/.
# ───────────────────────────────────────────────────────────────────────────
version: v1
name: Tayyar — Tadfuq Al-Khayr (newlevel)
description: >
  A charged operations console for an Arabic-first (RTL) electricity subscriber-
  services platform. The interface rests in calm cool graphite; energy — action,
  the in-progress path, focus, live cases — is the only thing rendered in live
  copper, the literal material of conduction. Structure is drawn with hairline
  conductor rails, not boxes. One live signal per screen. Dual-theme, light is the
  daylight workhorse, dark is calm graphite (never OLED black).

colors:
  # canonical
  primary:    "oklch(0.53 0.142 48)"   # Live Copper — the only action/signal color
  neutral:    "oklch(0.985 0.003 230)" # cool architectural off-white (NOT cream)
  # light — cool neutral ladder
  bg:         "oklch(0.985 0.003 230)"
  bg-2:       "oklch(0.965 0.004 230)"
  surface:    "oklch(1 0 0)"
  surface-2:  "oklch(0.975 0.004 230)"
  surface-3:  "oklch(0.952 0.006 235)"
  border:     "oklch(0.905 0.006 235)"
  border-2:   "oklch(0.84 0.008 240)"
  ink:        "oklch(0.24 0.014 255)"
  ink-2:      "oklch(0.44 0.013 255)"
  ink-3:      "oklch(0.585 0.013 255)"
  # accent — live copper
  copper:        "oklch(0.53 0.142 48)"  # primary fill (AA white text), active, links
  copper-bright: "oklch(0.62 0.15 52)"   # focus ring, live rail, glow
  copper-soft:   "oklch(0.93 0.04 60)"   # tint wash (≤ this alpha), hover fill
  on-accent:     "oklch(0.99 0.004 60)"
  # semantic (status only — never fills)
  ok:   "oklch(0.58 0.12 150)"
  warn: "oklch(0.74 0.135 85)"
  err:  "oklch(0.55 0.18 25)"
  # domain hues — CS/CT/CB/CA, one perceived weight, ≤0.14 chroma, distinct from copper
  section-cs: "oklch(0.55 0.13 260)"   # Subscriptions — Cobalt
  section-ct: "oklch(0.62 0.10 200)"   # Technical     — Teal
  section-cb: "oklch(0.60 0.11 150)"   # Billing       — Green
  section-ca: "oklch(0.55 0.14 18)"    # Complaints    — Rosewood
  # dark — calm graphite (cool, lifted, never black)
  dark-bg:        "oklch(0.19 0.014 255)"
  dark-bg-2:      "oklch(0.215 0.015 255)"
  dark-surface:   "oklch(0.245 0.016 255)"
  dark-surface-2: "oklch(0.275 0.017 255)"
  dark-surface-3: "oklch(0.31 0.018 255)"
  dark-border:    "oklch(0.34 0.018 255)"
  dark-border-2:  "oklch(0.42 0.02 255)"
  dark-ink:       "oklch(0.93 0.006 250)"
  dark-ink-2:     "oklch(0.76 0.01 250)"
  dark-ink-3:     "oklch(0.60 0.012 250)"
  dark-copper:        "oklch(0.70 0.14 54)"
  dark-copper-bright: "oklch(0.78 0.145 56)"
  dark-on-accent:     "oklch(0.19 0.014 255)"

typography:
  display:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: "clamp(2.1rem, 5vw, 3.3rem)"
    fontWeight: 700
    lineHeight: "1.08"
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: "clamp(1.6rem, 3vw, 2.1rem)"
    fontWeight: 700
    lineHeight: "1.15"
  h2:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 1.35rem
    fontWeight: 600
    lineHeight: "1.25"
  body:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: "1.6"
  caption:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: "1.45"
  label:
    fontFamily: JetBrains Mono, ui-monospace, monospace
    fontSize: 0.6875rem
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.08em"
  mono:
    fontFamily: JetBrains Mono, ui-monospace, monospace
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: "1.5"
    fontFeature: "tnum, zero"

rounded:
  sm:   6px
  md:   10px
  lg:   14px
  xl:   20px
  pill: 999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "8": 32px
  "10": 40px
  "12": 48px
  "16": 64px

components:
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  kpi:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  table:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
---

# Tayyār — Tadfuq Al-Khayr (newlevel)
> a charged operations console — calm graphite at rest, live copper where the current runs.

**Theme:** dual (light primary / dark calm-graphite) · **Direction:** RTL-first (Arabic), LTR-safe · **Density:** comfortable → cockpit

## 0 · North star
The platform runs an electricity distribution network: staff open, route, and resolve
subscriber requests across four domains — Subscriptions (CS), Technical (CT), Billing (CB),
Complaints & Reports (CA). The job is dense and repetitive, so the interface must **disappear
under work** and **stay calm across long shifts**, while remaining unmistakably engineered.

Five principles govern everything:
1. **Current is the signal.** A single live copper is the only action/energy color — primary
   actions, active states, focus, links, live cases, and the conductor rail. Everything dormant
   rests in graphite. Copper is never decoration.
2. **Structure you can read.** Mono labels mark IDs, codes, and steps; numerals are tabular
   (`tnum`) with slashed zero (`zero`) so columns align and `0` never reads as `O`.
3. **Elevation by light, not shadow.** Depth = hairline inset strokes + a soft copper-tinted
   ambient shadow (light) or a faint glow + surface-step (dark). Prefer stepping up the surface
   ladder before reaching for a shadow. Never heavy gray boxes.
4. **One signature per screen — the live conductor rail.** A hairline along the active path
   (active tab → in-progress / urgent case row) is the single thing rendered in copper, with an
   optional slow current shimmer. If two elements compete for the eye, cut the weaker.
5. **RTL-native, dual-theme parity.** Logical properties only; both themes hold identical
   hierarchy and AA contrast. Reduced-motion is honored everywhere.

## 1 · Color
Two cool-neutral ladders (one per theme) + one live-copper accent + three status colors + four
domain hues. Neutrals do ~90% of the work.
- **Light canvas** is a cool architectural off-white `oklch(0.985 0.003 230)` — deliberately
  *not* cream/ivory/sand (the 2026 AI default). **Dark canvas** is cool graphite
  `oklch(0.19 0.014 255)` — lifted, never OLED black, never navy.
- **Live copper** `oklch(0.53 0.142 48)` (light) / `oklch(0.70 0.14 54)` (dark) is the only
  first-class accent. It fills primary buttons (white text in light, dark text in dark), and
  marks active tabs, focus rings, links, live dots, and the conductor rail.
- **Status** (`ok`/`warn`/`err`) appears only on badges, deltas, and feed dots — never as fills.
  `warn` (amber-yellow, hue 85) is kept hue-separated from copper (orange, hue 48).
- **Domain hues** are 1:1 with the four domains, bound per-surface via `--nl-seg` (dot, code
  label, icon tile, active category). Never reuse a domain hue outside its domain.

> **Why copper.** This is an electricity utility. Copper is the literal material of conduction —
> grounded, ownable, and far from the blue/indigo and AI-purple defaults. Cool graphite lowers
> long-session eye strain; the rationed copper reads as *charged*, not decorated.

## 2 · Typography
**One family does everything:** **Readex Pro** — native Arabic *and* Latin, modern, RTL-perfect —
for display, headings, UI, and body across a weight range (400/500/600/700). **JetBrains Mono**
(Latin) carries structure: request IDs, case numbers, KPI numerals, timestamps, domain codes, and
the wide-tracked mono `label`. **Banned:** Inter / Roboto / Arial.
- Numerals are tabular (`tnum`) everywhere data lives; IDs also enable slashed zero (`zero`).
- Tracking tightens as size grows (`-0.02em` display → `0` body); **never** negative tracking on
  Arabic. The mono `label` is the only positively-tracked element (Latin only).
- No decorative serif-italic word swap (current AI-slop tell). No gradient-on-text, ever.

## 3 · Layout & spacing
- Base 4px. Scale `4·8·12·16·20·24·32·40·48·64`.
- App-shell max-width **1440px**. Top bar 60px, sticky.
- **Logical properties only** — `margin-inline`, `padding-block`, `inset-inline-*`,
  `border-start-*`. Never `left`/`right`.
- Overview IA in three tiers expressed through *structure* (spacing, scale, separators), not
  color: Tier 1 orient + primary action → Tier 2 KPI strip over a 1.7fr work-table / 1fr
  quick-start aside → Tier 3 ambient activity feed, demoted by a border-top + scale step-down.
- Touch targets ≥ 44px. Focus ring = 2px `copper-bright` + 2px offset.
- Responsive: 375 / 768 / 1024 / 1440. Grid stacks under 980px; table scrolls inline on mobile.

## 4 · Elevation
- **Hairline:** `inset 0 0 0 1px var(--nl-border)` — base definition on every surface.
- **Lift (light):** `0 1px 2px rgba(20,18,16,.05), 0 10px 26px -16px rgba(150,80,30,.20)` — copper-tinted.
- **Lift (dark):** `0 0 0 1px rgba(0,0,0,.4), 0 14px 36px -18px rgba(0,0,0,.65)` + surface-step + faint top sheen.
- Prefer raising an element one step up the surface ladder (`bg → surface → surface-2 → surface-3`)
  before adding a shadow. Never heavy gray/black drop shadows; never stack shadows to fake importance.

## 5 · Shape & motion
- Radius: `sm 6 · md 10 · lg 14 · xl 20 · pill 999`. Cards `lg`; inputs/buttons `md`; tabs/tags/avatars `pill`.
- Motion tokens: `--nl-ease` (standard), `--nl-ease-out` (entrance, exponential); durations micro 160 / enter 260 / exit 180 (exit faster).
- Animate **only** `transform`, `opacity`, `box-shadow`, `filter`, `color`. Never layout properties.
- Motion lens: SaaS dashboard → Emil primary (≤180ms on frequent interactions, keyboard never
  animates), Jakub secondary (polish), Jhey only for empty states.
- **The conductor shimmer** (copper highlight traveling along the active rail) is ambient/rare,
  ~6s loop, and fully disabled under `prefers-reduced-motion`.
- `prefers-reduced-motion: reduce` collapses all entrance/choreography to a 1-frame swap. Non-negotiable.

## 6 · Components (built in `system.css`)
- **Buttons** — primary (copper fill, `md`, white/dark text per theme, soft lift, max one per
  viewport), ghost (1px `border-2`), quiet (text-only). `:active` nudges 1px.
- **Top bar** — sticky, brand lockup inline-start (copper current-mark + wordmark + mono `OPS`),
  domain tabs (segmented pill; active = surface + hairline + copper rail underline + domain dot),
  actions inline-end (search, theme toggle, bell with copper dot, user monogram).
- **KPI** — `tnum` number, caption label, delta arrow colored by *meaning* (overdue↑ = err, closed↑ = ok),
  optional tiny copper trend mark. Flat neutral; never the gradient hero-metric cliché.
- **Work table** — flat and quiet: `surface-2` sticky header, hairline row dividers, `surface-3`
  hover tint, mono refs, domain dot+code, status badge, `tnum` fee, mono age, monogram + name.
  In-progress / urgent rows carry the **live conductor rail** (copper) on the inline-start edge —
  the one signature. No other effects on tables.
- **Status badge** — pill, tinted by status (`new`→copper-tint, `prog`→warn, `wait`→neutral,
  `late`→err, `done`→ok); 6px dot.
- **Quick-start card** — domain icon tile (`--nl-seg` tint) + name + mono open count + chevron;
  hover = lift + 1px rise + copper chevron. No side-stripe border.
- **Activity feed** — status dot + mono ref + line + mono timestamp; the ambient tier.

## 7 · Iconography
SVG monoline at ~1.6px stroke, `currentColor`, never emoji. RTL-flip directional glyphs
(chevron/arrow) under `[dir="rtl"]`. Domain icons live in their `--nl-seg` tile only.

## 8 · Do / Don't
**Do** — copper for action/active/live only; mono+`tnum` for all data/IDs; elevation by hairline +
light; one signature (the rail) per screen; domain hue 1:1 via `--nl-seg`; logical RTL properties;
both themes from the start; honor reduced-motion.

**Don't** — no second accent color; no cream/ivory/sand canvas; no AI-purple/gradient-on-text; no
heavy/black drop shadows; no emoji icons; no Inter/Roboto/Arial; no physical `left`/`right`; no
side-stripe (>1px colored) card borders; no effects on tables/forms; no tiny-uppercase eyebrow on
every section; no 01/02/03 numbered scaffolding; no em-dash (use hyphen or restructure).

## 9 · Known gaps (design-md grounding)
- Copper fill contrast vs white text is tuned to land ≥4.5:1 in light; verify in-browser and
  nudge `copper` darker if borderline (SUPPORTED by build QA, not yet hardware-calibrated).
- Service-flow surfaces (card → stepper → form → receipt), admin, and public landing are NOT yet
  built in this direction — they extend this token layer; never introduce raw hex/px outside it.
- Production icon set is a placeholder monoline sprite; swap for the project's chosen library later.
