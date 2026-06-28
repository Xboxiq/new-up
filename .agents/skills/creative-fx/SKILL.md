---
name: creative-fx
description: Curated creative-effects library distilled from six external sources (kinetic typography, gradient buttons, Apple liquid glass, supply-grade backgrounds, and a design-inspiration gallery). Every technique is re-expressed on the project's --f-* token system and brand (navy/crimson/gold + OKLCH dept colors), anti-AI-slop, RTL-first, reduced-motion safe. Activate when adding motion, depth, glass, gradient, or background texture to Tadfuq Al-Khayr, or when sourcing visual ideas.
---

# creative-fx — Signature Effects Library

> ACTIVATION: adding kinetic type, glass, gradient surfaces, button flair, animated/grain
> backgrounds, or sourcing inspiration for the Rasafa / Tadfuq Al-Khayr civic platform.
> Everything here is ADAPTED to `--f-*` tokens — never paste raw web snippets.

## §0 — SOURCE MAP (what each link gives us)

| # | Source | Type | What we extract | Brand verdict |
|---|--------|------|-----------------|---------------|
| 1 | kinetics.colorion.co | Kinetic typography generator | Staggered letter/word entrance, weight & scale pulse, wave reveal | USE — masthead entrance only, subtle |
| 2 | gradientbuttons.colorion.co | Gradient button gallery | Tonal-gradient fills, animated-shift hover, gradient-border | ADAPT — brand tonal only, primary CTA |
| 3 | liquidglass-oss (GitLab) | Apple Liquid Glass CSS/SVG | `backdrop-filter` + `feDisplacementMap` refraction, specular edge | ADAPT — top bar / modal / receipt only |
| 4 | backgrounds.supply / grainient | Background supply (grain + mesh + animated gradient + shader) | Grain/noise overlay, mesh tint, slow animated gradient | USE — ultra-subtle canvas texture |
| 5 | bestdesignsonx.com | Curated design gallery (X/Twitter) | Inspiration only — composition, hierarchy, taste references | REFERENCE — extract principles, never copy |
| 6 | github.com/docker/awesome-compose | Docker Compose samples | NOT a design resource | EXCLUDED from design — noted for honesty |

Detailed playbooks live in `references/`:
- `references/kinetic-type.md`
- `references/liquid-glass.md`
- `references/gradient-buttons.md`
- `references/backgrounds.md`
- `references/inspiration-sources.md`

## §1 — THE GOVERNING PRINCIPLE
This product is a calm civic broadsheet, not a neon landing page. Loud effects read as
amateur here. Each effect earns its place only when it: (a) increases clarity or
perceived quality, (b) speaks the brand palette, (c) survives `prefers-reduced-motion`,
(d) passes `npx impeccable detect` with zero findings.

Default posture: RESTRAINT. One signature moment per screen, not five.

## §2 — HARD GUARDRAILS (non-negotiable, inherited from project rules)
- NO AI-purple/indigo gradients. Gradients use brand tonal ranges only:
  navy→navy-soft, crimson tonal, gold tonal, or one OKLCH dept hue → its lighter self.
- NO gradient on text (`background-clip:text`) — impeccable flags it; use solid `--f-ink`.
- NO bounce / overshoot easing. Use `--f-ease-entrance` / `--f-ease-standard` / `--f-ease-exit`.
- NO layout-property transitions (width/height/top/margin). Animate transform/opacity/filter/color/shadow only.
- NO emoji icons. Material Symbols / SVG only.
- Glass must stay legible in LIGHT mode: min `bg ≈ surface/80`, never `white/10`.
- Touch targets ≥ `--f-touch` (44px). Focus ring = `--f-ring`.
- Motion budget: micro 150–250ms (`--f-dur-micro`), entrance 200–350ms (`--f-dur-enter`), exits faster.

## §3 — WHEN-TO-USE MATRIX (per surface)

| Surface | Allowed effects | Forbidden here |
|---------|-----------------|----------------|
| Page masthead (h1) | kinetic word entrance (once), crimson lead bar | glass, gradient fill |
| Primary CTA (`.f-btn--primary`) | brand tonal gradient + shift-on-hover | liquid distortion |
| Top bar / modal / receipt | liquid glass (backdrop-filter + specular) | kinetic type |
| Canvas (`.f-body`) | grain overlay + ultra-faint mesh tint | animated rainbow |
| Department cards | OKLCH `--d-c` accent edge | full-bleed gradient |
| Data tables / forms | NONE — keep flat & legible | all of the above |

## §4 — INSTALL / USE FLOW
1. Read the relevant `references/*.md` for the effect you need.
2. Copy the brand-adapted snippet (already on `--f-*`).
3. Place it in an additive layer (e.g. `final_fx.css`) loaded last; never edit core.
4. Validate: `npx impeccable detect <file>` → expect `[]`; Playwright at 375/768/1440;
   toggle dark; confirm reduced-motion.
5. Apply ONE signature per screen. If it competes, remove it.

## §5 — LIVE IMPLEMENTATION IN THIS REPO
A tasteful, brand-adapted subset is already wired via `final_fx.css` + an inline SVG
filter (see `references/liquid-glass.md` §Live). It ships:
- Kinetic masthead entrance (word-stagger, reduced-motion safe).
- Liquid-glass top bar (refraction + specular), legible in both themes.
- Grain + faint mesh canvas texture on `--f-bg`.
- Brand tonal gradient on the primary CTA with a hover shift.
All validated impeccable-clean. Extend, never inflate.

## §6 — LEVEL-UP VARIANT + DESIGN COMPARISON
A complete higher-tier variant synthesizing ALL skills lives in
`final_levelup.css`, scoped under `body.lvlup` so it never touches the current
design. It is activated per-URL via `index.html?design=levelup` (a tiny head
script adds the `lvlup` body class). Nine documented decisions:
display-scale leap, editorial nameplate band, amplified department identity,
confident figures, lifted-paper cards, entrance choreography, liquid-glass
action bar, active-tab presence dot, intensified grain.

`compare.html` is the live A/B harness: two synced iframes
(`?design=current` vs `?design=levelup`), breakpoint controls (375/768/1280),
shared light/dark toggle, synced scroll, and a "design decisions ledger" that
maps every change to its source skill. Open it from the in-app footer link
"مقارنة التصاميم". Use it to review any future design leap before promoting it
from `.lvlup` into the base.
