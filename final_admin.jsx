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
  const roleOptions = window.DB ? window.DB.roles.list() : [];
  const branchOptions = window.DB ? window.DB.branches.list() : [];
  const deptOptions = window.DB ? window.DB.departments.list() : [];

  const [f, setF] = useState(() => row || {
    name: '', username: '', email: '',
    roleId: (roleOptions.find(r => r.key === 'customer_service') || roleOptions[0] || {}).id || '',
    branchId: '', departmentId: '',
    active: true,
    mustChangePassword: true,
  });
  const [pwd, setPwd] = useState('');
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.name || !f.username || !f.roleId) return;
    if (!row && existingUsernames.includes(f.username)) return;
    if (!row && !pwd) { alert('أدخل كلمة مرور ابتدائية'); return; }
    const data = { ...f };
    if (!row && pwd && window.DB) {
      const h = await window.DB.hashPassword(pwd);
      data.passwordHash = h.hash;
      data.passwordSalt = h.salt;
      data.passwordAlgo = h.algo;
      data.failedLoginCount = 0;
      data.lockedUntil = null;
      data.mustChangePassword = true;
    }
    onSave(data);
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
            <select value={f.roleId || ''} onChange={e => set('roleId', e.target.value)}>
              <option value="" disabled>اختر دوراً…</option>
              {roleOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>الفرع</label>
            <select value={f.branchId || ''} onChange={e => set('branchId', e.target.value || null)}>
              <option value="">جميع الفروع</option>
              {branchOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="adm-field">
          <label>القسم</label>
          <select value={f.departmentId || ''} onChange={e => set('departmentId', e.target.value || null)}>
            <option value="">جميع الأقسام</option>
            {deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        {!row && (
          <div className="adm-field">
            <label>كلمة المرور الابتدائية</label>
            <input type="text" value={pwd} onChange={e => setPwd(e.target.value)}
                   placeholder="سيُطلب من المستخدم تغييرها فور الدخول" />
          </div>
        )}
        <Toggle on={!!f.active} onChange={(v) => set('active', v)} label={f.active ? 'الحساب نشط' : 'موقوف'} />
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
//  USERS TAB — enterprise user management
// ─────────────────────────────────────────────────────────────
function _userStatus(u) {
  if (!u.active) return { key: 'disabled', label: 'موقوف',  tone: 'off'  };
  if (u.lockedUntil && u.lockedUntil > Date.now())
                     return { key: 'locked',   label: 'مقفل',   tone: 'warn' };
  if (u.mustChangePassword)
                     return { key: 'pending',  label: 'بحاجة تغيير كلمة المرور', tone: 'info' };
  return               { key: 'active',   label: 'نشط',    tone: 'ok'   };
}
function _timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  if (d < 7) return `قبل ${d} يوم`;
  return new Date(ts).toLocaleDateString('ar-IQ-u-ca-gregory', { day:'2-digit', month:'short', year:'numeric' });
}

function UsersTab() {
  const rows = useStore(window.DB.users);
  const me = useAuthState();
  const can  = window.Auth.can;
  const toast = window.useToast();
  const roleOptions   = window.DB.roles.list();
  const branchOptions = window.DB.branches.list();
  const deptOptions   = window.DB.departments.list();

  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('');
  const [statusF, setStatusF] = useState('');     // '' | 'active' | 'disabled' | 'locked' | 'pending'
  const [branchF, setBranchF] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [drawer, setDrawer] = useState(null);     // user object being viewed
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [resetPwdFor, setResetPwdFor] = useState(null);

  const filtered = useMemo(() => rows.filter(r => {
    if (roleF && r.roleId !== roleF) return false;
    if (branchF && r.branchId !== branchF) return false;
    if (statusF && _userStatus(r).key !== statusF) return false;
    if (q) {
      const hay = (r.name + ' ' + r.username + ' ' + (r.email || '')).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [rows, roleF, branchF, statusF, q]);

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const onSave = async (data) => {
    if (edit) {
      window.DB.users.update(edit.id, data);
      window.DB.log('user.update', data.username);
      toast.push({ kind:'success', title:'تم تحديث المستخدم' });
    } else {
      window.DB.users.create(data);
      window.DB.log('user.create', data.username);
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
    if (drawer && drawer.id === row.id) setDrawer(null);
  };
  const toggleActive = (row) => {
    if (me && row.id === me.id) { toast.push({ kind:'error', title:'لا يمكنك إيقاف حسابك' }); return; }
    window.DB.users.update(row.id, { active: !row.active });
    window.DB.log(row.active ? 'user.disable' : 'user.enable', row.username);
    toast.push({ kind: row.active ? 'warn' : 'success', title: row.active ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب' });
  };
  const unlockUser = (row) => {
    window.DB.users.update(row.id, { lockedUntil: null, failedLoginCount: 0 });
    window.DB.log('user.unlock', row.username);
    toast.push({ kind:'success', title:'تم فك القفل' });
  };
  const forceLogout = (row) => {
    const sessions = window.DB.sessions.list().filter(s => s.userId === row.id && !s.revoked);
    sessions.forEach(s => window.DB.sessions.update(s.id, { revoked: true, revokedAt: Date.now(), revokedReason: 'admin_force' }));
    window.DB.log('user.force_logout', row.username, { count: sessions.length });
    toast.push({ kind:'success', title:`تم إنهاء ${sessions.length} جلسة` });
  };

  // bulk actions
  const bulkEnable = () => {
    selected.forEach(id => {
      const u = window.DB.users.get(id);
      if (u && !u.active) { window.DB.users.update(id, { active: true }); window.DB.log('user.enable', u.username); }
    });
    toast.push({ kind:'success', title:`تم تفعيل ${selected.size} حساب` });
    setSelected(new Set());
  };
  const bulkDisable = () => {
    let n = 0;
    selected.forEach(id => {
      if (me && id === me.id) return;
      const u = window.DB.users.get(id);
      if (u && u.active) { window.DB.users.update(id, { active: false }); window.DB.log('user.disable', u.username); n++; }
    });
    toast.push({ kind:'warn', title:`تم إيقاف ${n} حساب` });
    setSelected(new Set());
  };

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-search">
          <Icon name="search" />
          <input placeholder="ابحث بالاسم، اسم المستخدم، البريد…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="adm-select" value={roleF} onChange={e => setRoleF(e.target.value)}>
          <option value="">كل الأدوار</option>
          {roleOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="adm-select" value={branchF} onChange={e => setBranchF(e.target.value)}>
          <option value="">كل الفروع</option>
          {branchOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="adm-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="disabled">موقوف</option>
          <option value="locked">مقفل</option>
          <option value="pending">بحاجة تغيير كلمة المرور</option>
        </select>
        {can('user.create') && (
          <button className="f-btn f-btn--primary" onClick={() => setCreating(true)}>
            <Icon name="person_add" /> إضافة مستخدم
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="adm-bulk">
          <span><Icon name="check_circle" /> تم تحديد <b>{selected.size}</b> مستخدم</span>
          <div className="adm-bulk__actions">
            {can('user.disable') && (
              <>
                <button className="f-btn" onClick={bulkEnable}><Icon name="check" /> تفعيل</button>
                <button className="f-btn" onClick={bulkDisable}><Icon name="block" /> إيقاف</button>
              </>
            )}
            <button className="f-btn" onClick={() => setSelected(new Set())}><Icon name="close" /> إلغاء</button>
          </div>
        </div>
      )}

      <div className="adm-tbl-wrap">
        {filtered.length === 0 ? (
          <div className="adm-empty"><Icon name="group" /><div>لا توجد نتائج</div></div>
        ) : (
          <table className="adm-tbl adm-tbl--users">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <label className="adm-checkbox">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                    <span /></label>
                </th>
                <th>المستخدم</th>
                <th style={{ width: 150 }}>الدور</th>
                <th style={{ width: 160 }}>الفرع / القسم</th>
                <th style={{ width: 130 }}>الحالة</th>
                <th style={{ width: 110 }}>آخر دخول</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isMe = me && r.id === me.id;
                const status = _userStatus(r);
                const role = window.DB.roles.get(r.roleId);
                const branch = r.branchId ? window.DB.branches.get(r.branchId) : null;
                const dept   = r.departmentId ? window.DB.departments.get(r.departmentId) : null;
                return (
                  <tr key={r.id} className={selected.has(r.id) ? 'is-sel' : ''}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <label className="adm-checkbox">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                        <span /></label>
                    </td>
                    <td className="adm-cell--user" onClick={() => setDrawer(r)}>
                      <span className="adm-userav">{r.name.slice(0,1)}</span>
                      <span className="adm-userinfo">
                        <span className="adm-userinfo__name">
                          {r.name}
                          {isMe && <span className="adm-pill adm-pill--info" style={{ marginInlineStart:6 }}>أنت</span>}
                        </span>
                        <span className="adm-userinfo__meta">@{r.username} · {r.email || '—'}</span>
                      </span>
                    </td>
                    <td>
                      {role ? (
                        <span className="adm-pill adm-pill--info">{role.name}</span>
                      ) : <span style={{ color:'var(--f-ink-3)' }}>—</span>}
                    </td>
                    <td>
                      {branch || dept ? (
                        <span className="adm-userscope">
                          {branch && <span className="adm-userscope__b">{branch.name}</span>}
                          {dept && <span className="adm-userscope__d">{dept.name}</span>}
                        </span>
                      ) : <span style={{ color:'var(--f-ink-3)' }}>الكل</span>}
                    </td>
                    <td>
                      <span className={`adm-pill adm-pill--${status.tone}`}>{status.label}</span>
                    </td>
                    <td style={{ color:'var(--f-ink-2)', fontSize:'0.84rem' }}>{_timeAgo(r.lastLoginAt)}</td>
                    <td>
                      <div className="adm-tbl__actions" onClick={(e) => e.stopPropagation()}>
                        <button className="adm-tbl__btn" title="عرض التفاصيل" onClick={() => setDrawer(r)}>
                          <Icon name="visibility" />
                        </button>
                        {can('user.reset_password') && !isMe && (
                          <button className="adm-tbl__btn" title="إعادة كلمة المرور" onClick={() => setResetPwdFor(r)}>
                            <Icon name="key" />
                          </button>
                        )}
                        {can('user.update') && (
                          <button className="adm-tbl__btn" title="تعديل" onClick={() => setEdit(r)}>
                            <Icon name="edit" />
                          </button>
                        )}
                        {can('user.delete') && !isMe && (
                          <button className="adm-tbl__btn adm-tbl__btn--danger" title="حذف" onClick={() => setConfirmDel(r)}>
                            <Icon name="delete" />
                          </button>
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
      {drawer && (
        <UserDrawer user={drawer} me={me}
                    onClose={() => setDrawer(null)}
                    onEdit={() => { setEdit(drawer); setDrawer(null); }}
                    onResetPassword={() => setResetPwdFor(drawer)}
                    onToggleActive={() => toggleActive(drawer)}
                    onUnlock={() => unlockUser(drawer)}
                    onForceLogout={() => forceLogout(drawer)}
                    onDelete={() => { setConfirmDel(drawer); }}
        />
      )}
      {resetPwdFor && (
        <PasswordResetModal user={resetPwdFor}
                            onClose={() => setResetPwdFor(null)}
                            onDone={() => { setResetPwdFor(null); toast.push({ kind:'success', title:'تم تحديث كلمة المرور' }); }}
        />
      )}
      <window.ConfirmDialog
        open={!!confirmDel} danger icon="delete"
        title="حذف المستخدم؟"
        description={confirmDel ? `سيتم حذف ${confirmDel.name} نهائياً مع كل جلساته. هذا الإجراء لا يمكن التراجع عنه.` : ''}
        confirmLabel="نعم، احذف" cancelLabel="إلغاء"
        onConfirm={() => onDelete(confirmDel)} onCancel={() => setConfirmDel(null)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  USER DRAWER — side panel with full profile + actions + tabs
// ─────────────────────────────────────────────────────────────
function UserDrawer({ user, me, onClose, onEdit, onResetPassword, onToggleActive, onUnlock, onForceLogout, onDelete }) {
  const [tab, setTab] = useState('profile');
  const can = window.Auth.can;
  const isMe = me && user.id === me.id;
  const status = _userStatus(user);
  const role = window.DB.roles.get(user.roleId);
  const branch = user.branchId ? window.DB.branches.get(user.branchId) : null;
  const dept   = user.departmentId ? window.DB.departments.get(user.departmentId) : null;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sessions = window.DB.sessions.list().filter(s => s.userId === user.id);
  const activeSessions = sessions.filter(s => !s.revoked);
  const myAudit = window.DB.audit.list().filter(a => a.byId === user.id || a.target === user.username).slice(0, 100);
  const effectivePerms = role ? role.permissions || [] : [];
  const permsByCat = effectivePerms.reduce((acc, k) => {
    const p = window.DB.PERMISSION_BY_KEY[k];
    if (!p) return acc;
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="adm-drawer" onClick={onClose}>
      <aside className="adm-drawer__sheet" onClick={(e) => e.stopPropagation()} dir="rtl">
        <header className="adm-drawer__hdr">
          <button className="adm-drawer__close" onClick={onClose} aria-label="إغلاق">
            <Icon name="close" />
          </button>
          <div className="adm-drawer__id">
            <span className="adm-drawer__av">{user.name.slice(0,1)}</span>
            <div>
              <div className="adm-drawer__name">
                {user.name}
                {isMe && <span className="adm-pill adm-pill--info" style={{ marginInlineStart:8 }}>أنت</span>}
              </div>
              <div className="adm-drawer__meta">
                @{user.username}{user.email && <> · {user.email}</>}
              </div>
              <div className="adm-drawer__badges">
                <span className={`adm-pill adm-pill--${status.tone}`}>{status.label}</span>
                {role && <span className="adm-pill adm-pill--info">{role.name}</span>}
                {branch && <span className="adm-pill adm-pill--off">{branch.name}</span>}
                {dept && <span className="adm-pill adm-pill--off">{dept.name}</span>}
              </div>
            </div>
          </div>
          <div className="adm-drawer__actions">
            {can('user.update') && (
              <button className="f-btn" onClick={onEdit}><Icon name="edit" /> تعديل</button>
            )}
            {can('user.reset_password') && !isMe && (
              <button className="f-btn" onClick={onResetPassword}><Icon name="key" /> كلمة مرور</button>
            )}
            {can('user.force_logout') && !isMe && activeSessions.length > 0 && (
              <button className="f-btn" onClick={onForceLogout}>
                <Icon name="logout" /> إنهاء الجلسات ({activeSessions.length})
              </button>
            )}
            {status.key === 'locked' && can('user.update') && (
              <button className="f-btn" onClick={onUnlock}><Icon name="lock_open" /> فك القفل</button>
            )}
            {can('user.disable') && !isMe && (
              <button className={`f-btn ${user.active ? 'f-btn--warn' : ''}`} onClick={onToggleActive}>
                <Icon name={user.active ? 'block' : 'check'} />
                {user.active ? 'إيقاف الحساب' : 'تفعيل الحساب'}
              </button>
            )}
            {can('user.delete') && !isMe && (
              <button className="f-btn f-btn--danger" onClick={onDelete}><Icon name="delete" /> حذف</button>
            )}
          </div>
        </header>

        <nav className="adm-drawer__tabs">
          {[
            { k: 'profile',  l: 'الملف الشخصي', i: 'person' },
            { k: 'perms',    l: 'الصلاحيات',    i: 'shield' },
            { k: 'sessions', l: `الجلسات ${activeSessions.length > 0 ? `(${activeSessions.length})` : ''}`, i: 'devices' },
            { k: 'audit',    l: 'النشاط',       i: 'history' },
            { k: 'security', l: 'الأمان',       i: 'lock' },
          ].map(t => (
            <button key={t.k} className={`adm-drawer__tab ${tab === t.k ? 'is-on' : ''}`} onClick={() => setTab(t.k)}>
              <Icon name={t.i} /> {t.l}
            </button>
          ))}
        </nav>

        <div className="adm-drawer__body">
          {tab === 'profile' && (
            <div className="adm-detail">
              <div className="adm-detail__grid">
                <Field label="الاسم الكامل" value={user.name} />
                <Field label="اسم المستخدم" value={'@' + user.username} mono />
                <Field label="البريد الإلكتروني" value={user.email || '—'} mono />
                <Field label="الدور" value={role ? role.name : '—'} />
                <Field label="الفرع" value={branch ? branch.name : 'كل الفروع'} />
                <Field label="القسم" value={dept ? dept.name : 'كل الأقسام'} />
                <Field label="تاريخ الإنشاء" value={new Date(user.createdAt).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'medium', timeStyle:'short' })} />
                <Field label="أنشئ بواسطة" value={user.createdBy || '—'} mono />
                <Field label="آخر دخول" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'medium', timeStyle:'short' }) : 'لم يدخل بعد'} />
                <Field label="آخر IP" value={user.lastLoginIp || '—'} mono />
              </div>
            </div>
          )}

          {tab === 'perms' && (
            <div className="adm-detail">
              {Object.keys(permsByCat).length === 0 ? (
                <div className="adm-empty"><Icon name="shield" /><div>لا توجد صلاحيات</div></div>
              ) : (
                <>
                  <p className="adm-detail__note">
                    الصلاحيات النافذة لهذا المستخدم — مستمدة من دور <b>{role.name}</b>.
                    التعديل يتم من صفحة <b>الأدوار والصلاحيات</b>.
                  </p>
                  {['requests','payments','users','roles','system','reports','audit','content'].map(cat => {
                    const items = permsByCat[cat];
                    if (!items || !items.length) return null;
                    return (
                      <div key={cat} className="adm-permcat">
                        <h4 className="adm-permcat__lbl">{_catLabel(cat)}</h4>
                        <div className="adm-permcat__list">
                          {items.map(p => (
                            <span key={p.key} className="adm-permpill">
                              <Icon name="check" /> {p.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {tab === 'sessions' && (
            <div className="adm-detail">
              {sessions.length === 0 ? (
                <div className="adm-empty"><Icon name="devices" /><div>لم يسجّل دخوله بعد</div></div>
              ) : (
                <div className="adm-sessions">
                  {sessions.slice().sort((a,b) => (b.signedAt||0) - (a.signedAt||0)).map(s => (
                    <div key={s.id} className={`adm-session ${s.revoked ? 'is-revoked' : 'is-active'}`}>
                      <span className="adm-session__ico">
                        <Icon name={s.revoked ? 'logout' : 'check_circle'} />
                      </span>
                      <div className="adm-session__main">
                        <div className="adm-session__line">
                          <span className="adm-session__ua">{_parseUA(s.ua)}</span>
                          {!s.revoked && <span className="adm-pill adm-pill--ok">نشطة</span>}
                          {s.revoked && <span className="adm-pill adm-pill--off">منتهية</span>}
                        </div>
                        <div className="adm-session__meta">
                          IP: <code>{s.ip || '—'}</code> · بدأت {_timeAgo(s.signedAt)}
                          {s.revoked && s.revokedAt && <> · انتهت {_timeAgo(s.revokedAt)}</>}
                          {s.revokedReason && <> · سبب: {s.revokedReason}</>}
                        </div>
                      </div>
                      {!s.revoked && !isMe && can('user.force_logout') && (
                        <button className="adm-tbl__btn" title="إنهاء" onClick={() => {
                          window.DB.sessions.update(s.id, { revoked:true, revokedAt: Date.now(), revokedReason:'admin_force' });
                          window.DB.log('user.force_logout', user.username, { sessionId: s.id });
                        }}>
                          <Icon name="logout" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'audit' && (
            <div className="adm-detail">
              {myAudit.length === 0 ? (
                <div className="adm-empty"><Icon name="history" /><div>لا يوجد نشاط</div></div>
              ) : (
                <div className="adm-audit">
                  {myAudit.map(a => (
                    <div key={a.id} className="adm-audit__row">
                      <span className="adm-audit__ts">
                        {new Date(a.ts).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'short', timeStyle:'short' })}
                      </span>
                      <div className="adm-audit__main">
                        <span className="adm-audit__action">{a.action}</span>
                        <span>{a.target}</span>
                      </div>
                      <span className="adm-audit__by">{a.ip || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div className="adm-detail">
              <div className="adm-secrow">
                <div>
                  <strong>محاولات الدخول الفاشلة</strong>
                  <small>عدد المحاولات المتتالية الفاشلة منذ آخر دخول ناجح</small>
                </div>
                <span className={`adm-pill adm-pill--${user.failedLoginCount > 0 ? 'warn' : 'ok'}`}>
                  {user.failedLoginCount || 0}
                </span>
              </div>
              <div className="adm-secrow">
                <div>
                  <strong>حالة القفل</strong>
                  <small>الحساب يُقفل تلقائياً بعد ٥ محاولات فاشلة لمدة ١٥ دقيقة</small>
                </div>
                {user.lockedUntil && user.lockedUntil > Date.now() ? (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span className="adm-pill adm-pill--warn">
                      مقفل حتى {new Date(user.lockedUntil).toLocaleTimeString('ar-IQ-u-ca-gregory', { hour:'2-digit', minute:'2-digit' })}
                    </span>
                    {can('user.update') && (
                      <button className="f-btn" onClick={onUnlock}><Icon name="lock_open" /> فك القفل</button>
                    )}
                  </div>
                ) : (
                  <span className="adm-pill adm-pill--ok">غير مقفل</span>
                )}
              </div>
              <div className="adm-secrow">
                <div>
                  <strong>تغيير كلمة المرور</strong>
                  <small>{user.mustChangePassword ? 'سيُطلب من المستخدم تغيير كلمة المرور عند الدخول التالي' : 'كلمة المرور محدّثة'}</small>
                </div>
                {user.mustChangePassword
                  ? <span className="adm-pill adm-pill--warn">مطلوب</span>
                  : <span className="adm-pill adm-pill--ok">مكتمل</span>}
              </div>
              <div className="adm-secrow">
                <div>
                  <strong>تاريخ آخر تغيير لكلمة المرور</strong>
                  <small>{user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleString('ar-IQ-u-ca-gregory', { dateStyle:'medium', timeStyle:'short' }) : 'غير معروف'}</small>
                </div>
              </div>
              <div className="adm-secrow">
                <div>
                  <strong>خوارزمية كلمة المرور</strong>
                  <small>الخوارزمية المستخدمة لتخزين الـ hash</small>
                </div>
                <code className="adm-pill adm-pill--off">{user.passwordAlgo || 'sha256-v1'}</code>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div className="adm-field-ro">
      <span className="adm-field-ro__lbl">{label}</span>
      <span className={`adm-field-ro__val ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  );
}

function _catLabel(cat) {
  const map = {
    requests: 'الطلبات', payments: 'الدفعات', users: 'المستخدمون',
    roles: 'الأدوار', system: 'النظام', reports: 'التقارير',
    audit: 'سجل التدقيق', content: 'المحتوى',
  };
  return map[cat] || cat;
}
function _parseUA(ua) {
  if (!ua) return 'جهاز غير معروف';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Chrome/i.test(ua) && /Mobile/i.test(ua)) return 'Chrome Mobile';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua)) return 'Safari';
  if (/Edge/i.test(ua)) return 'Edge';
  return 'متصفح ' + ua.split(' ')[0];
}

// ─────────────────────────────────────────────────────────────
//  PASSWORD RESET MODAL — proper UI with strength meter + policy
// ─────────────────────────────────────────────────────────────
function PasswordResetModal({ user, onClose, onDone }) {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const toast = window.useToast();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const generate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPwd(p);
    setConfirm(p);
    setShow(true);
  };

  const submit = async (e) => {
    e && e.preventDefault();
    setError(null);
    if (pwd !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setBusy(true);
    const res = await window.Auth.adminResetPassword(user.id, pwd);
    setBusy(false);
    if (res.ok) {
      window.DB.log('user.password.reset', user.username);
      onDone && onDone();
    } else {
      setError(res.message || 'تعذّر إعادة التعيين');
    }
  };

  return (
    <Modal open onClose={onClose}
           icon="key" title={`إعادة تعيين كلمة المرور — ${user.name}`}
           sub="سيُطلب من المستخدم تغييرها فور الدخول التالي"
           footer={<>
             <button className="f-btn" onClick={onClose}>إلغاء</button>
             <button className="f-btn f-btn--primary" onClick={submit} disabled={busy || !pwd}>
               {busy ? 'جاري الحفظ…' : 'حفظ'}
             </button>
           </>}>
      <div className="adm-form">
        <div className="adm-field">
          <label>كلمة المرور الجديدة</label>
          <div style={{ display:'flex', gap:8 }}>
            <input type={show ? 'text' : 'password'} value={pwd}
                   onChange={e => setPwd(e.target.value)}
                   placeholder="٨ أحرف على الأقل" autoFocus
                   style={{ flex:1 }} />
            <button type="button" className="f-btn" onClick={() => setShow(s => !s)} title={show ? 'إخفاء' : 'إظهار'}>
              <Icon name={show ? 'visibility_off' : 'visibility'} />
            </button>
            <button type="button" className="f-btn" onClick={generate} title="توليد كلمة مرور قوية">
              <Icon name="auto_fix_high" />
            </button>
          </div>
        </div>
        <div className="adm-field">
          <label>تأكيد كلمة المرور</label>
          <input type={show ? 'text' : 'password'} value={confirm}
                 onChange={e => setConfirm(e.target.value)} />
        </div>
        {pwd && window.PasswordStrength && <window.PasswordStrength password={pwd} />}
        {error && <div className="lg-alert lg-alert--err"><Icon name="error" /><span>{error}</span></div>}
      </div>
    </Modal>
  );
}

// expose PasswordStrength inline for the modal (mirrors final_login.jsx)
function PasswordStrength({ password }) {
  const score = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);
  if (!password) return null;
  const labels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
  return (
    <div className="lg-strength" data-score={score}>
      <div className="lg-strength__bar">
        {[0,1,2,3].map(i => <span key={i} className={i < score ? 'on' : ''} />)}
      </div>
      <small>قوّة كلمة المرور: <b>{labels[score]}</b></small>
    </div>
  );
}
window.PasswordStrength = PasswordStrength;

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
// Categorize an audit action (e.g. "user.create" → "users", "role.permission.toggle" → "roles")
function _auditCategoryOf(action) {
  if (!action) return 'other';
  const first = String(action).split('.')[0];
  const map = {
    user:     'users',
    users:    'users',
    role:     'roles',
    roles:    'roles',
    request:  'requests',
    requests: 'requests',
    payment:  'payments',
    payments: 'payments',
    services: 'system',
    tips:     'content',
    settings: 'system',
    branch:   'system',
    branches: 'system',
    department:'system',
    auth:     'users',
    session:  'users',
    audit:    'audit',
    report:   'reports',
    reports:  'reports',
  };
  return map[first] || 'system';
}

function _csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function _exportAuditCsv(rows) {
  const header = ['التاريخ','الفعل','الفئة','الهدف','المستخدم','IP','الجهاز','التفاصيل'];
  const lines = [header.join(',')];
  for (const r of rows) {
    const ts  = new Date(r.ts).toLocaleString('en-CA', { hour12: false }).replace(',', '');
    const cat = _auditCategoryOf(r.action);
    const det = r.payload ? Object.entries(r.payload).map(([k,v]) => `${k}=${v}`).join(' | ') : '';
    lines.push([ts, r.action, cat, r.target||'', r.by||'', r.ip||'', _parseUA(r.ua), det].map(_csvEscape).join(','));
  }
  const csv = '﻿' + lines.join('\r\n');   // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const _DATE_PRESETS = [
  { k: 'all',   l: 'الكل',           ms: null },
  { k: 'today', l: 'اليوم',          ms: 24 * 3600 * 1000 },
  { k: '7d',    l: 'آخر ٧ أيام',    ms: 7 * 24 * 3600 * 1000 },
  { k: '30d',   l: 'آخر ٣٠ يوم',   ms: 30 * 24 * 3600 * 1000 },
];

function AuditTab() {
  const rows  = useStore(window.DB.audit);
  const users = useStore(window.DB.users);
  const can   = window.Auth.can;
  const toast = window.useToast();

  const [q, setQ]           = useState('');
  const [cat, setCat]       = useState('all');
  const [userId, setUserId] = useState('all');
  const [range, setRange]   = useState('all');
  const [openId, setOpenId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter
  const since = (() => {
    const p = _DATE_PRESETS.find(x => x.k === range);
    return p && p.ms ? Date.now() - p.ms : null;
  })();
  const filtered = rows.filter(r => {
    if (since && r.ts < since) return false;
    if (cat !== 'all' && _auditCategoryOf(r.action) !== cat) return false;
    if (userId !== 'all' && r.byId !== userId) return false;
    if (q) {
      const hay = (r.action + ' ' + (r.target||'') + ' ' + (r.by||'') + ' ' + JSON.stringify(r.payload||{})).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // Stats
  const dayMs   = 24 * 3600 * 1000;
  const todayN  = rows.filter(r => r.ts > Date.now() - dayMs).length;
  const weekN   = rows.filter(r => r.ts > Date.now() - 7 * dayMs).length;
  const uniqN   = new Set(rows.map(r => r.byId).filter(Boolean)).size;

  const onExport = () => {
    if (!can('audit.export')) return;
    _exportAuditCsv(filtered);
    window.DB.log('audit.export', `${filtered.length} entries`, { filters: { cat, userId, range, q: q || null } });
    toast.push({ kind:'success', title:'تم التصدير', body:`${filtered.length} عملية` });
  };
  const onClear = () => {
    window.DB.audit.replaceAll([]);
    setConfirmClear(false);
    toast.push({ kind:'info', title:'تم مسح السجل' });
  };
  const resetFilters = () => { setQ(''); setCat('all'); setUserId('all'); setRange('all'); };

  const hasFilters = q || cat !== 'all' || userId !== 'all' || range !== 'all';

  return (
    <>
      {/* ---- stats strip ---- */}
      <div className="adm-audit-stats">
        <div className="adm-audit-stats__card">
          <span className="adm-audit-stats__ico"><Icon name="history" /></span>
          <div>
            <div className="adm-audit-stats__n">{rows.length.toLocaleString('ar-IQ')}</div>
            <div className="adm-audit-stats__l">إجمالي العمليات</div>
          </div>
        </div>
        <div className="adm-audit-stats__card">
          <span className="adm-audit-stats__ico adm-audit-stats__ico--today"><Icon name="today" /></span>
          <div>
            <div className="adm-audit-stats__n">{todayN.toLocaleString('ar-IQ')}</div>
            <div className="adm-audit-stats__l">اليوم</div>
          </div>
        </div>
        <div className="adm-audit-stats__card">
          <span className="adm-audit-stats__ico adm-audit-stats__ico--week"><Icon name="calendar_view_week" /></span>
          <div>
            <div className="adm-audit-stats__n">{weekN.toLocaleString('ar-IQ')}</div>
            <div className="adm-audit-stats__l">آخر ٧ أيام</div>
          </div>
        </div>
        <div className="adm-audit-stats__card">
          <span className="adm-audit-stats__ico adm-audit-stats__ico--users"><Icon name="group" /></span>
          <div>
            <div className="adm-audit-stats__n">{uniqN.toLocaleString('ar-IQ')}</div>
            <div className="adm-audit-stats__l">مستخدمون نشطون</div>
          </div>
        </div>
      </div>

      {/* ---- filters bar ---- */}
      <div className="adm-audit__filters">
        <div className="adm-search adm-audit__search">
          <Icon name="search" />
          <input placeholder="ابحث في الفعل أو الهدف أو التفاصيل…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>

        <select className="adm-select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">جميع الفئات</option>
          {CATEGORY_ORDER.filter(c => CATEGORY_LABEL[c]).map(c => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>

        <select className="adm-select" value={userId} onChange={e => setUserId(e.target.value)}>
          <option value="all">جميع المستخدمين</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
          ))}
        </select>

        <div className="adm-audit__range">
          {_DATE_PRESETS.map(p => (
            <button key={p.k}
                    className={`adm-audit__range-btn ${range === p.k ? 'is-on' : ''}`}
                    onClick={() => setRange(p.k)}>
              {p.l}
            </button>
          ))}
        </div>

        <div className="adm-audit__actions">
          {hasFilters && (
            <button className="f-btn f-btn--ghost" onClick={resetFilters}>
              <Icon name="filter_alt_off" /> مسح الفلاتر
            </button>
          )}
          {can('audit.export') && (
            <button className="f-btn" onClick={onExport} disabled={filtered.length === 0}>
              <Icon name="file_download" /> تصدير CSV
            </button>
          )}
          {can('settings.manage') && (
            <button className="f-btn f-btn--danger" onClick={() => setConfirmClear(true)} disabled={rows.length === 0}>
              <Icon name="delete_sweep" /> مسح السجل
            </button>
          )}
        </div>
      </div>

      {/* ---- result count line ---- */}
      <div className="adm-audit__count">
        {hasFilters
          ? <>عرض <strong>{filtered.length.toLocaleString('ar-IQ')}</strong> من أصل {rows.length.toLocaleString('ar-IQ')} عملية</>
          : <>{rows.length.toLocaleString('ar-IQ')} عملية في السجل</>}
      </div>

      {/* ---- table ---- */}
      <div className="adm-audit">
        {filtered.length === 0 ? (
          <div className="adm-empty">
            <Icon name="history" />
            <div>{hasFilters ? 'لا توجد نتائج مطابقة' : 'السجل فارغ'}</div>
            {hasFilters && (
              <button className="f-btn f-btn--ghost" onClick={resetFilters} style={{ marginTop: 12 }}>
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : filtered.map(a => {
          const acat = _auditCategoryOf(a.action);
          const isOpen = openId === a.id;
          return (
            <div key={a.id} className={`adm-audit__row ${isOpen ? 'is-open' : ''}`}>
              <button className="adm-audit__head" onClick={() => setOpenId(isOpen ? null : a.id)}>
                <span className="adm-audit__ts" title={new Date(a.ts).toLocaleString('ar-IQ-u-ca-gregory')}>
                  {_timeAgo(a.ts)}
                </span>
                <span className={`adm-audit__cat adm-audit__cat--${acat}`}>
                  <Icon name={CATEGORY_ICON[acat] || 'lock'} />
                  {CATEGORY_LABEL[acat] || acat}
                </span>
                <div className="adm-audit__main">
                  <code className="adm-audit__action">{a.action}</code>
                  {a.target && <span className="adm-audit__target">{a.target}</span>}
                </div>
                <span className="adm-audit__by">
                  <span className="adm-audit__by-av">{(a.by || '?').slice(0,1)}</span>
                  <span className="adm-audit__by-name">{a.by || 'مجهول'}</span>
                </span>
                <Icon name={isOpen ? 'expand_less' : 'expand_more'} />
              </button>
              {isOpen && (
                <div className="adm-audit__detail">
                  <div className="adm-audit__detail-grid">
                    <div>
                      <label>التاريخ الكامل</label>
                      <div>{new Date(a.ts).toLocaleString('ar-IQ-u-ca-gregory', {
                        dateStyle: 'full', timeStyle: 'medium',
                      })}</div>
                    </div>
                    <div>
                      <label>عنوان IP</label>
                      <div><code>{a.ip || '—'}</code></div>
                    </div>
                    <div>
                      <label>الجهاز / المتصفح</label>
                      <div>{_parseUA(a.ua)}</div>
                    </div>
                    <div>
                      <label>معرّف العملية</label>
                      <div><code>{a.id}</code></div>
                    </div>
                  </div>
                  {a.payload && Object.keys(a.payload).length > 0 && (
                    <div className="adm-audit__payload">
                      <label>التفاصيل</label>
                      <pre>{JSON.stringify(a.payload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <window.ConfirmDialog
        open={confirmClear} danger icon="delete_sweep"
        title="مسح كامل سجل التدقيق؟"
        description="سيتم حذف جميع العمليات المسجّلة نهائياً. لا يمكن استرجاعها."
        confirmLabel="نعم، احذف الكل" cancelLabel="إلغاء"
        onConfirm={onClear} onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}

// =============================================================
// ROLES & PERMISSIONS — three-column layout: list / details / matrix
// =============================================================

const CATEGORY_LABEL = {
  requests: 'الطلبات',
  payments: 'الدفعات',
  users:    'المستخدمون',
  roles:    'الأدوار',
  system:   'النظام',
  reports:  'التقارير',
  audit:    'سجل التدقيق',
  content:  'المحتوى',
};
const CATEGORY_ICON = {
  requests: 'description',
  payments: 'payments',
  users:    'group',
  roles:    'badge',
  system:   'tune',
  reports:  'analytics',
  audit:    'history',
  content:  'edit_note',
};
const CATEGORY_ORDER = ['requests','payments','users','roles','system','reports','audit','content'];

function RolesTab() {
  const roles = useStore(window.DB.roles);
  const users = useStore(window.DB.users);
  const perms = useStore(window.DB.permissions);
  const can = window.Auth.can;
  const toast = window.useToast();

  const [selected, setSelected] = useState(null);     // role id
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  // Default selection: first role
  React.useEffect(() => {
    if (!selected && roles.length > 0) setSelected(roles[0].id);
  }, [roles, selected]);

  const current = roles.find(r => r.id === selected);
  const usersInRole = users.filter(u => u.roleId === selected);

  // Permission matrix toggling
  const togglePerm = (key) => {
    if (!current || !can('role.manage')) return;
    const has = (current.permissions || []).includes(key);
    const next = has
      ? (current.permissions || []).filter(k => k !== key)
      : [...(current.permissions || []), key];
    window.DB.roles.update(current.id, { permissions: next });
    window.DB.log('role.permission.toggle', current.key, { permission: key, granted: !has });
  };
  const toggleCategory = (cat, grant) => {
    if (!current || !can('role.manage')) return;
    const catKeys = perms.filter(p => p.category === cat).map(p => p.key);
    const set = new Set(current.permissions || []);
    if (grant) catKeys.forEach(k => set.add(k));
    else       catKeys.forEach(k => set.delete(k));
    window.DB.roles.update(current.id, { permissions: [...set] });
    window.DB.log('role.permission.bulk', current.key, { category: cat, granted: grant });
  };
  const grantAll = () => {
    if (!current || !can('role.manage')) return;
    window.DB.roles.update(current.id, { permissions: perms.map(p => p.key) });
    window.DB.log('role.permission.bulk', current.key, { all: true });
  };
  const revokeAll = () => {
    if (!current || !can('role.manage')) return;
    window.DB.roles.update(current.id, { permissions: [] });
    window.DB.log('role.permission.bulk', current.key, { all: false });
  };

  const onCreate = (data) => {
    const exists = roles.some(r => r.key === data.key);
    if (exists) { toast.push({ kind:'error', title:'الـ key مستخدم بالفعل' }); return; }
    const created = window.DB.roles.create({ ...data, isSystem: false, permissions: data.permissions || [] });
    window.DB.log('role.create', data.key);
    toast.push({ kind:'success', title:'تم إنشاء الدور', body: data.name });
    setSelected(created.id);
    setCreating(false);
  };
  const onDelete = () => {
    if (!current) return;
    if (current.isSystem) {
      toast.push({ kind:'error', title:'لا يمكن حذف دور نظامي' });
      setConfirmDel(null);
      return;
    }
    if (usersInRole.length > 0) {
      toast.push({ kind:'error', title:`لا يمكن الحذف: ${usersInRole.length} مستخدم يستخدم هذا الدور` });
      setConfirmDel(null);
      return;
    }
    window.DB.roles.remove(current.id);
    window.DB.log('role.delete', current.key);
    toast.push({ kind:'info', title:'تم حذف الدور' });
    setSelected(roles[0]?.id || null);
    setConfirmDel(null);
  };
  const onClone = () => {
    if (!current) return;
    const newKey = current.key + '_copy_' + Date.now().toString(36).slice(-4);
    const created = window.DB.roles.create({
      key: newKey,
      name: current.name + ' (نسخة)',
      description: current.description || '',
      isSystem: false,
      permissions: [...(current.permissions || [])],
    });
    window.DB.log('role.clone', current.key, { newKey });
    toast.push({ kind:'success', title:'تم نسخ الدور', body: created.name });
    setSelected(created.id);
  };
  const renameRole = (patch) => {
    if (!current) return;
    window.DB.roles.update(current.id, patch);
    window.DB.log('role.update', current.key, patch);
  };

  // Permissions grouped by category
  const permsByCat = perms.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="adm-roles">
      {/* ----- LEFT: list of roles ----- */}
      <aside className="adm-roles__list">
        <div className="adm-roles__list-hdr">
          <span>الأدوار</span>
          {can('role.manage') && (
            <button className="adm-roles__add" onClick={() => setCreating(true)} title="إنشاء دور جديد">
              <Icon name="add" />
            </button>
          )}
        </div>
        <div className="adm-roles__list-body">
          {roles.map(r => {
            const count = users.filter(u => u.roleId === r.id).length;
            return (
              <button key={r.id}
                      className={`adm-rolerow ${selected === r.id ? 'is-on' : ''}`}
                      onClick={() => setSelected(r.id)}>
                <span className="adm-rolerow__main">
                  <span className="adm-rolerow__name">
                    {r.name}
                    {r.isSystem && (
                      <span className="adm-rolerow__sys" title="دور نظامي — لا يمكن حذفه">
                        <Icon name="lock" />
                      </span>
                    )}
                  </span>
                  <span className="adm-rolerow__meta">
                    <code>{r.key}</code> · {(r.permissions||[]).length} صلاحية · {count} مستخدم
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ----- RIGHT: editor for selected role ----- */}
      {!current ? (
        <div className="adm-roles__editor adm-empty">
          <Icon name="badge" />
          <div>اختر دوراً لعرض الصلاحيات</div>
        </div>
      ) : (
        <div className="adm-roles__editor">
          {/* Header */}
          <header className="adm-roleed__hdr">
            <div className="adm-roleed__id">
              <span className="adm-roleed__icon"><Icon name="badge" /></span>
              <div>
                {can('role.manage') ? (
                  <input className="adm-roleed__name"
                         value={current.name}
                         onChange={e => renameRole({ name: e.target.value })}
                         spellCheck={false} />
                ) : (
                  <h2 className="adm-roleed__name as-text">{current.name}</h2>
                )}
                <div className="adm-roleed__sub">
                  <code>{current.key}</code>
                  {current.isSystem && <span className="adm-pill adm-pill--info">نظامي</span>}
                  <span className="adm-roleed__count">
                    {(current.permissions||[]).length} / {perms.length} صلاحية
                  </span>
                  <span className="adm-roleed__users">
                    <Icon name="group" /> {usersInRole.length} مستخدم
                  </span>
                </div>
              </div>
            </div>
            <div className="adm-roleed__actions">
              {can('role.manage') && (
                <>
                  <button className="f-btn" onClick={grantAll}>
                    <Icon name="done_all" /> منح الكل
                  </button>
                  <button className="f-btn" onClick={revokeAll}>
                    <Icon name="remove_done" /> سحب الكل
                  </button>
                  <button className="f-btn" onClick={onClone}>
                    <Icon name="content_copy" /> نسخ كقالب
                  </button>
                  {!current.isSystem && (
                    <button className="f-btn f-btn--danger" onClick={() => setConfirmDel(current)}>
                      <Icon name="delete" /> حذف
                    </button>
                  )}
                </>
              )}
            </div>
          </header>

          {can('role.manage') && (
            <div className="adm-roleed__desc">
              <label className="adm-roleed__desc-lbl">الوصف</label>
              <input className="adm-roleed__desc-in"
                     value={current.description || ''}
                     onChange={e => renameRole({ description: e.target.value })}
                     placeholder="وصف موجز للدور وكيف يُستخدم…" />
            </div>
          )}

          {/* Permission matrix by category */}
          <div className="adm-roleed__matrix">
            {CATEGORY_ORDER.map(cat => {
              const items = permsByCat[cat];
              if (!items || items.length === 0) return null;
              const granted = items.filter(p => (current.permissions||[]).includes(p.key)).length;
              const allOn = granted === items.length;
              const someOn = granted > 0 && !allOn;
              return (
                <div key={cat} className="adm-permblock">
                  <header className="adm-permblock__hdr">
                    <span className="adm-permblock__title">
                      <Icon name={CATEGORY_ICON[cat] || 'lock'} />
                      {CATEGORY_LABEL[cat] || cat}
                    </span>
                    <span className="adm-permblock__count">
                      <span className={`adm-permblock__dot ${allOn ? 'all' : someOn ? 'some' : ''}`} />
                      {granted} / {items.length}
                    </span>
                    {can('role.manage') && (
                      <div className="adm-permblock__bulk">
                        <button onClick={() => toggleCategory(cat, true)} disabled={allOn}>منح الكل</button>
                        <button onClick={() => toggleCategory(cat, false)} disabled={granted === 0}>سحب الكل</button>
                      </div>
                    )}
                  </header>
                  <ul className="adm-permblock__list">
                    {items.map(p => {
                      const checked = (current.permissions||[]).includes(p.key);
                      return (
                        <li key={p.key}>
                          <label className={`adm-permitem ${checked ? 'is-on' : ''}`}>
                            <input type="checkbox"
                                   checked={checked}
                                   disabled={!can('role.manage')}
                                   onChange={() => togglePerm(p.key)} />
                            <span className="adm-permitem__check">
                              {checked && <Icon name="check" />}
                            </span>
                            <span className="adm-permitem__main">
                              <span className="adm-permitem__lbl">{p.label}</span>
                              <code className="adm-permitem__key">{p.key}</code>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Users using this role */}
          {usersInRole.length > 0 && (
            <div className="adm-roleed__users-list">
              <header>
                <Icon name="group" /> المستخدمون في هذا الدور ({usersInRole.length})
              </header>
              <div className="adm-roleed__users-grid">
                {usersInRole.map(u => (
                  <div key={u.id} className="adm-roleed__user">
                    <span className="adm-userav" style={{ width:30, height:30, fontSize:'0.78rem' }}>
                      {u.name.slice(0,1)}
                    </span>
                    <span>
                      <div style={{ fontWeight:600, fontSize:'0.86rem' }}>{u.name}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--f-ink-3)', fontFamily:'var(--f-mono)' }}>@{u.username}</div>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {creating && (
        <RoleCreateModal
          onClose={() => setCreating(false)}
          onCreate={onCreate}
          existingKeys={roles.map(r => r.key)}
        />
      )}
      <window.ConfirmDialog
        open={!!confirmDel} danger icon="delete"
        title="حذف الدور؟"
        description={confirmDel ? `سيتم حذف الدور "${confirmDel.name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.` : ''}
        confirmLabel="نعم، احذف" cancelLabel="إلغاء"
        onConfirm={onDelete} onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}

function RoleCreateModal({ onClose, onCreate, existingKeys }) {
  const [name, setName] = useState('');
  const [key, setKey]   = useState('');
  const [description, setDescription] = useState('');
  const [autoKey, setAutoKey] = useState(true);

  // auto-derive key from name (latin-friendly slug); user can override
  React.useEffect(() => {
    if (!autoKey) return;
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9؀-ۿ]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 32);
    setKey(slug);
  }, [name, autoKey]);

  const taken = key && existingKeys.includes(key);
  const valid = name.trim() && key.trim() && !taken;

  return (
    <Modal open onClose={onClose}
           icon="badge"
           title="إنشاء دور جديد"
           sub="يمكنك بعد الإنشاء تخصيص الصلاحيات بدقة"
           footer={<>
             <button className="f-btn" onClick={onClose}>إلغاء</button>
             <button className="f-btn f-btn--primary" disabled={!valid}
                     onClick={() => onCreate({ name: name.trim(), key: key.trim(), description: description.trim() })}>
               <Icon name="check" /> إنشاء
             </button>
           </>}>
      <div className="adm-form">
        <div className="adm-field">
          <label>اسم الدور</label>
          <input value={name} onChange={e => setName(e.target.value)}
                 placeholder="مثلاً: محاسب أول" autoFocus />
        </div>
        <div className="adm-field">
          <label>
            معرّف الدور (key)
            <button type="button" className="adm-roleed__autokey"
                    onClick={() => setAutoKey(a => !a)}>
              {autoKey ? 'تعديل يدوي' : 'توليد تلقائي'}
            </button>
          </label>
          <input value={key} onChange={e => { setAutoKey(false); setKey(e.target.value); }}
                 placeholder="senior_accountant" />
          {taken && <small style={{ color:'var(--f-err)' }}>هذا المعرّف مستخدم بالفعل</small>}
        </div>
        <div className="adm-field">
          <label>الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="ما الذي يفعله هذا الدور؟ من يستخدمه؟" />
        </div>
      </div>
    </Modal>
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
    { k: 'overview', l: 'نظرة عامة',         ico: 'space_dashboard', count: null },
    { k: 'services', l: 'الخدمات',           ico: 'apps',            count: services.length },
    { k: 'tips',     l: 'النصائح',           ico: 'tips_and_updates',count: tips.length },
    { k: 'users',    l: 'المستخدمون',        ico: 'group',           count: users.length, perm: 'user.read' },
    { k: 'roles',    l: 'الأدوار والصلاحيات', ico: 'badge',           count: (window.DB.roles.list() || []).length, perm: 'role.read' },
    { k: 'settings', l: 'إعدادات المركز',    ico: 'tune',            count: null },
    { k: 'audit',    l: 'سجل التدقيق',       ico: 'history',         count: audit.length,  perm: 'audit.read' },
  ].filter(t => !t.perm || window.Auth.can(t.perm));

  const titles = {
    overview: { l: 'لوحة الأدمن',         s: 'نظرة عامة على إعدادات وبيانات النظام', ico: 'admin_panel_settings' },
    services: { l: 'إدارة الخدمات',       s: 'إضافة وتعديل وحذف خدمات المركز',       ico: 'apps' },
    tips:     { l: 'إدارة النصائح',       s: 'تحكم بالنصائح والإرشادات المعروضة',    ico: 'tips_and_updates' },
    users:    { l: 'إدارة المستخدمين',     s: 'إضافة المستخدمين وتحديد صلاحياتهم',     ico: 'group' },
    roles:    { l: 'الأدوار والصلاحيات',   s: 'إدارة الأدوار وتخصيص الصلاحيات بدقة',  ico: 'badge' },
    settings: { l: 'إعدادات المركز',       s: 'بيانات المركز والترويسة والنسخ الاحتياطي', ico: 'tune' },
    audit:    { l: 'سجل التدقيق',          s: 'كل ما تم في النظام مع وقت ومنفّذ',     ico: 'history' },
  };

  let body;
  if      (tab === 'overview') body = <OverviewTab go={setTab} />;
  else if (tab === 'services') body = <ServicesTab />;
  else if (tab === 'tips')     body = <TipsTab />;
  else if (tab === 'users')    body = <UsersTab />;
  else if (tab === 'roles')    body = <RolesTab />;
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
            <span className="adm-side__user-role">{window.Auth.roleLabel(me)}</span>
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
