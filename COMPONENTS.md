# Components index

Paths are relative to `public/` (see AGENTS.md section 3). Reuse before you create; change a component when the design needs it (see AGENTS.md §1). Live examples of every variant: `components.html`. Composition examples: `index.html` (landing), `article.html`, `contact.html`. One file per block in `css/components/`, imported by `css/main.css`.

| Block | Purpose | Variants / elements | Behaviour |
|---|---|---|---|
| `skip-link` | first focusable link to `#main` | | CSS only |
| `nav` | site header + collapsing menu | `__inner __brand __toggle __menu __list __link(--current)`, `--open` | Alpine `nav` (Esc closes) |
| `hero` | page intro with the `h1` | `--center`; `__content __eyebrow __title __lead __actions __media` | |
| `section-header` | intro for a section | `--center`; `__eyebrow __title __lead` | |
| `button` | action or link-as-button | `--secondary --outline --ghost --s --l --full` | `<a>` or `<button>` |
| `card` | content item | `--raised --flat`; `__media __body __title __text __footer` | combine `u-clickable` |
| `badge` | small status label | `--primary --success --warning --danger --info` | |
| `alert` | inline message | `--success --warning --danger`; `__title __text` | add `role="alert"/"status"` |
| `toast` | transient notification | `--success --danger`; `__message __close`, `toast-region` | Alpine `toasts`, live region |
| `field` | label + control + hint/error | `--invalid`; `__label __input __hint __error` | native validation |
| `table` | scrollable data table | `--striped`; `__grid` | region with `tabindex="0"` |
| `prose` | long-form/CMS content | styles bare elements inside | CSS only |
| `breadcrumb` | location trail | `__list __item __link` | `aria-current="page"` |
| `pagination` | page links | `__list __item __link` | `aria-current`, text for prev/next |
| `tabs` | ARIA tabs | `__list __tab __panel` | Alpine `tabs([ids])` |
| `accordion` | disclosure group | `__item __trigger __panel` | native `<details name>` |
| `modal` | dialog | `__header __title __close __body __footer` | native `<dialog>.showModal()` |
| `footer` | page footer | `__inner __brand __nav __list __link __legal` | |
| `feature` | icon + heading + sentence | `--center`; `__icon __title __text` | lay out with `.grid` |
| `stat` | figure with caption | `__value __label` | inside `<dl class="grid">` |
| `testimonial` | quote with attribution | `__quote __author __name __role` | `<figure>`/`<blockquote>` |
| `pricing` | one plan card | `--featured`; `__badge __name __price __amount __period __list __item` | |
| `cta` | call-to-action band | `--left`; `__title __text __actions` | put on a `u-surface-*` section |
| `article-header` | post title block | `__title __lead __meta` | holds the page `h1` |
| `check` | checkbox/radio + label | `__input __label` | native |
| `error-summary` | form error list | `__title __list __link` | focused by `formValidation` |
| `theme-toggle` | persistent dark-mode button | `__icon` (`--sun`/`--moon`) | Alpine `themeToggle` + `js/theme-init.js` |
| `filter` | search + topic chips + filterable grid | `__toolbar __search __tags __chip __status __grid __item __empty` | Alpine `gridFilter` (`js/grid-filter.js`), optional GSAP Flip |
| `profile` | detail view of one entity (filled from JSON) | `__aside __avatar __facts __fact __label __value __tags __body __role __missing` | Alpine `itemProfile` (`js/item-profile.js`), `[hidden]` blocks |
| `page` | wrapper for a JS-filled `<main>`: hides content and footer while `aria-busy`, entrance animation, skeleton overlay | `__skeleton __content` | `aria-busy="true" :aria-busy="status === 'loading'"`, docs/js-rendered-pages.md |
| `skeleton` | placeholder shapes while loading | `__line(--title --short) __block __avatar` | decorative (`aria-hidden`), shimmer only while `.page` is busy |
| `icon` | SVG sprite icon | `--s --l` | `images/icons.svg#name` |

