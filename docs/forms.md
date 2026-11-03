# Forms

Static sites need somewhere to send form data. Decide the endpoint first, then build the form from the `field`, `check`, `error-summary` and `button` components. `contact.html` is the reference implementation.

## Choosing an endpoint

| Option | Good for | Notes |
|---|---|---|
| Hosted form service (Formspree, Basin, Web3Forms, host-native forms) | most small sites | set `action` to the service URL; add it to CSP `form-action`; check privacy/region |
| Serverless function (Cloudflare/Netlify/Vercel) | custom logic, email routing | validate on the server; rate-limit |
| `mailto:` | never for production | no validation, no spam control, poor accessibility |

## Pattern (progressive enhancement)

1. Semantic `<form method="post" action="…">`, every control with a visible `<label for>`, correct `type`, `name`, `autocomplete`, and native validation attributes (`required`, `minlength`, `pattern`).
2. **Works without JavaScript.** Native validation and a server-side redirect to a thank-you page (`thanks.html`) is the baseline.
3. With JavaScript, `formValidation` (`js/forms.js`) sets `novalidate`, collects messages, shows an **error summary** that receives focus (links jump to fields), and marks invalid fields (`field--invalid`, `aria-invalid`, text error linked with `aria-describedby`). Messages never rely on colour alone.
4. **Spam:** honeypot field (visually hidden, `tabindex="-1"`, `autocomplete="off"`, rejected if filled) plus the service's rate limiting/CAPTCHA if needed. Avoid CAPTCHAs that block assistive tech; prefer honeypot + server checks.
5. **Consent:** an unticked `check` with a clear label for anything beyond replying to the enquiry; link the privacy policy.
6. **Success/error states:** redirect to a thank-you page with an `<h1>`, or (fetch enhancement) announce in a `role="status"` region and move focus to the message. Don't clear the form on error.

## Rules

- Required fields are marked in text, not only with an asterisk or colour.
- Error text says what's wrong and how to fix it ("Enter an email address like name@example.com").
- Never disable the submit button to "prevent" errors; show them.
- Don't collect more than you need; state how data is used.
- Re-validate everything on the server.
