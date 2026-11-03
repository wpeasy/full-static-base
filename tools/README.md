# tools/

Dev-only helpers. Nothing here ships with the site; the site has no build step.

| Command | What it does | Needs |
|---|---|---|
| `node tools/check.mjs` | Guardrails: tokens not literals, BEM, no IDs/`!important`, motion gating, HTML semantics, a11y basics, shared header/footer, asset links, `main.css` imports. Exit 1 on errors. | Node only |
| `node tools/bundle-css.mjs` | Inline `css/main.css` imports into `css/main.bundle.css` for deploy | Node only |
| `node tools/browser-checks.mjs` | axe WCAG scan, horizontal-overflow and console-error checks, screenshots at 320/768/1280 in light/dark with reduced motion | `cd tools && npm install && npx playwright install chromium`, plus a running local server |

### Pages with side-by-side alternatives

A page may hold several designs of the same section, e.g. for choosing between directions:

```html
<div data-variant="a">…</div>
<div data-variant="b">…</div>
```

`check.mjs` runs the HTML checks once per variant with the others blanked out, so each variant needs its own single `<h1>`, unique ids and unskipped heading order. Findings that repeat across passes are reported once. Pages without `data-variant` are checked once. Local file references ignore `?query` and `#fragment` (`js/vendor/x.js?v=1.2.3` is fine).

The checks are heuristics tuned for this framework. If a rule blocks a deliberate design choice, adjust the rule in `check.mjs` and record it in `DESIGN-NOTES.md`.
