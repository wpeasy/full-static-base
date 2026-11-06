#!/usr/bin/env node
// Render a brief written in Markdown to a print-ready HTML page (A4, branded cover), dependency-free.
// Print it to PDF with headless Chrome (see test-brief/README.md). No pandoc needed.
//
// Usage: node tools/md-to-brief-html.mjs <brief.md> [--out brief.html]
//          [--logo logo-pack/svg/logo-horizontal-on-dark.svg] [--hero logo-pack/headers/hero-dark.webp]
//          [--fonts assets/fonts/fonts.css] [--client "Client name"] [--title "Website brief"]
//          [--ink "#0F1419"] [--accent "#FF5A1F"] [--accent-deep "#B93A08"] [--link "#077A70"] [--paper "#F4EFE6"]
//          [--heading-font "Barlow Condensed"] [--body-font Figtree] [--mono-font "DM Mono"] [--heading-case uppercase|none]
//          A font value containing a comma is used as a full stack, e.g. --heading-font "'Playfair Display',Georgia,serif"
// Asset paths are written into the HTML as given, so pass them relative to the --out file.
// Supported Markdown: # ## ### headings, paragraphs (line breaks kept), - and 1. lists, tables, > quotes, ``` code,
// --- rules, **bold**, *italic*, `code`, [text](https://...) links. Local links become plain text (a PDF cannot follow
// them).
// Placeholders: the brief uses exactly two tags and they must be impossible to miss in the PDF:
//   [supply]  (fact missing, nothing invented)  -> bold yellow "TO SUPPLY" badge with a red outline
//   [confirm] (working assumption to approve)   -> paler dashed "CONFIRM" badge
//   text after a colon stays inside the badge:  [supply: ABN]  [confirm: assumed online only]
// A blockquote that starts with **ACTION FOR THE CLIENT renders as a boxed, red-bordered notice; it is lifted off the
// cover and placed at the top of the body (page 2, before section 1). When the brief contains any [supply] tag or that
// notice, the cover gets a yellow "DRAFT: items tagged TO SUPPLY are placeholders the client must provide" banner
// (turn off with --no-draft-banner).
// The first H1 is "Title: Client" (or just a title); everything before the first H2 goes on the cover.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); return i > -1 ? args[i + 1] : fallback; };
const input = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!input) { console.error('usage: node tools/md-to-brief-html.mjs <brief.md> [--out brief.html] [options: see the file header]'); process.exit(1); }
const md = readFileSync(resolve(input), 'utf8').split('\n');
const out = resolve(flag('--out', join(dirname(resolve(input)), 'brief.html')));

const theme = {
  ink: flag('--ink', '#0F1419'), accent: flag('--accent', '#FF5A1F'), deep: flag('--accent-deep', '#B93A08'),
  link: flag('--link', '#077A70'), paper: flag('--paper', '#F4EFE6'),
};
const stack = (value, fallback) => (value.includes(',') ? value : `"${value}",${fallback}`);
const fonts = { head: stack(flag('--heading-font', 'Barlow Condensed'), '"Arial Narrow",Arial,sans-serif'), body: stack(flag('--body-font', 'Figtree'), 'system-ui,Arial,sans-serif'), mono: stack(flag('--mono-font', 'DM Mono'), 'ui-monospace,Menlo,monospace') };
const headCase = flag('--heading-case', 'uppercase');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (t) => esc(t)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/\[(supply|confirm)(?::\s*([^\]]*))?\]/gi, (m, k, text) => `<span class="tag tag--${k.toLowerCase()}">${k.toLowerCase() === 'supply' ? 'To supply' : 'Confirm'}${text ? `: ${text.trim()}` : ''}</span>`)
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => (/^https?:/.test(href) ? `<a href="${href}">${text}</a>` : `<span class="ref">${text}</span>`));

