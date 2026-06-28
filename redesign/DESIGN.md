---
# ───────────────────────────────────────────────────────────────────────────
# DESIGN.md — Mirsad · Tadfuq Al-Khayr operations system (v0, from scratch)
# Spec: google-labs/design.md (YAML front matter + markdown rationale).
# Validate: npx @google/design.md lint redesign/DESIGN.md
# Supersedes the legacy "Civic Atelier" design.md (warm indigo/gold) — this is
# a deliberately different visual language chosen 2026-06-28.
# ───────────────────────────────────────────────────────────────────────────
version: v0
name: Mirsad — Tadfuq Al-Khayr
description: >
  Instrument panel for civic services. A cool-graphite, dual-theme operations
  system for an Arabic-first (RTL) subscriber-services platform. One azure
  signal is the only action color; structure is made legible through mono
  labels and tabular numerals; depth comes from light (hairlines + surface
  ladder), never heavy shadow. Calm under dense work, precise when it matters.

colors:
  # canonical keys
  primary:    "#1F5FF0"   # Azure — the only first-class action color
  neutral:    "#F6F7F9"   # cool paper canvas (light)
  # light — cool neutral ladder
  bg:         "#F6F7F9"
  bg-2:       "#EEF1F5"
  surface:    "#FFFFFF"
  surface-2:  "#F8FAFC"
  surface-3:  "#F0F3F7"
  border:     "#E3E7EE"
  border-2:   "#CBD3DE"
  ink:        "#14181F"
  ink-2:      "#454C58"
  ink-3:      "#79828F"
  # accent
  azure:      "#1F5FF0"
  azure-soft: "#4F82F5"
  azure-ink:  "#1A4FC4"
  on-accent:  "#FFFFFF"
  # semantic (status only)
  ok:         "#1E9E6A"
  warn:       "#C0801A"
  err:        "#D33A3A"
  # domain hues — CS/CT/CB/CA (OKLCH, cool-harmonized, one perceived weight)
  section-cs: "oklch(0.58 0.13 252)"   # Subscriptions — Indigo-blue
  section-ct: "oklch(0.64 0.12 205)"   # Technical     — Cyan-teal
  section-cb: "oklch(0.66 0.13 152)"   # Billing       — Green
  section-ca: "oklch(0.62 0.15 26)"    # Complaints    — Coral
  # dark — cool graphite (not navy, not OLED black)
  dark-bg:        "#0E1117"
  dark-bg-2:      "#12161E"
  dark-surface:   "#171C26"
  dark-surface-2: "#1D2330"
  dark-surface-3: "#232B3A"
  dark-border:    "#2A3342"
  dark-border-2:  "#3B4656"
  dark-ink:       "#E7EAF0"
  dark-ink-2:     "#AAB3C1"
  dark-ink-3:     "#727C8C"
  dark-azure:     "#5B8DFF"
  dark-ok:        "#37C98C"
  dark-warn:      "#E6A93C"
  dark-err:       "#F2655F"

typography:
  display:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 2.6rem
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "-0.01em"
  h1:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 2rem
    fontWeight: 600
    lineHeight: "1.18"
  h2:
    fontFamily: Readex Pro, system-ui, sans-serif
    fontSize: 1.25rem
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
  eyebrow:
    fontFamily: JetBrains Mono, ui-monospace, monospace
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: "1.2"
    letterSpacing: "0.14em"
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
  xl:   18px
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
    backgroundColor: "{colors.azure}"
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

# Mirsad — Tadfuq Al-Khayr operations system
> instrument panel for civic services — cool graphite, one azure signal, structure you can read.

**Theme:** dual (light + dark) · **Direction:** RTL-first (Arabic), LTR-safe · **Density:** comfortable→cockpit

> **What this is.** A from-scratch visual language for the Tadfuq Al-Khayr subscriber-services
> operations platform, chosen 2026-06-28 to replace the legacy warm "Civic Atelier" system. It is
> deliberately *cool, precise, and instrument-grade* — built for staff who work dense queues for
> hours. The YAML front matter is the normative token layer; `redesign/system.css` is the runtime
> implementation (`--ms-*`); `redesign/overview.html` is the reference App-shell + Overview build.

