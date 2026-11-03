#!/usr/bin/env node
// Export public/ as a GitHub Pages site. Pages has no rewrites, no custom headers and caches everything for
// about 10 minutes, so the export does what the host cannot (docs/hosting.md):
//   - copies public/ to the output folder, skipping host-config files (_headers, _redirects, .htaccess)
//   - writes .nojekyll
//   - with --base /repo, prefixes root-absolute links (href/src/action/poster="/…") for a project site
//   - writes one copy of the single template per <singular>/<slug>/index.html (from _redirects 200 rules + data JSON)
//   - appends ?v=<content hash> to local CSS/JS references and css @imports (cache busting)
// Usage: node tools/export-pages.mjs [--out dist/pages] [--base /repo]
// An existing .git folder in the output is kept (deploy-pages.mjs uses it) and excluded from the hash.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, relative, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'public');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : fallback; };
const out = resolve(root, arg('--out', 'dist/pages'));
const base = arg('--base', '').replace(/\/+$/, ''); // '' or '/repo'
const hostFiles = new Set(['_headers', '_redirects', '.htaccess']);
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const files = (dir, skip = () => false, list = []) => {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (skip(name, path)) continue;
    if (statSync(path).isDirectory()) files(path, skip, list); else list.push(path);
  }
  return list;
};

// 1. Clean the output (keep .git) and copy
mkdirSync(out, { recursive: true });
for (const name of readdirSync(out)) if (name !== '.git') rmSync(join(out, name), { recursive: true, force: true });
for (const from of files(site, (name) => hostFiles.has(name) || name === '.DS_Store')) {
  const to = join(out, relative(site, from));
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
writeFileSync(join(out, '.nojekyll'), '');

// 2. One copy of the template per slug: `/item/*  /item.html  200` + data/<collection>.json
const redirects = existsSync(join(site, '_redirects')) ? readFileSync(join(site, '_redirects'), 'utf8').split('\n') : [];
let pages = 0;
for (const line of redirects) {
  const [from, to, status] = line.trim().split(/\s+/);
  if (!from || from.startsWith('#') || status !== '200' || !from.endsWith('/*')) continue;
  const singular = from.slice(1, -2); // '/item/*' -> 'item'
  const template = join(out, to.replace(/^\//, ''));
  const dataFile = readdirSync(join(site, 'data')).find((f) => f.endsWith('.json') && JSON.parse(readFileSync(join(site, 'data', f), 'utf8'))[f.replace('.json', '')]);
  if (!existsSync(template) || !dataFile) { console.warn(`warn: no template or data for ${from}`); continue; }
  const collection = JSON.parse(readFileSync(join(site, 'data', dataFile), 'utf8'))[dataFile.replace('.json', '')];
  for (const entry of collection) {
    const dir = join(out, singular, entry.slug || slugify(entry.name));
    mkdirSync(dir, { recursive: true });
    copyFileSync(template, join(dir, 'index.html'));
    pages++;
  }
}

// 3. Prefix root-absolute links for a project site (https://user.github.io/repo/)
const html = files(out, (name) => name === '.git').filter((f) => extname(f) === '.html');
if (base) {
  for (const file of html) {
    const src = readFileSync(file, 'utf8').replace(/\b(href|src|action|poster)="\/(?!\/)/g, `$1="${base}/`);
    writeFileSync(file, src);
  }
}

// 4. Cache busting: one hash of everything that is published (never .git)
const hash = createHash('sha1');
for (const file of files(out, (name) => name === '.git')) hash.update(relative(out, file)).update(readFileSync(file));
const version = hash.digest('hex').slice(0, 10);
const bust = (url) => (/^(https?:)?\/\//.test(url) || !/\.(css|js)(\?[^"')]*)?$/.test(url)) ? url : `${url.split('?')[0]}?v=${version}`;
for (const file of html) {
  const src = readFileSync(file, 'utf8')
    .replace(/(<link\b[^>]*\bhref=")([^"]+)(")/g, (m, a, url, c) => /rel="stylesheet"/.test(m) ? a + bust(url) + c : m)
    .replace(/(<script\b[^>]*\bsrc=")([^"]+)(")/g, (m, a, url, c) => a + bust(url) + c);
  writeFileSync(file, src);
}
for (const file of files(out, (name) => name === '.git').filter((f) => extname(f) === '.css')) {
  const src = readFileSync(file, 'utf8').replace(/(@import\s+url\(["'])([^"']+)(["']\))/g, (m, a, url, c) => a + bust(url) + c);
  writeFileSync(file, src);
}

console.log(`Exported ${relative(root, out) || out} · base "${base || '/'}" · ${pages} template page(s) · cache-bust ?v=${version}`);
