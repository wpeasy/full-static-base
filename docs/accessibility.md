# Semantics & accessibility

Required on every page, every component, every change. Target: **WCAG 2.2 AA**. Semantics are the foundation of accessibility: get the element right first, then style it.

## Choose the element by meaning

| You want… | Use | Not |
|---|---|---|
| Go somewhere / change URL | `<a href>` | `<button>`, `<div onclick>` |
| Do something on the page | `<button type="button">` (`type="submit"` in forms) | `<a href="#">`, `<div>` |
| Site / section navigation | `<nav aria-label="…">` with `<ul>` | bare `<div>` of links |
| Page regions | `<header>`, `<main id="main">`, `<footer>`, `<aside>` | `<div class="header">` |
| Grouped content with a heading | `<section aria-labelledby="id">` | unlabelled `<section>` |
| Self-contained item (card, post) | `<article>` | `<div>` |
| List of things | `<ul>/<ol>/<li>`, `<dl>` for term/definition | `<br>` separated text |
| Tabular data | `<table>` + `<caption>`, `<th scope>` | grids of divs |
| Image + caption | `<figure>` / `<figcaption>` | divs |
| Dates, times | `<time datetime>` | plain text |
| Disclosure / FAQ | `<details name>` / `<summary>` | JS accordions |
| Modal | `<dialog>` + `showModal()` | custom overlay + trap |
| Quote | `<blockquote>`, `<q>`, `<cite>` | styled paragraphs |
| Emphasis | `<em>` / `<strong>` | `<i>` / `<b>` for meaning |
| Icon-only action | `<button aria-label>` + decorative icon | bare `<svg>` |

Style a heading differently without changing its level: `u-h1…u-h6`. Style a link as a button with `.button` (still an `<a>`).

## Document skeleton

`<html lang>`, unique descriptive `<title>`, `<meta name="viewport" content="width=device-width, initial-scale=1">` (never `user-scalable=no`), skip link as the first focusable element, one `<main id="main">`, `<header>` and `<footer>` landmarks, one `<h1>`. Multiple `<nav>`s each get a distinct `aria-label`. Use `aria-current="page"` on the current link.

## Headings

One `h1`. Levels descend one at a time (h2 → h3, never h2 → h4). Every `section` has a heading. Headings describe content; they aren't a styling tool.

## Keyboard & focus

- Everything operable by keyboard; order matches visual order; no `tabindex` > 0. `tabindex="0"` only for scrollable regions (tables) and composite widgets; `-1` for programmatic focus.
- Focus is always visible: use `--focus-ring`/`--focus-offset`. Never remove an outline without a replacement of equal visibility.
- Don't trap focus (except inside a modal `<dialog>`, which the browser handles). On open, focus moves into the widget; on close, it returns to the trigger.
- Widgets follow the WAI-ARIA Authoring Practices keyboard model (tabs: arrows/Home/End; menus: arrows/Esc; etc.).

## Colour & contrast

- Text ≥ 4.5:1 (large text ≥ 3:1), UI components and focus indicators ≥ 3:1, in **light and dark**.
- On any ramp colour use its partner: `color: var(--primary-dark-3-a11y)` for text on `--primary-dark-3`. Semantic pairs (`--color-on-primary`, `u-surface-*`) already do this.
- Never use colour alone for meaning (errors need text/icon; links inside text are underlined).
- Muted text still needs 4.5:1. `--color-text-muted` is tuned for it; don't lighten further.

## Images, icons, media

`<img>` always has `alt` (empty for decoration) plus `width`/`height`. Informative SVG: `role="img"` + `aria-label` or visible text alongside. Decorative icons: `aria-hidden="true" focusable="false"`. Video: captions, no autoplay with sound, controls available. Never put essential text in images.

## Forms

- Visible `<label for>` for every control (placeholders are not labels). Group related controls with `<fieldset><legend>`.
- Correct `type`, `name`, `autocomplete`; `required` plus visible indication. Hints/errors via `aria-describedby`; invalid fields get `aria-invalid="true"` and an error message in text, not colour alone.
- Announce submit results/errors with `role="alert"` or `role="status"`; move focus to an error summary when blocking submission.
- Targets at least 24×24 CSS px (aim 44×44).

## ARIA

1. If a native element does the job, use it. 2. Don't change native semantics. 3. Every interactive ARIA role must be keyboard operable. 4. Never hide focusable elements (`aria-hidden`, `display:none` removes them from the tab order, `inert` for off-screen UI). 5. Every control has an accessible name. Keep ARIA state (`aria-expanded`, `aria-selected`, `aria-current`) in sync with what CSS shows. Live regions (`role="status"` polite, `role="alert"` assertive) must exist in the DOM before content is injected.

## Responsive & adaptive

Layouts reflow at 320px without horizontal scroll (data tables scroll inside `.table`). Use `rem`/tokens so text scales with browser settings and 200% zoom. Support text-spacing overrides (no fixed-height text boxes). Respect `forced-colors`. Don't restrict orientation.

## Time & dynamic content

No time limits, auto-advancing carousels, or auto-dismissing messages without user control (pause, stop, extend). Content that updates must be announced via a live region. Don't flash more than 3 times per second.

## Per-level checklist

- **Markup**: element chosen by meaning, landmarks, headings, labels, names, `lang`, title.
- **CSS**: focus visible, `-a11y` pairs, no `display:none` on content that must be read, `forced-colors` safe, motion gated (see motion.md), no text in `::before` that carries meaning.
- **JS**: native first; ARIA states updated; focus managed; keyboard handlers for custom widgets; `$reducedMotion()` before motion.
- **Content**: link text makes sense out of context ("Read the pricing guide", not "click here"); plain language; alt text written for purpose.
- **Verify**: keyboard-only pass, zoom to 200%, both themes, `node tools/check.mjs`, optional axe run (`tools/browser-checks.mjs`).
