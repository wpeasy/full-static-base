# full-static-base

A foundation for building fast, accessible **static HTML and CSS websites** with AI coding agents (Claude Code, Codex, Cursor) and by hand. There is no framework to install and no build step while you work: you edit files in `public/` and refresh the browser. Production uses one small build that bundles the CSS (see [Deploying](#deploying)).

Current version: see [VERSION](VERSION) and [CHANGELOG.md](CHANGELOG.md).

## What it is

- **A design system in CSS.** Design tokens (colour in OKLCH, fluid type and spacing scales, radii, shadows), layout objects, utilities and 30+ BEM components, all driven by one theme file (`public/css/theme.css`).
- **A rulebook for agents.** [AGENTS.md](AGENTS.md) tells an AI agent how to build: semantic HTML, WCAG 2.2 AA accessibility, `prefers-reduced-motion`, SEO and JSON-LD, WebP images, fast loading, light/dark themes. `CLAUDE.md` just imports it.
- **Patterns for common needs.** Forms with accessible validation, JSON-driven list pages with one template page, scroll reveals and GSAP effects, a JS-rendered page shell with skeleton loading, a favicon set, a brand guide page.
- **Guardrails.** `node tools/check.mjs` fails the build on hard-coded colours or sizes, non-BEM classes, missing alt text or labels, motion that ignores reduced motion, missing SEO tags, SVG-only favicons and more.
- **Skills for Claude Code** in `.claude/skills/` that run the common jobs the same way every time.

The idea: you (or an agent) get consistent, accessible, fast sites from a brief, with the design driven by tokens rather than one-off CSS. If the design needs something the library doesn't do, you change the library (AGENTS.md, section 1).

## What's in here

```
AGENTS.md  CLAUDE.md        the rules agents follow (read AGENTS.md first)
TOKENS.md  COMPONENTS.md    quick references: every token, every component
DESIGN-NOTES.md             deliberate deviations from the base, per site
CHANGELOG.md  VERSION       framework version history
FIRST-BUILD.md              flag file: present until the first build clears the sample site
_template.html              source of the shared header/footer and default <head>; copy for new pages

public/                     the site itself: the ONLY folder that is published
  index.html, article.html, contact.html, items.html, item.html, 404.html   sample pages
  styleguide.html           token style guide (colours, type, space, surfaces)
  components.html           gallery of every component and variant
  css/                      main.css (imports everything), theme.css, fonts.css, core/, components/
  js/                       small Alpine components, forms, SEO helpers, scroll reveals, vendored Alpine and GSAP
  images/, fonts/, data/    assets and sample JSON content
  favicon.ico, site.webmanifest, _headers, _redirects, .htaccess, robots.txt, sitemap.xml

docs/                       guides: accessibility, motion, SEO, images, favicons, performance,
                            deploying and hosting, data-driven pages, forms, security, workflows ...
themes/                     starting presets (corporate, editorial, playful): copy one over public/css/theme.css
templates/                  page templates that get filled in (brand guide)
tools/                      Node scripts: check, serve, build, image sizes, favicons, sitemap ... (see tools/README.md)
.claude/skills/             new-site, new-page, new-component, audit, new-brand-guide, generate-icons
test-brief/                 a fictional client (Banksia Build Co.): brief, mood board PDF, logo pack, fonts, content
worker/, wrangler.jsonc     Cloudflare Workers config for the single-template rewrite
```

Only `public/` is ever deployed. Everything else is development material.

## How to use it

> This section is my reading of how the repo is meant to be used, from AGENTS.md and the docs. Correct anything that doesn't match how you actually work.

### Start a new site

1. **Create a repo from this one** (clone it, or use it as a GitHub template) and open it in Claude Code or your editor.
2. **Give the agent a brief** (audience, pages, brand colours and fonts, tone, content, imagery). The `test-brief/` folder shows what a good one looks like and is a ready-made exercise.
3. **The first build clears the sample site.** While `FIRST-BUILD.md` exists, an agent's first build removes the sample pages and data from `public/` (keeping the CSS, JS, style guide and gallery), deletes the flag, and commits. After that it never clears `public/` again.
4. **Set the theme.** Pick a preset from `themes/` and copy it over `public/css/theme.css`, then tune brand colours, fonts and scales. Self-host fonts as described in `docs/fonts.md`.
5. **Build the pages** from `_template.html`. Edit the shared header and footer in `_template.html`, then run `node tools/sync-shared.mjs` to copy it to every page.
6. **Run the checks** and fix what they report, then deploy.

With Claude Code you can ask for these jobs by name; the skills follow the steps in `docs/workflows.md`:

| Skill | Use it to |
|---|---|
| `new-site` | set up a site: theme, sitemap, pages |
| `new-page` | add a page with correct semantics, SEO and nav |
| `new-component` | add or change a BEM component, with docs and gallery entry |
| `audit` | review a site for semantics, accessibility, motion, token and BEM drift |
| `new-brand-guide` | generate a branded style guide page from the live tokens |
| `generate-icons` | build the favicon and app icon set from the client's one icon file |

### Everyday commands

You need a recent Node (the tools are ES modules with no dependencies; I ran them on Node 26 and have not tested older versions). Nothing else is required to build a site.

```bash
node tools/serve.mjs                 # preview public/ at http://localhost:8765 (handles the /item/<slug> rewrite)
node tools/check.mjs                 # guardrails: tokens, BEM, semantics, a11y, motion, SEO, favicons, images
node tools/sync-shared.mjs           # copy the _template.html header/footer into every page
node tools/build-dist.mjs            # production build: public/ -> dist/ with one minified css/main.css
node tools/make-image-sizes.mjs public/images/photo.jpg --delete-original   # WebP + interim sizes for srcset
node tools/make-favicons.mjs path/to/icon.svg --bg "#ffffff"                 # favicon.ico, apple-touch icon, manifest icons
```

The image and favicon tools need ImageMagick (`brew install imagemagick`) or libwebp. The full list is in [tools/README.md](tools/README.md).

### Deploying

Publish **`dist/`**, not `public/`: `node tools/build-dist.mjs` copies `public/` there with the CSS bundled into one file (this removes the render-blocking `@import` chain and is a large part of the speed gain). Netlify and Cloudflare Pages use `dist` as the publish directory, Apache uses it as the document root, GitHub Pages uses `node tools/deploy-pages.mjs`, and Cloudflare Workers uses `npm run cf:deploy` in `tools/`. Details, caching rules and the per-host trade-offs: [docs/deploy.md](docs/deploy.md), [docs/hosting.md](docs/hosting.md), [docs/performance.md](docs/performance.md).

### Upgrading an existing site

Overwrite `public/css/core/*`, `tools/*`, `docs/*`, `AGENTS.md`, `TOKENS.md` and `COMPONENTS.md` from the newer version, keep your `theme.css`, components and pages, and re-apply anything recorded in `DESIGN-NOTES.md`. Check `CHANGELOG.md` for upgrade notes between versions.

## Where to read next

| If you want to | Read |
|---|---|
| know the rules and the Definition of done | [AGENTS.md](AGENTS.md) |
| find a token or a component | [TOKENS.md](TOKENS.md), [COMPONENTS.md](COMPONENTS.md), or open `public/styleguide.html` and `public/components.html` |
| follow a step-by-step workflow | [docs/workflows.md](docs/workflows.md) |
| try the framework on a realistic job | [test-brief/README.md](test-brief/README.md) |
| see what changed | [CHANGELOG.md](CHANGELOG.md) |

## Limits worth knowing

- Alpine's standard build needs `'unsafe-eval'` in a Content Security Policy (docs/security.md).
- The GitHub Pages export is a separate copy that goes stale until you deploy again, and has no custom headers (docs/hosting.md).
- GSAP effects follow the library at <https://gsap.brxprod.com/>; the vendored GSAP files are covered by GSAP's own licence (docs/vendor.md).
- The sample content and `test-brief/` are fictional; replace them with real content and never invent business facts.
