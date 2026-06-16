// =============================================================
// TADFUQ DS — custom icon set (drawn for the brand, not stock)
// 24×24, stroke 1.75, round caps — electricity service language
// Usage: <svg class="ds-ico"><use href="#tdq-meter"/></svg>
// or JS: TadfuqIcons.mount() injects the sprite once per page.
// =============================================================
(function () {
  'use strict';

  const ICONS = {
    // ---- departments ----
    'tdq-subscriptions': '<path d="M4 20V8.5L12 3l8 5.5V20"/><path d="M4 20h16"/><path d="M10 20v-5a2 2 0 0 1 4 0v5"/><path d="M12 8.8v2.4M10.8 10h2.4"/>',
    'tdq-technical': '<path d="M13 2 6 13h5l-1 9 8-12h-5l1-8z"/>',
    'tdq-billing': '<path d="M6 2.8h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9.5 8h5M9.5 11.5h5M9.5 15h3"/>',
    'tdq-reports': '<path d="M12 3 2.8 19.2h18.4z"/><path d="M12 9.5v4M12 16.4v.2"/>',

    // ---- service objects ----
    'tdq-meter': '<rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M8 9h8"/><circle cx="12" cy="14.4" r="2.6"/><path d="M12 14.4l1.7-1.7"/>',
    'tdq-pole': '<path d="M12 4v17"/><path d="M5 7h14M7 4.4 5 7m12-2.6L19 7"/><path d="M8.5 7c0 2 1.4 3 3.5 3s3.5-1 3.5-3"/>',
    'tdq-cable': '<path d="M3 18c4 0 4-12 9-12s5 12 9 12"/><circle cx="3" cy="18" r="1.4"/><circle cx="21" cy="18" r="1.4"/>',
    'tdq-plug': '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5V21"/>',
    'tdq-tower': '<path d="M9 21 12 3l3 18"/><path d="M7.6 13h8.8M9 8.2h6"/><path d="M9 21l6-8M15 21l-6-8"/><path d="M6.5 21h11"/>',
    'tdq-gauge-max': '<path d="M4 16a8 8 0 0 1 16 0"/><path d="M12 16l4.2-4.6"/><path d="M4 19.5h16"/>',

    // ---- workflow ----
    'tdq-form': '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 11h6M9 14.5h6M9 18h3.5"/>',
    'tdq-stamp': '<path d="M9.5 10.5 8.8 6a3.2 3.2 0 1 1 6.4 0l-.7 4.5"/><path d="M6 14a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.5H6z"/><path d="M5 20h14"/>',
    'tdq-fees': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v9.6M15 9.2c-.6-1-1.7-1.5-3-1.5-1.8 0-3 .9-3 2.2 0 2.9 6 1.5 6 4.3 0 1.3-1.2 2.2-3 2.2-1.3 0-2.4-.5-3-1.5"/>',
    'tdq-case': '<path d="M4 12h4l2 3h4l2-3h4"/><path d="M4 12v7h16v-7"/><path d="M7 12 9 5h6l2 7"/>',
    'tdq-add-service': '<rect x="3.5" y="3.5" width="7.4" height="7.4" rx="2"/><rect x="13.1" y="3.5" width="7.4" height="7.4" rx="2"/><rect x="3.5" y="13.1" width="7.4" height="7.4" rx="2"/><path d="M16.8 13.5v6.6M13.5 16.8h6.6"/>',
    'tdq-guide': '<path d="M12 5.5C10.5 4 8.4 3.4 5.5 3.4c-.8 0-1.5.1-2.2.3v14.6c.7-.2 1.4-.3 2.2-.3 2.9 0 5 .7 6.5 2.1 1.5-1.4 3.6-2.1 6.5-2.1.8 0 1.5.1 2.2.3V3.7c-.7-.2-1.4-.3-2.2-.3-2.9 0-5 .6-6.5 2.1z"/><path d="M12 5.5v14.6"/>',
  };

  function mount() {
    if (document.getElementById('tdq-sprite')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'tdq-sprite';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML = Object.entries(ICONS).map(([id, body]) =>
      `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`
    ).join('');
    document.body.prepend(svg);
  }

  function el(name, size) {
    const s = size || 20;
    const w = document.createElement('span');
    w.innerHTML = `<svg class="ds-ico" width="${s}" height="${s}"><use href="#${name}"/></svg>`;
    return w.firstChild;
  }

  window.TadfuqIcons = { ICONS, mount, el, names: Object.keys(ICONS) };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
