#!/usr/bin/env node
// Production helper: inline every @import in css/main.css into css/main.bundle.css
// (one request instead of ~30). No minification, so it stays readable.
// Usage: node tools/bundle-css.mjs   then point pages at css/main.bundle.css for deploy.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'css');

function inline(file) {
  const dir = dirname(file);
  return readFileSync(file, 'utf8').replace(/@import\s+url\(["']([^"']+)["']\)\s*;/g, (_, path) => {
    const target = join(dir, path);
    return `/* >>> ${path} */\n${inline(target)}\n`;
  });
}

const out = join(cssDir, 'main.bundle.css');
writeFileSync(out, inline(join(cssDir, 'main.css')));
console.log(`wrote ${out}`);
