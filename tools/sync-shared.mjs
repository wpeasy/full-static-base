#!/usr/bin/env node
// Copies the shared <header class="nav"> and <footer class="footer"> from _template.html into every
// real page, then marks the current page's nav link with aria-current="page".
// Pages with data-page="styleguide" (style guide / gallery) are skipped, as is _template.html itself.
// Usage: node tools/sync-shared.mjs [--dry]   (--dry lists what would change)
// Output stays plain, hand-editable HTML; there is no runtime include.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry');
const headerRe = /<header class="nav"[\s\S]*?<\/header>/;
const footerRe = /<footer class="footer"[\s\S]*?<\/footer>/;

const template = readFileSync(join(root, '_template.html'), 'utf8');
const header = template.match(headerRe)?.[0];
const footer = template.match(footerRe)?.[0];
if (!header || !footer) { console.error('_template.html must contain <header class="nav"> and <footer class="footer">'); process.exit(1); }

for (const name of readdirSync(root).filter((f) => f.endsWith('.html') && f !== '_template.html')) {
  const path = join(root, name);
  const original = readFileSync(path, 'utf8');
  if (/data-page="styleguide"/.test(original)) continue;

  const current = header.replace(
    new RegExp(`(<a class="nav__link" href="${name.replace('.', '\\.')}")`),
    '$1 aria-current="page"',
  );
  let updated = original.replace(headerRe, () => current).replace(footerRe, () => footer);
  if (updated === original) { console.log(`unchanged  ${name}`); continue; }
  console.log(`${dry ? 'would update' : 'updated'}  ${name}`);
  if (!dry) writeFileSync(path, updated);
}
