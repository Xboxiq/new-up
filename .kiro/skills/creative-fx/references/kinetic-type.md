# Kinetic Typography — adapted from kinetics.colorion.co

Kinetic type = text brought to life through motion (Greek *kinesis*). The generator's
core moves: per-letter/word stagger, weight & scale pulse, sinusoidal wave, reveal.

## Principle extracted
Animate the ENTRANCE of a headline once, then leave it still. Continuous looping text
is distracting in a work app. Stagger creates a sense of the words "arriving".

## Brand-adapted snippet (masthead word-stagger)
Wrap each word in a span; animate transform + opacity only.

```css
/* entrance only — runs once, calm ease-out, no overshoot */
@keyframes fx-word-in {
  from { opacity: 0; transform: translateY(0.5em); }
  to   { opacity: 1; transform: none; }
}
.fx-kin > span {
  display: inline-block;
  opacity: 0;
  animation: fx-word-in var(--f-dur-enter) var(--f-ease-entrance) forwards;
}
.fx-kin > span:nth-child(1) { animation-delay: 40ms; }
.fx-kin > span:nth-child(2) { animation-delay: 110ms; }
.fx-kin > span:nth-child(3) { animation-delay: 180ms; }
.fx-kin > span:nth-child(n+4){ animation-delay: 250ms; }

@media (prefers-reduced-motion: reduce) {
  .fx-kin > span { opacity: 1; animation: none; }
}
```

Minimal JS to split a heading into words (no library):
```js
document.querySelectorAll('[data-kin]').forEach(el => {
  el.classList.add('fx-kin');
  el.innerHTML = el.textContent.trim().split(/\s+/)
    .map(w => `<span>${w}</span>`).join(' ');
});
```

## Other moves (use rarely)
- Weight pulse: animate `font-variation-settings:'wght'` on a single hero word (variable font).
- Scale-accent: a number counting up uses opacity+transform, never layout.

## Do / Don't
- DO: one masthead entrance per page; honor reduced-motion.
- DON'T: loop, glitch/RGB-split, or animate body copy. No infinite motion in a dashboard.
