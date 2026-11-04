# Images

Rules for every image on every page. `tools/check.mjs` enforces the checkable parts.

## 0. Size

Export each image at the largest size it is **displayed** (CSS pixels; 2x only for heroes and large cards), never the camera original. Data-driven lists use a smaller `thumb` per item. Full guidance, LCP preload and caching: [performance.md](performance.md).

## 1. Format: WebP, then interim sizes

**Every image you add goes through one command**, whether it arrives as a JPEG/PNG or is already a WebP. It converts to WebP (if needed), keeps the full-size `<name>.webp`, and makes the interim sizes for `srcset` in the same step:

```bash
node tools/make-image-sizes.mjs public/images/team.jpg --delete-original   # JPEG/PNG: convert, delete the original, make sizes
node tools/make-image-sizes.mjs public/images/hero.webp                    # already WebP: make sizes
node tools/make-image-sizes.mjs public/images                              # a whole folder (skips generated sizes, og/favicon/icons, small images)
```

It writes `hero-480.webp`, `hero-800.webp`, `hero-1200.webp`, `hero-1600.webp` next to `hero.webp` (the largest), never upscales, uses quality 70, and prints the `srcset` and `width`/`height` to paste (section 4). It needs ImageMagick (`magick`) or libwebp (`cwebp`) installed on the machine; the site itself needs neither. Options: `--widths 480,800,1200,1600`, `--quality 70`, `--dry`.

### Format rules

- **Convert every JPEG, PNG and GIF to WebP** and delete the original. Do this whenever you add or receive an image, including images supplied by the client.
- Keep **SVG** for logos, icons and illustrations (vector), and AVIF is acceptable. No other raster formats in `images/`.
- Photos: quality about 70 to 80 (`-q 70` is usually indistinguishable and smaller). Graphics with flat colour or transparency: `-lossless` or quality 90.
- Animated GIF becomes animated WebP (or, better, a muted looping `<video>` with a pause control, gated by reduced motion: docs/motion.md).

```bash
cwebp -q 80 photo.jpg -o photo.webp            # brew install webp
cwebp -lossless logo.png -o logo.webp
gif2webp -q 80 loop.gif -o loop.webp           # animated
magick photo.jpg -quality 80 photo.webp        # ImageMagick alternative
```

Never ship more pixels than the largest size the image is displayed at (2x for sharp screens): downscale a camera original to about 2400px wide (or the largest display size at 2x) *before* running the command, so the largest candidate is not wasteful. Name files for what they show (`team-sam-rivera.webp`), not `IMG_0042`.

## 2. Loading: eager above the fold, lazy for the rest

Judge "above the fold" on a standard **1920×1080** (1080p) screen at first load, before any scrolling.

- **Everything that appears inside that first screen: `loading="eager"`.** This always includes the logo in the shared header (every page) and the hero image. Give the single largest one (the likely LCP image) `fetchpriority="high"` as well.
- **Everything below it: `loading="lazy" decoding="async"`.** This is the browser's built-in lazy loading: no JavaScript, no library.
- Every `<img>` states one or the other explicitly. Never lazy-load an image that is visible on first paint (it delays it).
- Also set `loading="lazy"` on below-the-fold `<iframe>`s.
- Always set `width` and `height` (the intrinsic size) so the layout does not jump; CSS makes them fluid.
- Use `<img>`, not a CSS `background-image`, for content images (backgrounds cannot be lazy, and have no alt text). Decorative backgrounds may stay in CSS.
- Responsive images: `srcset` + `sizes`; art direction with `<picture>` (section 4).

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

## 4. Responsive images: `srcset` and `sizes`

The browser picks the smallest candidate that is sharp enough for the displayed size and the screen's pixel density, so a phone downloads the 480px file and a desktop the 1600px one.

```html
<img class="card__media"
     src="images/team.webp"
     srcset="images/team-480.webp 480w, images/team-800.webp 800w, images/team-1200.webp 1200w, images/team.webp 1920w"
     sizes="(min-width: 64em) 33vw, (min-width: 40em) 50vw, 100vw"
     alt="…" width="1920" height="1080" loading="lazy" decoding="async">
```

- **`src`** is the full-size file (the fallback); **`width`/`height`** are its intrinsic size (the script prints them).
- **`srcset`** lists every size with its real width and a `w` descriptor. The script prints it; paste it.
- **`sizes` is the part people get wrong: it is the width the image is *displayed* at, not the file width.** Without it the browser assumes `100vw` and downloads too much. Measure the displayed width at 320, 768, 1280 and 1920 (DevTools, or `img.getBoundingClientRect().width`) and write the breakpoints that match the layout: a full-bleed hero `100vw`; a card in a 3-column grid `(min-width: 64em) 33vw, (min-width: 40em) 50vw, 100vw`; an image capped by the container `(min-width: 80em) 1200px, 100vw`. Breakpoints use the same `em` values as the CSS (40em, 48em, 64em, 80em).
- **Art direction** (a different crop on mobile) uses `<picture>` with `media` on each `<source>`; generate the sizes for each crop. Keep the `<img>` inside with `alt`, `width`, `height` and `loading`.
- **The LCP image** keeps `loading="eager"` and `fetchpriority="high"`. If it is preloaded, give the preload the same candidates so the browser fetches the right one: `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="images/hero-800.webp 800w, images/hero.webp 1920w" imagesizes="100vw">` (docs/performance.md).
- **CSS background images** (decorative, hero banners) cannot use `srcset`; use `image-set()` or a media query per variant and preload each (docs/performance.md).
- **Skip it** for SVG, for images 800px wide or narrower (one file is enough), for the header logo and icons, for favicons and the share image (`og.webp`, 1200×630). The script and `check.mjs` skip these automatically.
- **Data-driven lists** use the item's `thumb` for cards (docs/data-driven-pages.md); the detail page uses `image` with `srcset`.
- Re-run the script when you replace an image, and delete stale `-NNN` files you no longer reference.

## Checks

`node tools/check.mjs` errors on a JPEG/PNG/GIF `src` in an `<img>` and on a `srcset` file that does not exist, and warns on a missing `loading`, missing `width`/`height`, raster leftovers in `images/`, a `srcset` with `w` descriptors but no `sizes`, and a local WebP wider than 800px with no `srcset` (not inside `<picture>`). Whether an image really is inside the first 1080p screen is a judgement call: look at the page at 1920×1080.
