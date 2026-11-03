---
name: audit
description: Audit the site for semantics, accessibility, reduced motion, token and BEM drift, and report by severity. Use when asked to review, audit or check the site.
---

First read `AGENTS.md` (foundation principle; semantics, accessibility and reduced-motion rules) and then follow the **Audit an existing site** workflow in `docs/workflows.md` exactly. Use `TOKENS.md` and `COMPONENTS.md` instead of reading all CSS. Finish by running `node tools/check.mjs` and the Definition of done in `AGENTS.md`.

Include an SEO and schema pass: titles, descriptions, canonical, OG image, JSON-LD that parses, nothing invented, image formats and loading, sitemap.

Paths in the docs are relative to `public/` (the only published folder) unless they start with `tools/`, `docs/` or `themes/`.
