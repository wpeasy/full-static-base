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

## GSAP effects: use the effects library first

Before writing any GSAP animation, look for a ready-made effect in the **GSAP Prompt Library**, <https://gsap.brxprod.com/> (278 effects: text, UI, buttons, cards, boxes, overlays, forms, media, cursor, SVG, scroll, charts). Its effects already handle `prefers-reduced-motion`, keyboard focus, and decorative content for screen readers, and are very configurable, so **use one wherever one fits; write new or different code only when no effect does**.

The library is also published as plain text for agents. Start at `https://gsap.brxprod.com/llms.txt` (catalogue, conventions), search `https://gsap.brxprod.com/effects-index.json`, then read the one effect you need at `https://gsap.brxprod.com/effects/<id>.md` (for example `ui-01.md`; ids look like `T-10`, `UI-01`, `BTN-12`, `SCR-03`). Each file has the markup it expects, the CSS, a standalone vanilla-JS recipe, its options and the plugins it needs.

**Ignore everything specific to Bricks Builder.** This framework is plain HTML, so skip: the `body.bricks-is-frontend` prefix, the note about turning off builder inline editing, `window.__gsapRegisterInit` and the "bootstrap snippet from the Instructions tab", and the Bricks-scoped cloak selector (`html.gsap-cloaking body.bricks-is-frontend [data-gsap-cloak]`). Use the generic parts: the markup, the options, the init function, the CSS variables.

**Adapt an effect to this framework's rules** (AGENTS.md wins where they differ):

1. **No CDN.** Use the vendored GSAP and plugins in `js/vendor/` (docs/vendor.md); load only the plugins the effect lists, then `gsap.registerPlugin(...)` once. Never copy the `cdn.jsdelivr.net` tags.
2. **Own file, no inline script.** Save the recipe as `js/<effect-id>.js` (for example `js/ui-01.js`, or `js/effects.js` for a few small ones), loaded with `defer` before Alpine. Keep the effect's idempotency guard (`:not([data-gsap-init-<id>])`); it makes the init safe to call again after content is injected (call it after Alpine un-hides or renders a list, as in "Scroll-triggered reveals" above).
3. **Classes are BEM.** The recipe targets a placeholder class (`.selector-class`). Replace it with a real block or element class (`card`, `hero__title`), or better a `data-*` hook, never an ad-hoc class. Options are `data-<id>-<name>` attributes (lists separated by `|`); keep them.
4. **Tokens, not literals.** The effect's CSS uses `--gsap-*` custom properties with literal defaults. Point them at framework tokens in `theme.css` or the block (`--gsap-accent: var(--color-link)`; durations from `--duration-*`; radii, colours and shadows from tokens). Put the effect's CSS in the component's file or a new `css/components/` block, inside `@layer components`, and import it from `main.css`.
5. **Verify reduced motion yourself.** The library says its effects honour `prefers-reduced-motion: reduce` (via `gsap.matchMedia()` or a `matchMedia` check), but check each one you use: with `reduce` the content must be fully visible and static (an opacity or colour change is fine), no autoplay, no looping. If an effect misses this, fix it in your copy. Hidden start states must only be set by the script, so without JavaScript nothing is hidden; if an effect needs the `gsap-cloaking` snippet, load it from `js/` (not inline) and keep its 3-second fail-safe.
6. **Semantics and keyboard.** Keep real text in the DOM (split-text effects must leave the original text readable by assistive technology), give hover effects a keyboard-focus equivalent, and mark purely decorative parts `aria-hidden="true"`. Do not use an effect on an element GSAP Flip moves.
7. **Record it.** Note the effect id and the changes you made (for example `UI-01, tokens + BEM class`) in `DESIGN-NOTES.md`, and add new CSS to `components.html` / `COMPONENTS.md` as for any component.

`js/reveal.js` (`data-reveal`, `data-ken-burns`) is the base's own scroll-reveal pattern and the right default for fade-and-rise reveals. For anything else (text reveals, hover effects, buttons, counters, tilt, cursor and SVG effects) go to the library first.

## Decorative SVG lines

