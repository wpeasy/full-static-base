# Vendored scripts (`public/js/vendor/`)

Paths are relative to `public/`.


Third-party scripts, committed as-is. No CDN, no build step.

| File | Version | Source | License |
|---|---|---|---|
| `alpine.min.js` | 3.14.9 | https://github.com/alpinejs/alpine | MIT |
| `gsap.min.js` | 3.13.0 | `npm: gsap@3.13.0/dist/gsap.min.js` | GSAP Standard License (https://gsap.com/standard-license) |
| `ScrollTrigger.min.js` | 3.13.0 | same package | same |
| `Flip.min.js` | 3.13.0 | same package | same |

GSAP 3.13+ and all of its plugins (including Flip and ScrollTrigger) are free for commercial use under the Standard License. Keep the licence header in each file. Keep every GSAP file at the **same version**.

## Updating

Replace the file from the same package path at the new version, update the table, and bump the `?v=` on every `<script>` tag that loads it (`grep -rn "vendor/gsap" *.html`).

## Cache busting

Browsers cache vendored files aggressively, so an updated file can look unchanged. Load them with a version query: `<script src="js/vendor/gsap.min.js?v=3.13.0" defer></script>`. `tools/check.mjs` ignores the query string when it checks the file exists.

## Load order

Scripts with `defer` run in order, before `DOMContentLoaded`. Put GSAP, then plugins, then your own scripts, then Alpine last:

```html
<script src="js/vendor/gsap.min.js?v=3.13.0" defer></script>
<script src="js/vendor/Flip.min.js?v=3.13.0" defer></script>
<script src="js/grid-filter.js" defer></script>
<script src="js/vendor/alpine.min.js" defer></script>
```
