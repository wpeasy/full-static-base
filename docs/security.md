# Security headers & CSP

The site is static, so the main protections are HTTP headers set by the host. `_headers` (Netlify / Cloudflare Pages format) is a ready template; translate it for nginx, Apache or other hosts. Replace `example.com` and the form endpoint before launch.

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

Files aren't fingerprinted, so assets use a short cache with revalidation (`max-age=3600, must-revalidate`); HTML is always revalidated. If you fingerprint or version asset URLs, switch to `max-age=31536000, immutable`.

## Forms

Forms post to a third-party or own endpoint: add it to `form-action` in the CSP. Validate and sanitise on the server; client validation is a convenience only. See `docs/forms.md`.
