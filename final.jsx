// =============================================================
// FINAL Dashboard — Tadfuq Al-Khayr (approved direction)
// Order: Head → Departments (focus) → Services Express →
//        Tips Ticker (rotates per refresh) → Spotlight →
//        Stats + Activity at the bottom
// =============================================================

// shared globals (useState, Icon, DEPT_COLORS …) come from final_globals.jsx

function bars(seed, n = 14) {
  const a = [];
  let s = seed;
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; a.push(20 + (s / 233280) * 80); }
  return a;
}

// =============================================================
// TOP CHROME
// =============================================================
function TopChrome({ tab, setTab, dark, setDark, onCmdK }) {
  return (
    <header className="f-top">
      <div className="f-top__row">
        <a className="f-brand" href="#">
          <span className="f-brand__mark"><img src="assets/logo.png" alt="" /></span>
          <span className="f-brand__name">
            <strong>تدفّق الخير</strong>
            <small>RASAFA · CS HUB</small>
          </span>
        </a>
        <span className="f-top__sep" />
        <button className="f-team">
          <span className="f-team__avatar">رص</span>
          <span>RS-014 · النضال</span>
          <Icon name="unfold_more" />
        </button>
        <span className="f-top__push" />
        <button className="f-search" onClick={onCmdK}>
          <Icon name="search" />
          <span className="f-search__input">ابحث برقم اشتراك، اسم، أو رقم خدمة…</span>
          <span className="f-kbd">⌘K</span>
        </button>
        <button className="f-iconbtn" title="السجل"><Icon name="article" /></button>
        <button className="f-iconbtn" title="الإشعارات"><Icon name="notifications" /></button>
        <button className="f-iconbtn f-morph" onClick={() => setDark(!dark)} title="السمة">
          <Icon name={dark ? 'light_mode' : 'dark_mode'} />
          <span className="f-morph__lbl">{dark ? 'نهاري' : 'ليلي'}</span>
        </button>
        <button className="f-avatar">كب</button>
      </div>
      <nav className="f-tabs">
        {[
          { k: 'overview', l: 'نظرة عامة' },
          { k: 'services', l: 'الخدمات' },
          { k: 'cases',    l: 'الحالات' },
          { k: 'branches', l: 'الفروع' },
          { k: 'reports',  l: 'التقارير' },
          { k: 'pricing',  l: 'الأجور' },
          { k: 'guide',    l: 'الدليل' },
        ].map(t => (
          <button key={t.k} className={`f-tab ${tab === t.k ? 'is-on' : ''}`} onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </nav>
    </header>
  );
}

// =============================================================
// PAGE HEAD — compact
// =============================================================
function PageHead({ onCmdK, nav }) {
  const dateStr = new Date().toLocaleDateString('ar-IQ-u-ca-gregory', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <section className="f-pagehead">
      <div className="f-pagehead__intro">
        <span className="f-pagehead__date">
          <span className="pulse" />
          {dateStr} · مركز الرصافة · فرع النضال
        </span>
        <h1>أهلاً مهندس كرار — <em>ابدأ من القسم</em></h1>
        <p className="f-pagehead__lede">
          الأقسام الأربعة هي بوابتك لكل خدمة. اختر القسم أو ابدأ خدمة مباشرة من القائمة السريعة.
        </p>
      </div>
      <div className="f-pagehead__actions">
        <button className="f-btn" onClick={() => nav('branches')}>
          <Icon name="hub" /> نطاق التغطية
        </button>
        <button className="f-btn"><Icon name="file_download" /> تصدير</button>
        <button className="f-btn f-btn--primary" onClick={onCmdK}>
          <Icon name="bolt" /> ابدأ سريع <span className="f-kbd">⌘K</span>
        </button>
      </div>
    </section>
  );
}

// =============================================================
// 1) DEPARTMENTS — the centerpiece
// =============================================================
function Departments({ nav }) {
  const todayBySection = { CS: 28, CT: 19, CB: 31, CA: 6 };
  const [open, setOpen] = useState(0);
  return (
    <section>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="hub" /></span>
            أقسام الخدمات
          </h2>
          <span className="f-h2__sub">{window.SERVICES.length} خدمة موزّعة وفق دليل ٢٠٢٦ — مرّر أو اضغط على القسم لفتحه</span>
        </div>
        <button className="f-btn f-btn--ghost f-btn--sm" onClick={() => nav('services')}>كل الخدمات <Icon name="arrow_back" /></button>
      </div>

      <div className="f-deck">
        {window.SECTIONS.map((s, i) => {
          const services = window.SERVICES.filter(v => v.section === s.code);
          const sample = services.slice(0, 4);
          const today = todayBySection[s.code] ?? 0;
          const avgSla = Math.round(services.reduce((a, v) => a + (v.sla || 0), 0) / services.length);
          const isOpen = open === i;
          return (
            <div key={s.code}
                 role="button"
                 tabIndex={0}
                 className={`f-deck__panel ${isOpen ? 'is-open' : ''}`}
                 style={{ '--d-c': DEPT_COLORS[s.code] }}
                 onMouseEnter={() => setOpen(i)}
                 onFocus={() => setOpen(i)}
                 onClick={() => setOpen(i)}>
              <span className="f-deck__wm" aria-hidden="true">{s.code}</span>
              <div className="f-deck__head">
                <window.SigBadge kind={s.code} size={56} className="f-deck__sig" />
                <span className="f-deck__code">{s.code}</span>
              </div>

              {/* collapsed view */}
              <div className="f-deck__mini">
                <span className="f-deck__mini-name">{s.name}</span>
                <span className="f-deck__mini-count">{services.length} خدمة</span>
              </div>

              {/* expanded view */}
              <div className="f-deck__full">
                <h3 className="f-deck__name">{s.name}</h3>
                <p className="f-deck__blurb">{s.blurb}</p>
                <div className="f-deck__chips">
                  {sample.map(sv => <span key={sv.code} className="f-deck__chip">{sv.code}</span>)}
                  {services.length > 4 && <span className="f-deck__chip f-deck__chip--more">+{services.length - 4}</span>}
                </div>
                <div className="f-deck__foot">
                  <div className="f-deck__stats">
                    <div className="f-deck__stat">
                      <span className="f-deck__stat-n">{services.length}</span>
                      <span className="f-deck__stat-l">خدمة</span>
                    </div>
                    <div className="f-deck__stat">
                      <span className="f-deck__stat-n">{today}</span>
                      <span className="f-deck__stat-l">اليوم</span>
                    </div>
                    <div className="f-deck__stat">
                      <span className="f-deck__stat-n">{avgSla}<small style={{ fontSize: '0.65em', marginInlineStart: 2 }}>ي</small></span>
                      <span className="f-deck__stat-l">متوسط</span>
                    </div>
                  </div>
                  <button className="f-deck__cta syn__cta" onClick={(e) => { e.stopPropagation(); nav('services', { section: s.code }); }}>
                    <svg className="arc" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="14" pathLength="100" /></svg>
                    <span className="syn__cta-roll"><span className="syn__cta-roll-stack"><span>افتح القسم</span><span>تصفّح الخدمات</span></span></span>
                    <Icon name="arrow_back" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="f-deck__dots" role="tablist" aria-label="الأقسام">
        {window.SECTIONS.map((s, i) => (
          <button key={s.code}
                  className={`f-deck__dot ${open === i ? 'is-on' : ''}`}
                  style={{ '--dd-c': DEPT_COLORS[s.code] }}
                  onClick={() => setOpen(i)}
                  aria-label={s.name} />
        ))}
      </div>
    </section>
  );
}

// =============================================================
// 2) SERVICES EXPRESS — most-used services, instant start
// =============================================================
function ServicesExpress({ nav }) {
  const top = useMemo(() => [...window.SERVICES].sort((a, b) => b.popularity - a.popularity).slice(0, 8), []);
  return (
    <section>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="bolt" /></span>
            ابدأ خدمة مباشرة
          </h2>
          <span className="f-h2__sub">الأكثر استخداماً في مركزك — نقرة واحدة للفورمة</span>
        </div>
      </div>
      <div className="f-express">
        {top.map(svc => {
          const sec = window.SECTION_MAP[svc.section];
          return (
            <button key={svc.code} className="f-exp" style={{ '--e-c': DEPT_COLORS[svc.section] }}
                    onClick={() => nav('form', { code: svc.code })}>
              <span className="f-exp__ico"><Icon name={svc.icon} /></span>
              <span className="f-exp__main">
                <span className="f-exp__name">{svc.short || svc.name}</span>
                <span className="f-exp__meta">{svc.code} · {svc.sla}ي · {sec.name}</span>
              </span>
              <span className="f-exp__go"><Icon name="arrow_back" /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// =============================================================
// 3) TIPS TICKER — rotates per refresh, extensible later
//    Pulls from localStorage (future add/edit) + defaults
// =============================================================
const DEFAULT_TIPS = [
  { c: 'var(--f-cb)', tag: 'نصيحة',      ico: 'lightbulb', title: 'تجنّب إرجاع طلبات CS0001',
    body: 'أرفق كتاب تأييد السكن المصدّق قبل تحويل الطلب للدائرة الفنية — أول سبب للإرجاع هذا الشهر.', by: 'مدير المركز' },
  { c: 'var(--f-cs)', tag: 'سؤال متكرر', ico: 'help', title: 'كيف يُحسب التقسيط؟',
    body: 'بحدّ أقصى ٦ أقساط، ويحتاج موافقة المدير للقيم فوق ٥٠٠ ألف د.ع.', by: 'دليل النظام' },
  { c: 'var(--f-ct)', tag: 'تحديث',      ico: 'campaign', title: 'تعديل جدول الأجور ٢٠٢٦',
    body: 'بدأ سريان التعديل على أجور الكشف الميداني — راجع اللائحة قبل إصدار أي مطالبة.', by: 'إدارة الأجور' },
  { c: 'var(--f-ca)', tag: 'تنبيه',      ico: 'warning', title: 'حالات تجاوزت الـ SLA',
    body: 'هناك ٣ حالات معلّقة في الدائرة الفنية تجاوزت المدة — راجعها لمنع التصعيد.', by: 'النظام' },
  { c: 'var(--f-cs)', tag: 'نصيحة',      ico: 'tips_and_updates', title: 'استخدم البحث السريع ⌘K',
    body: 'تستطيع الوصول لأي خدمة أو حالة أو مشترك بثوانٍ — جرّب كتابة رقم الاشتراك مباشرة.', by: 'دليل النظام' },
];

function loadTips() {
  try {
    const extra = JSON.parse(localStorage.getItem('tq-tips') || '[]');
    return [...extra, ...DEFAULT_TIPS];
  } catch { return DEFAULT_TIPS; }
}

function TipsTicker() {
  const tips = useMemo(loadTips, []);
  // New random tip every page refresh
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * tips.length));
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + 100 / 100; // 10s
        if (next >= 100) { setIdx(i => (i + 1) % tips.length); return 0; }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [idx, paused, tips.length]);

  const t = tips[idx];

  return (
    <section className="f-ticker" style={{ '--t-c': t.c }}
             onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="f-ticker__rail" aria-hidden="true">
        <span className="f-ticker__rail-fill" style={{ height: progress + '%' }} />
      </div>
      <span className="f-ticker__ico"><Icon name={t.ico} /></span>
      <div key={idx} className="f-ticker__main">
        <div className="f-ticker__toprow">
          <span className="f-ticker__tag">{t.tag}</span>
          <span className="f-ticker__by">{t.by}</span>
        </div>
        <div className="f-ticker__title">{t.title}</div>
        <p className="f-ticker__body">{t.body}</p>
      </div>
      <div className="f-ticker__side">
        <div className="f-ticker__nav">
          <button className="f-ticker__btn" onClick={() => setIdx(i => (i - 1 + tips.length) % tips.length)} aria-label="السابق">
            <Icon name="chevron_right" />
          </button>
          <span className="f-ticker__count">{idx + 1} / {tips.length}</span>
          <button className="f-ticker__btn" onClick={() => setIdx(i => (i + 1) % tips.length)} aria-label="التالي">
            <Icon name="chevron_left" />
          </button>
        </div>
        <button className="f-ticker__add" disabled title="قريباً — إضافة وتعديل النصائح">
          <Icon name="add" /> إضافة <span className="f-ticker__soon">قريباً</span>
        </button>
      </div>
    </section>
  );
}

// =============================================================
// 4) SPOTLIGHT — rotating featured service
// =============================================================
const SCENES = [{ c: 'var(--f-cs)' }, { c: 'var(--f-ct)' }, { c: 'var(--f-cb)' }, { c: 'var(--f-ca)' }];

function Spotlight({ nav }) {
  const top = useMemo(() => [...window.SERVICES].sort((a, b) => b.popularity - a.popularity).slice(0, 4), []);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + 100 / 80;
        if (next >= 100) { setIdx(i => (i + 1) % top.length); return 0; }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [idx, paused, top.length]);

  const svc = top[idx];
  const sec = window.SECTION_MAP[svc.section];
  const scene = SCENES[idx % SCENES.length];

  return (
    <section className="f-spot-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="auto_awesome" /></span>
            خدمة مختارة
          </h2>
          <span className="f-h2__sub">تتبدّل تلقائياً بين أكثر الخدمات استخداماً — توقّف عند التمرير</span>
        </div>
      </div>
      <article key={svc.code} className="f-spot" style={{ '--sp-c': scene.c }}>
        <span className="f-spot__ico"><Icon name={svc.icon} /></span>
        <div className="f-spot__main">
          <div className="f-spot__chips">
            <span className="f-spot__chip">#{idx + 1} الأكثر طلباً</span>
            <span className="f-spot__chip">{sec.name}</span>
            <span className="f-spot__chip">{svc.code}</span>
          </div>
          <h3 className="f-spot__name">{svc.name}</h3>
          <div className="f-spot__meta">
            <span><Icon name="schedule" /> مدّة معتادة {svc.sla} أيام</span>
            <span><Icon name="local_fire_department" /> طلب {svc.popularity}٪</span>
            <span><Icon name="payments" /> {svc.fixedPrice ? fmtIQD(svc.fixedPrice) : svc.priceNote || 'حسب الصنف'}</span>
          </div>
        </div>
        <div className="f-spot__side">
          <button className="f-spot__cta syn__cta" onClick={() => nav('form', { code: svc.code })}>
            <svg className="arc" aria-hidden="true"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="22" pathLength="100" /></svg>
            <span className="syn__cta-roll"><span className="syn__cta-roll-stack"><span>ابدأ التعبئة</span><span>افتح النموذج</span></span></span>
            <Icon name="arrow_back" />
          </button>
          <button className="f-spot__alt" onClick={() => nav('detail', { code: svc.code })}><Icon name="info" /> تفاصيل الخدمة</button>
        </div>
        <div className="f-spot__progress"><span className="f-spot__progress-fill" style={{ width: progress + '%' }} /></div>
      </article>
      <div className="f-spot__controls">
        <button className="f-spot__arrow" onClick={() => setIdx(i => (i - 1 + top.length) % top.length)}><Icon name="chevron_right" /></button>
        <div className="f-spot__dots">
          {top.map((s, i) => (
            <button key={s.code} className={`f-spot__dot ${i === idx ? 'is-on' : ''}`}
                    style={{ '--dot-c': SCENES[i % SCENES.length].c }}
                    onClick={() => { setIdx(i); setProgress(0); }} />
          ))}
        </div>
        <button className="f-spot__arrow" onClick={() => setIdx(i => (i + 1) % top.length)}><Icon name="chevron_left" /></button>
        <button className="f-spot__pause" onClick={() => setPaused(p => !p)}>
          <Icon name={paused ? 'play_arrow' : 'pause'} />
          {paused ? 'متوقف' : 'تلقائي'}
        </button>
      </div>
    </section>
  );
}

// =============================================================
// 5) BOTTOM — stats + activity + sidebar
// =============================================================
function Spark({ values }) {
  const max = Math.max(...values);
  return (
    <div className="f-spark" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className={i === values.length - 1 ? 'last' : ''}
              style={{ height: Math.max(10, (v / max) * 100) + '%' }} />
      ))}
    </div>
  );
}

function Stats() {
  const k = window.KPIS;
  const items = [
    { c: 'var(--f-cs)', ico: 'bolt', lbl: 'طلبات اليوم', val: k.todayCases, unit: 'طلب', d: '+12%', sub: 'منذ 09:00 صباحاً', seed: 3 },
    { c: 'var(--f-ct)', ico: 'pending_actions', lbl: 'قيد المعالجة', val: k.pending, unit: 'حالة', d: '+5%', sub: '٢٣ بانتظار توقيعك', seed: 9 },
    { c: 'var(--f-cb)', ico: 'payments', lbl: 'محصّل اليوم', val: fmt(k.collected), unit: 'د.ع', d: '+8%', sub: 'من ٣٨ معاملة', seed: 17 },
    { c: 'var(--f-ca)', ico: 'sentiment_satisfied', lbl: 'رضا المشتركين', val: k.satisfaction, unit: '%', d: '+2%', sub: 'على ١٢٤ تقييم', seed: 11 },
  ];
  return (
    <section>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="insights" /></span>
            الإحصاءات والنتائج
          </h2>
          <span className="f-h2__sub">مؤشرات اليوم — تفاصيل أعمق في تبويب التقارير</span>
        </div>
      </div>
      <div className="f-stats">
        {items.map((it, i) => (
          <div key={i} className="f-stat" style={{ '--st-c': it.c }}>
            <div className="f-stat__top">
              <span className="f-stat__lbl">
                <span className="f-stat__lbl-ico"><Icon name={it.ico} /></span>
                {it.lbl}
              </span>
              <span className="f-stat__delta up"><Icon name="arrow_upward" />{it.d}</span>
            </div>
            <div className="f-stat__val">{it.val}<span className="f-stat__unit">{it.unit}</span></div>
            <div className="f-stat__sub">{it.sub}</div>
            <Spark values={bars(it.seed)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Activity() {
  return (
    <div className="f-card">
      <div className="f-card__head">
        <div>
          <h3 className="f-card__title"><Icon name="bolt" /> آخر الحركة</h3>
          <p className="f-card__sub">الحالات الحيّة في مركزك</p>
        </div>
        <button className="f-btn f-btn--ghost f-btn--sm"><Icon name="filter_alt" /> فلترة</button>
      </div>
      <div className="f-feed">
        {window.RECENT_CASES.map(c => {
          const svc = window.SERVICE_MAP[c.svc];
          const leadC = c.priority === 'urgent' ? 'var(--f-err)' :
                        c.priority === 'vip'    ? 'var(--f-warn)' : DEPT_COLORS[svc.section];
          return (
            <div key={c.id} className="f-feed__row" style={{ '--lead-c': leadC }}>
              <span className="f-feed__lead" />
              <div className="f-feed__main">
                <div className="f-feed__title">
                  <span className="f-feed__code">{svc.code}</span>
                  {c.subscriber}
                </div>
                <div className="f-feed__sub">{c.id} · {svc.name}</div>
              </div>
              <span className="f-feed__status">{c.status}</span>
              <span className="f-feed__time">{c.age}</span>
              <span className="f-feed__chev"><Icon name="chevron_left" /></span>
            </div>
          );
        })}
      </div>
      <div className="f-card__foot">
        <span>عرض ٦ من ٢١٣ حالة نشطة</span>
        <a href="#">عرض الكل ←</a>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="f-card">
        <div className="f-card__head">
          <div>
            <h3 className="f-card__title"><Icon name="donut_small" /> الاستخدام الشهري</h3>
            <p className="f-card__sub">٢,٤٨١ حالة · ٩٤٪ ضمن SLA</p>
          </div>
        </div>
        <div className="f-usage">
          {window.SECTIONS.map((s) => {
            const count = window.SERVICES.filter(x => x.section === s.code).length * 19;
            const pct = Math.min(100, Math.round((count / 600) * 100));
            return (
              <div key={s.code} className="f-usage__row" style={{ '--u-c': DEPT_COLORS[s.code] }}>
                <div className="f-usage__head">
                  <span className="f-usage__lbl">
                    <span className="f-usage__code">{s.code}</span>
                    {s.name}
                  </span>
                  <span className="f-usage__n">{count}</span>
                </div>
                <div className="f-usage__bar"><div className="f-usage__fill" style={{ width: pct + '%' }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="f-card">
        <div className="f-card__head">
          <div>
            <h3 className="f-card__title"><Icon name="terminal" /> أوامر سريعة</h3>
            <p className="f-card__sub">اضغط <span className="f-kbd">⌘K</span> للبحث الشامل</p>
          </div>
        </div>
        <div className="f-quicks">
          {/* Q1 — أيقونات تروي معناها (نقل حرفي من البنك) */}
          {[
            { lbl: 'فتح حالة جديدة', kbd: 'N', kind: 'newcase', c: 'var(--f-cs)' },
            { lbl: 'الانتقال للحالات', kbd: 'G I', kind: 'meter', c: 'var(--f-ct)' },
            { lbl: 'الانتقال للخدمات', kbd: 'G S', kind: 'pole', c: 'var(--f-cb)' },
            { lbl: 'تبديل السمة', kbd: '⌘J', kind: 'bill', c: 'var(--f-ca)' },
          ].map((it, i) => (
            <button key={i} className={`f-quick qik qik--${it.kind}`} style={{ '--q-c': it.c, '--c-c': it.c }}>
              <span className="f-quick__ico">
                {it.kind === 'newcase' && (
                  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M6 3 H17 L21 7 V22.5 H6 Z" /><line x1="9.5" y1="12" x2="16.5" y2="12" opacity="0.55" /><line className="plusH" x1="9.5" y1="17" x2="16.5" y2="17" /><line className="plusV" x1="13" y1="13.5" x2="13" y2="20.5" /></svg>
                )}
                {it.kind === 'meter' && (
                  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M3 16 A 10 10 0 0 1 23 16" /><line className="tick" x1="4.5" y1="12.5" x2="6" y2="13.5" /><line className="tick" x1="13" y1="6" x2="13" y2="8" /><line className="tick" x1="21.5" y1="12.5" x2="20" y2="13.5" /><line className="needle" x1="13" y1="15" x2="17" y2="10" /><circle className="s" cx="13" cy="15" r="1.5" /></svg>
                )}
                {it.kind === 'pole' && (
                  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><line x1="13" y1="3" x2="13" y2="22" /><path d="M3 8 C 9 12, 17 12, 23 8" /><path d="M6 6 L13 9 L20 6" opacity="0.55" /><circle className="spark s" cx="3" cy="8" r="1.6" /></svg>
                )}
                {it.kind === 'bill' && (
                  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M6 3.5 H17 L20.5 7 V22.5 H6 Z" /><line x1="9.5" y1="11" x2="16.5" y2="11" opacity="0.55" /><line x1="9.5" y1="14.5" x2="14.5" y2="14.5" opacity="0.55" /><g className="stamp"><circle className="s" cx="17" cy="17" r="4.6" /><path d="M15 17 L16.4 18.5 L19 15.8" /></g></svg>
                )}
              </span>
              <span className="f-quick__lbl">{it.lbl}</span>
              <span className="f-kbd">{it.kbd}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// APP
// =============================================================
function App() {
  const [route, setRoute] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tq-f-route') || '{"name":"overview"}'); }
    catch { return { name: 'overview' }; }
  });
  useEffect(() => { localStorage.setItem('tq-f-route', JSON.stringify(route)); }, [route]);
  useEffect(() => { window.scrollTo(0, 0); }, [route.name, route.code, route.section]);

  const nav = (name, params = {}) => setRoute({ name, ...params });

  const [dark, setDark] = useState(() => localStorage.getItem('tq-final-dark') === '1');
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('tq-final-dark', dark ? '1' : '0');
  }, [dark]);

  const [spot, setSpot] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSpot(s => !s); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const noop = () => setSpot(true);

  // top tabs map to routes
  const tab = ['services', 'detail', 'form'].includes(route.name) ? 'services'
            : route.name === 'cases' ? 'cases'
            : route.name === 'branches' ? 'branches'
            : route.name === 'pricing' ? 'pricing'
            : route.name === 'guide' ? 'guide'
            : route.name === 'reports' ? 'reports'
            : 'overview';

  let page = null;
  if (route.name === 'services')      page = <window.ServicesPage nav={nav} section={route.section} />;
  else if (route.name === 'detail')   page = <window.ServiceDetailPage nav={nav} code={route.code} />;
  else if (route.name === 'form')     page = <window.FormPage nav={nav} code={route.code} />;
  else if (route.name === 'cases')    page = <window.CasesPage nav={nav} />;
  else if (route.name === 'branches') page = <window.BranchesPage nav={nav} />;
  else if (route.name === 'pricing')  page = <window.PricingPage nav={nav} />;
  else if (route.name === 'guide')    page = <window.GuidePage nav={nav} />;
  else if (route.name === 'reports')  page = (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Stats />
      <div className="f-two">
        <Activity />
        <Sidebar />
      </div>
    </div>
  );
  else page = (
    <>
      <PageHead onCmdK={noop} nav={nav} />
      <Departments nav={nav} />
      <ServicesExpress nav={nav} />
      <TipsTicker />
      <Spotlight nav={nav} />
      <Stats />
      <div className="f-two">
        <Activity />
        <Sidebar />
      </div>
    </>
  );

  return (
    <div className="f-shell">
      <TopChrome tab={tab} setTab={(k) => nav(k)} dark={dark} setDark={setDark} onCmdK={noop} />
      <main className="f-page">
        {page}
      </main>
      <window.SpotlightOverlay open={spot} onClose={() => setSpot(false)} nav={nav} />
      <a className="f-floatcompare" href="compare.html">
        مقارنة التصاميم
        <span className="f-floatcompare__btn"><Icon name="compare" /> افتح</span>
      </a>
      <SignatureFooter />
    </div>
  );
}

// =============================================================
// SIGNATURE FOOTER — distinctive credits strip
// =============================================================
function SignatureFooter() {
  return (
    <footer className="f-sigfoot" role="contentinfo" aria-label="Designed and developed by Hussein Ali">
      <div className="f-sigfoot__rule" aria-hidden="true">
        <span className="f-sigfoot__rule-line" />
        <span className="f-sigfoot__rule-mark">
          <span className="f-sigfoot__rule-diamond" />
        </span>
        <span className="f-sigfoot__rule-line" />
      </div>

      <div className="f-sigfoot__inner">
        <div className="f-sigfoot__brand" aria-label="جهة التشغيل">
          <span className="f-sigfoot__brand-c">©</span>
          <span className="f-sigfoot__brand-y">2026</span>
          <span className="f-sigfoot__brand-bar" aria-hidden="true" />
          <span className="f-sigfoot__brand-name">تدفّق الخير</span>
          <span className="f-sigfoot__brand-sub">كهرباء الرصافة · فرع النضال</span>
        </div>

        <div className="f-sigfoot__credit">
          <span className="f-sigfoot__credit-eyebrow">Designed &amp; Developed</span>
          <h6 className="f-sigfoot__credit-name">
            <span className="f-sigfoot__credit-name-en">Hussein&nbsp;Ali</span>
          </h6>
          <span className="f-sigfoot__credit-meta">
            <span>Software · Design</span>
            <span className="f-sigfoot__credit-meta-dot" aria-hidden="true" />
            <span>Baghdad — Iraq</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <window.ToastProvider><App /></window.ToastProvider>
);