Layout objects (`container section stack cluster grid`) live in `css/core/layout.css`; utilities and surfaces in `css/core/utilities.css`. Names in [TOKENS.md](TOKENS.md).

## Recipe: filterable grid (`filter`)

Needs `js/grid-filter.js` and, for animation, vendored `gsap` + `Flip` (see `docs/vendor.md`; load order: GSAP, Flip, `grid-filter.js`, Alpine). Live example: `components.html#filter`.

- Every item stays in the HTML (works without JS). Give each `<li class="filter__item">` a `data-tags="a b"` and `:hidden="!matches($el, query, tag)"`. Use `hidden`, **not** `x-show`; pass `query` and `tag` as arguments so Alpine tracks them. Optional `data-search` overrides the searched text.
- Toolbar is `x-cloak`. Chips are `<button type="button" :aria-pressed="tag === 'x'" @click="setTag('x')">`; the search input calls `setQuery($event.target.value)`.
- `__status` is a polite live region; `__empty` has `hidden :hidden="count > 0"`.
- All changes go through `update(change)`: it runs Flip (`absolute: true`, fades for enter/leave) and tweens the grid height so content below does not jump. Under `prefers-reduced-motion: reduce` it just runs `change()`. See `docs/motion.md`.

## Recipe: JSON-driven list + template page

`items.html` (list: `filter` + `card`s from `x-for`) and `item.html` (template: `profile`) are filled from `data/items.json`. Full guide: [docs/data-driven-pages.md](docs/data-driven-pages.md); SEO from the same JSON: [docs/seo.md](docs/seo.md). In the data-driven list the base class method is `elements()` and filtering uses `matchesItem(item, query, tag)`.

## Recipe: JS-rendered page (`page` + `skeleton`)

Wrap a `<main>` that Alpine fills in `.page` with a `.page__skeleton` (aria-hidden overlay) and `.page__content` (everything else, including colourful bands). One `status` property (`loading | ready | missing | error`); only `loading` sets `aria-busy`. Full guide: [docs/js-rendered-pages.md](docs/js-rendered-pages.md); Alpine template rules: [docs/alpine.md](docs/alpine.md). Live: `items.html`, `item.html`.

## Snippets

```html
<!-- Button as link; icon decorative -->
<a class="button" href="/pricing.html">See pricing <svg class="icon" aria-hidden="true" focusable="false"><use href="images/icons.svg#arrow-right"/></svg></a>

<!-- Clickable card: first link covers the card -->
<article class="card card--raised u-clickable">
  <div class="card__body">
    <h3 class="card__title"><a href="/guide.html">Guide title</a></h3>
    <p class="card__text">Summary text.</p>
  </div>
</article>

<!-- Section on a surface -->
<section class="section u-surface-primary" aria-labelledby="cta-title">
  <div class="container stack">
    <h2 id="cta-title">Call to action</h2>
    <a class="button" href="/contact.html">Contact us</a>
  </div>
</section>

<!-- Accordion (native) -->
<div class="accordion">
  <details class="accordion__item" name="faq"><summary class="accordion__trigger">Question?</summary><div class="accordion__panel">Answer.</div></details>
</div>

<!-- Modal (native) -->
<div x-data>
  <button class="button" type="button" @click="$refs.dialog.showModal()">Open</button>
  <dialog class="modal" x-ref="dialog" aria-labelledby="m-title" @click="if ($event.target === $el) $el.close()">
    <div class="modal__header"><h2 class="modal__title" id="m-title">Title</h2>
      <form method="dialog"><button class="modal__close" aria-label="Close"><svg class="icon" aria-hidden="true" focusable="false"><use href="images/icons.svg#close"/></svg></button></form></div>
    <div class="modal__body">…</div>
  </dialog>
</div>
```
