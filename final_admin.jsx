// =============================================================
// FINAL — Admin page (services · tips · users · settings · audit)
// Reads/writes via window.DB; honors window.Auth permissions.
// =============================================================

(function () {

const { useState, useEffect, useMemo, useRef } = React;
const Icon = window.Icon;

const SECTION_OPTS  = ['CS','CT','CB','CA'];
const ROLE_OPTS     = ['admin','manager','employee','viewer'];
const TIP_TAGS      = ['نصيحة','سؤال متكرر','تحديث','تنبيه','تذكير'];
const TIP_ICONS     = ['lightbulb','help','campaign','warning','tips_and_updates','info','bolt','star','schedule'];
const TIP_COLORS    = [
  { v: 'var(--f-cs)', n: 'كوبالت' },
  { v: 'var(--f-ct)', n: 'برونز' },
  { v: 'var(--f-cb)', n: 'تركواز' },
  { v: 'var(--f-ca)', n: 'ورد' },
  { v: 'var(--f-ok)', n: 'أخضر' },
  { v: 'var(--f-warn)', n: 'كهرماني' },
];

// useStore — re-render when a DB collection updates
function useStore(api) {
  const [v, set] = useState(() => api.list());
  useEffect(() => api.subscribe(() => set(api.list())), [api]);
  return v;
}
function useScalar(api) {
  const [v, set] = useState(() => api.get());
  useEffect(() => api.subscribe(() => set(api.get())), [api]);
  return v;
}
function useAuthState() {
  const [, force] = useState(0);
  useEffect(() => window.Auth.subscribe(() => force(n => n + 1)), []);
  return window.Auth.currentUser();
}

// ---------- Small generic modal wrapper ----------
function Modal({ open, onClose, icon, title, sub, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="adm-modal" onClick={onClose}>
      <div className="adm-modal__sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="adm-modal__head">
          {icon && <Icon name={icon} />}
          <div>
            <h3 className="adm-modal__title">{title}</h3>
            {sub && <div className="adm-modal__sub">{sub}</div>}
          </div>
        </div>
        {children}
        {footer && <div className="adm-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Toggle ----------
function Toggle({ on, onChange, label }) {
  return (
    <label className={`adm-toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)}>
      <span className="adm-toggle__sw" />
      <span className="adm-toggle__lbl">{label}</span>
    </label>
  );
}

// =============================================================
// 1) OVERVIEW
// =============================================================
function OverviewTab({ go }) {
  const services = useStore(window.DB.services);
  const tips     = useStore(window.DB.tips);
  const users    = useStore(window.DB.users);
  const audit    = useStore(window.DB.audit);

  const stats = [
    { c: 'var(--f-cs)', ico: 'apps',          lbl: 'الخدمات', val: services.length, sub: `${services.filter(s => s.active !== false).length} مفعّلة`,    go: 'services' },
    { c: 'var(--f-ct)', ico: 'tips_and_updates', lbl: 'النصائح', val: tips.length, sub: `${tips.filter(t => t.active !== false).length} نشطة`,         go: 'tips' },
    { c: 'var(--f-cb)', ico: 'group',         lbl: 'المستخدمون', val: users.length, sub: `${users.filter(u => u.active).length} حساب نشط`,            go: 'users' },
    { c: 'var(--f-ca)', ico: 'history',       lbl: 'سجل التدقيق', val: audit.length, sub: audit[0] ? 'آخر نشاط: ' + new Date(audit[0].ts).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle: 'medium', timeStyle: 'short' }) : 'لا يوجد نشاط', go: 'audit' },
  ];

  const recent = audit.slice(0, 5);

  return (
    <>
      <div className="adm-stats">
        {stats.map((s, i) => (
          <button key={i} className="adm-statcard" style={{ '--st-c': s.c, textAlign: 'start', border: 0, cursor: 'pointer' }}
                  onClick={() => go(s.go)}>
            <span className="adm-statcard__lbl"><Icon name={s.ico} /> {s.lbl}</span>
            <div className="adm-statcard__val">{s.val}</div>
            <div className="adm-statcard__sub">{s.sub}</div>
          </button>
        ))}
      </div>

      <div className="adm-section" style={{ marginTop: 16 }}>
        <h3 className="adm-section__title"><Icon name="bolt" /> أحدث النشاط</h3>
        <p className="adm-section__sub">آخر ٥ إجراءات في النظام</p>
        {recent.length === 0 ? (
          <div className="adm-empty"><Icon name="inbox" /><div>لا يوجد نشاط مسجل بعد</div></div>
        ) : (
          <div className="adm-audit">
            {recent.map(a => (
              <div key={a.id} className="adm-audit__row">
                <span className="adm-audit__ts">{new Date(a.ts).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'short', timeStyle:'short' })}</span>
                <div className="adm-audit__main">
                  <span className="adm-audit__action">{a.action}</span>
                  <span>{a.target}</span>
                </div>
                <span className="adm-audit__by">{a.by}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// =============================================================
// 2) SERVICES
// =============================================================
function ServiceModal({ row, onSave, onClose }) {
  const [f, setF] = useState(() => row || {
    code: '', section: 'CS', name: '', short: '', sla: 3, popularity: 50,
    icon: 'description', priceNote: '', fixedPrice: '', active: true,
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const save = () => {
    if (!f.code || !f.name) return;
    onSave({
      ...f,
      sla: +f.sla || 0,
      popularity: +f.popularity || 0,
      fixedPrice: f.fixedPrice ? +f.fixedPrice : undefined,
    });
  };
  return (
    <Modal open onClose={onClose}
           icon={row ? 'edit' : 'add'}
           title={row ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
           sub="ستظهر هذه الخدمة في الواجهة فور الحفظ"
           footer={<>
             <button className="f-btn" onClick={onClose}>إلغاء</button>
             <button className="f-btn f-btn--primary" onClick={save}><Icon name="save" /> حفظ</button>
           </>}>
      <div className="adm-form">
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>كود الخدمة</label>
            <input value={f.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="CS0001" />
          </div>
          <div className="adm-field">
            <label>القسم</label>
            <select value={f.section} onChange={e => set('section', e.target.value)}>
              {SECTION_OPTS.map(s => <option key={s} value={s}>{s} — {window.SECTION_MAP[s] && window.SECTION_MAP[s].name}</option>)}
            </select>
          </div>
        </div>
        <div className="adm-field">
          <label>اسم الخدمة الكامل</label>
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="نقل ملكية اشتراك" />
        </div>
        <div className="adm-field">
          <label>اسم مختصر <span className="adm-field__help">(اختياري — يظهر في القوائم السريعة)</span></label>
          <input value={f.short || ''} onChange={e => set('short', e.target.value)} placeholder="نقل ملكية" />
        </div>
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>المدة المعتادة (أيام)</label>
            <input type="number" value={f.sla} onChange={e => set('sla', e.target.value)} min="1" />
          </div>
          <div className="adm-field">
            <label>الشعبية (٠–١٠٠)</label>
            <input type="number" value={f.popularity} onChange={e => set('popularity', e.target.value)} min="0" max="100" />
          </div>
        </div>
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>أيقونة Material</label>
            <input value={f.icon} onChange={e => set('icon', e.target.value)} placeholder="add_home" />
          </div>
          <div className="adm-field">
            <label>سعر ثابت (د.ع)</label>
            <input type="number" value={f.fixedPrice || ''} onChange={e => set('fixedPrice', e.target.value)} placeholder="اتركها فارغة لـ 'حسب الصنف'" />
          </div>
        </div>
        <div className="adm-field">
          <label>ملاحظة السعر</label>
          <input value={f.priceNote || ''} onChange={e => set('priceNote', e.target.value)} placeholder="حسب الصنف والقوة" />
        </div>
        <Toggle on={f.active !== false} onChange={(v) => set('active', v)} label="مفعّلة (تظهر للمستخدمين)" />
      </div>
    </Modal>
  );
}

function ServicesTab() {
  const rows = useStore(window.DB.services);
  const can  = window.Auth.can;
  const toast = window.useToast();
  const [q, setQ] = useState('');
  const [secF, setSecF] = useState('');
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = rows.filter(r => {
    if (secF && r.section !== secF) return false;
    if (q && !(r.name + ' ' + r.code).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const onSave = (data) => {
    if (edit) {
      window.DB.services.update(edit.id, data);
      window.DB.log('service.update', data.code, { name: data.name });
      toast.push({ kind:'success', title:'تم تحديث الخدمة', body: `${data.code} — ${data.name}` });
    } else {
      const exists = rows.some(r => r.code === data.code);
      if (exists) { toast.push({ kind:'error', title:'الكود مستخدم', body: 'استخدم كوداً آخر' }); return; }
      window.DB.services.create({ ...data, id: data.code });
      window.DB.log('service.create', data.code, { name: data.name });
      toast.push({ kind:'success', title:'تمت إضافة الخدمة', body: `${data.code} — ${data.name}` });
    }
    setEdit(null); setCreating(false);
  };
  const onDelete = (row) => {
    window.DB.services.remove(row.id);
    window.DB.log('service.delete', row.code, { name: row.name });
    toast.push({ kind:'info', title:'تم حذف الخدمة', body: row.name });
    setConfirmDel(null);
  };

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input placeholder="ابحث بالاسم أو الكود…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-toolbar__filter">
          <button className={`adm-chip ${!secF ? 'is-on' : ''}`} onClick={() => setSecF('')}>الكل</button>
          {SECTION_OPTS.map(s => (
            <button key={s} className={`adm-chip ${secF === s ? 'is-on' : ''}`} onClick={() => setSecF(s)}>
              {s} · {window.SECTION_MAP[s] && window.SECTION_MAP[s].name}
            </button>
          ))}
        </div>
        {can('services.write') && (
          <button className="f-btn f-btn--primary" onClick={() => setCreating(true)}>
            <Icon name="add" /> إضافة خدمة
          </button>
        )}
      </div>

      <div className="adm-tbl-wrap">
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <Icon name="search_off" />
            <div>لا توجد نتائج تطابق الفلاتر</div>
          </div>
        ) : (
          <table className="adm-tbl">
            <thead>
              <tr>
                <th style={{ width: 60 }}></th>
                <th style={{ width: 90 }}>الكود</th>
                <th>الاسم</th>
                <th style={{ width: 80 }}>القسم</th>
                <th style={{ width: 70 }}>SLA</th>
                <th style={{ width: 90 }}>الحالة</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sec = window.SECTION_MAP[r.section];
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="adm-svc-row__icon" style={{ '--sec-c': window.DEPT_COLORS[r.section] }}>
                        <Icon name={r.icon} />
                      </span>
                    </td>
                    <td><span className="adm-tbl__code">{r.code}</span></td>
                    <td>{r.name}</td>
                    <td><span className="adm-tbl__sec" style={{ '--sec-c': window.DEPT_COLORS[r.section] }}>{sec ? sec.name : r.section}</span></td>
                    <td>{r.sla} ي</td>
                    <td><span className={`adm-pill ${r.active !== false ? 'adm-pill--ok' : 'adm-pill--off'}`}>
                      {r.active !== false ? 'مفعّلة' : 'موقوفة'}
                    </span></td>
                    <td>
                      <div className="adm-tbl__actions">
                        {can('services.write') && (
                          <button className="adm-tbl__btn" title="تعديل" onClick={() => setEdit(r)}><Icon name="edit" /></button>
                        )}
                        {can('services.delete') && (
                          <button className="adm-tbl__btn adm-tbl__btn--danger" title="حذف" onClick={() => setConfirmDel(r)}><Icon name="delete" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(edit || creating) && (
        <ServiceModal row={edit} onSave={onSave} onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      <window.ConfirmDialog
        open={!!confirmDel} danger icon="delete"
        title="حذف الخدمة؟"
        description={confirmDel ? `سيتم حذف ${confirmDel.code} — ${confirmDel.name} نهائياً.` : ''}
        confirmLabel="نعم، احذف" cancelLabel="إلغاء"
        onConfirm={() => onDelete(confirmDel)} onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}

// =============================================================
// 3) TIPS
// =============================================================
function TipModal({ row, onSave, onClose }) {
  const [f, setF] = useState(() => row || {
    title: '', body: '', tag: 'نصيحة', ico: 'lightbulb',
    c: 'var(--f-cs)', by: 'الإدارة', active: true,
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const save = () => { if (!f.title || !f.body) return; onSave(f); };

  return (
    <Modal open onClose={onClose}
           icon={row ? 'edit' : 'add'}
           title={row ? 'تعديل نصيحة' : 'إضافة نصيحة جديدة'}
           sub="تظهر للموظفين في شريط النصائح بالصفحة الرئيسية"
           footer={<>
             <button className="f-btn" onClick={onClose}>إلغاء</button>
             <button className="f-btn f-btn--primary" onClick={save}><Icon name="save" /> حفظ</button>
           </>}>
        <div className="adm-tip-preview" style={{ '--tip-c': f.c }}>
          <Icon name={f.ico} />
          <div>
            <div className="adm-tip-preview__title">{f.title || 'العنوان…'}</div>
            <div className="adm-tip-preview__body">{f.body || 'المحتوى…'}</div>
          </div>
        </div>
      <div className="adm-form">
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>التصنيف</label>
            <select value={f.tag} onChange={e => set('tag', e.target.value)}>
              {TIP_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>الأيقونة</label>
            <select value={f.ico} onChange={e => set('ico', e.target.value)}>
              {TIP_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div className="adm-field">
          <label>العنوان</label>
          <input value={f.title} onChange={e => set('title', e.target.value)} placeholder="نصيحة قصيرة وواضحة" />
        </div>
        <div className="adm-field">
          <label>المحتوى</label>
          <textarea value={f.body} onChange={e => set('body', e.target.value)} placeholder="شرح موجز للنصيحة أو الإرشاد…" />
        </div>
        <div className="adm-field">
          <label>اللون</label>
          <div className="adm-colors">
            {TIP_COLORS.map(c => (
              <span key={c.v} className={`adm-color ${f.c === c.v ? 'is-on' : ''}`}
                    style={{ background: c.v, '--c': c.v }}
                    title={c.n} onClick={() => set('c', c.v)} />
            ))}
          </div>
        </div>
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>المصدر / الموقّع</label>
            <input value={f.by} onChange={e => set('by', e.target.value)} placeholder="مدير المركز" />
          </div>
          <div className="adm-field">
            <label>الحالة</label>
            <Toggle on={f.active !== false} onChange={(v) => set('active', v)} label={f.active !== false ? 'نشطة (تُعرض للموظفين)' : 'موقوفة'} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TipsTab() {
  const rows = useStore(window.DB.tips);
  const can  = window.Auth.can;
  const toast = window.useToast();
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = rows.filter(r =>
    !q || (r.title + ' ' + r.body + ' ' + r.tag).toLowerCase().includes(q.toLowerCase())
  );

  const onSave = (data) => {
    if (edit) {
      window.DB.tips.update(edit.id, data);
      window.DB.log('tip.update', data.title);
      toast.push({ kind:'success', title:'تم تحديث النصيحة' });
    } else {
      window.DB.tips.create(data);
      window.DB.log('tip.create', data.title);
      toast.push({ kind:'success', title:'تمت إضافة النصيحة', body: data.title });
    }
    setEdit(null); setCreating(false);
  };
  const onDelete = (row) => {
    window.DB.tips.remove(row.id);
    window.DB.log('tip.delete', row.title);
    toast.push({ kind:'info', title:'تم حذف النصيحة' });
    setConfirmDel(null);
  };
  const toggleActive = (row) => {
    window.DB.tips.update(row.id, { active: !(row.active !== false) });
    window.DB.log('tip.toggle', row.title);
  };

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input placeholder="ابحث في النصائح…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {can('tips.write') && (
          <button className="f-btn f-btn--primary" onClick={() => setCreating(true)}>
            <Icon name="add" /> إضافة نصيحة
          </button>
        )}
      </div>

      <div className="adm-tbl-wrap">
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <Icon name="tips_and_updates" />
            <div>{rows.length === 0 ? 'لم تتم إضافة نصائح بعد' : 'لا توجد نتائج'}</div>
          </div>
        ) : (
          <table className="adm-tbl">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>العنوان</th>
                <th style={{ width: 110 }}>التصنيف</th>
                <th style={{ width: 140 }}>المصدر</th>
                <th style={{ width: 90 }}>الحالة</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="adm-svc-row__icon" style={{ '--sec-c': r.c }}>
                      <Icon name={r.ico} />
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--f-ink)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--f-ink-3)', marginTop: 2 }}>{r.body.slice(0, 80)}{r.body.length > 80 && '…'}</div>
                  </td>
                  <td><span className="adm-pill adm-pill--info">{r.tag}</span></td>
                  <td style={{ color: 'var(--f-ink-2)', fontSize: '0.85rem' }}>{r.by}</td>
                  <td>
                    <span className={`adm-pill ${r.active !== false ? 'adm-pill--ok' : 'adm-pill--off'}`}
                          style={{ cursor: 'pointer' }} onClick={() => toggleActive(r)}>
                      {r.active !== false ? 'نشطة' : 'موقوفة'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-tbl__actions">
                      {can('tips.write') && (
                        <button className="adm-tbl__btn" title="تعديل" onClick={() => setEdit(r)}><Icon name="edit" /></button>
                      )}
                      {can('tips.delete') && (
                        <button className="adm-tbl__btn adm-tbl__btn--danger" title="حذف" onClick={() => setConfirmDel(r)}><Icon name="delete" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(edit || creating) && (
        <TipModal row={edit} onSave={onSave} onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      <window.ConfirmDialog
        open={!!confirmDel} danger icon="delete"
        title="حذف النصيحة؟"
        description={confirmDel ? `سيتم حذف "${confirmDel.title}" نهائياً.` : ''}
        confirmLabel="نعم، احذف" cancelLabel="إلغاء"
        onConfirm={() => onDelete(confirmDel)} onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}

// =============================================================
// 4) USERS
// =============================================================
function UserModal({ row, onSave, onClose, existingUsernames }) {
  const [f, setF] = useState(() => row || {
    name: '', username: '', email: '', role: 'employee', section: '*', active: true,
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const save = () => {
    if (!f.name || !f.username) return;
    if (!row && existingUsernames.includes(f.username)) return;
    onSave(f);
  };
  const usernameTaken = !row && existingUsernames.includes(f.username);

  return (
    <Modal open onClose={onClose}
           icon={row ? 'edit' : 'person_add'}
           title={row ? 'تعديل مستخدم' : 'إضافة مستخدم'}
           sub="الصلاحيات تعتمد على الدور المختار"
           footer={<>
             <button className="f-btn" onClick={onClose}>إلغاء</button>
             <button className="f-btn f-btn--primary" onClick={save} disabled={usernameTaken}>
               <Icon name="save" /> حفظ
             </button>
           </>}>
      <div className="adm-form">
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>الاسم الكامل</label>
            <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="حسين علي" />
          </div>
          <div className="adm-field">
            <label>اسم المستخدم</label>
            <input value={f.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g,''))} placeholder="hussein" />
            {usernameTaken && <div className="adm-field__help" style={{ color: 'var(--f-err)' }}>هذا الاسم مستخدم</div>}
          </div>
        </div>
        <div className="adm-field">
          <label>البريد الإلكتروني</label>
          <input type="email" value={f.email || ''} onChange={e => set('email', e.target.value)} placeholder="user@rasafa.iq" />
        </div>
        <div className="adm-form__row adm-form__row--2">
          <div className="adm-field">
            <label>الدور</label>
            <select value={f.role} onChange={e => set('role', e.target.value)}>
              {ROLE_OPTS.map(r => <option key={r} value={r}>{window.Auth.ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>القسم</label>
            <select value={f.section} onChange={e => set('section', e.target.value)}>
              <option value="*">جميع الأقسام</option>
              {SECTION_OPTS.map(s => <option key={s} value={s}>{window.SECTION_MAP[s] && window.SECTION_MAP[s].name}</option>)}
            </select>
          </div>
        </div>
        <Toggle on={!!f.active} onChange={(v) => set('active', v)} label={f.active ? 'الحساب نشط' : 'موقوف'} />
      </div>
    </Modal>
  );
}

function UsersTab() {
  const rows = useStore(window.DB.users);
  const me = useAuthState();
  const can  = window.Auth.can;
  const toast = window.useToast();
  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('');
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = rows.filter(r => {
    if (roleF && r.role !== roleF) return false;
    if (q && !(r.name + ' ' + r.username + ' ' + (r.email || '')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const onSave = (data) => {
    if (edit) {
      window.DB.users.update(edit.id, data);
      window.DB.log('user.update', data.username, { role: data.role });
      toast.push({ kind:'success', title:'تم تحديث المستخدم' });
    } else {
      window.DB.users.create(data);
      window.DB.log('user.create', data.username, { role: data.role });
      toast.push({ kind:'success', title:'تمت إضافة المستخدم', body: data.name });
    }
    setEdit(null); setCreating(false);
  };
  const onDelete = (row) => {
    if (me && row.id === me.id) { toast.push({ kind:'error', title:'لا يمكنك حذف حسابك' }); setConfirmDel(null); return; }
    window.DB.users.remove(row.id);
    window.DB.log('user.delete', row.username);
    toast.push({ kind:'info', title:'تم حذف المستخدم' });
    setConfirmDel(null);
  };
  const switchTo = (row) => {
    window.Auth.signInAs(row.id);
    toast.push({ kind:'success', title:'تم التحويل', body: 'الجلسة الحالية: ' + row.name });
  };

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input placeholder="ابحث بالاسم أو البريد…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-toolbar__filter">
          <button className={`adm-chip ${!roleF ? 'is-on' : ''}`} onClick={() => setRoleF('')}>الكل</button>
          {ROLE_OPTS.map(r => (
            <button key={r} className={`adm-chip ${roleF === r ? 'is-on' : ''}`} onClick={() => setRoleF(r)}>
              {window.Auth.ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        {can('users.write') && (
          <button className="f-btn f-btn--primary" onClick={() => setCreating(true)}>
            <Icon name="person_add" /> إضافة مستخدم
          </button>
        )}
      </div>

      <div className="adm-tbl-wrap">
        {filtered.length === 0 ? (
          <div className="adm-empty"><Icon name="group" /><div>لا توجد نتائج</div></div>
        ) : (
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th style={{ width: 120 }}>الدور</th>
                <th style={{ width: 110 }}>القسم</th>
                <th style={{ width: 90 }}>الحالة</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isMe = me && r.id === me.id;
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="adm-side__user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                          {r.name.slice(0, 1)}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {r.name} {isMe && <span className="adm-pill adm-pill--info" style={{ marginInlineStart: 6 }}>أنت</span>}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--f-ink-3)' }}>@{r.username} · {r.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="adm-pill adm-pill--info">{window.Auth.ROLE_LABELS[r.role]}</span></td>
                    <td>
                      {r.section === '*' ? <span style={{ color: 'var(--f-ink-3)' }}>الكل</span> : (
                        <span className="adm-tbl__sec" style={{ '--sec-c': window.DEPT_COLORS[r.section] }}>{r.section}</span>
                      )}
                    </td>
                    <td><span className={`adm-pill ${r.active ? 'adm-pill--ok' : 'adm-pill--off'}`}>{r.active ? 'نشط' : 'موقوف'}</span></td>
                    <td>
                      <div className="adm-tbl__actions">
                        {!isMe && (
                          <button className="adm-tbl__btn" title="تحويل الجلسة" onClick={() => switchTo(r)}><Icon name="login" /></button>
                        )}
                        {can('users.write') && (
                          <button className="adm-tbl__btn" title="تعديل" onClick={() => setEdit(r)}><Icon name="edit" /></button>
                        )}
                        {can('users.delete') && !isMe && (
                          <button className="adm-tbl__btn adm-tbl__btn--danger" title="حذف" onClick={() => setConfirmDel(r)}><Icon name="delete" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(edit || creating) && (
        <UserModal row={edit}
                   existingUsernames={rows.map(r => r.username)}
                   onSave={onSave}
                   onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      <window.ConfirmDialog
        open={!!confirmDel} danger icon="delete"
        title="حذف المستخدم؟"
        description={confirmDel ? `سيتم حذف ${confirmDel.name} نهائياً.` : ''}
        confirmLabel="نعم، احذف" cancelLabel="إلغاء"
        onConfirm={() => onDelete(confirmDel)} onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}

// =============================================================
// 5) SETTINGS
// =============================================================
function SettingsTab() {
  const s = useScalar(window.DB.settings);
  const can = window.Auth.can;
  const toast = window.useToast();
  const [f, setF] = useState(s);
  useEffect(() => setF(s), [s]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = () => {
    window.DB.settings.set(f);
    window.DB.log('settings.update', 'center');
    toast.push({ kind:'success', title:'تم حفظ الإعدادات' });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(window.DB.exportAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `tadfuq-backup-${new Date().toISOString().slice(0,10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
    window.DB.log('data.export', 'all');
    toast.push({ kind:'success', title:'تم تصدير البيانات' });
  };
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        window.DB.importAll(JSON.parse(reader.result));
        window.DB.log('data.import', file.name);
        toast.push({ kind:'success', title:'تم استيراد البيانات' });
      } catch (err) {
        toast.push({ kind:'error', title:'فشل الاستيراد', body: err.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [confirmReset, setConfirmReset] = useState(false);
  const doReset = () => {
    window.DB.resetAll();
    toast.push({ kind:'info', title:'تمت إعادة التهيئة' });
    setConfirmReset(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="adm-section">
        <h3 className="adm-section__title"><Icon name="apartment" /> بيانات المركز</h3>
        <p className="adm-section__sub">تظهر في الترويسة والنماذج المطبوعة</p>
        <div className="adm-form">
          <div className="adm-form__row adm-form__row--2">
            <div className="adm-field"><label>اسم المركز</label>
              <input value={f.centerName || ''} onChange={e => set('centerName', e.target.value)} /></div>
            <div className="adm-field"><label>رمز المركز</label>
              <input value={f.centerCode || ''} onChange={e => set('centerCode', e.target.value)} /></div>
          </div>
          <div className="adm-form__row adm-form__row--2">
            <div className="adm-field"><label>الفرع</label>
              <input value={f.branch || ''} onChange={e => set('branch', e.target.value)} /></div>
            <div className="adm-field"><label>المنطقة</label>
              <input value={f.region || ''} onChange={e => set('region', e.target.value)} /></div>
          </div>
          <div className="adm-field"><label>اسم المسؤول</label>
            <input value={f.managerName || ''} onChange={e => set('managerName', e.target.value)} /></div>
          <div className="adm-field"><label>عنوان الترويسة (للمطبوعات)</label>
            <input value={f.headerTitle || ''} onChange={e => set('headerTitle', e.target.value)} /></div>
          <div className="adm-field"><label>اسم الشركة</label>
            <input value={f.company || ''} onChange={e => set('company', e.target.value)} /></div>
          {can('admin.settings') && (
            <div>
              <button className="f-btn f-btn--primary" onClick={save}>
                <Icon name="save" /> حفظ الإعدادات
              </button>
            </div>
          )}
        </div>
      </div>

      {can('data.export') && (
        <div className="adm-section">
          <h3 className="adm-section__title"><Icon name="backup" /> النسخ الاحتياطي والاستيراد</h3>
          <p className="adm-section__sub">تصدير كامل البيانات كملف JSON واستيرادها لاحقاً</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="f-btn" onClick={exportData}>
              <Icon name="download" /> تصدير كل البيانات
            </button>
            <label className="f-btn" style={{ cursor: 'pointer' }}>
              <Icon name="upload" /> استيراد من ملف
              <input type="file" accept="application/json" style={{ display: 'none' }} onChange={importData} />
            </label>
            <button className="f-btn" style={{ color: 'var(--f-err)', borderColor: 'color-mix(in srgb, var(--f-err) 35%, var(--f-border))' }}
                    onClick={() => setConfirmReset(true)}>
              <Icon name="restart_alt" /> إعادة التهيئة الافتراضية
            </button>
          </div>
        </div>
      )}

      <window.ConfirmDialog
        open={confirmReset} danger icon="restart_alt"
        title="إعادة تهيئة كاملة؟"
        description="ستفقد جميع التعديلات: الخدمات المعدّلة، النصائح المضافة، المستخدمين، السجل، والإعدادات. لا يمكن التراجع."
        confirmLabel="نعم، أعد التهيئة" cancelLabel="إلغاء"
        onConfirm={doReset} onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

// =============================================================
// 6) AUDIT LOG
// =============================================================
function AuditTab() {
  const rows = useStore(window.DB.audit);
  const [q, setQ] = useState('');
  const filtered = rows.filter(r => !q ||
    (r.action + ' ' + r.target + ' ' + r.by).toLowerCase().includes(q.toLowerCase()));
  const clear = () => {
    if (!confirm('مسح كامل السجل؟')) return;
    window.DB.audit.replaceAll([]);
  };
  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input placeholder="ابحث في السجل…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="f-btn" onClick={clear} style={{ color: 'var(--f-err)' }}>
          <Icon name="delete_sweep" /> مسح السجل
        </button>
      </div>
      <div className="adm-audit">
        {filtered.length === 0 ? (
          <div className="adm-empty"><Icon name="history" /><div>السجل فارغ</div></div>
        ) : filtered.map(a => (
          <div key={a.id} className="adm-audit__row">
            <span className="adm-audit__ts">
              {new Date(a.ts).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'short', timeStyle:'short' })}
            </span>
            <div className="adm-audit__main">
              <span className="adm-audit__action">{a.action}</span>
              <span>{a.target}</span>
              {a.payload && <span style={{ color: 'var(--f-ink-3)', fontSize: '0.78rem', marginInlineStart: 8 }}>
                {Object.entries(a.payload).map(([k,v]) => `${k}: ${v}`).join(' · ')}
              </span>}
            </div>
            <span className="adm-audit__by">{a.by}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// =============================================================
// MAIN ADMIN PAGE
// =============================================================
function AdminPage({ nav, initialTab }) {
  const me = useAuthState();
  const [tab, setTab] = useState(initialTab || 'overview');
  const services = useStore(window.DB.services);
  const tips     = useStore(window.DB.tips);
  const users    = useStore(window.DB.users);
  const audit    = useStore(window.DB.audit);

  if (!me || !window.Auth.can('admin.access')) {
    return (
      <div className="adm-section" style={{ textAlign: 'center', padding: 40 }}>
        <Icon name="lock" />
        <h3 className="adm-section__title" style={{ justifyContent: 'center', marginTop: 12 }}>الوصول مقيّد</h3>
        <p className="adm-section__sub">صفحة الأدمن متاحة فقط للمسؤولين والمدراء.</p>
      </div>
    );
  }

  const tabs = [
    { k: 'overview', l: 'نظرة عامة',     ico: 'space_dashboard', count: null },
    { k: 'services', l: 'الخدمات',       ico: 'apps',            count: services.length },
    { k: 'tips',     l: 'النصائح',       ico: 'tips_and_updates',count: tips.length },
    { k: 'users',    l: 'المستخدمون',    ico: 'group',           count: users.length, perm: 'users.read' },
    { k: 'settings', l: 'إعدادات المركز',ico: 'tune',            count: null },
    { k: 'audit',    l: 'سجل التدقيق',   ico: 'history',         count: audit.length,  perm: 'audit.read' },
  ].filter(t => !t.perm || window.Auth.can(t.perm));

  const titles = {
    overview: { l: 'لوحة الأدمن',        s: 'نظرة عامة على إعدادات وبيانات النظام', ico: 'admin_panel_settings' },
    services: { l: 'إدارة الخدمات',      s: 'إضافة وتعديل وحذف خدمات المركز',       ico: 'apps' },
    tips:     { l: 'إدارة النصائح',      s: 'تحكم بالنصائح والإرشادات المعروضة',    ico: 'tips_and_updates' },
    users:    { l: 'إدارة المستخدمين',    s: 'إضافة المستخدمين وتحديد صلاحياتهم',     ico: 'group' },
    settings: { l: 'إعدادات المركز',      s: 'بيانات المركز والترويسة والنسخ الاحتياطي', ico: 'tune' },
    audit:    { l: 'سجل التدقيق',         s: 'كل ما تم في النظام مع وقت ومنفّذ',     ico: 'history' },
  };

  let body;
  if      (tab === 'overview') body = <OverviewTab go={setTab} />;
  else if (tab === 'services') body = <ServicesTab />;
  else if (tab === 'tips')     body = <TipsTab />;
  else if (tab === 'users')    body = <UsersTab />;
  else if (tab === 'settings') body = <SettingsTab />;
  else if (tab === 'audit')    body = <AuditTab />;

  return (
    <div className="fp-enter adm-shell">
      <aside className="adm-side">
        <span className="adm-side__title">الإدارة</span>
        {tabs.map(t => (
          <button key={t.k} className={`adm-side__btn ${tab === t.k ? 'is-on' : ''}`} onClick={() => setTab(t.k)}>
            <Icon name={t.ico} /> {t.l}
            {t.count != null && <span className="adm-side__count">{t.count}</span>}
          </button>
        ))}
        <div className="adm-side__sep" />
        <div className="adm-side__user">
          <span className="adm-side__user-avatar">{me.name.slice(0,1)}</span>
          <div className="adm-side__user-main">
            <span className="adm-side__user-name">{me.name}</span>
            <span className="adm-side__user-role">{window.Auth.ROLE_LABELS[me.role]}</span>
          </div>
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-head">
          <div>
            <h1 className="adm-head__title">
              <Icon name={titles[tab].ico} />
              {titles[tab].l}
            </h1>
            <span className="adm-head__sub">{titles[tab].s}</span>
          </div>
        </div>
        {body}
      </div>
    </div>
  );
}

window.AdminPage = AdminPage;

})();
