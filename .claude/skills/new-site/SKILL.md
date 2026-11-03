---
name: new-site
description: Set up a new static site from this framework: choose a theme preset, tune the theme, plan pages and components. Use when starting a new site or re-theming one.
---

First read `AGENTS.md` (foundation principle; semantics, accessibility and reduced-motion rules) and then follow the **New site** workflow in `docs/workflows.md` exactly. Use `TOKENS.md` and `COMPONENTS.md` instead of reading all CSS. Finish by running `node tools/check.mjs` and the Definition of done in `AGENTS.md`.

Also: write real titles and descriptions, choose the schema type from `docs/seo.md`, convert images to WebP (`docs/images.md`), add pages to `sitemap.xml`, and list the missing business facts to ask the client for.

Paths in the docs are relative to `public/` (the only published folder) unless they start with `tools/`, `docs/` or `themes/`.
