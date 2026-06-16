// =============================================================
// FINAL 3D — pointer tilt + scroll reveal engine (vanilla)
// Works on top of the React app via event delegation, so it
// survives route changes without touching component code.
// =============================================================
(function () {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = window.matchMedia('(hover: none)').matches;

  // ---------- ambient orbs ----------
  ['a', 'b'].forEach(k => {
    const orb = document.createElement('div');
    orb.className = 'f3d-orb f3d-orb--' + k;
    document.body.appendChild(orb);
  });

  if (REDUCED) return; // scene only, no interactive motion

  // ---------- tiltable selectors ----------
  const TILT_SEL = [
    '.f-deck__panel', '.fs-card', '.f-exp', '.f-spot',
    '.fd-hero', '.ff-feepanel', '.fg-card', '.f-stat',
  ].join(',');

  const MAX = 5; // degrees

  let current = null;

  function applyTilt(el, e) {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', ((px - 0.5) * -2 * MAX).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((py - 0.5) * 2 * MAX).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  }

  function clearTilt(el) {
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  if (!TOUCH) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest && e.target.closest(TILT_SEL);
      if (el !== current) {
        if (current) clearTilt(current);
        current = el;
        if (el) {
          el.setAttribute('data-f3d-tilt', '');
          el.classList.add('is-tilting');
        }
      }
      if (el) applyTilt(el, e);
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      if (current) { clearTilt(current); current = null; }
    });
  }

  // mark all tiltables (so base transform applies even before hover)
  function markTiltables(root) {
    root.querySelectorAll && root.querySelectorAll(TILT_SEL).forEach(el => {
      el.setAttribute('data-f3d-tilt', '');
    });
  }

  // ---------- scroll reveal ----------
  const REVEAL_SEL = '.f-card, .f-deck, .f-ticker, .f-spot, .f-two, .fs-grid, .fd-steps';
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('f3d-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

  function observeReveals(root) {
    root.querySelectorAll && root.querySelectorAll(REVEAL_SEL).forEach(el => {
      if (el.classList.contains('f3d-reveal')) return;
      // skip elements already in view at page load top (avoid blank flash)
      el.classList.add('f3d-reveal');
      io.observe(el);
    });
  }

  // ---------- watch React re-renders ----------
  const root = document.getElementById('root');
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        markTiltables(n);
        observeReveals(n);
        if (n.matches && n.matches(REVEAL_SEL)) { n.classList.add('f3d-reveal'); io.observe(n); }
        if (n.matches && n.matches(TILT_SEL)) n.setAttribute('data-f3d-tilt', '');
      });
    }
  });
  mo.observe(root, { childList: true, subtree: true });

  // initial pass (in case app already mounted)
  const boot = () => { markTiltables(document); observeReveals(document); };
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
  setTimeout(boot, 800);
})();
