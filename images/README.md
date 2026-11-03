# images/

- Names: lowercase-kebab (`team-photo.jpg`). Describe content, not size.
- Formats: AVIF/WebP with a JPEG/PNG fallback via `<picture>` for photos; SVG for logos and icons.
- Always set `width` and `height` attributes (prevents layout shift) and meaningful `alt` text. Decorative images: `alt=""`.
- Below-the-fold images: `loading="lazy" decoding="async"`. The main hero image: no lazy loading, add `fetchpriority="high"`.
- Provide `srcset` + `sizes` for anything wider than ~600px.
- `icons.svg` is the icon sprite (see `.icon` component).
