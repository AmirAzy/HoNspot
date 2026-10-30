# Writing a skill

This page is the long version of `skills/write-a-skill`. It explains the anatomy, what the validator
enforces, and the questions a reviewer will ask.

## The anatomy

```
skills/<name>/
├─ SKILL.md
└─ references/
   └─ <topic>.md
```

`SKILL.md` is one page. If it needs two, the second page is a reference.

### Frontmatter

```markdown
---
name: debug-connectivity
description: Diagnose why two processes, two machines, a container and its host, or a client and a
  server cannot exchange traffic. Use when a connection times out or is refused…
license: MIT
---
```

| Field | Rule | Why |
| --- | --- | --- |
| `name` | kebab-case, identical to the directory | A mismatch means the loader cannot find the skill |
| `description` | 60–600 characters, symptoms first | This is the entire trigger; it is matched, not read |
| `license` | SPDX identifier | A skill is copied between agents; the license travels with it |

The description is the only part an agent reads before deciding. Write it as a sentence a user would
type in a panic, then a sentence about when it applies:

> "Use when two machines cannot talk, when a timeout or refusal appears, when a service works locally
> but not from another host…"

Not: "This skill covers network diagnostics including TCP/IP."

### Body sections

| Section | Purpose | Enforced |
| --- | --- | --- |
| Intro paragraph | What goes wrong without this skill | — |
| `## When to use` | Trigger detail, and explicit non-goals | Warned if missing |
| `## Ground rules` | 4–7 numbered, checkable rules | — |
| `## Procedure` | Numbered steps, one action each | — |
| `## Anti-patterns` | Table: tempting move → why it is wrong | — |
| `## Definition of done` | Checkboxes including what cannot be verified | Required |
| `## Report format` | A skeleton the agent fills in | — |

At least four level-2 headings are required; a skill with fewer is a note, not a procedure.

### References

Move anything that is looked up rather than memorised: command tables per platform, templates,
glossaries, worked examples. Link them from the point of the procedure where they are needed, by name:

```markdown
The command set per operating system is in [references/layered-checks.md](references/layered-checks.md).
```

The validator fails on a reference that is linked but missing, **and** on a file that exists but is
never linked. Both are rot: the first breaks, the second grows without being read.

## What the validator checks

```bash
npm run validate     # scripts/validate-skills.mjs --check
```

| Check | Failure mode it prevents |
| --- | --- |
| Frontmatter present and closed | The loader silently skips the skill |
| `name` matches the directory, kebab-case | Un-findable skill |
| Description 60–600 characters | Too short to trigger; too long to be read |
| ≥ 4 level-2 headings, `Definition of done` present | An essay instead of a procedure |
| No `TODO`, `TBD`, `FIXME`, lorem ipsum | A skill that shipped before it was finished |
| Every linked reference exists | A dead pointer at the moment of need |
| Every reference file is linked | Dead weight |
| `SKILL.md` < 20 KB, references < 60 KB | The detail crept back into the instructions |
| `catalog.json` matches the directories | The machine-readable index lying about the pack |

Style is not enforced. Judgement is not enforced. That is the point: the machine checks what a machine
can check, and a human review decides whether the skill changes behaviour.

## The review questions

Answer these in the pull request; six or fewer "yes" means not ready.

1. What specific failure does this prevent, and what are three real instances of it?
2. Does the description use the user's symptoms rather than module names?
3. Are the facts (numbers, commands, error strings) stated, so the agent does not invent them?
4. Is every ground rule checkable?
5. Does each procedure step contain one action?
6. Is the tempting shortcut named in Anti-patterns?
7. Does the definition of done include what cannot be verified?
8. Is the body short enough to be read before acting?
9. Is the boundary written — when *not* to use it, and what to use instead?
10. Was it tested with and without, on a real task?

## Testing a change

```bash
npm test             # validator + every relative link in every markdown file
npm run catalog      # after adding, renaming or removing a skill
```

`npm run catalog` rewrites `catalog.json`; CI fails if you forget. That is deliberate: a catalog that
is updated by hand is a catalog that is wrong by the second week.

## Bilingual rules

Skills are written in English. The pack's own documentation is bilingual, and the same rules apply:
mirrored filenames, commands never translated, and a page in one language that is missing in the other
is a bug rather than a backlog item. If you add a doc page, add both, or say in the pull request which
side is pending and who will finish it.
