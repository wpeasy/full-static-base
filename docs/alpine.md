# Alpine in templates: rules learned the hard way

Alpine is the second choice after native HTML (AGENTS.md section 5). When you do use it for JSON-filled lists and pages:

1. **Hide with `:hidden`, not `x-show`**, for list filtering. `x-show` failed to hide items when the filter changed. Use `:hidden="!matchesItem(item, query, tag)"` plus a rule such as `.filter__item[hidden] { display: none }` (a class that sets `display` otherwise beats the `hidden` attribute).
2. **Pass reactive values as arguments** in the template: `matchesItem(item, query, tag)`, not `matchesItem(item)` that reads `this.query` inside. Alpine tracks what the expression reads in the template; values read only inside a method may not re-run it.
3. **Filter on data fields, not `textContent`.** When an `x-for` item is first inserted its `textContent` is still empty, so text-based matching hides everything.
4. **`x-cloak` only what is useless without JavaScript.** A search box that needs JS may be `x-cloak`; a toolbar that must work (links, a native form) must not be.
5. **Exactly one `<h1>`, outside every `<template>`**, with its text bound to the status (`x-text="heading"`: Loading…, the name, Not found). `tools/check.mjs` blanks `<template>` contents, so an `<h1>` inside a template is not counted.
6. A page filled by Alpine uses the `page` wrapper (docs/js-rendered-pages.md) and one `status` property: `loading | ready | missing | error`.
7. Anything longer than a one-line expression goes in `js/<name>.js` as `Alpine.data('name', …)` (no inline scripts, CSP).
8. A class method used in the template must not share a name with a data property (`items()` vs the `items` array): that is why the base class method is `elements()`.
