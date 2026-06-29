---
inclusion: always
---

# Reference → Design-System protocol (how to treat any reference)

> Operating charter for this repo. Think like a **Principal Design Systems Architect, not a
> component copier.** Every reference (21st.dev, shadcn, Dribbble, a screenshot, a live site) is
> *inspiration*, never a source to clone. This formalizes `design.md §10` + `refero-design` into a
> non-negotiable workflow. Companion files: `design.md` (the law), `atelier.md` (the build brief),
> `component-library.md` (the adopted external-source catalog + per-source verdicts).

## 1 · Analyze deeply BEFORE any code
For each reference, extract and write down (English):
- **UX pattern** — the user problem it solves, the task it speeds up.
- **UI pattern** — anatomy, structure, the parts and their roles.
- **Interaction model** — states (idle/hover/active/focus/loading/empty/error), keyboard path, gestures.
- **Layout & spacing** — grid, hierarchy, density, rhythm (map onto our 4px scale + section gaps).
- **Motion** — what animates, easing, duration, the one orchestrated moment (map to `--at-*` motion tokens).
- **Accessibility** — roles/labels, focus order, contrast, reduced-motion behavior.
- **Visual hierarchy & principles** — the single signature, the rationed accent, depth method.

## 2 · Learn the idea, not the implementation
- **Never pixel-clone** or copy code/assets unless the user explicitly asks. Never exceed ~30
  consecutive words from any source. Rebuild the *principle* from scratch.
- If the reference is a foreign stack (React/Tailwind/TSX), it is inspiration only — this project is
  **no-build vanilla JS on `--at-*`**; do not install it (`npx shadcn add` will fail and is banned here).

## 3 · Rebuild on OUR system
- Tokens only (`--at-*`), class prefix `.at-`, logical properties, `tnum`+slashed-zero, mono eyebrows.
- One action color (indigo); section hue 1:1; gold ceremonial-only; crimson urgent/lead.
- Depth by hairline + surface-step / soft lift (light) / glow (dark) — never flat grey shadow, never neon glow.
- Motion: transform/opacity/filter/color only; damped spring ≤6%; honor `prefers-reduced-motion`.
- RTL-first, responsive 375/768/1440, AA contrast, visible keyboard focus.

## 4 · Unify, don't fragment
- **Merge** similar ideas from multiple references into ONE coherent pattern in our language — do not
  ship three near-duplicate variants. When references conflict, pick one dominant direction (refero:
  don't average into a safe middle).
- **Promote** any genuinely better interaction/animation/UX into the design system (a token, a
  reusable `.at-` primitive, a helper on `window.AtelierHelpers`) so it is reused **everywhere**, then
  apply it **consistently** across existing screens — not as an isolated one-off.
- Catalog the decision + verdict in `component-library.md`. Every new screen **evolves** the system.

## 5 · Build it for real, then verify (no orphans)
- Give every new primitive a real home (wire it into a live surface); never ship orphan components.
- Two-pass (frontend-design): plan tokens/anatomy → self-critique "would I produce this for any similar
  prompt? if yes, revise" → build the revised plan exactly.
- Gate before done: `env -u NODE_OPTIONS node --check`; `npx impeccable detect` must not exceed the
  baseline (`system.css` 9, `tokens.css` 1 — all design.md-mandated); no physical `left/right`; no emoji;
  375/768/1440; toggle dark; reduced-motion; AA. Pure logic gets `console.assert` self-checks.

## 6 · Consistency contract
Colors · typography · spacing · radius · motion · accessibility · RTL · responsiveness · and
**component APIs** stay consistent with the existing system. A new component must look, feel, move, and
read as if it always belonged.
