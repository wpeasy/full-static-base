# AGENTS.md

Static HTML + CSS sites, built and maintained by AI agents and edited by hand in VS Code / Cursor. No build step, no npm, no compiled JavaScript: every file is served exactly as written. Read this file fully before changing anything, then use the quick references below instead of reading all the CSS.

| Need | Read |
|---|---|
| Which token do I use? | [TOKENS.md](TOKENS.md) |
| Which component exists? | [COMPONENTS.md](COMPONENTS.md) (live gallery: `components.html`) |
| Semantics + accessibility rules and patterns | [docs/accessibility.md](docs/accessibility.md) |
| Motion and `prefers-reduced-motion` | [docs/motion.md](docs/motion.md) |
| Step-by-step: new site / page / component / audit | [docs/workflows.md](docs/workflows.md) |
| Forms, browser support, security headers | [docs/forms.md](docs/forms.md), [docs/browser-support.md](docs/browser-support.md), [docs/security.md](docs/security.md) |
| Why this site deviates from the base | [DESIGN-NOTES.md](DESIGN-NOTES.md) |

## 1. This is a foundation, not a cage

The framework gives you consistent tokens, sensible defaults and tested patterns so you start fast and stay coherent. **Its job is to serve the design you are building. If the design needs something the library doesn't do, change the library.** Do not contort the design to fit it, and do not bolt on one-off overrides to fight it.

Prefer the smallest change that works, in this order:

1. **Theme** (`css/theme.css`): colours, fonts, scale sizes and ratios, radius scale, heading styles, component roles. Often enough on its own. Presets live in `themes/`.
2. **Compose** existing layout objects, utilities and surfaces.
3. **Variant**: add a `block--modifier` or a `--block-*` custom property to an existing component.
4. **New component**: a new BEM block in `css/components/` when nothing fits.
5. **Change an existing component, utility, base style or core token** when the design genuinely requires it. This is allowed. Edit the source (never patch around it), keep using tokens, update the gallery and quick references, and add a line to `DESIGN-NOTES.md` saying what changed and why.

What may change: anything, including core files, structure, naming and this file's conventions, *when the design needs it*. What does not bend: section 2 below, and the habit of using tokens instead of literals (add or change tokens freely; don't inline values).

## 2. Non-negotiables: semantics, accessibility, reduced motion

These apply at **every level**: markup, CSS, JavaScript, components, content, and every change you make. A page that looks right but fails these is not done. Details and patterns: [docs/accessibility.md](docs/accessibility.md), [docs/motion.md](docs/motion.md).

