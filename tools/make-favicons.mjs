#!/usr/bin/env node
// Make the favicon set every browser, OS and search engine needs from ONE source image (docs/favicons.md).
// An SVG-only favicon is not enough: Safari and some crawlers ignore it, and browsers still request /favicon.ico.
// Writes, into public/ (or --out):
//   favicon.ico            16, 32 and 48px in one file (the universal fallback; keep it at the site root)
//   apple-touch-icon.png   180x180, flattened on an opaque background (iOS paints transparency black)
//   icon-192.png           192x192  (web manifest, Android)
//   icon-512.png           512x512  (web manifest, splash)
// public/images/favicon.svg stays the modern-browser icon and is the default source.
// Usage: node tools/make-favicons.mjs [source.svg|png] [--bg "#ffffff"] [--out public]
//   --bg   background for apple-touch-icon.png (default white; use the brand colour for a flat mark)
// Needs ImageMagick (`magick`) installed; the site itself needs nothing.

import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const source = resolve(args.find((a, i) => !a.startsWith('--') && !['--bg', '--out'].includes(args[i - 1])) || join(root, 'public/images/favicon.svg'));
const out = resolve(flag('--out', join(root, 'public')));
const bg = flag('--bg', '#ffffff');

try { execFileSync('which', ['magick'], { stdio: 'ignore' }); } catch { console.error('error: install ImageMagick (`brew install imagemagick`) to generate favicons'); process.exit(1); }
if (!existsSync(source)) { console.error(`error: ${relative(root, source)} not found`); process.exit(1); }
mkdirSync(out, { recursive: true });

// Rasterise large (vector stays sharp), then downscale: -density only matters for SVG input
const png = (size, file, flatten) => execFileSync('magick', ['-background', 'none', '-density', '1024', source, '-resize', `${size}x${size}`,
  ...(flatten ? ['-background', flatten, '-alpha', 'remove', '-alpha', 'off'] : []), '-strip', join(out, file)]);
png(180, 'apple-touch-icon.png', bg);
png(192, 'icon-192.png');
png(512, 'icon-512.png');
execFileSync('magick', ['-background', 'none', '-density', '1024', source, '-define', 'icon:auto-resize=48,32,16', join(out, 'favicon.ico')]);

for (const f of ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) console.log(`wrote ${relative(root, join(out, f))}`);
console.log('\nEvery page <head> needs (docs/favicons.md):\n  <link rel="icon" href="/favicon.ico" sizes="32x32">\n  <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n  <link rel="manifest" href="/site.webmanifest">');
