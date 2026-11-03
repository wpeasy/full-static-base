# tools/

Dev-only helpers. Nothing here ships with the site; the site has no build step.

| Command | What it does | Needs |
|---|---|---|
| `node tools/check.mjs` | Guardrails: tokens not literals, BEM, no IDs/`!important`, motion gating, HTML semantics, a11y basics, shared header/footer, asset links, `main.css` imports. Exit 1 on errors. | Node only |
| `node tools/bundle-css.mjs` | Inline `css/main.css` imports into `css/main.bundle.css` for deploy | Node only |
| `node tools/browser-checks.mjs` | axe WCAG scan, horizontal-overflow and console-error checks, screenshots at 320/768/1280 in light/dark with reduced motion | `cd tools && npm install && npx playwright install chromium`, plus a running local server |

The checks are heuristics tuned for this framework. If a rule blocks a deliberate design choice, adjust the rule in `check.mjs` and record it in `DESIGN-NOTES.md`.
