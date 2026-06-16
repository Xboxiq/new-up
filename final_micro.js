// =============================================================
// MICRO-MOTION ENGINE — pointer-aware tilt + glare
// Sets --mx/--my (-1..1 from center) and --gx/--gy (% position)
// on hovered cards. Pure vanilla; respects reduced motion.
// =============================================================
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var SEL = '.hub-pass__card, .hub-stack__card, .f-deck__panel';
  var current = null;

  function reset(el) {
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  }

  document.addEventListener('pointermove', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (current && current !== el) reset(current);
    current = el;
    if (!el) return;
    var r = el.getBoundingClientRect();
    if (r.width < 10) return;
    var mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    var my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
    el.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    el.classList.add('is-tilting');
  }, { passive: true });

  document.addEventListener('pointerleave', function () { reset(current); current = null; });
  document.addEventListener('scroll', function () { reset(current); current = null; }, { passive: true, capture: true });
})();