**HTML semantics**
- Choose the element for its meaning first, style second. `<button>` acts, `<a href>` navigates, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section aria-labelledby>`, `<article>`, `<aside>`, `<ul>/<ol>` for lists, `<table>` for tabular data, `<figure>`, `<time>`, `<dl>`, `<details>`, `<dialog>`. Never use `<div>`/`<span>` where a semantic element exists, and never a clickable `<div>`.
- One `<h1>` per page; heading levels follow the document outline and never skip. Choose the level for structure, then restyle with `u-h1…u-h6` or a component class if the look should differ.
- Landmarks: one `<main id="main">`, a `<header>`, a `<footer>`, labelled `<nav>`s. First focusable element is the skip link.
- Native HTML before JavaScript or ARIA: `<dialog>`, `<details name>`, `popover`, `<label>`, form validation attributes.

**Accessibility**
- WCAG 2.2 AA minimum. Every page: `lang`, unique `<title>`, `viewport` meta (never disable zoom).
- Everything works by keyboard, with a visible focus indicator (`--focus-ring`; never `outline: none` without a replacement). Tab order follows visual order; no positive `tabindex`.
- Colour: text on any ramp colour uses its `-a11y` partner (`--primary-a11y`…). Never convey meaning by colour alone. Target size ≥ 24×24 CSS px (aim for 44).
- Images: meaningful `alt`; decorative `alt=""`; icons decorative (`aria-hidden="true"`) unless they are the only label. Every control has an accessible name. Every form control has a `<label>`; errors and hints linked with `aria-describedby`.
- ARIA only when HTML can't express it (first rule of ARIA). If you use a role you own its keyboard behaviour and states. State lives in `aria-*`/native attributes, mirrored by CSS.
- Content reflows at 320px wide and 200% zoom, with `rem`-based sizing, no fixed heights on text containers. Respect `forced-colors`.
- No time limits, no auto-playing or auto-updating content without pause/stop. Announce dynamic changes with a live region.

**Reduced motion** (`prefers-reduced-motion`)
- **Movement is opt-in.** Write any animation, transform movement, parallax, scroll-linked effect, smooth scroll, auto-play or looping inside `@media (prefers-reduced-motion: no-preference)`. Opacity/colour fades are fine.
- JavaScript checks `$reducedMotion()` (Alpine magic) or `matchMedia('(prefers-reduced-motion: reduce)')` before any scripted motion (`scrollTo`, GSAP, Web Animations, video autoplay, carousels). With reduce: no motion, no autoplay, jump instead of glide.
- `base.css` has a safety net that collapses stray motion under `reduce`. Do not rely on it. It is a backstop, not the design.
- Every new component that moves must state its reduced-motion behaviour in its CSS header comment.

## 3. Structure

```
index.html article.html contact.html   example pages (landing, article, form): reference implementations; replace with real pages
styleguide.html, components.html       token style guide + component gallery (keep in sync)
_template.html                  copy for every new page (also the source of the shared header/footer)
404.html sitemap.xml robots.txt _headers   site boilerplate (headers template: docs/security.md)
css/main.css                    the ONLY stylesheet pages link; @imports everything
css/theme.css                   per-site theme: edit this first
css/core/framework.css          derived tokens (ramps, a11y pairs, scales). Engine
css/core/base.css               reset + element defaults + motion safety net
css/core/layout.css             container, section, stack, cluster, grid
css/core/utilities.css          u-* helpers and u-surface-*
css/components/*.css            one BEM block per file (add an @import to main.css)
js/theme-init.js                sync script in <head>: applies the saved theme before first paint
js/components.js                shared Alpine components (nav, tabs, toasts, themeToggle, $reducedMotion)
js/forms.js                     accessible form validation (formValidation)
js/*.js                         other small readable Alpine components
js/vendor/alpine.min.js         pinned local copy of Alpine.js
images/ fonts/                  assets (see their README.md); images/icons.svg sprite
themes/*.css                    starting presets for css/theme.css
tools/                          dev-only: check.mjs, sync-shared.mjs, bundle-css.mjs, browser-checks.mjs
```

Cascade layers (declared in `theme.css` and `framework.css`): `reset, tokens, base, layout, components, utilities`.

## 4. CSS rules

1. **Everything is a CSS variable.** No hard-coded colours, font sizes, spacing, radii, shadows, durations or z-indexes. Missing token? Add it to the theme/framework rather than inlining.
2. **Site choices live in `css/theme.css`.** Derived tokens live in `framework.css`.
3. **BEM for everything.** Every class in CSS *and* in HTML is `block`, `block__element` or `block--modifier` (kebab-case words), or a `u-*` utility. No ad-hoc, descriptive or one-off class names (`.red-box`, `.mt-20`, `.wrapper2`), no third-party class conventions, no styling hooks by tag, ID or attribute in pages. One block per file in `css/components/`, headed by a comment listing elements, modifiers, a11y and motion notes. Elements belong to their own block (`card__title` lives inside `.card`; never `card__title` inside a `.hero`), and elements never nest names (`card__body__title` is wrong; use `card__title`). Every class used in HTML must be defined in the CSS; if it isn't there yet, create it. JavaScript hooks use `data-*` or `x-ref`, never styling classes. No ID selectors, avoid element selectors inside components (exceptions: `.prose`, and native table/list/details internals), no descendant chains over one level, no `!important` (except utilities, print styles and the reduced-motion safety net).
4. Components expose public custom properties (`--button-bg`, `--card-*`) for variants instead of duplicating declarations. Use logical properties (`inline`/`block`) and `gap`; prefer container- or intrinsic-based layout (`.grid`, `.cluster`) over breakpoints. Breakpoints can't be variables: 40em, 48em, 64em, 80em.
5. State is expressed with `aria-*`/native attributes (`[aria-expanded]`, `[open]`, `[aria-current]`) where one exists, otherwise a BEM modifier.
6. **`html { font-size: 100% }` always** (1rem = 16px; the fluid maths depends on it).
7. **Colour is OKLCH.** Ramps `--{primary|secondary|surface}-light-1…10 / -dark-1…10 / -alpha-1…10`, text partners `…-a11y`. Components use **semantic** tokens (`--color-*`, `light-dark()` pairs). Use `u-surface-*` for coloured blocks; they re-point text, heading, link and button tokens.
8. Fluid scales: type `--text-2xs…5xl`, space `--space-3xs…4xl`, radii `--radius-xs…2xl` (from space × `--radius-scale`) and roles `--radius-button/card/input/image`.
9. Theme switching: `data-theme="light|dark|auto"` on any element.

## 5. JavaScript rules

- **Native first**, Alpine second, custom JS last. Alpine's standard build needs `'unsafe-eval'` in a CSP (docs/security.md). No inline `<script>` blocks. Alpine attributes (`x-data`, `x-show`, `@click`, `:class`, `:aria-*`) in the HTML keep behaviour where it is used.
- Anything beyond a one-line expression goes in `js/<name>.js` as `Alpine.data('name', () => ({…}))` inside an `alpine:init` listener; load it **before** `alpine.min.js`, both `defer`.
- No bundlers, transpilers, TypeScript, JSX or npm packages. Vendor third-party libraries into `js/vendor/` with a pinned version.
- Interactive widgets follow their WAI-ARIA Authoring Practices pattern (keyboard, roles, focus management). Add `x-cloak` to anything hidden at load.
- Pages must remain usable without JavaScript where feasible: content in HTML, enhancement in Alpine.

## 6. Working method

1. Understand the brief; list sections and map each to components. Note gaps (they become variants or new components, per section 1).
2. Set the theme (or choose a preset) before building pages.
3. Build from `_template.html`. Reuse before you create. Study the example pages (`index.html`, `article.html`, `contact.html`) for how components compose. Edit the shared header/footer in `_template.html` only, then run `node tools/sync-shared.mjs`.
4. Check light and dark, 320px / 768px / 1280px, keyboard only, and reduced motion.
5. Run `node tools/check.mjs` and fix everything it reports. Preview with `python3 -m http.server 8000`.
6. Keep `components.html`, `COMPONENTS.md`, `TOKENS.md` and `DESIGN-NOTES.md` current with what you changed.

## 7. Definition of done

- [ ] Semantic elements chosen for meaning; one `h1`; headings in order; landmarks present; skip link first
- [ ] Keyboard-only walkthrough works; focus always visible; no keyboard traps
- [ ] Text/background uses `-a11y` partners or semantic tokens; contrast ≥ AA in both themes
- [ ] Alt text, labels, accessible names, `lang`, `<title>`, meta description present
- [ ] All movement gated by `prefers-reduced-motion: no-preference`; JS motion checks `$reducedMotion()`
- [ ] Tokens only: no literals. BEM (or `u-*`) for every class in CSS and HTML; no IDs/`!important`
- [ ] Both themes and 320 / 768 / 1280 widths checked, no horizontal scroll, no console errors
- [ ] New or changed blocks added to `main.css`, `components.html`, `COMPONENTS.md`; deviations in `DESIGN-NOTES.md`
- [ ] `node tools/check.mjs` passes

## 8. Commands

```bash
python3 -m http.server 8000      # preview at http://localhost:8000
node tools/check.mjs             # guardrails: tokens, BEM, semantics, a11y, motion, imports
node tools/sync-shared.mjs       # copy the _template.html header/footer into every page (--dry to preview)
node tools/browser-checks.mjs    # optional: axe scan + screenshots (see tools/README.md)
node tools/bundle-css.mjs        # production: inline css/main.css imports -> css/main.bundle.css
```

Upgrading the framework in an existing site: overwrite `css/core/*`, `tools/*`, `docs/*`, `AGENTS.md`, `TOKENS.md`, `COMPONENTS.md` from the newer version (see `CHANGELOG.md`/`VERSION`), keep `css/theme.css`, your components and pages, then re-apply anything listed in `DESIGN-NOTES.md`.
