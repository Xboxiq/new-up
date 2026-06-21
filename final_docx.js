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

  // =============================================================
  // PRINT — recommended path:
  //   1. Send the docx to the central Convert Server.
  //   2. Receive a PDF back.
  //   3. Embed the PDF in a hidden iframe and call iframe.print().
  //   4. The browser's print dialog appears on the EMPLOYEE'S machine
  //      → goes to the EMPLOYEE'S local printer.
  //
  // Server runs ONCE somewhere (your PC, a Raspberry Pi, a free cloud
  // host). Every employee uses it with zero install.
  // =============================================================

  const PRINT_SERVER = () => {
    // 1) explicit override in localStorage
    let url = window.localStorage.getItem('tq-print-server');
    // 2) admin-configured global setting
    if (!url && window.DB && window.DB.settings) {
      try { url = (window.DB.settings.get() || {}).printServerUrl; } catch {}
    }
    return (url || 'http://localhost:9876').replace(/\/+$/, '');
  };

  async function pingPrintServer(timeoutMs = 1500) {
    try {
      const ac = new AbortController();
      const t  = setTimeout(() => ac.abort(), timeoutMs);
      const res = await fetch(PRINT_SERVER() + '/ping', { signal: ac.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!res.ok) return null;
      const info = await res.json();
      return info && info.ok ? info : null;
    } catch { return null; }
  }

  // POST docx → receive PDF Blob
  async function convertToPdf(buf, name) {
    const res = await fetch(
      `${PRINT_SERVER()}/convert?name=${encodeURIComponent(name)}`,
      {
        method: 'POST',
        headers: { 'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        body: buf,
      }
    );
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || j.error || msg; } catch {}
      throw new Error(msg);
    }
    return await res.blob();
  }

  // Direct-print mode (server prints to its own printer). Used only when
  // the user explicitly enables silent mode in settings.
  async function directPrint(buf, name) {
    const res = await fetch(
      `${PRINT_SERVER()}/print?name=${encodeURIComponent(name)}`,
      {
        method: 'POST',
        headers: { 'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        body: buf,
      }
    );
    let info = null;
    try { info = await res.json(); } catch {}
    if (!res.ok || !info || !info.ok) {
      throw new Error((info && (info.message || info.error)) || `HTTP ${res.status}`);
    }
    return info;
  }

  // Embed PDF in a hidden iframe and call its print(); the browser handles
  // the actual printing to the user's local printer.
  function printPdfBlob(pdfBlob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(pdfBlob);

      // remove any previous print iframe
      const old = document.getElementById('tq-pdf-print-frame');
      if (old) old.remove();

      const frame = document.createElement('iframe');
      frame.id    = 'tq-pdf-print-frame';
      frame.src   = url;
      frame.style.cssText =
        'position:fixed;right:-10000px;top:-10000px;width:900px;height:1200px;border:0;visibility:hidden;';
      document.body.appendChild(frame);

      const cleanup = () => {
        setTimeout(() => {
          try { frame.remove(); } catch {}
          URL.revokeObjectURL(url);
        }, 2000);
      };

      let printed = false;
      const doPrint = () => {
        if (printed) return; printed = true;
        // small delay so the PDF viewer has the doc fully laid out
        setTimeout(() => {
          try {
            frame.contentWindow.focus();
            frame.contentWindow.print();
            try { frame.contentWindow.addEventListener('afterprint', cleanup); } catch {}
            setTimeout(cleanup, 90000);   // long safety cleanup
            resolve();
          } catch (e) {
            cleanup();
            reject(e);
          }
        }, 350);
      };

      frame.addEventListener('load', doPrint);
      // safety: if onload doesn't fire (some PDF viewers), force after 2.5s
      setTimeout(doPrint, 2500);
    });
  }

  function downloadDocxFallback(buf, fileName) {
    const blob = new Blob([buf], { type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url  = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: fileName + '.docx',
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function printDocx(svc, form) {
    const fileName = fileNameFor(svc, form);
    const settings = (window.DB && window.DB.settings && window.DB.settings.get()) || {};
    const silent   = !!settings.printSilent;

    // ---------- 0. In-browser PDF fill (zero server, zero install) ----------
    // Try this FIRST. Works for any template that has a matching
    // forms_pdf/<code>.pdf next to forms_word/<code>.docx.
    if (window.TadfuqPdfFill) {
      try {
        const values = _buildData(svc, form);
        const pdfBlob = await window.TadfuqPdfFill.buildFilledPdf(svc, values);
        await window.TadfuqPdfFill.printPdfBlob(pdfBlob);
        window.DB && window.DB.log('form.print', svc.code, { via: 'browser-pdf' });
        return { mode: 'browser-pdf' };
      } catch (e) {
        // PDF template missing or fill failed → fall through to server path
        console.warn('[print] browser-pdf failed:', e.message);
      }
    }

    // Build the docx for the server path / download fallback
    const buf = await fillTemplate(svc, form);

    const info = await pingPrintServer();
    if (info) {
      // ---------- A. Silent direct print (single-machine setup) ----------
      if (silent) {
        try {
          const r = await directPrint(buf, fileName);
          window.DB && window.DB.log('form.print', svc.code, { via: 'silent', platform: info.platform });
          return { mode: 'silent', platform: info.platform, printer: r && r.printer };
        } catch (e) {
          downloadDocxFallback(buf, fileName);
          window.DB && window.DB.log('form.print', svc.code, { via: 'silent-fail', error: e.message });
          return { mode: 'silent-failed', error: e.message };
        }
      }

      // ---------- B. Default — convert to PDF and print via browser ----------
      try {
        const pdf = await convertToPdf(buf, fileName);
        await printPdfBlob(pdf);
        window.DB && window.DB.log('form.print', svc.code, { via: 'pdf', platform: info.platform });
        return { mode: 'pdf', platform: info.platform };
      } catch (e) {
        downloadDocxFallback(buf, fileName);
        window.DB && window.DB.log('form.print', svc.code, { via: 'pdf-fail', error: e.message });
        return { mode: 'pdf-failed', error: e.message };
      }
    }

    // ---------- C. Server unreachable: download the docx ----------
    downloadDocxFallback(buf, fileName);
    window.DB && window.DB.log('form.print', svc.code, { via: 'download' });
    return { mode: 'download' };
  }

  window.fillFilledDocx     = fillTemplate;
  window.downloadFilledDocx = downloadDocx;
  window.renderFilledDocx   = renderPreview;
  window.printFilledDocx    = printDocx;
  window.docxFileNameFor    = fileNameFor;
})();
