---
name: new-brand-guide
description: Generate the site's brand and design guide page (public/brand-guide.html) from templates/brand-guide.template.html, rendered from the live theme tokens. Use when asked for a style guide, brand guide, design guide or design-system page for the site.
---

First read `AGENTS.md`, then follow `docs/brand-guide.md` exactly.

In short: copy `templates/brand-guide.template.html` to `public/brand-guide.html`; fill every `{{PLACEHOLDER}}` from the real brief, `public/css/theme.css`, `public/css/fonts.css` and the logo and image files that exist; delete sections and `AGENT:` comments you don't need; compute (never guess) hex values and contrast ratios; never invent brand facts (list what is missing for the user). Keep `noindex` and `data-page="styleguide"`; do not add the page to `sitemap.xml`.

Then run `node tools/check.mjs`, confirm no `{{` remains, and check light/dark/auto, 320/768/1280, keyboard and reduced motion.

Paths in the docs are relative to `public/` (the only published folder) unless they start with `tools/`, `docs/`, `templates/` or `themes/`.
