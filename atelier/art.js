/* ===========================================================================
   atelier/art.js — illustration system (design.md §7)
   Three deliberate tiers, each section-hued via currentColor (= --at-sec),
   built as pure inline SVG — zero external assets, zero rainbow.
     · spot3d(icon)  — soft glossy 3D spot (hero / featured "lit window")
     · lineMesh(icon)— monoline glyph over a faint section mesh (grid cards)
     · iso(kind)     — light isometric scene (empty states / section landings)
   Returns DOM elements. Exposed as window.AtelierArt.
   =========================================================================== */
(function () {
  "use strict";
  var uid = 0;
  function node(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  // ── 3D spot — a glossy section-hued squircle with a white glyph on top ──
  function spot3d(icon, opts) {
    opts = opts || {};
    var id = "sg" + (++uid);
    var size = opts.size || 64;
    var wrap = node(
      '<span class="at-spot' + (opts.lg ? " at-spot--lg" : "") + '" style="inline-size:' + size + 'px;block-size:' + size + 'px" aria-hidden="true">' +
      '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
        '<defs>' +
          '<radialGradient id="' + id + '" cx="34%" cy="26%" r="86%">' +
            '<stop offset="0%" stop-color="#ffffff" stop-opacity=".60"/>' +
            '<stop offset="34%" stop-color="currentColor" stop-opacity=".92"/>' +
            '<stop offset="100%" stop-color="currentColor" stop-opacity=".58"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<rect x="12" y="12" width="76" height="76" rx="26" fill="url(#' + id + ')"/>' +
        '<ellipse cx="37" cy="30" rx="21" ry="12" fill="#ffffff" opacity=".26"/>' +
        '<rect x="12" y="12" width="76" height="76" rx="26" fill="none" stroke="#ffffff" stroke-opacity=".30" stroke-width="1"/>' +
      '</svg>' +
      '<span class="ms" style="font-size:' + Math.round(size * 0.44) + 'px">' + icon + '</span>' +
      '</span>'
    );
    return wrap;
  }

  // ── line + mesh — faint radial section wash + dotted grid + monoline glyph ──
  function lineMesh(icon) {
    var id = "mg" + (++uid);
    return node(
      '<span class="at-mesh" aria-hidden="true">' +
      '<svg viewBox="0 0 240 130" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">' +
        '<defs>' +
          '<radialGradient id="' + id + '" cx="82%" cy="6%" r="78%">' +
            '<stop offset="0%" stop-color="currentColor" stop-opacity=".14"/>' +
            '<stop offset="70%" stop-color="currentColor" stop-opacity=".03"/>' +
            '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
          '</radialGradient>' +
          '<pattern id="' + id + 'd" width="16" height="16" patternUnits="userSpaceOnUse">' +
            '<circle cx="1.4" cy="1.4" r="1.4" fill="currentColor" opacity=".09"/>' +
          '</pattern>' +
        '</defs>' +
        '<rect width="240" height="130" fill="url(#' + id + 'd)"/>' +
        '<rect width="240" height="130" fill="url(#' + id + ')"/>' +
      '</svg>' +
      '<span class="ms">' + icon + '</span>' +
      '</span>'
    );
  }

  // ── isometric — calm stacked-plane scene in section hue + neutrals ──
  function iso(kind) {
    var glyph = ({
      empty: '<path d="M70 86 L110 64" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>',
      search: '<circle cx="96" cy="52" r="11" fill="none" stroke="currentColor" stroke-width="3" opacity=".7"/><path d="M104 60 l9 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".7"/>',
    })[kind || "empty"] || "";
    return node(
      '<span class="at-iso" aria-hidden="true">' +
      '<svg viewBox="0 0 180 140" width="180" height="140">' +
        // three stacked iso slabs (top diamonds + side faces)
        '<g opacity=".9">' +
          '<path d="M90 96 L150 124 L90 152 L30 124 Z" fill="currentColor" opacity=".12"/>' +
          '<path d="M90 70 L150 98 L150 110 L90 138 L30 110 L30 98 Z" fill="currentColor" opacity=".22"/>' +
          '<path d="M90 70 L150 98 L90 126 L30 98 Z" fill="currentColor" opacity=".5"/>' +
          '<path d="M90 44 L150 72 L90 100 L30 72 Z" fill="currentColor" opacity=".85"/>' +
          '<path d="M90 44 L150 72 L90 100 L30 72 Z" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="1"/>' +
        '</g>' +
        glyph +
      '</svg>' +
      '</span>'
    );
  }

  window.AtelierArt = { spot3d: spot3d, lineMesh: lineMesh, iso: iso };
})();
