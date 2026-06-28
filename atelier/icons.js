/* ===========================================================================
   atelier/icons.js — bespoke monoline icons for the domain (design.md §7)
   Custom-drawn for electricity / civic subscriber-services — not a generic
   icon font. 24×24, stroke 1.5, currentColor (inherits --at-sec), round caps.
   Each shape carries pathLength="1" so it can "draw on" (stroke-dashoffset).
   Reduced-motion safe (the draw is disabled in system.css).
   Exposed as window.AtelierIcons.{has, svg, forService, forSection}.
   =========================================================================== */
(function () {
  "use strict";

  // inner markup per icon (paths use pathLength="1" for the draw animation)
  var P = {
    bolt:        '<path pathLength="1" d="M13 2.5 L5 13.5 H11 L10 21.5 L19 9.5 H13 Z"/>',
    newhome:     '<path pathLength="1" d="M4 11 L12 4 L20 11"/><path pathLength="1" d="M6 10 V20 H18 V10"/><path pathLength="1" d="M12 13.5 v4 M10 15.5 h4"/>',
    transfer:    '<path pathLength="1" d="M6.5 9.5 a5.5 5.5 0 0 1 10 -1.5"/><path pathLength="1" d="M16.5 4.5 v3.5 h-3.5"/><path pathLength="1" d="M17.5 14.5 a5.5 5.5 0 0 1 -10 1.5"/><path pathLength="1" d="M7.5 19.5 v-3.5 h3.5"/>',
    meter:       '<circle pathLength="1" cx="12" cy="12" r="8"/><path pathLength="1" d="M12 12 L15.5 8.5"/><path pathLength="1" d="M12 4 v1.5 M20 12 h-1.5 M4 12 h1.5 M12 20 v-1.5"/>',
    transformer: '<rect pathLength="1" x="3" y="8" width="18" height="9" rx="2"/><path pathLength="1" d="M8 8 V5 M16 8 V5"/><path pathLength="1" d="M8.5 11 h7 M8.5 14 h7"/>',
    pole:        '<path pathLength="1" d="M12 3 V21"/><path pathLength="1" d="M6 7 H18"/><path pathLength="1" d="M8.5 7 V5 M15.5 7 V5"/><path pathLength="1" d="M9 21 H15"/>',
    cable:       '<path pathLength="1" d="M3 12 q3 -5 6 0 t6 0"/><path pathLength="1" d="M15 12 h4"/><path pathLength="1" d="M19 9.5 v5"/>',
    receipt:     '<path pathLength="1" d="M6 3 H18 V21 l-2 -1.5 -2 1.5 -2 -1.5 -2 1.5 -2 -1.5 -2 1.5 Z"/><path pathLength="1" d="M9 8 H15 M9 12 H14"/>',
    payment:     '<rect pathLength="1" x="3" y="7" width="18" height="10" rx="2"/><circle pathLength="1" cx="12" cy="12" r="2.4"/><path pathLength="1" d="M6 10 v4 M18 10 v4"/>',
    inspect:     '<circle pathLength="1" cx="11" cy="11" r="6"/><path pathLength="1" d="M15.5 15.5 L20 20"/><path pathLength="1" d="M11 11 L13 8.5"/>',
    hazard:      '<path pathLength="1" d="M12 4 L21 19 H3 Z"/><path pathLength="1" d="M12 10 l-1.6 3 h3.2 L12 16"/>',
    complaint:   '<path pathLength="1" d="M5 6 H19 V16 H10 l-4 3 V16 H5 Z"/><path pathLength="1" d="M12 9 v3 M12 14 v0.5"/>',
    shield:      '<path pathLength="1" d="M12 3 L19 6 V11 c0 5 -3.5 8 -7 10 c-3.5 -2 -7 -5 -7 -10 V6 Z"/><path pathLength="1" d="M9 12 l2 2 4 -4"/>',
    seal:        '<circle pathLength="1" cx="12" cy="9" r="5"/><path pathLength="1" d="M10 9 l1.5 1.5 L15 7"/><path pathLength="1" d="M9 13 L8 21 l4 -2 4 2 -1 -8"/>',
    power:       '<path pathLength="1" d="M12 3 V12"/><path pathLength="1" d="M6.5 7 a8 8 0 1 0 11 0"/>',
  };

  // service-code → bespoke icon (falls back to section)
  var MAP_SVC = {
    CS0001: "newhome", CS0011: "transfer", CS0004: "power", CS0005: "power", CS0009: "meter",
    CT0009: "inspect", CT0001: "pole", CT0002: "transformer", CT0003: "cable", CT0007: "meter",
    CB0001: "payment", CB0006: "receipt", CB0004: "receipt", CB0002: "receipt",
    CA0001: "shield", CA0002: "hazard", CA0003: "transformer", CA0004: "complaint",
  };
  var MAP_SEC = { CS: "newhome", CT: "transformer", CB: "receipt", CA: "shield" };

  function has(name) { return !!P[name]; }
  function svg(name, opts) {
    opts = opts || {};
    if (!P[name]) return null;
    var size = opts.size || 24;
    var cls = "at-icon" + (opts.draw ? " at-icon--draw" : "") + (opts.glyph ? " at-icon--glyph" : "");
    var t = document.createElement("template");
    t.innerHTML = '<svg class="' + cls + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">' + P[name] + "</svg>";
    return t.content.firstElementChild;
  }
  function forService(code) { return MAP_SVC[code] || MAP_SEC[String(code || "").slice(0, 2)] || null; }
  function forSection(sec) { return MAP_SEC[sec] || null; }

  window.AtelierIcons = { has: has, svg: svg, forService: forService, forSection: forSection };
})();
