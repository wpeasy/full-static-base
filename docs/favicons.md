# Favicons

**A favicon must be in a format that works everywhere. An SVG alone is not enough.**

| Format | Works in | Fails in |
|---|---|---|
| `favicon.svg` | Chrome, Edge, Firefox (modern) | **Safari** (desktop and iOS tabs), many crawlers and link previewers, older browsers |
| `favicon.ico` (16/32/48 inside one file) | every browser and tool; browsers still request `/favicon.ico` by default | nothing |
| `apple-touch-icon.png` (180×180) | iOS home screen, Safari | |
| `icon-192.png` / `icon-512.png` (in the manifest) | Android, installed apps | |

Search engines want a PNG or ICO that is a multiple of 48px (the ICO's 48px frame covers it). Shipping only `favicon.svg` is the mistake this page exists to prevent: the site looks fine in Chrome and shows no icon in Safari.

## The set (all files at the site root of `public/`, except the SVG)

```
public/favicon.ico              16 + 32 + 48 px, the universal fallback (keep it at the root: browsers ask for /favicon.ico)
public/images/favicon.svg       the vector icon for modern browsers (optional but recommended: sharp, can adapt to dark mode)
public/apple-touch-icon.png     180x180, opaque background (iOS paints transparency black)
public/icon-192.png             192x192, listed in the manifest
public/icon-512.png             512x512, listed in the manifest
public/icon-maskable-512.png    512x512, icon at 66% on an opaque background (Android adaptive icons crop to a shape)
public/site.webmanifest         name, colours and the two icons (edit name/short_name/theme_color)
```

## One command (or the `generate-icons` skill)

Give the client's single icon file to the **`generate-icons` skill** (`.claude/skills/generate-icons`): it inspects the file, picks the background colour from the theme, runs the tool, checks the legibility preview, wires the manifest and verifies. Or run the tool yourself:

```bash
node tools/make-favicons.mjs                                              # from public/images/favicon.svg
node tools/make-favicons.mjs path/to/mark.svg --bg "#0F1419" --preview p.png   # SVG source: copied to images/favicon.svg
node tools/make-favicons.mjs path/to/mark.png --bg "#0F1419" --no-svg           # raster source: no SVG to serve
```

Source: SVG (best) or PNG/WebP/JPEG/ICO, at least 512×512 if raster; any aspect ratio (fitted into a square). It writes `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `icon-maskable-512.png` into `public/`, copies an SVG source to `images/favicon.svg`, and updates the icons in `site.webmanifest`. With a raster source `--no-svg` removes the SVG `<link>` from the pages and deletes `images/favicon.svg`. `--trim` removes transparent margins around the artwork first (use it when the supplied tile has built-in padding, which wastes pixels at 16px). `--bg` fills the apple-touch and maskable icons (pick a colour that contrasts with the mark). `--preview file.png` writes a contact sheet of the 16/32/48px frames on light and dark so you can judge legibility. Needs ImageMagick (`magick`); an SVG is rasterised with `rsvg-convert` or headless Chrome, because ImageMagick's own SVG renderer can drop strokes and arcs. Use the brand **mark** (not the full logo with text): it must read at 16px; simplify it if it turns to mush.

## The `<head>` (every page, and `_template.html`)

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

- The `.ico` link comes **first** with `sizes="32x32"`: browsers that support SVG then pick the SVG, the rest use the ICO.
- Paths are root-absolute (`/…`) so they work from `/item/some-slug` too. The GitHub Pages export prefixes them for a project site.
- Update `theme-color` in `site.webmanifest` and in the `<meta name="theme-color">` together.
- Do not convert these PNGs to WebP: favicons and touch icons must be PNG/ICO. `tools/check.mjs` exempts them from the WebP rule.

## Checks

`node tools/check.mjs` **errors** on any page without a `<link rel="icon">` pointing at a `.ico` or `.png`, warns when `apple-touch-icon` is missing, and errors when a linked icon file does not exist. Style guide pages are skipped. Caching for the icons is a week (`_headers`, `.htaccess`).
