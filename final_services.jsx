// =============================================================
// FINAL — Services Hub (Service Wallet) + Service Detail
// =============================================================

// advisory meta — type → icon / color / label
const ADV_META = {
  danger: { i: 'emergency_home', c: 'var(--f-err)',  l: 'تنبيه خطر' },
  review: { i: 'gavel',          c: 'var(--f-cs)',   l: 'مراجعة رسمية' },
  scale:  { i: 'move_up',        c: 'var(--f-cb)',   l: 'قابل للتوسع' },
  tip:    { i: 'lightbulb',      c: 'var(--f-ct)',   l: 'نصيحة ميدانية' },
  faq:    { i: 'contact_support', c: 'var(--f-ca)',  l: 'سؤال متكرر' },
};

function AdvisoryDock({ svc, flush }) {
  if (!svc) return null;
  const items = window.getAdvisories(svc.code);
  if (!items.length) return null;
  return (
    <div className={`adv-dock ${flush ? 'fd-adv' : ''}`} key={svc.code}>
      <div className="adv-dock__head">
        <span className="adv-dock__label">
          <Icon name="shield_person" /> إرشادات وملاحظات رسمية
        </span>
        <span className="adv-dock__code">{svc.code}</span>
      </div>
      <div className="adv-rows">
        {items.map((it, i) => {
          const m = ADV_META[it.t] || ADV_META.tip;
          return (
            <div key={i} className="adv-row" style={{ '--a-c': m.c, '--i': i }}>
              <span className="adv-row__ico"><Icon name={m.i} /></span>
              <span className="adv-row__main">
                <span className="adv-row__tag">{m.l}</span>
                <span className="adv-row__tx">{it.x}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3D coverflow scroller — sets --d / --ad per pass from scroll position
function PassFlow({ list, nav }) {
  const ref = useRef(null);
  const [focus, setFocus] = useState(0);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    let best = 0, bestD = 1e9;
    el.querySelectorAll('.hub-pass').forEach((c, i) => {
      const cr = c.getBoundingClientRect();
      let d = (cr.left + cr.width / 2 - cx) / (r.width * 0.55);
      d = Math.max(-1, Math.min(1, d));
      c.style.setProperty('--d', d.toFixed(3));
      c.style.setProperty('--ad', Math.abs(d).toFixed(3));
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 50));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    setFocus(best);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    const t = setTimeout(update, 120);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf); clearTimeout(t);
    };
  }, [list]);

  const goTo = (i) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelectorAll('.hub-pass')[i];
    if (!card) return;
    const r = el.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    el.scrollBy({ left: cr.left + cr.width / 2 - (r.left + r.width / 2), behavior: 'smooth' });
  };

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.min(focus + 1, list.length - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.max(focus - 1, 0)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, list.length]);

  if (list.length === 0) return <div className="hub-empty">لا توجد خدمات مطابقة — جرّب كلمة أخرى.</div>;

  const focusSvc = list[focus];
  const scrubC = focusSvc ? DEPT_COLORS[focusSvc.section] : 'var(--f-navy)';

  return (
    <div className="hub-flow-wrap">
      <div className="hub-flow" ref={ref} dir="rtl">
        {list.map((svc, i) => (
          <div key={svc.code}
               className={`hub-pass ${i === focus ? 'is-focus' : ''}`}
               style={{ '--p-c': DEPT_COLORS[svc.section] }}
               onClick={() => { if (i !== focus) goTo(i); }}>
            <div className="hub-pass__card">
              {svc.urgent && <span className="hub-pass__urgent">طارئ</span>}
              <div className="hub-pass__band">
                <span className="hub-pass__dept">
                  <Icon name={window.SECTION_MAP[svc.section].icon} />
                  {window.SECTION_MAP[svc.section].name}
                </span>
                <span className="hub-pass__code">{svc.code}</span>
              </div>
              <div className="hub-pass__body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <window.StickerIco kind={svc.section} size={48} className="hub-pass__stk" />
                  <h3 className="hub-pass__name">{svc.name}</h3>
                </div>
                <div className="hub-pass__perf" />
                <div className="hub-pass__specs">
                  <span className="hub-pass__spec">
                    <span className="hub-pass__spec-l">الأجور</span>
                    <span className="hub-pass__spec-v">{svc.fixedPrice ? fmtIQD(svc.fixedPrice) : (svc.priceNote || 'بدون أجور')}</span>
                  </span>
                  <span className="hub-pass__spec">
                    <span className="hub-pass__spec-l">الإنجاز</span>
                    <span className="hub-pass__spec-v">{svc.sla} أيام عمل</span>
                  </span>
                </div>
              </div>
              <div className="hub-pass__actions">
                <button className="hub-pass__go" onClick={(e) => { e.stopPropagation(); nav('form', { code: svc.code }); }}>
                  <Icon name="edit_document" /> ابدأ التعبئة
                </button>
                <button className="hub-pass__alt" onClick={(e) => { e.stopPropagation(); nav('detail', { code: svc.code }); }}>
                  <Icon name="info" /> التفاصيل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hub-scrub" style={{ '--scrub-c': scrubC }}>
        <button className="hub-scrub__arrow" onClick={() => goTo(Math.max(focus - 1, 0))} aria-label="السابق">
          <Icon name="chevron_right" />
        </button>
        <div className="hub-scrub__track">
          <div className="hub-scrub__fill" style={{ width: `${((focus + 1) / list.length) * 100}%` }} />
        </div>
        <button className="hub-scrub__arrow" onClick={() => goTo(Math.min(focus + 1, list.length - 1))} aria-label="التالي">
          <Icon name="chevron_left" />
        </button>
        <span className="hub-scrub__count">{focus + 1} / {list.length}</span>
      </div>
      <AdvisoryDock svc={focusSvc} />
    </div>
  );
}

function ServicesPage({ nav, section }) {
  const [sec, setSec] = useState(section || 'all');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState(() => localStorage.getItem('tq-hub-mode') || 'wallet');
  useEffect(() => { if (section) setSec(section); }, [section]);
  useEffect(() => { localStorage.setItem('tq-hub-mode', mode); }, [mode]);

  const list = useMemo(() => {
    return window.SERVICES.filter(s => {
      if (sec !== 'all' && s.section !== sec) return false;
      const t = q.trim();
      if (t && !s.name.includes(t) && !s.code.toLowerCase().includes(t.toLowerCase())) return false;
      return true;
    });
  }, [sec, q]);

  return (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="fp-back" onClick={() => nav('overview')}>
        <Icon name="arrow_forward" /> الرئيسية
      </button>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="wallet" /></span>
            محفظة الخدمات
          </h2>
          <span className="f-h2__sub">{window.SERVICES.length} خدمة — اختر رزمة قسم ثم قلّب البطاقات</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="fs-pill">
            <Icon name="search" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث بالاسم أو الرقم…" />
            <span className="fs-pill__count">{list.length}</span>
          </label>
          <div className="hub-mode" role="tablist" aria-label="طريقة العرض">
            <button className={`hub-mode__btn ${mode === 'wallet' ? 'is-on' : ''}`} onClick={() => setMode('wallet')} title="عرض المحفظة">
              <Icon name="style" />
            </button>
            <button className={`hub-mode__btn ${mode === 'grid' ? 'is-on' : ''}`} onClick={() => setMode('grid')} title="عرض الشبكة">
              <Icon name="grid_view" />
            </button>
            <button className={`hub-mode__btn ${mode === 'liquid' ? 'is-on' : ''}`} data-mode="liquid" onClick={() => setMode('liquid')} title="تدفّق سائل">
              <Icon name="water_drop" />
            </button>
          </div>
        </div>
      </div>

      {/* department stacks */}
      <div className="hub-stacks">
        <button className={`hub-stack ${sec === 'all' ? 'is-on' : ''}`}
                style={{ '--hs-c': 'var(--f-navy)' }}
                onClick={() => setSec('all')}>
          <span className="hub-stack__card">
            <window.StickerIco kind="all" size={34} className="hub-stack__stk" tilt={-8} />
            <span className="hub-stack__top">
              <span className="hub-stack__n">{window.SERVICES.length}</span>
            </span>
            <span className="hub-stack__name">كل الخدمات</span>
          </span>
        </button>
        {window.SECTIONS.map(s => (
          <button key={s.code}
                  className={`hub-stack ${sec === s.code ? 'is-on' : ''}`}
                  style={{ '--hs-c': DEPT_COLORS[s.code] }}
                  onClick={() => setSec(s.code)}>
            <span className="hub-stack__card">
              <window.StickerIco kind={s.code} size={34} className="hub-stack__stk" tilt={s.code === 'CT' ? 7 : -8} />
              <span className="hub-stack__top">
                <span className="hub-stack__n">{window.SERVICES.filter(x => x.section === s.code).length}</span>
              </span>
              <span className="hub-stack__name">{s.name}</span>
            </span>
          </button>
        ))}
      </div>

      {mode === 'wallet' ? (
        <PassFlow list={list} nav={nav} key={sec + '|' + q} />
      ) : (
        <div className={`fs-grid ${mode === 'liquid' ? 'is-liquid' : ''}`} key={sec + '|' + q}>
          {list.length === 0 && (
            <div className="fs-empty">لا توجد خدمات مطابقة — جرّب كلمة أخرى.</div>
          )}
          {list.map((svc, i) => (
            <button key={svc.code} className="fs-card"
                    data-code={svc.code}
                    style={{ '--c-c': DEPT_COLORS[svc.section], '--stagger': `${Math.min(i, 12) * 40}ms` }}
                    onClick={() => nav('detail', { code: svc.code })}>
              {svc.urgent && <span className="fs-card__urgent">طارئ</span>}
              <div className="fs-card__top">
                <span className="fs-card__ico"><Icon name={svc.icon} /></span>
                <span className="fs-card__code">{svc.code}</span>
              </div>
              <h3 className="fs-card__name">{svc.name}</h3>
              <div className="fs-card__foot">
                <span>SLA {svc.sla}ي</span>
                <span className="fs-card__fee">
                  {svc.fixedPrice ? fmtIQD(svc.fixedPrice) : (svc.priceNote || 'بدون أجور')}
                </span>
                <span className="fs-card__go"><Icon name="arrow_back" /></span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// SERVICE DETAIL
// =============================================================
const FD_STEPS = [
  { ico: 'inbox',          t: 'استلام الطلب',   s: 'فوري' },
  { ico: 'travel_explore', t: 'الكشف الميداني', s: '١-٢ يوم' },
  { ico: 'analytics',      t: 'الدراسة',        s: '١-٣ أيام' },
  { ico: 'payments',       t: 'الدفع',          s: 'الصندوق' },
  { ico: 'construction',   t: 'التنفيذ',        s: 'فريق الميدان' },
  { ico: 'verified',       t: 'الإغلاق',        s: 'إشعار المشترك' },
];

const FD_DOCS = {
  default: [
    { n: 'نسخة من هوية الأحوال المدنية / البطاقة الموحدة' },
    { n: 'نسخة من بطاقة السكن' },
    { n: 'طلب خطي موقّع من المشترك' },
  ],
  CS0001: [
    { n: 'نسخة من هوية الأحوال المدنية' },
    { n: 'نسخة من بطاقة السكن' },
    { n: 'كتاب تأييد سكن مصدق' },
    { n: 'صورة موثقة للقسام الشرعي', opt: 'عند اللزوم' },
    { n: 'كتاب ضريبة العقار' },
    { n: 'إجازة البناء مصدقة', opt: 'بدل ضريبة العقار' },
    { n: 'سند قيد التسجيل للعقار (الطابو)' },
    { n: 'صورة من قائمة حساب المجاور' },
    { n: 'كتاب التنمية الصناعية', opt: 'صناعي' },
    { n: 'كتاب المضخة الزراعية', opt: 'زراعي' },
    { n: 'كتاب من الدائرة', opt: 'حكومي' },
    { n: 'إجازة الاستثمار', opt: 'استثماري' },
  ],
};

function ServiceDetailPage({ nav, code }) {
  const svc = window.SERVICE_MAP[code] || window.SERVICES[0];
  const sec = window.SECTION_MAP[svc.section];
  const docs = FD_DOCS[svc.code] || FD_DOCS.default;
  const insp = window.PRICING.inspection.items;

  return (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="fp-back" onClick={() => nav('services', { section: svc.section })}>
        <Icon name="arrow_forward" /> دليل الخدمات
      </button>

      <div className="fd-hero" style={{ '--d-c': DEPT_COLORS[svc.section] }}>
        <window.StickerIco kind={svc.section} size={66} className="fd-hero__stk" tilt={-6} />
        <div>
          <div className="fd-hero__chips">
            <span className="f-deck__code" style={{ '--d-c': DEPT_COLORS[svc.section] }}>{svc.code}</span>
            <span className="f-deck__chip">{sec.name}</span>
            {svc.urgent && <span className="fs-card__urgent" style={{ position: 'static' }}>طارئ</span>}
          </div>
          <h1 className="fd-hero__name">{svc.name}</h1>
          <div className="fd-hero__meta">
            <span><Icon name="schedule" size={16} /> مدة الإنجاز المعتادة {svc.sla} أيام عمل</span>
            <span><Icon name="local_fire_department" size={16} /> نسبة الطلب {svc.popularity}٪</span>
            <span><Icon name="payments" size={16} /> {svc.fixedPrice ? fmtIQD(svc.fixedPrice) : (svc.priceNote || 'بدون أجور ثابتة')}</span>
          </div>
        </div>
        <div className="fd-hero__side">
          <button className="f-btn f-btn--primary f-btn--lg" onClick={() => nav('form', { code: svc.code })}>
            <Icon name="edit_document" /> ابدأ التعبئة
          </button>
          <button className="f-btn">
            <Icon name="menu_book" /> دليل الإجراء
          </button>
        </div>
      </div>

      <AdvisoryDock svc={svc} flush />

      <div className="f-card">
        <div className="f-card__head">
          <div>
            <h3 className="f-card__title"><Icon name="route" /> مسار المعاملة</h3>
            <p className="f-card__sub">المراحل القياسية من الاستلام حتى الإغلاق</p>
          </div>
        </div>
        <div className="fd-steps">
          {FD_STEPS.map((st, i) => (
            <div key={i} className="fd-step" style={{ '--i': i }}>
              <span className="fd-step__dot"><Icon name={st.ico} /></span>
              <span className="fd-step__t">{st.t}</span>
              <span className="fd-step__s">{st.s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fd-grid">
        <div className="f-card">
          <div className="f-card__head">
            <div>
              <h3 className="f-card__title"><Icon name="folder_open" /> المستمسكات المطلوبة</h3>
              <p className="f-card__sub">حسب نموذج {svc.code} الرسمي</p>
            </div>
          </div>
          <div className="fd-docs">
            {docs.map((d, i) => (
              <div key={i} className="fd-doc">
                <span className="fd-doc__n">{i + 1}</span>
                {d.n}
                {d.opt && <span className="fd-doc__opt">{d.opt}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="f-card">
          <div className="f-card__head">
            <div>
              <h3 className="f-card__title"><Icon name="request_quote" /> أجور الكشف حسب الصنف</h3>
              <p className="f-card__sub">لائحة ٢٠٢٦ الرسمية</p>
            </div>
          </div>
          <div className="fd-fees">
            {insp.map(it => (
              <div key={it.key} className="fd-fee">
                <span>{it.name}</span>
                <span className="fd-fee__amount">{fmtIQD(it.amount)}</span>
              </div>
            ))}
          </div>
          <div className="f-card__foot">
            <span>القائمة الكاملة في تبويب الأجور</span>
            <a href="#" onClick={(e) => { e.preventDefault(); nav('pricing'); }}>جدول الأجور ←</a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ServicesPage, ServiceDetailPage });
