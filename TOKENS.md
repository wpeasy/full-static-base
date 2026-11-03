# Tokens quick reference

Everything is a CSS custom property. Site choices: `css/theme.css`. Derived: `css/core/framework.css`. Use **semantic** tokens in components; reach for ramps only to define new semantic tokens.

## Colour

| Group | Tokens | Use |
|---|---|---|
| Brand inputs | `--primary` `--secondary` `--surface` (single `oklch()` each) | edit in theme only |
| Status inputs | `--success` `--warning` `--danger` `--info` | edit in theme only |
| Ramps | `--{primary\|secondary\|surface}-light-1…10`, `-dark-1…10`, `-alpha-1…10` | light/dark steps toward white/black; alpha 5·10·20·30·40·50·60·70·80·90 % |
| **Text on a colour** | `--{color}-a11y`, `--{color}-light-N-a11y`, `--{color}-dark-N-a11y`, `--success-a11y`… | near-white or near-black with the higher WCAG contrast on that colour. **Always use for text/icons on a ramp colour.** |
| Page | `--color-bg` `--color-bg-alt` `--color-surface` `--color-surface-alt` | backgrounds |
| Lines | `--color-border` `--color-border-strong` `--color-overlay` | borders, dividers |
| Text | `--color-text` `--color-text-muted` `--color-text-inverse` | body copy |
| Headings | `--color-h1…h6` | set per heading level |
| Links | `--color-link` `--color-link-hover` | |
| Brand roles | `--color-primary` `-hover` `--color-on-primary`; `--color-secondary` `-hover` `--color-on-secondary`; `--color-focus` | buttons, accents |
| Status roles | `--color-success/warning/danger/info` and `…-bg` tint | alerts, badges, toasts |
| Constants | `--white` `--black` | avoid for text; use `-a11y` |

All semantic colours are `light-dark(light, dark)`; they flip with `data-theme` / `color-scheme`.

## Type

| Token | Notes |
|---|---|
| `--text-2xs … --text-5xl` | fluid; `--text-m` is body. Steps -3…6 of the type ratio |
| `--text-display` `--text-display-s` | fluid hero statement sizes; set `--display-(s-)min/max-size` (px) in the theme, no ratio |
| `--font-body` `--font-heading` `--font-mono` | stacks |
| `--weight-body/medium/heading/bold` | |
| `--leading-body` `--leading-heading` `--tracking-body` `--tracking-heading` | |
| `--h1-size … --h6-size`, `--h1-font…`, `--h1-weight…`, `--color-h1…` | per-heading style (theme) |
| `--measure` | prose line length (65ch) |

Ratios (theme): `--ratio-minor-second 1.067 · major-second 1.125 · minor-third 1.2 · major-third 1.25 · perfect-fourth 1.333 · augmented-fourth 1.414 · perfect-fifth 1.5 · golden 1.618`. Set `--text-min/max-size` (px at min/max viewport) and `--text-min/max-ratio`; same pattern for `--space-*`. Viewports: `--fluid-min-vw` / `--fluid-max-vw` (unitless px).

## Space, layout, radii

| Token | Notes |
|---|---|
| `--space-3xs … --space-4xl` | fluid; `--space-m` is base. Use for padding, gap, margin |
| `--gutter` `--section-space` `--grid-gap` | layout defaults |
| `--container-narrow` `--container` `--container-wide` | max widths |
| `--radius-xs … --radius-2xl`, `--radius-none`, `--radius-full` | space × `--radius-scale` |
| `--radius-button/card/input/image` | component roles |
| `--border-width`, `--border-width-s/m/l` | |
| `--shadow-xs … --shadow-xl` | tinted by surface colour |
| `--icon-size` | 1.25em |

## Motion, stacking, misc

`--duration-fast/base/slow` · `--ease-out` `--ease-in-out` · `--transition` · `--z-base/dropdown/sticky/overlay/modal/toast` · `--opacity-disabled` · `--focus-ring` `--focus-offset` · `--aspect-square/video/photo`. Breakpoints (literals in `@media`): 40em, 48em, 64em, 80em.

## Accessibility tuning (theme)

`--a11y-light-y` / `--a11y-dark-y`: luminance (0–1) of the near-white and near-black text colours used by the `-a11y` pairs.

`profile` public properties: `--profile-aside-width`, `--profile-avatar-size`.

## Surfaces (utilities)

`u-surface-1 | 2 | 3 | accent | primary | secondary | inverse` (accent is re-pointable with theme `--accent-bg/-text/-heading/-muted/-link/-border/-button…`): set background and re-point `--color-text/-muted`, `--color-h1…h6`, `--color-link(-hover)`, `--color-border`, `--color-primary*` for everything inside. Don't nest colour surfaces.

## Utilities (prefix `u-`)

Access: `visually-hidden`. Lists: `list-none`. Link area: `clickable` (+ `clickable__skip`). Text: `truncate`, `line-clamp-1…4`, `text-balance/pretty/center/start/end/muted`, `uppercase`, `measure`, `nowrap`, `text-2xs…5xl`, `h1…h6`, `weight-medium/bold`. Layout: `center-self`, `flex-center`, `grid-center`, `flow`, `full-bleed`, `overflow-hidden`, `scroll-x`, `relative`, `cover`, `isolate`. Media: `aspect-square/video/photo`, `object-cover/contain`. Look: `border`, `shadow-s/m/l`, `rounded`, `rounded-full`. Behaviour: `no-select`, `pointer-none`, `no-scroll`, `hidden`, `hide-mobile`, `hide-desktop`. Alpine: `[x-cloak]`.

## Layout objects

`container (--narrow|--wide|--full)`, `section (--alt|--surface|--inverse|--flush)`, `stack (--s|--l|--xl, --stack-gap)`, `cluster (--between|--center|--end, --cluster-gap)`, `grid (--fill|--2|--3|--4, --grid-min, --grid-gap)`.
