# Security headers & CSP

The site is static, so the main protections are HTTP headers set by the host. `public/_headers` (Netlify / Cloudflare Pages format) is a ready template (host config files live inside `public/` because only that folder is published); translate it for nginx, Apache or other hosts. Replace `example.com` and the form endpoint before launch.

## Content-Security-Policy and Alpine

- **Standard Alpine builds expressions at runtime, so `script-src` needs `'unsafe-eval'`.** The template includes it. This is the known trade-off of the default setup: all scripts are still first-party (`'self'`), which keeps the risk low for a static site without user-generated content.
- **Strict CSP option:** vendor `@alpinejs/csp` (same version) into `js/vendor/` instead of `alpine.min.js`. It forbids inline expressions, so every `x-data` value, `@click`, `x-text` and `:class` must call a method or property defined in `Alpine.data(...)`; no `a + b`, ternaries or object literals in attributes. Do this only when a client requires a CSP without `'unsafe-eval'`, and note it in `DESIGN-NOTES.md`.
- **Inline `style="--x: …"` attributes** (used to pass custom properties such as `--grid-min`) are blocked by `style-src` unless `style-src-attr 'unsafe-inline'` is allowed. The template allows it for attributes only. Scripts setting styles through CSSOM (Alpine `:style`) are not affected.
- No inline `<script>` blocks: put code in `js/*.js` (e.g. `theme-init.js`). That is what lets `script-src` stay `'self'`.
- Third-party embeds, analytics and fonts must be added to the matching CSP directives explicitly.

## Other headers

| Header | Purpose |
|---|---|
| `Strict-Transport-Security` | HTTPS only (enable once HTTPS is confirmed) |
| `X-Content-Type-Options: nosniff` | no MIME sniffing |
| `Referrer-Policy: strict-origin-when-cross-origin` | limit referrer leakage |
| `Permissions-Policy` | disable unused browser features |
| `frame-ancestors 'none'` (in CSP) | clickjacking protection |

## Caching

**Never cache unversioned CSS or JS with a `max-age`.** If `/css/*` or `/js/*` carry `max-age=3600`, a visitor can load new HTML with the old CSS or JS for an hour after a deploy: an unstyled flash, new scripts not running, old scripts breaking on new markup. The rules in `_headers`:

| Path | `Cache-Control` | Why |
|---|---|---|
| `/`, `/*.html`, `/item/*` | `no-cache` | always revalidate |
| `/css/*`, `/js/*` | `no-cache` | revalidate on every load; an unchanged file costs one cheap `304` (ETag) |
| `/data/*` | `public, max-age=300, stale-while-revalidate=86400` | content changes rarely; fast repeat loads |
| `/images/*` | `public, max-age=604800, stale-while-revalidate=86400` | a week; anything longer needs versioned file names (docs/performance.md) |
| `/fonts/*` | `public, max-age=31536000, immutable` | never edited in place |

Keep a long `immutable` cache only for fonts and for files whose **name** is versioned (`app.3f2a1c.js`). A `?v=` query on a file is not enough on every host. Don't put `Cache-Control` in the `/*` block: hosts merge matching rules and some join duplicate values. `tools/check.mjs` warns when `_headers` gives `/css/*` or `/js/*` a `max-age` without `immutable`. Hosts with no header control (GitHub Pages) are covered in docs/hosting.md.

## Forms

Forms post to a third-party or own endpoint: add it to `form-action` in the CSP. Validate and sanitise on the server; client validation is a convenience only. See `docs/forms.md`.
