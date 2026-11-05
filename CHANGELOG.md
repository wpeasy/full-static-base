# Changelog

Framework versions follow `VERSION`. Upgrading a project = overwrite `css/core/*`, `tools/*`, `docs/*`, `AGENTS.md`; keep `css/theme.css` and your own components/pages.

## 2.7.0
- **`generate-icons` skill** (`.claude/skills/generate-icons`): from the one icon file a client supplies it inspects the source, picks the apple-touch/maskable background from the theme, runs `tools/make-favicons.mjs`, checks the legibility preview, wires `site.webmanifest` and verifies. `tools/make-favicons.mjs` now takes **any source** (SVG, PNG, WebP, JPEG, ICO; any aspect ratio, fitted into a square; warns below 512px), also writes `icon-maskable-512.png` (icon at 66% on `--bg`), copies an SVG source to `images/favicon.svg`, updates the manifest `icons`, supports `--no-svg` (raster source: removes the SVG `<link>` from the pages and the sample SVG) and `--preview` (16/32/48/180px on light and dark). **SVG sources are rasterised with `rsvg-convert` or headless Chrome**: ImageMagick's SVG renderer silently dropped the strokes of a real logo mark. The shipped `site.webmanifest` lists the maskable icon.

## 2.6.0
- **Favicon fix:** the base shipped an SVG-only favicon, which Safari and many crawlers ignore (and browsers still ask for `/favicon.ico`). It now ships the full set: `favicon.ico` (16/32/48), `images/favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` and `site.webmanifest`, linked by four `<link>`s in `_template.html` and every page (root-absolute, so they also work from `/item/<slug>`). New `tools/make-favicons.mjs` generates the files from one source (needs `magick`). New `docs/favicons.md`, a rule in AGENTS.md (Images, Definition of done, commands) and a note in the new-site workflow. `check.mjs` **errors** when a page has no `.ico`/`.png` `<link rel="icon">`, warns without `apple-touch-icon`, and no longer asks to convert icon PNGs to WebP. `serve.mjs` and `.htaccess` serve `.webmanifest` as `application/manifest+json`; `_headers` caches the icons for a week. **Upgrade note:** add the four `<link>`s to your pages' `<head>` and run `node tools/make-favicons.mjs`; until then `check.mjs` reports an error.

## 2.5.0
- **Interim image sizes and `srcset`:** new `tools/make-image-sizes.mjs` converts a JPEG/PNG to WebP (`--delete-original` removes the source) **and** writes interim sizes (`name-480/800/1200/1600.webp`, never upscaled, quality 70) in one step, for new images and for images that are already WebP; given a folder it processes every source image and skips generated sizes, `og*`/`favicon*`/`icons*` and small images. It prints the `srcset` and `width`/`height` to paste. Needs `magick` or `cwebp` on the machine (the site needs neither). `tools/image-size.mjs` reads WebP/PNG/JPEG dimensions. `docs/images.md` gains the workflow and a "Responsive images" section (`srcset`, measuring and writing `sizes`, `<picture>` art direction, preloading an LCP `srcset`, when to skip); AGENTS.md and the Definition of done require it. `check.mjs` warns on a local WebP wider than 800px with no `srcset` (outside `<picture>`) and on `srcset` with `w` descriptors but no `sizes`, and errors on a `srcset` file that does not exist.

## 2.4.0
- **Fast by default:** production now ships ONE minified `css/main.css`. New `tools/build-dist.mjs` copies `public/` to `dist/` (git-ignored) with the bundle and runs the new `tools/check-dist.mjs` (no `@import`; every CSS `url()` and local HTML reference resolves). `tools/bundle-css.mjs` is rewritten: it **rewrites relative `url(...)` paths** for the bundle's location (the old version broke images and fonts referenced as `../../images/...`), has an optional `--min`, and exports `bundleCss({ minify, outDir })`. Pages keep linking `css/main.css`. Measured on a real site: Performance ~96 to ~99, FCP 1.5s to 0.9s, Speed Index 4.4s to 2.7s.
- **Hosting:** `wrangler.jsonc` publishes `./dist` and `cf:dev`/`cf:deploy` build first (`cf:build` added); `worker/index.js` takes `ROUTE` and `TEMPLATE` constants (list page and detail template must not share a name); `export-pages.mjs` ships the bundled CSS and **defaults to `dist-pages/`** (was `dist/pages`, which would collide with `dist/`); `serve.mjs --dir dist` previews the build. Netlify, Cloudflare Pages and Apache instructions now build and publish `dist/`.
- **Caching:** `/images/*` is `public, max-age=604800, stale-while-revalidate=86400` (was one day) in `_headers`, `.htaccess` and docs/security.md.
- **Docs:** new `docs/performance.md` (the four fixes, verifying a bundle, LCP image preload with a `media` query per art-directed variant, image sizing, cache policy, reading PageSpeed and what to ignore). `docs/data-driven-pages.md` documents the optional `thumb`, `thumbWidth`, `thumbHeight` fields. AGENTS.md: table row, commands, structure and a Performance line in the Definition of done.
- **Upgrade note:** deploy `dist/`, not `public/`. Hosts that published `public/` directly need a build step (`node tools/build-dist.mjs`) or must serve a bundled `css/main.css`. If you scripted `dist/pages`, use `dist-pages`.

