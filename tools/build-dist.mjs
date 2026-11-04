#!/usr/bin/env node
// Deploy build: copy public/ to dist/ and ship ONE minified stylesheet instead of ~45 @imported files.
//   - dist/css/main.css is the bundle (pages keep linking css/main.css, so no HTML changes);
//     the per-component CSS files are not copied.
//   - .DS_Store and main.bundle.css are skipped.
// public/ stays the hand-edited source. Cloudflare deploys publish dist/ (wrangler.jsonc). dist/ is git-ignored.
// Usage: node tools/build-dist.mjs

import { cpSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleCss } from './bundle-css.mjs';
import { checkDist } from './check-dist.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
cpSync(src, dist, {
  recursive: true,
  filter: (path) => !/\.DS_Store$|main\.bundle\.css$/.test(path) && !/[\\/]public[\\/]css[\\/](components|core|fonts\.css|theme\.css)/.test(path),
});
mkdirSync(join(dist, 'css'), { recursive: true });
const css = bundleCss({ minify: true, outDir: join(src, 'css') });
writeFileSync(join(dist, 'css', 'main.css'), css);

const count = (dir) => readdirSync(dir).reduce((n, f) => n + (statSync(join(dir, f)).isDirectory() ? count(join(dir, f)) : 1), 0);
console.log(`dist/: ${count(dist)} files; css/main.css ${(css.length / 1024).toFixed(1)} KiB (one request)`);

const result = checkDist();
const problems = Array.isArray(result) ? result : result.problems;
if (problems.length) { problems.forEach((p) => console.error(`error: ${p}`)); process.exit(1); }
console.log(`checked: no @import, ${result.urls} CSS url() reference(s) resolve`);
