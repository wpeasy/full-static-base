#!/usr/bin/env node
// Verifies the deploy build (dist/, from tools/build-dist.mjs):
//   - dist/css/main.css exists and contains no @import (one request, no waterfall)
//   - every url(...) in it resolves to a real file in dist/ (a broken relative path 404s silently in production)
//   - every local <link>/<script>/<img>/<source> reference in dist/*.html resolves (query strings ignored)
// Usage: node tools/check-dist.mjs   (build-dist.mjs runs it automatically)   Exit 1 on failure.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

export function checkDist() {
  const problems = [];
  const cssFile = join(dist, 'css', 'main.css');
  if (!existsSync(cssFile)) return ['dist/css/main.css is missing: run node tools/build-dist.mjs'];

  const css = readFileSync(cssFile, 'utf8');
  if (/@import/.test(css)) problems.push('dist/css/main.css still contains @import (render-blocking waterfall)');

  const local = (url) => !/^(data:|https?:|\/\/|#|mailto:|tel:)/.test(url);
  const urls = [...css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)].map((m) => m[2]).filter(local);
  for (const url of urls) {
    const clean = url.split(/[?#]/)[0];
    const target = clean.startsWith('/') ? join(dist, clean) : resolve(dirname(cssFile), clean);
    if (!existsSync(target)) problems.push(`dist/css/main.css: url(${url}) does not resolve to a file in dist/`);
  }

  for (const name of readdirSync(dist).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(join(dist, name), 'utf8');
    for (const m of html.matchAll(/\b(?:href|src)="([^"#]+)[^"]*"/g)) {
      const url = m[1].split('?')[0];
      if (!local(url) || /^(\/?item\/)/.test(url) || url.endsWith('/') || !/\.[a-z0-9]+$/i.test(url)) continue;
      const target = url.startsWith('/') ? join(dist, url) : join(dist, url);
      if (!existsSync(target)) problems.push(`dist/${name}: ${url} does not resolve to a file in dist/`);
    }
  }
  return { problems, urls: urls.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkDist();
  const problems = Array.isArray(result) ? result : result.problems;
  if (problems.length) { problems.forEach((p) => console.error(`error: ${p}`)); process.exit(1); }
  console.log(`dist OK: no @import, ${result.urls} CSS url() reference(s) resolve`);
}
