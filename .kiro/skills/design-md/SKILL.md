---
name: design-md
description: Evidence-grounded DESIGN.md extraction & authoring methodology. Turns a design system (tokens, type, spacing, surfaces, components) into a single Markdown context file AI coding agents follow. Activate when creating/updating DESIGN.md, extracting tokens from a site, or generating on-brand UI context. Pairs with refero-design.
---

# DESIGN.md — Evidence-Grounded Extraction Skill

> ACTIVATION: authoring/updating `DESIGN.md`, extracting tokens, or grounding UI generation.
> Source methodology: mydesignmd.com. ¬(Suggestions) — execution constraints.

## §1 — WHAT DESIGN.md IS
- Single Markdown file at project root = persistent design context for AI agents.
- Two layers: (a) machine-readable tokens (YAML/CSS vars) ∩ (b) prose rationale + rules.
- Goal: agent ships on-brand UI without re-describing identity each prompt.

## §2 — 5-GATE PIPELINE (run in order)
```
1 CAPTURE   evidence: CSS, computed styles, screenshots, DOM, metadata
            GATE: reject private/blocked/unsupported sources
2 EXTRACT   colors · type · spacing · radius · surfaces · media · components
            GATE: keep DETERMINISTIC tokens separate from model interpretation
3 INTERPRET brand · layout · component · implementation guidance
            GATE: every claim cites observed ⊕ inferred support
4 GROUND    classify: SUPPORTED · INFERRED · GAP
            GATE: unsupported specifics stay OUT of the polished file
5 PACKAGE   DESIGN.md ∩ tokens.json ∩ css-vars ∩ audit ∩ grounding
            GATE: artifacts usable from any surface
```

## §3 — GROUNDING DISCIPLINE (the core rule)
- SUPPORTED = directly observed in source/code → state as fact.
- INFERRED = reasonable from evidence → label "(inferred)".
- GAP = unknown → list in `## Known Gaps`, ¬(invent values).
- ¬(unsupported brand claims). ¬(hallucinated hex/px/ms). When in doubt → GAP.

## §4 — REQUIRED DESIGN.md SECTIONS
```
# <System Name>
> one-line evidence-grounded summary

## Overview        — purpose, audience, platform, RTL/LTR, tone
## Tokens          — color (role+hex), type (family/scale/weight), spacing, radius, shadow, motion
## Surfaces        — bg, surface levels, glass, dark-mode mapping
## Components       — name · purpose · key classes · states covered
## Layout          — grid, max-width, breakpoints, density
## Motion          — durations, easings, reduced-motion rule
## Do's and Don'ts — actionable guardrails + anti-patterns
## Known Gaps      — unverified items (¬ guessing)
```

## §5 — TOKEN ROLES (preserve, never flatten)
- Each color carries a ROLE: brand / action(CTA) / surface / text / border / semantic / section.
- CTA-only colors stay CTA-only. Section colors map 1:1 to their meaning.
- Code-only or print-only values (e.g. `--line:#000` for printed forms) flagged and kept scoped.

## §6 — PROJECT BINDING (Rasafa / Tadfuq Al-Khayr)
- The source of truth is `ds/tokens/*.css` — DESIGN.md MIRRORS them, never invents.
- On token change → regenerate the matching DESIGN.md section + re-run §3 grounding.
- RTL-first, `rs-` prefix, `ds/` layer order documented under `## Components`.

## §7 — OUTPUT REGIME
- Tokens exact and copy-pasteable. Prose minimal, rule-shaped.
- ¬(marketing language) ¬(unverified specifics) ¬(post-file commentary).
