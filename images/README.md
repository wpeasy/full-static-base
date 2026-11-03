# images/

- Raster images are **WebP** (convert JPEG/PNG/GIF and delete the originals); logos and icons are SVG. See [docs/images.md](../docs/images.md).
- `icons.svg` is the icon sprite; `favicon.svg` the favicon; `og.svg` a placeholder share image (replace it with a 1200×630 image).
- In pages: `loading="eager"` for what is inside the first 1920×1080 screen (including the header logo), `loading="lazy" decoding="async"` for everything else, and always `width`/`height`.