## 0 · North star

The platform is an **operations console**: staff open, route, and resolve subscriber requests across
four domains (Subscriptions·CS, Technical·CT, Billing·CB, Complaints·CA). The interface must
**disappear under dense work** and stay **calm for long shifts**, while remaining unmistakably
considered.

Five principles govern everything:

1. **One signal per screen.** A single azure is the only action color. One primary CTA per viewport.
   Everything else is ghost, neutral, or status.
2. **Structure you can read.** Mono labels mark IDs, zones, and steps; numerals are tabular (`tnum`)
   and use slashed zero (`zero`) so columns align and `0` never reads as `O`.
3. **Elevation by light, not shadow.** Depth = hairline inset strokes + a soft azure-tinted ambient
   shadow (light) or a faint glow + surface-step (dark). Never heavy gray boxes.
4. **Calm density.** Operational surfaces (tables, forms, flows) are quiet and effect-free. Motion is
   reserved for orientation and feedback, never decoration.
5. **RTL-native, dual-theme parity.** Logical properties only; both themes maintain identical
   hierarchy and AA contrast.

## 1 · Color

Two cool-neutral ladders (one per theme) + one azure accent + three status colors + four domain hues.
Neutrals do ~90% of the work.

- **Light canvas** is a cool paper `#F6F7F9` (deliberately *not* warm). **Dark canvas** is cool
  graphite `#0E1117` — lifted, never OLED black, never navy.
- **Azure `#1F5FF0`** (light) / `#5B8DFF` (dark) is the only first-class action color: primary
  buttons, active states, focus ring, links. Never decorative.
- **Status** (`ok`/`warn`/`err`) appears only on badges, deltas, and feed dots — never as fills.
- **Domain hues** are 1:1 with the four service domains, bound per-surface via a local `--seg`
  custom property (dot, code label, card edge, icon tile, active tab). Do not reuse a domain hue
  outside its domain. Dark-mode values lift L to ~0.74–0.80 to stay readable on graphite.

> **Why cool + azure.** This is infrastructure (utility/subscriber services). Cool graphite lowers
> long-session eye fatigue; a single confident azure reads as dependable and modern. The discipline
> of one accent is what reads as engineered rather than decorated.

## 2 · Typography

