// =============================================================
// FINAL — Word-only flow
// 1. Fill template .docx with form values (docxtemplater)
// 2. Preview via docx-preview
// 3. Print: render docx into a dedicated print iframe and call
//    contentWindow.print() — the iframe is isolated from the
//    page's CSS, so the printed output matches what docx-preview
//    renders (a faithful representation of the Word document).
// 4. Download: the filled .docx as-is (Word opens it perfectly).
// =============================================================

(function () {

  function _today() {
    return new Date().toLocaleDateString('ar-IQ-u-ca-gregory',
      { day:'2-digit', month:'2-digit', year:'numeric' });
  }
  function _serial(svc, settings) {
    return `${svc.code}-${(settings.centerCode || 'RS-014')}-${String(Math.floor(Math.random()*9000)+1000)}`;
  }
  function _buildData(svc, form) {
    const settings = (window.DB && window.DB.settings.get()) || {};
    return {
      centerName: settings.centerName || 'مركز النضال — كهرباء الرصافة',
      centerCode: settings.centerCode || 'RS-014',
      date:       form._date || _today(),
      serial:     form._serial || _serial(svc, settings),
      name:       form.name     || '',
      nid:        form.nid      || '',
      housing:    form.housing  || '',
      acct:       form.acct     || '',
      ramz:       form.ramz     || '',
      phone:      form.phone    || '',
      hay:        form.hay      || '',
      mahalla:    form.mahalla  || '',
      zuqaq:      form.zuqaq    || '',
      dar:        form.dar      || '',
      piece:      form.piece    || '',
      floor:      form.floor    || '',
      gps:        form.gps      || '',
      landmark:   form.landmark || '',
      apt:        form.apt      || '',
      receiptNo:  form._receiptNo || '',
      reason:     form.reason   || form.notes || '',
      notes:      form.notes    || '',
    };
  }

  // Fill the template; returns ArrayBuffer of the new .docx
  async function fillTemplate(svc, form) {
    const res = await fetch(`forms_word/${svc.code}.docx`);
    if (!res.ok) throw new Error(`نموذج Word غير موجود لـ ${svc.code}`);
    const buf = await res.arrayBuffer();
    const zip = new window.PizZip(buf);
    const Doc = (window.docxtemplater && (window.docxtemplater.default || window.docxtemplater));
    const doc = new Doc(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
      delimiters: { start: '{{', end: '}}' },
    });
    doc.render(_buildData(svc, form));
    return doc.getZip().generate({ type: 'arraybuffer' });
  }

  function fileNameFor(svc, form) {
    const safe = (form.name || 'بدون-اسم').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
    return `${svc.code}_${safe}_${new Date().toISOString().slice(0,10)}`;
  }

  // ----- Download -----
  async function downloadDocx(svc, form) {
    const buf = await fillTemplate(svc, form);
    const blob = new Blob([buf], { type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: fileNameFor(svc, form) + '.docx',
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    window.DB && window.DB.log('form.docx', svc.code);
  }

  // ----- Preview (on-screen) -----
  async function renderPreview(svc, form, container) {
    const buf = await fillTemplate(svc, form);
    container.innerHTML = '';
    await window.docx.renderAsync(buf, container, null, {
      className: 'docx-rendered',
      inWrapper: true,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,  // respect Word's page breaks (declaration page!)
      experimental: true,
      trimXmlDeclaration: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: false,
      ignoreWidth: false,
      ignoreHeight: false,
      defaultFont: { family: 'Arial', size: 22 },
    });
  }

  // ----- Print via isolated iframe (cleanest possible output) -----
  async function printDocx(svc, form) {
    const buf = await fillTemplate(svc, form);

    // Build an isolated iframe so page CSS can't interfere
    const oldFrame = document.getElementById('docx-print-frame');
    if (oldFrame) oldFrame.remove();

    const frame = document.createElement('iframe');
    frame.id = 'docx-print-frame';
    frame.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:850px;height:1200px;border:0;visibility:hidden;';
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    doc.open();
    doc.write(`<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>طباعة</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { direction: rtl; font-family: "Tajawal", "Arial", "Helvetica Neue", sans-serif; }
  /* Force RTL on every node — overrides docx-preview inline styles */
  .docx-wrapper, .docx-wrapper *,
  section.docx, section.docx * {
    direction: rtl !important;
    unicode-bidi: embed !important;
  }
  .docx-wrapper { background: transparent !important; padding: 0 !important; }
  section.docx { margin: 0 auto !important; box-shadow: none !important; }
  table { margin-left: 0 !important; margin-right: 0 !important; }
  td, th { text-align: right !important; }
  /* Latin/digit runs stay LTR */
  *[lang="en-US"], *[lang="en"] {
    direction: ltr !important;
    unicode-bidi: embed !important;
  }
  @media print {
    section.docx { page-break-after: always; }
    section.docx:last-child { page-break-after: auto; }
  }
</style>
</head>
<body><div id="root" dir="rtl"></div></body>
</html>`);
    doc.close();

    const root = doc.getElementById('root');
    // Render docx-preview INTO the iframe (using the parent window's lib)
    await window.docx.renderAsync(buf, root, null, {
      className: 'docx-rendered',
      inWrapper: true,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,  // respect Word page breaks
      experimental: true,
      trimXmlDeclaration: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: false,
      ignoreWidth: false,
      ignoreHeight: false,
      defaultFont: { family: 'Arial', size: 22 },
    });

    // Give the layout a beat to settle, then print the iframe's window
    await new Promise(r => setTimeout(r, 150));
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch (e) {
      // Fallback: open in a new tab
      const blob = new Blob([buf], { type:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }

    // Clean up after the print dialog closes (or a long timeout)
    const remove = () => { frame.remove(); };
    if (frame.contentWindow) {
      try { frame.contentWindow.addEventListener('afterprint', remove); } catch {}
    }
    setTimeout(remove, 60000);

    window.DB && window.DB.log('form.print', svc.code);
  }

  window.fillFilledDocx     = fillTemplate;
  window.downloadFilledDocx = downloadDocx;
  window.renderFilledDocx   = renderPreview;
  window.printFilledDocx    = printDocx;
  window.docxFileNameFor    = fileNameFor;
})();
