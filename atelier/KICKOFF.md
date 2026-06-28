# KICKOFF — build the platform from scratch (paste into a fresh session)

> Two ways to use this:
> 1. **Short trigger** — paste **§0** only (the repo's steering `.kiro/steering/atelier.md` +
>    `.kiro/steering/skills.md` auto-load the rest).
> 2. **Self-contained** — if steering isn't available, paste **§0 + §1–§6** (the full direction,
>    beginning to last word).
> `CONTINUE.md` = resume the *existing* build. `KICKOFF.md` (this file) = rebuild *from zero, gradually*.

---

## §0 · THE PASTE PROMPT (from scratch, gradual)

```
ابنِ من الصفر وبالتدريج منصة «تدفّق الخير» — منصة خدمات مشتركي الكهرباء (الرصافة)، عربية RTL أولاً،
وفق ملف design.md حرفياً (هو القانون — اقرأه كاملاً قبل أي سطر). النهج: مجلد atelier/ مكتفٍ ذاتياً،
بلا أدوات بناء (HTML ثابت + Vanilla JS)، نواة توكنات --at-* مرآةً لـ design.md (لا تحايُل على --f-*)،
وأعد استخدام البيانات من ../data.js و ../final_branches_data.js (لا تخترع بيانات).

الرؤية: «رواق مدني عند ساعة الغروب» — صحيفة هادئة لا لوحة widgets. توقيع واحد لكل شاشة. ابنِ هذه
الإشارات تدريجياً: دوك زجاجي iOS (التوقيع) · منضدة أوامر عربية بنيّة واحدة (خدمات/فروع/محلات/طلبات/أجور)
· خطّ غروب يتتبّع الدوام · بِنتو «نافذة مضيئة» بأجسام ثلاثية الأبعاد · سجلّ موحّد بأسلوب Notion ·
أكورديون الأقسام الأربعة · وصول سريع (مفضّلة/أخير/أكثر) · ختم ذهبي احتفالي واحد · تدفّق نموذج (stepper)
+ إيصال ذهبي · تبويبات (خدمات/فروع/أجور/شكاوى/طلبات/تحديثات) · مساحات إضافات (Vercel/Notion/Figma/Skills).

التزم بالضوابط: توكنات فقط (لا hex/px خام) · خصائص منطقية فقط (لا left/right) · أرقام tnum + slashed-zero ·
eyebrow مونو · العمق بالضوء (hairline + رفعة إنديغو/توهّج داكن، لا ظلال رمادية) · لون فعل واحد (إنديغو)،
لون قسم 1:1، ذهب احتفالي فقط، قرمزي للعاجل/القيادة · حركة transform/opacity/filter فقط بنابض مكبوح ≤6%
واحترام prefers-reduced-motion · إبراز العربية باللون لا serif-italic · أيقونات SVG monoline 1.5px مرسومة
مخصّصة للموضوع ومتحرّكة (لا إيموجي) · تدرّجات نغمية للعلامة فقط · زجاج على الكروم فقط (سطح ≥72%) ·
وضع داكن Indigo Dusk · وصولية ومسارات لوحة مفاتيح وتباين AA.

فعّل السكلز أساساً (frontend-design أولاً، ثم refero-design / design-taste-frontend / impeccable / animate /
design-motion-principles / creative-fx / ui-ux-pro-max). حلّل صور screenshots/ كتغذية بصرية، وادمج
نتائجها. اكتب كل التحاليل والأفكار والنتائج والتوثيق باللغة الإنجليزية، مفصّلاً وواضحاً.

اعمل بالتدريج (الصغير قبل الكبير): خطّط ثم انتقدْ تصميمك («هل أنتج هذا لأي طلب مشابه؟ إن نعم فأعد») قبل
الكتابة. بعد كل تغيير: impeccable detect → [] · فحص الخصائص المنطقية/الإيموجي · 375/768/1440 · بدّل
الداكن · reduced-motion · تباين AA · وتحقّق JS عبر env -u NODE_OPTIONS node --check. ارفع على فرع +
Pull Request (لا git push مباشر). وعند اقتراح أي ميزة بصرية اشرح (لنفسك) قيمتها لتجربة المستخدم،
وجماليتها، وموضعها في الترتيب — بلا كليشيهات ولا حشو.
```

---

