// =============================================================
// FINAL — Form Page (schema-driven, covers all 31 services)
// Tabs: احترافية (smart form) / أصلية (faithful paper)
// Reads window.SERVICE_FORMS[code] from final_forms_data.js
// =============================================================

// animated number
function useCountUp(target) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    const start = performance.now();
    const dur = 520;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

// =============================================================
// Generic field
// =============================================================
function FF_Field({ f, value, onChange, error }) {
  const cls = `ff-field${f.full ? ' ff-field--full' : ''}${f.mono ? ' ff-field--mono' : ''}${error ? ' is-invalid' : ''}`;
  const Err = window.FieldError;
  if (f.type === 'textarea') {
    return (
      <div className={cls} data-fk={f.k}>
        <label>{f.l}</label>
        <textarea value={value || ''} onChange={e => onChange(e.target.value)}
                  rows={3} placeholder={f.ph || ''} />
        <Err msg={error} />
      </div>
    );
  }
  if (f.type === 'select') {
    return (
      <div className={cls} data-fk={f.k}>
        <label>{f.l}</label>
        <select value={value || ''} onChange={e => onChange(e.target.value)}>
          <option value="">— اختر —</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <Err msg={error} />
      </div>
    );
  }
  if (f.type === 'date') {
    return (
      <div className={cls} data-fk={f.k}>
        <label>{f.l}</label>
        <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />
        <Err msg={error} />
      </div>
    );
  }
  if (f.type === 'number') {
    return (
      <div className={cls} data-fk={f.k}>
        <label>{f.l}{f.unit && <span className="ff-field__unit"> ({f.unit})</span>}</label>
        <input type="number" value={value || ''} onChange={e => onChange(e.target.value)}
               placeholder={f.ph || ''} max={f.max} dir="ltr" style={{ textAlign:'start' }} />
        <Err msg={error} />
      </div>
    );
  }
  return (
    <div className={cls} data-fk={f.k}>
      <label>{f.l}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)}
             placeholder={f.ph || ''} dir={f.mono ? 'ltr' : 'auto'} style={f.mono ? { textAlign:'start' } : null} />
      <Err msg={error} />
    </div>
  );
}

// =============================================================
// Section renderers
// =============================================================
function FF_Rows({ rows, form, set, errors }) {
  return (
    <>
      {rows.map((row, ri) => (
        <div key={ri} className="ff-row" style={{ '--cols': row.length }}>
          {row.map(f => (
            <FF_Field key={f.k} f={f} value={form[f.k]} onChange={(v) => set(f.k, v)}
                      error={errors && errors[f.k]} />
          ))}
        </div>
      ))}
    </>
  );
}

