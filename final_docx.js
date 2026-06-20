// =============================================================
// FINAL — Form rendering & export
//   * HTML preview: loads forms_html/<CODE>.html (LibreOffice
//     conversion of the official Word — pixel-perfect layout)
//     and substitutes {{placeholders}} with form values.
//   * Word download: loads forms_word/<CODE>.docx, runs the same
//     substitution via docxtemplater, downloads.
//   * PDF: uses the HTML preview (window.print) — identical to
//     the screen render.
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

  function _substitute(str, data) {
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      data[k] != null ? String(data[k]) : '');
  }

  // ---------- Word download (via docxtemplater) ----------
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

  async function downloadDocx(svc, form) {
    const buf = await fillTemplate(svc, form);
    const blob = new Blob([buf], { type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: fileNameFor(svc, form) + '.docx',
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.DB && window.DB.log('form.docx', svc.code);
  }

  // ---------- HTML preview (pixel-perfect from LibreOffice) ----------
  const _htmlCache = new Map();

  async function loadHtmlTemplate(svc) {
    if (_htmlCache.has(svc.code)) return _htmlCache.get(svc.code);
    const res = await fetch(`forms_html/${svc.code}.html`);
    if (!res.ok) throw new Error(`HTML template not found: ${svc.code}`);
    const raw = await res.text();
    // Extract the inner <body> markup only (we'll inject into our own container)
    const m = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const body = (m ? m[1] : raw);
    // Extract <style> blocks from <head> so we can inject them once
    const styles = [];
    raw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => { styles.push(css); return ''; });
    const cached = { body, styles };
    _htmlCache.set(svc.code, cached);
    return cached;
  }

  async function renderHtmlInto(svc, form, container) {
    const tpl = await loadHtmlTemplate(svc);
    const data = _buildData(svc, form);
    container.innerHTML = '';
    // Inject style once per container
    if (tpl.styles.length) {
      const styleEl = document.createElement('style');
      styleEl.textContent = tpl.styles.join('\n');
      container.appendChild(styleEl);
    }
    // Inject body with placeholder substitution
    const wrap = document.createElement('div');
    wrap.className = 'lo-doc';
    wrap.setAttribute('dir', 'rtl');
    wrap.innerHTML = _substitute(tpl.body, data);
    container.appendChild(wrap);
  }

  // Print using a temporary print stage with the HTML preview
  async function printHtmlForm(svc, form) {
    const stageId = 'lo-print-stage';
    let stage = document.getElementById(stageId);
    if (!stage) {
      stage = document.createElement('div');
      stage.id = stageId;
      document.body.appendChild(stage);
    }
    await renderHtmlInto(svc, form, stage);
    document.body.classList.add('printing-lo');
    const cleanup = () => {
      document.body.classList.remove('printing-lo');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  window.fillDocxTemplate = fillTemplate;
  window.downloadFilledDocx = downloadDocx;
  window.renderHtmlForm = renderHtmlInto;
  window.printHtmlForm = printHtmlForm;
  window.docxFileNameFor = fileNameFor;
})();
