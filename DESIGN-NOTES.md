# Design notes

Deliberate deviations from the base framework, newest first. The framework is a foundation: change what the design needs, and record it here so future upgrades and other agents know why.

Format: `YYYY-MM-DD · files · what changed · why`

<!-- Example:
2026-11-03 · css/components/card.css · added `.card--horizontal` · product list needed side-by-side media
-->

- _No deviations yet._

Base changes (not site deviations):
- 2026-11-04 · tools/bundle-css.mjs, tools/build-dist.mjs, tools/check-dist.mjs, tools/export-pages.mjs, tools/deploy-pages.mjs, tools/serve.mjs, tools/package.json, wrangler.jsonc, worker/index.js, .gitignore · production ships ONE minified `css/main.css` built into `dist/` (no `@import` waterfall; relative `url()`s rewritten for the bundle's location; `check-dist` fails the build on an `@import` or an unresolved `url()`); Cloudflare publishes `./dist` and `cf:dev`/`cf:deploy` build first; the GitHub Pages export ships the same bundle and now defaults to `dist-pages/` (so it no longer collides with `dist/`); `serve.mjs --dir dist` previews the build; the Worker takes `ROUTE` and `TEMPLATE` constants · the `@import` chain cost ~1.2s of render-blocking time on Slow 4G, and the old bundler broke relative `url()` paths
- 2026-11-04 · public/_headers, public/.htaccess, docs/security.md · `/images/*` cache `public, max-age=604800, stale-while-revalidate=86400` (was 1 day); `.htaccess` gains the image rule · short image caching
- 2026-11-04 · docs/performance.md (new), docs/deploy.md, docs/hosting.md, docs/data-driven-pages.md, docs/images.md, tools/README.md, AGENTS.md · performance guide (one stylesheet, bundle verification, LCP image preload with per-variant `media`, image sizing, cache policy, reading PageSpeed and what to ignore); deploy docs now publish `dist/`; optional `thumb`/`thumbWidth`/`thumbHeight` item fields for list cards; list page and detail template must not share a name; Definition of done gains a Performance line · every site inherited these four problems
- 2026-11-04 · templates/brand-guide.template.html, docs/brand-guide.md, .claude/skills/new-brand-guide · brand and design guide template (outside `public/`) plus a skill that fills it into `public/brand-guide.html` from the live tokens · clients need a branded style guide, and `styleguide.html` only documents the framework
- 2026-11-04 · docs/motion.md, AGENTS.md, docs/workflows.md, docs/vendor.md · GSAP effects policy: use the effects at https://gsap.brxprod.com/ first (Bricks-specific parts ignored), adapted to vendored GSAP, BEM, tokens and a reduced-motion check; new code only when no effect fits · the library's effects already handle reduced motion, focus and screen readers
- 2026-11-04 · js/reveal.js, js/items-list.js, css/core/base.css, components.html, docs/motion.md, docs/vendor.md, docs/workflows.md, COMPONENTS.md, hero.css · scroll reveals (`data-reveal`, `data-ken-burns`); reveal.js turns `scroll-behavior: smooth` off while it runs and glides anchors itself; per-trigger `onRefresh`; list loader calls `Reveal.scan()/refresh()` after un-hiding; `html { scroll-padding-block-start }` for the sticky header · smooth scrolling made ScrollTrigger measure at the wrong offset (elements stuck at opacity 0 after Back/Forward or reload); CSS `animation-timeline` was scrubbed, not timed
- 2026-11-04 · FIRST-BUILD.md, AGENTS.md, docs/workflows.md · first-build flag: while `FIRST-BUILD.md` exists, the first build clears the sample pages out of `public/` and deletes the flag · new sites started with the sample pages still in `public/`
- 2026-11-03 · repo layout · published files moved into `public/`; tools, docs, themes and `_template.html` stay at the root · the repo root was being published, leaking AGENTS.md/tools/docs and indexable duplicates like `_template.html`
- 2026-11-03 · js/grid-filter.js · `items()` renamed `elements()`, factory exposed as `window.GridFilter` · data-driven lists keep their data in `items`
- 2026-11-03 · caching · `_headers`/`.htaccess`: `/css/*`, `/js/*`, HTML `no-cache`; `/data/*` `max-age=300, stale-while-revalidate`; fonts stay `immutable` · a `max-age` on unversioned CSS/JS leaves visitors on new HTML with old CSS/JS after a deploy
- 2026-11-03 · css/components/page.css, skeleton.css · new `page`/`skeleton` blocks for JS-filled `<main>`: busy shell, CSS-animation entrance, 150ms-delayed skeleton · a transition does not play when data is ready before first paint; no skeleton flash on fast loads
- 2026-11-03 · js/seo.js, js/items-data.js · `setSeo`/builders take a full `url` instead of a `path`; site base path derived from the script URL; sessionStorage stale-while-revalidate; JSON preloaded in the head · works at a domain root and under `/repo/`; data ready before first paint
- 2026-11-03 · js/grid-filter.js · live-region getter `status` renamed `summary` · pages now use `status` for `loading | ready | missing | error`
- 2026-11-03 · js/motion-shared.js · new `Motion.sweep/once/reduced`; SVG lines revealed by clip-path, run-once reveals by IntersectionObserver · dashoffset + non-scaling-stroke pops; ScrollTrigger `once` misses elements above the viewport after reload
- 2026-11-03 · hosting · `wrangler.jsonc`, `worker/index.js`, `tools/export-pages.mjs`, `tools/deploy-pages.mjs`, docs/hosting.md · Cloudflare Workers and GitHub Pages need their own rewrite and cache-busting handling
- 2026-11-03 · css/core/base.css · `li + li` spacing scoped to `:is(ul, ol):not([class]) > li + li` · it offset every item but the first when a classed list (nav, chips, badges) was laid out as a row
