// =============================================================
// FINAL — File attachments + unified PDF export
// Lazy-loads pdf-lib from a CDN only when the user clicks "PDF موحّد".
// Falls back gracefully if the CDN is blocked.
// =============================================================

(function () {

const PDF_LIB_URL = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
let _pdfLibPromise = null;
function loadPdfLib() {
  if (window.PDFLib) return Promise.resolve(window.PDFLib);
  if (_pdfLibPromise) return _pdfLibPromise;
  _pdfLibPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PDF_LIB_URL;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve(window.PDFLib);
    s.onerror = () => reject(new Error('تعذّر تحميل مكتبة PDF — تحقق من الاتصال بالإنترنت'));
    document.head.appendChild(s);
  });
  return _pdfLibPromise;
}

// ---------- attachments storage ----------
// We keep attachments in-memory per form (not in localStorage — too heavy).
// Component holds the list; the export function gets them via props.
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// ---------- print form-only to PDF using browser print ----------
// (the user picks "Save as PDF" in the print dialog)
function printFormOnly() {
  window.print();
}

// ---------- unified PDF export ----------
// Composes a single PDF: page 1+ = form, page N+ = attachments.
//
// Strategy: capture the .of-paper element as an image (via html2canvas),
// embed as the first page(s); then append each attachment (PDFs merged,
// images embedded as full-page).
async function exportFormWithAttachments({ svc, schema, form, attachments, fileName }) {
  const toast = window.useToastGlobal && window.useToastGlobal();

  let pdfLib;
  try {
    pdfLib = await loadPdfLib();
    if (!window.html2canvas) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = () => reject(new Error('تعذّر تحميل html2canvas'));
        document.head.appendChild(s);
      });
    }
  } catch (e) {
    alert(e.message + '\nاستخدم زر "حفظ كـ PDF" (يطبع نسخة بدون المرفقات).');
    return;
  }

  const { PDFDocument, StandardFonts } = pdfLib;
  const outDoc = await PDFDocument.create();

  // ─── 1) capture the form sheet ────────────────────────────────
  const sheet = document.getElementById('of-print-root');
  if (!sheet) { alert('لا يمكن إيجاد ورقة النموذج'); return; }

  // Force a fresh paint, then snapshot at 2× for crisp text.
  await new Promise(r => requestAnimationFrame(r));
  const canvas = await window.html2canvas(sheet, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 794,
  });
  const formPng = canvas.toDataURL('image/png');
  const formBytes = await (await fetch(formPng)).arrayBuffer();
  const formImg = await outDoc.embedPng(formBytes);

  // A4 portrait: 595.28 × 841.89 pt
  const A4 = { w: 595.28, h: 841.89 };
  const ratio = formImg.width / formImg.height;
  // Fit-to-page (centered)
  const margin = 28;
  const maxW = A4.w - margin * 2;
  const maxH = A4.h - margin * 2;
  let drawW = maxW;
  let drawH = drawW / ratio;
  if (drawH > maxH) { drawH = maxH; drawW = drawH * ratio; }
  const drawX = (A4.w - drawW) / 2;
  const drawY = (A4.h - drawH) / 2;

  const page1 = outDoc.addPage([A4.w, A4.h]);
  page1.drawImage(formImg, { x: drawX, y: drawY, width: drawW, height: drawH });

  // ─── 2) append attachments ───────────────────────────────────
  for (const att of (attachments || [])) {
    const buf = att._buf;  // pre-read ArrayBuffer
    if (!buf) continue;

    const mime = att.type;
    try {
      if (mime === 'application/pdf') {
        const srcDoc = await PDFDocument.load(buf);
        const pages = await outDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        pages.forEach(p => outDoc.addPage(p));
      } else if (mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/jpg') {
        const img = mime === 'image/png'
          ? await outDoc.embedPng(buf)
          : await outDoc.embedJpg(buf);
        const ir = img.width / img.height;
        let iw = maxW, ih = iw / ir;
        if (ih > maxH) { ih = maxH; iw = ih * ir; }
        const p = outDoc.addPage([A4.w, A4.h]);
        // header caption
        const font = await outDoc.embedFont(StandardFonts.HelveticaBold);
        p.drawText(att.name, { x: margin, y: A4.h - 22, size: 10, font });
        p.drawImage(img, {
          x: (A4.w - iw) / 2,
          y: (A4.h - ih) / 2,
          width: iw, height: ih,
        });
      }
    } catch (e) {
      console.error('Skipping attachment:', att.name, e);
    }
  }

  const bytes = await outDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url, download: (fileName || 'application') + '.pdf',
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

window.printFormOnly = printFormOnly;
window.exportFormWithAttachments = exportFormWithAttachments;
window.readFileAsArrayBuffer = readFileAsArrayBuffer;
window.readFileAsDataURL = readFileAsDataURL;

})();
