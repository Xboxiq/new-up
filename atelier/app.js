/* ===========================================================================
   atelier/app.js — "البَهو · Golden-Hour Atelier"
   Vanilla renderer + interactivity. Binds the live data layer
   (window.SERVICES / SECTIONS / PRICING / RECENT_CASES / KPIS /
    getAdvisories / BRANCHES) into the new broadsheet shell.
   No framework, no build — matches the project's no-build approach.
   =========================================================================== */
(function () {
  "use strict";

  // ---- tiny DOM helpers -------------------------------------------------
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "text") n.textContent = v;
      else if (k === "on") Object.keys(v).forEach(function (ev) { n.addEventListener(ev, v[ev]); });
      else if (k === "style") n.setAttribute("style", v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function ms(name, cls) { return el("span", { class: "ms" + (cls ? " " + cls : ""), text: name, "aria-hidden": "true" }); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // ---- data (reused) ----------------------------------------------------
  var SERVICES = window.SERVICES || [];
  var SECTIONS = window.SECTIONS || [];
  var SECTION_MAP = window.SECTION_MAP || {};
  var SERVICE_MAP = window.SERVICE_MAP || {};
  var CASES = window.RECENT_CASES || [];
  var PRICING = window.PRICING || {};
  var KPIS = window.KPIS || {};
  var BRANCHES = window.BRANCHES || [];
  var fmt = window.fmt || function (n) { return String(n); };
  var secClass = function (code) { return "sec-" + String(code || "").toLowerCase(); };
  var ART = window.AtelierArt || {};
  var ICONS = window.AtelierIcons || {};
  var BRANCH_STATS = window.BRANCH_STATS || {};
  var MAHALLA_INDEX = window.MAHALLA_INDEX || {};
  var BRANCH_MAP = window.BRANCH_MAP || {};

  // ---- pure helpers (covered by the self-check at the bottom) -----------
  function filterServices(list, query, section) {
    var q = (query || "").trim().toLowerCase();
    return list.filter(function (s) {
      if (section && section !== "ALL" && s.section !== section) return false;
      if (!q) return true;
      return (s.name + " " + s.code).toLowerCase().indexOf(q) !== -1;
    });
  }
  function toggleId(arr, id) {
    return arr.indexOf(id) !== -1 ? arr.filter(function (x) { return x !== id; }) : [id].concat(arr);
  }
  function mostUsed(list, n) {
    return list.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, n || 6);
  }
  // normalise Arabic-Indic / Persian digits → Latin (so "محلة ١٤٣" matches "143")
  function toLatinDigits(s) {
    return String(s)
      .replace(/[\u0660-\u0669]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
      .replace(/[\u06f0-\u06f9]/g, function (d) { return d.charCodeAt(0) - 0x06f0; });
  }
  // normalise Arabic for matching: Latin digits · strip tashkeel · unify alef/ya/ta-marbuta.
  function normalizeAr(s) {
    return toLatinDigits(s)
      .replace(/[\u064B-\u0652\u0670]/g, "")
      .replace(/[\u0623\u0625\u0622]/g, "\u0627")  // أإآ → ا
      .replace(/\u0649/g, "\u064A")                // ى → ي
      .replace(/\u0629/g, "\u0647")                // ة → ه
      .replace(/\s+/g, " ").trim().toLowerCase();
  }
  // «المنضدة» — one query, routed across every domain. Pure: returns plain data.
  function searchAll(q) {
    var raw = (q || "").trim();
    var out = { services: [], branches: [], cases: [], fees: [] };
    if (!raw) return out;
    var ql = toLatinDigits(raw).toLowerCase();
    out.services = SERVICES.filter(function (s) { return (s.name + " " + s.code).toLowerCase().indexOf(ql) !== -1; })
      .slice(0, 5).map(function (s) { return { type: "service", id: s.code, title: s.name, sub: s.code + " · " + ((SECTION_MAP[s.section] || {}).name || ""), section: s.section, icon: s.icon }; });
    var br = BRANCHES.filter(function (b) { return (b.name + " " + b.id).toLowerCase().indexOf(ql) !== -1; });
    if (/^\d+$/.test(ql) && MAHALLA_INDEX[ql]) { var hit = BRANCH_MAP[MAHALLA_INDEX[ql]]; if (hit && br.indexOf(hit) === -1) br = [hit].concat(br); }
    out.branches = br.slice(0, 4).map(function (b) { return { type: "branch", id: b.id, title: b.name, sub: b.id + " · " + b.mahallas.length + " محلة" + (/^\d+$/.test(ql) && MAHALLA_INDEX[ql] === b.id ? " · تشمل محلة " + ql : ""), section: "CT", icon: "apartment" }; });
    out.cases = CASES.filter(function (c) { return (c.id + " " + c.subscriber).toLowerCase().indexOf(ql) !== -1; })
      .slice(0, 4).map(function (c) { var s = SERVICE_MAP[c.svc] || {}; return { type: "case", id: c.id, title: c.subscriber, sub: c.id + " · " + c.status, section: s.section || "CS", icon: "description" }; });
    var fees = [];
    Object.keys(PRICING).forEach(function (k) { PRICING[k].items.forEach(function (it) { if ((it.name + " " + PRICING[k].label).toLowerCase().indexOf(ql) !== -1) fees.push({ type: "fee", id: k + ":" + it.key, title: it.name, sub: PRICING[k].label + " · " + fmt(it.amount) + " د.ع", section: "CB", icon: "request_quote" }); }); });
    out.fees = fees.slice(0, 4);
    return out;
  }
  // golden-hour: progress through the branch workday (0..1) + minutes left. Pure.
  function goldenProgress(now, startH, endH) {
    var mins = now.getHours() * 60 + now.getMinutes();
    var s = startH * 60, e = endH * 60;
    var pct = Math.max(0, Math.min(1, (mins - s) / (e - s)));
    return { pct: pct, remainMin: Math.max(0, e - mins) };
  }
  // CA telemetry aggregation (design.md §6.12). Pure: derives from the live data
  // (RECENT_CASES + KPIS + SECTIONS) — never invents series. serviceMap maps a
  // case's svc code → its section, so cases distribute across the four domains.
  function caTelemetry(cases, kpis, sections, serviceMap) {
    cases = cases || []; kpis = kpis || {}; sections = sections || []; serviceMap = serviceMap || {};
    var byDomain = {};
    sections.forEach(function (s) { byDomain[s.code] = 0; });
    cases.forEach(function (c) {
      var sec = (serviceMap[c.svc] || {}).section;
      if (sec != null) { byDomain[sec] = (byDomain[sec] || 0) + 1; }
    });
    var max = 1;
    Object.keys(byDomain).forEach(function (k) { if (byDomain[k] > max) max = byDomain[k]; });
    var count = function (p) { return cases.filter(function (c) { return c.priority === p; }).length; };
    return {
      byDomain: byDomain, max: max, total: cases.length,
      urgent: count("urgent"), vip: count("vip"),
      today: kpis.todayCases || 0, delta: kpis.todayDelta || 0,
      open: kpis.pending || 0, collected: kpis.collected || 0, satisfaction: kpis.satisfaction || 0,
    };
  }
  // «المنضدة» intent compiler (design.md home signature). Grounded in the REAL
  // service catalog + mahalla→branch index — turns an operator sentence into a
  // structured, pre-fillable request. Pure + testable. Lexicon keys map verb
  // phrases to services that actually exist in window.SERVICES.
  var INTENT_LEXICON = [
    { code: "CS0001", w: 4, kw: ["اشتراك جديد", "عمل اشتراك", "ربط جديد", "عداد جديد", "نصب عداد"] },
    { code: "CS0011", w: 4, kw: ["نقل ملكية", "بيع اشتراك", "شراء اشتراك", "ورثة", "تحويل ملكية"] },
    { code: "CS0003", w: 3, kw: ["تغيير صنف", "تغيير الصنف", "تحويل تجاري", "تحويل صناعي"] },
    { code: "CS0004", w: 3, kw: ["ايقاف خدمة", "قطع مؤقت", "ايقاف اشتراك", "قطع تيار مؤقت"] },
    { code: "CS0005", w: 3, kw: ["تفعيل اشتراك", "اعادة تفعيل", "فتح حساب", "اشتراك موقوف"] },
    { code: "CS0006", w: 3, kw: ["الغاء اشتراك", "غلق حساب"] },
    { code: "CS0007", w: 3, kw: ["اعتراض", "الاعتراض على القوائم"] },
    { code: "CS0009", w: 3, kw: ["قراءة مقياس"] },
    { code: "CS0010", w: 3, kw: ["اشتراك مؤقت", "موقع بناء"] },
    { code: "CT0009", w: 4, kw: ["فحص مقياس", "كشف مقياس", "صيانة مقياس", "تبديل مقياس", "عطل مقياس"] },
    { code: "CT0008", w: 3, kw: ["نقل مقياس", "تغيير موقع المقياس", "نقل موقع المقياس"] },
    { code: "CT0003", w: 3, kw: ["تغيير كابل", "كابل مشترك"] },
    { code: "CT0007", w: 3, kw: ["زيادة قوة", "تغيير نوع المقياس", "ثلاثي اطوار"] },
    { code: "CT0001", w: 3, kw: ["تغيير موقع عامود", "ضرر عامود"] },
    { code: "CT0002", w: 3, kw: ["ركيزة محولة", "تغيير موقع المحولة"] },
    { code: "CB0001", w: 3, kw: ["دفع قائمة", "تسديد قائمة", "دفع اجور", "اجور كهرباء", "تسديد فاتورة"] },
    { code: "CB0006", w: 4, kw: ["تقسيط", "تسوية مالية", "ترتيب دفع", "اقساط"] },
    { code: "CB0004", w: 3, kw: ["نسخة قائمة", "بدل مفقود"] },
    { code: "CB0002", w: 3, kw: ["تقرير استهلاك"] },
    { code: "CA0001", w: 4, kw: ["تلاعب", "عبث بالمقياس", "سرقة تيار"] },
    { code: "CA0002", w: 5, kw: ["حالة خطر", "بلاغ خطر", "خطر", "حريق", "شرارة"] },
    { code: "CA0003", w: 3, kw: ["ضرر شبكة", "اضرار الشبكة", "فقد مكونات"] },
    { code: "CA0004", w: 3, kw: ["شكوى ادارية", "نوعية الخدمة", "شكوى"] },
  ];
  function parseIntent(query, opts) {
    opts = opts || {};
    var services = opts.services || SERVICES, serviceMap = opts.serviceMap || SERVICE_MAP,
      mahallaIndex = opts.mahallaIndex || MAHALLA_INDEX, branchMap = opts.branchMap || BRANCH_MAP,
      typeOpts = opts.typeOpts || TYPE_OPTS, lexicon = opts.lexicon || INTENT_LEXICON;
    var nq = normalizeAr(query);
    if (nq.length < 2) return null;
    // (1) action: lexicon score + service-name token overlap (>=2 tokens to avoid noise)
    var score = {};
    lexicon.forEach(function (e) { e.kw.forEach(function (k) { if (nq.indexOf(normalizeAr(k)) !== -1) score[e.code] = (score[e.code] || 0) + e.w; }); });
    services.forEach(function (s) {
      var hit = 0;
      normalizeAr(s.name).split(/[ \/()\u060c,]+/).forEach(function (t) { if (t.length >= 3 && nq.indexOf(t) !== -1) hit++; });
      if (hit >= 2) score[s.code] = (score[s.code] || 0) + hit;
    });
    var bestCode = null, best = 0;
    Object.keys(score).forEach(function (c) { if (score[c] > best) { best = score[c]; bestCode = c; } });
    if (!bestCode || !serviceMap[bestCode]) return null;
    var svc = serviceMap[bestCode];
    // (2) locality: mahalla number → its branch (honest, from the real index)
    var mahalla = null, branch = null;
    var m = nq.match(/(?:محله\s*)?\b(\d{2,3})\b/);
    if (m && mahallaIndex[m[1]]) { mahalla = m[1]; branch = branchMap[mahallaIndex[m[1]]] || null; }
    // (3) type/category within the service's own section
    var type = null, ts = typeOpts[svc.section] || [];
    for (var i = 0; i < ts.length; i++) { if (nq.indexOf(normalizeAr(ts[i])) !== -1) { type = ts[i]; break; } }
    return {
      action: { code: svc.code, name: svc.name, section: svc.section },
      mahalla: mahalla, branch: branch ? { id: branch.id, name: branch.name } : null,
      type: type, confidence: 0.5 + (branch ? 0.25 : 0) + (type ? 0.25 : 0), raw: query,
    };
  }
  function prefillFromIntent(intent) {
    var d = {};
    if (intent.type) d.type = intent.type;
    var loc = [];
    if (intent.mahalla) loc.push("محلة " + intent.mahalla);
    if (intent.branch) loc.push(intent.branch.name + " (" + intent.branch.id + ")");
    if (loc.length) d.details = loc.join(" · ");
    return d;
  }
  window.AtelierHelpers = { filterServices: filterServices, toggleId: toggleId, mostUsed: mostUsed, searchAll: searchAll, goldenProgress: goldenProgress, caTelemetry: caTelemetry, parseIntent: parseIntent, prefillFromIntent: prefillFromIntent };

  // ---- persisted state --------------------------------------------------
  function load(key, fallback) { try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  var state = {
    tab: "home",
    form: null,      // { code, step, data } — active service form flow
    receipt: null,   // { code, ref, data } — completed flow (gilt moment)
    favs: load("at-favs", ["CS0001", "CB0001"]),
    recent: load("at-recent", ["CT0009", "CB0006", "CS0004"]),
    ledgerFilter: "all",
    quickMode: "most",
    accord: "CS",
    dir: { q: "", sec: "ALL" },
    tipIndex: 0,
    telemetry: "all",   // CA reports live-feed priority filter (§6.12)
  };
  function setFav(code) {
    state.favs = toggleId(state.favs, code);
    save("at-favs", state.favs);
    render();
  }
  // reference number for a completed request (pure-ish; format is asserted)
  function genRef() { return "TQ-2026-08-" + (1400 + Math.floor(Math.random() * 600)); }
  function openService(code, prefill) {
    if (!SERVICE_MAP[code]) return;
    state.recent = toggleId(state.recent.filter(function (x) { return x !== code; }), code).slice(0, 12);
    save("at-recent", state.recent);
    if (window.AtelierNav) { window.AtelierNav(code, prefill); }   // host app may override routing
    else { state.receipt = null; state.form = { code: code, step: 0, data: prefill || {} }; } // built-in flow
    render();
    var m = $(".at-main"); if (m) m.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
  }

  // ---- static editorial content (structure fixed, content is data) ------
  var UPDATES = [
    { sec: "CB", tag: "تحديث", t: "تفعيل الدفع الإلكتروني للقوائم", b: "يمكن الآن تسديد قائمة الأجور عبر المحفظة الرقمية مباشرة من شاشة الحالة، مع إيصال فوري.", time: "اليوم · 09:20", ico: "payments" },
    { sec: "CS", tag: "سياسة", t: "تبسيط مستندات الاشتراك الجديد", b: "أحد المستندين (إجازة البناء أو ضريبة العقار) يكفي لقبول طلب الاشتراك المنزلي.", time: "اليوم · 08:05", ico: "policy" },
    { sec: "CT", tag: "صيانة", t: "نافذة صيانة مجدولة — مغذّي النضال", b: "فصل تيار منسّق ليلة الخميس 23:00–02:00 لتغيير ركيزة محوّلة. أبلِغوا المشتركين المتأثرين.", time: "أمس · 16:40", ico: "engineering" },
    { sec: "CA", tag: "تنبيه", t: "تصعيد بلاغات الخطر تلقائياً", b: "بلاغات الخطر تُشعِر فرق الطوارئ فور التسجيل قبل إكمال النموذج — أولوية قصوى.", time: "أمس · 11:15", ico: "crisis_alert" },
    { sec: "CB", tag: "إصدار", t: "دليل الأجور ٢٠٢٦ مُحدّث", b: "جداول أجور الكشف وإعادة التيار حُدّثت وفق الرسوم الرسمية الجديدة. راجعوا تبويب الأجور.", time: "الأحد · 14:00", ico: "menu_book" },
  ];
  var NOTIFS = [
    { sec: "CA", t: "بلاغ خطر جديد — مَحلة 143", s: "TQ-2026-08-1407 · فريق الطوارئ", time: "منذ 6 د", urgent: true },
    { sec: "CB", t: "موافقة مدير مطلوبة — تقسيط", s: "TQ-2026-08-1409 · حسن جاسم", time: "منذ 25 د" },
    { sec: "CS", t: "٢٣ معاملة بانتظار توقيعك", s: "طابور الاعتماد", time: "منذ ساعة" },
    { sec: "CT", t: "اكتمل فحص مقياس — جاهز للدفع", s: "TQ-2026-08-1413 · هدى محمود", time: "منذ 4 س" },
  ];
  var SLOTS = [
    { name: "Vercel", ico: "rocket_launch", desc: "لوحة نشر ومعاينة — اربط النشر التلقائي وحالة البناء." },
    { name: "Notion", ico: "description", desc: "قاعدة معرفة وإجراءات — ضمّن صفحات الدليل والسياسات." },
    { name: "Figma", ico: "design_services", desc: "معاينة تصاميم حيّة — اعرض ملفات الواجهة قيد التطوير." },
    { name: "Skills", ico: "extension", desc: "إضافات وكلاء التصميم — refero · animate · creative-fx." },
  ];
  var TAB_SEC = { home: "indigo", services: "CS", branches: "CT", fees: "CB", complaints: "CA", requests: "CS", updates: "CB" };
  var TIP_META = {
    danger: { ico: "warning", tag: "تحذير", sec: "CA" },
    review: { ico: "fact_check", tag: "مراجعة", sec: "CS" },
    scale: { ico: "expand", tag: "قابل للتوسع", sec: "CT" },
    tip: { ico: "tips_and_updates", tag: "نصيحة", sec: "CB" },
    faq: { ico: "help", tag: "سؤال شائع", sec: "CB" },
  };

  function allTips() {
    var out = [];
    SERVICES.forEach(function (s) {
      (window.getAdvisories ? window.getAdvisories(s.code) : []).forEach(function (a) {
        out.push({ code: s.code, t: a.t, x: a.x });
      });
    });
    // de-dupe by text
    var seen = {}, uniq = [];
    out.forEach(function (a) { if (!seen[a.x]) { seen[a.x] = 1; uniq.push(a); } });
    return uniq.length ? uniq : [{ code: "CS0001", t: "tip", x: "أكمل الحقول أمام المشترك مباشرة — الحفظ التلقائي يحمي عملك." }];
  }
  var TIPS = allTips();

  // =====================================================================
  // RENDER — service-derived pieces
  // =====================================================================
  function svcCard(s) {
    var sec = SECTION_MAP[s.section] || {};
    var node = el("button", {
      class: "at-svc " + secClass(s.section),
      type: "button",
      on: {
        click: function () { openService(s.code); },
        mousemove: function (e) {
          var r = node.getBoundingClientRect();
          node.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          node.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        },
      },
    }, [
      el("div", { class: "at-svc__top" }, [
        el("span", { class: "at-svc__ico" }, [ms(s.icon)]),
        starBtn(s.code),
      ]),
      el("div", {}, [
        el("div", { class: "at-svc__eyebrow" }, [(sec.name_en || sec.name || "") + " · " + s.section]),
        el("div", { class: "at-svc__name", text: s.name }),
      ]),
      el("div", { class: "at-svc__stat at-tnum" }, [
        el("span", {}, [ms("schedule"), " " + s.sla + "ي"]),
        el("span", { class: "at-svc__dot" }),
        el("span", {}, [ms("trending_up"), " " + s.popularity + "٪"]),
        el("span", { class: "at-swatch", style: "margin-inline-start:auto", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]),
      ]),
    ]);
    return node;
  }
  function starBtn(code) {
    var on = state.favs.indexOf(code) !== -1;
    return el("button", {
      class: "at-star", type: "button", "aria-pressed": on ? "true" : "false",
      "aria-label": on ? "إزالة من المفضلة" : "إضافة إلى المفضلة",
      on: { click: function (e) { e.stopPropagation(); setFav(code); } },
    }, [ms(on ? "star" : "star_outline")]);
  }

  // =====================================================================
  // VIEW: HOME
  // =====================================================================
  function viewHome() {
    // ---- masthead (crosshair frame · kinetic blur-in · golden-hour sunline · stat strip)
    var done = 47; // ceremonial: completed today (derived stand-in)
    var mast = el("header", { class: "at-mast at-frame" }, [
      el("span", { class: "at-frame__x at-frame__x--ts" }), el("span", { class: "at-frame__x at-frame__x--te" }),
      el("span", { class: "at-mast__date at-kin at-kin--1" }, [
        el("span", { class: "at-mast__pulse" }),
        new Date().toLocaleDateString("ar-IQ-u-ca-gregory", { weekday: "long", day: "numeric", month: "long" }) + " · مركز الرصافة · فرع النضال",
      ]),
      el("h1", { class: "at-kin at-kin--2", html: "أهلاً أستاذ رامز — <b>قُل ما تريد فعله</b>" }),
      el("p", { class: "at-mast__lede at-kin at-kin--3", text: "اكتب نيّتك في المنضدة أدناه وستذهب مباشرةً إلى الخدمة أو الفرع أو المحلة أو الطلب — لا تنقّل بين القوائم." }),
      sunline(),
      el("div", { class: "at-statstrip" }, [
        stripItem(fmt(SERVICES.length), "خدمة"),
        stripItem(fmt(SECTIONS.length), "أقسام"),
        stripItem(fmt(BRANCHES.length), "مراكز"),
        stripItem(fmt(BRANCH_STATS.subscribers || 73030), "مشترك"),
      ]),
      el("span", { class: "at-frame__x at-frame__x--bs" }), el("span", { class: "at-frame__x at-frame__x--be" }),
    ]);

    // ---- main column: featured bento + ledger + accordion + extension
    var main = el("div", { class: "at-col" }, [featuredBento(), ledgerCard(), accordionCard(), extensionCard()]);
    // ---- aside: gilt seal + quick access + tip + notifs
    var aside = el("aside", { class: "at-aside" }, [sealCard(done), quickCard(), tipCard(), notifCard()]);

    return el("div", { class: "at-view" }, [mast, deskHero(), el("div", { class: "at-broadsheet" }, [main, aside])]);
  }

  function stripItem(num, label) {
    return el("span", { class: "at-statstrip__i" }, [el("span", { class: "at-statstrip__n at-tnum", text: num }), el("span", { class: "at-statstrip__l", text: label })]);
  }

  // golden-hour sunline — the workday rendered as light (08:00 → 16:00 branch hours)
  function sunline() {
    var g = goldenProgress(new Date(), 8, 16);
    var pct = Math.round(g.pct * 100), label;
    if (g.pct <= 0) label = "الدوام لم يبدأ";
    else if (g.pct >= 1) label = "انتهى الدوام";
    else { var h = Math.floor(g.remainMin / 60), m = g.remainMin % 60; label = "تبقّى " + (h ? h + "س " : "") + m + "د"; }
    return el("div", { class: "at-sunline at-kin at-kin--4" }, [
      el("span", { class: "at-sunline__lbl" }, [ms("wb_twilight"), "الدوام"]),
      el("div", { class: "at-sunline__rail" }, [
        el("span", { class: "at-sunline__fill", style: "transform:scaleX(" + g.pct.toFixed(3) + ")" }),
        el("span", { class: "at-sunline__sun", style: "inset-inline-start:" + pct + "%" }),
      ]),
      el("span", { class: "at-sunline__lbl at-tnum", text: pct + "٪ · " + label }),
    ]);
  }

  // «المنضدة» — the concierge command surface (the home signature).
  // Self-contained: handles its own input/keys/results without re-rendering
  // the whole view (so focus is never lost while typing).
  function deskHero() {
    var TRY = [["عمل اشتراك جديد", "add_home"], ["محلة ١٤٣", "pin_drop"], ["TQ-2026", "tag"], ["أجور الكشف", "request_quote"], ["فحص مقياس", "fact_check"]];
    var q = "", flat = [], active = -1;
    var input = el("input", { class: "at-desk__input", id: "at-desk-input", type: "search", autocomplete: "off", spellcheck: "false", "aria-label": "منضدة الأوامر", placeholder: "اكتب ما تريد فعله… خدمة، فرع، محلة، رقم طلب، أو أجور" });
    var results = el("div", { class: "at-desk__results", role: "listbox", hidden: true });
    var tryRow = el("div", { class: "at-desk__try" }, TRY.map(function (t) {
      return el("button", { class: "at-trychip", type: "button", on: { click: function () { input.value = t[0]; q = t[0]; recompute(); input.focus(); } } }, [ms(t[1]), t[0]]);
    }));
    var wrap = el("div", { class: "at-desk", "data-open": "0" }, [
      el("div", { class: "at-desk__field" }, [el("span", { class: "at-desk__lead" }, [ms("bolt")]), input, el("span", { class: "at-desk__hint", text: "⌘K" })]),
      tryRow, results,
    ]);

    function act(it) {
      if (!it) return;
      if (it.type === "intent") openService(it.intent.action.code, prefillFromIntent(it.intent));
      else if (it.type === "service") openService(it.id);
      else if (it.type === "branch") go("branches");
      else if (it.type === "case") go("requests");
      else if (it.type === "fee") go("fees");
    }
    function setActive(i) { active = i; var n = results.querySelectorAll(".at-desk__intent, .at-result"); for (var k = 0; k < n.length; k++) { var on = k === i; n[k].classList.toggle("is-active", on); if (on) n[k].scrollIntoView({ block: "nearest" }); } }
    // the "understood" read-back card — the desk repeats your request back, then offers to start it
    function intentCard(intent, idx) {
      var a = intent.action, sec = SECTION_MAP[a.section] || {}, svc = SERVICE_MAP[a.code] || {};
      var chips = [el("span", { class: "at-intentchip" }, [ms("category"), (sec.name || "") + " · " + a.section])];
      if (intent.branch) chips.push(el("span", { class: "at-intentchip" }, [ms("apartment"), intent.branch.name]));
      if (intent.mahalla) chips.push(el("span", { class: "at-intentchip" }, [ms("pin_drop"), "محلة " + intent.mahalla]));
      if (intent.type) chips.push(el("span", { class: "at-intentchip" }, [ms("sell"), intent.type]));
      return el("button", { class: "at-desk__intent " + secClass(a.section), type: "button", role: "option",
        on: { click: function () { act({ type: "intent", intent: intent }); }, mouseenter: function () { setActive(idx); } } }, [
        el("span", { class: "at-desk__intentico" }, [ms(svc.icon || "bolt")]),
        el("span", { class: "at-desk__intentmain" }, [
          el("span", { class: "at-desk__intenteyebrow" }, [ms("task_alt"), "فهمتُ طلبك · INTENT"]),
          el("span", { class: "at-desk__intentname", text: a.name }),
          el("span", { class: "at-desk__chips" }, chips),
        ]),
        el("span", { class: "at-desk__intentgo" }, [ms("arrow_back"), "ابدأ الطلب"]),
      ]);
    }
    function recompute() {
      var g = searchAll(q); var intent = parseIntent(q, {}); flat = []; clear(results);
      if (!q) { wrap.setAttribute("data-open", "0"); results.hidden = true; tryRow.hidden = false; return; }
      tryRow.hidden = true; wrap.setAttribute("data-open", "1"); results.hidden = false;
      if (intent) { var iIdx = flat.length; flat.push({ type: "intent", intent: intent }); results.appendChild(intentCard(intent, iIdx)); }
      var groups = [["services", "الخدمات", "apps"], ["branches", "الفروع والمحلات", "hub"], ["cases", "الطلبات", "inbox"], ["fees", "الأجور", "payments"]];
      var total = g.services.length + g.branches.length + g.cases.length + g.fees.length;
      if (!total && !intent) { results.appendChild(el("div", { class: "at-desk__none", text: "لا نتائج لـ «" + q + "». جرّب رقم محلة، أو رقم طلب، أو اسم خدمة." })); return; }
      groups.forEach(function (gr) {
        var items = g[gr[0]]; if (!items.length) return;
        var rows = [el("div", { class: "at-desk__grouphd" }, [ms(gr[2]), gr[1], el("span", { class: "at-tnum", text: String(items.length) })])];
        items.forEach(function (it) {
          var idx = flat.length; flat.push(it);
          rows.push(el("button", { class: "at-result " + secClass(it.section), type: "button", role: "option", on: { click: function () { act(it); }, mouseenter: function () { setActive(idx); } } }, [
            el("span", { class: "at-result__ico" }, [ms(it.icon)]),
            el("span", { class: "at-result__main" }, [el("span", { class: "at-result__t", text: it.title }), el("span", { class: "at-result__s", text: it.sub })]),
            el("span", { class: "at-result__go" }, [ms("subdirectory_arrow_left"), "فتح"]),
          ]));
        });
        results.appendChild(el("div", { class: "at-desk__group" }, rows));
      });
      active = -1;
    }
    input.addEventListener("input", function () { q = input.value; recompute(); });
    input.addEventListener("focus", function () { if (q) recompute(); });
    input.addEventListener("blur", function () { setTimeout(function () { wrap.setAttribute("data-open", "0"); results.hidden = true; if (!q) tryRow.hidden = false; }, 150); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (flat.length) setActive((active + 1) % flat.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (flat.length) setActive((active - 1 + flat.length) % flat.length); }
      else if (e.key === "Enter") { e.preventDefault(); act(active >= 0 ? flat[active] : flat[0]); }
      else if (e.key === "Escape") { input.value = ""; q = ""; recompute(); input.blur(); }
    });
    return wrap;
  }

  // featured "lit window" bento (Origin §6.3c + bestdesignsonx bento) — 3D-spot tier
  function featuredBento() {
    var picks = ["CS0001", "CB0001", "CT0009"].map(function (c) { return SERVICE_MAP[c]; }).filter(Boolean);
    if (!picks.length) return el("span");
    var cards = picks.map(function (s, i) { return featureCard(s, i === 0); });
    return el("section", {}, [
      el("div", { class: "at-head" }, [
        el("div", { class: "at-head__main" }, [el("span", { class: "at-eyebrow", text: "مختارات اليوم" }), el("h2", { text: "خدمات مميّزة" })]),
        el("button", { class: "at-link", type: "button", on: { click: function () { go("services"); } } }, ["تصفّح الكل", ms("arrow_back")]),
      ]),
      el("div", { class: "at-bento" }, cards),
    ]);
  }
  function featureCard(s, lg) {
    var sec = SECTION_MAP[s.section] || {};
    var bi = ICONS.forService ? ICONS.forService(s.code) : null;
    var spot = ART.spot3d
      ? ART.spot3d(s.icon, { lg: lg, size: lg ? 78 : 58, glyph: bi ? ICONS.svg(bi, { glyph: true, draw: true }) : null })
      : el("span", { class: "at-svc__ico" }, [ms(s.icon)]);
    return el("button", { class: "at-feature " + (lg ? "at-feature--lg " : "") + secClass(s.section), type: "button", on: { click: function () { openService(s.code); } } }, [
      el("div", { class: "at-feature__top" }, [
        spot,
        el("span", { class: "at-feature__tag", text: (sec.name_en || sec.name) + " · " + s.section }),
      ]),
      el("h3", { class: "at-feature__h", text: s.name }),
      lg ? el("p", { class: "at-feature__sub", text: sec.blurb }) : null,
      el("div", { class: "at-feature__foot" }, [
        el("span", { class: "at-feature__stat at-tnum" }, [ms("schedule"), " " + s.sla + "ي · " + s.popularity + "٪"]),
        lg ? el("span", { class: "at-btn at-btn--glass at-btn--sm", "aria-hidden": "true" }, [ms("arrow_back"), "ابدأ"])
           : el("span", { class: "at-swatch", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]),
      ]),
    ]);
  }

  function ledgerCard() {
    // unified stream: updates + your recent activity + alerts, filterable
    var rows = [];
    UPDATES.forEach(function (u) { rows.push({ kind: "update", sec: u.sec, ico: u.ico, t: u.t, b: u.b, tag: u.tag, time: u.time }); });
    state.recent.slice(0, 3).forEach(function (code) {
      var s = SERVICE_MAP[code]; if (!s) return;
      rows.push({ kind: "recent", sec: s.section, ico: s.icon, t: s.name, b: "آخر خدمة فتحتها — تابِع أو ابدأ من جديد.", tag: "نشاطك", time: "مؤخراً" });
    });
    NOTIFS.slice(0, 2).forEach(function (n) { rows.push({ kind: "alert", sec: n.sec, ico: n.urgent ? "priority_high" : "notifications", t: n.t, b: n.s, tag: "تنبيه", time: n.time, urgent: n.urgent }); });

    var visible = rows.filter(function (r) { return state.ledgerFilter === "all" || r.kind === state.ledgerFilter; });

    var seg = el("div", { class: "at-seg", role: "tablist", "aria-label": "تصفية السجل" }, [
      segOpt("all", "الكل", "list"), segOpt("update", "تحديثات", "campaign"),
      segOpt("recent", "نشاطك", "history"), segOpt("alert", "تنبيهات", "notifications"),
    ]);

    var list = el("div", { class: "at-ledger" }, visible.map(function (r) {
      return el("article", { class: "at-ledger__row " + secClass(r.sec), "data-urgent": r.urgent ? "1" : null }, [
        el("span", { class: "at-ledger__node" }, [ms(r.ico)]),
        el("div", {}, [
          el("div", { class: "at-ledger__t" }, [r.t, el("span", { class: "at-tag", text: r.tag })]),
          el("p", { class: "at-ledger__b", text: r.b }),
        ]),
        el("span", { class: "at-ledger__time", text: r.time }),
      ]);
    }));
    if (!visible.length) list = emptyState("inbox", "لا عناصر في هذا التصنيف.");

    return el("section", { class: "at-card sec-cb" }, [
      el("div", { class: "at-card__head" }, [
        el("div", {}, [
          el("span", { class: "at-eyebrow", text: "اليومية" }),
          el("h2", { class: "at-card__title", style: "margin-top:6px", html: '<span class="ms">receipt_long</span> سجلّ المكتب' }),
        ]),
        seg,
      ]),
      list,
    ]);
  }
  function segOpt(key, label, icon) {
    return el("button", { class: "at-seg__opt", role: "tab", "aria-selected": state.ledgerFilter === key ? "true" : "false", type: "button",
      on: { click: function () { state.ledgerFilter = key; render(); } } }, [ms(icon), label]);
  }

  function accordionCard() {
    var acc = el("div", { class: "at-accord" }, SECTIONS.map(function (s, i) {
      var open = state.accord === s.code;
      var top = mostUsed(SERVICES.filter(function (x) { return x.section === s.code; }), 3);
      return el("button", {
        class: "at-acc " + secClass(s.code), type: "button", "aria-expanded": open ? "true" : "false",
        on: { click: function () { state.accord = s.code; render(); } },
      }, [
        el("span", { class: "at-acc__rail" }, [el("span", { class: "at-mono", text: "0" + (i + 1) }), s.name]),
        el("div", { class: "at-acc__body" }, [
          ART.lineMesh ? ART.lineMesh(s.icon) : null,
          el("span", { class: "at-acc__ico" }, [ICONS.forSection && ICONS.forSection(s.code) ? ICONS.svg(ICONS.forSection(s.code), { draw: true, size: 28 }) : ms(s.icon)]),
          el("span", { class: "at-acc__num", text: "0" + (i + 1) + " / " + s.name_en.toUpperCase() }),
          el("h3", { class: "at-acc__h", text: s.name }),
          el("p", { class: "at-acc__blurb", text: s.blurb }),
          el("div", { class: "at-acc__links" }, top.map(function (svc) {
            return el("button", { class: "at-acc__link", type: "button", on: { click: function (e) { e.stopPropagation(); openService(svc.code); } } },
              [el("span", { text: svc.name }), ms("arrow_back")]);
          })),
          el("span", { class: "at-acc__count at-tnum", text: SERVICES.filter(function (x) { return x.section === s.code; }).length + " خدمة في هذا القسم" }),
        ]),
      ]);
    }));
    return el("section", {}, [
      el("div", { class: "at-head" }, [
        el("div", { class: "at-head__main" }, [el("span", { class: "at-eyebrow", text: "مجالات الخدمة" }), el("h2", { text: "البَهو — أربعة أقسام" })]),
        el("button", { class: "at-link", type: "button", on: { click: function () { go("services"); } } }, ["كل الخدمات", ms("arrow_back")]),
      ]),
      acc,
    ]);
  }

  function sealCard(done) {
    return el("section", { class: "at-seal" }, [
      el("div", { style: "display:flex;gap:var(--at-4);align-items:center" }, [
        el("span", { class: "at-seal__badge" }, [ms("workspace_premium", "ms--fill")]),
        el("div", {}, [
          el("span", { class: "at-eyebrow", text: "خَتْم اليوم" }),
          el("div", { class: "at-seal__val at-tnum", style: "margin-top:6px", html: done + ' <small>معاملة مُنجزة</small>' }),
          el("div", { class: "at-seal__lbl", text: "أداء فرعك حتى الآن — استمرّ بنفس الإيقاع." }),
        ]),
      ]),
      el("div", { style: "margin-top:var(--at-5)" }, [
        stat("CS", "bolt", "طلبات اليوم", fmt(KPIS.todayCases || 84), "+" + (KPIS.todayDelta || 12) + "٪"),
        stat("CT", "pending_actions", "قيد المعالجة", fmt(KPIS.pending || 213), null),
        stat("CB", "verified", "نسبة الرضا", (KPIS.satisfaction || 94) + "٪", null),
      ]),
      el("button", { class: "at-btn at-btn--ceremonial at-btn--sm at-btn--block", type: "button", style: "margin-top:var(--at-5)" },
        [ms("workspace_premium"), "تنزيل ملخّص اليوم"]),
    ]);
  }
  function stat(sec, icon, label, val, delta) {
    return el("div", { class: "at-stat " + secClass(sec) }, [
      el("span", { class: "at-stat__lbl" }, [ms(icon), label]),
      el("span", { style: "display:inline-flex;align-items:center;gap:8px" }, [
        delta ? el("span", { class: "at-stat__delta at-tnum", text: delta }) : null,
        el("span", { class: "at-stat__val at-tnum", text: val }),
      ]),
    ]);
  }

  function quickCard() {
    var modes = [["most", "الأكثر", "local_fire_department"], ["recent", "الأخير", "history"], ["fav", "المفضلة", "star"]];
    var seg = el("div", { class: "at-seg", role: "tablist", "aria-label": "وصول سريع" }, modes.map(function (m) {
      return el("button", { class: "at-seg__opt", role: "tab", "aria-selected": state.quickMode === m[0] ? "true" : "false", type: "button",
        on: { click: function () { state.quickMode = m[0]; render(); } } }, [ms(m[2]), m[1]]);
    }));
    var list;
    if (state.quickMode === "most") list = mostUsed(SERVICES, 5);
    else if (state.quickMode === "recent") list = state.recent.map(function (c) { return SERVICE_MAP[c]; }).filter(Boolean).slice(0, 5);
    else list = state.favs.map(function (c) { return SERVICE_MAP[c]; }).filter(Boolean).slice(0, 5);

    var body = list.length ? el("div", { class: "at-quick" }, list.map(function (s) {
      return el("button", { class: "at-qrow " + secClass(s.section), type: "button", on: { click: function () { openService(s.code); } } }, [
        el("span", { class: "at-qrow__ico" }, [ms(s.icon)]),
        el("span", { class: "at-qrow__main" }, [el("span", { class: "at-qrow__name", text: s.name }), el("span", { class: "at-qrow__meta at-tnum", text: s.code + " · " + s.sla + "ي" })]),
        starBtn(s.code),
      ]);
    })) : emptyState(state.quickMode === "fav" ? "star" : "history", state.quickMode === "fav" ? "لا مفضّلات بعد — اضغط النجمة على أي خدمة." : "لا استعمالات حديثة بعد.");

    return el("section", { class: "at-card" }, [
      el("div", { class: "at-card__head" }, [el("h3", { class: "at-card__title", html: '<span class="ms">apps</span> خدماتك' }), seg]),
      body,
    ]);
  }

  function tipCard() {
    var t = TIPS[state.tipIndex % TIPS.length];
    var m = TIP_META[t.t] || TIP_META.tip;
    return el("section", { class: "at-tip " + secClass(m.sec) }, [
      el("div", { style: "display:flex;gap:var(--at-4);align-items:flex-start" }, [
        el("span", { class: "at-tip__ico" }, [ms(m.ico)]),
        el("div", { style: "min-inline-size:0" }, [
          el("span", { class: "at-tip__tag", text: m.tag + " · " + t.code }),
          el("p", { class: "at-tip__b", text: t.x }),
        ]),
      ]),
      el("div", { class: "at-tip__nav" }, [
        el("button", { class: "at-iconbtn", type: "button", "aria-label": "السابق", on: { click: function () { state.tipIndex = (state.tipIndex - 1 + TIPS.length) % TIPS.length; render(); } } }, [ms("chevron_right")]),
        el("span", { class: "at-tip__count at-tnum", text: ((state.tipIndex % TIPS.length) + 1) + " / " + TIPS.length }),
        el("button", { class: "at-iconbtn", type: "button", "aria-label": "التالي", on: { click: function () { state.tipIndex = (state.tipIndex + 1) % TIPS.length; render(); } } }, [ms("chevron_left")]),
      ]),
    ]);
  }

  function notifCard() {
    return el("section", { class: "at-card sec-ca" }, [
      el("div", { class: "at-card__head" }, [
        el("h3", { class: "at-card__title", html: '<span class="ms">notifications</span> التنبيهات' }),
        el("span", { class: "at-eyebrow at-tnum", text: String(NOTIFS.length) }),
      ]),
      el("div", { class: "at-notif" }, NOTIFS.map(function (n) {
        return el("div", { class: "at-notif__row " + (n.urgent ? "sec-ca" : secClass(n.sec)), style: n.urgent ? "--at-sec:var(--at-crimson)" : null }, [
          el("span", { class: "at-notif__lead" }),
          el("div", { style: "min-inline-size:0" }, [el("div", { class: "at-notif__t", text: n.t }), el("div", { class: "at-notif__s at-tnum", text: n.s })]),
          el("span", { class: "at-notif__time", text: n.time }),
        ]);
      })),
    ]);
  }

  function extensionCard() {
    return el("section", {}, [
      el("div", { class: "at-head" }, [
        el("div", { class: "at-head__main" }, [el("span", { class: "at-eyebrow", text: "قابل للتطوير" }), el("h2", { text: "ورشة التطوير" }), el("p", { text: "نقاط ربط جاهزة للتوسعة — مساحات تصميم مفتوحة." })]),
      ]),
      el("div", { class: "at-slots" }, SLOTS.map(function (s) {
        return el("button", { class: "at-slot", type: "button" }, [
          el("div", { class: "at-slot__top" }, [el("span", { class: "at-slot__logo" }, [ms(s.ico)]), el("span", { class: "at-slot__name", text: s.name })]),
          el("span", { class: "at-slot__desc", text: s.desc }),
          el("span", { class: "at-slot__add" }, [ms("add"), "أضِف عنصراً"]),
        ]);
      })),
    ]);
  }

  // =====================================================================
  // VIEW: SERVICES DIRECTORY
  // =====================================================================
  function viewServices() {
    var results = filterServices(SERVICES, state.dir.q, state.dir.sec);
    var countFor = function (c) { return SERVICES.filter(function (s) { return s.section === c; }).length; };

    var search = el("label", { class: "at-search" }, [
      ms("search"),
      el("input", { type: "search", placeholder: "ابحث برقم الخدمة أو الاسم…", "aria-label": "بحث", value: state.dir.q,
        on: { input: function (e) { state.dir.q = e.target.value; rerenderInto(); } } }),
    ]);
    var chips = el("div", { class: "at-chips" }, [
      el("button", { class: "at-chip", type: "button", "aria-pressed": state.dir.sec === "ALL" ? "true" : "false",
        on: { click: function () { state.dir.sec = "ALL"; render(); } } }, ["الكل", el("span", { class: "at-chip__n at-tnum", text: String(SERVICES.length) })]),
    ].concat(SECTIONS.map(function (s) {
      return el("button", { class: "at-chip " + secClass(s.code), type: "button", "aria-pressed": state.dir.sec === s.code ? "true" : "false",
        on: { click: function () { state.dir.sec = s.code; render(); } } },
        [el("span", { class: "at-chip__dot" }), s.name, el("span", { class: "at-chip__n at-tnum", text: String(countFor(s.code)) })]);
    })));

    var grid = results.length ? el("div", { class: "at-grid", id: "at-dirgrid" }, results.map(svcCard)) : emptyState("search_off", "لا توجد خدمة تطابق بحثك.");

    return el("div", { class: "at-view" }, [
      headBlock("دليل الخدمات", "كل الخدمات", SERVICES.length + " خدمة — ابحث أو صفِّ حسب القسم"),
      search, chips, grid,
    ]);
  }
  // light re-render for the search input (keeps focus): replace only the grid
  function rerenderInto() {
    var grid = $("#at-dirgrid");
    var results = filterServices(SERVICES, state.dir.q, state.dir.sec);
    if (!grid) { render(); return; }
    clear(grid);
    if (results.length) results.forEach(function (s) { grid.appendChild(svcCard(s)); });
    else { var e = emptyState("search_off", "لا توجد خدمة تطابق بحثك."); grid.replaceWith(e); e.id = "at-dirgrid"; }
  }

  // =====================================================================
  // VIEW: BRANCHES
  // =====================================================================
  function viewBranches() {
    var stats = window.BRANCH_STATS || {};
    var LOAD = { "مستقر": "cb", "مرتفع": "ct", "تحت الضغط": "ca" };
    var cards = el("div", { class: "at-grid", style: "grid-template-columns:repeat(auto-fill,minmax(300px,1fr))" }, BRANCHES.map(function (b) {
      var cls = b.primary ? "" : "sec-ct";
      return el("section", { class: "at-card " + cls, style: (b.primary ? "--at-sec:var(--at-indigo);" : "") + "border-inline-start:3px solid var(--at-sec)" }, [
        el("div", { class: "at-card__head", style: "margin-block-end:var(--at-4)" }, [
          el("div", {}, [
            el("span", { class: "at-eyebrow at-tnum", text: b.id + (b.primary ? " · فرعك" : "") }),
            el("h3", { class: "at-card__title", style: "margin-top:4px", html: '<span class="ms">apartment</span> ' + b.name }),
          ]),
          el("span", { class: "at-badge " + secClass(LOAD[b.loadStatus] || "cb"), text: b.loadStatus }),
        ]),
        el("div", {}, [
          row("person", b.manager, null),
          row("call", b.phone, null, true),
          row("location_on", b.address, null),
          row("groups", "المشتركون", fmt(b.subscribers)),
          row("grid_view", "المحلات", String(b.mahallas.length)),
        ]),
      ]);
    }));
    return el("div", { class: "at-view" }, [
      headBlock("نطاق التغطية", "الفروع والمراكز", (stats.total || BRANCHES.length) + " مراكز · " + (stats.mahallas || "") + " مَحلة · " + fmt(stats.subscribers || 0) + " مشترك"),
      cards,
    ]);
  }
  function row(icon, name, amount, mono) {
    return el("div", { class: "at-row" }, [
      el("span", { class: "at-row__name" }, [ms(icon), mono ? el("span", { class: "at-tnum", text: name }) : name]),
      amount != null ? el("span", { class: "at-row__amt at-tnum", text: amount }) : null,
    ]);
  }

  // =====================================================================
  // VIEW: FEES
  // =====================================================================
  function viewFees() {
    var SEC = { inspection: "CS", install: "CT", reconnect: "CB" };
    var cols = el("div", { class: "at-cols" }, Object.keys(PRICING).map(function (key) {
      var tbl = PRICING[key];
      return el("section", { class: "at-card " + secClass(SEC[key] || "CB"), style: "border-inline-start:3px solid var(--at-sec)" }, [
        el("div", { class: "at-card__head", style: "margin-block-end:var(--at-4)" }, [
          el("div", {}, [el("span", { class: "at-eyebrow at-tnum", text: tbl.items.length + " بنود" }),
            el("h3", { class: "at-card__title", style: "margin-top:4px", html: '<span class="ms">request_quote</span> ' + tbl.label })]),
        ]),
        el("div", {}, tbl.items.map(function (it) {
          return el("div", { class: "at-row" }, [
            el("span", { class: "at-row__name", text: it.name }),
            el("span", { class: "at-row__amt at-tnum", html: fmt(it.amount) + ' <small>د.ع</small>' }),
          ]);
        })),
      ]);
    }));
    return el("div", { class: "at-view" }, [headBlock("دليل ٢٠٢٦", "الأجور والرسوم", "جداول رسمية — كل المبالغ بالدينار العراقي"), cols]);
  }

  // =====================================================================
  // VIEW: COMPLAINTS & REPORTS (CA) — telemetry dashboard is the signature
  // =====================================================================
  function viewComplaints() {
    var svc = SERVICES.filter(function (s) { return s.section === "CA"; });
    return el("div", { class: "at-view" }, [
      headBlock("الشكاوى والتقارير · CA", "غرفة التقارير", "مراقبة حيّة للبلاغات والحالات — ثم افتح بلاغاً جديداً"),
      telemetryPanel(),                              // the one signature: dark Indigo-Dusk island
      el("section", {}, [
        el("div", { class: "at-head" }, [el("div", { class: "at-head__main" }, [
          el("span", { class: "at-eyebrow", text: "تقديم بلاغ" }), el("h2", { text: "بلاغات القسم وخدماته" }),
        ])]),
        el("div", { class: "at-grid" }, svc.map(svcCard)),
      ]),
    ]);
  }

  // CA telemetry / reports dashboard (design.md §6.12) — flat dark surface,
  // mono tnum mega-numbers, four-domain chart in section hues, live feed.
  var PRIO_FILTERS = [["all", "الكل", "list"], ["urgent", "عاجل", "priority_high"], ["vip", "قيادة", "workspace_premium"], ["standard", "اعتيادي", "task_alt"]];
  function telemetryPanel() {
    var t = caTelemetry(CASES, KPIS, SECTIONS, SERVICE_MAP);

    // KPI strip — honest values from KPIS + the real urgent count
    var kpis = el("div", { class: "at-tele__kpis" }, [
      kpiCell("bolt", "بلاغات اليوم · TODAY", fmt(t.today), "+" + t.delta + "٪"),
      kpiCell("pending_actions", "قيد المعالجة · OPEN", fmt(t.open), null),
      kpiCell("priority_high", "حالات عاجلة · URGENT", fmt(t.urgent), null, true),
      kpiCell("payments", "محصّل اليوم · COLLECTED", fmt(t.collected), null, false, "د.ع"),
    ]);

    // four-domain distribution — section hues 1:1, never rainbow
    var chart = el("div", { class: "at-tele__chart" }, SECTIONS.map(function (s) {
      var n = t.byDomain[s.code] || 0, pct = Math.round((n / t.max) * 100);
      return el("div", { class: "at-tele__bar " + secClass(s.code) }, [
        el("span", { class: "at-tele__barlbl", text: s.name }),
        el("span", { class: "at-tele__bartrack" }, [el("span", { class: "at-tele__barfill", style: "inline-size:" + pct + "%" })]),
        el("span", { class: "at-tele__barval at-tnum", text: String(n) }),
      ]);
    }));

    // live feed — filtered by priority; status dot · mono ref · state · time
    var rows = CASES.filter(function (c) { return state.telemetry === "all" || c.priority === state.telemetry; });
    var feed = rows.length ? el("div", { class: "at-tele__feed" }, rows.map(feedRow))
      : el("div", { class: "at-tele__feed" }, [el("div", { class: "at-empty", style: "padding:var(--at-10) var(--at-4)" }, [el("p", { text: "لا حالات بهذا التصنيف." })])]);

    var seg = el("div", { class: "at-seg", role: "tablist", "aria-label": "تصفية حسب الأولوية" }, PRIO_FILTERS.map(function (p) {
      return el("button", { class: "at-seg__opt", role: "tab", "aria-selected": state.telemetry === p[0] ? "true" : "false", type: "button",
        on: { click: function () { state.telemetry = p[0]; render(); } } }, [ms(p[2]), p[1]]);
    }));

    return el("section", { class: "at-tele at-darkzone sec-ca" }, [
      el("div", { class: "at-tele__head" }, [
        el("div", {}, [
          el("span", { class: "at-eyebrow at-eyebrow--mono", text: "المراقبة · CA REPORTS" }),
          el("h2", { class: "at-tele__title", html: '<span class="ms">monitoring</span> غرفة العمليات' }),
        ]),
        el("div", { class: "at-tele__tools" }, [
          el("span", { class: "at-tele__live" }, [el("span", { class: "at-tele__livedot" }), "تيّار حيّ · LIVE"]),
          seg,
        ]),
      ]),
      kpis,
      el("div", { class: "at-tele__body" }, [
        el("div", { class: "at-tele__panel" }, [
          el("div", { class: "at-tele__panelhd" }, [ms("bar_chart"), "الحالات النشطة حسب القسم", el("span", { class: "at-tnum", text: t.total + " حالة" })]),
          chart,
        ]),
        el("div", { class: "at-tele__panel", style: "padding:0;background:none;box-shadow:none" }, [
          el("div", { class: "at-tele__panelhd", style: "padding-inline:var(--at-1)" }, [ms("forum"), "التيّار الحيّ", el("span", { class: "at-tnum", text: rows.length + " / " + CASES.length })]),
          feed,
        ]),
      ]),
    ]);
  }
  function kpiCell(icon, label, val, delta, urgent, unit) {
    return el("div", { class: "at-tele__kpi" + (urgent ? " at-tele__kpi--urgent" : "") }, [
      el("span", { class: "at-tele__kpilbl" }, [ms(icon), label]),
      el("div", { class: "at-tele__kpival at-tnum", html: val + (unit ? ' <small>' + unit + "</small>" : "") }),
      delta ? el("span", { class: "at-tele__delta at-tnum" }, [ms("trending_up"), delta]) : null,
      urgent ? el("div", { class: "at-tele__annot" }, [
        el("span", { class: "at-tele__annotdot" }), el("span", { class: "at-tele__annotline" }),
        el("span", { class: "at-tele__annottxt", text: "أولوية قصوى · إشعار فوري لفرق الطوارئ" }),
      ]) : null,
    ]);
  }
  function feedRow(c) {
    var s = SERVICE_MAP[c.svc] || { name: c.svc, section: "CA", code: c.svc };
    var urgent = c.priority === "urgent", vip = c.priority === "vip";
    return el("button", { class: "at-tele__row " + secClass(s.section), type: "button", on: { click: function () { openService(s.code); } } }, [
      el("span", { class: "at-tele__dot" + (urgent ? " is-urgent" : vip ? " is-vip" : "") }),
      el("span", { class: "at-tele__rmain" }, [
        el("span", { class: "at-tele__rtop" }, [el("span", { class: "at-tele__ref", text: c.id }), el("span", { class: "at-tele__state", text: "· " + c.status })]),
        el("span", { class: "at-tele__sub", text: c.subscriber }),
      ]),
      el("span", { class: "at-tele__time", text: c.age }),
    ]);
  }

  // =====================================================================
  // VIEW: REQUESTS
  // =====================================================================
  function viewRequests() {
    return el("div", { class: "at-view" }, [
      headBlock("متابعة", "طلباتي وحالاتها", CASES.length + " حالة نشطة — اضغط أي صف للتفاصيل"),
      el("section", { class: "at-card sec-cs" }, [casesTable(CASES)]),
    ]);
  }
  function casesTable(rows) {
    var head = el("thead", {}, [el("tr", {}, ["الرقم المرجعي", "الخدمة", "المشترك", "الحالة", "المدة"].map(function (h) { return el("th", { text: h }); }))]);
    var body = el("tbody", {}, rows.map(function (c) {
      var s = SERVICE_MAP[c.svc] || { name: c.svc, section: "CS", icon: "description", code: c.svc };
      var urgent = c.priority === "urgent", vip = c.priority === "vip";
      return el("tr", { class: secClass(s.section), style: urgent ? "--at-sec:var(--at-crimson)" : null, on: { click: function () { openService(s.code); } } }, [
        el("td", {}, [el("span", { class: "at-mono", style: "color:var(--at-ink-2)", text: c.id })]),
        el("td", {}, [el("div", { class: "at-tname" }, [el("span", { class: "at-svc__ico" }, [ms(s.icon)]), el("span", {}, [el("b", { text: s.name }), el("small", { class: "at-tnum", text: s.code })])])]),
        el("td", { text: c.subscriber }),
        el("td", {}, [el("span", { class: "at-badge " + (urgent ? "at-badge--urgent" : vip ? "at-badge--gold" : "") }, [urgent ? ms("priority_high") : (vip ? ms("workspace_premium") : null), c.status])]),
        el("td", {}, [el("span", { class: "at-mono", style: "color:var(--at-ink-2)", text: c.age })]),
      ]);
    }));
    return el("div", { class: "at-tablewrap" }, [el("table", { class: "at-table" }, [head, body])]);
  }

  // =====================================================================
  // VIEW: UPDATES
  // =====================================================================
  function viewUpdates() {
    return el("div", { class: "at-view" }, [
      headBlock("سجل التغييرات", "آخر التحديثات", "إعلانات وسياسات وصيانة مجدولة"),
      el("section", { class: "at-card sec-cb" }, [el("div", { class: "at-ledger" }, UPDATES.map(function (u) {
        return el("article", { class: "at-ledger__row " + secClass(u.sec) }, [
          el("span", { class: "at-ledger__node" }, [ms(u.ico)]),
          el("div", {}, [el("div", { class: "at-ledger__t" }, [u.t, el("span", { class: "at-tag", text: u.tag })]), el("p", { class: "at-ledger__b", text: u.b })]),
          el("span", { class: "at-ledger__time", text: u.time }),
        ]);
      }))]),
    ]);
  }

  // ---- shared small blocks ----------------------------------------------
  function headBlock(eyebrow, title, sub) {
    return el("div", { class: "at-head" }, [el("div", { class: "at-head__main" }, [
      el("span", { class: "at-eyebrow", text: eyebrow }), el("h2", { text: title }), sub ? el("p", { text: sub }) : null,
    ])]);
  }
  function emptyState(icon, msg) {
    var art = ART.iso ? ART.iso(icon === "search_off" ? "search" : "empty") : ms(icon);
    return el("div", { class: "at-empty sec-cs" }, [art, el("p", { text: msg })]);
  }

  // =====================================================================
  // VIEW: SERVICE FORM FLOW (connected stepper §6.6) + GILT RECEIPT (§6.7)
  // =====================================================================
  var TYPE_OPTS = {
    CS: ["منزلي", "تجاري", "صناعي", "حكومي"],
    CT: ["طور واحد", "ثلاثة أطوار"],
    CB: ["دفع كامل", "تقسيط"],
    CA: ["عادي", "عاجل", "خطر"],
  };
  function formView() {
    var f = state.form, s = SERVICE_MAP[f.code] || {}, sec = SECTION_MAP[s.section] || {};
    var steps = [
      { eyebrow: "الخطوة ١ من ٣", title: "بيانات المشترك" },
      { eyebrow: "الخطوة ٢ من ٣", title: "تفاصيل الطلب" },
      { eyebrow: "الخطوة ٣ من ٣", title: "المراجعة والإقرار" },
    ];
    var inputs = {};
    function readActive() { Object.keys(inputs).forEach(function (k) { f.data[k] = inputs[k].value; }); }
    function field(label, key, opts) {
      opts = opts || {};
      var node = opts.area
        ? el("textarea", { class: "at-input", placeholder: opts.ph || "", "aria-label": label })
        : el("input", { class: "at-input", type: opts.type || "text", placeholder: opts.ph || "", "aria-label": label, inputmode: opts.tnum ? "numeric" : null });
      node.value = f.data[key] || "";
      if (opts.tnum) node.classList.add("at-tnum");
      inputs[key] = node;
      return el("div", { class: "at-field" }, [el("label", {}, [label, opts.req ? el("span", { class: "req", text: "*" }) : null]), node]);
    }
    function segmented(key, options) {
      return el("div", { class: "at-opts" }, options.map(function (o) {
        var on = (f.data[key] || options[0]) === o;
        return el("button", { class: "at-opt", type: "button", "aria-pressed": on ? "true" : "false",
          on: { click: function () { readActive(); f.data[key] = o; render(); } } },
          [el("span", { class: "at-opt__tick" }), o]);
      }));
    }

    // active step body
    var body;
    if (f.step === 0) body = el("div", {}, [
      field("اسم المشترك", "subscriber", { req: true, ph: "الاسم الثلاثي كما في السجل" }),
      field("رقم الحساب / المقياس", "account", { req: true, tnum: true, ph: "مثال: 100-204-1187" }),
      field("رقم الهاتف", "phone", { tnum: true, ph: "0790…" }),
    ]);
    else if (f.step === 1) body = el("div", {}, [
      el("div", { class: "at-field" }, [el("label", {}, [s.section === "CA" ? "أولوية البلاغ" : "الصنف / النوع"]), segmented("type", TYPE_OPTS[s.section] || ["عادي"])]),
      field("تفاصيل الطلب", "details", { area: true, ph: "اكتب وصفاً موجزاً للطلب أو الموقع…" }),
      s.fixedPrice || s.hasPrice || s.priceNote ? el("div", { class: "at-adv" }, [
        el("span", { class: "at-adv__ico" }, [ms("request_quote")]),
        el("div", {}, [el("span", { class: "at-adv__tag", text: "أجور" }), el("span", { class: "at-adv__t", text: s.fixedPrice ? (fmt(s.fixedPrice) + " د.ع") : (s.priceNote || "تُحدَّد بعد الكشف الموقعي") })]),
      ]) : null,
    ]);
    else body = el("div", {}, [
      el("div", {}, (window.getAdvisories ? window.getAdvisories(f.code) : []).map(function (a) {
        var danger = a.t === "danger";
        return el("div", { class: "at-adv" + (danger ? " at-adv--danger" : "") }, [
          el("span", { class: "at-adv__ico" }, [ms(danger ? "warning" : a.t === "faq" ? "help" : "fact_check")]),
          el("div", {}, [el("span", { class: "at-adv__tag", text: danger ? "تحذير" : a.t === "faq" ? "سؤال شائع" : "مراجعة" }), el("span", { class: "at-adv__t", text: a.x })]),
        ]);
      })),
      el("button", { class: "at-opt", type: "button", style: "margin-top:var(--at-2)", "aria-pressed": f.data.confirm ? "true" : "false",
        on: { click: function () { readActive(); f.data.confirm = !f.data.confirm; render(); } } },
        [el("span", { class: "at-opt__tick" }), "أُقرّ بصحّة البيانات وأطّلعت على الملاحظات"]),
    ]);

    function next() { readActive(); if (f.step < 2) { f.step++; render(); } else { if (!f.data.confirm) { f.data.confirm = true; } state.receipt = { code: f.code, ref: genRef(), data: f.data }; state.form = null; render(); } }
    function back() { readActive(); if (f.step > 0) { f.step--; render(); } else { state.form = null; state.tab = state.tab || "services"; render(); } }

    var stepper = el("div", { class: "at-stepper" }, steps.map(function (st, i) {
      var stt = i < f.step ? "done" : i === f.step ? "active" : "upcoming";
      return el("div", { class: "at-step", "data-state": stt }, [
        el("span", { class: "at-step__rail" }),
        el("span", { class: "at-step__node" }, [stt === "done" ? ms("check") : String(i + 1)]),
        el("div", { class: "at-step__lbl" }, [el("div", { class: "at-step__eyebrow", text: st.eyebrow }), el("div", { class: "at-step__title", text: st.title })]),
        i === f.step ? el("div", { class: "at-step__body" }, [
          body,
          el("div", { class: "at-flow__actions" }, [
            el("button", { class: "at-btn at-btn--primary", type: "button", on: { click: next } }, [ms(f.step === 2 ? "check_circle" : "arrow_back"), f.step === 2 ? "إرسال الطلب" : "التالي"]),
            el("button", { class: "at-btn at-btn--ghost", type: "button", on: { click: back } }, [f.step === 0 ? "إلغاء" : "السابق"]),
          ]),
        ]) : null,
      ]);
    }));

    var aside = el("div", { class: "at-flow__aside " + secClass(s.section) }, [
      el("div", { class: "at-flow__art" }, [ART.spot3d ? ART.spot3d(s.icon, { lg: true, size: 92, glyph: ICONS.forService && ICONS.forService(f.code) ? ICONS.svg(ICONS.forService(f.code), { glyph: true, draw: true }) : null }) : ms(s.icon)]),
      el("div", {}, [
        el("span", { class: "at-eyebrow", text: (sec.name || "") + " · " + s.section }),
        el("h2", { class: "at-head", style: "display:block;margin-top:6px;font-family:var(--at-display);font-size:1.25rem", text: s.name }),
        el("div", { class: "at-svc__stat at-tnum", style: "margin-top:var(--at-3)" }, [el("span", {}, [ms("schedule"), " مدة الإنجاز ~" + s.sla + " يوم"])]),
      ]),
    ]);

    return el("div", { class: "at-view" }, [
      el("button", { class: "at-link", type: "button", style: "margin-block-end:var(--at-3)", on: { click: function () { go(state.tab); } } }, [ms("arrow_forward"), "رجوع"]),
      headBlock("طلب خدمة", s.name, "أكمل الخطوات الثلاث — تُحفظ بياناتك تلقائياً بين الخطوات"),
      el("div", { class: "at-flow" }, [aside, el("section", { class: "at-card " + secClass(s.section) }, [stepper])]),
    ]);
  }

  function receiptView() {
    var r = state.receipt, s = SERVICE_MAP[r.code] || {}, sec = SECTION_MAP[s.section] || {};
    var fee = s.fixedPrice ? (fmt(s.fixedPrice) + " د.ع") : (s.priceNote || "تُحدَّد بعد الكشف");
    var rows = [
      ["badge", "الخدمة", s.name],
      ["badge", "القسم", (sec.name || "") + " · " + r.code],
      ["badge", "المشترك", r.data.subscriber || "—"],
      ["badge", "رقم الحساب", r.data.account || "—"],
      ["badge", "النوع", r.data.type || "—"],
      ["badge", "الأجور", fee],
    ];
    return el("div", { class: "at-view" }, [
      el("div", { class: "at-receipt " + secClass(s.section) }, [
        el("div", { class: "at-receipt__card" }, [
          el("div", { class: "at-receipt__seal" }, [
            (function () {
              // drawn gilt seal: a gold spot blob (currentColor=gold) + check glyph
              var w = el("span", { style: "color:var(--at-gold);display:block;inline-size:96px;block-size:96px;position:relative" });
              if (ART.spot3d) { var sp = ART.spot3d("verified", { size: 96 }); w.appendChild(sp.querySelector("svg")); }
              w.appendChild(el("span", { class: "ms ms--fill", style: "position:absolute;inset:0;display:grid;place-items:center;color:var(--at-on-indigo);font-size:40px", text: "workspace_premium" }));
              return w;
            })(),
          ]),
          el("div", { class: "at-receipt__eyebrow", text: "تمّ الإنجاز · ختم رسمي" }),
          el("h2", { class: "at-receipt__h", text: "تم استلام طلبك" }),
          el("div", { class: "at-receipt__ref" }, [ms("tag"), el("span", { class: "at-tnum", text: r.ref })]),
          el("dl", { class: "at-receipt__rows" }, rows.map(function (row) {
            return el("div", { class: "at-receipt__row" }, [
              el("dt", {}, [el("span", { class: "at-check" }, [ms("check")]), row[1]]),
              el("dd", { class: "at-tnum", text: row[2] }),
            ]);
          })),
          el("div", { class: "at-receipt__actions" }, [
            el("button", { class: "at-btn at-btn--ceremonial", type: "button" }, [ms("download"), "تنزيل الإيصال"]),
            el("button", { class: "at-btn at-btn--ghost", type: "button", on: { click: function () { go("requests"); } } }, [ms("inbox"), "متابعة الطلبات"]),
          ]),
        ]),
      ]),
    ]);
  }

  // =====================================================================
  // DOCK + ROUTER
  // =====================================================================
  var TABS = [
    ["home", "الرئيسية", "home"], ["services", "الخدمات", "apps"], ["branches", "الفروع", "hub"],
    ["fees", "الأجور", "payments"], ["complaints", "الشكاوى", "report"], ["requests", "الطلبات", "inbox"],
    ["updates", "التحديثات", "campaign"],
  ];
  function badge(tab) {
    if (tab === "complaints") return CASES.filter(function (c) { return (SERVICE_MAP[c.svc] || {}).section === "CA"; }).length || null;
    if (tab === "requests") return CASES.length || null;
    if (tab === "updates") return UPDATES.length;
    return null;
  }
  function buildDock() {
    var ind = el("span", { class: "at-tabs__ind", "aria-hidden": "true" });
    var tabsWrap = el("div", { class: "at-tabs", role: "tablist", "aria-label": "التنقّل" }, [ind].concat(TABS.map(function (t) {
      var b = badge(t[0]);
      return el("button", {
        class: "at-tab " + secClass(TAB_SEC[t[0]] === "indigo" ? "" : TAB_SEC[t[0]]),
        role: "tab", "aria-selected": state.tab === t[0] ? "true" : "false", "data-tab": t[0], type: "button",
        on: { click: function () { go(t[0]); } },
      }, [ms(t[2]), el("span", { class: "at-tab__label", text: t[1] }), b ? el("span", { class: "at-tab__badge at-tnum", text: String(b) }) : null]);
    })));

    var dock = el("div", { class: "at-dock" }, [
      el("a", { class: "at-brand", href: "#", "aria-label": "تدفّق الخير — الرئيسية", on: { click: function (e) { e.preventDefault(); go("home"); } } }, [
        el("span", { class: "at-brand__mark" }, [ICONS.svg ? ICONS.svg("bolt", { glyph: true, size: 21 }) : ms("bolt", "ms--fill")]),
        el("span", { class: "at-brand__name" }, [el("strong", { text: "تدفّق الخير" }), el("small", { text: "RASAFA · CS HUB" })]),
      ]),
      tabsWrap,
      el("div", { class: "at-dock__side" }, [
        el("label", { class: "at-docksearch" }, [ms("search"), el("input", { type: "search", placeholder: "بحث شامل", "aria-label": "بحث" }), el("kbd", { text: "⌘K" })]),
        el("button", { class: "at-iconbtn", type: "button", id: "at-theme", "aria-label": "تبديل السمة" }, [ms(isDark() ? "light_mode" : "dark_mode")]),
        el("button", { class: "at-iconbtn", type: "button", "aria-label": "التنبيهات" }, [ms("notifications"), el("span", { class: "at-iconbtn__pip" })]),
        el("button", { class: "at-monogram", type: "button", "aria-label": "الحساب", text: "ر م" }),
      ]),
    ]);
    $("#at-theme", dock).addEventListener("click", toggleTheme);
    return el("div", { class: "at-dockwrap " + secClass(TAB_SEC[state.tab] === "indigo" ? "" : TAB_SEC[state.tab]) }, [dock]);
  }

  function placeIndicator() {
    var wrap = $(".at-tabs"); if (!wrap) return;
    var active = $('.at-tab[aria-selected="true"]', wrap);
    var ind = $(".at-tabs__ind", wrap); if (!active || !ind) return;
    var wr = wrap.getBoundingClientRect(), ar = active.getBoundingClientRect();
    var rtl = getComputedStyle(wrap).direction === "rtl";
    var start = rtl ? (wr.right - ar.right) : (ar.left - wr.left);
    ind.style.transform = "translateX(" + (rtl ? -start : start) + "px)";
    ind.style.inlineSize = ar.width + "px";
  }

  var VIEWS = { home: viewHome, services: viewServices, branches: viewBranches, fees: viewFees, complaints: viewComplaints, requests: viewRequests, updates: viewUpdates };
  function go(tab) { state.form = null; state.receipt = null; state.tab = tab; render(); var m = $(".at-main"); if (m) m.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" }); }

  // ---- theme ------------------------------------------------------------
  function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
  function prefersReduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function applyTheme(dark) { document.documentElement.setAttribute("data-theme", dark ? "dark" : "light"); save("at-theme", dark ? "dark" : "light"); }
  function toggleTheme() { applyTheme(!isDark()); render(); }

  // ---- mount ------------------------------------------------------------
  var root;
  function render() {
    if (!root) return;
    clear(root);
    var dock = buildDock();
    var view = state.receipt ? receiptView() : state.form ? formView() : (VIEWS[state.tab] || viewHome)();
    var main = el("main", { class: "at-main" }, [el("div", { class: "at-shell" }, [view])]);
    root.appendChild(dock);
    root.appendChild(main);
    requestAnimationFrame(placeIndicator);
  }

  function init() {
    root = document.getElementById("at-root");
    applyTheme(load("at-theme", "light") === "dark");
    render();
    window.addEventListener("resize", placeIndicator);
    window.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        var d = document.getElementById("at-desk-input");
        if (!d) { go("home"); setTimeout(function () { var x = document.getElementById("at-desk-input"); if (x) x.focus(); }, 80); }
        else d.focus();
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  // -----------------------------------------------------------------
  // ponytail: ONE runnable self-check for the pure helpers.
  // -----------------------------------------------------------------
  (function selfCheck() {
    var sample = [{ name: "اشتراك", code: "CS0001", section: "CS", popularity: 90 }, { name: "دفع", code: "CB0001", section: "CB", popularity: 99 }];
    console.assert(filterServices(sample, "", "ALL").length === 2, "filter: empty -> all");
    console.assert(filterServices(sample, "cb0001", "ALL").length === 1, "filter: by code");
    console.assert(filterServices(sample, "", "CB").length === 1, "filter: by section");
    console.assert(filterServices(sample, "لا يوجد", "ALL").length === 0, "filter: no match");
    console.assert(toggleId(["a"], "b").length === 2 && toggleId(["a", "b"], "b").length === 1, "toggleId add/remove");
    console.assert(mostUsed(sample, 1)[0].code === "CB0001", "mostUsed: by popularity");
    console.assert(goldenProgress({ getHours: function () { return 12; }, getMinutes: function () { return 0; } }, 8, 16).pct === 0.5, "goldenProgress: noon = 0.5");
    console.assert(searchAll("").services.length === 0 && searchAll("cb0001").services.length === 1, "searchAll: empty vs code match");
    console.assert(/^TQ-2026-08-\d{4}$/.test(genRef()), "genRef: reference format");
    var tSec = [{ code: "CS" }, { code: "CB" }, { code: "CA" }];
    var tMap = { X1: { section: "CS" }, X2: { section: "CS" }, X3: { section: "CB" }, X4: { section: "CA" } };
    var tCases = [{ svc: "X1", priority: "standard" }, { svc: "X2", priority: "urgent" }, { svc: "X3", priority: "vip" }, { svc: "X4", priority: "standard" }];
    var tel = caTelemetry(tCases, { todayCases: 84, todayDelta: 12, pending: 213 }, tSec, tMap);
    console.assert(tel.byDomain.CS === 2 && tel.byDomain.CB === 1 && tel.byDomain.CA === 1, "caTelemetry: per-domain counts");
    console.assert(tel.urgent === 1 && tel.vip === 1, "caTelemetry: priority counts");
    console.assert(tel.total === 4 && tel.max === 2, "caTelemetry: total + max");
    console.assert(tel.today === 84 && tel.open === 213 && tel.delta === 12, "caTelemetry: kpi passthrough");
    console.assert(caTelemetry([], {}, [], {}).max === 1, "caTelemetry: empty guards max>=1");
    // intent compiler — grounded in the real catalog + mahalla index
    var pi = parseIntent("عمل اشتراك جديد في محلة ١٤٣ تجاري");
    console.assert(pi && pi.action.code === "CS0001", "parseIntent: action = new connection");
    console.assert(pi && pi.mahalla === "143" && pi.branch && pi.branch.id === "RS-014", "parseIntent: mahalla 143 -> branch RS-014");
    console.assert(pi && pi.type === "تجاري", "parseIntent: type تجاري");
    console.assert(parseIntent("فحص مقياس").action.code === "CT0009", "parseIntent: meter inspection");
    console.assert(parseIntent("تقسيط قائمة").action.code === "CB0006", "parseIntent: installment beats generic bill");
    console.assert(parseIntent("بلاغ خطر").action.code === "CA0002", "parseIntent: hazard report");
    console.assert(parseIntent("سلام") === null, "parseIntent: no match -> null");
    console.assert(prefillFromIntent({ type: "تجاري", mahalla: "143", branch: { id: "RS-014", name: "مركز النضال" } }).type === "تجاري", "prefillFromIntent: carries type");
  })();
})();
