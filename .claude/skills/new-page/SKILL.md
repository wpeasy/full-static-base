---
name: new-page
description: Create a new page from _template.html with correct semantics, accessibility and navigation. Use when adding a page to the site.
---

First read `AGENTS.md` (foundation principle; semantics, accessibility and reduced-motion rules) and then follow the **New page** workflow in `docs/workflows.md` exactly. Use `TOKENS.md` and `COMPONENTS.md` instead of reading all CSS. Finish by running `node tools/check.mjs` and the Definition of done in `AGENTS.md`.

Also: write a real title and description, choose the schema type from the table in `docs/seo.md`, add breadcrumbs and `BreadcrumbList`, use WebP images with eager/lazy loading (`docs/images.md`), add the page to `sitemap.xml`, and list any missing business facts for the client.

Paths in the docs are relative to `public/` (the only published folder) unless they start with `tools/`, `docs/` or `themes/`.
