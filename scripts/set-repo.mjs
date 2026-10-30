#!/usr/bin/env node
/**
 * Point the repository's own links at the GitHub account that will host it.
 *
 *   node scripts/set-repo.mjs <owner> [repo]     rewrite links
 *   node scripts/set-repo.mjs --check            show what is still a placeholder
 *
 * The placeholder is `OWNER/hone`; this script and PUBLISH.md mention it by design and are skipped.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PLACEHOLDER = 'OWNER/hone';
const SKIP_DIRS = new Set(['node_modules', '.git', '.agents', '.claude']);
const TEXT_EXT = new Set(['.md', '.json', '.yml', '.yaml', '.mjs', '.js', '.txt']);
const NEVER_REWRITE = new Set(['scripts/set-repo.mjs', 'PUBLISH.md']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (TEXT_EXT.has(extname(entry))) {
      const rel = relative(root, full).split(sep).join('/');
      if (!NEVER_REWRITE.has(rel)) out.push(full);
    }
  }
  return out;
}

const arg = process.argv[2];

if (!arg || arg === '--help' || arg === '-h') {
  console.log(`Usage:
  node scripts/set-repo.mjs <owner> [repo]   replace OWNER/hone with <owner>/<repo>
  node scripts/set-repo.mjs --check          list files that still contain the placeholder`);
  process.exit(arg ? 0 : 1);
}

const files = walk(root).filter((file) => readFileSync(file, 'utf8').includes(PLACEHOLDER));

if (arg === '--check') {
  if (files.length === 0) {
    console.log('No placeholder left — every link already points somewhere concrete.');
    process.exit(0);
  }
  console.log(`${files.length} file(s) still contain "${PLACEHOLDER}":`);
  for (const file of files) {
    const count = readFileSync(file, 'utf8').split(PLACEHOLDER).length - 1;
    console.log(`  ${relative(root, file)}  (${count})`);
  }
  console.log('\nRun: node scripts/set-repo.mjs <owner> [repo]');
  process.exit(0);
}

const owner = arg.replace(/^@/, '');
const repo = (process.argv[3] ?? 'hone').replace(/\.git$/, '');
const replacement = `${owner}/${repo}`;

if (!/^[A-Za-z0-9-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) {
  console.error(`Not a valid GitHub owner/repo pair: ${owner}/${repo}`);
  process.exit(1);
}

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = before.split(PLACEHOLDER).join(replacement);
  if (after !== before) {
    writeFileSync(file, after);
    changed += 1;
    console.log(`  updated ${relative(root, file)}`);
  }
}

const remaining = walk(root).filter((file) => readFileSync(file, 'utf8').includes(PLACEHOLDER)).length;
console.log(
  `\n${changed} file(s) updated to ${replacement}. ${
    remaining ? `${remaining} still contain the placeholder.` : 'No placeholder left.'
  }`,
);
console.log('catalog.json is untouched: it is generated from the skill directories and holds no URLs.');
