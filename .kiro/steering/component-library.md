---
inclusion: manual
---

# Adopted component base — 21st.dev / shadcn sources → native `--at-*` rebuilds

> Origin: the user supplied ~35 `npx shadcn add https://21st.dev/r/...` sources and asked to
> **adopt them as the foundation** for buttons, icons, graphics, and "a leap" in the project.

## Binding rule (why we never run `npx shadcn add` here)
The atelier is **no-build, vanilla JS + static HTML on `--at-*` tokens** (see `atelier.md` + `design.md`).
The 21st.dev components are **React + Tailwind + TSX** and require a `components.json` / RSC project that
does not exist here. Running the CLI would error and would import a foreign stack plus the exact AI-tells
`design-taste-frontend §9` bans. Per `design.md §10` + `refero-design`: **study the principle, curate hard,
rebuild the worthy ones on `--at-*`; never copy React/Tailwind code, never exceed ~30 consecutive words.**
This file is that curated, persistent base. Treat it as the catalog when building any new primitive.

## Verdicts (all supplied sources)

### Adopt → rebuild native
| Source | Native target | Status | Notes |
|--------|---------------|--------|-------|
| minhxthanh/copy-code-button | `.at-copy` | **BUILT** (§15h) | Copy mono refs (TQ-…/account). Ghost until hover; OK-check confirm; a11y label swap. Wired: receipt ref + cases table IDs. |
| haydenbleasel/announcement | `.at-announce` | **BUILT** (§15h) | design.md §6.3b scarcity band. Soft gilt wash, ink text, one inline indigo link, dismissible (localStorage `at-announce`). Home only, never stacked. |
| easemize/material-design-3-switch | `.at-switch` | **BUILT** (§15i) | M3 toggle, indigo-when-on (the action color), transform-only thumb (RTL-aware via `[dir="rtl"]`), `role="switch"`+`aria-checked`, keyboard via button. Wired into the new preferences dialog (dark-mode toggle). |
| originui/dialog | `.at-dialog` | **BUILT** (§15i) | Glass-on-chrome modal (design.md §6.3): focus-trap, Esc, scrim-close, return-focus, body scroll-lock, reduced-motion. Generic `openDialog({eyebrow,title,sec,body,actions})`. Homes: preferences + case detail. |
| originui/input + use-image-upload | refine `.at-input` | SPEC | Label-above, helper below, error below (ux `form-labels`). Image-upload only if a doc-attachment step is added to the form flow. |
| geekles007/select + multiple-select | `.at-select` | SPEC | Token-styled select/listbox; **deferred** — current needs are better served by segmented `.at-opt`/chips (no clearly-better home yet). |
| javierdev0/order-tracking | `.at-casetrack` | **BUILT** (§15i) | Case **status timeline**, rebuilt on the §6.6 stepper (unify, not a new fragment). `caseStages(status)` is pure + self-checked. Fixes a real UX bug: clicking an existing case row (requests table + telemetry feed) now opens a **case-detail dialog** with its timeline, not a new form. |
| ayushmxxn/theme-toggle | refine dock toggle | SPEC | Optional sun/moon morph (transform/opacity, reduced-motion) for the existing dock theme button. |

### Reject — clash with the calm civic register (`design-taste §9.A`, `design.md` "glass on chrome only / no glow")
designali-in/glowing-shadow · suraj-xd/liquid-glass · easemize/glass-button · Shatlyk1011/gradient-borders-button ·
xubohuah/liquid-radio · dillionverma/animated-shiny-text — we already own `.at-btn--glass` + the primary tonal
gradient; neon/glow and liquid distortion are banned outside chrome.

### Reject — no real home in a civic ops desk (would be orphan slop)
kokonutd/avatar-picker · aghasisahakyan1/animated-profile-card · starc007/be-ui-otp-input · kokonutd/interactive-checkout ·
designali-in/ai-gen · Codehagen/display-cards · chetanverma16/floating-action-menu · victorwelander/expandable-tabs ·
moumensoliman/expanding-search-dock · starc007/be-ui-create-menu · *_/heroui-tabs · reapollo/heroui-tabs ·
larsen66/efferd-dashboard · osiris-balonga/date-wheel-picker · pulseawan/apple-calendar-picker (defer date-pickers
until a form needs a date field).

## How to add the next primitive (the workflow)
1. Read this catalog + `design.md` (the law) + `atelier.md`.
2. Rebuild on `--at-*`: tokens only, logical properties, `tnum`, mono labels, one signature per screen,
   depth by hairline/surface-step (no glow), motion transform/opacity/filter only, reduced-motion safe.
3. Class prefix `.at-`; pure logic on `window.AtelierHelpers` with `console.assert` self-checks.
4. Verify: `env -u NODE_OPTIONS node --check`; `npx impeccable detect` must not exceed the baseline
   (9 in `system.css`, 1 in `tokens.css` — all design.md-mandated); no physical `left/right`; no emoji;
   375/768/1440; toggle dark; AA. Give every new primitive a real home (wire it) — never ship orphans.
