---
name: design-system-library
description: Curated library of 8 professional design system specifications (DESIGN.md format) from world-class brands — Authkit, Superhuman, Dia Browser, Active Theory, Seed, Origin Financial, Apple, Sketch. Each spec is preserved verbatim in library/ with full color tokens, typography, components, do's/don'ts, and Quick Start CSS. Activate when picking a direction for the Tadfuq Al-Khayr design system rebuild, comparing brand registers, sourcing a token system, or extracting a component pattern. Companion to inspiration-deck (screenshots), design-references (web sources), and creative-fx (effects).
---

# design-system-library — Reference Shelf for the Rebuild

> CONTEXT: Per [[feedback-no-design-rejects]] — Tadfuq Al-Khayr's design system is being rebuilt from scratch.
> This skill is the canonical reference shelf: 8 complete DESIGN.md specifications from world-class brands,
> preserved verbatim under `library/` for fast lookup. Use it to pick a direction, lift tokens, or compare registers.

## §0 — THE LIBRARY (open `library/<NN>-<name>.md` for full spec)

| # | Brand | Theme | One-line north star | Signature gesture |
|---|-------|-------|---------------------|-------------------|
| 01 | **Authkit** | dark | blueprint on midnight glass | Single electric iris #663af3 + cool blue-gray text + 2px sharp form buttons + soft blue inset hairlines for elevation |
| 02 | **Superhuman** | mixed | cinematic cockpit behind warm parchment | Full-bleed dusk photo hero → snap to #f2f0eb parchment canvas, violet ghost outlines, glassmorphic floating panels |
| 03 | **Dia Browser** | light | prism on white stationery | Single typeface (ABC Oracle weight 300) + monochrome canvas + spectrum gradient as ambient glow ONLY |
| 04 | **Active Theory** | dark | observatory dome at midnight | Total void canvas + WebGL 3D centerpiece + nbarchitekt mono labels in corners + zero chrome |
| 05 | **Seed** | light | apothecary greenhouse at dawn | Warm parchment + single forest green (#1c3a13) carries ALL text/CTAs + lime sprout punctuation + flat no-shadow |
| 06 | **Origin Financial** | dark | serif headlines floating above dusk clouds | Lyon Display 96px weight 300 (whisper-authority) + chromatic feature cards float as "lit windows" + white pill is the only CTA |
| 07 | **Apple** | dark | black void with one lit object | SF Pro 80px display + pill nav (980px) + 999px buttons + product photo emerges from #000 via lighting not shadow |
| 08 | **Sketch** | light | serif poetry on pastel paper | Reckless serif 76px + Inter UI + dark pill CTA wrapped in pink-magenta halo glow + atmospheric dusk gradient hero |

## §1 — CLUSTER TAXONOMY (which brands share DNA)

| Cluster | Members | Shared traits |
|---------|---------|---------------|
| **Dark + Single Saturated Accent** | Authkit, Apple, Active Theory, Origin | Near-black canvas (#05060f → #000), ONE chromatic action color (or zero), elevation via borders/light not shadow, technical typography |
| **Warm Parchment + Restrained Color** | Seed, Superhuman, Sketch | #f2f0eb / #fcfcf7 / #fafafa canvas, single brand color carries the system, editorial serif or weight-300 sans for whisper-authority |
| **Near-Monochrome + Gradient as Signature** | Dia, Sketch, Origin | Achromatic UI + ONE gradient (spectrum / dusk-wash / dusk-sky) used ONLY as atmospheric glow — never on buttons or text |
| **Editorial Serif Display** | Origin, Sketch, Seed (via custom sans 300) | Light-weight display (300 weight) at huge sizes (48–96px), tight negative tracking, deliberate anti-SaaS choice |
| **Pill-Shape Geometry** | Apple, Seed, Authkit-pills, Sketch, Superhuman | Buttons / nav / tags / badges → fully rounded (999px / 1440px), forms stay sharp (2-8px) |
| **Glassmorphic Floating Panels** | Superhuman, Dia, Sketch | backdrop-filter: blur(12-24px) on rgba(255,255,255,0.9) — frosted-glass depth without shadows |

## §2 — WHAT TO LIFT FOR TADFUQ (per brand, 2-3 specific moves)

### From Authkit (`library/01-authkit.md`)
- **Eyebrow + heading + subtitle stack** with mono `dotDigital` 15px @ 0.1em tracking → use for Arabic section labels ("التصميم", "الإحصائيّات") — finds an Arabic mono companion (IBM Plex Arabic Mono).
- **Hairline inset shadow elevation** `inset 0 0 0 1px rgba(186,215,247,0.12)` instead of drop shadows — flat + modern.
- **Single chromatic action** (Electric Iris) restricted to ONE primary CTA per viewport — disciplined hierarchy.

### From Superhuman (`library/02-superhuman.md`)
- **Two-tone bracketing**: dark aubergine (#421d24) for announcement banner + footer only, parchment in between — frames the page.
- **Glassmorphic floating panels** over hero photography — for landing page "live demo" feel.
- **Variable font with negative tracking baked into display sizes** (-0.028em at 64px) → Arabic equivalent needs careful variable font choice.

### From Dia Browser (`library/03-dia-browser.md`)
- **Single typeface across entire system** (ABC Oracle weight 300/400/500) — radically simplifies. For Arabic: pick one variable family (e.g., IBM Plex Arabic) for everything.
- **Spectrum gradient as the brand color** — the gradient replaces a logo accent. Could become Tadfuq's signature if a multi-dept rainbow ribbon expresses civic diversity.
- **Neutral buttons (#D9D9D9)** instead of chromatic CTAs — radical anti-CTA — focuses attention on content, not action.

### From Active Theory (`library/04-active-theory.md`)
- **Architectural micro-labels** (nbarchitekt 10–12px uppercase, tracked) as section markers — gives a drafted/measured feel.
- **Chrome in corners, content owns center** — for an immersive splash/landing experience.
- **Elevation via borders only** (no shadows) on pure black canvas — same surface = different layer via 1px line.

### From Seed (`library/05-seed.md`)
- **Single deep brand color carrying everything** — text, buttons, icons, borders. Forest green (#1c3a13) as model. For Tadfuq: a single deep tone (perhaps brand-navy or brand-burgundy at OKLCH dept-anchor) does it all.
- **Lime Sprout sparingly** for accent only (announcement bar, "new" badges). The scarcity creates impact.
- **Flat no-shadow elevation philosophy** + 1px hairlines + dark Forest Canopy as "raised" section via color inversion.
- **Mono companion for product codes** (Seed Sans Mono for DS-01®, AM-02®) — useful for Tadfuq case numbers (#قضيّة-2026-1234).

### From Origin Financial (`library/06-origin-financial.md`)
- **Lyon Display weight 300 at 96px** as the editorial signature — whisper-authority for hero. Arabic equivalent: a thin serif (Vibes, Aref Ruqaa thin, or custom).
- **White pill is the only CTA color** — radical restraint. Powerful if Tadfuq wants "trust through quiet".
- **Chromatic feature cards as illuminated windows** (Amethyst, Cyan Spark, Orchid backgrounds) on dark canvas — perfect for dept-color expression.
- **Wide-tracked Suisse Int'l Trial at 0.182em** for stamped UI labels — could anchor Tadfuq's nav/tag system.

### From Apple (`library/07-apple.md`)
- **120px section gaps** + pill nav (980px) + buttons (999px) — generous breathing room as status signal.
- **Product photo emerges from black via internal lighting** — for showcasing civic outcomes (rebuilt classroom, paved street) on dark hero.
- **Surface ladder** #000 → #161617 → #1d1d1f → #333336 — clean 4-level dark elevation.
- **Spec bar gradients** (teal-to-blue, aurora) ONLY for data infographics — perfect for case-status / dept-load bars.

### From Sketch (`library/08-sketch.md`)
- **Dark pill CTA with diffused colored halo glow** (`0 0 0 3px rgba(252,122,155,0.35), 0 0 12px 2px rgba(252,122,155,0.2)`) — emotional CTA without shouting. Tadfuq variant: gold/crimson halo on navy pill.
- **Serif display (Reckless 500) + Inter UI** dichotomy — "craft meets tool". Arabic: Aref Ruqaa display + IBM Plex sans body.
- **Bone canvas #fafafa (not pure white)** + soft hairline cards — paper-studio feel.

## §3 — DECISION MATRIX FOR THE REBUILD

| If Tadfuq's goal is... | Look at first | Key moves to lift |
|------------------------|---------------|--------------------|
| **Trust through restraint** | Origin, Apple, Sketch | Single CTA color (or neutral), serif headlines weight 300, generous spacing |
| **Civic-tech precision** | Authkit, Active Theory | Mono labels, hairline elevation, single accent, technical iconography |
| **Warm-civic accessibility** | Seed, Superhuman | Parchment canvas, single brand color carrying all text/CTAs, lime/violet punctuation badges |
| **Dept diversity expressed visually** | Origin (chromatic feature cards), Dia (spectrum gradient) | Per-dept OKLCH cards on dark canvas, OR gradient ribbon as system signature |
| **Editorial / journalistic register** | Sketch, Origin | Serif display, magazine-paper canvas, large hero photography |
| **Tool / power-user feel** | Authkit, Dia, Apple | Geometric sans, technical micro-labels, near-monochrome UI |
| **Immersive landing experience** | Active Theory, Apple, Superhuman | Full-bleed hero, chrome in corners, atmospheric photo+gradient |

## §4 — TOKEN-FAMILY REFERENCE (what each spec defines)

Every file in `library/` follows the same DESIGN.md structure:
1. Frontmatter: `name`, `theme`, north-star tagline
2. **Tokens — Colors** (palette + roles + gradient definitions)
3. **Tokens — Typography** (font families, scale, line-height, tracking, OpenType features)
4. **Tokens — Spacing & Shapes** (base unit, scale, radii per element)
5. **Components** (named, with role + exact CSS recipe)
6. **Do's and Don'ts** (the discipline rules)
7. **Surfaces** (elevation levels)
8. **Imagery** + **Layout** (composition philosophy)
9. **Gradient System** + **Motion Philosophy** (where applicable)
10. **Similar Brands** (cluster hint)
11. **Quick Start** (full `:root { --color-*, --font-*, --radius-*, --shadow-* }` block + Tailwind v4 `@theme`)

When extracting tokens for the Tadfuq rebuild, copy the `Quick Start` CSS block as a starting point and adapt.

## §5 — HOW TO USE THIS SKILL DURING THE REBUILD

1. **Direction-picking phase** → read this SKILL.md (§1 clusters + §3 decision matrix) → pick 2-3 candidate brands.
2. **Spec-deep-dive phase** → open `library/<NN>-<name>.md` for full token system + components + do/don'ts.
3. **Hybrid synthesis** → mix moves from 2-3 brands per §2. Document the synthesis in a `design-md` file at project root (use `vendor/design.md/` examples as format template).
4. **Validation** → run the new tokens through GATES from `creative-fx` (RTL, Arabic typography, A11y, dept color preservation, ItsHover icon compatibility).
5. **Lint** → `npx @google/design.md lint DESIGN.md` for contrast + token-ref validation.

## §6 — COMPANIONS

| Skill | What it owns | When this skill defers to it |
|-------|--------------|------------------------------|
| `inspiration-deck` | 25 real screenshots, per-image + 18 cross-cutting principles | For LAYOUT / hero / card composition patterns (this skill is for TOKEN SYSTEMS) |
| `design-references` | External MCP servers + AI design tools + URL catalog | For sourcing more references at runtime |
| `creative-fx` | Kinetic type, gradient buttons, liquid glass, backgrounds, bestdesignsonx | For EFFECTS (motion, glass, gradient, grain) |
| `feedback-icon-source` | ItsHover as default icon source | For ICONS (always check ItsHover first) |
| `feedback-no-design-rejects` | Never pre-reject patterns | Governing policy for this whole library |

## §7 — RTL & ARABIC ADAPTATION NOTES

Every spec in `library/` is designed for LTR Latin systems. Before lifting:

| Source aspect | Adaptation requirement for Tadfuq |
|---------------|-----------------------------------|
| Negative letter-spacing on display (-0.028em / -1.79px) | Arabic display fonts handle tracking very differently — test with real Arabic glyphs; usually need 0 or slight positive tracking |
| Wide tracking on uppercase labels (0.1em / 0.182em) | Arabic has no "uppercase" — use weight contrast or color/background pill instead |
| Mono companion for codes (Roboto Mono, Seed Sans Mono) | Use IBM Plex Arabic Mono or fallback to Latin mono just for numerals (`unicode-range`) |
| Serif display (Lyon, Reckless, Times) | Arabic serif equivalents: Aref Ruqaa, Lateef, Vibes, or custom |
| Tight line-height on display (0.9-1.0) | Arabic descenders/ligatures need more — typically 1.1-1.3 minimum for display |
| Single typeface for entire system (Dia) | Need to verify the chosen variable family has full Arabic support across weights |
| `letter-spacing: 0.182em` uppercase | Skip — use background pill or stronger weight for the "stamped" feel |

## §8 — NEXT STEPS

When the user is ready to start the rebuild:
1. Ask which brand register feels closest (use §3 decision matrix as the question).
2. Open the chosen `library/<NN>-<name>.md` for the full spec.
3. Author `DESIGN.md` at project root following `vendor/design.md/examples/*/DESIGN.md` format, with the chosen brand's tokens as starting point + Tadfuq's dept-color overlay + RTL adaptations per §7.
4. Validate with `npx @google/design.md lint DESIGN.md`.
5. Generate CSS custom properties + apply progressively to `final_*.css` files.
