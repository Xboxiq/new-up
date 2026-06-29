# Visual feedback — screenshot analysis (English)

Direct analysis of representative images in `../screenshots/` used as feedback for the
`atelier/` build. Each entry = **what is actually seen → pattern → verdict (adopt/adapt/reject)
→ concrete mapping into our build**. Grounded in `design.md` and the `frontend-design` skill
(distinctive-not-templated, one signature, structure encodes meaning, deliberate motion).
*Observations are paraphrased; content rephrased for compliance.*

---

## 1 · `204904` — usability/form builder (3-pane block editor)
**Seen:** Left **block list** where each row is a coloured **icon tile** + title + block-type
caption (Screener, Prototype, Website, Opinion scale, Multiple choice, Tree test, Card sort,
5-second). Center **property editor**: Question / Description fields, a **Type** selector where
"Single select" vs "Multi select" are stacked options and the active one is boxed in a tinted
outline; **Choice** rows each with a delete control + "Add choice"; optional **toggles**
('Other', 'Opt out', 'Image'). Right **activity/comments** column with reaction-count chips and a
live "typing…" line. Top bar: `Build >` breadcrumb, ghost **Preview** + solid blue **Start testing**.
- **Pattern:** structured authoring — list of typed blocks → focused property panel → activity.
- **Verdict:** **Adopt** the property-editor anatomy and the **boxed active option** for segmented
  choices; **adopt** the per-row delete + "add row" pattern and optional-field toggles. **Reject**
  emoji reaction chips (we use mono/section markers).
- **Maps to:** the **service form flow** (step 2 fields), and confirms our section-hued icon tiles.

## 2 · `204344` — wellness app (vibe vs revamp, two phones)
**Seen:** A circular **progress ring** with a big centered number (73 / 70%) and a "Wellness Score"
label; a **weekday streak strip** (Sun–Sat chips, past days filled with a flame, future days muted);
serif vs sans "Good Morning" greeting; a "Guided sessions / See all" **list row** (thumbnail + title
+ duration + a "Video" pill); bottom tab bar.
- **Pattern:** single-accent radial KPI + a time/streak strip + calm list rows.
- **Verdict:** **Adapt** — the **weekday strip** validates our **golden-hour sunline** (time made
  visible); a single-accent **progress ring** is a good KPI form. **Reject** emoji mood faces.
- **Maps to:** sunline (already built); a future circular KPI for "satisfaction %" on the seal/aside.

## 3 · `204128` — EigenExplorer (dark analytics)
**Seen:** Near-black canvas; a **monospace mega-number** `$15,064,496,228.60` with a mono caption
"Current EigenLayer TVL"; a **segmented pill** `TVL | Withdrawal` (active = lighter fill); a left
**vertical icon rail** (pill of stacked icon buttons); thin **connector lines** linking annotation
dots to UI; a line chart with a mono date axis; one **red** accent + glow on a close control.
- **Pattern:** dark operational telemetry — mono labels, tabular numerals, one rationed accent.
- **Verdict:** **Adopt** for the **CA dark telemetry dashboard (design.md §6.12)**: mono `tnum`
  mega-numbers, segmented pill, vertical rail, connector "spec" lines. Our **crimson** = their red,
  rationed. Keep it flat (no glass behind data).
- **Maps to:** the future reports/telemetry screen.

## 4 · `203518` — pricing card (frosted glass, "AI Edge")
**Seen:** A **frosted glass** card, faint blue tint at top; a **POPULAR** pill with a star; an
"Includes" **checklist** with circular check icons; a large **$45** price with "per user / month";
a full-width **gradient CTA** "Upgrade to AI Edge →" with a soft glow beneath.
- **Pattern:** lit-glass card + checklist + one emphatic gradient CTA.
- **Verdict:** **Adopt** the **circular section-hued check** list and the **single gradient CTA with
  a soft glow** (exactly our `--at-btn--primary`). Glass tint stays inside the card (lit window).
- **Maps to:** receipt summary checklist; confirms primary button treatment.

