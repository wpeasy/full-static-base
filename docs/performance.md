# Performance

Sites built on the base should ship fast by default. This page records the four general problems found when auditing a site with PageSpeed Insights (mobile, Slow 4G emulation) and the fix for each. Applying them moved a typical page from Performance ~96 to ~99 (First Contentful Paint 1.5s → 0.9s, Speed Index 4.4s → 2.7s) with no visual change.

Paths are relative to `public/` unless they start with `tools/` or `docs/`.

## 1. Ship ONE stylesheet (the biggest win, about 1.2s)

`css/main.css` `@import`s dozens of component files. That is perfect for editing and terrible in production: each `@import` is another round trip, discovered only after the previous CSS arrives, so the page waits on a waterfall before it can paint.

**Fix:** development keeps the readable split files; **production serves one minified `css/main.css`**.

```bash
node tools/build-dist.mjs      # public/ -> dist/, one minified css/main.css, then check-dist
```

- Pages keep linking `css/main.css`: no HTML change between development and production.
- The build skips `.DS_Store`, `main.bundle.css` and the per-component CSS; the minifier only strips comments and collapses whitespace.
- `public/` stays the hand-edited source of truth; `dist/` is git-ignored. Publish `dist/` (docs/deploy.md, docs/hosting.md). GitHub Pages: the `export-pages.mjs` export does the same bundling.

**The bundler rewrites `url(...)` paths.** Component CSS uses paths relative to its own folder (`url("../../images/x.webp")` from `css/components/`). Inlined into `css/main.css` those paths would point outside the site and images, textures and fonts would 404 silently. `tools/bundle-css.mjs` rewrites every relative `url()` for the bundle's location (absolute, `data:`, `http(s):` and `#` URLs are left alone).

## 2. Verify a bundle

`node tools/build-dist.mjs` runs `tools/check-dist.mjs` and fails if `dist/css/main.css` contains an `@import`, or any `url(...)` in it (or any local `href`/`src` in `dist/*.html`) does not resolve to a file in `dist/`. Run `node tools/check-dist.mjs` on its own any time.

That catches missing files, not wrong styles. For a change to the bundler or minifier also compare styles side by side: serve `public/` and `dist/` (`node tools/serve.mjs 8791` serves `public/`, `node tools/serve.mjs 8792 --dir dist` serves the build), load a representative page in a real browser, and hash the computed styles of every element (colour, font, spacing, display, border, size; **ignore opacity and transform**, which entrance animations change). The two hashes must match. Then look at both themes at mobile and desktop widths and confirm every image and font loads from the `dist/` build.

## 3. Preload the LCP image (late discovery)

When the largest above-the-fold image is a **CSS background** (a hero banner), the browser only finds it after the CSS arrives. Preload it from the page `<head>`, one `<link>` per art-directed variant with a `media` query:

```html
<link rel="preload" as="image" type="image/webp" fetchpriority="high" media="(max-width: 40em)" href="images/hero-mobile.webp">
<link rel="preload" as="image" type="image/webp" fetchpriority="high" media="(min-width: 40em)" href="images/hero-wide.webp">
```

The "LCP request discovery" audit then passes. An `<img>` in the HTML is discovered by the preload scanner already: give the LCP `<img>` `loading="eager"` and `fetchpriority="high"` and no extra link is needed. Preload only the LCP image; every extra preload steals bandwidth from it.

## 4. Size images to what is displayed; cache them for a week

- **Size to the largest displayed CSS size**, at 2x only where it matters (a hero or a large card). An image served at 1600px into a 400px card wastes most of its bytes (the "Improve image delivery" audit).
- **WebP, quality about 70** (`cwebp -q 70`), SVG for vector art. Accurate `width` and `height` attributes (they reserve space and stop layout shift).
- **Data-driven lists:** give items an optional smaller `thumb` (+ `thumbWidth`, `thumbHeight`) sized to the list card; the list template uses `thumb` and the detail page uses the full `image` (docs/data-driven-pages.md).
- First screen (1920×1080) `loading="eager"`, everything else `loading="lazy" decoding="async"` (docs/images.md).

## Cache policy

| Path | `Cache-Control` | |
|---|---|---|
| `/css/*`, `/js/*`, HTML | `no-cache` | unchanged: revalidate (cheap 304) so HTML never meets old CSS/JS after a deploy |
| `/fonts/*` | `public, max-age=31536000, immutable` | never edited in place |
| `/images/*` | `public, max-age=604800, stale-while-revalidate=86400` | a week; **anything longer needs versioned file names** (`hero.3f2a1c.webp`), because an edited image with the same name would stay stale |
| `/data/*` | `public, max-age=300, stale-while-revalidate=86400` | |

Set in `_headers` and `.htaccess`; reasons in docs/security.md.

## Reading PageSpeed Insights

- **Scored metrics first:** FCP, LCP, Total Blocking Time, CLS, Speed Index. These make up the score. **"Insights"/"Opportunities"** are suggestions with estimated savings, not scores: fix the ones that move a scored metric.
- **Mobile uses a throttled lab profile** (Slow 4G, slowed CPU). Its numbers will be much worse than the same page in a local browser on fast Wi-Fi, and run-to-run variance is real: compare before/after on the same device settings, and run it a few times.
- **Test the deployed `dist/` build**, not a local dev server (no compression, no caching headers, the `@import` waterfall).

**Not worth chasing** (don't spend time here):
- `js/theme-init.js` is **intentionally render-blocking**: it applies the saved theme before first paint so there is no flash of the wrong theme. It is tiny.
- Forced reflow and long tasks come from the vendored Alpine, GSAP and Flip, not from the site's own code.
- HSTS, COOP and Trusted Types findings are informational; the CSP and headers already set are deliberate (docs/security.md).
