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
  'فحص ميداني': 1, 'بانتظار الدفع': 3, 'موافقة مدير': 2,
  'فريق طوارئ': 4, 'تحقق قانوني': 2, 'قيد التنفيذ': 4,
};

function CasesPage({ nav }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    if (filter === 'all') return window.RECENT_CASES;
    if (filter === 'urgent') return window.RECENT_CASES.filter(c => c.priority === 'urgent');
    if (filter === 'vip') return window.RECENT_CASES.filter(c => c.priority === 'vip');
    return window.RECENT_CASES.filter(c => window.SERVICE_MAP[c.svc].section === filter);
  }, [filter]);

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
        <button className="f-btn f-btn--primary"><Icon name="add" /> حالة جديدة</button>
      </div>

      <div className="fc-filter">
        {[['all', 'الكل', window.RECENT_CASES.length],
          ['urgent', 'عاجل', window.RECENT_CASES.filter(c => c.priority === 'urgent').length],
          ['vip', 'VIP', window.RECENT_CASES.filter(c => c.priority === 'vip').length],
          ...window.SECTIONS.map(s => [s.code, s.name, window.RECENT_CASES.filter(c => window.SERVICE_MAP[c.svc].section === s.code).length]),
        ].map(([k, l, n]) => (
          <button key={k} className={`fc-chip ${filter === k ? 'is-on' : ''}`} onClick={() => setFilter(k)}>
            {l} <span className="fc-chip__n">{n}</span>
          </button>
        ))}
      </div>

      <div className="f-card">
        {list.map(c => {
          const svc = window.SERVICE_MAP[c.svc];
          const leadC = c.priority === 'urgent' ? 'var(--f-err)' :
                        c.priority === 'vip'    ? 'var(--f-warn)' : DEPT_COLORS[svc.section];
          const stage = FC_STATUS_STAGE[c.status] ?? 1;
          const isOpen = open === c.id;
          return (
            <div key={c.id} className={`fc-row ${isOpen ? 'is-open' : ''}`} style={{ '--lead-c': leadC }}>
              <div className="fc-row__head" onClick={() => setOpen(isOpen ? null : c.id)}>
                <span className="fc-row__lead" />
                <div className="fc-row__main">
                  <div className="fc-row__t">
                    <span className="fc-row__code">{svc.code}</span>
                    {c.subscriber}
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
                  <button className="fc-row__close" onClick={(e) => {
                    e.stopPropagation();
                    window.scheduleUndoableAction({
                      msg: 'سيتم إغلاق الحالة ' + c.id,
                      onCommit: () => {},
                      onUndo: () => {}
                    });
                  }}>
                    <Icon name="check_circle" /> إغلاق الحالة
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
