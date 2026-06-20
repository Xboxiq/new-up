// =============================================================
// FINAL — Official paper: PDF-overlay rendering
//
// We ship one pre-rendered PDF per form (forms_pdf/<CODE>.pdf) that
// was produced by LibreOffice from the official Word file. The PDF
// preserves the layout, fonts, RTL flow, checkbox positions, table
// borders and page-numbers exactly as Word.
//
// At runtime, pdf-lib draws the user's data on top of the PDF at
// the exact field coordinates stored in forms_pdf/<CODE>.json. The
// resulting PDF is byte-identical to Word in layout — the only
// difference is that the empty cells now contain the form values.
// =============================================================

function OfficialPaper({ svc, schema, form, attachments }) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState('loading');
  const [errMsg, setErrMsg] = React.useState('');

  // Re-render when svc or form values change, debounced
  const formKey = React.useMemo(() => JSON.stringify(form), [form]);
  React.useEffect(() => {
    if (!ref.current) return;
    if (!window.renderFilledPdf) {
      setState('error');
      setErrMsg('وحدة PDF غير محمّلة');
      return;
    }
    setState('loading');
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      window.renderFilledPdf(svc, form, ref.current)
        .then(() => { if (!cancelled) setState('ready'); })
        .catch(e => {
          if (cancelled) return;
          setState('error');
          setErrMsg(e.message || 'فشل التجهيز');
        });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [svc.code, formKey]);

  const hasAttachments = attachments && attachments.length > 0;
  const fileName = window.pdfFileNameFor
    ? window.pdfFileNameFor(svc, form)
    : `${svc.code}_${(form.name || 'بدون-اسم').replace(/\s/g,'-')}`;

  const onDownloadWord = async () => {
    try { await window.downloadFilledDocx(svc, form); }
    catch (e) { alert('تعذّر تنزيل ملف Word: ' + e.message); }
  };
  const onDownloadPdf = async () => {
    try { await window.downloadFilledPdf(svc, form, ref.current); }
    catch (e) { alert('تعذّر تنزيل PDF: ' + e.message); }
  };
  const onPrint = async () => {
    try {
      // HTML preview is LibreOffice's conversion of the official Word file —
      // printing it gives output identical to the Word template with filled data.
      if (window.printHtmlForm) await window.printHtmlForm(svc, form);
      else await window.printFilledPdf(ref.current);
    }
    catch (e) { alert('تعذّر الطباعة: ' + e.message); }
  };
  const onPdfWithAttach = () => {
    if (!window.exportFormWithAttachments) return;
    window.exportFormWithAttachments({ svc, schema, form, attachments: attachments || [], fileName });
  };

  return (
    <div className="of-wrap">
      <div className="of-toolbar no-print">
        <div className="of-toolbar__lhs">
          <button className="f-btn f-btn--primary f-btn--lg" onClick={onDownloadPdf}>
            <Icon name="picture_as_pdf" />
            <span>
              <strong>تنزيل PDF الرسمي</strong>
              <small>مطابق ١٠٠٪ للنموذج المعتمد + بياناتك</small>
            </span>
          </button>
        </div>
        <div className="of-toolbar__btns">
          <button className="f-btn" onClick={onPrint}>
            <Icon name="print" /> طباعة
          </button>
          <button className="f-btn" onClick={onDownloadWord}>
            <Icon name="description" /> تنزيل Word
          </button>
          {window.exportFormWithAttachments && (
            <button className="f-btn" onClick={onPdfWithAttach}>
              <Icon name="file_save" /> PDF + المرفقات
              {hasAttachments && <small style={{ opacity: 0.7 }}>(+ {attachments.length})</small>}
            </button>
          )}
        </div>
      </div>

      <div className="of-pdf-shell" id="of-print-root">
        {state === 'loading' && (
          <div className="of-pdf-loading">
            <div className="of-docx-spinner" />
            جاري تجهيز النموذج…
          </div>
        )}
        {state === 'error' && (
          <div className="of-docx-state of-docx-state--err">
            <Icon name="warning" />
            <div>
              <strong>تعذّر تجهيز النموذج</strong>
              <div style={{ fontSize:'0.82rem', marginTop:4, opacity:0.85 }}>{errMsg}</div>
            </div>
          </div>
        )}
        <div ref={ref} className="of-pdf-host" />
      </div>
    </div>
  );
}

window.OfficialPaper = OfficialPaper;
