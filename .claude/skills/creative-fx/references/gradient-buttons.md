# Gradient Buttons — adapted from gradientbuttons.colorion.co

The gallery's value: tonal-gradient fills, animated background-position shift on hover,
and gradient-border (ring) treatments. Gradients add depth and pull the eye to the CTA.

## The trap
Most gallery buttons use AI-purple/indigo and rainbow shifts → instant slop here.
We use BRAND TONAL gradients only, on the PRIMARY CTA only.

## Brand-adapted primary CTA (tonal navy, hover shift)
```css
.f-btn--primary.fx-grad {
  background-image: linear-gradient(135deg,
    var(--f-navy) 0%,
    var(--f-navy-soft) 55%,
    color-mix(in srgb, var(--f-navy-soft) 80%, var(--f-cs)) 100%);
  background-size: 160% 160%;
  background-position: 0% 50%;
  border-color: var(--f-navy);
  transition: background-position var(--f-dur-enter) var(--f-ease-standard),
              transform var(--f-dur-micro) var(--f-ease-standard),
              box-shadow var(--f-dur-micro) var(--f-ease-standard);
}
.f-btn--primary.fx-grad:hover {
  background-position: 100% 50%;          /* shift, not a hue change */
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -10px color-mix(in srgb, var(--f-navy) 55%, transparent);
}
```

## Gradient-border (ceremonial, gold) — receipt / VIP only
```css
.fx-ring-gold {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--f-surface), var(--f-surface)) padding-box,
    linear-gradient(135deg,
      color-mix(in srgb, var(--f-gold) 70%, transparent),
      color-mix(in srgb, var(--f-gold-soft) 60%, transparent)) border-box;
}
```

## Variants worth keeping (all brand-tonal)
- Crimson tonal: `--f-crimson → --f-crimson-soft` — destructive/urgent CTA only.
- Dept tonal: `--d-c → color-mix(--d-c 70% white)` — a department's own action.

## Do / Don't
- DO: one gradient CTA per view; animate position, not hue.
- DON'T: gradient on secondary/ghost buttons, gradient text, or purple anything.
- Keep label contrast ≥ 4.5:1 against the DARKEST gradient stop.
