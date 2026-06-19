// =============================================================
// FINAL — Word-faithful printable form
// Mirrors the official .docx layout pt-by-pt:
//   - Repeating header (logo + project title + company) every page
//   - Footer "Page X of Y" via CSS counters
//   - Title bar | header | address | docs matrix | notes | routing | signatures
//   - Optional declaration (always starts a new page)
// =============================================================

const OF_CLASSES = ['منزلي','تجاري','صناعي','زراعي','حكومي','مجمع سكني','مشروع استثماري'];
const OF_PHASES  = ['أحادي الطور','ثلاثي الطور'];
const OF_ROUTING_DEFAULT = ['خدمات المشتركين','الدائرة الفنية','الدائرة القانونية','الصندوق','شؤون الموظفين','إلغاء الطلب'];

function _cb(on) { return on ? '☑' : '☐'; }
function _fmtDate(d = new Date()) {
  return d.toLocaleDateString('ar-IQ-u-ca-gregory', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// Mirrors the Word ticking pattern:
//  - all:true        → solid bullet in every class column (required)
//  - for: '<list>'   → solid bullet only in matching classes
//  - else            → solid bullet everywhere except classes in `not`
function _docRequiredFor(doc, cls) {
  if (doc.all) return true;
  if (doc.for) return doc.for.split('|').map(s => s.trim()).includes(cls);
  if (doc.not) return !doc.not.split('|').map(s => s.trim()).includes(cls);
  return true;
}

// Tiny atoms
function _PaperHeader({ s }) {
  return (
    <div className="of-rh" aria-hidden="true">
      <img className="of-rh__logo" src="assets/logo.png" alt="" />
      <div className="of-rh__txt">
        <div className="of-rh__t1">{s.headerTitle || 'مشروع التحول الذكي في الشبكة الكهربائية لفرع توزيع كهرباء الرصافة - منطقة مركز الرصافة'}</div>
        <div className="of-rh__t2">{s.company || 'شركة تدفق الخير'}</div>
      </div>
    </div>
  );
}
function _PaperFooter() {
  return (
    <div className="of-rf" aria-hidden="true">
      <span className="of-rf__page" />
    </div>
  );
}

// =============================================================
function OfficialPaper({ svc, schema, form, attachments, mode, setMode }) {
  const settings = (window.DB && window.DB.settings.get()) || {};
  const today = _fmtDate();
  const serial = form._serial ||
    `${svc.code}-${(settings.centerCode || 'RS-014')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const isLegacy = mode === 'legacy';

  const docsList = (schema.sections || [])
    .filter(sx => sx.kind === 'documents')
    .flatMap(sx => sx.list || []);

  const showPhase   = (schema.sections || []).some(sx => sx.kind === 'classification' && Array.isArray(sx.phases));
  const showClass   = (schema.sections || []).some(sx => sx.kind === 'classification');
  const routing     = schema.routing || OF_ROUTING_DEFAULT;
  const docDetails  = schema.extraDocsTable;
  const showNotes   = !!(form.reason || form.notes);
  const declaration = schema.declaration;
  const hasAttachments = attachments && attachments.length > 0;

  const fileName = `${svc.code}_${(form.name || 'بدون-اسم').replace(/\s/g,'-')}_${new Date().toISOString().slice(0,10)}`;

  return (
    <div className="of-wrap">
      {/* on-screen toolbar (hidden on print) */}
      <div className="of-toolbar no-print">
        <div className="of-modeswitch" role="tablist">
          <button className={`of-modeswitch__btn ${isLegacy ? 'is-on' : ''}`}
                  onClick={() => setMode && setMode('legacy')} role="tab" aria-selected={isLegacy}>
            <Icon name="article" />
            <span>
              <strong>النسخة الأصلية</strong>
              <small>حرفياً مثل الوورد</small>
            </span>
          </button>
          <button className={`of-modeswitch__btn ${!isLegacy ? 'is-on' : ''}`}
                  onClick={() => setMode && setMode('pro')} role="tab" aria-selected={!isLegacy}>
            <Icon name="auto_awesome" />
            <span>
              <strong>النسخة الاحترافية</strong>
              <small>تصميم محسّن</small>
            </span>
          </button>
        </div>
        <div className="of-toolbar__btns">
          <button className="f-btn" onClick={() => window.print()}>
            <Icon name="print" /> طباعة
          </button>
          <button className="f-btn f-btn--primary" onClick={() => window.print()}>
            <Icon name="picture_as_pdf" /> حفظ كـ PDF
          </button>
          {window.exportFormWithAttachments && (
            <button className="f-btn"
                    onClick={() => window.exportFormWithAttachments({ svc, schema, form, attachments: attachments || [], fileName })}>
              <Icon name="file_save" /> PDF موحّد {hasAttachments && <small style={{ opacity: 0.7 }}>(+ {attachments.length})</small>}
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE SHEET — wrapped in a table so <thead> repeats every page */}
      <article className={`of-paper ${isLegacy ? 'of-paper--legacy' : 'of-paper--pro'}`} dir="rtl" id="of-print-root">
        <table className="of-pagedoc">
          <thead>
            <tr><td>
              <div className="of-sheet-header">
                <img src="assets/logo.png" alt="" />
                <div>
                  <div className="of-sheet-header__t1">{settings.headerTitle || 'مشروع التحول الذكي في الشبكة الكهربائية لفرع توزيع كهرباء الرصافة - منطقة مركز الرصافة'}</div>
                  <div className="of-sheet-header__t2">{settings.company || 'شركة تدفق الخير'}</div>
                </div>
              </div>
            </td></tr>
          </thead>
          <tbody><tr><td>

        {/* ─── T1 · TITLE BAR ─────────────────────────────── */}
        <table className="of-tbl of-titlebar">
          <tbody>
            <tr>
              <td className="of-title-main">{schema.paperTitle || svc.name}</td>
              <td className="of-title-code">نموذج رقم ({svc.code})</td>
            </tr>
            <tr>
              <td className="of-title-rcptL">رقم وصل قبض (رسوم طلب الخدمة)</td>
              <td className="of-title-rcptV">{form._receiptNo || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* ─── T2 · SUBSCRIBER HEADER ─────────────────────── */}
        <table className="of-tbl of-header">
          <colgroup>
            <col style={{ width:'13%' }} />
            <col style={{ width:'21%' }} />
            <col style={{ width:'13%' }} />
            <col style={{ width:'17%' }} />
            <col style={{ width:'15%' }} />
            <col style={{ width:'21%' }} />
          </colgroup>
          <tbody>
            <tr>
              <th>اسم المركز</th>
              <td>{settings.centerName || 'مركز النضال — كهرباء الرصافة'}</td>
              <th>تاريخ الطلب</th>
              <td>{today}</td>
              <th>الرقم المرجعي</th>
              <td className="of-serial">{serial}</td>
            </tr>
            <tr>
              <th>رقم المركز</th>
              <td>{settings.centerCode || 'RS-014'}</td>
              <th>اسم المشترك / طالب الخدمة</th>
              <td>{form.name || ''}</td>
              <th>رقم البطاقة الموحدة / الهوية</th>
              <td className="of-mono">{form.nid || ''}</td>
            </tr>
            {showClass && (
              <tr>
                <th>{form._classLabel || 'صنف الاشتراك المطلوب'}</th>
                <td colSpan={5} className="of-checks">
                  {OF_CLASSES.map(c => (
                    <span key={c} className="of-check">
                      <span className="of-check__b">{_cb(form.cls === c)}</span> {c}
                    </span>
                  ))}
                </td>
              </tr>
            )}
            {showPhase && (
              <tr>
                <th>قوة التغذية المطلوبة (نوع الربط)</th>
                <td colSpan={5} className="of-checks">
                  {OF_PHASES.map(p => (
                    <span key={p} className="of-check">
                      <span className="of-check__b">{_cb(form.phase === p)}</span> {p}
                    </span>
                  ))}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 className="of-heading">بيانات طالب الخدمة / المشترك القانوني</h3>

        {/* ─── T3 · ADDRESS ───────────────────────────────── */}
        <table className="of-tbl of-address">
          <tbody>
            <tr>
              <th style={{ width:'15%' }}>رقم بطاقة السكن</th>
              <td style={{ width:'25%' }} className="of-mono">{form.housing || ''}</td>
              <th colSpan={6} className="of-subhead">عنوان العقار / الدار / الشقة / المطلوب له الخدمة</th>
            </tr>
            <tr>
              <th>رقم الحساب المخصص</th>
              <td className="of-mono">{form.acct || ''}</td>
              <th style={{ width:'7%' }}>حي</th>
              <td style={{ width:'13%' }}>{form.hay || ''}</td>
              <th style={{ width:'7%' }}>محلة</th>
              <td style={{ width:'10%' }} className="of-mono">{form.mahalla || ''}</td>
              <th style={{ width:'7%' }}>زقاق</th>
              <td style={{ width:'9%' }} className="of-mono">{form.zuqaq || ''}</td>
            </tr>
            <tr>
              <th>الترميز الجديد</th>
              <td className="of-mono">{form.ramz || ''}</td>
              <th>دار</th>
              <td className="of-mono">{form.dar || ''}</td>
              <th>رقم القطعة والمقاطعة</th>
              <td colSpan={2}>{form.piece || ''}</td>
              <th>رقم الطابق</th>
              <td className="of-mono">{form.floor || ''}</td>
            </tr>
            <tr>
              <th>رقم هاتف / موبايل</th>
              <td className="of-mono">{form.phone || ''}</td>
              <th>GPS</th>
              <td className="of-mono">{form.gps || ''}</td>
              <th>نقطة دالة</th>
              <td>{form.landmark || ''}</td>
              <th>رقم الشقة</th>
              <td className="of-mono">{form.apt || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* ─── T4 · DOCS MATRIX ───────────────────────────── */}
        {docsList.length > 0 && (
          <>
            <h3 className="of-heading">الوثائق / المستمسكات المطلوبة</h3>
            <table className="of-tbl of-docs">
              <thead>
                <tr>
                  <th style={{ width:'7%' }}>الحالة</th>
                  <th style={{ width:'4%' }}>#</th>
                  <th>الصنف</th>
                  {OF_CLASSES.map(c => (
                    <th key={c} className="of-docs__cls">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docsList.map((d, i) => {
                  const dk = `doc_${i}`;
                  const ticked = !!(form.docs && (form.docs[dk] || form.docs[d.n]));
                  return (
                    <tr key={i}>
                      <td className="of-docs__cb">{_cb(ticked)}</td>
                      <td className="of-docs__n">{i + 1}</td>
                      <td className="of-docs__name">
                        {d.n}{d.opt && <span className="of-docs__opt"> ({d.opt})</span>}
                      </td>
                      {OF_CLASSES.map(c => (
                        <td key={c} className="of-docs__cls">
                          {_docRequiredFor(d, c) ? <span className="of-bullet">●</span> : '☐'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* ─── T5 · DOC DETAILS (optional) ─────────────────── */}
        {docDetails && docDetails.length > 0 && (
          <table className="of-tbl of-docdetails">
            <thead>
              <tr>
                <th style={{ width:'50%' }}>الوثيقة</th>
                <th style={{ width:'25%' }}>رقم الوثيقة</th>
                <th style={{ width:'25%' }}>تاريخ الوثيقة</th>
              </tr>
            </thead>
            <tbody>
              {docDetails.map(name => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="of-mono">{(form._extraDocs && form._extraDocs[name + '_no']) || ''}</td>
                  <td className="of-mono">{(form._extraDocs && form._extraDocs[name + '_dt']) || ''}</td>
                </tr>
              ))}
              <tr>
                <td>رقم وصل قبض (رسوم المطالبة المالية بعد الدراسة)</td>
                <td className="of-mono">{form._postFeeReceiptNo || ''}</td>
                <td className="of-mono">{form._postFeeReceiptDt || ''}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* ─── T6 · NOTES (optional) ──────────────────────── */}
        {showNotes && (
          <>
            <h3 className="of-heading">شروحات</h3>
            <table className="of-tbl of-notes">
              <tbody>
                <tr>
                  <th style={{ width:'22%' }}>سبب الطلب / الملاحظات</th>
                  <td>{form.reason || form.notes || ''}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* ─── T7 · ROUTING ────────────────────────────────── */}
        <table className="of-tbl of-routing">
          <tbody>
            <tr>
              <th style={{ width:'24%' }}>يحول لاستكمال الإجراءات:</th>
              <td className="of-checks">
                {routing.map(r => (
                  <span key={r} className="of-check">
                    <span className="of-check__b">{_cb(form._route === r)}</span> {r}
                  </span>
                ))}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── T8 · SIGNATURES ────────────────────────────── */}
        <table className="of-tbl of-signs">
          <thead>
            <tr>
              <th>اسم وتوقيع موظف خدمات المشتركين</th>
              <th>اسم وتوقيع مقدم الطلب</th>
              <th>اسم وتوقيع مسؤول مركز خدمات المشتركين</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>&nbsp;</td><td>{form.name || ''}</td><td>&nbsp;</td></tr>
          </tbody>
        </table>

        {/* ─── DECLARATION (always its own page) ─────────── */}
        {declaration && (
          <section className="of-decl">
            <h3 className="of-heading of-heading--decl">إقرار وتعهّد والتزام</h3>
            <div className="of-decl__body">
              {declaration.split('\n').filter(Boolean).map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </div>
            <div className="of-decl__sign">
              <div className="of-decl__col">
                <div className="of-decl__line">{form.name || ''}</div>
                <div className="of-decl__lbl">اسم وتوقيع مقدم الطلب</div>
              </div>
              <div className="of-decl__col">
                <div className="of-decl__line">{today}</div>
                <div className="of-decl__lbl">التاريخ</div>
              </div>
            </div>
          </section>
        )}

          </td></tr></tbody>
        </table>
      </article>
    </div>
  );
}

window.OfficialPaper = OfficialPaper;
