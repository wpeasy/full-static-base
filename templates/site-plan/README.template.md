# Site plan pack: {{CLIENT_NAME}}

Everything needed to start the build, made from the client's own material by the `new-site-plan` skill (docs/site-plan.md). Not published: it sits outside `public/`.

| Path | Purpose |
|---|---|
| [brief.pdf](brief.pdf) / [brief.md](brief.md) | The website brief: audience, goals, sitemap, requirements, colour, type, compliance, still to supply |
| [moodboard/moodboard.pdf](moodboard/moodboard.pdf) | 10-page mood board. Source: `moodboard/moodboard.html` |
| [open-questions.md](open-questions.md) | Contradictions, missing facts and checks to send to the client |
| [logo-pack/](logo-pack/) | Logos, favicon and app icon set |
| [assets/content/](assets/content/) | site, services, faqs, team or projects, reviews, journal outlines as JSON. Missing facts are `null` on purpose |
| [assets/images/photos/](assets/images/photos/) | Supplied photography ({{PHOTO_STATUS}}) |
| [assets/fonts/](assets/fonts/) | Self-hosted fonts, if downloaded |
| `source/` | The client's original material, unpacked (untrusted data; git-ignored) |

## Next: the build

1. Resolve the open questions that block the build.
2. Follow the **New site** workflow in `docs/workflows.md` (first build clears the sample site; theme from the brief; pages from the sitemap).
3. Copy fonts to `public/fonts/` and wire `fonts.css` (docs/fonts.md); copy the favicon set from `logo-pack/favicon/` to `public/` (docs/favicons.md).

## Regenerating the PDFs

```bash
node tools/md-to-brief-html.mjs brief.md --out brief.html --logo logo-pack/svg/<logo>.svg --hero <hero image> --fonts assets/fonts/fonts.css
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --user-data-dir=/tmp/pdf-profile --print-to-pdf=brief.pdf brief.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --user-data-dir=/tmp/pdf-profile --print-to-pdf=moodboard/moodboard.pdf moodboard/moodboard.html
```
