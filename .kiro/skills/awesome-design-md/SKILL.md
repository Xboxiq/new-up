---
name: awesome-design-md
description: Use the VoltAgent awesome-design-md library — 70+ ready-made brand DESIGN.md files extracted from real sites (Stripe, Linear, Apple, Vercel, Notion…). Activate when you need a brand-grade visual direction fast, want to borrow a real design language, or seed a new page/artifact from a proven system. Pairs with design-md (authoring) and refero-design (taste).
---

# Awesome DESIGN.md — Reference Library Skill

> ACTIVATION: need a real, brand-grade DESIGN.md direction quickly.
> Source: github.com/VoltAgent/awesome-design-md (MIT). Files at getdesign.md/<brand>/design-md.
> ¬(Suggestions) — execution constraints.

## §1 — WHAT IT IS
- 70+ DESIGN.md files extracted from real production sites.
- Each = Stitch 9-section format: theme · color+roles · type · components · layout · depth · do/don't · responsive · agent prompt guide.
- Each brand also has `preview.html` + `preview-dark.html`.

## §2 — WHEN TO USE WHICH
```
need TASTE / visual exploration   → refero-design
need to AUTHOR our own contract    → design-md (+ /DESIGN.md)
need a READY brand direction fast  → THIS skill (borrow a shipped system)
```

## §3 — WORKFLOW (borrow without copying)
```
1 PICK    choose ONE brand whose language fits the brief (¬ averaging brands)
2 FETCH   pull its DESIGN.md from getdesign.md/<brand>/design-md
3 MAP     translate its tokens → THIS project's token names in ds/tokens/*
          ¬(dumping foreign hex/px into code) ¬(replacing /DESIGN.md)
4 PRESERVE ROLES  CTA→CTA, accent→accent, surface→surface
5 SYNTHESIZE  borrow only the chosen brand's structure/feel; keep Rasafa identity
6 CRITIQUE  run open-design §3 + ui-ux-pro-max pre-delivery checklist
```

## §4 — BRAND INDEX (representative)
```
AI/LLM     claude · cohere · mistral-ai · elevenlabs · ollama · x-ai
Dev tools  cursor · vercel · linear-app · framer · expo · supabase · warp · raycast
Productivity notion · figma · miro · airtable · superhuman · intercom · zapier · cal
Fintech    stripe · coinbase · binance · kraken · mastercard · revolut · wise
E-commerce airbnb · uber · nike · starbucks · shopify · pinterest
Media      spotify · playstation · wired · theverge · meta · apple
Automotive tesla · bmw · ferrari · lamborghini · bugatti · renault
```
Full list + previews: github.com/VoltAgent/awesome-design-md

## §5 — HARD RULES (project integrity)
- This project already has a brand at `/DESIGN.md`. Borrowed systems INFORM, never REPLACE it.
- Any borrowed value must be re-expressed as a project token (`ds/tokens/*`) before use in code.
- Keep RTL/Arabic-first, `rs-` prefix, calm-navy dark mode regardless of source brand.
- Reference must stay license-clean (MIT collection of publicly visible CSS); ¬(claiming brand ownership).

## §6 — OUTPUT REGIME
- State which brand was borrowed + which decisions came from it.
- Code-first, tokens mapped. ¬(post-output essays).
