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

## GSAP Flip (filterable grids)

`js/grid-filter.js` animates list changes with Flip. The rules it follows apply to any Flip use:

1. **Reduced motion first.** `matchMedia('(prefers-reduced-motion: reduce)').matches` → call the change directly and return. No tween, no fade.
2. One entry point: `update(change)`. Inside it: `Flip.killFlipsOf(items)`, `Flip.getState(items)`, run `change()`, then in `$nextTick` call `Flip.from(state, { absolute: true, onEnter, onLeave })` so Alpine has applied the DOM changes first.
3. Hide with the `hidden` attribute (`:hidden="…"` plus `.item[hidden] { display: none }`), not `x-show`.
4. `absolute: true` takes items out of flow, so the grid collapses and content below jumps. Record `grid.offsetHeight` before the change, measure the new height after it, then `gsap.set(grid, { height: from })` and `gsap.to(grid, { height: to, clearProps: 'height' })` with the same duration and ease as the Flip.
5. Durations come from the `--duration-*` tokens (read with `getComputedStyle`), not literals.
6. Known limit: fire updates one event at a time (clicks, keystrokes). Two `update()` calls in the same tick can leave items mid-flip.

## Decorative SVG lines

Do not draw a line with `stroke-dashoffset` + `pathLength` when the path also has `vector-effect: non-scaling-stroke`: dash lengths are then measured in **screen pixels**, not path units, so the draw pops instead of animating. Reveal the whole `<svg>` left to right with a `clip-path: inset()` tween instead. `Motion.sweep(svg, { duration, delay })` in `js/motion-shared.js` does this (Web Animations API, `--duration-*` tokens, RTL aware) and does nothing under `reduce`, so the line is simply visible.

## Counters and reveals that run once

Use an `IntersectionObserver` (`Motion.once(element, callback)`), not ScrollTrigger `once`. After a reload the browser restores the scroll position: the observer reports elements already on screen immediately and elements **above** the viewport as `boundingClientRect.bottom < 0`, so the callback still fires. Under `reduce` call back anyway and show the final value.

## Loading states

Skeletons, the loading shell and the entrance animation of JS-rendered pages: [js-rendered-pages.md](js-rendered-pages.md). Entrances are CSS **animations**, not transitions, and cross-document View Transitions are a trap there.

## Content rules

- Video/animated backgrounds: don't autoplay under `reduce`; show a still poster. Provide pause/stop for any motion lasting more than 5 seconds, regardless of preference.
- Carousels: no auto-advance under `reduce`; always provide previous/next and pause controls.
- Nothing flashes more than 3 times per second.
- Don't use motion as the only way to convey information or state.

## Testing

- Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"; or macOS Settings → Accessibility → Display → Reduce motion.
- Confirm: nothing slides, bounces, parallaxes or auto-plays; the page remains fully usable and identical in content.
- Test motion in a real, visible browser window: a hidden preview pane freezes CSS animations and `requestAnimationFrame` (docs/workflows.md).
- `node tools/check.mjs` flags `@keyframes`/`animation` outside a `no-preference` block and smooth scrolling that isn't gated.
