# Brand and design guide (template + skill)

A client-ready reference page that shows the site's real design system: logo, colour, type, spacing, components, imagery, motion, voice and accessibility. It is **rendered from the live tokens**, so it cannot drift from the build.

| Piece | Where |
|---|---|
| Template (never published) | `templates/brand-guide.template.html` |
| Output | `public/brand-guide.html` (`noindex`, `data-page="styleguide"`, not in `sitemap.xml`) |
| Skill | `.claude/skills/new-brand-guide/` |
| Rendering helpers | `css/components/styleguide.css`, `js/styleguide.js` (`themeCycle`, `ramp`, `scale`) |

The framework's own `styleguide.html` (token reference) and `components.html` (component gallery) stay as they are: they document the *framework*. `brand-guide.html` documents *this site*.

## Workflow

1. **Prerequisites.** `css/theme.css` is set (colours, fonts, scale), fonts are self-hosted, and there is at least a logo or the site name. If `FIRST-BUILD.md` exists, do that first.
2. **Gather the facts** from the brief and the site: name, one-line proposition, brand story, audience, personality words, logo files, imagery direction, voice. **Never invent** any of it. Missing items are deleted from the page or written as "To be confirmed" and listed for the user.
3. **Copy** `templates/brand-guide.template.html` to `public/brand-guide.html`.
4. **Fill every `{{PLACEHOLDER}}`** and follow the `AGENT:` comments (then delete those comments). Delete sections the site does not need, together with their nav link.
5. **Read values from `theme.css`**, not from memory:
   - brand colour names, roles, hex and OKLCH: convert each `oklch()` input to sRGB hex;
   - font families and the weights actually loaded (`css/fonts.css`);
   - contrast ratios for the colour pairs the site really uses, in **both** themes (compute them: WCAG relative luminance; do not estimate). Pairs below 4.5:1 are labelled "large text / graphics only".
6. **Components section:** keep only components the site uses; reuse real copy and the real button and form labels.
7. **Images:** WebP (or SVG for logos), `width` and `height`, `loading="lazy"`, meaningful `alt`. Link only files that exist in `public/`.
8. **Verify:** `node tools/check.mjs` (no unresolved `{{`), open the page in light, dark and auto, at 320 / 768 / 1280, keyboard only, and with reduced motion.
9. Add a line to `DESIGN-NOTES.md` if you changed the template or any shared CSS; add new rules to this file.

## Changing the template

Edit `templates/brand-guide.template.html` and keep `TOKENS.md`/`COMPONENTS.md` in sync. Use existing BEM blocks, layout objects, `u-*` utilities and the `sg-*`/`ramp`/`chip`/`scale` helpers; add a new helper to `styleguide.css` only when needed. Do not hard-code colour, type or spacing values into the template: render them with tokens.
