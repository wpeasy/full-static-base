# tools/

Dev-only helpers. Nothing here ships with the site (only `public/` is deployed); the site has no build step. Every tool reads and writes under `public/` (except `check.mjs`, which also validates `_template.html` at the repo root).

| Command | What it does | Needs |
|---|---|---|
| `node tools/check.mjs` | Guardrails: tokens not literals, BEM, no IDs/`!important`, motion gating, HTML semantics, a11y basics, shared header/footer, asset links, `main.css` imports. Exit 1 on errors. | Node only |
| `node tools/serve.mjs [--port n] [--dir dist]` | Static preview server for `public/` (default port 8765; `node tools/serve.mjs 9000` to change) that applies the `_redirects` 200 rewrites (`/item/*` → `item.html`), serves `404.html`, never caches. Anything outside `public/` (AGENTS.md, tools/, _template.html) is a 404 | Node only |
| `node tools/build-sitemap.mjs [collection] [singular]` | Rewrites item URLs in `public/sitemap.xml` between `<!-- items:start -->` / `<!-- items:end -->` from `public/data/items.json` (`site.url`) | Node only |
| `node tools/export-pages.mjs [--out dir] [--base /repo]` | GitHub Pages export of `public/` (default `dist-pages/`): skips host-config files, bundled minified CSS, `.nojekyll`, prefixes root-absolute links, one template copy per slug, `?v=<hash>` cache busting (docs/hosting.md) | Node only |
| `node tools/deploy-pages.mjs --repo owner/name` | Export, commit and push to a separate Pages repo, wait for the build | `git`, `gh` |
| `npm run cf:build` / `cf:dev` / `cf:deploy` / `cf:login` (in `tools/`) | Cloudflare Workers static assets via `wrangler.jsonc` and `worker/index.js`; `cf:dev` and `cf:deploy` build `dist/` first (docs/hosting.md) | `npm install` in `tools/` |
| `node tools/build-dist.mjs` | **Deploy build:** copy `public/` to `dist/` with ONE minified `css/main.css` (no `@import`, relative `url()`s rewritten); runs `check-dist.mjs`. `dist/` is git-ignored | Node only |
| `node tools/check-dist.mjs` | Verify `dist/`: no `@import` in `css/main.css`, every CSS `url()` and local HTML reference resolves. Exit 1 on failure | Node only |
| `node tools/make-image-sizes.mjs <file\|folder> [--delete-original]` | **Convert to WebP and make interim sizes in one step** (`hero.webp` + `hero-480/800/1200/1600.webp`, never upscaled, quality 70) and print the `srcset`. Works on JPEG/PNG and on existing WebP; a folder skips generated sizes, og/favicon/icons and small images. `--widths`, `--quality`, `--dry` | `magick` or `cwebp` installed |
| `node tools/make-favicons.mjs [source] [--bg "#fff"] [--no-svg] [--preview f.png]` | **Whole icon set from one client icon** (SVG or PNG/WebP/JPEG/ICO): `favicon.ico` (16/32/48), `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png`, `images/favicon.svg` (SVG source), manifest icons; `--preview` writes a legibility sheet. The `generate-icons` skill drives it (docs/favicons.md) | `magick` installed (+ `rsvg-convert` or Chrome for SVG) |
| `node tools/unpack-site-plan.mjs [folder]` | **new-site-plan step 1:** list every zip and refuse unsafe entries, extract into `source/<zip>/` (nothing is run; execute bits removed; script-like files reported), `pdftotext -layout` every PDF to `source/<name>.txt`, write `source/INVENTORY.md` (docs/site-plan.md) | `unzip`, `pdftotext` (poppler); `magick` optional |
| `node tools/contrast.mjs` | WCAG contrast and OKLCH for brand colours: one pair, `--palette Name=#hex ... [--md]` matrix, or `--suggest "#hex" --on "#bg"` for a text-safe partner | Node only |
| `node tools/md-to-brief-html.mjs brief.md [--out f.html] [--logo ...] [--hero ...] [--fonts ...]` | Render a Markdown brief to print-ready A4 HTML with a branded cover; `[supply]` and `[confirm]` become loud badges (yellow "TO SUPPLY" with a red outline, dashed "CONFIRM"), an `**ACTION FOR THE CLIENT` blockquote becomes a boxed notice at the top of page 2, and a draft banner goes on the cover; print to PDF with headless Chrome. No pandoc | Node only |
| `node tools/bundle-css.mjs [--min]` | Inline `public/css/main.css` into `public/css/main.bundle.css` (git-ignored); the building block used by `build-dist.mjs` and `export-pages.mjs` | Node only |
| `node tools/browser-checks.mjs` | axe WCAG scan, horizontal-overflow and console-error checks, screenshots at 320/768/1280 in light/dark with reduced motion | `cd tools && npm install && npx playwright install chromium`, plus `node tools/serve.mjs` running (scans http://localhost:8765) |

### Pages with side-by-side alternatives

A page may hold several designs of the same section, e.g. for choosing between directions:

```html
<div data-variant="a">…</div>
<div data-variant="b">…</div>
```

`check.mjs` runs the HTML checks once per variant with the others blanked out, so each variant needs its own single `<h1>`, unique ids and unskipped heading order. Findings that repeat across passes are reported once. Pages without `data-variant` are checked once. Local file references ignore `?query` and `#fragment` (`js/vendor/x.js?v=1.2.3` is fine).

### JS-rendered pages, headers and view transitions

`check.mjs` warns when a `<main>` filled by Alpine (an `x-data` on `<main>`, or a `<template x-for>` outside a form) has no `aria-busy`, when a `u-surface-*` or `cta` section of a `.page` sits outside `.page__content`, on `@view-transition` (CSS or HTML), and when `public/_headers` gives `/css/*` or `/js/*` a `max-age` without `immutable`.

### Published folder

`check.mjs` errors if a page in `public/` links to a file outside `public/`, and warns if `public/` contains development files (`*.md`, `tools`, `docs`, `themes`, `_template.html`). `sync-shared.mjs` reads `_template.html` from the repo root and updates only the pages in `public/`.

### SEO, images and structured data

`check.mjs` warns when a page lacks a canonical, `og:title`, `og:description` or `og:image`, when a title exceeds 60 or a description 160 characters, or when two pages share a title or description. It **errors** when a JSON-LD block is not valid JSON, and when an `<img>` uses a JPEG/PNG/GIF. It warns about a missing `loading="eager|lazy"`, missing `width`/`height`, and raster leftovers in `images/`. Pages without `noindex` are checked; style guide pages are skipped.

The checks are heuristics tuned for this framework. If a rule blocks a deliberate design choice, adjust the rule in `check.mjs` and record it in `DESIGN-NOTES.md`.
