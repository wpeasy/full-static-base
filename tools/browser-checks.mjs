#!/usr/bin/env node
// Optional browser checks (dev-only): axe accessibility scan + screenshots.
// Setup once:  cd tools && npm install && npx playwright install chromium
// Run:         python3 -m http.server 8000   (in another terminal, from the project root)
//              node tools/browser-checks.mjs [baseUrl=http://localhost:8000]
// Output: tools/screenshots/<page>-<theme>-<width>.png and an axe summary.
// Each page is scanned in light and dark, at 320 / 768 / 1280 px, and with reduced motion emulated.

import { readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const base = process.argv[2] || 'http://localhost:8000';

let chromium, AxeBuilder;
try {
  ({ chromium } = await import('playwright'));
  ({ default: AxeBuilder } = await import('@axe-core/playwright'));
} catch {
  console.error('Missing dev dependencies. Run: cd tools && npm install && npx playwright install chromium');
  process.exit(2);
}

const pages = readdirSync(root).filter((f) => f.endsWith('.html') && !f.startsWith('_'));
const widths = [320, 768, 1280];
const themes = ['light', 'dark'];
mkdirSync(join(here, 'screenshots'), { recursive: true });

const browser = await chromium.launch();
let violations = 0;

for (const page of pages) {
  for (const theme of themes) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: theme });
      const tab = await context.newPage();
      const consoleErrors = [];
      tab.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
      await tab.goto(`${base}/${page}`, { waitUntil: 'networkidle' });
      await tab.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);

      const overflow = await tab.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) { violations++; console.log(`OVERFLOW  ${page} ${theme} ${width}px: horizontal scroll`); }
      if (consoleErrors.length) { violations++; console.log(`CONSOLE   ${page}: ${consoleErrors.join(' | ')}`); }

      if (width === 1280) {
        const results = await new AxeBuilder({ page: tab }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        for (const v of results.violations) {
          violations++;
          console.log(`AXE       ${page} ${theme}: ${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`);
        }
      }
      await tab.screenshot({ path: join(here, 'screenshots', `${page.replace('.html', '')}-${theme}-${width}.png`), fullPage: true });
      await context.close();
    }
  }
}
await browser.close();
console.log(violations ? `\n${violations} problem(s) found` : '\nNo problems found');
process.exit(violations ? 1 : 0);
