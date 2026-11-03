# Motion & `prefers-reduced-motion`

Some users get nausea, dizziness or distraction from motion and have asked their OS to reduce it. Honouring that is mandatory at every level: CSS, JavaScript, third-party libraries and content.

## The rule: movement is opt-in

Anything that **moves, scales, rotates, parallaxes, scrolls on its own, auto-plays or loops** only exists inside:

```css
@media (prefers-reduced-motion: no-preference) {
  .thing { animation: thing-in var(--duration-base) var(--ease-out); }
  @keyframes thing-in { from { opacity: 0; translate: 0 var(--space-s); } }
}
```

Without the media query's match (i.e. `reduce`), the element is simply in its final state. Fades of opacity or colour changes are acceptable; they don't trigger vestibular issues.

## CSS patterns

- Animations, large `transform`/`translate`/`scale`, `scroll-behavior: smooth`, scroll-driven animations, view transitions, parallax, auto-scrolling marquees: all inside the `no-preference` query. Keyframes may be defined inside it too.
- Small hover/focus transitions (colour, background, border, shadow, opacity) can use `var(--transition)`. `base.css` shortens all transitions under `reduce` as a safety net.
- Prefer tokens: `--duration-fast/base/slow`, `--ease-out`, `--ease-in-out`, `--transition`.
- Never rely on the safety net as the design. Write the gated version.
- Each component header states its reduced-motion behaviour when it moves.

## JavaScript patterns

Check before every scripted motion:

```html
<button @click="$reducedMotion() ? el.scrollIntoView() : el.scrollIntoView({ behavior: 'smooth' })">
```
```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduce.matches) startAnimation();
reduce.addEventListener('change', (e) => e.matches && stopAnimation());
```

Covers: `scrollTo`/`scrollIntoView` behaviour, Web Animations API, GSAP/other libraries (`gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` condition), carousels/sliders, parallax, counters, typed text, canvas/WebGL, Lottie, video/GIF autoplay. Listen for the `change` event: the preference can change while the page is open.

## Content rules

- Video/animated backgrounds: don't autoplay under `reduce`; show a still poster. Provide pause/stop for any motion lasting more than 5 seconds, regardless of preference.
- Carousels: no auto-advance under `reduce`; always provide previous/next and pause controls.
- Nothing flashes more than 3 times per second.
- Don't use motion as the only way to convey information or state.

## Testing

- Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"; or macOS Settings → Accessibility → Display → Reduce motion.
- Confirm: nothing slides, bounces, parallaxes or auto-plays; the page remains fully usable and identical in content.
- `node tools/check.mjs` flags `@keyframes`/`animation` outside a `no-preference` block and smooth scrolling that isn't gated.
