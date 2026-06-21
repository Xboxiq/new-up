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

  const toast = window.useToast && window.useToast();
  const [printing, setPrinting] = React.useState(false);
  const onPrint = async () => {
    setPrinting(true);
    try {
      const res = await window.printFilledDocx(svc, form);
      if (!toast) return;
      if (res.mode === 'browser-pdf') {
        toast.push({ kind: 'success', title: 'جاهز للطباعة',
                     body: 'تم التحضير داخل المتصفّح — اختر الطابعة من النافذة' });
      } else if (res.mode === 'pdf') {
        toast.push({ kind: 'success', title: 'جاهز للطباعة',
                     body: 'اختر الطابعة من نافذة المتصفّح واضغط طباعة' });
      } else if (res.mode === 'silent') {
        toast.push({ kind: 'success', title: 'تم الإرسال للطابعة',
                     body: res.printer && res.printer !== '(system default)'
                       ? `الطابعة: ${res.printer}` : 'الطابعة الافتراضية' });
      } else if (res.mode === 'pdf-failed' || res.mode === 'silent-failed') {
        toast.push({ kind: 'warn', title: 'فشل الطباعة — تم تنزيل الملف',
                     body: res.error || 'افتح الملف يدوياً واطبعه (Ctrl+P)' });
      } else {
        toast.push({ kind: 'info', title: 'خادم الطباعة غير شغّال',
                     body: 'تم تنزيل الملف — افتحه واطبعه (Ctrl+P)' });
      }
    } catch (e) {
      if (toast) toast.push({ kind: 'error', title: 'تعذّر الطباعة', body: e.message });
      else alert('تعذّر الطباعة: ' + e.message);
    } finally {
      setTimeout(() => setPrinting(false), 800);
    }
  };
  const onDownloadWord = async () => {
    try {
      await window.downloadFilledDocx(svc, form);
      if (toast) toast.push({ kind: 'success', title: 'تم تنزيل ملف Word' });
    } catch (e) {
      if (toast) toast.push({ kind: 'error', title: 'تعذّر تنزيل ملف Word', body: e.message });
      else alert('تعذّر تنزيل ملف Word: ' + e.message);
    }
  };

  return (
    <div className="of-wrap">
      <div className="of-toolbar no-print">
        <button className="f-btn f-btn--primary f-btn--lg" onClick={onPrint} disabled={printing}>
          <Icon name={printing ? 'hourglass_top' : 'print'} />
          <span>
            <strong>{printing ? 'جاري التجهيز…' : 'طباعة'}</strong>
            <small>نفس ملف Word الرسمي</small>
          </span>
        </button>
        <button className="f-btn f-btn--lg" onClick={onDownloadWord}>
          <Icon name="description" />
          <span>
            <strong>تنزيل ملف Word</strong>
            <small>للأرشفة أو التعديل</small>
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