## 2.3.0
- **Scroll reveals:** new `js/reveal.js` (`data-reveal` timed fade-and-rise that replays; `data-ken-burns` slow hero zoom via `--hero-zoom`; `window.Reveal.scan()/refresh()`; only under `prefers-reduced-motion: no-preference`, nothing hidden without JS). **Fixes a bug:** `html { scroll-behavior: smooth }` made ScrollTrigger measure triggers at the wrong offset (elements stuck at opacity 0 after Back/Forward or reload). reveal.js sets it to `auto` while running and glides in-page anchors itself; each trigger re-applies state in `onRefresh`. `base.css` keeps the rule (commented) and gains `html { scroll-padding-block-start }`. `js/items-list.js` calls `Reveal.scan()/refresh()` after the grid appears. Demo in `components.html`; docs in `docs/motion.md`, `docs/vendor.md` (load order), `docs/workflows.md` (scroll-effects test checklist), `COMPONENTS.md`. **Upgrade note:** pages that use ScrollTrigger must load `ScrollTrigger.min.js` and `reveal.js` before Alpine.
- **GSAP effects policy:** use the effects library at https://gsap.brxprod.com/ first (skip Bricks-specific parts); adapt to vendored GSAP, BEM, tokens, a reduced-motion check; record in `DESIGN-NOTES.md`. AGENTS.md, `docs/motion.md`, workflows.
- **Brand and design guide:** `templates/brand-guide.template.html` (never published), `docs/brand-guide.md` and the `new-brand-guide` skill produce `public/brand-guide.html` from the live tokens.

## 2.2.0
- **First build clean-out:** new root file `FIRST-BUILD.md` is a flag plus procedure. While it exists, the first request to build anything first removes the sample pages and data from `public/` (index, article, contact, items, item, `data/items.json`, `images/og.svg`), resets `sitemap.xml`, then deletes the flag and commits. Framework CSS/JS, style guide and gallery are kept. AGENTS.md, `docs/workflows.md` and the `new-site` skill point at it. **Upgrade note:** existing sites do not get `FIRST-BUILD.md` when overwriting the library files, so nothing is ever cleared in a site that already has work in it.

## 2.1.0
- **Caching:** `_headers` (and `.htaccess`) give `/css/*`, `/js/*` and HTML `no-cache`, `/data/*` `max-age=300, stale-while-revalidate=86400`, fonts stay `immutable`. New rule "never cache unversioned CSS/JS with a max-age" in AGENTS.md and the Definition of done; explained in `docs/security.md`. `check.mjs` warns on a `max-age` for `/css/*` or `/js/*` without `immutable`.
- **JS-rendered pages:** new `page` and `skeleton` components, `docs/js-rendered-pages.md`, `docs/alpine.md`. `items.html` and `item.html` use them (one `status` property, `aria-busy` only while `loading`, CSS-animation entrance, skeleton after 150ms, no View Transitions). `check.mjs` warns on a JS-filled `<main>` without `aria-busy`, colourful sections outside `.page__content`, and `@view-transition`.
- **Data loading:** `js/items-data.js` preloads the JSON (`<link rel="preload" as="fetch">`), caches it in `sessionStorage` (stale-while-revalidate; an edit can appear one page late) and derives the site base path from its own script URL (`ItemData.href`, `ItemData.url`). `js/seo.js` derives the same base; **`Seo.setSeo` and the builders now take a full `url` instead of a `path`** (upgrade note).
- **Upgrade note:** `gridFilter`'s live-region getter `status` is renamed `summary`.
- **Motion:** `js/motion-shared.js` (`Motion.sweep`, `Motion.once`, `Motion.reduced`); docs/motion.md on SVG line reveals and run-once counters.
- **Hosting:** `docs/hosting.md` (comparison table, Cloudflare Workers, GitHub Pages); `wrangler.jsonc`, `worker/index.js`, `cf:*` scripts in `tools/package.json`; `tools/export-pages.mjs` and `tools/deploy-pages.mjs`; `.wrangler/` and `dist/` git-ignored.
- Testing note in `docs/workflows.md`: hidden preview panes freeze animations; measure with the Performance API; hard-refresh after a deploy.

