// =============================================================
// FINAL — Word-only flow (simple)
//   * Preview: docx-preview renders the filled .docx inline
//   * Download: same filled .docx
//   * Print: window.print() on the preview
// =============================================================

function OfficialPaper({ svc, form, attachments }) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState('loading');
  const [errMsg, setErrMsg] = React.useState('');

  const formKey = React.useMemo(() => JSON.stringify(form), [form]);
  React.useEffect(() => {
    if (!ref.current) return;
    if (!window.renderFilledDocx) {
      setState('error');
      setErrMsg('وحدة العرض لم تُحمَّل بعد');
      return;
    }
    setState('loading');
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      window.renderFilledDocx(svc, form, ref.current)
        .then(() => { if (!cancelled) setState('ready'); })
        .catch(e => {
          if (cancelled) return;
          setState('error');
          setErrMsg(e.message || 'فشل التجهيز');
        });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [svc.code, formKey]);

  const onDownloadWord = async () => {
    try { await window.downloadFilledDocx(svc, form); }
    catch (e) { alert('تعذّر تنزيل ملف Word: ' + e.message); }
  };
  const onPrint = () => {
    try { window.printFilledDocx(); }
    catch (e) { alert('تعذّر الطباعة: ' + e.message); }
  };

  return (
    <div className="of-wrap">
      <div className="of-toolbar no-print">
        <button className="f-btn f-btn--primary f-btn--lg" onClick={onDownloadWord}>
          <Icon name="description" />
          <span>
            <strong>تنزيل ملف Word</strong>
            <small>النموذج الرسمي + بياناتك</small>
          </span>
        </button>
        <button className="f-btn f-btn--lg" onClick={onPrint}>
          <Icon name="print" />
          <span>
            <strong>طباعة</strong>
            <small>النسخة الأصلية</small>
          </span>
        </button>
      </div>

      <div className="of-docx-shell" id="of-print-root">
        {state === 'loading' && (
          <div className="of-docx-loading">
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
        <div ref={ref} className="of-docx-host" />
      </div>
    </div>
  );
}

window.OfficialPaper = OfficialPaper;
