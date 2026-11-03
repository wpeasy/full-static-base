# Design notes

Deliberate deviations from the base framework, newest first. The framework is a foundation: change what the design needs, and record it here so future upgrades and other agents know why.

Format: `YYYY-MM-DD · files · what changed · why`

<!-- Example:
2026-11-03 · css/components/card.css · added `.card--horizontal` · product list needed side-by-side media
-->

- _No deviations yet._

Base changes (not site deviations):
- 2026-11-03 · repo layout · published files moved into `public/`; tools, docs, themes and `_template.html` stay at the root · the repo root was being published, leaking AGENTS.md/tools/docs and indexable duplicates like `_template.html`
- 2026-11-03 · js/grid-filter.js · `items()` renamed `elements()`, factory exposed as `window.GridFilter` · data-driven lists keep their data in `items`
- 2026-11-03 · caching · `_headers`/`.htaccess`: `/css/*`, `/js/*`, HTML `no-cache`; `/data/*` `max-age=300, stale-while-revalidate`; fonts stay `immutable` · a `max-age` on unversioned CSS/JS leaves visitors on new HTML with old CSS/JS after a deploy
- 2026-11-03 · css/components/page.css, skeleton.css · new `page`/`skeleton` blocks for JS-filled `<main>`: busy shell, CSS-animation entrance, 150ms-delayed skeleton · a transition does not play when data is ready before first paint; no skeleton flash on fast loads
- 2026-11-03 · js/seo.js, js/items-data.js · `setSeo`/builders take a full `url` instead of a `path`; site base path derived from the script URL; sessionStorage stale-while-revalidate; JSON preloaded in the head · works at a domain root and under `/repo/`; data ready before first paint
- 2026-11-03 · js/grid-filter.js · live-region getter `status` renamed `summary` · pages now use `status` for `loading | ready | missing | error`
- 2026-11-03 · js/motion-shared.js · new `Motion.sweep/once/reduced`; SVG lines revealed by clip-path, run-once reveals by IntersectionObserver · dashoffset + non-scaling-stroke pops; ScrollTrigger `once` misses elements above the viewport after reload
- 2026-11-03 · hosting · `wrangler.jsonc`, `worker/index.js`, `tools/export-pages.mjs`, `tools/deploy-pages.mjs`, docs/hosting.md · Cloudflare Workers and GitHub Pages need their own rewrite and cache-busting handling
- 2026-11-03 · css/core/base.css · `li + li` spacing scoped to `:is(ul, ol):not([class]) > li + li` · it offset every item but the first when a classed list (nav, chips, badges) was laid out as a row
