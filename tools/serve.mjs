#!/usr/bin/env node
// Dependency-free static server for local preview, with the same rewrites the host will have.
// Serves public/ as the web root: anything outside it (AGENTS.md, tools/, docs/, _template.html) is a 404.
// Usage: node tools/serve.mjs [port]     (default 8765; also --port 9000 or PORT=9000)
// - Rewrites come from `_redirects` lines ending in 200 (e.g. `/item/*  /item.html  200`).
// - Unknown paths get 404.html with a 404 status. Responses are never cached.
// python3's http.server cannot rewrite, so use this for sites with a single-template page.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// --dir dist previews the deploy build (tools/build-dist.mjs) instead of public/; only public, dist and dist-pages are allowed.
const dirFlag = process.argv.indexOf('--dir');
const dir = dirFlag > -1 ? process.argv[dirFlag + 1] : 'public';
if (!['public', 'dist', 'dist-pages'].includes(dir)) { console.error('--dir must be public, dist or dist-pages'); process.exit(1); }
const root = join(dirname(fileURLToPath(import.meta.url)), '..', dir);
const flag = process.argv.indexOf('--port');
const port = Number(flag > -1 ? process.argv[flag + 1] : /^\d+$/.test(process.argv[2] || '') ? process.argv[2] : process.env.PORT) || 8765;

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
};

// `/item/*  /item.html  200` -> { prefix: '/item/', to: '/item.html' }
const rewrites = [];
const redirectsFile = join(root, '_redirects');
if (existsSync(redirectsFile)) {
  for (const line of readFileSync(redirectsFile, 'utf8').split('\n')) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (from && !from.startsWith('#') && status === '200' && from.endsWith('/*')) rewrites.push({ prefix: from.slice(0, -1), to });
  }
}

const fileFor = (urlPath) => {
  let rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  let file = join(root, rel);
  if (!file.startsWith(root + sep) && file !== root) return null; // never leave public/
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) && statSync(file).isFile() ? file : null;
};

createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  let file = fileFor(pathname);
  if (!file) {
    const rule = rewrites.find((r) => pathname.startsWith(r.prefix) && pathname.length > r.prefix.length);
    if (rule) file = fileFor(rule.to);
  }
  let status = 200;
  if (!file) { file = fileFor('/404.html'); status = 404; }
  const headers = { 'Cache-Control': 'no-store' };
  if (!file) { res.writeHead(404, headers); res.end('Not found'); return; }
  headers['Content-Type'] = types[extname(file)] || 'application/octet-stream';
  res.writeHead(status, headers);
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Serving ${root}\nhttp://localhost:${port}  (rewrites: ${rewrites.map((r) => r.prefix + '* -> ' + r.to).join(', ') || 'none'})`));