## 2.0.0 (breaking: new folder layout)
- **Only `public/` is published.** Pages, `css/`, `js/`, `fonts/`, `images/`, `data/`, `sitemap.xml`, `robots.txt`, `_headers`, `_redirects` and `.htaccess` moved into `public/` (`git mv`, history kept). Docs, tools, themes, `_template.html`, AGENTS.md and the quick references stay at the repo root and are never deployed. Deploy rule: `docs/deploy.md`.
- `tools/check.mjs` reads from `public/`, validates `_template.html` at the root (links resolved against `public/`), errors when a page links outside `public/`, warns about development files inside `public/`.
- `tools/sync-shared.mjs`, `build-sitemap.mjs`, `bundle-css.mjs` (`public/css/main.bundle.css`, git-ignored) and `browser-checks.mjs` work under `public/`; `tools/serve.mjs` serves only `public/` (anything else is a 404), takes an optional port argument (default 8765), and replaces `python3 -m http.server` everywhere in the docs.
- Guides that lived inside published folders moved out: `fonts/README.md` → `docs/fonts.md`, `js/vendor/README.md` → `docs/vendor.md`, `images/README.md` → `docs/image-files.md`.
- AGENTS.md section 3 rewritten (path convention: docs paths are relative to `public/` unless they start with `tools/`, `docs/` or `themes/`); commands, upgrade note, workflows and skills updated.
- Upgrading an existing site: move your published files into `public/` first, then overwrite the library files.

## 1.3.0
- **JSON-driven pages with one template:** `data/items.json`, list page `items.html`, template `item.html` served at `/item/<slug>` (`_redirects`, `.htaccess`, `tools/serve.mjs`), loader `js/items-data.js`, `js/items-list.js`, `js/item-profile.js`, new `profile` component, `tools/build-sitemap.mjs`. `tools/sync-shared.mjs` and `check.mjs` support root-absolute pages (`<html data-root-absolute>`). Guide: `docs/data-driven-pages.md`.
- **SEO and schema by default:** `docs/seo.md`, `js/seo.js` (`setSeo`, `setMeta`, `setLink`, `setJsonLd`, schema builders), default meta/Open Graph/JSON-LD block in `_template.html` and the example pages; new AGENTS.md rule, Definition of done items and workflow/skill steps (new-site, new-page, audit). `check.mjs` warns on missing canonical/OG, title/description length and duplicates, errors on invalid JSON-LD.
- **Images:** `docs/images.md`: convert JPEG/PNG/GIF to WebP; `loading="eager"` for the first 1920×1080 screen (always the header logo), `lazy` + `decoding="async"` for the rest. `check.mjs` enforces what it can.
- `grid-filter.js`: `items()` renamed `elements()`; factory exposed as `window.GridFilter`.
- Team nav/footer link added to the template; `.claude/launch.json` now runs `tools/serve.mjs`.

## 1.2.0
- Fix `base.css`: `li + li` spacing now only applies to plain `ul`/`ol` without a class (it misaligned rows of nav links, chips and badges). `.prose` and `u-list-none` unchanged.
- `tools/check.mjs`: ignores `?query` on local file references; checks `data-variant` alternatives one at a time and de-duplicates findings (see `tools/README.md`).
- New `filter` component + `js/grid-filter.js` (Alpine `gridFilter`): search, toggle chips, live status, empty state, GSAP Flip with grid-height tween, skipped under reduced motion. Gallery example, COMPONENTS.md recipe, Flip section in `docs/motion.md`.
- Vendored GSAP 3.13.0 (core, ScrollTrigger, Flip) in `js/vendor/` with `js/vendor/README.md` (versions, licence, `?v=` cache busting).
- `css/fonts.css` (imported first) and a rewritten `fonts/README.md`: variable woff2 per unicode-range subset, `font-display: swap`, preload latin only, fetching files from the Google Fonts CSS API.
- New `--text-display` / `--text-display-s` tokens (theme `--display-*-size`); `u-surface-accent` re-pointable via `--accent-*` theme tokens.

## 1.1.0
- Example pages (landing, article, contact); style guide moved to `styleguide.html`.
- Section patterns: feature, stat, testimonial, pricing, cta, article-header, check, error-summary, theme-toggle.
- Persistent theme toggle (`js/theme-init.js`), accessible form validation (`js/forms.js`), print stylesheet.
- `tools/sync-shared.mjs`, `_headers` template, docs for browser support, security/CSP and forms.
- `.editorconfig`, `.gitignore`, `.vscode` recommendations.

## 1.0.0
- Fluid type / space / radii scales with selectable ratios (theme-driven).
- OKLCH colour ramps (10 light / 10 dark / 10 alpha) via `color-mix`, plus WCAG `-a11y` text pairings.
- Semantic colours with `light-dark()`; `u-surface-*` surfaces.
- Layout objects, utilities, native-first components, Alpine helpers.
- `tools/check.mjs` guardrails; theme presets; docs for agents.
