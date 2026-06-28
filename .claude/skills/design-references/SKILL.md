---
name: design-references
description: Project-local catalog of external design resources for Tadfuq Al-Khayr — animation snippet libraries (Ripplix, Coverflow), AI design platforms (designmd family, aura.build, neuform.ai, typeui.sh), and style-reference engines (refero, open-design, impeccable, apple-hig, sf-symbols, human-interface). Activate when picking a motion pattern, sourcing a UI snippet, hunting for inspiration, or comparing AI-generated design directions. Tells the agent WHICH source fits the task and WHEN to consult an MCP server vs a web page vs a sibling skill.
---

# design-references — External Resource Catalog

> ACTIVATION: choosing a motion pattern, snippet, micro-interaction, AI-generated direction,
> or design system reference for the Tadfuq Al-Khayr civic platform.
> Companion to `creative-fx` (which already wraps kinetics, gradient buttons, liquid glass,
> backgrounds.supply, bestdesignsonx). This skill covers everything else.

## §0 — DECISION TREE

```
Need a motion / micro-interaction snippet?
  ├── kinetic typography / glass / gradient / grain / inspiration → use creative-fx
  ├── general UI motion / micro-interactions library            → ripplix
  └── iOS-style cover flow carousel                              → coverflow

Need AI-generated design directions to compare against?
  ├── style-system MCP (already wired)        → refero / open-design / impeccable
  ├── Apple platforms reference (MCP wired)   → apple-hig / sf-symbols / human-interface
  ├── React / Next / Tailwind docs (MCP)      → react / nextjs / tailwind
  └── design.md ecosystem (web tools)         → designmd.me · designmd.supply · getdesign.md
                                                · design-md.hyperbrowser.ai · aura.build
                                                · neuform.ai · typeui.sh

Need design inspiration gallery / taste reference?
  └── creative-fx → bestdesignsonx playbook (already documented)
```

## §1 — OPEN-SOURCE SNIPPET LIBRARIES (NEW — not in creative-fx)

