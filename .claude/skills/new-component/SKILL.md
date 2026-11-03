---
name: new-component
description: Create or change a BEM component, including its CSS, main.css import, gallery entry and docs. Use when the design needs a block that does not exist or an existing one must change.
---

First read `AGENTS.md` (foundation principle; semantics, accessibility and reduced-motion rules) and then follow the **New component** workflow in `docs/workflows.md` exactly. Use `TOKENS.md` and `COMPONENTS.md` instead of reading all CSS. Finish by running `node tools/check.mjs` and the Definition of done in `AGENTS.md`.

Paths in the docs are relative to `public/` (the only published folder) unless they start with `tools/`, `docs/` or `themes/`.
