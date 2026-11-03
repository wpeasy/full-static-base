# Browser support policy

**Baseline: current evergreen browsers**: Chrome/Edge 120+, Safari 17.5+, Firefox 130+ (roughly "Baseline 2024"). Content stays readable in older browsers, but layout and colour fidelity are not guaranteed there. If a client needs older browsers, record it in `DESIGN-NOTES.md` and add the fallbacks listed below.

## Newer CSS the framework relies on

| Feature | Used for | Minimum |
|---|---|---|
| `color-mix(in oklch, …)` | colour ramps, alpha steps | Chrome 111, Safari 16.2, Firefox 113 |
| `light-dark()` | every semantic colour (dark mode) | Chrome 123, Safari 17.5, Firefox 120 |
| Relative colour syntax in `xyz-d65` | `-a11y` text pairings | Chrome 119, Safari 16.4, Firefox 128 |
| `pow()`, `sqrt()` in `calc()` | fluid scales, a11y threshold | Chrome 120, Safari 15.4, Firefox 118 |
| `details[name]` | exclusive accordion | Chrome 120, Safari 17.2, Firefox 130 |
| `@layer` | cascade order | Chrome 99, Safari 15.4, Firefox 97 |
| `:has()` | body scroll lock behind `<dialog>` | Chrome 105, Safari 15.4, Firefox 121 |
| `@starting-style`, `allow-discrete` | dialog entrance animation (optional) | Chrome 117, Safari 17.5, Firefox 129 |
| `<dialog>`, `popover` | modal, menus | all evergreen |

## What happens when a feature is missing

Every colour, size and space is a custom property. A browser that can't parse a value (for example `light-dark()`) treats the token as invalid, so the property falls back to the browser default: dark text on a white page. The page stays legible; spacing and colours may be lost. Progressive-enhancement features (dialog animation, accordion exclusivity) simply don't animate or stay independently open.

## Rules for adding CSS/JS

- Prefer features that are Baseline "widely available". For newer features either gate with `@supports` or make sure the page works without them (enhancement only).
- Never rely on JavaScript for content or core navigation; Alpine is enhancement.
- If a fallback is needed, add it next to the feature with a comment naming the browser it covers.

## Not yet verified

This base has been exercised in Chromium only. Before a production launch, run the pages in Safari and Firefox (macOS/iOS and Android) and note anything in `DESIGN-NOTES.md`.
