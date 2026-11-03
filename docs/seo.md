# SEO and structured data

SEO and schema are part of every page, not an add-on. A page without a real title, description, canonical, share tags and the right JSON-LD is not done. `tools/check.mjs` warns about what it can detect.

## Every page needs

| Item | Rule |
|---|---|
| `<title>` | unique, **60 characters or fewer**, written from the real page content in the site's language and voice |
| `meta name="description"` | unique, **160 characters or fewer**, a real summary with a reason to click |
| `link rel="canonical"` | absolute URL of this page |
| `meta name="robots"` | `index, follow`; `noindex` for 404, thank-you and not-found states |
| `meta name="theme-color"` | brand colour for browser chrome |
| Open Graph | `og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:url`, `og:image` (+ `:width`, `:height`, `:alt`) |
| Twitter | `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description` |
| JSON-LD | the type from the table below |

`_template.html` carries a default block with obvious placeholders. Replace every one. Never leave "Page title" or `example.com` on a real page.

## JSON-LD is data, not script

`<script type="application/ld+json">` holds JSON that the browser never executes. It does not count as an inline script for the "no inline scripts" rule and is not blocked by a CSP `script-src`. `node tools/check.mjs` errors if a block is not valid JSON.

## Which schema where

| Page | Schema |
|---|---|
| Home | `Organization` (or the right subtype: `ExerciseGym`, `Restaurant`, `Dentist`, `LocalBusiness`…) + `WebSite` + `WebPage` |
| Any list page | `ItemList` (+ `WebPage`, `BreadcrumbList`) |
| Person / team member | `ProfilePage` with `Person` as `mainEntity` |
| Product, service | `Product` / `Service` with `Offer` |
| Event | `Event` |
| Article, post | `Article` / `BlogPosting` |
| Recipe, job | `Recipe`, `JobPosting` |
| Visible FAQ | `FAQPage` (only if the Q&A are visible on the page) |
| Any page with a breadcrumb | `BreadcrumbList` |
| Contact page | `ContactPage`; `ContactPoint` on the `Organization` |
| Prices, plans | `OfferCatalog` containing `Offer`s with `UnitPriceSpecification` / `PriceSpecification` |

### Rules

- **Stable `@id`s**, then reference instead of duplicating: `https://site/#organization`, `https://site/#website`, `<page url>#webpage`, `<page url>#person`. Use `{ "@id": "…" }` to point at a node.
- **Only mark up what is visible on the page.**
- **Never invent data**: no fake ratings, reviews, addresses, phone numbers, opening hours or prices. If a property is unknown, leave it out and add it to the "still to supply" list for the client.
- One `@graph` per page.

## When content comes from JSON, SEO comes from the same JSON

Do not hand-write a second copy of titles, descriptions or schema. `js/seo.js` builds them from the data (see [data-driven-pages.md](data-driven-pages.md)):

```js
Seo.setSeo({ site, title, description, path, type: 'profile', graph: [ …builders ], noindex: false });
```

- `setSeo` updates `<title>`, description, canonical, robots, theme-color, Open Graph, Twitter tags and the JSON-LD block (`setMeta`, `setLink`, `setJsonLd` are exported too).
- URLs are made absolute with `location.origin`, so the same code is correct on localhost and on the live domain.
- Derived defaults: `${name} | ${role} in ${place} | ${site.name}` and `${summary} ${cta}`. An item may override with `seoTitle` / `seoDescription`.
- It `console.warn`s when a title or description exceeds the limits.
- Builders in `Seo.builders`: `organisation`, `offerCatalog`, `website`, `webPage`, `person`, `breadcrumb`, `itemList`. They only emit properties present in the data.
- Keep the generic static tags in the HTML as the fallback for visitors without JS and for scrapers.

## Honest limits

Link-preview scrapers (Facebook, LinkedIn, Slack, messaging apps) and some crawlers **do not run JavaScript**, so for JSON-driven pages they see only the generic tags in the template. Google does run JavaScript, so titles, descriptions and schema set by `js/seo.js` still count for search. If a project needs a correct preview for every item, the choices are **pre-rendering** (a build step) or an **edge function** that rewrites the tags. That changes the "no build step" promise, so the team must choose it explicitly.

## Sitemap and robots

- Every public page is in `sitemap.xml` (not 404, `_template.html`, style guide pages, or the item template itself).
- Item URLs are generated: `node tools/build-sitemap.mjs`.
- `robots.txt` points at `https://<domain>/sitemap.xml`. Update it when the domain is known.

## Checklist when writing a page

1. Write the title and description from the real content.
2. Choose the schema type from the table.
3. Add breadcrumbs and `BreadcrumbList`.
4. Add the page to `sitemap.xml`.
5. List the business facts you do not have (phone, address, hours, social profiles, logo) and ask the client for them.
