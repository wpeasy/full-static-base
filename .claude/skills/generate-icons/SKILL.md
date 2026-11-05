---
name: generate-icons
description: Generate every icon the site needs (favicon.ico, apple-touch-icon, manifest icons, maskable icon, SVG favicon) from the single icon file a client supplied, and wire them into the pages. Use when given a logo mark or icon file, or asked for favicons, app icons or touch icons.
---

First read `AGENTS.md` and `docs/favicons.md`. The rule: **an SVG favicon alone is not enough** (Safari and crawlers ignore it), so the site ships a full set generated from the client's one icon.

## 1. Get and inspect the source

- Ask for the file if none was named. Prefer **SVG**; otherwise a **PNG/WebP/JPEG of at least 512×512** (1024+ is better); an `.ico` works but is usually small. Keep the client's original outside `public/` (it is development material).
- Use the brand **mark** (the symbol), not the full logo with text: it has to read at 16px. If the client only gave a wordmark or a logo with text, say so and ask for a mark or agree a simplification (initial or symbol) before generating.
- Inspect it: `magick identify <file>` (size, transparency). Look at it (Read the image). Note if it is not square or is small.

## 2. Choose the background colour

`--bg` fills the **apple-touch-icon** (iOS paints transparency black) and the **maskable icon** (Android crops it to a shape). Pick a colour from `public/css/theme.css` that gives the mark good contrast: a white or light mark needs the dark surface or the brand colour; a dark or coloured mark usually wants white or the light surface. Convert the OKLCH value to hex. If the icon already sits on its own solid background (a rounded square, say), use that same colour so the maskable icon fills the shape instead of showing a small tile on white. When unsure, ask the user.

## 3. Generate

```bash
# SVG source (the usual case): copies it to public/images/favicon.svg and builds the rest
node tools/make-favicons.mjs path/to/mark.svg --bg "#0F1419" --preview /private/tmp/icon-preview.png

# Raster source (PNG/WebP/JPEG): no vector to serve, so add --no-svg (it also removes the SVG <link> from the pages)
node tools/make-favicons.mjs path/to/mark.png --bg "#0F1419" --no-svg --preview /private/tmp/icon-preview.png
```

(Put the preview in the session's scratchpad directory, not in `public/`.) It writes into `public/`: `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (icon at 66% on `--bg`), `images/favicon.svg` (SVG source only), and updates the icons in `site.webmanifest`. It needs ImageMagick; an SVG is rasterised with `rsvg-convert` or headless Chrome (ImageMagick's own SVG renderer can drop strokes and arcs, which is why the preview matters).

## 4. Judge the result: look at the preview

Open the preview (Read the image): the 16, 32 and 48px frames magnified on light and dark, then the 180px touch icon. If the mark turns to mush at 16px, or vanishes on a light or dark tab, **stop and tell the user**: ask for a simplified mark rather than shipping an illegible favicon. Check the maskable icon too (the mark must sit well inside the centre).

## 5. Wire it up

- Pages and `_template.html` already carry the four `<link>`s (`/favicon.ico`, `/images/favicon.svg`, `/apple-touch-icon.png`, `/site.webmanifest`); `--no-svg` removes the SVG one. Confirm with `grep -n "icon\|manifest" _template.html`.
- Edit `public/site.webmanifest`: real `name`, `short_name`, and `theme_color` / `background_color` from the theme. Keep the `<meta name="theme-color">` in the pages in step with it.
- Do not convert these PNGs to WebP (favicons and touch icons must be PNG/ICO). Do not put the client's source file in `public/`.
- Social share images are a different job (docs/seo.md): this skill does not make them.

## 6. Verify

`node tools/check.mjs` (errors without an `.ico`/`.png` icon link or if a linked icon file is missing), `node tools/build-dist.mjs`, then `node tools/serve.mjs` and confirm `/favicon.ico`, `/apple-touch-icon.png`, `/site.webmanifest` return 200 with the right type, including from a nested URL such as `/item/<slug>`. Add a line to `DESIGN-NOTES.md` if you changed the tool. Report what was generated, the `--bg` you chose and why, and anything you could not check (for example Safari).
