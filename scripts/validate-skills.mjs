#!/usr/bin/env node
/**
 * Validate every skill in the pack, and keep catalog.json honest.
 *
 *   node scripts/validate-skills.mjs           validate and report
 *   node scripts/validate-skills.mjs --check   validate + fail if catalog.json is stale (CI)
 *   node scripts/validate-skills.mjs --write   validate + rewrite catalog.json
 *
 * The rules are the ones this repository actually relies on. They are mechanical because a
 * convention that is not enforced is a suggestion, and a skill pack that drifts becomes a folder of
 * essays that no agent can tell apart.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skillsDir = join(root, 'skills');
const catalogPath = join(root, 'catalog.json');

const REQUIRED_FRONTMATTER = ['name', 'description', 'license'];
const REQUIRED_SECTIONS = ['When to use', 'Definition of done'];
const MIN_DESCRIPTION = 60;
const MAX_DESCRIPTION = 600;
const MAX_SKILL_BYTES = 20_000;
const MAX_REFERENCE_BYTES = 60_000;
const FORBIDDEN_WORDS = [/\bTODO\b/, /\bTBD\b/, /\bFIXME\b/, /lorem ipsum/i];

const MODE = process.argv.includes('--write') ? 'write' : process.argv.includes('--check') ? 'check' : 'report';

const errors = [];
const warnings = [];
const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);
const warn = (file, message) => warnings.push(`${relative(root, file)}: ${message}`);

/** Minimal YAML: `key: value` pairs, with optional surrounding quotes. Enough for skill frontmatter. */
function parseFrontmatter(text, file) {
  if (!text.startsWith('---\n')) {
    fail(file, 'must start with a "---" frontmatter block');
    return { data: {}, body: text };
  }
  const end = text.indexOf('\n---', 4);
  if (end === -1) {
    fail(file, 'frontmatter block is never closed with "---"');
    return { data: {}, body: text };
  }
  const raw = text.slice(4, end);
  const data = {};
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const match = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line);
    if (!match) {
      fail(file, `frontmatter line is not "key: value": ${line.trim().slice(0, 60)}`);
      continue;
    }
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: text.slice(end + 4).trimStart() };
}

function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function validateSkill(dirName) {
  const file = join(skillsDir, dirName, 'SKILL.md');
  if (!existsSync(file)) {
    fail(join(skillsDir, dirName), 'skill directory has no SKILL.md');
    return null;
  }

  const bytes = statSync(file).size;
  if (bytes > MAX_SKILL_BYTES) {
    fail(file, `SKILL.md is ${bytes} bytes; keep one page of instructions (limit ${MAX_SKILL_BYTES})`);
  }

  const text = readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(text, file);

  for (const key of REQUIRED_FRONTMATTER) {
    if (!data[key]) fail(file, `frontmatter is missing "${key}"`);
  }

  if (data.name && data.name !== dirName) {
    fail(file, `frontmatter name "${data.name}" does not match the directory "${dirName}"`);
  }
  if (data.name && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) {
    fail(file, `name must be kebab-case, got "${data.name}"`);
  }
  if (data.description) {
    const length = data.description.length;
    if (length < MIN_DESCRIPTION) {
      fail(file, `description is ${length} characters; it must be long enough to trigger on symptoms (min ${MIN_DESCRIPTION})`);
    }
    if (length > MAX_DESCRIPTION) {
      fail(file, `description is ${length} characters; agents match on it, keep it under ${MAX_DESCRIPTION}`);
    }
    if (/^this skill\b/i.test(data.description)) {
      warn(file, 'description starts with "This skill"; lead with the situation instead');
    }
  }

  for (const pattern of FORBIDDEN_WORDS) {
    if (pattern.test(text)) fail(file, `contains unfinished-content marker ${pattern}`);
  }

  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
  if (headings.length < 4) {
    fail(file, `has ${headings.length} level-2 headings; a skill needs at least 4 (procedure, anti-patterns, done…)`);
  }
  for (const required of REQUIRED_SECTIONS) {
    if (!headings.some((heading) => heading.toLowerCase().includes(required.toLowerCase()))) {
      fail(file, `is missing a "${required}" section`);
    }
  }
  if (!/^##\s+When to use/im.test(body)) {
    warn(file, 'put "When to use" first; it is the section an agent reads to decide whether to continue');
  }

  // References: linked ones must exist, and every file must be linked so it cannot silently rot.
  const refDir = join(skillsDir, dirName, 'references');
  const referenced = new Set(
    [...body.matchAll(/references\/([A-Za-z0-9._-]+\.md)/g)].map((match) => match[1]),
  );
  for (const ref of referenced) {
    const refFile = join(refDir, ref);
    if (!existsSync(refFile)) {
      fail(file, `links to references/${ref}, which does not exist`);
      continue;
    }
    const refBytes = statSync(refFile).size;
    if (refBytes > MAX_REFERENCE_BYTES) fail(refFile, `reference is ${refBytes} bytes; split it`);
    const refText = readFileSync(refFile, 'utf8');
    if (!refText.startsWith('# ')) fail(refFile, 'must start with a level-1 heading');
    if (/^---\n/.test(refText)) warn(refFile, 'has frontmatter; references are loaded by the skill, not triggered');
  }
  if (existsSync(refDir)) {
    for (const entry of readdirSync(refDir)) {
      if (entry.endsWith('.md') && !referenced.has(entry)) {
        fail(join(refDir, entry), 'is never linked from SKILL.md — dead weight for an agent');
      }
    }
  }

  const anchors = [...body.matchAll(/^###\s+(.+)$/gm)].map((match) => slugify(match[1]));
  return {
    name: data.name ?? dirName,
    description: data.description ?? '',
    license: data.license ?? '',
    path: `skills/${dirName}/SKILL.md`,
    headings: headings.length,
    references: [...referenced].sort(),
    anchors,
  };
}

// ---- run ---------------------------------------------------------------------------------------

if (!existsSync(skillsDir)) {
  console.error('skills/ is missing');
  process.exit(1);
}

const dirs = readdirSync(skillsDir)
  .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
  .sort();

if (dirs.length === 0) {
  console.error('skills/ contains no skill directories');
  process.exit(1);
}

const catalog = dirs.map(validateSkill).filter(Boolean).map(({ anchors, ...entry }) => entry);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const error of errors) console.error(`  ✖ ${error}`);
}
for (const warning of warnings) console.warn(`  ! ${warning}`);
if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ ${catalog.length} skills valid, no warnings`);
} else if (errors.length === 0) {
  console.log(`✓ ${catalog.length} skills valid, ${warnings.length} warning(s)`);
}

// No absolute URL in here on purpose: the catalog must be identical before and after the repository
// is pointed at a different GitHub account. The schema lives in catalog.schema.json.
const serialised = `${JSON.stringify({ version: 1, skills: catalog }, null, 2)}\n`;

if (MODE === 'write') {
  writeFileSync(catalogPath, serialised);
  console.log(`catalog.json written (${catalog.length} skills)`);
} else if (MODE === 'check') {
  if (!existsSync(catalogPath)) {
    console.error('catalog.json is missing — run: npm run catalog');
    process.exit(1);
  }
  if (readFileSync(catalogPath, 'utf8') !== serialised) {
    console.error('catalog.json is out of date — run: npm run catalog');
    process.exit(1);
  }
  console.log('✓ catalog.json is up to date');
}

process.exit(errors.length ? 1 : 0);
