# JS-rendered pages (loading shell, skeleton, entrance)

For a `<main>` whose content is filled by JavaScript from JSON (docs/data-driven-pages.md). Components: `page` (`css/components/page.css`) and `skeleton` (`css/components/skeleton.css`). Live example: `items.html` and `item.html`.

Goal: no flash of empty or half-built content, no layout shift, no skeleton on fast or cached loads, and a calm entrance when the data is there. Works without JavaScript (nothing is hidden).

## Markup

```html
<main id="main" class="page" aria-busy="true" :aria-busy="status === 'loading'" x-data="itemList">
  <div class="page__skeleton" aria-hidden="true">
    <div class="section"><div class="container stack">
      <span class="skeleton__line skeleton__line--title"></span> …shapes that mimic the real layout…
    </div></div>
  </div>
  <div class="page__content">
    …everything else: header text, the real content, CTA bands, banners…
  </div>
</main>
<footer class="footer">…</footer>
```

- `page__skeleton` is an `aria-hidden`, absolutely positioned overlay. `page__content` holds **everything else**.
- **Anything colourful in the static HTML (CTA bands, banners, `u-surface-*` sections) must be inside `.page__content`**, otherwise it flashes under an empty shell. `check.mjs` warns about it.
- The footer must be a later sibling of the `<main class="page">` (the footer is hidden by `.page[aria-busy="true"] ~ .footer`).
- Exactly one `<h1>`, outside any `<template>` (docs/alpine.md).

## One status property

The Alpine component has `status`: `loading | ready | missing | error`. **Only `loading` sets `aria-busy`**; every other value clears it. Never leave `aria-busy="true"` after an error: show the error or not-found state instead. (Alpine removes the attribute when the binding is `false`; the CSS tests `[aria-busy="true"]`, so that is fine.)

If the list uses `gridFilter`, its live-region text is `summary` (not `status`), so the two do not clash.

## What the CSS does

While busy, **and only when `@media (scripting: enabled)`**:
- `.page__content` is invisible but keeps its space, and `.page` gets `min-block-size: var(--page-busy-min-height)` (default `70svh`), so the footer does not jump up and down.
- the footer is hidden too.

When not busy: an **entrance animation** on `.page__content` and the footer (fade plus a small rise, `--duration-slow`, `both` fill).

**It is an animation, not a transition.** A transition never plays when the data was ready before first paint (there is no "before" style to transition from). An animation starts the moment the selector matches, whenever that is.

Skeleton:
- fades in only after `--page-skeleton-delay` (150ms) with `animation: … 150ms backwards`, so fast or cached loads never show it;
- shimmers only under `.page[aria-busy="true"]`, never forever on a hidden skeleton;
- fades out with `--duration-fast`.

All motion is inside `prefers-reduced-motion: no-preference`. With `reduce` there is no skeleton and no entrance: the content simply appears.

## Known traps

- **Do not use cross-document View Transitions (`@view-transition { navigation: auto }`) for this.** The snapshot of the previous page stays visible behind the new one and reads as a flash. `check.mjs` warns about `@view-transition`.
- Don't hide content with `x-show`/`x-cloak` for the loading state: `x-cloak` styles are removed only after Alpine starts, which is the flash you are avoiding.
- If the script that sets `status` never loads (blocked, offline CDN), the page stays in its busy shell. Everything is local here, so keep it that way; `<noscript>` covers visitors without JavaScript.
- Reduced motion hides the skeleton entirely: a slow load shows an empty shell. That is deliberate (no pop-in); keep data small and preloaded.

## Make the data ready before first paint

1. Preload the JSON in the `<head>` of every page that uses it: `<link rel="preload" href="/data/items.json" as="fetch" crossorigin="anonymous">`.
2. The loader returns a copy from `sessionStorage` immediately and refreshes it in the background (stale-while-revalidate): see docs/data-driven-pages.md section 3. After the first page of a visit the data is ready before first paint, and the entrance simply plays.
3. Header `Cache-Control: public, max-age=300, stale-while-revalidate=86400` on `/data/*` (docs/security.md).

## Verify

Use a real, visible browser: a hidden preview pane freezes CSS animations and `requestAnimationFrame` (docs/workflows.md, Testing). Measure first: paint timing, resource timing and `layout-shift` with the Performance API. To see the skeleton, delay the JSON beyond 150ms (DevTools network throttling, or `fetch` delayed in the console); it must not appear for a fast load.
