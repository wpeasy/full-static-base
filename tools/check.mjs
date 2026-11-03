#!/usr/bin/env node
// Guardrails for the framework. Zero dependencies: `node tools/check.mjs`
// Errors fail the run (exit 1). Warnings are worth a look but don't fail.
// Checks: tokens-not-literals, BEM, no !important/IDs, motion gating, HTML semantics,
// accessibility basics, shared header/footer, asset links, main.css imports.
// Rules are heuristics: if one is wrong for a deliberate design choice, change the
// rule here and note it in DESIGN-NOTES.md. This is a foundation, not a cage.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const findings = [];
const report = (level, file, line, message) => {
  const f = { level, file: relative(root, file), line, message };
  // The same finding can come from more than one pass (see variantPasses): report it once
  if (!findings.some((x) => x.level === f.level && x.file === f.file && x.line === f.line && x.message === f.message)) findings.push(f);
};
const error = (...a) => report('error', ...a);
const warn = (...a) => report('warn', ...a);

const walk = (dir, filter, out = []) => {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', 'vendor', 'tools', 'themes'].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, filter, out);
    else if (filter(path)) out.push(path);
  }
  return out;
};
const lineOf = (src, index) => src.slice(0, index).split('\n').length;
const blank = (s) => s.replace(/[^\n]/g, ' '); // keep line numbers when removing text

// ---------------------------------------------------------------- CSS
const cssFiles = walk(join(root, 'css'), (p) => p.endsWith('.css') && !p.endsWith('bundle.css'));

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, blank);

// Ranges of `@media (prefers-reduced-motion: no-preference) { … }`
function noPreferenceRanges(css) {
  const ranges = [];
  const re = /@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1, i = re.lastIndex;
    while (i < css.length && depth) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++; }
    ranges.push([m.index, i]);
  }
  return ranges;
}

const definedClasses = new Set();
const bem = /^(?:u-[a-z0-9]+(?:-[a-z0-9]+)*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)$/;

