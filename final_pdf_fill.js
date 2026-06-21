// =============================================================
// In-browser PDF fill + print  (zero server, zero install)
//
// Strategy:
//   1) Templates are pre-converted .docx → .pdf (one time, in repo).
//   2) At runtime:
//        a. pdf.js extracts every "{{key}}" placeholder along with
//           its (x, y, w, h, fontSize) on each page.
//        b. pdf-lib opens the same PDF, draws a white rectangle to
//           hide the placeholder, then writes the value on top.
//        c. The resulting filled PDF is returned as a Blob.
//   3) The caller embeds it in a hidden iframe and calls print().
//
// Arabic note: the embedded font (NotoNaskh) shapes RTL correctly.
// =============================================================

(function () {
  // ---- pdf.js worker setup ----
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }

  // ---- Arabic font (lazy, cached) -----------------------------
  let _fontBytesCache = null;
  async function loadArabicFont() {
    if (_fontBytesCache) return _fontBytesCache;
    // Try a small set of likely-present locations
    const candidates = [
      'fonts/NotoNaskhArabic-Regular.ttf',
      'fonts/Amiri-Regular.ttf',
      'fonts/Cairo-Regular.ttf',
      'fonts/Tajawal-Regular.ttf',
    ];
    for (const url of candidates) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const buf = await r.arrayBuffer();
        _fontBytesCache = new Uint8Array(buf);
        return _fontBytesCache;
      } catch {}
    }
    throw new Error('لا يوجد خط عربي محلّي — ضع NotoNaskhArabic-Regular.ttf في مجلّد fonts/');
  }

  // ---- Extract every {{key}} position from a PDF --------------
  // Returns: { placeholders: [{page,key,x,y,w,h,fontSize}],
  //            stains:       [{page,x,y,w,h}]  (every run with { or }) }
  async function extractPlaceholders(pdfBytes) {
    const { pdfjsLib } = window;
    // pdf.js may take ownership of the buffer (transfer it); always clone.
    const copy = pdfBytes.slice ? pdfBytes.slice(0) : new Uint8Array(pdfBytes);
    const task = pdfjsLib.getDocument({ data: copy, isEvalSupported: false });
    const pdf  = await task.promise;
    const all     = [];   // { page, key, x, y, w, h, fontSize }
    const stains  = [];   // any text item containing { or } — wipe these

    // Pattern matches {{name}} potentially split across text runs
    const PLACE_RE = /\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp   = page.getViewport({ scale: 1 });
      const tc   = await page.getTextContent({ disableNormalization: false });

      // Join all text items linearly so split placeholders are caught
      let joined = '';
      const map  = [];   // index → { item, offsetInItem }
      for (const it of tc.items) {
        if (!it.str) continue;
        // Mark any item containing braces as a "stain" — covers leftover
        // placeholder fragments that the regex pass might miss
        if (/[{}]/.test(it.str)) {
          const [a, b, , , ix, iy] = it.transform;
          const fs = Math.hypot(a, b) || it.height || 12;
          stains.push({ page: i - 1, x: ix - 1, y: iy - 2, w: it.width + 4, h: fs * 1.25 });
        }
        for (let c = 0; c < it.str.length; c++) {
          map.push({ item: it, offset: c });
        }
        joined += it.str;
      }

      let m;
      PLACE_RE.lastIndex = 0;
      while ((m = PLACE_RE.exec(joined)) !== null) {
        const start = m.index;
        const end   = start + m[0].length;
        const startEntry = map[start];
        const endEntry   = map[end - 1];
        if (!startEntry || !endEntry) continue;

        // Collect every unique text run that contains part of the placeholder.
        const items = [];
        const seen  = new Set();
        for (let k = start; k < end; k++) {
          const it = map[k].item;
          if (seen.has(it)) continue;
          seen.add(it); items.push(it);
        }

        const startItem = startEntry.item;
        const [a, b, , , sx, sy] = startItem.transform;
        const fontSize = Math.hypot(a, b) || startItem.height || 12;

        // Each individual run becomes a stain so the whole placeholder is wiped
        // regardless of how it's split. Compute bbox in parallel for value overlay.
        let minX = +Infinity, maxX = -Infinity;
        let minY = +Infinity, maxY = -Infinity;
        for (const it of items) {
          const [ia, ib, , , ix, iy] = it.transform;
          const ifs = Math.hypot(ia, ib) || it.height || fontSize;
          stains.push({ page: i - 1, x: ix - 1, y: iy - 2, w: it.width + 4, h: ifs * 1.25 });
          minX = Math.min(minX, ix);
          maxX = Math.max(maxX, ix + it.width);
          minY = Math.min(minY, iy);
          maxY = Math.max(maxY, iy + ifs);
        }

        all.push({
          page: i - 1,
          key:  m[1],
          x:    minX,
          y:    sy,
          w:    Math.max(maxX - minX, fontSize * 0.5 * m[0].length),
          h:    Math.max(maxY - minY, fontSize * 1.2),
          fontSize,
        });
      }
    }
    return { placeholders: all, stains };
  }

  // ---- Render a text string to a PNG via Canvas ----------------
  // We use Canvas (not pdf-lib's drawText) because the browser's
  // 2D context handles Arabic shaping + bidi natively — pdf-lib
  // doesn't. The result is a pixel-perfect image we can overlay.
  function renderTextToPng(text, opts) {
    const {
      fontSize = 12,
      fontFamily = '"Tajawal", "Noto Naskh Arabic", "Arial", sans-serif',
      color = '#000',
      paddingX = 2,
      paddingY = 2,
      dpr = 3,                      // 3× for crisp print
    } = opts || {};

    // First pass: measure
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = `${fontSize}px ${fontFamily}`;
    meas.direction = 'rtl';
    const m = meas.measureText(text);
    const ascent  = m.actualBoundingBoxAscent  || fontSize * 0.85;
    const descent = m.actualBoundingBoxDescent || fontSize * 0.20;
    const w = Math.ceil(m.width)            + paddingX * 2;
    const h = Math.ceil(ascent + descent)   + paddingY * 2;

    // Second pass: render
    const cnv = document.createElement('canvas');
    cnv.width  = w * dpr;
    cnv.height = h * dpr;
    const ctx = cnv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.font     = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.direction = 'rtl';                  // browser shapes Arabic
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'right';             // RTL anchor at right edge
    ctx.fillText(text, w - paddingX, paddingY + ascent);
    return { dataUrl: cnv.toDataURL('image/png'), w, h };
  }

  function dataUrlToBytes(dataUrl) {
    const b64 = dataUrl.split(',')[1];
    const bin = atob(b64);
    const u8  = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  // ---- Fill a template PDF with form values --------------------
  async function fillPdfTemplate(pdfBytes, values) {
    const PDFLib = window.PDFLib;
    if (!PDFLib) throw new Error('pdf-lib غير محمّل');

    const { placeholders, stains } = await extractPlaceholders(pdfBytes);

    const docBytes = pdfBytes.slice ? pdfBytes.slice(0) : new Uint8Array(pdfBytes);
    const pdfDoc  = await PDFLib.PDFDocument.load(docBytes);
    const pages   = pdfDoc.getPages();

    // 0) Wipe every text run that has braces — covers leftover placeholder fragments
    for (const s of stains) {
      const page = pages[s.page];
      if (!page) continue;
      page.drawRectangle({ x: s.x, y: s.y, width: s.w, height: s.h,
                           color: PDFLib.rgb(1, 1, 1) });
    }

    for (const ph of placeholders) {
      const page = pages[ph.page];
      if (!page) continue;
      const raw  = values[ph.key];
      const text = (raw == null ? '' : String(raw)).trim();

      // 1) Cover the {{placeholder}} with white so it's hidden
      page.drawRectangle({
        x: ph.x - 1,
        y: ph.y - 2,
        width:  ph.w + 4,
        height: ph.h + 2,
        color:  PDFLib.rgb(1, 1, 1),
      });
      if (!text) continue;

      // 2) Render the value to a PNG via Canvas (handles Arabic
      //    shaping/bidi perfectly because the browser does it).
      const { dataUrl, w, h } = renderTextToPng(text, {
        fontSize:   ph.fontSize,
        fontFamily: '"Tajawal", "Noto Naskh Arabic", "Arial", sans-serif',
      });
      const png  = await pdfDoc.embedPng(dataUrlToBytes(dataUrl));

      // 3) Overlay it at the placeholder position.
      //    The text is RTL-anchored at the right edge of the field,
      //    so position the image so its right edge aligns with (x+w).
      const targetH = ph.fontSize * 1.05;
      const targetW = w * (targetH / h);
      page.drawImage(png, {
        x:      ph.x + ph.w - targetW,
        y:      ph.y - 1,
        width:  targetW,
        height: targetH,
      });
    }

    const out = await pdfDoc.save();
    return new Blob([out], { type: 'application/pdf' });
  }

  // ---- Public: load template + fill + return PDF Blob ---------
  async function buildFilledPdf(svc, formValues) {
    const url = `forms_pdf/${svc.code}.pdf`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`قالب PDF غير موجود: ${svc.code}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    return await fillPdfTemplate(bytes, formValues);
  }

  // ---- Public: print a PDF Blob via a hidden iframe -----------
  function printPdfBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const old = document.getElementById('tq-pdf-print-frame');
      if (old) old.remove();
      const frame = document.createElement('iframe');
      frame.id  = 'tq-pdf-print-frame';
      frame.src = url;
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
        setTimeout(() => {
          try {
            frame.contentWindow.focus();
            frame.contentWindow.print();
            try { frame.contentWindow.addEventListener('afterprint', cleanup); } catch {}
            setTimeout(cleanup, 90000);
            resolve();
          } catch (e) { cleanup(); reject(e); }
        }, 350);
      };
      frame.addEventListener('load', doPrint);
      setTimeout(doPrint, 2500);
    });
  }

  window.TadfuqPdfFill = { buildFilledPdf, printPdfBlob, extractPlaceholders };
})();
