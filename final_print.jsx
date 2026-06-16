// =============================================================
// FINAL — Official paper (Word-faithful print template)
// Mirrors the exact 8-table layout of the official .docx forms:
//   T1 title bar · T2 subscriber header · T3 address ·
//   T4 documents matrix · T5 (opt) doc details · T6 (opt) notes ·
//   T7 routing · T8 signatures · (opt) declaration block
// =============================================================

const OF_CLASSES = ['منزلي','تجاري','صناعي','زراعي','حكومي','مجمع سكني','مشروع استثماري'];
const OF_PHASES  = ['أحادي الطور','ثلاثي الطور'];
const OF_ROUTING = ['خدمات المشتركين','الدائرة الفنية','الدائرة القانونية','الصندوق','شؤون الموظفين','إلغاء الطلب'];
const OF_CENTER_NAME = 'مركز النضال — كهرباء الرصافة';
const OF_CENTER_CODE = 'RS-014';

function _cb(on) { return on ? '☑' : '☐'; }

function _fmtDate(d = new Date()) {
  return d.toLocaleDateString('ar-IQ-u-ca-gregory', { day:'numeric', month:'numeric', year:'numeric' });
}

// Does a doc row apply to a given class? Reproduces the Word ticking pattern:
//  - `all:true`  → ticked in every class column
//  - `for: 'صناعي|زراعي'` → ticked only in matching columns
//  - else → ticked everywhere except classes listed in `not`
function _docAppliesTo(doc, cls) {
  if (doc.all) return true;
  if (doc.for) return doc.for.split('|').map(s => s.trim()).includes(cls);
  if (doc.not) return !doc.not.split('|').map(s => s.trim()).includes(cls);
  return true;
}

// =============================================================
function OfficialPaper({ svc, schema, form }) {
  const today = _fmtDate();
  const serial = form._serial ||
    `${svc.code}-${OF_CENTER_CODE}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const docsList = (schema.sections || [])
    .filter(sx => sx.kind === 'documents')
    .flatMap(sx => sx.list || []);

  const showPhase   = (schema.sections || []).some(sx =>
    sx.kind === 'classification' && Array.isArray(sx.phases));
  const showClass   = (schema.sections || []).some(sx => sx.kind === 'classification');
  const routing     = schema.routing || OF_ROUTING;
  const docDetails  = schema.extraDocsTable;
  const showNotes   = !!form.reason;

  return (
    <div className="of-wrap">
      {/* on-screen toolbar (hidden on print) */}
      <div className="of-toolbar no-print">
        <span className="of-toolbar__hint">
          <Icon name="info" />
          معاينة الفورمة الأصلية — مطابقة لـ Word
        </span>
        <div className="of-toolbar__btns">
          <button className="f-btn" onClick={() => window.print()}>
            <Icon name="print" /> طباعة
          </button>
          <button className="f-btn f-btn--primary" onClick={() => window.print()}>
            <Icon name="file_download" /> حفظ كـ PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE SHEET */}
      <article className="of-paper" dir="rtl" id="of-print-root">

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
              <td>{OF_CENTER_NAME}</td>
              <th>تاريخ الطلب</th>
              <td>{today}</td>
              <th>الرقم المرجعي</th>
              <td className="of-serial">{serial}</td>
            </tr>
            <tr>
              <th>رقم المركز</th>
              <td>{OF_CENTER_CODE}</td>
              <th>اسم المشترك / طالب الخدمة</th>
              <td>{form.name || ''}</td>
              <th>رقم البطاقة الموحدة / الهوية</th>
              <td className="of-mono">{form.nid || ''}</td>
            </tr>
            {showClass && (
              <tr>
                <th>{form._classLabel || 'صنف الاشتراك'}</th>
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

        {/* heading */}
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
              <td colSpan={3}>{form.piece || ''}</td>
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

        {/* heading */}
        {docsList.length > 0 && (
          <h3 className="of-heading">الوثائق / المستمسكات المطلوبة</h3>
        )}

        {/* ─── T4 · DOCS MATRIX ───────────────────────────── */}
        {docsList.length > 0 && (
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
                return (
                  <tr key={i}>
                    <td className="of-docs__cb">{_cb(!!(form.docs && form.docs[dk]))}</td>
                    <td className="of-docs__n">{i + 1}</td>
                    <td className="of-docs__name">
                      {d.n}{d.opt && <span className="of-docs__opt"> ({d.opt})</span>}
                    </td>
                    {OF_CLASSES.map(c => (
                      <td key={c} className="of-docs__cls">
                        {_docAppliesTo(d, c) ? '☐' : <span className="of-dot">·</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  <td>{form.reason || ''}</td>
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
                    <span className="of-check__b">☐</span> {r}
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
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
          </tbody>
        </table>

        {/* ─── DECLARATION (optional, multi-paragraph) ────── */}
        {schema.declaration && (
          <section className="of-decl">
            <h3 className="of-heading of-heading--decl">إقرار وتعهّد والتزام</h3>
            <div className="of-decl__body">
              {schema.declaration.split('\n').filter(Boolean).map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </div>
            <div className="of-decl__sign">
              <div className="of-decl__col">
                <div className="of-decl__line" />
                <div className="of-decl__lbl">اسم وتوقيع مقدم الطلب</div>
              </div>
              <div className="of-decl__col">
                <div className="of-decl__line" />
                <div className="of-decl__lbl">التاريخ</div>
              </div>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

window.OfficialPaper = OfficialPaper;
