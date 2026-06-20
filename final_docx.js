// =============================================================
// FINAL — Simple Word-only flow
//
// 1. Fill the template .docx with the form values (docxtemplater)
// 2. Render the filled .docx inline (docx-preview) for preview
// 3. Two actions: تنزيل Word + طباعة
//    "Print" uses window.print on the rendered preview.
// =============================================================

(function () {
  let _renderedFor = null;

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

  // Fill the .docx template with the form values; returns ArrayBuffer.
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

  // ----- Download as .docx -----
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

  // ----- Render preview into a DOM container -----
  async function renderPreview(svc, form, container) {
    const buf = await fillTemplate(svc, form);
    container.innerHTML = '';
    await window.docx.renderAsync(buf, container, null, {
      className: 'docx-rendered',
      inWrapper: true,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      experimental: false,
      trimXmlDeclaration: true,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: false,
    });
    _renderedFor = svc.code;
  }

  // ----- Print: prints the preview container directly -----
  function printPreview() {
    // window.print prints the whole document. Our @media print rules
    // hide everything except the docx-rendered container.
    document.body.classList.add('printing-docx');
    const cleanup = () => {
      document.body.classList.remove('printing-docx');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 50);
  }

  window.fillFilledDocx     = fillTemplate;
  window.downloadFilledDocx = downloadDocx;
  window.renderFilledDocx   = renderPreview;
  window.printFilledDocx    = printPreview;
  window.docxFileNameFor    = fileNameFor;
})();
