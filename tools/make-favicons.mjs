#!/usr/bin/env node
// Make the whole icon set every browser, OS and search engine needs from ONE client icon (docs/favicons.md).
// An SVG-only favicon is not enough: Safari and some crawlers ignore it, and browsers still request /favicon.ico.
//
// Source: SVG (best), PNG, JPEG, WebP or ICO. Any aspect ratio (it is fitted into a square, transparent padding).
// A raster source should be at least 512x512 (1024+ is better); smaller is upscaled and will look soft.
//
// Writes (into public/ by default, or --out):
//   favicon.ico             16, 32 and 48px in one file (universal fallback; keep it at the site root)
//   apple-touch-icon.png    180x180 on an opaque background (iOS paints transparency black)
//   icon-192.png            192x192  (web manifest, Android)
//   icon-512.png            512x512  (web manifest, splash)
//   icon-maskable-512.png   512x512, icon at 66% on an opaque background (Android adaptive icons crop to a shape)
//   images/favicon.svg      a copy of an SVG source (the modern-browser icon)
// and updates public/site.webmanifest icons (if present). With an SVG source it leaves the page <head> alone.
// With a raster source use --no-svg: it removes the SVG <link> from _template.html and public/*.html and deletes
// images/favicon.svg, because there is no vector to serve.
//
// Usage: node tools/make-favicons.mjs [source] [--bg "#ffffff"] [--no-svg] [--trim] [--preview preview.png] [--out public]
//   --bg       opaque background for apple-touch-icon and the maskable icon (default white; use a brand colour
//              that contrasts with the icon, e.g. the dark surface for a white mark)
//   --trim     remove transparent margins around the artwork before fitting it (use it when the supplied tile has built-in
//              padding: the margin wastes pixels at 16px and shrinks the maskable icon). For an SVG source the copy written to
//              images/favicon.svg gets a tighter viewBox too (square viewBox sources only)
//   --preview  also write a contact sheet (16/32/48/180px on light and dark, magnified) so you can judge legibility
// Needs ImageMagick (`magick`) installed; the site itself needs nothing. An SVG source is rasterised with `rsvg-convert`
// or headless Chrome when available (ImageMagick's own SVG renderer can drop strokes, arcs and masks: check --preview).

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'public');
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const source = resolve(args.find((a, i) => !a.startsWith('--') && !['--bg', '--out', '--preview'].includes(args[i - 1])) || join(site, 'images/favicon.svg'));
const out = resolve(flag('--out', site));
const bg = flag('--bg', '#ffffff');
const preview = flag('--preview', '');
const noSvg = args.includes('--no-svg');
const trim = args.includes('--trim');
const isSvg = extname(source).toLowerCase() === '.svg';

try { execFileSync('which', ['magick'], { stdio: 'ignore' }); } catch { console.error('error: install ImageMagick (`brew install imagemagick`) to generate icons'); process.exit(1); }
if (!existsSync(source)) { console.error(`error: ${relative(root, source)} not found`); process.exit(1); }
mkdirSync(out, { recursive: true });
const magick = (...a) => execFileSync('magick', a.flat());

// 1. Master: the source fitted into a 1024px transparent square (an SVG is rasterised at 1024px, so it stays sharp)
const has = (cmd) => { try { execFileSync('which', [cmd], { stdio: 'ignore' }); return true; } catch { return false; } };
const chrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
function rasteriseSvg(svg) {
  const png = join(tmpdir(), `icon-svg-${process.pid}.png`);
  if (has('rsvg-convert')) { execFileSync('rsvg-convert', ['-w', '1024', '-h', '1024', '--keep-aspect-ratio', '-o', png, svg]); return png; }
  if (chrome) {
    const dir = mkdtempSync(join(tmpdir(), 'icon-chrome-'));
    const page = join(dir, 'page.html');
    writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}img{display:block;width:1024px;height:1024px;object-fit:contain}</style><img src="file://${encodeURI(svg)}">`);
    try {
      execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', `--user-data-dir=${join(dir, 'profile')}`,
        '--default-background-color=00000000', `--screenshot=${png}`, '--window-size=1024,1024', `file://${page}`], { stdio: 'ignore', timeout: 60000 });
    } finally { rmSync(dir, { recursive: true, force: true }); }
    if (existsSync(png)) return png;
  }
  console.warn("warn: neither rsvg-convert nor Chrome found: using ImageMagick's SVG renderer, which can drop strokes, arcs and masks. Check --preview.");
  return null;
}
const svgPng = isSvg ? rasteriseSvg(source) : null;
// Where the artwork sits inside the 1024px square render (used to tighten the SVG copy under --trim)
let trimBox = null;
if (trim && svgPng) { const g = execFileSync('magick', [svgPng, '-trim', '-format', '%w %h %X %Y', 'info:']).toString().trim().split(' ').map(Number); trimBox = { w: g[0], h: g[1], x: g[2], y: g[3] }; }
const master = join(tmpdir(), `icon-master-${process.pid}.png`);
magick('-background', 'none', ...(isSvg && !svgPng ? ['-density', '1024'] : []), `${svgPng || source}[0]`, ...(trim ? ['-trim', '+repage'] : []), '-resize', '1024x1024', '-gravity', 'center', '-extent', '1024x1024', master);
if (svgPng) unlinkSync(svgPng);
const info = execFileSync('magick', ['identify', '-format', '%w %h', `${source}[0]`]).toString().trim().split(' ').map(Number);
if (!isSvg && Math.min(...info) < 512) console.warn(`warn: the source is ${info[0]}x${info[1]}; at least 512x512 is recommended (the large icons will look soft). Ask the client for a larger file or an SVG.`);
if (info[0] !== info[1]) console.warn(`note: the source is not square (${info[0]}x${info[1]}); it was fitted into a square with transparent padding.`);

