# fonts/

Self-host fonts as `.woff2` here (no third-party font CDNs). The pattern:

1. **`css/fonts.css`**, imported **first** from `css/main.css` (before the theme, so the families exist when it names them). One `@font-face` per file.
2. **Variable woff2, split per unicode-range subset** (at least `latin` and `latin-ext`) so browsers download only the subsets a page uses.
3. `font-display: swap`.
4. **Preload only the `latin` files** used above the fold, from each page `<head>`.
5. Limit `--weight-*` in the theme to weights the variable range actually covers (e.g. a 400–700 file means `--weight-bold` is 700, not 800).

```css
/* css/fonts.css */
@font-face {
  font-family: "Inter";
  src: url("../fonts/inter-latin.woff2") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Inter";
  src: url("../fonts/inter-latin-ext.woff2") format("woff2");
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
```

```html
<link rel="preload" href="fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
```

Then set `--font-body` / `--font-heading` in `css/theme.css`.

## Getting the woff2 files from Google Fonts

Google serves different CSS by user agent. Ask for it with a **modern browser user agent** to get woff2 files, one `@font-face` per subset, each with its `unicode-range`:

```bash
curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap"
```

The response lists `/* latin-ext */` and `/* latin */` blocks (plus cyrillic, greek, vietnamese, …). Download the `url(https://fonts.gstatic.com/…woff2)` of the subsets you need into `fonts/` with readable names, and copy each block's `unicode-range` into `css/fonts.css`, pointing `src` at your local file. Variable fonts use the range form `wght@400..700`; check the licence (most Google Fonts are OFL).
