# Test brief: Banksia Build Co.

A fictional client (Gold Coast carpenter and builder) with a brief, mood board, logo pack, fonts and content, for testing the framework. Not published: it sits at the repo root, outside `public/`.

| Path | Purpose |
|---|---|
| [brief.pdf](brief.pdf) | The website brief from the agency (Tidewater Creative) as a designed PDF, the way a real agency would send it. Source: `brief.md` rendered through `brief.html` |
| [brief.md](brief.md) | Same brief as Markdown, for easy reading by tools and agents |
| [moodboard/moodboard.pdf](moodboard/moodboard.pdf) | 10-page mood board. Source: `moodboard/moodboard.html` |
| [logo-pack/](logo-pack/) | Logos (light, dark, mono), favicon and app icons, social images, header images |
| [assets/fonts/](assets/fonts/) | Barlow Condensed, Figtree, DM Mono as woff2 plus `fonts.css` (self-hosted, no Google requests) |
| [assets/content/](assets/content/) | site, services, projects, reviews, FAQs and journal outlines as JSON. Missing facts are `null` on purpose |
| [assets/images/](assets/images/) | Blueprint grid and timber grain textures |

## Suggested test run

1. Read `brief.md` and open `moodboard/moodboard.pdf`.
2. Copy `assets/fonts/*` into `public/fonts/` and wire `fonts.css` (docs/fonts.md).
3. Set `public/css/theme.css` from the brief's colour tokens, dark by default.
4. Copy `logo-pack/headers/*`, `favicon/*` and chosen social images into `public/images/`.
5. Build the pages in the sitemap, then run `node tools/check.mjs`.

## Regenerating the mood board

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --user-data-dir=/tmp/pdf-profile --print-to-pdf=moodboard/moodboard.pdf moodboard/moodboard.html
```

Regenerating the brief PDF after editing `brief.md`: `brief.html` is generated from `brief.md`; print it with the same Chrome command, pointing at `brief.html` and `brief.pdf`.
