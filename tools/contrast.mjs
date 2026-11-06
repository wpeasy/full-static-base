#!/usr/bin/env node
// WCAG 2.2 contrast and OKLCH helper for brand colours (zero dependencies).
//
//   node tools/contrast.mjs "#F4EFE6" "#0F1419"
//       ratio and rating for one pair (first = text/foreground, second = background)
//   node tools/contrast.mjs --palette Ink=#0F1419 Sand=#F4EFE6 Brass=#B08D57 [--md]
//       every colour with hex + OKLCH, then every text-on-background pair as a matrix (the brief's contrast table)
//   node tools/contrast.mjs --suggest "#B08D57" --on "#F4EFE6" [--min 4.5]
//       the nearest deeper (or lighter) version of a colour that reaches the ratio on that background,
//       keeping its hue and chroma: a text partner for a brand colour that fails. The default 4.5 lands exactly on the AA
//       boundary; for body-size text and links use --min 5 for a safety margin.
//
// Ratings: >= 7 AAA, >= 4.5 AA, >= 3 "large text and graphics only", else "fails".
// Ratios are computed from the exact hex values (WCAG relative luminance); never estimate them.

const args = process.argv.slice(2);

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(f)) throw new Error(`not a hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
};
const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const gam = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
export const luminance = (hex) => { const [r, g, b] = hexToRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export const rating = (r) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'large text and graphics only' : 'fails');

export function toOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const L = 0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}
export function fromOklch({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return rgbToHex([gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)]);
}
export const oklchString = (hex) => { const { L, C, h } = toOklch(hex); return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(h)})`; };

// Nearest colour of the same hue and chroma that reaches `min` on `bg`: darken on a light bg, lighten on a dark one
export function suggest(hex, bg, min = 4.5) {
  const base = toOklch(hex);
  const dir = luminance(bg) > 0.4 ? -1 : 1;
  for (let step = 0; step <= 100; step++) {
    const candidate = fromOklch({ ...base, L: Math.min(1, Math.max(0, base.L + dir * step * 0.005)) });
    if (ratio(candidate, bg) >= min) return candidate;
  }
  return null;
}

if (process.argv[1]?.endsWith('contrast.mjs')) {
  const md = args.includes('--md');
  const flag = (name) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : undefined; };
  try {
    if (args.includes('--palette')) {
      const colours = args.slice(args.indexOf('--palette') + 1).filter((a) => a.includes('=') && !a.startsWith('--')).map((a) => { const [name, hex] = a.split('='); return { name, hex: hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase() }; });
      if (md) {
        console.log('| Name | Hex | OKLCH |\n|---|---|---|');
        colours.forEach((c) => console.log(`| ${c.name} | \`${c.hex}\` | \`${oklchString(c.hex)}\` |`));
        console.log('\n| Text colour | On background | Ratio | Rating |\n|---|---|---|---|');
      } else { colours.forEach((c) => console.log(`${c.name.padEnd(16)} ${c.hex}  ${oklchString(c.hex)}`)); console.log(); }
      for (const fg of colours) for (const bgc of colours) {
        if (fg === bgc) continue;
        const r = ratio(fg.hex, bgc.hex);
        console.log(md ? `| ${fg.name} | ${bgc.name} | ${r.toFixed(2)}:1 | ${rating(r)} |` : `${fg.name} on ${bgc.name}: ${r.toFixed(2)}:1  ${rating(r)}`);
      }
    } else if (args.includes('--suggest')) {
      const hex = flag('--suggest'), bg = flag('--on'), min = Number(flag('--min') || 4.5);
      const out = suggest(hex, bg, min);
      console.log(out ? `${hex} on ${bg} is ${ratio(hex, bg).toFixed(2)}:1. Nearest partner reaching ${min}:1: ${out} (${ratio(out, bg).toFixed(2)}:1, ${oklchString(out)})` : 'no partner found');
    } else if (args.length >= 2) {
      const r = ratio(args[0], args[1]);
      console.log(`${r.toFixed(2)}:1  ${rating(r)}`);
    } else { console.error('usage: node tools/contrast.mjs "#fg" "#bg" | --palette Name=#hex ... [--md] | --suggest "#hex" --on "#bg" [--min 4.5]'); process.exit(1); }
  } catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
}
