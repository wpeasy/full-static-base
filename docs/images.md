# Images

Rules for every image on every page. `tools/check.mjs` enforces the checkable parts.

## 1. Format: WebP

- **Convert every JPEG, PNG and GIF to WebP** and delete the original. Do this whenever you add or receive an image, including images supplied by the client.
- Keep **SVG** for logos, icons and illustrations (vector), and AVIF is acceptable. No other raster formats in `images/`.
- Photos: quality about 80. Graphics with flat colour or transparency: `-lossless` or quality 90.
- Animated GIF becomes animated WebP (or, better, a muted looping `<video>` with a pause control, gated by reduced motion: docs/motion.md).

```bash
cwebp -q 80 photo.jpg -o photo.webp            # brew install webp
cwebp -lossless logo.png -o logo.webp
gif2webp -q 80 loop.gif -o loop.webp           # animated
magick photo.jpg -quality 80 photo.webp        # ImageMagick alternative
```

Resize before converting: never ship more pixels than the largest size the image is displayed at (2x for sharp screens). Name files for what they show (`team-sam-rivera.webp`), not `IMG_0042`.

## 2. Loading: eager above the fold, lazy for the rest

Judge "above the fold" on a standard **1920×1080** (1080p) screen at first load, before any scrolling.

- **Everything that appears inside that first screen: `loading="eager"`.** This always includes the logo in the shared header (every page) and the hero image. Give the single largest one (the likely LCP image) `fetchpriority="high"` as well.
- **Everything below it: `loading="lazy" decoding="async"`.** This is the browser's built-in lazy loading: no JavaScript, no library.
- Every `<img>` states one or the other explicitly. Never lazy-load an image that is visible on first paint (it delays it).
- Also set `loading="lazy"` on below-the-fold `<iframe>`s.
- Always set `width` and `height` (the intrinsic size) so the layout does not jump; CSS makes them fluid.
- Use `<img>`, not a CSS `background-image`, for content images (backgrounds cannot be lazy, and have no alt text). Decorative backgrounds may stay in CSS.
- Responsive images: `srcset` + `sizes`; art direction with `<picture>`.

```html
<!-- header logo and hero: inside the first 1920x1080 -->
<img class="nav__logo" src="images/logo.webp" alt="Site name, home" width="153" height="20" loading="eager">
<img class="hero__image" src="images/hero.webp" alt="…" width="1200" height="800" loading="eager" fetchpriority="high">

<!-- everything further down -->
<img class="card__media" src="images/team-sam.webp" alt="…" width="640" height="480" loading="lazy" decoding="async">
```

## 3. Always

- Meaningful `alt` text, or `alt=""` for decoration (docs/accessibility.md).
- Share image for links (`og:image`, 1200×630): see docs/seo.md. WebP/PNG/JPEG are accepted by most scrapers; some still prefer JPEG or PNG, so check the targets that matter to the client.

## Checks

`node tools/check.mjs` errors on a JPEG/PNG/GIF `src` in an `<img>`, and warns on a missing `loading`, missing `width`/`height`, and raster leftovers in `images/`. Whether an image really is inside the first 1080p screen is a judgement call: look at the page at 1920×1080.
