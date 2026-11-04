#!/usr/bin/env node
// Production helper: inline every @import in public/css/main.css into ONE stylesheet (one request instead of ~45,
// which removes the render-blocking @import chain PageSpeed flags).
// - Relative url(...) paths are rewritten for the bundle's location, so images and fonts keep working
//   (components use ../../images/..., which would otherwise break once everything sits in css/).
// - Optional minify: strips comments and collapses whitespace only (conservative; selectors and values are untouched).
// Usage: node tools/bundle-css.mjs [--min]   writes public/css/main.bundle.css (git-ignored).
// Deploys use tools/build-dist.mjs, which calls bundleCss({ minify: true }) and writes dist/css/main.css.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'css');

// Rewrite url(rel) found in `file` so it is relative to `outDir` (where the bundle will live).
const rebase = (css, file, outDir) => css.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/g, (match, quote, url) => {
  if (/^(data:|https?:|\/|#)/.test(url)) return match;
  const abs = resolve(dirname(file), url);
  const rel = relative(outDir, abs).split('\\').join('/');
  return `url("${rel}")`;
});

function inline(file, outDir) {
  const source = readFileSync(file, 'utf8').replace(/@import\s+url\(["']([^"']+)["']\)\s*;/g, (_, path) => `\n${inline(join(dirname(file), path), outDir)}\n`);
  return rebase(source, file, outDir);
}

const minifyCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/\s*([{};])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

export function bundleCss({ minify = false, outDir = cssDir } = {}) {
  const css = inline(join(cssDir, 'main.css'), outDir);
  return minify ? minifyCss(css) : css;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(cssDir, 'main.bundle.css');
  writeFileSync(out, bundleCss({ minify: process.argv.includes('--min') }));
  console.log(`wrote ${out}`);
}
