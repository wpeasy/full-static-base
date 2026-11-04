# Hosting

`public/` is the source; what is published is a **build of it** (docs/deploy.md, docs/performance.md): `node tools/build-dist.mjs` copies `public/` to `dist/` and ships ONE minified `css/main.css` instead of the `@import` chain. Which host you choose decides how the single-template rewrite, headers and caching work. The other docs are host-neutral; host-specific detail lives here.

| | Cloudflare (Workers + static assets) | Netlify | Apache | GitHub Pages |
|---|---|---|---|---|
| Template rewrite `/item/<slug>` | `worker/index.js` | `_redirects` (`200`) | `.htaccess` RewriteRule | none: the export writes one copy per slug |
| `_headers` | honoured | honoured | no: `Header` directives in `.htaccess` | no custom headers at all |
| Cache control | full | full | full | none: fixed (about 10 minutes) |
| Cache busting needed | no (`no-cache` + ETag) | no | no | yes: `?v=<hash>` added by the export |
| Setup | `npm run cf:deploy` (builds `dist/` first) | connect repo, publish dir `public` | upload to the document root | `node tools/deploy-pages.mjs` |
| Watch out for | `.html` URLs are redirected; `/item/*` must reach the Worker first | 200 rewrites need `_redirects` in `public/` | `mod_rewrite` and `mod_headers` enabled | separate repo copy goes stale; project sites live under `/repo/` |

Check the host's own current documentation for limits and pricing; they change.

## Cloudflare Workers (static assets)

Files: `wrangler.jsonc` (repo root), `worker/index.js`, scripts in `tools/package.json`.

```bash
cd tools && npm install
npm run cf:login     # once
npm run cf:dev       # local, with the Worker
npm run cf:deploy
```

- `assets.directory` is `./dist`, produced by `tools/build-dist.mjs` (`cf:dev` and `cf:deploy` run it first; `npm run cf:build` builds only). `_headers` and `_redirects` are honoured. Status-200 rewrites in `_redirects` are not applied by Workers static assets, which is why the Worker does the rewrite (check current Cloudflare docs before relying on either).
- `run_worker_first: ["/<ROUTE>/*"]` (default `/item/*`) sends only the template URLs to the Worker; everything else is served straight from assets. `worker/index.js` has two constants: `ROUTE` (the URL segment of the detail pages) and `TEMPLATE` (the template file name, no `.html`). Change `ROUTE` and `run_worker_first` together; the list page and the template must have different names (list `/things`, template `/thing`: docs/data-driven-pages.md).
- `not_found_handling: "404-page"` serves `public/404.html` with a 404 status.
- **The Worker rewrites `/<singular>/<slug>` by fetching `/<singular>`, not `/<singular>.html`.** Workers static assets redirect the `.html` URL to the clean URL, which would change the address in the visitor's browser.
- `.wrangler/` (local state) is git-ignored. Edit `name` in `wrangler.jsonc` for your project.

## GitHub Pages

Pages cannot rewrite or set headers and caches everything for about 10 minutes, so `tools/export-pages.mjs` prepares a copy:

```bash
node tools/export-pages.mjs --out dist-pages --base /repo-name     # inspect the result
node tools/deploy-pages.mjs --repo owner/repo-name                 # export, commit, push, wait for the build
```

The export:
- copies `public/` and skips host-config files (`_headers`, `_redirects`, `.htaccess`); writes `.nojekyll`; ships the **bundled, minified `css/main.css`** (same `bundleCss` as `build-dist.mjs`);
- with `--base /repo`, prefixes root-absolute `href`/`src`/`action`/`poster` (a project site lives under `/repo/`); use no `--base` for a user site or custom domain. The JavaScript derives its base path from its own URL (`new URL('../', document.currentScript.src).pathname`), so loaders, canonical and schema URLs are right in both cases;
- writes one copy of the template per `<singular>/<slug>/index.html` from the `_redirects` rule and the collection JSON;
- appends `?v=<content hash>` to local CSS/JS references. The hash covers every exported file and never `.git`.

**The Pages repo is a separate copy.** It goes stale until you export and deploy again, so deploy after every change to `public/`. `deploy-pages.mjs` needs `git` and the GitHub CLI (`gh auth login`), and Pages enabled for the branch (default `gh-pages`) in the repo settings. After a deploy, hard-refresh.

Because `/data/*` cannot get its own cache headers on Pages, a JSON edit can take about 10 minutes to appear, plus the one-page-late effect of the sessionStorage cache.

## Netlify / Apache

Netlify and Cloudflare Pages: build command `node tools/build-dist.mjs`, publish directory `dist`; `_headers` and `_redirects` work as written. Apache and nginx: run `node tools/build-dist.mjs` and upload the contents of `dist/` to the document root; `.htaccess` carries the rewrite and a caching block equivalent to `_headers` (needs `mod_rewrite` and `mod_headers`). No host should serve the `@import` waterfall: if you cannot run the build, run `node tools/bundle-css.mjs --min` and replace `css/main.css` in the upload with the output.