## 5 · `205629` — Stillwork (calm productivity landing)
**Seen:** Rounded app frame on a **diagonal hairline texture**; pill announcement "New · …"; a huge
sans headline with a **small 3D calendar object embedded inline in the text**; a **black pill CTA**;
three **pinned-note cards** (red pushpin, paper curl, real depth): task card with **progress bars +
avatar stack**, a Pomodoro **3D timer + ring**, and an **integration logo cluster** (Notion, Gmail,
Slack, Calendar, Evernote as 3D app icons).
- **Pattern:** playful depth + an object embedded in the headline + integration cluster.
- **Verdict:** **Adapt** — an **inline spot object in the masthead** is a tasteful draughtsman wink
  (we can embed one gilt/section spot); the **integration cluster** validates our extension slots;
  diagonal texture ≈ our grain. **Reject** literal pushpins/paper-curl (too skeuomorphic for civic).
- **Maps to:** optional masthead inline-spot; extension slots styling.

## 6 · `210202` — dark "aurora" cards (two variants)
**Seen:** Two dark cards "Start Working Smarter", each filled with a **grainy aurora gradient**
(purple→blue / red→pink) rising from the bottom, an app-icon at top, and a **white pill CTA**.
- **Pattern:** atmospheric single-hue gradient *inside* a dark card; white CTA for contrast.
- **Verdict:** **Adapt** — confirms **one atmospheric gradient per surface** (our `--at-grad-dawn`
  and seal). Keep grain ≤7% in dark.
- **Maps to:** dark-mode feature/seal cards.

## 7 · `234741` — connected stepper (wallet) ★ key reference
**Seen:** A frosted card with a **vertical connected stepper**: node 1 **active** = filled blue
circle (up-arrow icon) + bold "Choose Wallet"; a **rail** drops to node 2 = pale neumorphic circle
"$" + muted "Choose Amount"; node 3 = pale circle "?" + muted "Choose coin". Active node is filled
in the accent; upcoming nodes are pale; the active label is bold, upcoming labels are muted.
- **Pattern:** one active step at a time on a connected vertical rail.
- **Verdict:** **Adopt directly** (rebuilt on tokens) — this *is* `design.md` §6.6: active node
  filled `--at-sec`, completed nodes a check, upcoming nodes hairline; bold active / muted upcoming;
  eyebrow "STEP n OF m".
- **Maps to:** **the service form flow stepper (building now).**

## 8 · `205205` — pricing comparison (dark, dotted grid)
**Seen:** Two "Pro" cards on a **dotted-grid** dark canvas. Left card has a **purple gradient border
glow** + gradient "Get started" button + a gradient "Best value" pill; the right card is plain
(no glow, white button, grey pill). Both share a feature **checklist** with check marks.
- **Pattern:** **one** card earns the glow; the rest stay quiet (scarcity = emphasis).
- **Verdict:** **Adopt** the "one signature, everything else quiet" rule for any card set; dotted-grid
  is a viable dark texture. **Reject** glowing every card.
- **Maps to:** featured bento (one large lit card), receipt emphasis.

---

## Synthesis — what the images collectively confirm
1. **One emphasised element per group** (glow/gradient on one card, others quiet) — matches our
   "one signature per screen". 
2. **Mono tabular numerals** for money/metrics, **circular checks** for lists, **segmented pills**
   for binary toggles — all already in our token system; apply consistently.
3. **Connected vertical stepper** with a single active node is the right form pattern (img 7).
4. **Time made visible** (weekday/streak strips) validates the golden-hour sunline.
5. **Atmospheric gradient lives inside a surface**, never leaks into chrome (imgs 4/6/8).
6. **Depth via soft neumorphic/frosted surfaces**, not heavy shadow (imgs 1/4/7) — our hairline +
   indigo-soft lift is the on-brand equivalent.
7. **Reject:** emoji reaction/mood chips, literal skeuomorphism (pushpins), and glowing everything.

## Direct build decisions (this iteration)
- **Form flow (§6.6):** connected vertical stepper modelled on img 7 — active node filled
  `--at-sec`, completed = check, upcoming = hairline; boxed active option for segmented choices
  (img 1); optional-field toggles; reuse `getAdvisories(code)` to surface review/danger notes in
  the review step.
- **Gilt receipt (§6.7):** frosted card (img 4) + a **drawn gilt seal** that settles on a damped
  spring + mono `tnum` reference + a **circular-check summary list** + one **ceremonial** gold CTA.
  One gold moment per flow.


---

## 9 · CA dark telemetry / reports dashboard (design.md §6.12) — design + critique

