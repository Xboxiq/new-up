---
inclusion: always
---

# Skill foundation — follow these in every session (this repo)

The skills vendored in this repo are the **canonical design/engineering reference**. They are
installed and pinned in `skills-lock.json` and mirrored under `.kiro/skills/`, `.agents/skills/`,
and `.claude/skills/`. Treat them as the working method, not optional reading.

> Network here is **integrations-only**, so `npx skills add anthropics/skills --skill <name>`
> cannot fetch from npm/GitHub (returns 403). That's fine — skills are **vendored + locked**.
> Use the local copies; read `.kiro/skills/<name>/SKILL.md` (or activate via context disclosure).
> Re-running the CLI is only needed to *update* a skill, which must be done from a networked env.

## Primary skill for all UI work: `frontend-design` (anthropics/skills)
Activate/consult it before building or reshaping any UI. Its laws (apply them):
- **Distinctive over templated.** Make deliberate, opinionated choices specific to this brief;
  take one justified aesthetic risk. Ground every screen in the subject's world (a civic
  electricity service desk), not generic SaaS.
- **Hero is a thesis.** Open with the most characteristic thing; avoid the "big number + label +
  gradient" template answer unless it's genuinely best.
- **Type carries personality.** Pair display/body deliberately; make the type treatment memorable
  (our `design.md` §2: Alexandria/Readex + JetBrains Mono eyebrows).
- **Structure encodes meaning.** Numbering/eyebrows/dividers must reflect real content
  (a sequence, a typed timeline), never decorate.
- **Motion deliberately.** One orchestrated moment beats scattered effects; extra animation reads
  as AI-generated. transform/opacity/filter only; honour reduced-motion.
- **Spend boldness in one place** (one signature per screen); keep everything else quiet. Remove
  one accessory before shipping.
- **Quality floor, unannounced:** responsive to mobile, visible keyboard focus, reduced motion.
- **Copy is design material:** end-user language, active voice, consistent action names, empty/
  error states give direction not mood.
- **Avoid the 3 AI-default looks** (cream + serif + terracotta; near-black + acid accent;
  hairline broadsheet) *when the brief leaves an axis free*. **Exception:** when the brief pins a
  direction, the brief wins — our `design.md` explicitly calls for a warm civic-broadsheet
  register at golden hour, so that register is a *brief-driven choice*, executed with precision.

## Supporting skills (activate by task)
- `refero-design` — research-first UI methodology + craft rules (any UI; RTL/Arabic-first).
- `design-taste-frontend` — anti-slop audit for landing/redesign.
- `impeccable` — slop detector. After any CSS change run `npx impeccable detect <path>` → must be `[]`.
- `animate` + `design-motion-principles` — motion patterns and audits.
- `creative-fx` — gradient / liquid-glass / grain / kinetic references (`creative-fx/references/`).
- `ui-ux-pro-max` — searchable styles/palettes/pairings/UX-rules base.
- `design-system` / `ui-styling` / `theme-factory` — tokens and theming.
- `handoff` — shape of continuation docs (see `.kiro/steering/atelier.md`, `atelier/CONTINUE.md`).

## Workflow (every UI change)
1. Activate the relevant skill(s) + obey `design.md` (the design law) and `.kiro/steering/atelier.md`.
2. Plan in two passes (brainstorm tokens → critique against the brief: "would I produce this for
   any similar prompt?" — if yes, revise) **before** writing code.
3. Build on the `--at-*` token layer; logical properties only; tokens only; tnum; mono eyebrows.
4. Self-critique with screenshots when possible (a picture is worth 1000 tokens); judge aesthetics
   visually, not by reading values. Reference imagery: `screenshots/` + `design.md` §10/§18.
5. Verify: `impeccable detect` → `[]`; no physical `left/right`; no emoji; responsive 375/768/1440;
   toggle dark; reduced-motion; AA contrast. Validate JS with `env -u NODE_OPTIONS node --check`.
