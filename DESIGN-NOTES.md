# Design notes

Deliberate deviations from the base framework, newest first. The framework is a foundation: change what the design needs, and record it here so future upgrades and other agents know why.

Format: `YYYY-MM-DD · files · what changed · why`

<!-- Example:
2026-11-03 · css/components/card.css · added `.card--horizontal` · product list needed side-by-side media
-->

- _No deviations yet._

Base changes (not site deviations):
- 2026-11-03 · repo layout · published files moved into `public/`; tools, docs, themes and `_template.html` stay at the root · the repo root was being published, leaking AGENTS.md/tools/docs and indexable duplicates like `_template.html`
- 2026-11-03 · js/grid-filter.js · `items()` renamed `elements()`, factory exposed as `window.GridFilter` · data-driven lists keep their data in `items`
- 2026-11-03 · css/core/base.css · `li + li` spacing scoped to `:is(ul, ol):not([class]) > li + li` · it offset every item but the first when a classed list (nav, chips, badges) was laid out as a row
