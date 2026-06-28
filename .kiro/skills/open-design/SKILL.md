---
name: open-design
description: Artifact-first design generation loop + five-dimension self-critique gate + anti-AI-slop checklist + 9-section DESIGN.md schema + code handoff. Activate when generating UI artifacts (prototypes, dashboards, decks), critiquing a design before shipping, or migrating an artifact to React/Vue/Next. Complements refero-design (taste) and design-md (context).
---

# Open Design — Artifact-First + Critique Skill

> ACTIVATION: generating/critiquing a UI artifact or handing off to code.
> Source methodology: nexu-io/open-design (Apache-2.0). ¬(Suggestions) — execution constraints.
> NOTE: the OD desktop app / MCP server is not installed in this workspace; this skill encodes its METHODOLOGY only.

## §1 — THE LOOP (artifact-first, do in order)
```
brief → direction → design system → artifact → critique → handoff → memory
```
```
1 BRIEF      what · who · platform · goal · tone · constraints
2 DIRECTION  ONE primary visual direction (use refero-design §1)
3 SYSTEM     bind DESIGN.md / ds tokens (use design-md). ¬(invent tokens)
4 ARTIFACT   emit single-page real HTML/CSS reading the tokens
             edit-in-place ¬(regenerate-from-scratch on each tweak)
5 CRITIQUE   run §3 five-dimension gate BEFORE delivery
6 HANDOFF    real HTML/CSS → React/Next/Vue, or export
7 MEMORY     record confirmed palettes/fonts/decisions as next-session defaults
```

## §2 — MODE × SCENARIO (pick before building)
- mode ∈ (prototype · deck · live-artifact · image · video · design-system · utility)
- scenario ∈ (design · marketing · operation · engineering · product · finance · hr · sale · personal)
- Bind: mode → output surface; scenario → audience tone. State both up front.

## §3 — FIVE-DIMENSION CRITIQUE GATE (pre-emit, score each 0–5)
```
D1 HIERARCHY     focal order clear? one primary action per view?
D2 SYSTEM-FIT    tokens only? type/space/radius on scale? on-brand?
D3 STATES        default/hover/focus/active/disabled/busy/invalid/loading/empty/error/success all present?
D4 CRAFT         alignment, optical spacing, contrast (4.5:1), motion w/ reduced-motion, focus-visible
D5 COPY          specific, actionable, on-voice, RTL-correct Arabic
```
- Any dimension < 4 → fix before shipping. ¬(delivering an un-critiqued artifact).
- Report the 5 scores + what was fixed.

## §4 — ANTI-AI-SLOP CHECKLIST (block generic output)
```
□ Grounded in a real reference direction (not a default template)
□ No stray hex/px/ms outside token files
□ No emoji-as-icons; SVG/Material Symbols only
□ No decorative AI purple/pink gradients (brand sweep only)
□ Real content/copy, not lorem or vague labels
□ cursor-pointer + visible focus on every interactive element
□ Responsive at 375 / 768 / 1024 / 1440
□ RTL logical properties throughout
□ Dark mode is calm navy, never OLED black
```

## §5 — DESIGN.md 9-SECTION SCHEMA (when authoring a brand contract)
`color · typography · spacing · layout · components · motion · voice · brand · anti-patterns`
→ For this project the contract already exists at `/DESIGN.md`. Read it before generating; ¬(re-deriving tokens).

## §6 — CODE HANDOFF
- Artifacts are real HTML/CSS → portable to React/Next/Vue.
- Preserve `rs-` classes / token vars in the migration; map 1:1, ¬(re-styling from scratch).
- Keep states (§3 D3) intact across the port.

## §7 — PROJECT BINDING
- Read `/DESIGN.md` + `ds/tokens/*` first. Reuse `ds/core|forms|navigation|states`.
- Stack here is token-based CSS + JSX; default artifact = single-page HTML using `ds/styles.css`.

## §8 — OUTPUT REGIME
- Code-first. State mode/scenario + references briefly. Report critique scores.
- ¬(post-artifact essays) ¬(unverified brand claims).