const body = [];
let title = '';
for (let i = 0; i < md.length;) {
  const l = md[i];
  if (!l.trim()) { i++; continue; }
  if (l.startsWith('```')) { const b = []; i++; while (i < md.length && !md[i].startsWith('```')) { b.push(esc(md[i])); i++; } i++; body.push(`<pre>${b.join('\n')}</pre>`); continue; }
  let m;
  if ((m = l.match(/^(#{1,3}) (.*)/))) { if (m[1].length === 1 && !title) { title = m[2]; i++; continue; } body.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
  if (/^---+$/.test(l)) { body.push('<hr>'); i++; continue; }
  if (l.startsWith('>')) {
    const b = []; while (i < md.length && md[i].startsWith('>')) { b.push(md[i].replace(/^>\s?/, '')); i++; }
    const text = b.join(' ');
    body.push(`<blockquote${/^\*\*ACTION FOR THE CLIENT/i.test(text) ? ' class="notice"' : ''}>${inline(text)}</blockquote>`); continue;
  }
  if (l.startsWith('|')) {
    const rows = []; while (i < md.length && md[i].startsWith('|')) { rows.push(md[i]); i++; }
    const cells = (r) => r.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
    const head = cells(rows[0]), data = rows.slice(2).map(cells);
    body.push(`<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${data.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    continue;
  }
  if (/^\s*([-*]|\d+\.) /.test(l)) {
    const ordered = /^\s*\d+\./.test(l); const items = [];
    while (i < md.length && /^\s*([-*]|\d+\.) /.test(md[i])) { items.push(md[i].replace(/^\s*([-*]|\d+\.) /, '')); i++; }
    const tag = ordered ? 'ol' : 'ul'; body.push(`<${tag}>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${tag}>`); continue;
  }
  const p = [];
  while (i < md.length && md[i].trim() && !/^(#|\||>|```|---|\s*([-*]|\d+\.) )/.test(md[i])) { p.push(md[i]); i++; }
  body.push(`<p>${p.map(inline).join('<br>')}</p>`);
}

const html = body.join('\n');
const firstH2 = html.indexOf('<h2>');
let cover = firstH2 > -1 ? html.slice(0, firstH2) : '', rest = firstH2 > -1 ? html.slice(firstH2) : html;
// The client-action notice belongs at the top of the body, not on the cover
const notices = cover.match(/<blockquote class="notice">[\s\S]*?<\/blockquote>/g) || [];
for (const n of notices) cover = cover.replace(n, '');
rest = notices.join('\n') + '\n' + rest;
const needsBanner = !args.includes('--no-draft-banner') && (notices.length > 0 || /tag--supply/.test(html));
const [heading, clientFromTitle] = title.split(/:\s+/, 2);
const coverTitle = flag('--title', heading || basename(input, '.md'));
const client = flag('--client', clientFromTitle || '');
const words = coverTitle.split(' ');
const coverH1 = `${esc(words.slice(0, -1).join(' '))} <span>${esc(words.at(-1))}</span>`.trim();
const logo = flag('--logo', ''), hero = flag('--hero', ''), fontsCss = flag('--fonts', '');

writeFileSync(out, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title || coverTitle)}</title>
${fontsCss ? `<link rel="stylesheet" href="${fontsCss}">` : ''}
<style>
@page{size:A4;margin:20mm 18mm 22mm}
@page:first{margin:0}
:root{--ink:${theme.ink};--accent:${theme.accent};--deep:${theme.deep};--link:${theme.link};--paper:${theme.paper};--line:#d9d2c2;
--head:${fonts.head};--body:${fonts.body};--mono:${fonts.mono}}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:var(--body);font-size:10.5pt;line-height:1.5;color:#1a1a1a;margin:0}
.cover{height:297mm;background:var(--ink);color:var(--paper);padding:22mm 20mm;position:relative;break-after:page;overflow:hidden}
.cover .bg{position:absolute;inset:auto 0 0 0;width:100%;height:38%;object-fit:cover}
.cover .inner{position:relative}
.cover h1{font-family:var(--head);font-weight:800;text-transform:${headCase};font-size:60pt;line-height:.95;margin:36mm 0 8mm;overflow-wrap:break-word}
.cover h1 span{color:var(--accent)}
.cover .kicker{font-family:var(--mono);font-size:9pt;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:6mm}
.cover .meta{font-size:10.5pt;color:#c9d1da;max-width:125mm}
.cover .meta p{margin:0 0 2mm}.cover .meta .ref{color:#c9d1da}
.cover blockquote{background:rgba(255,255,255,.08);color:#c9d1da;border-left-color:var(--accent);font-size:9pt}
h2{font-family:var(--head);font-weight:800;text-transform:${headCase};font-size:23pt;line-height:1.02;margin:11mm 0 3mm;padding-top:4mm;border-top:3px solid var(--accent);break-after:avoid}
h3{font-family:var(--head);font-weight:700;text-transform:${headCase};font-size:13.5pt;letter-spacing:.02em;margin:6mm 0 2mm;color:var(--deep);break-after:avoid}
p{margin:0 0 3mm}ul,ol{margin:0 0 3mm;padding-left:5.5mm}li{margin-bottom:1.2mm}
code{font-family:var(--mono);font-size:9pt;background:#efe9db;padding:.2mm 1.2mm;border-radius:1mm}
pre{font-family:var(--mono);font-size:8.5pt;background:var(--ink);color:var(--paper);padding:4mm;border-radius:2mm;white-space:pre-wrap;break-inside:avoid}
hr{border:0;border-top:1px solid var(--line);margin:6mm 0}
blockquote{margin:0 0 4mm;padding:3mm 4mm;background:var(--paper);border-left:3px solid var(--accent);font-size:9.5pt}
table{width:100%;border-collapse:collapse;margin:0 0 4mm;font-size:9pt}
th{font-family:var(--mono);font-weight:500;font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;text-align:left;background:var(--ink);color:var(--paper);padding:2mm 2.5mm}
td{padding:2mm 2.5mm;border-bottom:1px solid var(--line);vertical-align:top}
tr{break-inside:avoid}
.ref{font-weight:600;color:var(--link)}a{color:var(--link)}
.tag{display:inline-block;font-family:var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:.3mm 1.8mm;border-radius:1.2mm;vertical-align:1px;color:#1a1a1a;font-size:7.5pt;line-height:1.35}
.tag--supply{background:#FFD400;border:1.4px solid #D62828;font-weight:700;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.tag--confirm{background:#FFF6D6;border:1.2px dashed #A67C00;color:#5c4500;font-weight:500;box-decoration-break:clone;-webkit-box-decoration-break:clone}
blockquote.notice{background:#FFF3F0;border:2.2px solid #D62828;border-left-width:2.2px;border-radius:2mm;padding:4mm 5mm;font-size:10pt;margin:0 0 6mm;break-inside:avoid}
blockquote.notice strong:first-child{display:block;color:#D62828;font-family:var(--head);font-size:15pt;letter-spacing:.02em;text-transform:uppercase;margin-bottom:1.5mm;line-height:1.1}
.draft{display:inline-block;background:#FFD400;color:#1a1a1a;font-family:var(--mono);font-weight:700;font-size:8.5pt;letter-spacing:.08em;text-transform:uppercase;padding:2mm 4mm;border:1.6px solid #D62828;border-radius:1.5mm;margin-top:14mm}
.draft + h1{margin-top:8mm}
</style></head><body>
<section class="cover">
${hero ? `<img class="bg" src="${hero}" alt="">` : ''}
<div class="inner">
${logo ? `<img src="${logo}" width="230" alt="${esc(client)}">` : ''}
${needsBanner ? '<div class="draft">DRAFT: items tagged TO SUPPLY are placeholders the client must provide</div>' : ''}
<h1>${coverH1}</h1>
${client ? `<div class="kicker">${esc(client)}</div>` : ''}
<div class="meta">${cover}</div></div>
</section>
<main>
${rest}
</main></body></html>`);
console.log(`wrote ${out}`);
