// =============================================================
// FINAL — File-reading helpers for attachments (per-doc + general)
// Used by the inline "attach next to each document" UI.
// =============================================================

(function () {
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
  window.readFileAsArrayBuffer = readFileAsArrayBuffer;
  window.readFileAsDataURL = readFileAsDataURL;
})();
