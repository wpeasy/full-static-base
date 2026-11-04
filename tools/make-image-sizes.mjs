#!/usr/bin/env node
// Convert to WebP AND make the interim sizes for srcset, in one step (docs/images.md, "Responsive images").
// For each image it makes <name>.webp (the largest size, converted from a PNG/JPEG when needed), then writes
// <name>-<width>.webp next to it at the widths below (never upscaling), and prints the srcset string and the <img>
// attributes to paste. Run it on every image you add, and on images that are already WebP.
//
// Usage: node tools/make-image-sizes.mjs <file|folder> [more] [--widths 480,800,1200,1600] [--quality 70] [--delete-original] [--dry]
//   - A file: a WebP, PNG or JPEG. A folder (e.g. public/images): every image in it, skipping generated sizes
//     (name-480.webp), og*/favicon*/icons files and anything narrower than the smallest width.
//   - PNG/JPEG are converted to <name>.webp first; --delete-original then removes the PNG/JPEG (the AGENTS.md rule).
//   - Needs ImageMagick (`magick`) or libwebp (`cwebp`) installed; the site itself needs neither.
//   - Re-running overwrites the generated sizes. Names: hero.webp (largest), hero-480.webp, hero-800.webp, ...

import { existsSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageSize } from './image-size.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'public');
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const widths = flag('--widths', '480,800,1200,1600').split(',').map(Number).filter(Boolean).sort((a, b) => a - b);
const quality = Number(flag('--quality', 70));
const dry = args.includes('--dry');
const deleteOriginal = args.includes('--delete-original');
const inputs = args.filter((a, i) => !a.startsWith('--') && !['--widths', '--quality'].includes(args[i - 1]));
// A folder expands to its source images: skip generated sizes (-480), og/favicon/icons files and already-small images
const skipName = /-\d+\.webp$|^(og|favicon|icons?)\b/i;
const files = inputs.flatMap((input) => {
  if (!existsSync(input) || !statSync(input).isDirectory()) return [input];
  return readdirSync(input).filter((f) => /\.(webp|png|jpe?g)$/i.test(f) && !skipName.test(f)).map((f) => join(input, f))
    .filter((p) => (imageSize(p)?.width ?? 0) > widths[0]);
});
if (!inputs.length) { console.error('usage: node tools/make-image-sizes.mjs <file|folder> [more] [--widths 480,800,1200,1600] [--quality 70] [--delete-original] [--dry]'); process.exit(1); }
if (!files.length) { console.log('nothing to do: no images wider than ' + widths[0] + 'px'); process.exit(0); }

const has = (cmd) => { try { execFileSync('which', [cmd], { stdio: 'ignore' }); return true; } catch { return false; } };
const tool = has('magick') ? 'magick' : has('cwebp') ? 'cwebp' : null;
if (!tool && !dry) { console.error('error: install ImageMagick (`brew install imagemagick`) or libwebp (`brew install webp`) to resize images'); process.exit(1); }

function encode(src, out, width) {
  if (tool === 'magick') execFileSync('magick', [src, ...(width ? ['-resize', `${width}x`] : []), '-strip', '-quality', String(quality), '-define', 'webp:method=6', out]);
  else execFileSync('cwebp', ['-quiet', '-q', String(quality), '-m', '6', ...(width ? ['-resize', String(width), '0'] : []), src, '-o', out]);
}
const kib = (p) => `${(statSync(p).size / 1024).toFixed(1)} KiB`;
const shown = (p) => { const rel = relative(site, p); return rel.startsWith('..') ? relative(root, p) : rel; };

for (const input of files) {
  let src = resolve(input);
  if (!existsSync(src)) { console.error(`error: ${input} not found`); process.exitCode = 1; continue; }
  const dir = dirname(src), ext = extname(src).toLowerCase(), name = basename(src, ext).replace(/-\d+$/, '');
  if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) { console.error(`error: ${input}: use a WebP, PNG or JPEG`); process.exitCode = 1; continue; }

  // Master = the full-size WebP
  const master = join(dir, `${name}.webp`);
  if (ext !== '.webp') {
    if (!dry) encode(src, master);
    if (deleteOriginal && !dry) { unlinkSync(src); console.log(`${shown(src)} -> ${shown(master)} (WebP, original deleted)`); }
    else console.log(`${shown(src)} -> ${shown(master)} (WebP).${dry ? '' : ' Delete the original ' + basename(src) + ' (docs/images.md), or re-run with --delete-original.'}`);
    src = master;
  }
  const size = imageSize(src);
  if (!size) { console.error(`error: could not read the size of ${input}`); process.exitCode = 1; continue; }

  const made = widths.filter((w) => w < size.width);
  const candidates = [];
  console.log(`\n${shown(master)}  ${size.width}x${size.height}`);
  for (const w of made) {
    const out = join(dir, `${name}-${w}.webp`);
    if (!dry) encode(src, out, w);
    candidates.push(`${shown(out)} ${w}w`);
    console.log(`  ${dry ? 'would write' : 'wrote'} ${shown(out)}  ${w}w${dry ? '' : '  ' + kib(out)}`);
  }
  candidates.push(`${shown(master)} ${size.width}w`);
  if (!made.length) console.log(`  already smaller than ${widths[0]}px: no interim sizes needed`);
  console.log(`  srcset="${candidates.join(', ')}"`);
  console.log(`  src="${shown(master)}" width="${size.width}" height="${size.height}"   <- set sizes="..." to the displayed width (docs/images.md)`);
}
