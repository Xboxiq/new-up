// =============================================================
// TRENDS 2026 — ambient layer bootstrap (additive, framework-free)
// =============================================================
(function () {
  'use strict';

  // ---------- aurora + grain layers ----------
  function mountAmbient() {
    if (document.querySelector('.trend-aurora')) return;
    const a = document.createElement('div');
    a.className = 'trend-aurora';
    a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(a);

    const g = document.createElement('div');
    g.className = 'trend-grain';
    g.setAttribute('aria-hidden', 'true');
    document.body.append(g);
  }

  // ---------- cursor glow on cards ----------
  const GLOW_SEL = '.f-deck__panel, .fs-card, .f-stat, .fg-card, .f-exp, .f-ticker, .fd-hero, .hub-pass.is-front';
  function glowify(root) {
    root.querySelectorAll(GLOW_SEL).forEach((el) => {
      if (el.querySelector(':scope > .trend-glow')) return;
      el.classList.add('trend-host');
      const glow = document.createElement('span');
      glow.className = 'trend-glow';
      glow.setAttribute('aria-hidden', 'true');
      el.prepend(glow);
    });
  }
  document.addEventListener('pointermove', (e) => {
    const host = e.target.closest && e.target.closest('.trend-host');
    if (!host) return;
    const r = host.getBoundingClientRect();
    host.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    host.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });

  // ---------- scroll reveal ----------
  const seen = new WeakSet();
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('trend-in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 }) : null;

  function revealify() {
    if (!io) return;
    const page = document.querySelector('.f-page');
    if (!page) return;
    let i = 0;
    page.querySelectorAll(':scope > *, :scope > div > section').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add('trend-reveal');
      el.style.setProperty('--tr-d', Math.min(i * 60, 240) + 'ms');
      // already in view? reveal next frame so transition still plays
      requestAnimationFrame(() => requestAnimationFrame(() => io.observe(el)));
      i++;
    });
  }

  // ---------- top bar progressive glass ----------
  function watchScroll() {
    const onScroll = () => {
      const top = document.querySelector('.f-top');
      if (top) top.classList.toggle('trend-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- observe React re-renders ----------
  function start() {
    mountAmbient();
    watchScroll();
    const tick = () => { glowify(document); revealify(); };
    tick();
    const mo = new MutationObserver(() => {
      clearTimeout(start._t);
      start._t = setTimeout(tick, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
