# fonts/

Self-host fonts as `.woff2` here (no third-party font CDNs). Declare them in `css/theme.css` (or a `css/fonts.css` imported first from `main.css`):

```css
@font-face {
  font-family: "Inter";
  src: url("../fonts/inter-var.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

Then set `--font-body` / `--font-heading` in the theme. Preload only the one or two files used above the fold:
`<link rel="preload" href="fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>`.
Prefer variable fonts; subset to the languages you need.
