# tools/

Dev-only helpers. Nothing here ships with the site (only `public/` is deployed); the site has no build step. Every tool reads and writes under `public/` (except `check.mjs`, which also validates `_template.html` at the repo root).

| Command | What it does | Needs |
|---|---|---|
| `node tools/check.mjs` | Guardrails: tokens not literals, BEM, no IDs/`!important`, motion gating, HTML semantics, a11y basics, shared header/footer, asset links, `main.css` imports. Exit 1 on errors. | Node only |
| `node tools/serve.mjs [--port n]` | Static preview server for `public/` (default port 8765; `node tools/serve.mjs 9000` to change) that applies the `_redirects` 200 rewrites (`/item/*` → `item.html`), serves `404.html`, never caches. Anything outside `public/` (AGENTS.md, tools/, _template.html) is a 404 | Node only |
| `node tools/build-sitemap.mjs [collection] [singular]` | Rewrites item URLs in `public/sitemap.xml` between `<!-- items:start -->` / `<!-- items:end -->` from `public/data/items.json` (`site.url`) | Node only |
| `node tools/export-pages.mjs [--out dir] [--base /repo]` | GitHub Pages export of `public/`: skips host-config files, writes `.nojekyll`, prefixes root-absolute links, one template copy per slug, `?v=<hash>` cache busting (docs/hosting.md) | Node only |
| `node tools/deploy-pages.mjs --repo owner/name` | Export, commit and push to a separate Pages repo, wait for the build | `git`, `gh` |
| `npm run cf:dev` / `cf:deploy` / `cf:login` (in `tools/`) | Cloudflare Workers static assets via `wrangler.jsonc` and `worker/index.js` (docs/hosting.md) | `npm install` in `tools/` |
| `node tools/bundle-css.mjs` | Inline `public/css/main.css` imports into `public/css/main.bundle.css` for deploy (git-ignored) | Node only |
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