> Increment added this session. The CA domain is "Complaints **& Reports**." The complaints
> view previously showed CA service cards + a generic open-cases table — competent but with **no
> single signature**. design.md §6.12 explicitly reserves one component for exactly this domain:
> a **dark operational dashboard** ("the one place dense data + dark + mono converge"). Building it
> gives the CA screen its missing point of view and closes a real design.md gap. Reference image:
> `screenshots/20260625_204128` (EigenExplorer), analyzed in §3 above — mono `tnum` mega-numbers,
> a segmented pill, a vertical rail, connector "spec" lines, one rationed accent, flat (no glass).

### Self-critique first (the brief's gate: "would I produce this for any similar request?")
A "dark dashboard with KPI strip + chart + live feed" is, generically, a templated answer. To make
it specific to *this* civic-electricity world and not interchangeable SaaS, four decisions:
1. **A deliberate dark island, not a dark app.** The panel renders Indigo Dusk *inside* the warm
   Walnut-Ivory broadsheet — the sanctioned "one place dark converges," contained like a lit
   control-room window. (In dark mode it sits as a raised slate panel, still distinct.)
2. **The chart is the four civic domains, never a rainbow.** Bars use the 1:1 section hues
   (CS Cobalt · CT Bronze · CB Teal · CA Rosewood) and nothing else — the chart literally *is* the
   platform's structure (design.md §1.5, §6.12 "series use the section hues"). Not arbitrary series.
3. **Honest data only.** KPI values come from `KPIS` (today / open / collected / satisfaction); the
   distribution counts active `RECENT_CASES` per domain; the live feed is the real cases with their
   Arabic civic states (فريق الطوارئ، موافقة مدير، فحص ميداني) and `TQ-…` refs. **No invented series,
   no fake time-range toggle** (rejected: a اليوم/الأسبوع period switch would imply time-series data
   we don't have). The one segmented control filters the feed by a field that *exists* — **priority**
   (الكل · عاجل · قيادة · اعتيادي) — real triage, not decoration.
4. **One draughtsman connector, tied to content.** A single thin connector line annotates the
   **URGENT** KPI with the real CA0002 rule ("بلاغ خطر = أولوية قصوى · إشعار فوري") — used exactly
   once (img-3's "spec line"), as meaning, not ornament.

This passes: it is grounded in the subject's world and the token system, not a generic template.

### The three axes (justification before building)
- **UX value.** Gives CA staff a single monitoring surface *before* they act: today's intake, open
  backlog, urgent count, and a scannable live case feed with priority-coded dots. Triage is faster —
  the crimson urgent items and the urgent KPI are immediately legible, and the priority filter narrows
  the feed to what needs attention now. "Monitor, then file" in one screen.
- **Aesthetic.** Realizes §6.12 literally — Indigo Dusk surface, **mono labels throughout**, a top
  **KPI strip**, a **live-feed row list** (status dot · mono ref · state · timestamp), **one chart in
  section hues**, kept **flat (no glass behind data)**, `tnum`+slashed-zero numerals. Depth is by
  **surface step** (panel `surface` → recessed `bg` wells) + hairlines, never a gray box-shadow.
  Motion is one orchestrated moment: bars draw in (transform `scaleX`, ease-out, no spring) and a
  single "LIVE" dot pulses (opacity) — both off under reduced-motion.
- **Arrangement.** The dark panel is the **one signature** of the CA view and sits at the top:
  headBlock → **telemetry panel (signature)** → quiet CA service cards (the "file a report" zone).
  Inside the panel, top-to-bottom by decreasing aggregation: KPI strip (totals) → domain chart
  (distribution) → live feed (individual cases). The previous standalone CA cases-table is folded
  into the richer live feed, so the screen keeps exactly one focal object.

### Anti-slop guardrails applied
Tokens only · logical properties only · `tnum`+`zero` · mono eyebrows/labels · **no** 3px
`border-inline-start` and **no** `var(--at-spring)` animation inside the panel (so impeccable stays at
its mandated baseline of 9, with **zero new findings**) · one accent discipline kept (crimson = urgent
only; section hues 1:1; the feed's "leadership/VIP" dot is the rationed gold) · AA contrast on Indigo
Dusk (Moon-Ink text on Slate, lifted section hues) · reduced-motion disables draw + pulse.
