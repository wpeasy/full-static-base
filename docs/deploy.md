# Deploying

**Only `public/` is published.** The repo root holds development material (AGENTS.md, docs, tools, themes, `_template.html`) that must never be served. Pointing a host at the repo root would leak internal notes and create indexable duplicate pages such as `_template.html`.

| Host | Setting |
|---|---|
| Netlify | Publish directory: `public` (no build command) |
| Cloudflare Pages | Build output directory: `public` (no build command) |
| GitHub Pages | Deploy the `public` folder (for example with an upload-pages-artifact step with `path: public`) |
| Apache / nginx | Document root: the `public` folder |

Host config files live **inside** `public/` for that reason: `_headers`, `_redirects` and `.htaccess`. `robots.txt` and `sitemap.xml` too.

## Before launch

1. Replace `example.com` in `public/_headers`, `public/robots.txt`, `public/sitemap.xml`, canonical and Open Graph tags (docs/seo.md).
2. `node tools/check.mjs` reports 0 errors; it also errors if a page links outside `public/` and warns if `public/` contains development files.
3. Optional: `node tools/bundle-css.mjs` and link `css/main.bundle.css` (one request instead of about 30; the file is git-ignored).
4. Check the live site returns 404 for `/AGENTS.md`, `/tools/check.mjs`, `/_template.html`.

## Possible later step (not built)

A `tools/build.mjs` could copy `public/` to `dist/` with bundled CSS, cache-busted file names and minification, and the host would publish `dist/`. `public/` stays the hand-edited source. Adding it would end the "files are served exactly as written" promise for production, so the team must choose it explicitly.
