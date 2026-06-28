# Liquid Glass — adapted from liquidglass-oss + Apple WWDC25 technique

Apple's Liquid Glass = curved, refractive glass. On the web it is approximated with
`backdrop-filter` (blur + saturate) PLUS an SVG `feDisplacementMap` for real refraction,
plus a specular highlight on the top edge. Pure CSS/SVG, no WebGL.

## Layers of the effect
1. Translucent fill (legible base) — `background: color-mix(in srgb, var(--f-surface) 72%, transparent)`.
2. `backdrop-filter: blur(18px) saturate(140%)` — frosts what's behind.
3. SVG displacement filter — bends the backdrop at the edges (the "liquid" part).
4. Specular: `inset 0 1px 0 rgba(255,255,255,.6)` top edge + soft outer shadow.
5. Hairline border via `--f-border` so the panel reads in light mode.

## Live SVG filter (inject once into the DOM)
```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="fx-glass" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012"
                  numOctaves="2" seed="7" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="2" result="soft"/>
    <feDisplacementMap in="SourceGraphic" in2="soft" scale="14"
                       xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
```

## Brand-adapted glass surface
```css
.fx-glass {
  position: relative;
  background: color-mix(in srgb, var(--f-surface) 72%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid color-mix(in srgb, var(--f-border-2) 70%, transparent);
  box-shadow: var(--f-shadow), inset 0 1px 0 rgba(255,255,255,0.6);
}
.f-body.dark .fx-glass {
  background: color-mix(in srgb, var(--f-surface) 64%, transparent);
  box-shadow: var(--f-shadow), inset 0 1px 0 rgba(255,255,255,0.06);
}
/* Apply refraction only where a backdrop exists and motion is OK.
   Displacement on backdrop-filter is experimental; gate it. */
@supports (backdrop-filter: blur(1px)) {
  .fx-glass--refract { filter: url(#fx-glass); }
}
```

## §Live (this repo)
Use on the sticky top bar and on modal/receipt sheets ONLY. The existing `.f-top`
already blurs; the adapted version adds the specular edge + slightly higher opacity so
it stays legible on the warm `--f-bg`. Never apply refraction to text containers — it
smears glyphs. Keep `scale` ≤ 16.

## Do / Don't
- DO: glass on chrome (top bar, modals, receipt). Keep fills ≥ 64–72% opaque.
- DON'T: glass on data tables, forms, or anything with small text. No `white/10` fills.
- Firefox lacks displacement on backdrop — the `@supports` + plain blur is the fallback.
