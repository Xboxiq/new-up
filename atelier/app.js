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
  window.AtelierHelpers = { filterServices: filterServices, toggleId: toggleId, mostUsed: mostUsed };

  // ---- persisted state --------------------------------------------------
  function load(key, fallback) { try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch (e) { return fallback; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  var state = {
    tab: "home",
    favs: load("at-favs", ["CS0001", "CB0001"]),
    recent: load("at-recent", ["CT0009", "CB0006", "CS0004"]),
    ledgerFilter: "all",
    quickMode: "most",
    accord: "CS",
    dir: { q: "", sec: "ALL" },
    tipIndex: 0,
  };
  function setFav(code) {
    state.favs = toggleId(state.favs, code);
    save("at-favs", state.favs);
    render();
  }
  function openService(code) {
    state.recent = toggleId(state.recent.filter(function (x) { return x !== code; }), code).slice(0, 12);
    save("at-recent", state.recent);
    if (window.AtelierNav) window.AtelierNav(code); // integration hook
    render();
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
    // ---- masthead
    var done = 47; // ceremonial: completed today (derived stand-in)
    var mast = el("header", { class: "at-mast" }, [
      el("span", { class: "at-mast__date at-kin at-kin--1" }, [
        el("span", { class: "at-mast__pulse" }),
        new Date().toLocaleDateString("ar-IQ-u-ca-gregory", { weekday: "long", day: "numeric", month: "long" }) + " · مركز الرصافة · فرع النضال",
      ]),
      el("h1", { class: "at-kin at-kin--2", html: "أهلاً أستاذ رامز — <b>كل خدماتك في مكانٍ واحد</b>" }),
      el("p", { class: "at-mast__lede at-kin at-kin--3", text: "ابدأ خدمة، تابع طلباتك، واطّلع على آخر التحديثات والنصائح في عمودٍ واحد هادئ — لا فوضى لوحات، بل مكتب عملٍ منظّم." }),
      el("div", { class: "at-mast__cta at-kin at-kin--4" }, [
        el("button", { class: "at-btn at-btn--primary", type: "button", on: { click: function () { go("services"); } } },
          [ms("bolt"), "ابدأ خدمة", el("span", { class: "at-kbd", text: "⌘K" })]),
        el("button", { class: "at-btn at-btn--ghost", type: "button", on: { click: function () { go("requests"); } } },
          [ms("inbox"), "طلباتي"]),
      ]),
    ]);

    // ---- main column: ledger + accordion
    var main = el("div", { class: "at-col" }, [ledgerCard(), accordionCard(), extensionCard()]);
    // ---- aside: gilt seal + quick access + tip + notifs
    var aside = el("aside", { class: "at-aside" }, [sealCard(done), quickCard(), tipCard(), notifCard()]);

    return el("div", { class: "at-view" }, [mast, el("div", { class: "at-broadsheet" }, [main, aside])]);
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
          el("span", { class: "at-acc__ico" }, [ms(s.icon)]),
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
  // VIEW: COMPLAINTS
  // =====================================================================
  function viewComplaints() {
    var svc = SERVICES.filter(function (s) { return s.section === "CA"; });
    var caCases = CASES.filter(function (c) { return (SERVICE_MAP[c.svc] || {}).section === "CA"; });
    return el("div", { class: "at-view" }, [
      headBlock("الشكاوى والتقارير · CA", "الشكاوى والبلاغات", "بلاغات التلاعب والأخطار والشكاوى الإدارية"),
      el("div", { class: "at-grid" }, svc.map(svcCard)),
      el("section", { class: "at-card sec-ca" }, [
        el("div", { class: "at-card__head" }, [el("h3", { class: "at-card__title", html: '<span class="ms">gpp_maybe</span> بلاغات مفتوحة' })]),
        casesTable(caCases.length ? caCases : CASES.slice(0, 3)),
      ]),
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
    return el("div", { class: "at-empty" }, [ms(icon), el("p", { text: msg })]);
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
        el("span", { class: "at-brand__mark" }, [ms("bolt", "ms--fill")]),
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
  function go(tab) { state.tab = tab; render(); var m = $(".at-main"); if (m) m.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" }); }

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
    var main = el("main", { class: "at-main" }, [el("div", { class: "at-shell" }, [(VIEWS[state.tab] || viewHome)()])]);
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); go("services"); var i = $(".at-search input"); if (i) i.focus(); }
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
  })();
})();