| # | Source | Type | Extract | Brand verdict |
|---|--------|------|---------|---------------|
| 0 | **vendor/itshover/** (cloned from github.com/itshover/itshover, Apache-2.0) | **265 animated icons** (Motion.dev + React/shadcn) — **DEFAULT ICON SOURCE** | All icons (`vendor/itshover/icons/<name>-icon.tsx`) | **ALWAYS USE FIRST** — port .tsx to vanilla JSX/SVG inline (project has no bundler); RTL-flip horizontally-directional icons via `transform: scaleX(-1)` |
| 1 | ripplix.com | Largest UI Animation & Micro-Interaction library | Hover/click ripples, button states, focus rings, list-item enter, toast motion | ADAPT — re-token, reduce intensity, RTL-flip directions |
| 2 | coverflow.ashishgogula.in | iOS-like Cover Flow for React | 3D perspective carousel, spring snap, infinite scroll | USE — for cases/awards carousels only; honor `prefers-reduced-motion` |
| 2b | vendor/liquidglass-oss/ (cloned from gitlab.com/ogtirth/liquidglass-oss) | WebGL liquid-glass React lib (`@ogtirth/liquid-glass-oss`) | Live refraction sampling background image — `LiquidGlassButton`, etc. | REFERENCE ONLY — needs bundler to `import`; for now read `liquid-glass-web/src/` and port the refraction shader to project CSS/SVG `feDisplacementMap` |

### ItsHover consumption rules (DEFAULT ICON PATH)
- **Always check `vendor/itshover/icons/<name>-icon.tsx` first** before any other icon source.
- Project has no bundler → cannot `npm install` shadcn components. Port the .tsx motion logic to either:
  - Inline SVG + CSS `@keyframes` for simple animations
  - Inline SVG + small vanilla JS state machine for hover/click animations
- Preserve the brand: re-map ItsHover's stroke color to `currentColor`, so it inherits from text color (navy/crimson/gold/dept).
- RTL: flip `arrow-*`, `chevron-*`, `caret-*` with `transform: scaleX(-1)` under `[dir="rtl"]`.
- `prefers-reduced-motion: reduce` → drop animation, keep static end-state SVG.
- Keep `vendor/itshover/LICENSE` intact; attribute in project NOTICE when shipping.
- Fallback order if icon missing from ItsHover's 265: (1) Lucide static, (2) custom SVG, (3) SF Symbols via MCP (iOS contexts only).

### Ripplix consumption rules
- Pull pattern → re-implement on project `--f-*` tokens; ¬(verbatim copy of their CSS).
- Replace their accent palette with `--c-navy` / `--c-crimson` / `--c-gold` / OKLCH dept colors.
- For RTL: flip `transform-origin`, `translateX` signs, `inset-inline-*` axes.
- For `prefers-reduced-motion: reduce`: drop to opacity/color transitions only.
- Test in both directions before committing.

### Coverflow consumption rules
- React port lives at `coverflow.ashishgogula.in` (MIT). Bring source, do not npm-install if it pulls heavy deps.
- Card width: clamp to `--space-card-w` token (do not hardcode px).
- 3D perspective: cap rotation at 35° so glare doesn't read as AI-slop tilt.
- Always provide a fallback grid for reduced-motion users.

## §1.5 — DESIGN.md FORMAT (vendor/design.md/)

`vendor/design.md/` (Apache-2.0, from github.com/google-labs-code/design.md) — the **DESIGN.md spec**: YAML-frontmatter tokens + markdown prose describing a design system to coding agents.

- Reference examples: `vendor/design.md/examples/{atmospheric-glass,paws-and-paths,totality-festival}/DESIGN.md` — copy their shape, not their content.
- Spec: `vendor/design.md/README.md` + `vendor/design.md/PHILOSOPHY.md`.
- Linter: `npx @google/design.md lint DESIGN.md` (validates contrast, token refs).

**Action item:** project does not yet have a `DESIGN.md` at root. Authoring one would let every agent walking into this repo skip reading 14 `final_*.css` files. Tokens to encode: `--c-navy`, `--c-crimson`, `--c-gold`, OKLCH dept colors, `--f-*` motion curves, `--space-*` scale, RTL invariants. Ask user before authoring.

## §2 — AI DESIGN PLATFORMS (web tools — no MCP yet)

These produce design directions / system tokens / component code. Use when stuck on a direction, NOT as a copy source.

| # | Tool | Best for | How to consult |
|---|------|----------|----------------|
| 3 | designmd.me | Markdown-driven design spec | Paste a section spec, get a layout proposal |
| 4 | designmd.supply | Design-system supply (tokens, palettes) | Source token ideas, then re-express in `--f-*` |
| 5 | getdesign.md | design.md hub | Discover prompts and templates |
| 6 | design-md.hyperbrowser.ai | Hyperbrowser-backed design.md | Multi-variant generation when stuck |
| 7 | aura.build | AI UI generator | Pull layout skeletons, redraw in our system |
| 8 | neuform.ai | Form/dashboard generator | Form-heavy screens (cases, requests, admin) |
| 9 | typeui.sh | Type-system / typography tool | Type scale validation, font-pairing sanity check |
| 10 | open-design.ai | Open design AI (separate from MCP `open-design` server) | Compare against MCP outputs |

### Consumption rules for AI tools
- ALWAYS check the project's own brand tokens FIRST (`final_tokens.css`, `final_designsystem.css`).
- Generated output = direction, not deliverable. Re-implement in the project's design system.
- Reject any direction that violates: RTL-first, OKLCH department palette, the navy/crimson/gold brand triad, or the `--f-*` token scale.
- ¬(pasting generated CSS verbatim).

## §3 — WIRED MCP SERVERS (already in user `~/.claude.json`)

These are callable directly via MCP tools at runtime. Prefer over web visits.

| Server | URL | When to call |
|--------|-----|--------------|
| refero | mcp.refero.design | Style direction, screen patterns, journey flows |
| open-design | mcp.opendesign.dev | Open-source design system lookups |
| impeccable | mcp.impeccable.dev | Production-grade component patterns |
| apple-hig | mcp.applehig.dev | Apple Human Interface Guidelines lookup |
| sf-symbols | mcp.sfsymbols.dev | SF Symbol search (only if iOS-style icon needed) |
| human-interface | mcp.humaninterface.dev | HIG cross-platform principles |
| react | mcp.react.dev | React docs / hooks reference |
| nextjs | mcp.nextjs.dev | Next.js docs / routing |
| tailwind | mcp.tailwindcss.dev | Tailwind class lookup (we use tokens, not Tailwind — use for cross-reference only) |
| playwright | npx @playwright/mcp@latest | Browser automation for live design audit |
| figma | npx figma-developer-mcp | Figma file inspection (project-scope) |

### MCP priority order
1. `refero` → first stop for any new screen — gives styles, screens, flows.
2. Companion (`impeccable` or `open-design`) → second opinion if refero direction feels generic.
3. `apple-hig` / `human-interface` → for interaction patterns + accessibility cross-checks.
4. `react` / `nextjs` → only when the question is genuinely framework-syntactic.

## §4 — SIBLING SKILLS (already installed — defer to them)

| Skill | Owns |
|-------|------|
| `creative-fx` | kinetic type, gradient buttons, liquid glass, backgrounds.supply, bestdesignsonx |
| `refero-design` | Refero MCP-driven research-first design methodology |
| `design-taste-frontend` | Anti-slop frontend taste, audit-first redesigns |
| `frontend-design` | Distinctive production-grade frontends |
| `animate` | Emil Kowalski animation course patterns |
| `design-motion-principles` | Motion / interaction design audit + build |
| `inspiration-deck` | 25 curated screenshots in `screenshots/` analyzed per-image + 18 cross-cutting principles + brand-fit verdicts. First stop for layout/hero/card/dashboard composition decisions. |
| `design-system-library` | **NEW** — 8 complete DESIGN.md specs (Authkit, Superhuman, Dia, Active Theory, Seed, Origin, Apple, Sketch) preserved in `library/`. Cluster taxonomy + decision matrix + per-brand "what to lift". **First stop when picking a direction for the design system rebuild.** |

¬(re-implementing what these skills cover). Defer.

## §5 — RTL & BRAND INVARIANTS

Every snippet, generated direction, or MCP output passes through these gates before landing in the codebase:

```
GATE_1: RTL.   Test in dir="rtl". Flip transforms, paddings, icon directions.
GATE_2: TOKENS. Map every color → --c-* / OKLCH dept. Every spacing → --space-*. Every motion → --f-* curves.
GATE_3: A11Y.  prefers-reduced-motion fallback, focus-visible ring, contrast ≥ AA.
GATE_4: BRAND. Navy/crimson/gold triad. No purple/teal accents unless dept color justifies.
GATE_5: ARABIC. Test with real Arabic content (long words, mixed numerals). Verify line-height + font-feature-settings.
```

Fail any gate → reject and re-source.

## §6 — WHAT THIS SKILL DOES NOT DO

- ¬(scraping bestdesignsonx images in bulk — that's `creative-fx`'s job; use WebFetch on individual pieces at design time)
- ¬(reproducing Apple proprietary assets — sf-symbols are reference only, not redistributable)
- ¬(copying generated CSS from AI tools verbatim — always re-express in `--f-*` tokens)
- ¬(installing npm dependencies from snippet sources — port the pattern, do not pull the package)

## §7 — EXCLUDED / NON-DESIGN

| Resource | Reason excluded |
|----------|-----------------|
| github.com/docker/awesome-compose | Docker compose samples — not a design resource |
| github.com/mattpocock/skills | Installed as separate skills (writing, TDD, git guardrails) — not a design source |
| github.com/google-labs-code/design.md | Installed as `tdd-red-green-refactor` + `typed-service-contracts` — not the design.md tool itself |