## §1 · Project & law
**تدفّق الخير / Tadfuq Al-Khayr** — an Arabic-first, RTL, civic **electricity subscriber-services**
ops platform (Rasafa: subscriptions CS / technical CT / billing CB / complaints CA). **`design.md`
(repo root) is the single source of truth — read it fully before any UI.** Identity: Walnut Ivory +
Royal Indigo (only action colour) + Heritage Crimson (urgent/lead) + Warm Gilt (ceremonial only) +
four OKLCH section hues; dark = Indigo Dusk. Voice: civic atelier at golden hour. One signature/screen.

## §2 · Mechanism (how to build)
No build step · static `atelier/index.html` + vanilla JS · token namespace `--at-*` mirroring
design.md §1/§17.1 (never alias `--f-*`/`--nl-*`) · reuse data from `../data.js` (SERVICES, SECTIONS,
PRICING, RECENT_CASES, KPIS, getAdvisories, fmt) + `../final_branches_data.js` (BRANCHES,
MAHALLA_INDEX, BRANCH_MAP, BRANCH_STATS) · files: `tokens.css` · `system.css` (`.at-` classes) ·
`icons.js` (bespoke domain SVG) · `art.js` (illustration tiers) · `app.js` (renderer + router +
pure helpers with runnable `console.assert` self-checks) · validate JS with
`env -u NODE_OPTIONS node --check` (a NODE_OPTIONS preload otherwise breaks node).

## §3 · Guardrails (reject your own output if it breaks these)
Tokens only · logical properties only · `tnum`+slashed-zero · mono eyebrows · depth by light
(hairline + indigo soft lift / dark glow; no grey shadows) · one action colour (indigo), section
hue 1:1, gold ceremonial-only, crimson urgent/lead · motion = transform/opacity/filter/color, damped
spring ≤6%, exit faster than enter, reduced-motion safe · Arabic emphasis by colour, never serif-
italic · SVG monoline 1.5px icons, **never emoji** · one signature per screen · glass on chrome only
(surface ≥72%) · dark Indigo Dusk · responsive 375→1440 · visible focus · AA contrast.

## §4 · References & skills (use the principle, rebuild on tokens — never copy)
Apple Liquid Glass · Vercel (crisp mono) · Origin (lit-window cards) · Seed (lift-by-colour) · Notion
(calm density) · gradientbuttons.colorion (tonal CTA) · backgrounds.supply (grain/mesh) · neuform
(telemetry/accordion) · designmd.supply (swatch-trio) · getdesign.md (directory) · coverflow +
open-design (draughtsman framing). Full dossier: `design.md` §10/§18 + `.agents/skills/creative-fx/
references/`. Activate skills (vendored + locked in `skills-lock.json`; network is integrations-only
so `npx skills add` can't fetch — use local copies): **frontend-design** first, then refero-design,
design-taste-frontend, impeccable, animate, design-motion-principles, creative-fx, ui-ux-pro-max,
handoff. Visual feedback: analyze `screenshots/` (25 imgs) → change → screenshot → compare → repeat.

## §5 · Gradual build order (small → big)
1. **Foundation:** `tokens.css` (palette/type/space/radius/motion/elevation, light + Indigo Dusk) →
   `system.css` base + the **liquid-glass dock** (the signature) + router shell in `app.js`.
2. **Home, piece by piece:** masthead (kinetic, colour-emphasis) + golden-hour sunline → concierge
   command bar → featured lit-window bento (3D-spot + bespoke icons) → unified Ledger → domain
   accordion → quick-access (fav/recent/most, localStorage) → gilt seal → tips + notifications →
   extension slots.
3. **Tabs:** services directory (search+chips) · branches · fees · complaints · requests · updates.
4. **Core loop:** service **form flow** (connected stepper §6.6) → **gilt receipt** (§6.7).
5. **Bigger:** mahalla map · dark telemetry dashboard for CA (§6.12) · Cover Flow onboarding (§6.8) ·
   concierge intent parsing (sentence → pre-filled service+branch).
6. **Polish pass:** focus states, keyboard order, skeleton loaders, empty/error, AA in dark.

## §6 · Per-change verification & habits
`impeccable detect <path>` → `[]` · scan no physical `left/right`, no emoji · responsive 375/768/1440 ·
toggle dark · reduced-motion · AA contrast · `node --check`. Keep a runnable self-check for any new
non-trivial pure logic. **Document all analysis/ideas/results in English.** Ship on a branch + PR
(never `git push` directly). For every proposed visual feature, justify (to yourself) its UX value,
aesthetic fit, and place in the arrangement — no clichés, no AI-slop, no filler.
