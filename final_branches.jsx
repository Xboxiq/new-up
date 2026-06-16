// =============================================================
// FINAL — Branches Page: نطاق التغطية والمحلات المشمولة
// =============================================================

function BranchesPage({ nav }) {
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [foundMahalla, setFoundMahalla] = useState(null);

  // Mahalla lookup as the user types numbers
  useEffect(() => {
    const qt = (q || '').trim();
    if (!qt) { setFoundMahalla(null); return; }
    if (/^\d+$/.test(qt)) {
      const b = window.findBranchByMahalla(qt);
      if (b) {
        setFoundMahalla({ mahalla: qt, branch: b });
        setActiveId(b.id);
        return;
      }
    }
    setFoundMahalla(null);
  }, [q]);

  const filtered = useMemo(() => {
    const qt = (q || '').trim();
    if (!qt) return window.BRANCHES;
    const isNum = /^\d+$/.test(qt);
    return window.BRANCHES.filter(b => {
      if (isNum) return b.mahallas.includes(qt) || b.id.includes(qt);
      const t = qt.toLowerCase();
      return b.name.includes(qt) || b.district.includes(qt) || b.manager.includes(qt) ||
             b.id.toLowerCase().includes(t);
    });
  }, [q]);

  const stats = window.BRANCH_STATS;

  return (
    <div className="fp-enter" style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <button className="fp-back" onClick={() => nav('overview')}>
        <Icon name="arrow_forward" /> الرئيسية
      </button>

      <header className="fb-hero">
        <div className="fb-hero__main">
          <span className="fb-hero__eyebrow"><Icon name="hub" /> نطاق التغطية</span>
          <h1 className="fb-hero__title">فروع كهرباء الرصافة <em>والمحلات المشمولة</em></h1>
          <p className="fb-hero__lede">
            {stats.total} فرعاً موزّعاً على {stats.districts} مناطق إدارية، تخدم {fmt(stats.subscribers)} مشترك عبر {stats.mahallas} محلة بلدية.
            استعمل البحث برقم المحلة لمعرفة الفرع المختص فوراً.
          </p>
        </div>
        <div className="fb-hero__kpis">
          <div className="fb-kpi" style={{'--k-c':'var(--f-cs)'}}>
            <span className="fb-kpi__ico"><Icon name="domain" /></span>
            <span className="fb-kpi__val">{stats.total}</span>
            <span className="fb-kpi__lbl">فرع</span>
          </div>
          <div className="fb-kpi" style={{'--k-c':'var(--f-ct)'}}>
            <span className="fb-kpi__ico"><Icon name="map" /></span>
            <span className="fb-kpi__val">{stats.mahallas}</span>
            <span className="fb-kpi__lbl">محلة</span>
          </div>
          <div className="fb-kpi" style={{'--k-c':'var(--f-cb)'}}>
            <span className="fb-kpi__ico"><Icon name="groups" /></span>
            <span className="fb-kpi__val">{fmt(stats.subscribers)}</span>
            <span className="fb-kpi__lbl">مشترك</span>
          </div>
          <div className="fb-kpi" style={{'--k-c':'var(--f-ca)'}}>
            <span className="fb-kpi__ico"><Icon name="location_city" /></span>
            <span className="fb-kpi__val">{stats.districts}</span>
            <span className="fb-kpi__lbl">منطقة إدارية</span>
          </div>
        </div>
      </header>

      <div className="fb-toolbar">
        <div className="fb-search">
          <Icon name="search" />
          <input value={q} onChange={e => setQ(e.target.value)}
                 placeholder="ابحث برقم محلة (٩٠١) أو اسم فرع أو منطقة…"
                 dir="auto" />
          {q && <button className="fb-search__clear" onClick={() => setQ('')}><Icon name="close" /></button>}
        </div>
        <div className="fb-toolbar__hint">
          <Icon name="info" />
          أرقام المحلات في بغداد تكتب بـ ٣ خانات (مثل ٩٠١، ١٠٢) — كل فرع يخدم نطاقاً متجاوراً
        </div>
      </div>

      {foundMahalla && (
        <div className="fb-found">
          <span className="fb-found__ico"><Icon name="my_location" /></span>
          <div>
            <strong>المحلة {foundMahalla.mahalla}</strong> تتبع <em>{foundMahalla.branch.name}</em>
            <small> · {foundMahalla.branch.id} · المدير: {foundMahalla.branch.manager}</small>
          </div>
          <a className="fb-found__call" href={`tel:${foundMahalla.branch.phone}`}>
            <Icon name="call" /> اتصل بالفرع
          </a>
        </div>
      )}

      <div className="fb-grid">
        {filtered.map(b => {
          const isActive = activeId === b.id;
          const loadClass = b.loadStatus.includes('شديد') ? 'fb-card--hot' :
                            b.loadStatus.includes('ضغط') ? 'fb-card--warm' : 'fb-card--cool';
          return (
            <article key={b.id}
                     className={`fb-card ${loadClass} ${isActive ? 'is-active' : ''} ${b.primary ? 'is-primary' : ''}`}
                     onClick={() => setActiveId(isActive ? null : b.id)}>
              <header className="fb-card__head">
                <div className="fb-card__id">
                  <span className="fb-card__code">{b.id}</span>
                  {b.primary && <span className="fb-card__badge"><Icon name="star" /> مركزك</span>}
                </div>
                <span className={`fb-card__load`}>
                  <span className="fb-card__load-dot" />
                  {b.loadStatus}
                </span>
              </header>
              <h3 className="fb-card__name">{b.name}</h3>
              <p className="fb-card__district"><Icon name="place" /> {b.district}</p>

              <div className="fb-card__people">
                <span className="fb-card__avatar">{b.manager.split(' ')[1]?.[0] || 'م'}</span>
                <div>
                  <span className="fb-card__manager">{b.manager}</span>
                  <span className="fb-card__role">مدير الفرع</span>
                </div>
              </div>

              <div className="fb-card__meta">
                <span><Icon name="schedule" /> {b.hours}</span>
                <span><Icon name="call" /> <a href={`tel:${b.phone}`} dir="ltr">{b.phone}</a></span>
                <span><Icon name="location_on" /> {b.address}</span>
                <span><Icon name="my_location" /> <code dir="ltr">{b.gps}</code></span>
              </div>

              <div className="fb-card__chips">
                {b.services.map(s => {
                  const sec = window.SECTION_MAP[s];
                  return (
                    <span key={s} className="fb-card__svc" style={{'--s-c':DEPT_COLORS[s]}}>
                      <span className="fb-card__svc-dot" />
                      {sec ? sec.name : s}
                    </span>
                  );
                })}
              </div>

              <div className="fb-card__coverage">
                <div className="fb-card__coverage-head">
                  <span><Icon name="map" /> المحلات المشمولة</span>
                  <b>{b.mahallas.length}</b>
                </div>
                <div className="fb-card__mahallas">
                  {b.mahallas.map(m => (
                    <span key={m}
                          className={`fb-mahalla ${foundMahalla && foundMahalla.mahalla === m ? 'is-hit' : ''}`}
                          dir="ltr">{m}</span>
                  ))}
                </div>
              </div>

              <footer className="fb-card__foot">
                <div className="fb-card__stat">
                  <span className="fb-card__stat-n">{fmt(b.subscribers)}</span>
                  <span className="fb-card__stat-l">مشترك</span>
                </div>
                <div className="fb-card__stat">
                  <span className="fb-card__stat-n">{b.mahallas.length}</span>
                  <span className="fb-card__stat-l">محلة</span>
                </div>
                <div className="fb-card__stat">
                  <span className="fb-card__stat-n">{b.capacity}</span>
                  <span className="fb-card__stat-l">السعة</span>
                </div>
                <button className="fb-card__cta" onClick={(e) => { e.stopPropagation(); nav('services'); }}>
                  ابدأ خدمة من هذا الفرع <Icon name="arrow_back" />
                </button>
              </footer>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="fb-empty">
          <Icon name="search_off" />
          <h3>لا توجد نتائج</h3>
          <p>تأكّد من رقم المحلة أو جرّب اسم فرع/منطقة.</p>
        </div>
      )}

      <section className="fb-legend">
        <h3><Icon name="rule" /> ملاحظات تشغيلية للموظف</h3>
        <div className="fb-legend__grid">
          <div className="fb-legend__row">
            <span className="fb-legend__dot fb-legend__dot--cool" />
            <div><b>الحالة: مستقر</b><small>التغذية ضمن السعة الاسمية — لا قيود إضافية على الخدمات.</small></div>
          </div>
          <div className="fb-legend__row">
            <span className="fb-legend__dot fb-legend__dot--warm" />
            <div><b>الحالة: تحت الضغط</b><small>تجنّب اشتراكات الأحمال الكبيرة دون موافقة قسم التخطيط.</small></div>
          </div>
          <div className="fb-legend__row">
            <span className="fb-legend__dot fb-legend__dot--hot" />
            <div><b>الحالة: ضغط شديد</b><small>اشتراكات جديدة بموافقة مدير الفرع وحجز جدولة فصل/وصل.</small></div>
          </div>
          <div className="fb-legend__row">
            <span className="fb-legend__dot fb-legend__dot--star" />
            <div><b>"مركزك"</b><small>الفرع الذي تنتمي إليه — يُعرض أولاً ويُحفظ افتراضياً في كل نموذج.</small></div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { BranchesPage });
