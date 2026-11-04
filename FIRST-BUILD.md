# First build pending

This file is a flag. **While it exists, no real site has been built from this repo yet** and `public/` still holds the framework's sample pages. The first time you are asked to build anything (a site, a page, a component, a theme), do the clean-out below **before** doing the work, then delete this file.

Not the first build? If this file is absent, ignore it: never clear `public/` again.

## 1. Confirm the state

Run `git status` and look in `public/`. Only proceed if the sample pages are still there (`public/index.html` mentions "Site name" or example content) and nothing has been built. If the site already contains real work but this file is still here, do **not** delete anything: delete only this file and tell the user.

Commit or stash any uncommitted work first so the clean-out is a single reviewable commit.

## 2. Remove the sample content

Delete from `public/`:

| Remove | Why |
|---|---|
| `index.html`, `article.html`, `contact.html`, `items.html`, `item.html` | Sample pages |
| `data/items.json` (and the `data/` folder if empty) | Sample collection |
| `images/og.svg` | Placeholder share image |
| `.DS_Store` and any other stray system files | Noise |

Reset (rewrite, do not delete):

| File | Reset to |
|---|---|
| `sitemap.xml` | An empty `<urlset>` with the comment "One `<url>` per public page" and no `<url>` entries; pages are added as they are built |
| `robots.txt` | Keep as is; the domain is set when it is known |
| `404.html` | Rewrite for the new site when you build it (keep the file) |
| `_template.html` (repo root) | Replace the nav and footer links to the sample pages with the new site's pages once the sitemap is planned; run `node tools/sync-shared.mjs` |

**Keep everything else.** `css/`, `js/`, `images/icons.svg`, `images/favicon.svg` (replace when a logo exists), `styleguide.html`, `components.html`, `_headers`, `_redirects`, `.htaccess` and the vendor libraries are the framework, not sample content. If the new site has no data-driven collection and you are certain nothing uses them, you may also remove `js/items-data.js`, `js/items-list.js` and `js/item-profile.js`; leave `js/grid-filter.js`, `js/seo.js` and the rest.

The sample pages stay available in git history (`git log --diff-filter=D -- public/index.html`, then `git show <commit>^:public/index.html`) and in the upstream framework repo if you need a reference implementation.

## 3. Close it out

1. Delete this file (`FIRST-BUILD.md`).
2. Add a line to `DESIGN-NOTES.md` under site deviations: `YYYY-MM-DD · public/ · first build: sample pages removed · fresh start`.
3. Run `node tools/check.mjs`. Dangling links from `_template.html`, the style guide or the gallery to deleted pages are expected until the new pages exist; fix them as you build.
4. Commit the clean-out on its own (`First build: clear sample content`), then start the actual build following `docs/workflows.md`.