// 2. Derive everything from the master
const resize = (size) => ['-resize', `${size}x${size}`];
const flat = ['-background', bg, '-alpha', 'remove', '-alpha', 'off'];
magick(master, resize(180), flat, '-strip', join(out, 'apple-touch-icon.png'));
magick(master, resize(192), '-strip', join(out, 'icon-192.png'));
magick(master, resize(512), '-strip', join(out, 'icon-512.png'));
magick('-size', '512x512', `xc:${bg}`, '(', master, resize(338), ')', '-gravity', 'center', '-composite', '-strip', join(out, 'icon-maskable-512.png'));
magick(master, '-define', 'icon:auto-resize=48,32,16', join(out, 'favicon.ico'));
const written = ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

// 3. SVG: keep a copy of a vector source; with a raster source there is no SVG to serve
const svgTarget = join(out, 'images', 'favicon.svg');
if (isSvg && source !== svgTarget) {
  mkdirSync(dirname(svgTarget), { recursive: true });
  let svg = readFileSync(source, 'utf8');
  if (trim && trimBox) {
    const vb = svg.match(/viewBox="\s*([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)\s*"/);
    if (vb && Math.abs(vb[3] - vb[4]) < 0.01) {
      const [vx, vy, vw] = [Number(vb[1]), Number(vb[2]), Number(vb[3])], k = vw / 1024;
      const box = [vx + trimBox.x * k, vy + trimBox.y * k, trimBox.w * k, trimBox.h * k].map((n) => +n.toFixed(2)).join(' ');
      svg = svg.replace(/<svg\b[^>]*>/, (tag) => tag.replace(vb[0], `viewBox="${box}"`).replace(/\s(width|height)="[^"]*"/g, ''));
    } else console.warn('note: --trim could not tighten the SVG copy (needs a square viewBox); the PNG and ICO icons are trimmed, the SVG keeps its margin.');
  }
  writeFileSync(svgTarget, svg);
  written.push('images/favicon.svg');
}
if (noSvg && out === site) {
  if (existsSync(svgTarget)) unlinkSync(svgTarget);
  const pages = [join(root, '_template.html'), ...readdirSync(site).filter((f) => f.endsWith('.html')).map((f) => join(site, f))].filter(existsSync);
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const next = html.replace(/[ \t]*<link rel="icon" href="[^"]*favicon\.svg" type="image\/svg\+xml">\r?\n/g, '');
    if (next !== html) writeFileSync(page, next);
  }
  console.log('removed the SVG <link> from _template.html and public/*.html, and images/favicon.svg (raster source)');
} else if (!isSvg && !noSvg) console.warn('warn: the source is not an SVG. Re-run with --no-svg so the pages stop linking images/favicon.svg.');

// 4. Manifest icons
const manifestPath = join(out, 'site.webmanifest');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.icons = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ];
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  written.push('site.webmanifest (icons)');
}

// 5. Optional contact sheet to judge legibility at real sizes
if (preview) {
  const row = (color) => [
    ...[16, 32, 48].flatMap((s) => ['(', '-size', '220x220', `xc:${color}`, '(', join(out, 'favicon.ico') + `[${{ 16: 2, 32: 1, 48: 0 }[s]}]`, '-filter', 'point', '-resize', `${s * 4}x${s * 4}`, ')', '-gravity', 'center', '-composite', ')']),
    '(', '-size', '220x220', `xc:${color}`, '(', join(out, 'apple-touch-icon.png'), ')', '-gravity', 'center', '-composite', ')',
    '+append',
  ];
  magick('(', row('#ffffff'), ')', '(', row('#0f1419'), ')', '-append', resolve(preview));
  written.push(`${relative(root, resolve(preview))} (preview: 16/32/48 magnified, then 180)`);
}

unlinkSync(master);
for (const f of written) console.log(`wrote ${f}`);
console.log('\nEvery page <head> needs (docs/favicons.md):\n  <link rel="icon" href="/favicon.ico" sizes="32x32">\n' + (noSvg ? '' : '  <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">\n') + '  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n  <link rel="manifest" href="/site.webmanifest">');
