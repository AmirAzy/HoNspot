#!/usr/bin/env node
/**
 * Fail the build when a relative link in the documentation points at nothing.
 *
 * Documentation is the product here, so a broken link is a broken feature. Anchors are checked as
 * warnings rather than errors: slug rules differ between GitHub, editors and static site generators,
 * and a false failure is worse than a missed anchor.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', '.git', '.agents', '.claude']);

function markdownFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) markdownFiles(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

const files = markdownFiles(root);
const anchorsByFile = new Map();
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  anchorsByFile.set(file, new Set([...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => slugify(m[1].trim()))));
}

const broken = [];
const unresolvedAnchors = [];
let checked = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:)/.test(target)) continue;
    const [rawPath, rawAnchor] = target.split('#');
    checked += 1;

    if (rawPath) {
      const decoded = decodeURIComponent(rawPath);
      const resolved = normalize(join(dirname(file), decoded));
      if (!existsSync(resolved)) {
        broken.push(`${relative(root, file)} → ${target}`);
        continue;
      }
      if (rawAnchor && resolved.endsWith('.md')) {
        const anchors = anchorsByFile.get(resolved);
        if (anchors && !anchors.has(decodeURIComponent(rawAnchor).toLowerCase())) {
          unresolvedAnchors.push(`${relative(root, file)} → ${target}`);
        }
      }
    }
  }
}

console.log(`${files.length} markdown files, ${checked} relative links checked`);

if (unresolvedAnchors.length) {
  console.log(`\n${unresolvedAnchors.length} anchor(s) could not be matched (warning):`);
  for (const item of unresolvedAnchors) console.log(`  ! ${item}`);
}

if (broken.length) {
  console.error(`\n${broken.length} broken link(s):`);
  for (const item of broken) console.error(`  ✖ ${item}`);
  process.exit(1);
}

console.log('✓ no broken relative links');