for (const file of cssFiles) {
  const name = relative(join(root, 'css'), file);
  const raw = readFileSync(file, 'utf8');
  const css = stripComments(raw);
  const isThemeLike = ['theme.css', 'core/framework.css'].includes(name);
  const isComponent = name.startsWith('components/');
  const isStyleguide = name.endsWith('styleguide.css');

  // Motion gating (all files, incl. theme)
  const ranges = noPreferenceRanges(css);
  const gated = (i) => ranges.some(([a, b]) => i >= a && i < b);
  for (const m of css.matchAll(/@keyframes\s+[\w-]+|(?<![\w-])animation\s*:|scroll-behavior\s*:\s*smooth/g)) {
    if (!gated(m.index) && name !== 'core/base.css') {
      error(file, lineOf(css, m.index), `\`${m[0].trim()}\` must be inside @media (prefers-reduced-motion: no-preference)`);
    }
  }

  if (isThemeLike) continue; // literals are expected here

  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    if (!/url\(/.test(css.slice(Math.max(0, m.index - 6), m.index))) error(file, lineOf(css, m.index), `hex colour ${m[0]}: use a colour token`);
  }
  for (const m of css.matchAll(/\b(rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/g)) {
    error(file, lineOf(css, m.index), `${m[1]}() colour literal: use a colour token (or color-mix of tokens)`);
  }
  for (const m of css.matchAll(/font-size\s*:\s*[\d.]+(px|rem)\b/g)) {
    error(file, lineOf(css, m.index), 'font-size literal: use a --text-* token');
  }
  for (const m of css.matchAll(/z-index\s*:\s*(-?\d+)/g)) {
    if (Math.abs(Number(m[1])) > 9) error(file, lineOf(css, m.index), 'z-index literal above 9: use a --z-* token');
  }
  for (const m of css.matchAll(/(?:^|[\s:(,])(\d*\.?\d+)px\b/gm)) {
    const before = css.slice(css.lastIndexOf('\n', m.index) + 1, m.index + 1);
    if (/@media|blur\(|--[\w-]+\s*:\s*$/.test(before) || m[1] === '0' || m[1] === '1' || isStyleguide) continue;
    warn(file, lineOf(css, m.index), `${m[1]}px literal: prefer a --space-*, --border-width-* or rem value`);
  }
  for (const m of css.matchAll(/(?<![\w.])(\d+m?s)\b\s*(?:var\(|[a-z-]+\(|ease|linear|;|,)/g)) {
    if (name !== 'core/base.css' && /transition|animation/.test(css.slice(css.lastIndexOf('\n', m.index), m.index))) {
      warn(file, lineOf(css, m.index), `duration ${m[1]}: use a --duration-* token`);
    }
  }
  for (const m of css.matchAll(/!important/g)) {
    if (!['core/base.css', 'core/utilities.css', 'core/print.css'].includes(name)) error(file, lineOf(css, m.index), '!important is not allowed outside utilities, print and the reduced-motion safety net');
  }
  for (const m of css.matchAll(/outline\s*:\s*(none|0)\b/g)) {
    const block = css.slice(css.lastIndexOf('{', m.index), css.indexOf('}', m.index));
    if (/box-shadow|border-color/.test(block) || /:focus-within[^{]*\{[^}]*outline/.test(css)) continue;
    warn(file, lineOf(css, m.index), 'outline removed: make sure a visible focus replacement exists');
  }

  for (const c of css.matchAll(/\.([a-zA-Z_][\w-]*)/g)) definedClasses.add(c[1]);

  // Selectors: BEM classes, no IDs (components + layout + utilities)
  const noBlocks = css.replace(/@media[^{]*\{|@layer[^{;]*[{;]|@supports[^{]*\{|@container[^{]*\{|@starting-style\s*\{/g, blank);
  for (const rule of noBlocks.matchAll(/([^{}]+)\{/g)) {
    const selectorText = rule[1];
    if (/^\s*(from|to|\d+%)/.test(selectorText) || /@keyframes/.test(selectorText)) continue;
    for (const id of selectorText.matchAll(/#[a-zA-Z_][\w-]*/g)) error(file, lineOf(css, rule.index + id.index), `ID selector ${id[0]} is not allowed`);
    if (isComponent || name.startsWith('core/layout') || name.startsWith('core/utilities')) {
      for (const cls of selectorText.matchAll(/\.([a-zA-Z_][\w-]*)/g)) {
        if (!bem.test(cls[1])) error(file, lineOf(css, rule.index + cls.index), `class .${cls[1]} is not BEM (block__element--modifier) or u-*`);
      }
    }
  }
}

// main.css imports every component and every import exists
const mainPath = join(root, 'css/main.css');
if (existsSync(mainPath)) {
  const main = readFileSync(mainPath, 'utf8');
  const imported = [...main.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)].map((m) => m[1]);
  for (const p of imported) if (!existsSync(join(root, 'css', p))) error(mainPath, 1, `imports missing file ${p}`);
  for (const f of cssFiles.filter((p) => relative(join(root, 'css'), p).startsWith('components/'))) {
    const rel = relative(join(root, 'css'), f);
    if (!imported.includes(rel)) error(mainPath, 1, `${rel} is not imported by css/main.css`);
  }
} else error(mainPath, 1, 'css/main.css is missing');

// ---------------------------------------------------------------- JS
for (const file of walk(join(root, 'js'), (p) => p.endsWith('.js'))) {
  const src = readFileSync(file, 'utf8');
  const motion = /\b(scrollTo|scrollIntoView|\.animate\(|requestAnimationFrame|gsap\.|autoplay|IntersectionObserver)\b/;
  const m = src.match(motion);
  if (m && !/reducedMotion|prefers-reduced-motion/.test(src)) {
    error(file, lineOf(src, m.index), `scripted motion (${m[1]}) without a prefers-reduced-motion check ($reducedMotion() / matchMedia)`);
  }
  for (const x of src.matchAll(/!!?\s*(?:eval|document\.write)\(/g)) error(file, lineOf(src, x.index), 'avoid eval/document.write');
}

// ---------------------------------------------------------------- HTML
function stripTemplates(html) {
  let out = '', i = 0;
  const open = /<template\b[^>]*>/g, close = /<\/template>/g;
  while (i < html.length) {
    open.lastIndex = i;
    const m = open.exec(html);
    if (!m) { out += html.slice(i); break; }
    out += html.slice(i, m.index);
    let depth = 1, j = open.lastIndex;
    while (depth && j < html.length) {
      open.lastIndex = j; close.lastIndex = j;
      const o = open.exec(html), c = close.exec(html);
      if (c && (!o || c.index < o.index)) { depth--; j = close.lastIndex; } else if (o) { depth++; j = open.lastIndex; } else break;
    }
    out += blank(html.slice(m.index, j));
    i = j;
  }
  return out;
}

// Pages may hold alternative designs side by side: <div data-variant="a">…</div><div data-variant="b">…</div>.
// Each variant is checked on its own with the others blanked, so one <h1>, unique ids and heading
// order hold per variant. Pages without data-variant get a single pass.
function variantPasses(html) {
  const blocks = [];
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\sdata-variant="([^"]+)"[^>]*>/gi)) {
    const tag = new RegExp(`<(/?)${m[1]}\\b[^>]*>`, 'gi');
    tag.lastIndex = m.index;
    let depth = 0, end = html.length, t;
    while ((t = tag.exec(html))) {
      depth += t[1] ? -1 : 1;
      if (!depth) { end = tag.lastIndex; break; }
    }
    blocks.push({ id: m[2], start: m.index, end });
  }
  const ids = [...new Set(blocks.map((b) => b.id))];
  if (!ids.length) return [html];
  return ids.map((id) => blocks.filter((b) => b.id !== id).reduce((out, b) => out.slice(0, b.start) + blank(out.slice(b.start, b.end)) + out.slice(b.end), html));
}

const htmlFiles = readdirSync(root).filter((f) => f.endsWith('.html')).map((f) => join(root, f));
const sharedParts = {};
const seenTitles = new Map(), seenDescriptions = new Map();
const metaContent = (html, re) => (html.match(re) || [])[1];
const seoLimits = { title: 60, description: 160 };

// Raster images should be WebP (or SVG/AVIF): flag leftovers in images/
for (const f of walk(join(root, 'images'), (p) => /\.(jpe?g|png|gif)$/i.test(p))) warn(f, 1, 'convert to WebP (see docs/images.md), keep only the .webp');
const normalise = (s) => s.replace(/\s+/g, ' ').replace(/\b(href|src)="\//g, '$1="') /* single-template pages use root-absolute paths */.replace(/ aria-current="page"/g, '').replace(/nav__link--current/g, '').replace(/class="nav__link\s+"/g, 'class="nav__link"').trim();

for (const file of htmlFiles) {
  const original = readFileSync(file, 'utf8');
  const base = stripTemplates(original.replace(/<!--[\s\S]*?-->/g, blank));

  // SEO: tags present, length guidance, unique titles and descriptions; JSON-LD must parse
  const noindex = /<meta[^>]*name="robots"[^>]*noindex/i.test(base);
  if (!/data-page="styleguide"/.test(base) && !noindex && file !== join(root, '_template.html')) {
    const title = (metaContent(base, /<title>([^<]*)<\/title>/i) || '').trim();
    const description = metaContent(base, /<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || '';
    if (!/<link[^>]*rel="canonical"/i.test(base)) warn(file, 1, 'missing <link rel="canonical"> (docs/seo.md)');
    for (const og of ['og:title', 'og:description', 'og:image']) if (!new RegExp(`<meta[^>]*property="${og}"`, 'i').test(base)) warn(file, 1, `missing <meta property="${og}"> (docs/seo.md)`);
    if (title.length > seoLimits.title) warn(file, 1, `title is ${title.length} characters (aim for ${seoLimits.title} or fewer)`);
    if (description.length > seoLimits.description) warn(file, 1, `meta description is ${description.length} characters (aim for ${seoLimits.description} or fewer)`);
    for (const [map, value, what] of [[seenTitles, title, 'title'], [seenDescriptions, description, 'meta description']]) {
      if (value && map.has(value)) warn(file, 1, `${what} is the same as ${relative(root, map.get(value))}: every page needs its own`);
      else if (value) map.set(value, file);
    }
  }
  for (const m of base.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch (e) { error(file, lineOf(base, m.index), `JSON-LD is not valid JSON: ${e.message}`); }
  }
  for (const html of variantPasses(base)) {
    const isGuide = /data-page="styleguide"/.test(html);
    const here = (re) => { const m = html.match(re); return m ? lineOf(html, m.index) : 1; };

    if (!/^\s*<!doctype html>/i.test(html)) error(file, 1, 'missing <!doctype html>');
    if (!/<html[^>]*\blang="[a-z]/i.test(html)) error(file, 1, '<html> needs a lang attribute');
    const title = html.match(/<title>([^<]*)<\/title>/i);
    if (!title || !title[1].trim()) error(file, 1, 'missing or empty <title>');
    const viewport = html.match(/<meta[^>]*name="viewport"[^>]*>/i);
    if (!viewport) error(file, 1, 'missing viewport meta');
    else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport[0])) error(file, here(/name="viewport"/), 'viewport must not disable zoom');
    if (!isGuide && !/<meta[^>]*name="description"/i.test(html)) error(file, 1, 'missing meta description');

    // Landmarks, skip link, headings
    const mains = [...html.matchAll(/<main\b[^>]*>/gi)];
    if (mains.length !== 1) error(file, 1, `expected exactly one <main>, found ${mains.length}`);
    else if (!/\bid="main"/.test(mains[0][0])) error(file, here(/<main\b/i), '<main> should have id="main" (skip link target)');
    const firstLink = html.match(/<(a|button|input|select|textarea)\b[^>]*>/i);
    if (!firstLink || !/skip-link/.test(firstLink[0])) error(file, here(/<body/i), 'the skip link must be the first focusable element');
    const navs = [...html.matchAll(/<nav\b[^>]*>/gi)];
    if (navs.length > 1) for (const n of navs) if (!/aria-label(ledby)?=/.test(n[0])) error(file, lineOf(html, n.index), 'multiple <nav>s: each needs aria-label or aria-labelledby');
    const h1s = [...html.matchAll(/<h1\b/gi)];
    if (h1s.length !== 1) error(file, 1, `expected exactly one <h1>, found ${h1s.length}`);
    let prev = 0;
    for (const h of html.matchAll(/<h([1-6])\b/gi)) {
      const level = Number(h[1]);
      if (prev && level > prev + 1) error(file, lineOf(html, h.index), `heading level skips from h${prev} to h${level}`);
      prev = level;
    }

    // Classes: BEM or u-*, and defined in the CSS (static class attributes only)
    for (const m of html.matchAll(/(?<![:@\w-])class="([^"]*)"/g)) {
      for (const cls of m[1].split(/\s+/).filter(Boolean)) {
        if (cls.includes('$') || cls.includes('{')) continue;
        if (!bem.test(cls)) error(file, lineOf(html, m.index), `class "${cls}" is not BEM (block__element--modifier) or u-*`);
        else if (!definedClasses.has(cls)) error(file, lineOf(html, m.index), `class "${cls}" is not defined in any CSS file (create it, or fix the name)`);
        else if (/^[a-z][a-z0-9-]*__[a-z0-9-]+__/.test(cls)) error(file, lineOf(html, m.index), `class "${cls}" nests elements: use block__element`);
      }
    }

    // Images, icons, buttons, links, controls
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\salt=/.test(m[0])) error(file, lineOf(html, m.index), '<img> needs an alt attribute (empty for decorative)');
      if (!/\swidth=/.test(m[0]) || !/\sheight=/.test(m[0])) warn(file, lineOf(html, m.index), '<img> should set width and height');
      if (!/\sloading="(eager|lazy)"/.test(m[0])) warn(file, lineOf(html, m.index), '<img> needs loading="eager" (in the first 1920x1080 screen) or loading="lazy" (everything else)');
      if (/\ssrc="[^"]*\.(jpe?g|png|gif)(\?[^"]*)?"/i.test(m[0])) error(file, lineOf(html, m.index), '<img> uses a JPEG/PNG/GIF: convert it to WebP (docs/images.md)');
    }
    for (const m of html.matchAll(/<svg\b[^>]*class="icon[^"]*"[^>]*>/gi)) {
      if (!/aria-hidden="true"|role="img"/.test(m[0])) warn(file, lineOf(html, m.index), 'icon svg should be aria-hidden="true" (decorative) or role="img" with a label');
    }
    for (const m of html.matchAll(/<button\b[^>]*>/gi)) {
      if (!/\stype=/.test(m[0])) error(file, lineOf(html, m.index), '<button> needs an explicit type');
    }
    for (const m of html.matchAll(/<(div|span|li|p|section|article)\b[^>]*\s@click[^>]*>/gi)) {
      error(file, lineOf(html, m.index), `@click on <${m[1]}>: use a <button> or <a> so it is keyboard accessible`);
    }
    for (const m of html.matchAll(/tabindex="([1-9]\d*)"/g)) error(file, lineOf(html, m.index), 'positive tabindex disrupts focus order');
    for (const m of html.matchAll(/\sstyle="([^"]*)"/g)) {
      if (m[1].split(';').map((d) => d.trim()).filter(Boolean).some((d) => !d.startsWith('--'))) error(file, lineOf(html, m.index), 'inline style may only set custom properties (--x: …)');
    }
    for (const m of html.matchAll(/<a\b[^>]*>([^<]*)<\/a>/gi)) {
      if (/^\s*(click here|here|read more|more)\s*$/i.test(m[1])) warn(file, lineOf(html, m.index), `link text "${m[1].trim()}" is not descriptive`);
      if (/\shref="#"/.test(m[0])) warn(file, lineOf(html, m.index), 'placeholder href="#"');
    }

    // Duplicate ids and label association
    const ids = new Map();
    for (const m of html.matchAll(/\sid="([^"$]+)"/g)) {
      if (ids.has(m[1])) error(file, lineOf(html, m.index), `duplicate id "${m[1]}"`);
      ids.set(m[1], true);
    }
    for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
      if (/type="(hidden|submit|button|reset|image)"/.test(m[0])) continue;
      const id = (m[0].match(/\sid="([^"]+)"/) || [])[1];
      const labelled = /aria-label=|aria-labelledby=/.test(m[0]) || (id && new RegExp(`<label[^>]*\\sfor="${id}"`).test(html));
      if (!labelled) error(file, lineOf(html, m.index), `<${m[1]}> has no label (use <label for>, aria-label or aria-labelledby)`);
    }
    for (const m of html.matchAll(/<table\b/gi)) {
      const rest = html.slice(m.index, html.indexOf('</table>', m.index));
      if (!/<caption|aria-label/.test(rest)) warn(file, lineOf(html, m.index), '<table> should have a <caption> or aria-label');
      if (!/<th\b/.test(rest)) error(file, lineOf(html, m.index), '<table> needs header cells (<th scope>)');
    }

    // Local assets and sprite symbols exist; in-page anchors resolve
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(url) || url.includes('${')) continue;
      if (url.startsWith('#')) {
        if (url.length > 1 && !ids.has(url.slice(1))) error(file, lineOf(html, m.index), `anchor ${url} has no matching id`);
        continue;
      }
      const pathPart = url.split(/[?#]/)[0]; // ignore ?v=1.2.3 cache-busters
      const frag = url.includes('#') ? url.split('#')[1] : '';
      if (!pathPart) continue;
      const target = join(root, pathPart);
      if (!existsSync(target)) { error(file, lineOf(html, m.index), `missing file ${pathPart}`); continue; }
      if (frag && pathPart.endsWith('.svg') && !new RegExp(`id="${frag}"`).test(readFileSync(target, 'utf8'))) error(file, lineOf(html, m.index), `sprite has no #${frag} symbol`);
    }

    // Shared header/footer must match the template on real pages
    if (!isGuide) {
      const header = html.match(/<header class="nav"[\s\S]*?<\/header>/);
      const footer = html.match(/<footer class="footer"[\s\S]*?<\/footer>/);
      for (const [key, part] of [['header', header], ['footer', footer]]) {
        if (!part) { error(file, 1, `missing shared ${key} (copy it from _template.html)`); continue; }
        const norm = normalise(part[0]);
        if (!sharedParts[key]) sharedParts[key] = { norm, file };
        else if (sharedParts[key].norm !== norm) error(file, lineOf(html, part.index), `shared ${key} differs from ${relative(root, sharedParts[key].file)}; keep it identical on every page`);
      }
    }
  }
}

// ---------------------------------------------------------------- report
const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warn');
for (const f of [...errors, ...warnings]) console.log(`${f.level === 'error' ? 'ERROR' : 'warn '}  ${f.file}:${f.line}  ${f.message}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) · ${cssFiles.length} CSS, ${htmlFiles.length} HTML files checked`);
process.exit(errors.length ? 1 : 0);
