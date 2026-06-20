// =============================================================
// FINAL — PDF rendering with HTML text overlay
//
// Strategy:
//  1. pdf.js renders each page of the official PDF onto a <canvas>
//     — this is byte-identical to Word's print output.
//  2. For each {{placeholder}} (positions in forms_pdf/<CODE>.json),
//     we place an absolutely-positioned <span> on top of the canvas
//     at the same coordinates, containing the form value. The browser
//     handles all Arabic shaping, BIDI, ligatures correctly.
//  3. For download / print, we use html2canvas to capture the
//     canvas + overlay, then pdf-lib to wrap as a PDF.
// =============================================================

(function () {
  const PDF_DIR = 'forms_pdf';

  // Configure pdf.js worker
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }

  const _cache = { templates: new Map() };

  async function _loadTemplate(code) {
    if (_cache.templates.has(code)) return _cache.templates.get(code);
    const [pdfRes, jsonRes] = await Promise.all([
      fetch(`${PDF_DIR}/${code}.pdf`),
      fetch(`${PDF_DIR}/${code}.json`),
    ]);
    if (!pdfRes.ok)  throw new Error(`PDF غير موجود لـ ${code}`);
    if (!jsonRes.ok) throw new Error(`Coordinates غير موجودة لـ ${code}`);
    const pdfBytes = await pdfRes.arrayBuffer();
    const meta = await jsonRes.json();
    const entry = { pdfBytes, meta };
    _cache.templates.set(code, entry);
    return entry;
  }

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

  function _isRtl(s) {
    if (!s) return false;
    return /[؀-ۿﭐ-﻿]/.test(s);
  }

  // ---------- Render the PDF pages + overlays into a container ----------
  async function renderInto(svc, form, container) {
    const { pdfBytes, meta } = await _loadTemplate(svc.code);
    const data = _buildData(svc, form);

    container.innerHTML = '';
    container.classList.add('pdf-doc');

    const pdfDoc = await window.pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      disableFontFace: false,
    }).promise;

    const SCALE = 1.5;
    // Shared canvas for text measurement (reused for every field)
    const measureCtx = document.createElement('canvas').getContext('2d');

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: SCALE });

      const pageEl = document.createElement('div');
      pageEl.className = 'pdf-page';
      pageEl.style.width = viewport.width + 'px';
      pageEl.style.height = viewport.height + 'px';

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      pageEl.appendChild(canvas);

      const overlay = document.createElement('div');
      overlay.className = 'pdf-overlay';
      pageEl.appendChild(overlay);

      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
      }).promise;

      const pageInfo = meta.pages[i];
      const sx = viewport.width  / pageInfo.width;
      const sy = viewport.height / pageInfo.height;

      for (const f of meta.fields) {
        if (f.page !== i) continue;
        const value = data[f.key];
        if (value == null || value === '') continue;

        const rtl = _isRtl(value);
        const text = String(value);

        // Geometry — slight horizontal expansion so values aren't clipped
        const padX = 3;
        const fieldW = f.w * sx + padX * 2;
        const fieldH = f.h * sy;
        const fontFamily = 'Tajawal, "Arial", "Helvetica Neue", sans-serif';
        const baseSize = f.size * sx;

        // Measure single-line width; if it fits, keep it.
        // Otherwise: shrink font-size up to 70%, then compress horizontally.
        let fontSize = baseSize;
        let multiLine = false;
        measureCtx.font = `${fontSize}px ${fontFamily}`;
        const singleW = measureCtx.measureText(text).width;
        let scaleX = 1;

        if (singleW > fieldW) {
          // Try shrinking the font (down to 75%)
          fontSize = Math.max(baseSize * 0.75, baseSize * (fieldW / singleW));
          measureCtx.font = `${fontSize}px ${fontFamily}`;
          const w2 = measureCtx.measureText(text).width;
          if (w2 > fieldW) {
            // If still too wide, allow wrapping to a second line
            multiLine = true;
            scaleX = Math.max(0.85, Math.min(1, fieldW / w2));
          }
        }

        const el = document.createElement('span');
        el.className = 'pdf-field';
        el.style.left   = (f.x * sx - padX) + 'px';
        el.style.top    = (f.y * sy) + 'px';
        el.style.width  = fieldW + 'px';
        el.style.fontFamily = fontFamily;
        el.style.fontSize = fontSize + 'px';
        el.style.direction = rtl ? 'rtl' : 'ltr';
        el.style.textAlign = rtl ? 'right' : 'center';
        el.dir = rtl ? 'rtl' : 'ltr';
        if (multiLine) {
          el.style.whiteSpace = 'normal';
          el.style.lineHeight = '1.05';
          // Allow up to ~3 lines downward; the cell behind it can absorb the overflow.
          el.style.height = (fieldH * 3) + 'px';
          el.style.display = 'flex';
          el.style.alignItems = 'flex-start';
          el.style.justifyContent = rtl ? 'flex-end' : 'center';
          el.style.paddingTop = (fieldH * 0.05) + 'px';
        } else {
          el.style.whiteSpace = 'nowrap';
          el.style.height = fieldH + 'px';
          el.style.lineHeight = fieldH + 'px';
        }
        if (scaleX < 1) {
          el.style.transform = `scaleX(${scaleX})`;
          el.style.transformOrigin = rtl ? 'right top' : 'center top';
        }
        el.textContent = text;
        overlay.appendChild(el);
      }

      container.appendChild(pageEl);
    }
  }

  function fileNameFor(svc, form) {
    const safe = (form.name || 'بدون-اسم').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-');
    return `${svc.code}_${safe}_${new Date().toISOString().slice(0,10)}`;
  }

  // ---------- Print/PDF export: use browser's native print on the rendered pages ----------
  async function printRendered(container) {
    if (!container) return;
    // Mark document as in print-render mode so our @media print rules show only the rendered pages
    const stage = document.getElementById('pdf-print-stage') || (() => {
      const d = document.createElement('div');
      d.id = 'pdf-print-stage';
      document.body.appendChild(d);
      return d;
    })();
    stage.innerHTML = '';
    // Clone the container into the print stage
    const clone = container.cloneNode(true);
    stage.appendChild(clone);
    document.body.classList.add('printing-pdf');
    const cleanup = () => {
      document.body.classList.remove('printing-pdf');
      stage.innerHTML = '';
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => window.print(), 100);
  }

  // ---------- Download as PDF (composite canvas + overlay → PDF) ----------
  // Captures each rendered .pdf-page node as an image, embeds in a new PDF.
  async function downloadAsPdf(svc, form, container) {
    if (!container) throw new Error('No container to capture');
    if (!window.html2canvas) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
        s.onload = res; s.onerror = () => rej(new Error('فشل تحميل html2canvas'));
        document.head.appendChild(s);
      });
    }
    const { PDFDocument } = window.PDFLib;
    const out = await PDFDocument.create();
    const pageEls = container.querySelectorAll('.pdf-page');
    for (const pageEl of pageEls) {
      const canvas = await window.html2canvas(pageEl, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const png = canvas.toDataURL('image/png');
      const bytes = await (await fetch(png)).arrayBuffer();
      const img = await out.embedPng(bytes);
      const A4 = { w: 595.28, h: 841.89 };
      // Fit-to-page preserving aspect
      const ratio = img.width / img.height;
      let drawW = A4.w, drawH = drawW / ratio;
      if (drawH > A4.h) { drawH = A4.h; drawW = drawH * ratio; }
      const page = out.addPage([A4.w, A4.h]);
      page.drawImage(img, {
        x: (A4.w - drawW) / 2,
        y: (A4.h - drawH) / 2,
        width: drawW, height: drawH,
      });
    }
    const bytes = await out.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: fileNameFor(svc, form) + '.pdf',
    });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  window.renderFilledPdf   = renderInto;
  window.printFilledPdf    = printRendered;
  window.downloadFilledPdf = downloadAsPdf;
  window.pdfFileNameFor    = fileNameFor;
})();