Do not draw a line with `stroke-dashoffset` + `pathLength` when the path also has `vector-effect: non-scaling-stroke`: dash lengths are then measured in **screen pixels**, not path units, so the draw pops instead of animating. Reveal the whole `<svg>` left to right with a `clip-path: inset()` tween instead. `Motion.sweep(svg, { duration, delay })` in `js/motion-shared.js` does this (Web Animations API, `--duration-*` tokens, RTL aware) and does nothing under `reduce`, so the line is simply visible.

## Counters and reveals that run once

Use an `IntersectionObserver` (`Motion.once(element, callback)`), not ScrollTrigger `once`. After a reload the browser restores the scroll position: the observer reports elements already on screen immediately and elements **above** the viewport as `boundingClientRect.bottom < 0`, so the callback still fires. Under `reduce` call back anyway and show the final value.

## Scroll-triggered reveals (`data-reveal`, `data-ken-burns`)

`js/reveal.js` (plain script; needs `gsap.min.js` and `ScrollTrigger.min.js` first, then Alpine last: docs/vendor.md) gives two attribute hooks:

- **`data-reveal`** on a heading block, card or grid wrapper: a **timed** tween (opacity 0→1, y 24px→0, 0.6s) that starts when the element's top edge is 80px inside the viewport bottom. It resets when the element leaves from either side, so it **replays** each time it comes back into view. Do not put it on elements GSAP Flip moves (the filter `li`); use an inner element or the grid wrapper.
- **`data-ken-burns`** on a hero: tweens the CSS variable `--hero-zoom` from 1 to 1.25 over 24s, linear, restarting each time the hero re-enters the viewport, then stops (no endless motion). The consumer CSS applies it, e.g. `transform: scale(var(--hero-zoom, 1))` on an art layer inside a hero with `overflow: hidden`.

```html
<section class="section"><div class="container stack" data-reveal>…</div></section>
<section class="hero" data-ken-burns>…</section>
```

**Reduced motion and no JavaScript.** Everything lives inside `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', …)`. With `reduce`, or without JavaScript or GSAP, nothing is hidden and nothing moves: the hidden start state is only ever set by the script.

**Why not CSS `animation-timeline: view()` for a quick reveal.** It is *scrubbed*: progress follows scroll position. A fade that should start only ~80px from the viewport bottom therefore reads as a plain fade with no visible movement. A timed tween fired by a trigger is what you want.

**`scroll-behavior: smooth` breaks ScrollTrigger.** ScrollTrigger measures every trigger by jumping to the top of the page. With `html { scroll-behavior: smooth }` (set in `base.css`) that jump is *animated*, so every trigger is measured at the wrong scroll offset. It is invisible on a normal load (scroll is 0) and shows up after Back/Forward or a reload, when the browser restores a scroll position: reveal elements stay at opacity 0 until a manual refresh (we measured a trigger that should start near 1900 reporting -890). The fix is in `reveal.js`: while it runs it sets `html.style.scrollBehavior = 'auto'` (restored when the media query stops matching) and gives in-page `#anchor` links the smooth glide itself with `scrollIntoView({ behavior: 'smooth' })` (`/index.html` and `/` count as the same page; modified clicks are ignored). The `base.css` rule stays for sites without ScrollTrigger. Any other script that uses ScrollTrigger must do the same.

**Refresh after layout changes.** A container that is `hidden` (or `display: none`) and later revealed by Alpine, such as a JSON-filled filter grid, is measured with zero size, so its triggers and the triggers of everything below it are wrong until `ScrollTrigger.refresh()` runs after it appears. Call `window.Reveal?.scan()` (picks up new `[data-reveal]` elements) and `window.Reveal?.refresh()` once the content is visible, e.g. `this.$nextTick(() => { window.Reveal?.scan(); window.Reveal?.refresh(); })` after `status` becomes `ready` (`js/items-list.js` does this). `reveal.js` also refreshes on `pageshow` when restored from the back/forward cache.

**Why every trigger has `onRefresh`.** The browser restores the scroll position before layout is final, so enter/leave events can fire against stale measurements, or not at all for elements already on screen. On every refresh each trigger re-applies the state for the *current* scroll position (play if active, reset if not), so Back/Forward and reload restores are correct.

Keep the IntersectionObserver advice (below) for **run-once** cases such as counters; `data-reveal` is for effects that should replay.

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
