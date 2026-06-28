// =============================================================
// FINAL — Cases + Pricing + Guide pages
// =============================================================

// ---------- CASES ----------
const FC_STAGES = [
  { ico: 'inbox',          l: 'الاستلام' },
  { ico: 'travel_explore', l: 'الكشف' },
  { ico: 'analytics',      l: 'الدراسة' },
  { ico: 'payments',       l: 'الدفع' },
  { ico: 'construction',   l: 'التنفيذ' },
  { ico: 'verified',       l: 'الإغلاق' },
];
const FC_STATUS_STAGE = {
  'استلام الطلب': 0,
  'فحص ميداني': 1, 'بانتظار الدفع': 3, 'موافقة مدير': 2,
  'فريق طوارئ': 4, 'تحقق قانوني': 2, 'قيد التنفيذ': 4,
  'مغلقة': 5,
};

// Relative-time label for persisted requests (Arabic).
function fcTimeAgo(ts) {
  if (!ts) return '—';
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'الآن';
  const m = Math.floor(s / 60);
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'أمس';
  return `منذ ${d} يوم`;
}

function CasesPage({ nav }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const toast = window.useToast ? window.useToast() : null;

  // Live persisted requests (created via the form) — re-render on change.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!window.DB || !window.DB.requests) return;
    return window.DB.requests.subscribe(() => setTick(t => t + 1));
  }, []);

  // Persisted requests (newest first) mapped to the case-row shape,
  // then the seeded demo cases. Skip any unknown service codes.
  const allCases = useMemo(() => {
    const reqs = (window.DB && window.DB.requests ? window.DB.requests.list() : [])
      .slice()
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter(r => window.SERVICE_MAP[r.svc])
      .map(r => ({
        id: r.no || r.id,
        recId: r.id,
        svc: r.svc,
        subscriber: r.subscriber,
        status: r.status,
        fee: r.fee,
        age: fcTimeAgo(r.createdAt),
        officer: r.officer || '—',
        priority: r.priority || 'standard',
        isReal: true,
      }));
    return [...reqs, ...window.RECENT_CASES];
  }, [filter, tick]);

  const matches = (c, k) => {
    if (k === 'all') return true;
    if (k === 'urgent') return c.priority === 'urgent';
    if (k === 'vip') return c.priority === 'vip';
    const svc = window.SERVICE_MAP[c.svc];
    return svc && svc.section === k;
  };

  const list = allCases.filter(c => matches(c, filter));

  const closeCase = (c) => {
    if (!c.isReal) {
      toast && toast.push({ kind: 'info', title: 'حالة تجريبية', body: 'هذه حالة عرض توضيحي ولا يمكن إغلاقها.' });
      return;
    }
    window.scheduleUndoableAction({
      msg: 'سيتم إغلاق الحالة ' + c.id,
      onCommit: () => {
        window.DB.requests.update(c.recId, { status: 'مغلقة' });
        window.DB.log && window.DB.log('request.close', c.id);
      },
      onUndo: () => {},
    });
  };

  return (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button className="fp-back" onClick={() => nav('overview')}>
        <Icon name="arrow_forward" /> الرئيسية
      </button>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="inventory_2" /></span>
            متابعة الحالات
          </h2>
          <span className="f-h2__sub">اضغط على أي حالة لكشف مسارها الكامل — النقطة النابضة هي المرحلة الحالية</span>
        </div>
        <button className="f-btn f-btn--primary" onClick={() => nav('services')}>
          <Icon name="add" /> حالة جديدة
        </button>
      </div>

      <div className="fc-filter">
        {[['all', 'الكل'],
          ['urgent', 'عاجل'],
          ['vip', 'VIP'],
          ...window.SECTIONS.map(s => [s.code, s.name]),
        ].map(([k, l]) => (
          <button key={k} className={`fc-chip ${filter === k ? 'is-on' : ''}`} onClick={() => setFilter(k)}>
            {l} <span className="fc-chip__n">{allCases.filter(c => matches(c, k)).length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <window.EmptyState
          icon="inbox"
          title={filter === 'all' ? 'لا توجد حالات بعد' : 'لا حالات في هذا التصنيف'}
          body={filter === 'all'
            ? 'ابدأ بتقديم طلب خدمة جديد وسيظهر هنا لمتابعة مساره.'
            : 'جرّب تصنيفًا آخر أو اعرض كل الحالات.'}
          action={filter === 'all'
            ? { label: 'حالة جديدة', icon: 'add', onClick: () => nav('services') }
            : { label: 'عرض الكل', icon: 'list', onClick: () => setFilter('all') }}
        />
      ) : (
      <div className="f-card">
        {list.map(c => {
          const svc = window.SERVICE_MAP[c.svc];
          const leadC = c.priority === 'urgent' ? 'var(--f-err)' :
                        c.priority === 'vip'    ? 'var(--f-warn)' : DEPT_COLORS[svc.section];
          const stage = FC_STATUS_STAGE[c.status] ?? 1;
          const isOpen = open === c.id;
          const isClosed = c.status === 'مغلقة';
          return (
            <div key={c.id} className={`fc-row ${isOpen ? 'is-open' : ''}`} style={{ '--lead-c': leadC }}>
              <div className="fc-row__head" onClick={() => setOpen(isOpen ? null : c.id)}>
                <span className="fc-row__lead" />
                <div className="fc-row__main">
                  <div className="fc-row__t">
                    <span className="fc-row__code">{svc.code}</span>
                    {c.subscriber}
                    {c.isReal && <span className="fc-row__new" style={{
                      marginInlineStart: 8, fontSize: '.66rem', fontWeight: 800,
                      padding: '2px 8px', borderRadius: 999, color: 'var(--f-cs)',
                      background: 'color-mix(in srgb, var(--f-cs) 12%, transparent)' }}>جديد</span>}
                  </div>
                  <div className="fc-row__s">{c.id} · {svc.name}</div>
                </div>
                <span className="fc-row__officer"><Icon name="person" size={14} /> {c.officer}</span>
                <span className="fc-row__fee">{c.fee ? fmtIQD(c.fee) : '—'}</span>
                <span className="fc-row__age">{c.age}</span>
                <span className="fc-row__chev"><Icon name="chevron_left" /></span>
              </div>
              <div className="fc-row__detail">
                <div className="fc-timeline">
                  {FC_STAGES.map((st, i) => (
                    <div key={i} className={`fc-stage ${i < stage ? 'is-done' : ''} ${i === stage ? 'is-now' : ''}`} style={{ '--si': i }}>
                      <span className="fc-stage__dot"><Icon name={i < stage ? 'check' : st.ico} /></span>
                      <span className="fc-stage__l">{i === stage ? c.status : st.l}</span>
                    </div>
                  ))}
                </div>
                <div className="fc-row__actions">
                  {isClosed ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                                   color: 'var(--f-ok)', fontWeight: 700, fontSize: '.85rem' }}>
                      <Icon name="verified" size={16} /> حالة مغلقة
                    </span>
                  ) : (
                    <button className="fc-row__close" onClick={(e) => { e.stopPropagation(); closeCase(c); }}>
                      <Icon name="check_circle" /> إغلاق الحالة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

// ---------- PRICING ----------
function PricingPage({ nav }) {
  const cats = Object.entries(window.PRICING);
  const [cat, setCat] = useState(cats[0][0]);
  const [q, setQ] = useState('');
  const active = window.PRICING[cat];
  const maxAmount = Math.max(...active.items.map(i => i.amount));
  const catColors = { inspection: 'var(--f-cs)', install: 'var(--f-ct)', reconnect: 'var(--f-ca)' };

  const items = active.items.filter(i => !q.trim() || i.name.includes(q.trim()));

  return (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button className="fp-back" onClick={() => nav('overview')}>
        <Icon name="arrow_forward" /> الرئيسية
      </button>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="request_quote" /></span>
            جدول الأجور الرسمي ٢٠٢٦
          </h2>
          <span className="f-h2__sub">الأشرطة تقارن كل بند بأعلى قيمة في فئته</span>
        </div>
      </div>

      <div className="fr-cats">
        {cats.map(([k, v]) => (
          <button key={k} className={`fc-chip ${cat === k ? 'is-on' : ''}`} onClick={() => setCat(k)}>
            {v.label} <span className="fc-chip__n">{v.items.length}</span>
          </button>
        ))}
      </div>

      <div className="fs-search" style={{ marginBottom: 0 }}>
        <Icon name="search" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في البنود…" />
        <span className="fs-search__count">{items.length} بند</span>
      </div>

      <div className="f-card">
        <div className="fr-table" key={cat + q}>
          {items.map((it, i) => (
            <div key={it.key} className="fr-row" style={{ '--pr-c': catColors[cat] || 'var(--f-navy)' }}>
              <span className="fr-row__name">{it.name}</span>
              <span className="fr-row__amount">{fmtIQD(it.amount)}</span>
              <span className="fr-row__bar">
                <span style={{ width: Math.max(6, Math.round((it.amount / maxAmount) * 100)) + '%', animationDelay: `${i * 60}ms` }} />
              </span>
            </div>
          ))}
        </div>
        <div className="f-card__foot">
          <span>المصدر: لائحة الأجور الرسمية ٢٠٢٦ — كهرباء الرصافة</span>
          <span>تُحدَّث عند صدور تعديل</span>
        </div>
      </div>
    </div>
  );
}

// ---------- GUIDE ----------
const FG_ITEMS = [
  {
    c: 'var(--f-cs)', ico: 'help_center', t: 'متى يقدّم الموظف خدمة الاشتراك الجديد؟',
    body: 'تقدَّم عند توفر بناء مكتمل أو إجازة بناء سارية، وعدم وجود اشتراك سابق على نفس العقار، وموقع ضمن نطاق التغطية.',
    steps: ['تحقق من المستمسكات الأساسية (هوية + بطاقة سكن + تأييد)', 'افتح نموذج CS0001 من المنصة وعبّئه أمام المشترك', 'أصدر وصل رسوم الطلب وحوّل للكشف الميداني'],
  },
  {
    c: 'var(--f-ct)', ico: 'model_training', t: 'كيف تستخدم النسختين (الاحترافية / الأصلية)؟',
    body: 'النسخة الاحترافية للتعبئة السريعة بالحقول الذكية والحساب التلقائي، والأصلية مطابقة للنموذج الورقي الرسمي وتُستخدم للطباعة والأرشفة.',
    steps: ['عبّئ في الاحترافية — تُحفظ تلقائياً', 'بدّل للأصلية للمراجعة النهائية', 'اطبع مباشرة — تخرج بصيغة النموذج الرسمي'],
  },
  {
    c: 'var(--f-cb)', ico: 'library_add', t: 'كيف تضاف خدمة جديدة للمنصة؟',
    body: 'كل خدمة تُعرَّف ببطاقة موحدة: الكود، القسم، المدة، الأجور، المستمسكات، ونموذجها. عند صدور خدمة جديدة من الإدارة تُضاف خلال يوم عمل.',
    steps: ['اعتماد الكود والقسم من الإدارة', 'إدخال بيانات البطاقة والأجور', 'بناء النموذجين (أصلي + احترافي) ونشرهما'],
  },
  {
    c: 'var(--f-ca)', ico: 'tips_and_updates', t: 'تطوير الخدمة وتحسينها',
    body: 'راقب نسب الإرجاع وأسبابها من التقارير، وأضف نصائح للفريق عبر شريط التنبيهات، واقترح تحسين الحقول التي تتكرر فيها الأخطاء.',
    steps: ['راجع تقرير الإرجاع أسبوعياً', 'أضف نصيحة موجهة للفريق', 'ارفع مقترح التعديل للإدارة'],
  },
];

function GuidePage({ nav }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="fp-enter" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button className="fp-back" onClick={() => nav('overview')}>
        <Icon name="arrow_forward" /> الرئيسية
      </button>
      <div className="f-h2">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="menu_book" /></span>
            دليل موظف خدمات المشتركين
          </h2>
          <span className="f-h2__sub">شرح الاستخدام، شروط التقديم، وكيفية تطوير الخدمات</span>
        </div>
      </div>
      <div className="fg-grid">
        {FG_ITEMS.map((g, i) => (
          <div key={i} className={`fg-card ${open === i ? 'is-open' : ''}`} style={{ '--g-c': g.c }}>
            <div className="fg-card__head" onClick={() => setOpen(open === i ? null : i)}>
              <span className="fg-card__ico"><Icon name={g.ico} /></span>
              <span className="fg-card__t">{g.t}</span>
              <span className="fg-card__chev"><Icon name="chevron_left" /></span>
            </div>
            <div className="fg-card__body">
              <div className="fg-card__inner">
                {g.body}
                <ol>
                  {g.steps.map((s, j) => <li key={j}>{s}</li>)}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CasesPage, PricingPage, GuidePage });
