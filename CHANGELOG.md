# Changelog

Framework versions follow `VERSION`. Upgrading a project = overwrite `css/core/*`, `tools/*`, `docs/*`, `AGENTS.md`; keep `css/theme.css` and your own components/pages.

## 1.1.0
- Example pages (landing, article, contact); style guide moved to `styleguide.html`.
- Section patterns: feature, stat, testimonial, pricing, cta, article-header, check, error-summary, theme-toggle.
- Persistent theme toggle (`js/theme-init.js`), accessible form validation (`js/forms.js`), print stylesheet.
- `tools/sync-shared.mjs`, `_headers` template, docs for browser support, security/CSP and forms.
- `.editorconfig`, `.gitignore`, `.vscode` recommendations.

## 1.0.0
- Fluid type / space / radii scales with selectable ratios (theme-driven).
- OKLCH colour ramps (10 light / 10 dark / 10 alpha) via `color-mix`, plus WCAG `-a11y` text pairings.
- Semantic colours with `light-dark()`; `u-surface-*` surfaces.
- Layout objects, utilities, native-first components, Alpine helpers.
- `tools/check.mjs` guardrails; theme presets; docs for agents.