function FF_Classification({ sec, form, set }) {
  return (
    <>
      <div className="ff-seg">
        {sec.classes.map(c => (
          <button key={c} className={`ff-seg__opt ${form.cls === c ? 'is-on' : ''}`} onClick={() => set('cls', c)}>
            {c}
          </button>
        ))}
      </div>
      {sec.phases && (
        <div className="ff-field">
          <label>قوة التغذية المطلوبة (نوع الربط)</label>
          <div className="ff-seg">
            {sec.phases.map(p => (
              <button key={p} className={`ff-seg__opt ${form.phase === p ? 'is-on' : ''}`} onClick={() => set('phase', p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function FF_ClassChange({ sec, form, set }) {
  return (
    <div className="ff-row" style={{ '--cols': 2 }}>
      <div className="ff-field">
        <label>من</label>
        <div className="ff-seg ff-seg--wrap">
          {sec.from.map(c => (
            <button key={c} className={`ff-seg__opt ${form.cls_from === c ? 'is-on' : ''}`}
                    onClick={() => set('cls_from', c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="ff-field">
        <label>إلى</label>
        <div className="ff-seg ff-seg--wrap">
          {sec.to.map(c => (
            <button key={c} className={`ff-seg__opt ${form.cls_to === c ? 'is-on' : ''}`}
                    onClick={() => set('cls_to', c)}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FF_ReasonSeg({ sec, form, set, fieldKey = 'reasonChoice' }) {
  return (
    <div className="ff-seg ff-seg--wrap">
      {sec.options.map(o => (
        <button key={o} className={`ff-seg__opt ${form[fieldKey] === o ? 'is-on' : ''}`}
                onClick={() => set(fieldKey, o)}>{o}</button>
      ))}
    </div>
  );
}

function FF_Urgency({ sec, form, set }) {
  return (
    <div className="ff-seg ff-seg--wrap">
      {sec.levels.map((l, i) => (
        <button key={l} className={`ff-seg__opt ff-urgency-${i} ${form.urgency === l ? 'is-on' : ''}`}
                onClick={() => set('urgency', l)}>{l}</button>
      ))}
    </div>
  );
}

function FF_Documents({ list, form, set }) {
  const visible = list.filter(d => !d.for || (d.for + '').split('|').includes(form.cls));
  return (
    <>
      {visible.map((d, i) => {
        const on = !!(form.docs || {})[d.n];
        return (
          <div key={i} className={`ff-check ${on ? 'is-on' : ''}`}
               onClick={() => set('docs', { ...(form.docs || {}), [d.n]: !on })}>
            <span className="ff-check__box">{on && <Icon name="check" />}</span>
            {d.n}
            {d.opt && <span className="ff-check__opt">{d.opt}</span>}
          </div>
        );
      })}
    </>
  );
}

// =============================================================
// Fee computation
// =============================================================
function computeFees(fees, form) {
  if (!fees || fees.kind === 'none') return { rows: [], total: 0, note: '' };
  if (fees.kind === 'fixed') {
    return { rows: [{ k:'fixed', l: fees.label, amt: fees.amount }], total: fees.amount };
  }
  if (fees.kind === 'inspection_plus_meter') {
    const cls = form.cls || 'منزلي';
    const insp = fees.base[cls] || fees.base['منزلي'];
    const rows = [{ k:'insp', l:`أجور الكشف (${cls})`, amt: insp }];
    let total = insp;
    fees.addons.forEach(a => {
      const on = !!form['fee_' + a.k];
      rows.push({ k:'fee_' + a.k, l: a.l, amt: a.amount, toggle:true, on });
      if (on) total += a.amount;
    });
    return { rows, total };
  }
  if (fees.kind === 'inspection_only') {
    const cls = form.cls_to || form.cls || Object.keys(fees.base)[0];
    const amt = fees.base[cls] || 0;
    return { rows: [{ k:'insp', l: fees.label + ' (' + cls + ')', amt }], total: amt };
  }
  if (fees.kind === 'reconnect') {
    const k = form.reconnectKind || Object.keys(fees.table)[0];
    const amt = fees.table[k];
    return { rows: [{ k:'rec', l:'أجور إعادة التيار — ' + k, amt }], total: amt,
             selector: { label:'نوع وقطع التيار', key:'reconnectKind', options: Object.keys(fees.table), current:k } };
  }
  if (fees.kind === 'inspection_table') {
    const k = form.reasonChoice || Object.keys(fees.table)[0];
    const amt = fees.table[k];
    return { rows:[{ k:'insp', l: k, amt }], total: amt };
  }
  if (fees.kind === 'meter_swap') {
    const k = form.meterSwapKind || Object.keys(fees.table)[0];
    const amt = fees.table[k];
    return { rows: [{ k:'sw', l:'تبديل المقياس — ' + k, amt }], total: amt,
             selector: { label:'نوع التبديل', key:'meterSwapKind', options: Object.keys(fees.table), current:k } };
  }
  if (fees.kind === 'installment') {
    const total = +form.totalDebt || 0;
    const down = +form.downPayment || 0;
    const minDown = Math.ceil(total * fees.minDownPct / 100);
    const months = Math.min(+form.months || 0, fees.monthlyCap);
    const monthly = months > 0 ? Math.round((total - down) / months) : 0;
    return {
      rows: [
        { k:'total', l:'إجمالي المديونية', amt: total },
        { k:'down',  l:'الدفعة الأولى المقترحة', amt: down },
        { k:'min',   l:`الحد الأدنى المطلوب (${fees.minDownPct}٪)`, amt: minDown, note: down >= minDown ? 'مقبول' : 'غير كافٍ' },
      ],
      total: monthly,
      totalLabel: months > 0 ? `قسط شهري × ${months}` : 'القسط الشهري',
      note: months > fees.monthlyCap ? `الحد الأقصى ${fees.monthlyCap} أشهر` : '',
    };
  }
  if (fees.kind === 'temp_daily') {
    const days = Math.max(0, Math.ceil((new Date(form.toDate) - new Date(form.fromDate)) / 86400000) || 0);
    const cls = form.cls || 'تجاري';
    const insp = (fees.inspectionFromClass && fees.inspectionFromClass[cls]) || 0;
    return {
      rows: [
        { k:'insp', l:`أجور الكشف (${cls})`, amt: insp },
        { k:'days', l:`مصروفات يومية × ${days} يوم`, amt: fees.daily * days },
      ],
      total: insp + fees.daily * days,
    };
  }
  if (fees.kind === 'cable_length') {
    return { rows: [], total: 0, note: fees.note || 'يُحدّد بعد الكشف الموقعي' };
  }
  if (fees.kind === 'note') {
    return { rows: [], total: 0, note: fees.text };
  }
  return { rows: [], total: 0 };
}

// =============================================================
// FORM PAGE
// =============================================================
function FormPage({ nav, code }) {
  const svc = window.SERVICE_MAP[code] || window.SERVICE_MAP['CS0001'];
  const sec = window.SECTION_MAP[svc.section];
  const schema = window.getFormSchema(svc.code);
  const storageKey = 'tq-form-' + svc.code;
  const toast = window.useToast ? window.useToast() : null;

  const [tab, setTab] = useState('pro');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [exporting, setExporting] = useState(false);

  const initial = () => ({ docs: {}, cls:'منزلي', phase:'أحادي الطور' });
  const [form, setForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || 'null') || initial(); }
    catch { return initial(); }
  });

  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(form));
      setSaving(false);
      setSavedAt(new Date());
    }, 600);
    return () => clearTimeout(id);
  }, [form, storageKey]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(es => { const n = { ...es }; delete n[k]; return n; });
  };

  // ---- validation: required = first text/select/number field of each rowed section ----
  const buildRules = () => {
    const rules = {};
    (schema.sections || []).forEach(sx => {
      (sx.rows || []).forEach(row => {
        row.forEach(f => {
          if (f.required || f.k === 'name' || f.k === 'subId' || f.k === 'phone') {
            const list = [window.Validate.required];
            if (f.k === 'phone') list.push(window.Validate.phoneIQ);
            if (f.type === 'number') list.push(window.Validate.digits);
            rules[f.k] = list;
          }
        });
      });
    });
    if (schema.declaration) rules.declAgreed = [(v) => v ? '' : 'يلزم الموافقة على الإقرار'];
    return rules;
  };

  const submit = () => {
    const errs = window.validateForm(form, buildRules());
    setErrors(errs);
    setShowErrors(true);
    if (Object.keys(errs).length) {
      toast && toast.push({
        kind: 'error',
        title: 'لا يمكن إرسال الطلب',
        body: `${Object.keys(errs).length} حقل بحاجة مراجعة قبل الإرسال.`,
      });
      const firstKey = Object.keys(errs)[0];
      setTimeout(() => {
        const el = document.querySelector(`[data-fk="${firstKey}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    toast && toast.push({
      kind: 'success',
      title: 'تم تجهيز الطلب',
      body: `${svc.code} — ${svc.name}. سيُحوَّل للدائرة المختصة.`,
      action: { label: 'عرض الأصلية', onClick: () => setTab('orig') },
    });
  };

  const resetForm = () => {
    setForm(initial());
    setErrors({});
    setShowErrors(false);
    setConfirmReset(false);
    setAttachments([]);
    toast && toast.push({ kind: 'info', title: 'تم إعادة تهيئة النموذج' });
  };

  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [];
    for (const f of files) {
      if (f.size > 8 * 1024 * 1024) {
        toast && toast.push({ kind:'warn', title:'ملف كبير', body: `${f.name} > 8MB — تم تجاهله` });
        continue;
      }
      try {
        const buf = await window.readFileAsArrayBuffer(f);
        const url = (f.type.startsWith('image/'))
          ? await window.readFileAsDataURL(f)
          : null;
        next.push({ name: f.name, type: f.type, size: f.size, _buf: buf, _preview: url });
      } catch (err) { console.error(err); }
    }
    setAttachments(a => [...a, ...next]);
  };
  const removeAttachment = (i) => setAttachments(a => a.filter((_, j) => j !== i));

  const exportUnified = async () => {
    if (!window.exportFormWithAttachments) {
      toast && toast.push({ kind:'error', title:'وحدة التصدير غير متوفرة' });
      return;
    }
    setTab('orig');
    setExporting(true);
    await new Promise(r => setTimeout(r, 400));
    try {
      const fileName = `${svc.code}_${(form.name || 'بدون-اسم').replace(/\s/g,'-')}_${new Date().toISOString().slice(0,10)}`;
      await window.exportFormWithAttachments({ svc, schema, form, attachments, fileName });
      toast && toast.push({ kind:'success', title:'تم تصدير الملف الموحّد', body: fileName + '.pdf' });
      window.DB && window.DB.log('form.export', svc.code, { with: attachments.length });
    } catch (err) {
      toast && toast.push({ kind:'error', title:'فشل التصدير', body: err.message });
    } finally {
      setExporting(false);
    }
  };

  const feeResult = computeFees(schema.fees, form);
  const total = useCountUp(feeResult.total || 0);

  return (
    <div className="fp-enter" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <button className="fp-back" onClick={() => nav('detail', { code: svc.code })}>
        <Icon name="arrow_forward" /> {svc.name}
      </button>

      <div className="ff-head">
        <div className="f-h2__main">
          <h2 className="f-h2__title">
            <span className="f-h2__icon"><Icon name="edit_document" /></span>
            نموذج {svc.code} — {svc.name}
          </h2>
          <span className="f-h2__sub">النسختان متطابقتان بالمعلومات — الاحترافية للتعبئة والأصلية للطباعة الرسمية</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <span className={`ff-autosave ${saving ? 'is-saving' : ''}`}>
            <span className="ff-autosave__dot" />
            {saving ? 'يحفظ…' : savedAt ? 'محفوظ تلقائياً' : 'جاهز'}
          </span>
          <div className="ff-tabs">
            <button className={`ff-tab ${tab === 'pro' ? 'is-on' : ''}`} onClick={() => setTab('pro')}>
              <Icon name="auto_awesome" /> الاحترافية
            </button>
            <button className={`ff-tab ${tab === 'orig' ? 'is-on' : ''}`} onClick={() => setTab('orig')}>
              <Icon name="description" /> الأصلية
            </button>
          </div>
        </div>
      </div>

      {tab === 'pro' ? (
        <div className="ff-layout">
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {schema.sections.map((sx, i) => (
              <div key={i} className="f-card ff-section">
                <div className="f-card__head">
                  <h3 className="f-card__title">
                    <Icon name={sx.icon || (sx.kind === 'documents' ? 'folder_open' : 'edit')} />
                    {sx.title || (sx.kind === 'documents' ? 'الوثائق / المستمسكات' : 'القسم')}
                  </h3>
                  {sx.kind === 'documents' && (
                    <p className="f-card__sub">حدّد المستندات المرفقة — تكتمل عند تسليم الملف</p>
                  )}
                </div>
                <div className="ff-section__body">
                  {sx.rows && <FF_Rows rows={sx.rows} form={form} set={set} errors={showErrors ? errors : null} />}
                  {sx.kind === 'classification' && <FF_Classification sec={sx} form={form} set={set} />}
                  {sx.kind === 'class_change' && <FF_ClassChange sec={sx} form={form} set={set} />}
                  {sx.kind === 'reason_seg' && <FF_ReasonSeg sec={sx} form={form} set={set} />}
                  {sx.kind === 'urgency' && <FF_Urgency sec={sx} form={form} set={set} />}
                  {sx.kind === 'documents' && <FF_Documents list={sx.list} form={form} set={set} />}
                </div>
              </div>
            ))}

            {schema.declaration && (
              <div className="f-card ff-section ff-decl-card">
                <div className="f-card__head">
                  <h3 className="f-card__title"><Icon name="gavel" /> الإقرار والتعهد</h3>
                  <p className="f-card__sub">يُطبع كاملاً مع النموذج الأصلي</p>
                </div>
                <div className="ff-section__body">
                  <p className="ff-decl-text">{schema.declaration}</p>
                  <label className="ff-check ff-check--decl"
                         onClick={() => set('declAgreed', !form.declAgreed)}>
                    <span className="ff-check__box">{form.declAgreed && <Icon name="check" />}</span>
                    قرأت الإقرار وأوافق على ما ورد فيه
                  </label>
                </div>
              </div>
            )}

            {/* ─── ATTACHMENTS ─── */}
            <div className="f-card ff-section">
              <div className="f-card__head">
                <h3 className="f-card__title"><Icon name="attach_file" /> المرفقات</h3>
                <p className="f-card__sub">صور أو PDFs للمستمسكات — تُدمج في PDF موحّد عند التصدير</p>
              </div>
              <div className="ff-section__body">
                <label className="ff-attach-drop">
                  <input type="file" multiple accept="image/*,.pdf" onChange={onPickFiles} style={{ display:'none' }} />
                  <Icon name="cloud_upload" />
                  <span>
                    <strong>اسحب وأفلت الملفات هنا</strong>
                    <small>أو اضغط للاختيار — JPG · PNG · PDF (حتى 8MB لكل ملف)</small>
                  </span>
                </label>
                {attachments.length > 0 && (
                  <div className="ff-attach-list">
                    {attachments.map((a, i) => (
                      <div key={i} className="ff-attach-item">
                        <span className="ff-attach-thumb">
                          {a._preview
                            ? <img src={a._preview} alt="" />
                            : <Icon name={a.type === 'application/pdf' ? 'picture_as_pdf' : 'description'} />}
                        </span>
                        <span className="ff-attach-meta">
                          <span className="ff-attach-name">{a.name}</span>
                          <span className="ff-attach-size">{(a.size / 1024).toFixed(0)} KB · {a.type || 'ملف'}</span>
                        </span>
                        <button className="ff-attach-rm" onClick={() => removeAttachment(i)} aria-label="حذف">
                          <Icon name="close" />
                        </button>
                      </div>
                    ))}
                    <div className="ff-attach-summary">
                      {attachments.length} ملف
                      {attachments.length > 0 && ' · سيُضاف إلى الـ PDF الموحّد كصفحات منفصلة بعد النموذج'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* fee panel */}
          <aside className="ff-feepanel">
            <div className="ff-feepanel__head"><Icon name="request_quote" /> الأجور المتوقعة</div>

            {feeResult.selector && (
              <div className="ff-field" style={{ padding:'0 14px 0' }}>
                <label>{feeResult.selector.label}</label>
                <select value={feeResult.selector.current}
                        onChange={e => set(feeResult.selector.key, e.target.value)}>
                  {feeResult.selector.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            <div className="ff-feepanel__rows">
              {feeResult.rows.length === 0 && (
                <div className="ff-feerow"><span>هذه الخدمة بدون أجور</span><b>—</b></div>
              )}
              {feeResult.rows.map(r => (
                <div key={r.k} className="ff-feerow"
                     style={r.toggle ? { cursor:'pointer' } : null}
                     onClick={r.toggle ? () => set(r.k, !r.on) : undefined}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    {r.toggle && (
                      <span className="ff-check__box"
                            style={{ background: r.on ? 'var(--f-ok)' : 'transparent',
                                     borderColor: r.on ? 'var(--f-ok)' : 'var(--f-border-2)' }}>
                        {r.on && <Icon name="check" />}
                      </span>
                    )}
                    {r.l}
                    {r.note && <small style={{ marginInlineStart:6, opacity:.7 }}>({r.note})</small>}
                  </span>
                  <b>{fmtIQD(r.amt)}</b>
                </div>
              ))}
              {feeResult.note && (
                <div className="ff-feerow ff-feerow--note"><Icon name="info" /> {feeResult.note}</div>
              )}
            </div>
            {feeResult.total > 0 && (
              <div className="ff-feepanel__total">
                <span className="lbl">{feeResult.totalLabel || 'المجموع'}</span>
                <span className="val">{fmt(total)}<small>د.ع</small></span>
              </div>
            )}
            <div className="ff-feepanel__actions">
              <button className="f-btn f-btn--primary" onClick={submit}>
                <Icon name="send" /> تقديم الطلب
              </button>
              <button className="f-btn" onClick={() => setTab('orig')}>
                <Icon name="description" /> عرض الأصلية
              </button>
              <button className="f-btn" onClick={() => { setTab('orig'); setTimeout(() => window.print(), 350); }}>
                <Icon name="print" /> طباعة
              </button>
              <button className="f-btn" onClick={exportUnified} disabled={exporting}>
                <Icon name={exporting ? 'hourglass_top' : 'file_save'} />
                {exporting ? 'يجهّز…' : `PDF موحّد ${attachments.length > 0 ? `(+ ${attachments.length})` : ''}`}
              </button>
              <button className="f-btn" onClick={() => setConfirmReset(true)}>
                <Icon name="refresh" /> إعادة تهيئة
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <window.OfficialPaper svc={svc} schema={schema} form={form} attachments={attachments} />
      )}

      {showErrors && Object.keys(errors).length > 0 && tab === 'pro' && (
        <window.ValidationSummary errors={errors} />
      )}

      <window.ConfirmDialog
        open={confirmReset}
        danger
        icon="restart_alt"
        title="إعادة تهيئة النموذج؟"
        description="ستفقد جميع البيانات المدخلة في هذا النموذج. لا يمكن التراجع عن العملية."
        confirmLabel="نعم، أعد التهيئة"
        cancelLabel="إلغاء"
        onConfirm={resetForm}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

// =============================================================
// ORIGINAL PAPER — generated from schema
// =============================================================
function cb(on) { return on ? '☑' : '☐'; }

function PaperFieldRows({ rows, form }) {
  return rows.map((row, ri) => (
    <tr key={ri}>
      {row.flatMap((f) => [
        <th key={f.k + '-l'} style={{ width: '18%' }}>{f.l}</th>,
        <td key={f.k + '-v'} colSpan={f.full ? (row.length === 1 ? 7 : 3) : 1}>
          {form[f.k] || ' '}
        </td>,
      ])}
    </tr>
  ));
}

function OriginalPaper({ svc, schema, form }) {
  const d = form.docs || {};
  return (
    <div className="ff-paper-wrap fp-enter">
      <div className="ff-paper" dir="rtl">
        <h2>{schema.paperTitle}</h2>
        <div className="ff-paper__sub">نموذج رقم ({svc.code})</div>

        <div className="head-band">
          <span>رقم وصل قبض (رسوم طلب الخدمة): ............</span>
          <span>اسم المركز: الرصافة — فرع النضال (RS-014)</span>
          <span>تاريخ الطلب: {new Date().toLocaleDateString('ar-IQ-u-ca-gregory')}</span>
        </div>

        {schema.sections.map((sx, i) => {
          if (sx.kind === 'documents') return null;
          return (
            <table key={i}>
              <tbody>
                <tr><th colSpan={8} style={{ background:'#e8e5db' }}>{sx.title}</th></tr>
                {sx.rows && <PaperFieldRows rows={sx.rows} form={form} />}
                {sx.kind === 'classification' && (
                  <>
                    <tr>
                      <th>الصنف المختار</th>
                      <td colSpan={7}>{sx.classes.map(c => `${cb(form.cls === c)} ${c}`).join('    ')}</td>
                    </tr>
                    {sx.phases && (
                      <tr>
                        <th>قوة التغذية</th>
                        <td colSpan={7}>{sx.phases.map(p => `${cb(form.phase === p)} ${p}`).join('    ')}</td>
                      </tr>
                    )}
                  </>
                )}
                {sx.kind === 'class_change' && (
                  <>
                    <tr><th>من</th><td colSpan={7}>{sx.from.map(c => `${cb(form.cls_from === c)} ${c}`).join('    ')}</td></tr>
                    <tr><th>إلى</th><td colSpan={7}>{sx.to.map(c => `${cb(form.cls_to === c)} ${c}`).join('    ')}</td></tr>
                  </>
                )}
                {sx.kind === 'reason_seg' && (
                  <tr><th>{sx.title}</th><td colSpan={7}>{sx.options.map(o => `${cb(form.reasonChoice === o)} ${o}`).join('    ')}</td></tr>
                )}
                {sx.kind === 'urgency' && (
                  <tr><th>الأولوية</th><td colSpan={7}>{sx.levels.map(l => `${cb(form.urgency === l)} ${l}`).join('    ')}</td></tr>
                )}
              </tbody>
            </table>
          );
        })}

        {/* Documents checklist */}
        {schema.sections.filter(s => s.kind === 'documents').map((sx, i) => (
          <table key={'doc' + i}>
            <thead>
              <tr>
                <th style={{ width: 34 }}>الحالة</th>
                <th style={{ width: 24 }}>#</th>
                <th>الوثائق / المستمسكات المطلوبة</th>
                <th style={{ width:'34%' }}>الأصناف المشمولة / ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {sx.list.map((doc, idx) => (
                <tr key={idx}>
                  <td className="c">{cb(!!d[doc.n])}</td>
                  <td className="c">{idx + 1}</td>
                  <td>{doc.n}</td>
                  <td className="c" style={{ fontSize:'0.68rem', color:'#555' }}>
                    {doc.all ? 'جميع الأصناف' : (doc.opt || '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

        {schema.extraDocsTable && (
          <table>
            <thead>
              <tr><th>الوثيقة</th><th>رقم الوثيقة</th><th>تاريخ الوثيقة</th></tr>
            </thead>
            <tbody>
              {schema.extraDocsTable.map(v => (
                <tr key={v}><td>{v}</td><td>{' '}</td><td>{' '}</td></tr>
              ))}
            </tbody>
          </table>
        )}

        <table>
          <tbody>
            <tr>
              <th style={{ width:'40%' }}>رقم وصل قبض (رسوم المطالبة المالية بعد الدراسة)</th>
              <td>{' '}</td>
            </tr>
            <tr>
              <th>يحوَّل لاستكمال الإجراءات</th>
              <td>
                {(schema.routing || ['خدمات المشتركين','الدائرة الفنية','الدائرة القانونية','الصندوق','إلغاء الطلب'])
                  .map(r => `☐ ${r}`).join('   ')}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="sig-row">
          <div>اسم وتوقيع موظف خدمات المشتركين<div className="line">{' '}</div></div>
          <div>اسم وتوقيع مقدم الطلب<div className="line">{form.name || ' '}</div></div>
          <div>اسم وتوقيع مسؤول مركز خدمات المشتركين<div className="line">{' '}</div></div>
        </div>

        {schema.declaration && (
          <div className="decl">
            <h3>إقرار وتعهّد والتزام</h3>
            {schema.declaration.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            <div className="sig-row" style={{ marginTop: 12 }}>
              <div>اسم وتوقيع مقدم الطلب<div className="line">{form.name || ' '}</div></div>
              <div></div>
              <div>التاريخ<div className="line">{new Date().toLocaleDateString('ar-IQ-u-ca-gregory')}</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FormPage });
