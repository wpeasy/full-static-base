# Deploying

**Only a build of `public/` is published.** `public/` is the hand-edited source; `node tools/build-dist.mjs` copies it to `dist/` (git-ignored) with ONE minified `css/main.css`, and the host publishes `dist/`. Production must not serve the `@import` chain (docs/performance.md). The repo root holds development material (AGENTS.md, docs, tools, themes, `_template.html`) that must never be served. Pointing a host at the repo root would leak internal notes and create indexable duplicate pages such as `_template.html`.

| Host | Setting |
|---|---|
| Netlify | Build command `node tools/build-dist.mjs`; publish directory `dist` |
| Cloudflare (Workers or Pages) | Workers: `npm run cf:deploy` (builds `dist/`; wrangler uploads `./dist`). Pages: build command `node tools/build-dist.mjs`, output directory `dist` |
| GitHub Pages | `node tools/deploy-pages.mjs` (the export ships the bundled CSS) |
| Apache / nginx | Run `node tools/build-dist.mjs`, point the document root at (or upload) `dist/` |

Host config files live **inside** `public/` for that reason: `_headers`, `_redirects` and `.htaccess`. `robots.txt` and `sitemap.xml` too.

Host specifics (Cloudflare Workers, Netlify, Apache, GitHub Pages) and a comparison table: [hosting.md](hosting.md). Caching rules: [security.md](security.md).

## Before launch

1. Replace `example.com` in `public/_headers`, `public/robots.txt`, `public/sitemap.xml`, canonical and Open Graph tags (docs/seo.md).
2. `node tools/check.mjs` reports 0 errors; it also errors if a page links outside `public/` and warns if `public/` contains development files.
3. `node tools/build-dist.mjs` succeeds: it writes `dist/css/main.css` (one request, no `@import`) and fails if any `url(...)` in it points at a missing file. `node tools/check-dist.mjs` re-runs that check.
4. Check the live site returns 404 for `/AGENTS.md`, `/tools/check.mjs`, `/_template.html`.

## Why a build

The site has no build step in development: edit `public/`, refresh. Production is the one exception, kept as small as possible: one build script, no npm packages, and the only transformation is bundling and minifying CSS (whitespace and comments only; selectors and values untouched). Pages still link `css/main.css`, so no HTML changes between development and production. Details: docs/performance.md.
