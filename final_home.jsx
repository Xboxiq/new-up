// =============================================================
// FINAL_HOME — Tadfuq Al-Khayr · صفحة رئيسية (window.HomePage)
//
// A comprehensive, RTL-first homepage built strictly on the
// design.md token system. One signature per screen = the
// iOS-style liquid-glass dock (§6.3). Everything else stays
// quiet (hairline + --section-c). Reuses the live data layer
// (window.SERVICES / SECTIONS / BRANCHES / PRICING / RECENT_CASES
// / KPIS / ADVISORIES) so it is integration-ready, not a mock.
//
// Tabs: الرئيسية · الخدمات · الفروع · الأجور · الشكاوى · الطلبات · التحديثات
// =============================================================
(function () {
  const { useState, useEffect, useMemo, useRef } = React;

  // ----- icon helper (uses Material Symbols, like the rest of the app) -----
  const Icon = window.Icon || function Icon({ name, size }) {
    return <span className="material-symbols-outlined" style={size ? { fontSize: size } : null}>{name}</span>;
  };
  const fmt = window.fmt || ((n) => new Intl.NumberFormat('ar-IQ').format(n));
  const fmtIQD = window.fmtIQD || ((n) => fmt(n) + ' د.ع');

  const SECTION_C = { CS: 'var(--ds-cs)', CT: 'var(--ds-ct)', CB: 'var(--ds-cb)', CA: 'var(--ds-ca)' };
  const secOf = (code) => (window.SECTION_MAP && window.SECTION_MAP[code]) || { name: '', code: '' };

  // -----------------------------------------------------------------
  // Pure helpers (covered by the self-check at the bottom of the file)
  // -----------------------------------------------------------------
  function filterServices(services, query, section) {
    const q = (query || '').trim().toLowerCase();
    return services.filter((s) => {
      if (section && section !== 'ALL' && s.section !== section) return false;
      if (!q) return true;
      return (s.name + ' ' + s.code + ' ' + (s.short || '')).toLowerCase().includes(q);
    });
  }
  function toggleId(list, id) {
    return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
  }
  window.HomeHelpers = { filterServices, toggleId };

  // ----- tiny persisted-list hook (favorites / recent) -----
  function usePersistedList(key, seed) {
    const [list, setList] = useState(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* ignore */ }
      return seed || [];
    });
    useEffect(() => {
      try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* ignore */ }
    }, [key, list]);
    return [list, setList];
  }

  // =================================================================
  // STATIC CONTENT — updates / tips / notifications / extension slots
  // (Editable surfaces: structure is fixed, content is data.)
  // =================================================================
  const UPDATES = [
    { sec: 'CB', tag: 'تحديث', title: 'تفعيل الدفع الإلكتروني للقوائم', body: 'يمكن الآن تسديد قائمة الأجور عبر المحفظة الرقمية مباشرة من شاشة الحالة، مع إيصال فوري.', time: 'اليوم · 09:20' },
    { sec: 'CS', tag: 'سياسة', title: 'تبسيط مستندات الاشتراك الجديد', body: 'أحد المستندين (إجازة البناء أو ضريبة العقار) أصبح كافياً لقبول طلب الاشتراك المنزلي.', time: 'اليوم · 08:05' },
    { sec: 'CT', tag: 'صيانة', title: 'نافذة صيانة مجدولة — مغذي النضال', body: 'فصل تيار منسّق ليلة الخميس 23:00–02:00 لتغيير ركيزة محولة. أبلِغوا المشتركين المتأثرين.', time: 'أمس · 16:40' },
    { sec: 'CA', tag: 'تنبيه', title: 'تصعيد بلاغات الخطر تلقائياً', body: 'بلاغات الخطر تُشعِر فرق الطوارئ فور التسجيل قبل إكمال النموذج — أولوية قصوى.', time: 'أمس · 11:15' },
    { sec: 'CB', tag: 'إصدار', title: 'دليل الأجور ٢٠٢٦ مُحدّث', body: 'جداول أجور الكشف وإعادة التيار حُدّثت وفق الرسوم الرسمية الجديدة. راجعوا تبويب الأجور.', time: 'الأحد · 14:00' },
  ];

  const NOTIFS = [
    { sec: 'CA', t: 'بلاغ خطر جديد — مَحلة 143', s: 'TQ-2026-08-1407 · فريق الطوارئ', time: 'منذ 6 د', urgent: true },
    { sec: 'CB', t: 'موافقة مدير مطلوبة — تقسيط', s: 'TQ-2026-08-1409 · حسن جاسم', time: 'منذ 25 د' },
    { sec: 'CS', t: '٢٣ معاملة بانتظار توقيعك', s: 'طابور الاعتماد', time: 'منذ ساعة' },
    { sec: 'CT', t: 'اكتمل فحص مقياس — جاهز للدفع', s: 'TQ-2026-08-1413 · هدى محمود', time: 'منذ 4 س' },
  ];

  const SLOTS = [
    { name: 'Vercel', ico: 'deployed_code', desc: 'لوحة نشر/معاينة — اربط النشر التلقائي وحالة البناء هنا.' },
    { name: 'Notion', ico: 'description', desc: 'قاعدة معرفة وإجراءات — ضمّن صفحات الدليل والسياسات.' },
    { name: 'Figma', ico: 'design_services', desc: 'معاينة تصاميم حيّة — اعرض ملفات الواجهة قيد التطوير.' },
    { name: 'Skills', ico: 'extension', desc: 'إضافات وكلاء التصميم — refero · animate · creative-fx.' },
  ];

  // =================================================================
  // LIQUID-GLASS DOCK
  // =================================================================
  const TABS = [
    { k: 'home',       l: 'الرئيسية',  ico: 'home' },
    { k: 'services',   l: 'الخدمات',   ico: 'apps' },
    { k: 'branches',   l: 'الفروع',    ico: 'hub' },
    { k: 'fees',       l: 'الأجور',    ico: 'payments' },
    { k: 'complaints', l: 'الشكاوى',   ico: 'report' },
    { k: 'requests',   l: 'الطلبات',   ico: 'inbox' },
    { k: 'updates',    l: 'التحديثات', ico: 'campaign' },
  ];

  function Dock({ tab, setTab, dark, setDark, badges }) {
    const wrapRef = useRef(null);
    const btnRefs = useRef({});
    const [ind, setInd] = useState({ x: 0, w: 0 });

    // Position the sliding indicator under the active tab (transform only).
    const place = () => {
      const wrap = wrapRef.current;
      const el = btnRefs.current[tab];
      if (!wrap || !el) return;
      // inset-inline-start offset works for both LTR & RTL because we read
      // the element's position relative to the (already-flipped) container.
      const wrapRect = wrap.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const isRtl = getComputedStyle(wrap).direction === 'rtl';
      const start = isRtl
        ? wrapRect.right - elRect.right
        : elRect.left - wrapRect.left;
      setInd({ x: start, w: elRect.width });
    };
    useEffect(() => { place(); /* re-place after fonts/layout settle */ const id = setTimeout(place, 60); return () => clearTimeout(id); }, [tab]);
    useEffect(() => {
      const onR = () => place();
      window.addEventListener('resize', onR);
      return () => window.removeEventListener('resize', onR);
    }, [tab]);

    return (
      <div className="hm-dock-wrap">
        <div className="hm-dock" role="navigation" aria-label="التنقّل الرئيسي">
          <a className="hm-dock__brand" href="#" aria-label="تدفّق الخير — الرئيسية" onClick={(e) => { e.preventDefault(); setTab('home'); }}>
            <span className="hm-dock__mark"><Icon name="bolt" /></span>
            <span className="hm-dock__name">
              <strong>تدفّق الخير</strong>
              <small>RASAFA · CS HUB</small>
            </span>
          </a>

          <div className="hm-dock__tabs" ref={wrapRef} role="tablist">
            <span className="hm-dock__ind" aria-hidden="true"
                  style={{ transform: `translateX(${ind.x}px)`, inlineSize: ind.w + 'px' }} />
            {TABS.map((t) => (
              <button key={t.k}
                      ref={(el) => { btnRefs.current[t.k] = el; }}
                      role="tab"
                      aria-selected={tab === t.k}
                      className={`hm-dock__tab ${tab === t.k ? 'is-on' : ''}`}
                      style={{ '--section-c': SECTION_C[({ complaints: 'CA', services: 'CS', branches: 'CT', fees: 'CB', requests: 'CS', updates: 'CB' })[t.k]] || 'var(--ds-indigo)' }}
                      onClick={() => setTab(t.k)}>
                <Icon name={t.ico} />
                <span>{t.l}</span>
                {badges[t.k] ? <span className="hm-dock__tab__badge tnum">{badges[t.k]}</span> : null}
              </button>
            ))}
          </div>

          <div className="hm-dock__side">
            <button className="hm-iconbtn" title="بحث شامل (⌘K)" aria-label="بحث"><Icon name="search" /></button>
            <button className="hm-iconbtn" onClick={() => setDark(!dark)} title="تبديل السمة" aria-label="تبديل السمة">
              <Icon name={dark ? 'light_mode' : 'dark_mode'} />
            </button>
            <button className="hm-avatar" title="الحساب" aria-label="الحساب">رص</button>
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // SHARED — section head + service card
  // =================================================================
  function Head({ eyebrow, title, sub, action, onAction }) {
    return (
      <div className="hm-head">
        <div className="hm-head__main">
          {eyebrow && <span className="hm-eyebrow is-ar">{eyebrow}</span>}
          <h2>{title}</h2>
          {sub && <p className="hm-head__sub">{sub}</p>}
        </div>
        {action && (
          <button className="hm-link" onClick={onAction}>{action} <Icon name="arrow_back" /></button>
        )}
      </div>
    );
  }

  function ServiceCard({ svc, fav, onFav, onOpen }) {
    const sec = secOf(svc.code);
    const ref = useRef(null);
    const onMove = (e) => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    };
    return (
      <div ref={ref} className="hm-svc" style={{ '--section-c': SECTION_C[svc.section] }}
           role="button" tabIndex={0} onMouseMove={onMove}
           onClick={() => onOpen(svc)}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(svc); } }}>
        <div className="hm-svc__top">
          <span className="hm-svc__ico"><Icon name={svc.icon} /></span>
          <button className={`hm-star ${fav ? 'is-on' : ''}`}
                  aria-pressed={fav}
                  aria-label={fav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  onClick={(e) => { e.stopPropagation(); onFav(svc.code); }}>
            <Icon name="star" />
          </button>
        </div>
        <div>
          <span className="hm-svc__eyebrow">{sec.name_en || sec.name} · {svc.section}</span>
          <div className="hm-svc__name">{svc.short || svc.name}</div>
        </div>
        <div className="hm-svc__stat tnum">
          <span><Icon name="schedule" size={15} /> {svc.sla}ي</span>
          <span className="hm-svc__dot" />
          <span><Icon name="trending_up" size={15} /> {svc.popularity}٪</span>
        </div>
      </div>
    );
  }

  // =================================================================
  // PANEL · HOME (the aggregation)
  // =================================================================
  function HomePanel({ favs, setFavs, recent, openSvc, setTab }) {
    const services = window.SERVICES || [];
    const [mode, setMode] = useState('most'); // most | recent | fav
    const onFav = (code) => setFavs((l) => toggleId(l, code));

    const byCode = (codes) => codes.map((c) => window.SERVICE_MAP[c]).filter(Boolean);
    const mostUsed = useMemo(() => [...services].sort((a, b) => b.popularity - a.popularity).slice(0, 6), [services]);
    const lists = { most: mostUsed, recent: byCode(recent).slice(0, 6), fav: byCode(favs).slice(0, 6) };
    const shown = lists[mode];

    const k = window.KPIS || {};
    const hero = [
      { sec: 'CS', ico: 'bolt', l: 'طلبات اليوم', v: k.todayCases ?? 84 },
      { sec: 'CT', ico: 'pending_actions', l: 'قيد المعالجة', v: k.pending ?? 213 },
      { sec: 'CB', ico: 'payments', l: 'محصّل اليوم', v: fmt(k.collected ?? 4810000) },
    ];

    return (
      <div className="hm-panel">
        {/* HERO — one focal moment */}
        <section className="hm-hero" style={{ '--section-c': 'var(--ds-indigo)' }}>
          <div>
            <span className="hm-hero__date"><span className="hm-hero__pulse" />
              {new Date().toLocaleDateString('ar-IQ-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' })} · مركز الرصافة · فرع النضال
            </span>
            <h1>أهلاً أستاذ رامز — <em>كل خدماتك في مكان واحد</em></h1>
            <p className="hm-hero__lede">
              ابدأ خدمة، تابع طلباتك، واطّلع على آخر التحديثات والنصائح. اختر من الدوك أعلاه أو ابدأ مباشرة من الأكثر استخداماً.
            </p>
            <div className="hm-hero__cta">
              <button className="hm-btn hm-btn--primary" onClick={() => setTab('services')}>
                <Icon name="bolt" /> ابدأ خدمة <span className="hm-kbd">⌘K</span>
              </button>
              <button className="hm-btn hm-btn--ghost" onClick={() => setTab('requests')}>
                <Icon name="inbox" /> طلباتي
              </button>
            </div>
          </div>
          <aside className="hm-hero__aside">
            {hero.map((h) => (
              <div className="hm-mini" key={h.l} style={{ '--section-c': SECTION_C[h.sec] }}>
                <span className="hm-mini__lbl"><Icon name={h.ico} /> {h.l}</span>
                <span className="hm-mini__val tnum">{h.v}</span>
              </div>
            ))}
          </aside>
        </section>

        {/* FAVORITES / RECENT / MOST-USED */}
        <section>
          <div className="hm-head">
            <div className="hm-head__main">
              <span className="hm-eyebrow is-ar">وصول سريع</span>
              <h2>خدماتك</h2>
            </div>
            <div className="hm-seg" role="tablist" aria-label="تصفية الخدمات">
              {[{ k: 'most', l: 'الأكثر استخداماً', i: 'local_fire_department' },
                { k: 'recent', l: 'آخر الاستعمالات', i: 'history' },
                { k: 'fav', l: 'المفضلة', i: 'star' }].map((o) => (
                <button key={o.k} role="tab" aria-selected={mode === o.k}
                        className={`hm-seg__opt ${mode === o.k ? 'is-on' : ''}`} onClick={() => setMode(o.k)}>
                  <Icon name={o.i} /> {o.l}
                </button>
              ))}
            </div>
          </div>
          {shown.length ? (
            <div className="hm-grid hm-grid--svc" style={{ marginBlockStart: 'var(--ds-5)' }}>
              {shown.map((s) => (
                <ServiceCard key={s.code} svc={s} fav={favs.includes(s.code)} onFav={onFav} onOpen={openSvc} />
              ))}
            </div>
          ) : (
            <div className="hm-empty">
              <Icon name={mode === 'fav' ? 'star' : 'history'} />
              <p>{mode === 'fav' ? 'لا توجد خدمات مفضّلة بعد — اضغط النجمة على أي خدمة.' : 'لا توجد استعمالات حديثة بعد — افتح خدمة لتظهر هنا.'}</p>
            </div>
          )}
        </section>

        {/* UPDATES + TIPS/NOTIFS */}
        <section className="hm-two">
          <div className="hm-card" style={{ '--section-c': 'var(--ds-cb)' }}>
            <div className="hm-card__head">
              <div>
                <h3 className="hm-card__title"><Icon name="campaign" /> آخر التحديثات</h3>
                <p className="hm-card__sub">إعلانات وسياسات وصيانة</p>
              </div>
              <button className="hm-link" onClick={() => setTab('updates')}>الكل <Icon name="arrow_back" /></button>
            </div>
            <div className="hm-feed">
              {UPDATES.slice(0, 4).map((u, i) => (
                <article className="hm-feed__row" key={i} style={{ '--section-c': SECTION_C[u.sec] }}>
                  <span className="hm-feed__node"><Icon name={secOf(u.sec + '0001').icon || 'bolt'} /></span>
                  <div>
                    <div className="hm-feed__title">{u.title}<span className="hm-tag">{u.tag}</span></div>
                    <p className="hm-feed__body">{u.body}</p>
                  </div>
                  <span className="hm-feed__time">{u.time}</span>
                </article>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-6)' }}>
            <TipCard />
            <div className="hm-card" style={{ '--section-c': 'var(--ds-ca)' }}>
              <div className="hm-card__head">
                <div><h3 className="hm-card__title"><Icon name="notifications" /> التنبيهات</h3></div>
                <span className="hm-eyebrow tnum">{NOTIFS.length}</span>
              </div>
              <div className="hm-notif">
                {NOTIFS.map((n, i) => (
                  <div className="hm-notif__row" key={i} style={{ '--section-c': n.urgent ? 'var(--ds-crimson)' : SECTION_C[n.sec] }}>
                    <span className="hm-notif__lead" />
                    <div className="hm-notif__main">
                      <div className="hm-notif__t">{n.t}</div>
                      <div className="hm-notif__s tnum">{n.s}</div>
                    </div>
                    <span className="hm-notif__time">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EXTENSION SLOTS */}
        <section>
          <Head eyebrow="قابل للتطوير" title="مساحات الإضافات" sub="نقاط ربط جاهزة للتوسعة — تصميم مفتوح للتطوير" />
          <div className="hm-slots" style={{ marginBlockStart: 'var(--ds-5)' }}>
            {SLOTS.map((s) => (
              <button className="hm-slot" key={s.name}>
                <div className="hm-slot__top">
                  <span className="hm-slot__logo"><Icon name={s.ico} /></span>
                  <span className="hm-slot__name">{s.name}</span>
                </div>
                <span className="hm-slot__desc">{s.desc}</span>
                <span className="hm-slot__add"><Icon name="add" size={14} /> أضف عنصراً</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // tips card — sources from window.ADVISORIES (real guidance) with rotation
  function TipCard() {
    const tips = useMemo(() => {
      const out = [];
      const adv = window.ADVISORIES || {};
      Object.keys(adv).forEach((code) => {
        adv[code].forEach((a) => out.push({ code, t: a.t, x: a.x }));
      });
      return out.length ? out : [{ code: 'CS0001', t: 'tip', x: 'أكمل الحقول أمام المشترك مباشرة — الحفظ التلقائي يحمي عملك.' }];
    }, []);
    const META = {
      danger: { ico: 'warning', tag: 'تحذير', sec: 'CA' },
      review: { ico: 'fact_check', tag: 'مراجعة', sec: 'CS' },
      scale:  { ico: 'expand', tag: 'قابل للتوسع', sec: 'CT' },
      tip:    { ico: 'tips_and_updates', tag: 'نصيحة', sec: 'CB' },
      faq:    { ico: 'help', tag: 'سؤال شائع', sec: 'CB' },
    };
    const [i, setI] = useState(() => Math.floor(Math.random() * tips.length));
    const t = tips[i % tips.length];
    const m = META[t.t] || META.tip;
    return (
      <div className="hm-tip" style={{ '--section-c': SECTION_C[m.sec] }}>
        <div style={{ display: 'flex', gap: 'var(--ds-4)', alignItems: 'flex-start' }}>
          <span className="hm-tip__ico"><Icon name={m.ico} /></span>
          <div style={{ minInlineSize: 0 }}>
            <span className="hm-tip__tag">{m.tag} · {t.code}</span>
            <p className="hm-tip__body" style={{ marginBlockStart: 6 }}>{t.x}</p>
          </div>
        </div>
        <div className="hm-tip__nav">
          <button className="hm-iconbtn" aria-label="السابق" onClick={() => setI((n) => (n - 1 + tips.length) % tips.length)}><Icon name="chevron_right" /></button>
          <span className="hm-tip__count tnum">{(i % tips.length) + 1} / {tips.length}</span>
          <button className="hm-iconbtn" aria-label="التالي" onClick={() => setI((n) => (n + 1) % tips.length)}><Icon name="chevron_left" /></button>
        </div>
      </div>
    );
  }

  // =================================================================
  // PANEL · SERVICES DIRECTORY (search + filter + grid)
  // =================================================================
  function ServicesPanel({ favs, setFavs, openSvc }) {
    const services = window.SERVICES || [];
    const sections = window.SECTIONS || [];
    const [q, setQ] = useState('');
    const [sec, setSec] = useState('ALL');
    const onFav = (code) => setFavs((l) => toggleId(l, code));
    const results = useMemo(() => filterServices(services, q, sec), [services, q, sec]);
    const countFor = (code) => services.filter((s) => s.section === code).length;

    return (
      <div className="hm-panel">
        <Head eyebrow="دليل الخدمات" title="كل الخدمات" sub={`${services.length} خدمة — ابحث أو صفِّ حسب القسم`} />
        <div className="hm-search">
          <Icon name="search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الخدمة أو الاسم…" aria-label="بحث" />
          {q && <button className="hm-iconbtn" style={{ inlineSize: 28, blockSize: 28 }} aria-label="مسح" onClick={() => setQ('')}><Icon name="close" size={16} /></button>}
        </div>
        <div className="hm-chips">
          <button className={`hm-chip ${sec === 'ALL' ? 'is-on' : ''}`} onClick={() => setSec('ALL')}>
            الكل <span className="hm-chip__n tnum">{services.length}</span>
          </button>
          {sections.map((s) => (
            <button key={s.code} className={`hm-chip ${sec === s.code ? 'is-on' : ''}`}
                    style={{ '--chip-c': SECTION_C[s.code] }} onClick={() => setSec(s.code)}>
              <span className="hm-chip__dot" /> {s.name} <span className="hm-chip__n tnum">{countFor(s.code)}</span>
            </button>
          ))}
        </div>
        {results.length ? (
          <div className="hm-grid hm-grid--svc">
            {results.map((s) => (
              <ServiceCard key={s.code} svc={s} fav={favs.includes(s.code)} onFav={onFav} onOpen={openSvc} />
            ))}
          </div>
        ) : (
          <div className="hm-empty"><Icon name="search_off" /><p>لا توجد خدمة تطابق بحثك.</p></div>
        )}
      </div>
    );
  }

  // =================================================================
  // PANEL · BRANCHES
  // =================================================================
  function BranchesPanel() {
    const branches = window.BRANCHES || [];
    const stats = window.BRANCH_STATS || {};
    const LOAD_C = { 'مستقر': 'var(--ds-cb)', 'مرتفع': 'var(--ds-ct)', 'تحت الضغط': 'var(--ds-crimson)' };
    return (
      <div className="hm-panel">
        <Head eyebrow="نطاق التغطية" title="الفروع والمراكز" sub={`${stats.total || branches.length} مراكز · ${stats.mahallas || ''} مَحلة · ${fmt(stats.subscribers || 0)} مشترك`} />
        <div className="hm-grid hm-grid--3">
          {branches.map((b) => (
            <div className="hm-card" key={b.id} style={{ '--section-c': b.primary ? 'var(--ds-indigo)' : 'var(--ds-ct)', borderInlineStart: '3px solid var(--section-c)' }}>
              <div className="hm-card__head" style={{ marginBlockEnd: 'var(--ds-4)' }}>
                <div>
                  <span className="hm-eyebrow tnum">{b.id}{b.primary ? ' · فرعك' : ''}</span>
                  <h3 className="hm-card__title" style={{ marginBlockStart: 4 }}><Icon name="apartment" /> {b.name}</h3>
                </div>
                <span className="hm-badge" style={{ '--section-c': LOAD_C[b.loadStatus] || 'var(--ds-cb)' }}>{b.loadStatus}</span>
              </div>
              <div className="hm-feed">
                <div className="hm-fee__row"><span className="hm-fee__name"><Icon name="person" size={16} /> {b.manager}</span></div>
                <div className="hm-fee__row"><span className="hm-fee__name"><Icon name="call" size={16} /> <span className="tnum">{b.phone}</span></span></div>
                <div className="hm-fee__row"><span className="hm-fee__name"><Icon name="location_on" size={16} /> {b.address}</span></div>
                <div className="hm-fee__row">
                  <span className="hm-fee__name"><Icon name="groups" size={16} /> المشتركون</span>
                  <span className="hm-fee__amt tnum">{fmt(b.subscribers)}</span>
                </div>
                <div className="hm-fee__row">
                  <span className="hm-fee__name"><Icon name="grid_view" size={16} /> المحلات</span>
                  <span className="hm-fee__amt tnum">{b.mahallas.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =================================================================
  // PANEL · FEES (الأجور) — quiet tables from window.PRICING
  // =================================================================
  function FeesPanel() {
    const pricing = window.PRICING || {};
    const keys = Object.keys(pricing);
    const SEC = { inspection: 'CS', install: 'CT', reconnect: 'CB' };
    return (
      <div className="hm-panel">
        <Head eyebrow="دليل ٢٠٢٦" title="الأجور والرسوم" sub="جداول رسمية — كل المبالغ بالدينار العراقي" />
        <div className="hm-fees">
          {keys.map((key) => {
            const tbl = pricing[key];
            return (
              <div className="hm-card" key={key} style={{ '--section-c': SECTION_C[SEC[key] || 'CB'], borderInlineStart: '3px solid var(--section-c)' }}>
                <div className="hm-card__head" style={{ marginBlockEnd: 'var(--ds-4)' }}>
                  <div>
                    <span className="hm-eyebrow is-ar">{tbl.items.length} بنود</span>
                    <h3 className="hm-card__title" style={{ marginBlockStart: 4 }}><Icon name="request_quote" /> {tbl.label}</h3>
                  </div>
                </div>
                {tbl.items.map((it) => (
                  <div className="hm-fee__row" key={it.key}>
                    <span className="hm-fee__name">{it.name}</span>
                    <span className="hm-fee__amt tnum">{fmt(it.amount)}<small>د.ع</small></span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =================================================================
  // PANEL · COMPLAINTS (الشكاوى) — CA services + open CA cases
  // =================================================================
  function ComplaintsPanel({ favs, setFavs, openSvc }) {
    const services = (window.SERVICES || []).filter((s) => s.section === 'CA');
    const cases = (window.RECENT_CASES || []).filter((c) => secOf(c.svc).code && window.SERVICE_MAP[c.svc] && window.SERVICE_MAP[c.svc].section === 'CA');
    const onFav = (code) => setFavs((l) => toggleId(l, code));
    return (
      <div className="hm-panel">
        <Head eyebrow="الشكاوى والتقارير · CA" title="الشكاوى والبلاغات" sub="بلاغات التلاعب والأخطار والشكاوى الإدارية" />
        <div className="hm-grid hm-grid--svc">
          {services.map((s) => (
            <ServiceCard key={s.code} svc={s} fav={favs.includes(s.code)} onFav={onFav} onOpen={openSvc} />
          ))}
        </div>
        <div className="hm-card" style={{ '--section-c': 'var(--ds-ca)' }}>
          <div className="hm-card__head">
            <div><h3 className="hm-card__title"><Icon name="gpp_maybe" /> بلاغات مفتوحة</h3>
              <p className="hm-card__sub">آخر الحالات في قسم الشكاوى</p></div>
          </div>
          <CasesTable rows={cases.length ? cases : (window.RECENT_CASES || []).slice(0, 3)} />
        </div>
      </div>
    );
  }

  // =================================================================
  // PANEL · REQUESTS (الطلبات) — all recent cases as a table
  // =================================================================
  function RequestsPanel() {
    const cases = window.RECENT_CASES || [];
    return (
      <div className="hm-panel">
        <Head eyebrow="متابعة" title="طلباتي وحالاتها" sub={`${cases.length} حالة نشطة — اضغط أي صف للتفاصيل`} />
        <div className="hm-card" style={{ '--section-c': 'var(--ds-cs)' }}>
          <CasesTable rows={cases} />
        </div>
      </div>
    );
  }

  function CasesTable({ rows }) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="hm-table">
          <thead>
            <tr><th>الرقم المرجعي</th><th>الخدمة</th><th>المشترك</th><th>الحالة</th><th>المدة</th></tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const svc = window.SERVICE_MAP[c.svc] || { name: c.svc, section: 'CS', icon: 'description' };
              const isUrgent = c.priority === 'urgent';
              return (
                <tr key={c.id} style={{ '--section-c': isUrgent ? 'var(--ds-crimson)' : SECTION_C[svc.section] }}>
                  <td><span className="hm-code tnum">{c.id}</span></td>
                  <td>
                    <div className="hm-table__name">
                      <span className="hm-svc__ico" style={{ '--section-c': SECTION_C[svc.section] }}><Icon name={svc.icon} /></span>
                      <span className="hm-table__main"><b>{svc.short || svc.name}</b><small className="tnum">{svc.code}</small></span>
                    </div>
                  </td>
                  <td>{c.subscriber}</td>
                  <td><span className={`hm-badge ${isUrgent ? 'hm-badge--urgent' : ''}`}>{isUrgent && <Icon name="priority_high" size={14} />}{c.status}</span></td>
                  <td><span className="hm-code">{c.age}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // =================================================================
  // PANEL · UPDATES (التحديثات) — full feed
  // =================================================================
  function UpdatesPanel() {
    return (
      <div className="hm-panel">
        <Head eyebrow="سجل التغييرات" title="آخر التحديثات" sub="إعلانات وسياسات وصيانة مجدولة" />
        <div className="hm-card" style={{ '--section-c': 'var(--ds-cb)' }}>
          <div className="hm-feed">
            {UPDATES.map((u, i) => (
              <article className="hm-feed__row" key={i} style={{ '--section-c': SECTION_C[u.sec] }}>
                <span className="hm-feed__node"><Icon name={secOf(u.sec + '0001').icon || 'bolt'} /></span>
                <div>
                  <div className="hm-feed__title">{u.title}<span className="hm-tag">{u.tag}</span></div>
                  <p className="hm-feed__body">{u.body}</p>
                </div>
                <span className="hm-feed__time">{u.time}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =================================================================
  // ROOT
  // =================================================================
  function HomePage() {
    const [tab, setTab] = useState('home');
    const [dark, setDark] = useState(() => {
      try { return localStorage.getItem('tq-final-dark') === '1'; } catch (e) { return false; }
    });
    useEffect(() => {
      document.body.classList.toggle('dark', dark);
      try { localStorage.setItem('tq-final-dark', dark ? '1' : '0'); } catch (e) { /* ignore */ }
    }, [dark]);

    const [favs, setFavs] = usePersistedList('tq-home-favs', ['CS0001', 'CB0001']);
    const [recent, setRecent] = usePersistedList('tq-home-recent', ['CT0009', 'CB0006', 'CS0004']);

    const openSvc = (svc) => {
      setRecent((l) => toggleId(l.filter((x) => x !== svc.code), svc.code));
      // In the integrated app this would call nav('form', { code }). Standalone: no-op beyond recency.
      if (window.HomeNav) window.HomeNav('form', { code: svc.code });
    };

    const badges = useMemo(() => {
      const cases = window.RECENT_CASES || [];
      const ca = cases.filter((c) => (window.SERVICE_MAP[c.svc] || {}).section === 'CA').length;
      return { complaints: ca || null, requests: cases.length || null, updates: UPDATES.length };
    }, []);

    let panel = null;
    if (tab === 'home') panel = <HomePanel favs={favs} setFavs={setFavs} recent={recent} openSvc={openSvc} setTab={setTab} />;
    else if (tab === 'services') panel = <ServicesPanel favs={favs} setFavs={setFavs} openSvc={openSvc} />;
    else if (tab === 'branches') panel = <BranchesPanel />;
    else if (tab === 'fees') panel = <FeesPanel />;
    else if (tab === 'complaints') panel = <ComplaintsPanel favs={favs} setFavs={setFavs} openSvc={openSvc} />;
    else if (tab === 'requests') panel = <RequestsPanel />;
    else if (tab === 'updates') panel = <UpdatesPanel />;

    return (
      <div className="hm" dir="rtl">
        <Dock tab={tab} setTab={setTab} dark={dark} setDark={setDark} badges={badges} />
        <main className="hm-main">{panel}</main>
      </div>
    );
  }

  window.HomePage = HomePage;

  // -----------------------------------------------------------------
  // ponytail: ONE runnable self-check for the non-trivial pure helpers.
  // Fails loudly in console if filtering / favorite-toggle logic breaks.
  // -----------------------------------------------------------------
  (function selfCheck() {
    const sample = [
      { name: 'عمل اشتراك جديد', code: 'CS0001', section: 'CS', short: '' },
      { name: 'دفع قائمة', code: 'CB0001', section: 'CB', short: '' },
    ];
    console.assert(filterServices(sample, '', 'ALL').length === 2, 'filterServices: empty query returns all');
    console.assert(filterServices(sample, 'cb0001', 'ALL').length === 1, 'filterServices: matches by code');
    console.assert(filterServices(sample, '', 'CB').length === 1, 'filterServices: filters by section');
    console.assert(filterServices(sample, 'لا يوجد', 'ALL').length === 0, 'filterServices: no match -> empty');
    console.assert(toggleId(['a'], 'b').length === 2 && toggleId(['a', 'b'], 'b').length === 1, 'toggleId: add then remove');
  })();
})();
