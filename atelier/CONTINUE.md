# CONTINUE — atelier rebuild (paste this to resume in a fresh session)

> This is a **segmented prompt**. Paste **§0 Kickoff** to start immediately; §1–§6 are the
> full context the agent should load. Most of this is also auto-applied via
> `.kiro/steering/atelier.md`, so a new session already knows the mechanism — this file is
> the explicit, paste-able trigger + detail.

---

## §0 · KICKOFF (paste this line)

> اكمل بناء `atelier/` (تدفّق الخير) وفق `.kiro/steering/atelier.md` و`design.md`.
> ابدأ بالتفاصيل الصغيرة قبل الكبيرة (حالات التركيز، ترتيب لوحة المفاتيح، تباين AA في الوضع
> الداكن، الهياكل العظمية للتحميل، الحالات الفارغة/الخطأ) ثم انتقل إلى **تدفّق النموذج (stepper)
> + الإيصال الذهبي**. التزم بكل الضوابط، فعّل السكلز المناسبة، وارفع على `feat/atelier-redesign` (PR #2).

---

## §1 · What this is
A from-scratch **new design of the same project** — تدفّق الخير, an Arabic/RTL civic
subscriber-services platform — built under `atelier/`. `design.md` is the law. Full brief +
guardrails are in `.kiro/steering/atelier.md` (auto-loaded). Don't re-read everything; trust it.

## §2 · The mechanism (don't relearn it)
No build step · static `index.html` + vanilla JS · token namespace `--at-*` · data reused from
`../data.js` + `../final_branches_data.js` · files: `tokens.css` · `system.css` (`.at-` classes) ·
`icons.js` (`window.AtelierIcons`) · `art.js` (`window.AtelierArt`) · `app.js`
(`window.AtelierHelpers`, router `VIEWS`). Validate JS with `env -u NODE_OPTIONS node --check <f>`
(a NODE_OPTIONS preload otherwise breaks node).

## §3 · Hard rules (reject your own output if it breaks these)
Tokens only (no raw hex/px outside `tokens.css`) · logical properties only (no `left/right`) ·
depth by hairline + indigo soft lift / dark glow (no grey shadows) · `tnum`+slashed-zero numerals ·
mono eyebrows · one action colour (indigo), section hue 1:1, gold ceremonial-only, crimson
urgent/lead · motion = transform/opacity/filter/color, damped spring ≤6%, reduced-motion safe ·
Arabic emphasis by colour not serif-italic · one signature per screen · glass on chrome only,
surface ≥72% · SVG monoline icons, **never emoji**.

## §4 · Sources & skills (use them, don't hallucinate)
Principles (rebuild, never copy) from: Apple Liquid Glass, Vercel, Origin, Seed, Notion,
gradientbuttons.colorion, backgrounds.supply, neuform, designmd.supply, getdesign.md, coverflow,
open-design — full dossier in `design.md` §10/§18 and `.agents/skills/creative-fx/references/`.
Activate skills: `refero-design`, `frontend-design`, `design-taste-frontend`, `impeccable`
(`npx impeccable detect <path>` → `[]`), `animate`, `design-motion-principles`, `creative-fx`,
`ui-ux-pro-max`. Visual feedback: `screenshots/` (25 imgs) — change → screenshot → compare → repeat.

## §5 · Build order (small → big)
1. **Details first:** focus rings, tab/keyboard order, AA in dark, skeleton loaders, empty/error.
2. **Core loop:** service directory → **form flow (connected stepper §6.6)** → **gilt receipt (§6.7)**.
3. **Bigger screens:** branch **mahalla map**, **dark telemetry** for CA (§6.12), Cover Flow
   onboarding (§6.8).
4. **Concierge intent parsing:** full sentence → pre-filled service + branch.
5. Per change: `impeccable` → `[]`; logical-props/emoji scan; responsive 375/768/1440; toggle
   dark; reduced-motion; AA contrast.

## §6 · What already exists (don't rebuild)
Home is done — see status in `.kiro/steering/atelier.md`. Open `atelier/index.html` to view.
Ships on `feat/atelier-redesign` → PR #2. Integration hook: `window.AtelierNav = function(code){…}`
routes a service click into the (future) form flow. Pure helpers carry runnable `console.assert`
self-checks — keep that habit for any new non-trivial logic.

---

### When proposing any visual feature
Justify it (to yourself) on three axes before adding it: **UX value** (the task it speeds up),
**aesthetic** (how it serves the design language above), **arrangement** (where it sits in the
hierarchy and why). No bare suggestions, no clichés, no AI-slop.