**One family does everything** (Dia's lesson): **Readex Pro** — native Arabic *and* Latin, modern,
RTL-perfect — for display, headings, UI, and body. **JetBrains Mono** carries structure: request IDs,
case numbers, KPI numerals, timestamps, and eyebrow labels. **Banned:** Inter / Roboto / Arial as
defaults (they read as unconsidered).

- Numerals are tabular everywhere data lives. Reference numbers also enable slashed zero.
- The **eyebrow** is a signature: mono, uppercase, wide-tracked (`+0.14em`) for Latin; for Arabic it
  keeps the *role* (a structure marker) but switches mechanics to **weight 600, normal tracking**
  (Arabic takes neither caps nor wide Latin tracking).
- Tracking tightens slightly as display size grows; never apply negative tracking to Arabic body.

## 3 · Layout & spacing

- Base unit 4px. Scale `4·8·12·16·20·24·32·40·48·64`.
- App-shell max-width **1480px** (dense). Top bar height 60px, sticky, glass.
- **Logical properties only** — `margin-inline`, `padding-block`, `inset-inline-*`, `border-start-*`.
  Never `left`/`right`. This is what makes RTL "just work."
- Overview uses a **3-tier information architecture**, where weight is expressed through *structure*
  (spacing, scale, separators), not color: Tier 1 orient + primary action → Tier 2 act & monitor
  (KPI strip over a 1.7fr work-table / 1fr quick-start aside) → Tier 3 ambient feed, demoted by a
  border-top and a step-down in scale.
- Touch targets ≥ 44px. Focus ring = 3px azure at 34% (42% in dark).

## 4 · Elevation

- **Hairline:** `inset 0 0 0 1px border` — the base definition on every surface.
- **Lift (light):** `0 1px 2px rgba(20,24,30,.04), 0 8px 22px -14px rgba(31,95,240,.16)` — azure-tinted.
- **Lift (dark):** `0 0 0 1px rgba(91,141,255,.08), 0 12px 34px -18px rgba(0,0,0,.6)` + surface-step.
- Prefer raising an element **one step up the surface ladder** (`bg → surface → surface-2 → surface-3`)
  before reaching for a shadow. Never heavy gray/black drop shadows; never stack shadows to fake
  importance — importance comes from the one signal.

## 5 · Shape & motion

- Radius: `sm 6 · md 10 · lg 14 · xl 18 · pill 999`. Cards `lg`; inputs/buttons `md`; tabs/tags/avatars
  `pill`. One radius family per component cluster.
- Motion tokens: `--ms-ease`, `--ms-ease-out`; durations micro 160 / enter 260 / exit 180 (exit faster).
- Animate **only** `transform`, `opacity`, `box-shadow`, `color`. Never layout properties.
- `prefers-reduced-motion: reduce` collapses all entrance/choreography to a 1-frame swap (authoritative
  `!important` guard in `system.css`). Non-negotiable.

## 6 · Components (built in `system.css`)

- **Buttons** — primary (azure fill, `md`, soft lift, max one per viewport), ghost (1px `border-2`),
  pill variant for nav/marketing. `:active` nudges 1px.
- **Top bar** — sticky glass (`blur(20px) saturate(150%)`, surface ≥ 70% so it stays readable in
  light), brand lockup inline-start, domain tabs (segmented pill, active = surface + hairline, dot in
  `--seg`), actions inline-end (search, theme toggle, bell, user monogram).
- **KPI** — `tnum` number, caption label, delta with arrow colored by *meaning* (overdue↑ = err,
  closed↑ = ok). Flat neutral for pure counts.
- **Table** — flat and quiet: `surface-2` sticky header, hairline row dividers, `surface-3` hover tint,
  mono refs, domain dot+code, status badge, mono age, monogram + name. No effects.
- **Status badge** — pill, tinted by status (`new` azure, `prog` warn, `wait` neutral, `late` err,
  `done` ok); 6px dot.
- **Quick-start card** — `--seg` inline-start edge + tinted icon tile, name + mono count, chevron;
  hover = lift + 1px rise.
- **Activity feed** — status dot + mono ref + line + mono timestamp; the ambient tier.
- **Announcement** — one azure-washed band, scarcity moment, one inline link. Never permanent chrome.

## 7 · Iconography

SVG monoline at ~1.6px stroke, `currentColor`, never emoji. Production source is **ItsHover**
(`vendor/itshover/`, Apache-2.0) — port the `.tsx` to inline SVG and re-color to `currentColor`;
RTL-flip directional glyphs (`chevron`, `arrow`) under `[dir="rtl"]`. The demo sprite in
`overview.html` is a minimal placeholder set in the same stroke language.

## 8 · Do / Don't

**Do** — single azure action; mono+`tnum` for all data/IDs; elevation by hairline + light; one signal
per screen; domain hue 1:1 via `--seg`; logical RTL properties; both themes from the start; honor
reduced-motion.

**Don't** — no second action color; no AI-purple or gradient-on-text; no heavy/black drop shadows; no
emoji icons; no Inter/Roboto/Arial; no physical `left`/`right`; no effects on tables/forms; no domain
hue used decoratively; no em-dash anywhere (use hyphen or restructure).

## 9 · Status & next surfaces

- **Built:** token foundation (`system.css`), App-shell + Operational Overview (`overview.html`),
  light + dark + mobile verified.
- **Legacy:** `final_*.css` and the old `design.md` remain on disk, untouched, pending a migration
  decision. Mirsad lives in its own `--ms-*` namespace and does not collide with `--f-*`.
- **Next:** domain workspace (table + filters + detail drawer) → service flow (card → stepper → form →
  receipt) → public landing. Each new surface extends this token layer; never introduces raw hex/px
  outside it.
