#!/usr/bin/env node
// Deploy public/ to GitHub Pages from a separate Pages repo: export, commit, push, wait for the build.
// Usage: node tools/deploy-pages.mjs --repo owner/name [--branch gh-pages] [--base /name] [--message "text"]
//   --base defaults to /<name> (a project site). Use --base "" for a user/organisation site or a custom domain.
// Needs git and the GitHub CLI (`gh auth login`). The Pages repo is a separate COPY: it goes stale until you
// run this again. The clone lives in dist/pages (git-ignored).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : fallback; };
const repo = arg('--repo', process.env.PAGES_REPO);
if (!repo || !repo.includes('/')) { console.error('Usage: node tools/deploy-pages.mjs --repo owner/name [--branch gh-pages] [--base /name]'); process.exit(1); }
const branch = arg('--branch', 'gh-pages');
const base = arg('--base', `/${repo.split('/')[1]}`);
const message = arg('--message', `Deploy ${new Date().toISOString()}`);
const out = join(root, 'dist/pages');

const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

// 1. A clone of the Pages repo on the Pages branch (created if the repo has no such branch yet)
if (!existsSync(join(out, '.git'))) {
  mkdirSync(dirname(out), { recursive: true });
  run('gh', ['repo', 'clone', repo, out]);
}
try { run('git', ['fetch', 'origin', branch], out); run('git', ['checkout', '-B', branch, `origin/${branch}`], out); }
catch { run('git', ['checkout', '--orphan', branch], out); }

// 2. Export into it
run('node', [join(root, 'tools/export-pages.mjs'), '--out', 'dist/pages', '--base', base]);
console.log(`Exported with base "${base || '/'}"`);

// 3. Commit and push (nothing to do when the export is identical)
run('git', ['add', '-A'], out);
if (!run('git', ['status', '--porcelain'], out)) { console.log('No changes: the Pages repo is already up to date.'); process.exit(0); }
run('git', ['commit', '-m', message], out);
run('git', ['push', '-u', 'origin', branch], out);
const sha = run('git', ['rev-parse', 'HEAD'], out);
console.log(`Pushed ${sha.slice(0, 7)} to ${repo}@${branch}`);

// 4. Wait for the Pages build of that commit (about a minute)
for (let i = 0; i < 40; i++) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  let build;
  try { build = JSON.parse(run('gh', ['api', `repos/${repo}/pages/builds/latest`])); }
  catch { console.log('Waiting for the Pages build to start… (is Pages enabled for this branch in the repo settings?)'); continue; }
  if (build.commit !== sha) continue;
  if (build.status === 'built') { console.log(`Live: https://${repo.split('/')[0]}.github.io${base}/`); process.exit(0); }
  if (build.status === 'errored') { console.error(`Pages build failed: ${build.error?.message || 'unknown error'}`); process.exit(1); }
}
console.error('Timed out waiting for the Pages build. Check the repo\'s Actions / Pages settings.');
process.exit(1);
