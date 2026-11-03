# Data-driven pages (JSON + one template)

For a list of entities (people, products, locations), keep the content in **one JSON file** and show it with **one template page** filled by JavaScript. No build step, no generated pages. Worked example: `data/items.json`, `items.html` (list), `item.html` (template), `js/items-data.js`, `js/items-list.js`, `js/item-profile.js`, `js/seo.js`.

> Do not generate one static HTML file per entity with a script. The pattern here is client-side by design.

## 1. The JSON

`data/<collection>.json`:

| Key | Contents |
|---|---|
| `note` | what the file is and who edits it |
| `site` | `name`, `url`, `locale`, `language`, `themeColor`, `shareImage` (+ `shareImageAlt`, `…Width`, `…Height`), `organisation` facts (`type`, `name`, `description`, `logo`, `sameAs`, and only the contact facts you really have), `offers`, `home` (`title`, `description`), `collection` (`name`, `description`, `path`, `cta`) |
| lookup tables | e.g. `topics`: `{ "design": "Design" }`. Chips and labels are built from these, never hand-typed |
| the item array | `items: [{ name, role, place, summary, bio[], tags[], slug?, seoTitle?, seoDescription? }]` |

**Slug**: an item may set `slug`; otherwise it is the sluggified name: NFKD, strip accents, lowercase, non-alphanumerics to hyphens (`Amélie Dubois` → `amelie-dubois`).

## 2. URLs and hosting

Scheme: `/<singular>/<slug>` (for example `/item/amelie-dubois`), all answered by `item.html`. The host must rewrite `/<singular>/*` to the template:

| Host | Config |
|---|---|
| Netlify / Cloudflare Pages | `_redirects`: `/item/*  /item.html  200` |
| Apache | `.htaccess`: `RewriteRule ^item/[^/.]+/?$ /item.html [L]` |
| Local | `node tools/serve.mjs` (reads `_redirects`; port 8765, `--port` to change; 404.html fallback; no caching) |

`python3 -m http.server` cannot rewrite; use `serve.mjs`. `item.html?slug=amelie-dubois` also works as a fallback.

**Root-absolute paths**: the template is served from a deeper path (`/item/x`), so every asset and link in it starts with `/` (`/css/main.css`). Mark it with `<html data-root-absolute>`; `node tools/sync-shared.mjs` then prefixes the shared header and footer, and `check.mjs` ignores a leading `/` when comparing them.

## 3. Loader: `js/<collection>-data.js`

Fetches the JSON **once** (the promise is cached), resolves the URL relative to the script (`new URL('../data/items.json', document.currentScript.src)`), adds each item's `slug`, and exposes `window.ItemData` = `{ load(), slugify(), pageUrl(slug), slugFromLocation() }`. `slugFromLocation()` reads `/item/<slug>`, `/item/<slug>/` or `?slug=`. To add a collection, copy the file and change the constants.

## 4. The template page

`js/item-profile.js` is `Alpine.data('itemProfile')` with `status`: `loading | ready | missing | error`.

- Give the component an **empty-shaped object** so bindings work before data arrives.
- Fill with `x-text`, `:href` and `<template x-for>`. For conditional blocks use **`:hidden`**, not `x-show`, with `[hidden] { display: none }` rules (`css/components/profile.css`).
- **One `<h1>` outside any `<template>`**, bound to a heading that reads "Loading…", the name, or "Not found". `check.mjs` blanks `<template>` contents, so this keeps exactly one h1.
- A `<noscript>` message with a link back.
- **Missing slug**: friendly not-found state and `noindex` (the canonical and JSON-LD are removed). The host still answers **200**, a soft 404. For a real 404 where the host allows, list each slug before a catch-all in `_redirects`:

```
/item/sam-rivera       /item.html  200
/item/amelie-dubois    /item.html  200
/item/*                /404.html   404
```

(Regenerate that list from the JSON when items change, or use an edge function.)

## 5. The list page

`js/items-list.js` extends the generic `gridFilter` (`js/grid-filter.js`). Cards are `<template x-for="item in items" :key="item.slug">`; chips come from the lookup table. Filtering and search match on the **data fields** (`matchesItem(item, query, tag)`), not on `textContent`, which is empty when an item is first inserted. `query` and `tag` are passed in so Alpine tracks them. The GSAP Flip behaviour (including the held and eased grid height) and the reduced-motion rule are unchanged: see docs/motion.md.

Note: the base class method is `elements()`, because `items` is the data array here.

## 6. SEO from the same JSON

Titles, descriptions, Open Graph tags and JSON-LD are built from the JSON with `Seo.setSeo` (docs/seo.md): ProfilePage + Person + BreadcrumbList on the item page, ItemList on the list page. Keep the generic static tags in the template as the no-JS fallback.

## 7. Sitemap

`node tools/build-sitemap.mjs` rewrites the item URLs in `sitemap.xml` between `<!-- items:start -->` and `<!-- items:end -->` from the JSON (`site.url`). Run it whenever the JSON changes, and check `robots.txt` names the same sitemap.

## 8. Trade-offs

Crawlers that do not run JavaScript, and social-share scrapers, see only the generic tags in the template. Google runs JavaScript, so titles and schema still work for search. Per-item link previews need pre-rendering or an edge function, which the team must choose explicitly (docs/seo.md).
