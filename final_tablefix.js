/* =============================================================
   Mobile-table a11y enhancer
   Makes every .adm-tbl-wrap an accessible, keyboard-scrollable
   region — for current AND future admin tables (MutationObserver).
   Pairs with the scroll-container CSS in final_compose2.css.
   ============================================================= */
(function () {
  "use strict";

  function labelFor(wrap) {
    var scope = wrap.closest(".adm-main") || document;
    var h = scope.querySelector(".adm-head__title");
    var base = "جدول";
    if (h) {
      var clone = h.cloneNode(true);
      clone.querySelectorAll(".material-symbols-outlined").forEach(function (i) { i.remove(); });
      base = clone.textContent.trim() || base;
    }
    return base + " — جدول قابل للتمرير أفقياً";
  }

  function enhance(wrap) {
    if (wrap.dataset.tblEnhanced) return;
    wrap.dataset.tblEnhanced = "1";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", labelFor(wrap));
    // Only make it a tab stop when it actually overflows (no empty stop otherwise).
    var sync = function () {
      var scrollable = wrap.scrollWidth > wrap.clientWidth + 1;
      if (scrollable) wrap.setAttribute("tabindex", "0");
      else wrap.removeAttribute("tabindex");
    };
    sync();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(sync);
      ro.observe(wrap);
    } else {
      window.addEventListener("resize", sync);
    }
  }

  function scan(root) {
    (root || document).querySelectorAll(".adm-tbl-wrap").forEach(enhance);
  }

  function start() {
    scan();
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches(".adm-tbl-wrap")) enhance(n);
          if (n.querySelectorAll) scan(n);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
