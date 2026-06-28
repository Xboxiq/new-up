# Backgrounds — adapted from backgrounds.supply / grainient.supply

The supply offers: grainy gradients, mesh gradients, slow animated gradients, and shader
backgrounds. The premium signal is GRAIN (film noise) over a soft tint — it kills the
flat "default div" look and hides banding.

## 1 · Grain / noise overlay (the highest-value, lowest-risk move)
A fixed SVG-noise layer at very low opacity over the whole canvas.
```css
.fx-grain::after {
  content: "";
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none;
  opacity: 0.035;                 /* light mode */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.f-body.dark .fx-grain::after { opacity: 0.05; }
```

## 2 · Mesh tint (ultra-faint, brand hues)
Two-to-three radial pools in brand/dept colors at < 8% — the repo already does a version
of this on `.f-body::before`. Keep total tint barely perceptible; it is atmosphere, not
decoration.
```css
.fx-mesh {
  background-image:
    radial-gradient(48% 40% at 84% -8%, color-mix(in srgb, var(--f-cs) 7%, transparent), transparent 70%),
    radial-gradient(42% 36% at 6% 110%, color-mix(in srgb, var(--f-gold) 5%, transparent), transparent 70%);
}
```

## 3 · Slow animated gradient (use only on auth / empty hero, never on data)
Animate `background-position`, 18–30s, linear, respect reduced-motion.
```css
@keyframes fx-drift { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }
.fx-drift {
  background: linear-gradient(120deg,
    color-mix(in srgb, var(--f-navy) 10%, var(--f-bg)),
    color-mix(in srgb, var(--f-cs) 8%, var(--f-bg)),
    var(--f-bg));
  background-size: 200% 200%;
  animation: fx-drift 24s linear infinite alternate;
}
@media (prefers-reduced-motion: reduce){ .fx-drift{ animation:none } }
```

## Do / Don't
- DO: grain everywhere (it is invisible-but-felt); mesh as faint atmosphere.
- DON'T: animated gradients behind tables/forms; saturated full-screen color; banding.
- Grain opacity ceiling: 0.05 light / 0.07 dark. Above that it looks dirty.
