# Changelog

Framework versions follow `VERSION`. Upgrading a project = overwrite `css/core/*`, `tools/*`, `docs/*`, `AGENTS.md`; keep `css/theme.css` and your own components/pages.

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
