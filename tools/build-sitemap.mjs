#!/usr/bin/env node
// Rewrites the item URLs in sitemap.xml between <!-- items:start --> and <!-- items:end --> from data/items.json.
// Usage: node tools/build-sitemap.mjs [collection] [singular]     (defaults: items item)
// Needs site.url in the JSON (e.g. "https://example.com"). Keep slugify() identical to js/items-data.js.
// Also check that robots.txt points at the same sitemap URL (this script warns if it does not).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [collection = 'items', singular = 'item'] = process.argv.slice(2);
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const data = JSON.parse(readFileSync(join(root, `data/${collection}.json`), 'utf8'));
const base = data.site?.url?.replace(/\/$/, '');
if (!base) { console.error(`data/${collection}.json needs site.url`); process.exit(1); }

const urls = data[collection].map((i) => `  <url><loc>${base}/${singular}/${i.slug || slugify(i.name)}</loc></url>`);
const sitemapPath = join(root, 'sitemap.xml');
const xml = readFileSync(sitemapPath, 'utf8');
const re = new RegExp(`(<!-- ${collection}:start -->)[\\s\\S]*?(\\s*<!-- ${collection}:end -->)`);
if (!re.test(xml)) { console.error(`sitemap.xml needs <!-- ${collection}:start --> and <!-- ${collection}:end --> markers`); process.exit(1); }
writeFileSync(sitemapPath, xml.replace(re, `$1\n${urls.join('\n')}$2`));
console.log(`sitemap.xml: ${urls.length} ${singular} URL(s) from data/${collection}.json`);

const robots = join(root, 'robots.txt');
if (existsSync(robots) && !readFileSync(robots, 'utf8').includes(`Sitemap: ${base}/sitemap.xml`)) console.warn(`warn: robots.txt should contain "Sitemap: ${base}/sitemap.xml"`);
