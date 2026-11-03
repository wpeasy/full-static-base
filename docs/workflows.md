# Workflows

Each workflow assumes you've read `AGENTS.md`. The Claude skills in `.claude/skills/` are thin pointers to these sections so Claude and Codex follow the same steps.

## New site

1. Gather the brief: audience, brand colours/fonts (if any), tone, pages, content, imagery, required features.
2. Pick a starting preset from `themes/` closest to the tone and copy it over `css/theme.css`; then tune brand colours (OKLCH), fonts, `--text-*` and `--space-*` sizes/ratios, `--radius-scale`, heading styles and component roles. Self-host fonts (`fonts/README.md`).
3. Open `index.html` (style guide) in both themes; fix anything that looks wrong at the theme level before building pages. Check contrast of brand colours (the `-a11y` pairs adapt automatically).
4. Plan the sitemap; list each page's sections and the component per section; note gaps (AGENTS.md section 1 says how to fill them).
5. Fill `_template.html` (site name, nav, footer, favicon, social meta) once. That header/footer is the canonical copy for every page.
6. Build pages (next workflow). Update `sitemap.xml`, `robots.txt`, `404.html`.
7. Run the Definition of done in AGENTS.md. Record deliberate deviations in `DESIGN-NOTES.md`.

## New page

1. Copy `_template.html` to `<slug>.html`. Set `<title>`, meta description, canonical, Open Graph, the single `<h1>`, `aria-current="page"` on the nav link.
2. Structure: `main#main` → sections (`.section`, optional `u-surface-*`) → `.container` → layout objects (`.stack`, `.grid`, `.cluster`) → components. Alternate section surfaces for rhythm.
3. Pick heading levels by outline, restyle with `u-h*` if needed. Write real content, real alt text, descriptive link text.
4. Add the page to `sitemap.xml`. For new nav/footer links, edit `_template.html` and run `node tools/sync-shared.mjs` so every page stays identical.
5. Verify: keyboard pass, light/dark, 320/768/1280, reduced motion emulation, `node tools/check.mjs`.

## New component (or changing one)

1. Search `COMPONENTS.md`/`components.html` first. Can a variant, custom property or composition do it? If yes, do that.
2. Pick the semantic element and, for interactive widgets, the WAI-ARIA pattern and keyboard model.
3. Create `css/components/<block>.css`: header comment (elements, modifiers, states, a11y notes, reduced-motion behaviour), everything inside `@layer components`, tokens only, public `--block-*` custom properties for variants, movement inside `no-preference`.
4. Add `@import url("components/<block>.css");` to `css/main.css`.
5. Behaviour: native HTML → Alpine in `js/components.js` (or `js/<block>.js`) → custom JS.
6. Add it to `components.html` (all variants and states) and a snippet to `COMPONENTS.md`. Add new tokens to `TOKENS.md`.
7. Run `node tools/check.mjs`; test both themes, keyboard, reduced motion.

## Changing the base (core, tokens, existing component)

Allowed when the design needs it (AGENTS.md section 1). Edit the source, keep tokens, update the style guide/gallery/quick references, run the checks, and add a dated line to `DESIGN-NOTES.md` (what, why, files). Upstream upgrades later use these notes to re-apply the change.

## Audit an existing site

1. `node tools/check.mjs` and fix reports.
2. Walk each page: outline (headings/landmarks), keyboard, focus visibility, contrast in both themes, forms, images, 200% zoom, 320px, reduced-motion emulation.
3. Look for drift: literals instead of tokens, duplicate components, one-off overrides, undocumented deviations. Fold repeated patterns into components or tokens.
4. Report findings by severity (blocks users / hurts users / polish) with file and line, then fix on request.
