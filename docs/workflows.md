# Workflows

Each workflow assumes you've read `AGENTS.md`. The Claude skills in `.claude/skills/` are thin pointers to these sections so Claude and Codex follow the same steps.

## New site

0. **First build?** If `FIRST-BUILD.md` exists at the repo root, follow it now: it removes the sample pages from `public/` and deletes itself. Skip this step when the file is absent.
1. Gather the brief: audience, brand colours/fonts (if any), tone, pages, content, imagery, required features.
2. Pick a starting preset from `themes/` closest to the tone and copy it over `public/css/theme.css`; then tune brand colours (OKLCH), fonts, `--text-*` and `--space-*` sizes/ratios, `--radius-scale`, heading styles and component roles. Self-host fonts (`docs/fonts.md`).
3. Open `index.html` (style guide) in both themes; fix anything that looks wrong at the theme level before building pages. Check contrast of brand colours (the `-a11y` pairs adapt automatically).
4. Plan the sitemap; list each page's sections and the component per section; note gaps (AGENTS.md section 1 says how to fill them).
5. Fill `_template.html` (repo root; site name, nav, footer, favicon, social meta, default SEO block) once. That header/footer is the canonical copy for every page.
6. Build pages (next workflow). Update `sitemap.xml`, `robots.txt` (real domain), `404.html`. Convert supplied images to WebP (docs/images.md). For a list of entities use docs/data-driven-pages.md.
7. Write the Organization/WebSite schema for the home page (docs/seo.md) and **list the business facts you still need from the client** (address, phone, hours, social profiles, logo, share image); never invent them.
8. Run the Definition of done in AGENTS.md. Record deliberate deviations in `DESIGN-NOTES.md`.

## New page

1. Copy `_template.html` to `public/<slug>.html` (fix its relative links if you nest it). Set `<title>`, meta description, canonical, Open Graph, the single `<h1>`, `aria-current="page"` on the nav link.
2. Structure: `main#main` → sections (`.section`, optional `u-surface-*`) → `.container` → layout objects (`.stack`, `.grid`, `.cluster`) → components. Alternate section surfaces for rhythm.
3. **Write a real title and description** from the page content (≤60 / ≤160 characters), set canonical, Open Graph and Twitter tags. **Choose the schema type from the table in docs/seo.md** and write the JSON-LD. If the page has a breadcrumb, **add `BreadcrumbList`**. Images: WebP, `loading="eager"` inside the first 1920×1080 screen, `lazy` elsewhere.
3a. If `<main>` is filled by JavaScript, use the `page` wrapper, `aria-busy` and a skeleton (docs/js-rendered-pages.md; template rules in docs/alpine.md).
3b. Pick heading levels by outline, restyle with `u-h*` if needed. Write real content, real alt text, descriptive link text.
4. **Add the page to `sitemap.xml`.** Note any missing business facts for the client. For new nav/footer links, edit `_template.html` and run `node tools/sync-shared.mjs` so every page stays identical.
5. Verify: keyboard pass, light/dark, 320/768/1280, reduced motion emulation, `node tools/check.mjs`.

## New component (or changing one)

1. Search `COMPONENTS.md`/`components.html` first. Can a variant, custom property or composition do it? If yes, do that.
2. Pick the semantic element and, for interactive widgets, the WAI-ARIA pattern and keyboard model.
3. Create `css/components/<block>.css`: header comment (elements, modifiers, states, a11y notes, reduced-motion behaviour), everything inside `@layer components`, tokens only, public `--block-*` custom properties for variants, movement inside `no-preference`.
4. Add `@import url("components/<block>.css");` to `css/main.css`.
5. Behaviour: native HTML → Alpine in `js/components.js` (or `js/<block>.js`) → custom JS. For any GSAP animation check the effects library first (docs/motion.md, "GSAP effects").
6. Add it to `components.html` (all variants and states) and a snippet to `COMPONENTS.md`. Add new tokens to `TOKENS.md`.
7. Run `node tools/check.mjs`; test both themes, keyboard, reduced motion.

## Changing the base (core, tokens, existing component)

Allowed when the design needs it (AGENTS.md section 1). Edit the source, keep tokens, update the style guide/gallery/quick references, run the checks, and add a dated line to `DESIGN-NOTES.md` (what, why, files). Upstream upgrades later use these notes to re-apply the change.

## Audit an existing site

1. `node tools/check.mjs` and fix reports.
   **SEO and schema pass:** every page has a unique title (≤60) and description (≤160), canonical, Open Graph image with alt, correct robots; every JSON-LD block parses and matches the table in docs/seo.md; nothing is invented (check addresses, phones, hours, ratings against what the client supplied); images are WebP with correct eager/lazy; sitemap and robots are current.
2. Walk each page: outline (headings/landmarks), keyboard, focus visibility, contrast in both themes, forms, images, 200% zoom, 320px, reduced-motion emulation.
3. Look for drift: literals instead of tokens, duplicate components, one-off overrides, undocumented deviations. Fold repeated patterns into components or tokens.
4. Report findings by severity (blocks users / hurts users / polish) with file and line, then fix on request.

## Testing motion and loading states

- **Use a real, visible browser window.** A hidden or background preview pane freezes CSS animations and `requestAnimationFrame` (GSAP's ticker stops too), so animations appear not to run and timing numbers are wrong.
- **Measure before guessing.** Use the Performance API: `performance.getEntriesByType('paint')` (first paint), `'resource'` (when the JSON arrived), and a `PerformanceObserver` for `layout-shift`. Typical question: was the data ready before first paint? Compare the JSON's `responseEnd` with `first-paint`.
- To see a skeleton, delay the JSON beyond 150ms (network throttling); a fast or cached load must not show it. Check the entrance animation on a cached load too.
- **Scroll-effects checklist** (`data-reveal`, `data-ken-burns`; docs/motion.md): (a) fresh load at the top; (b) scroll slowly: the fade and rise is **timed**, not scrubbed with the scrollbar; (c) scroll away and back: it replays from both directions; (d) click an in-page anchor: it glides with no full reload and lands clear of the sticky header (`scroll-padding-block-start`); (e) **Back/Forward** from a detail page and **Reload** at several restored scroll positions (mid page, a JSON-filled section, the bottom): every element inside the viewport is visible, nothing stuck at opacity 0; (f) filters and hidden containers shown by Alpine; (g) light and dark, 320/768/1280; (h) reduced motion: everything visible, nothing moves. A hidden or background preview pane freezes animations and `requestAnimationFrame`, so use a real visible browser window; tests that restore scroll instantly need waits of at least 1s before reading state.
- **Always hard-refresh after a deploy** (and after a Pages export): a host or browser cache can serve old CSS/JS with new HTML. Rules: docs/security.md.
- JS-filled pages: docs/js-rendered-pages.md. Hosting and export: docs/hosting.md.
