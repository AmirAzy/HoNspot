# The pack

Nine skills, each a folder with a `SKILL.md` and a `references/` directory an agent opens only when it
needs the lookup tables. Nothing here executes.

| Skill | Trigger, in the words a user would use | You get |
| --- | --- | --- |
| [`debug-connectivity`](debug-connectivity/SKILL.md) | "It cannot reach the database / the other device / the API, and it worked yesterday" | A four-layer split (name, route, port, protocol), the command per layer per OS, and a refusal to change code first. References: `layered-checks.md`, `failure-signatures.md` |
| [`diagnose-slow`](diagnose-slow/SKILL.md) | "The page / endpoint / build is slow" | Baseline before optimisation, phase timing before profiling, Amdahl honesty, and a budget. Reference: `measurement.md` |
| [`release-verify`](release-verify/SKILL.md) | "Ship it" — and nobody opened the artefact | Identity chain, unpack-and-inspect, run the critical path from the artefact, publish `sha256` and exact bytes, name what was not tested. Reference: `artifact-checks.md` |
| [`plan-migration`](plan-migration/SKILL.md) | "Upgrade to the next major" — for a lot of files | Inventory with a number, compatibility matrix that dictates order, every step shippable, scaffolding deleted not deprecated. Reference: `migration-template.md` |
| [`review-diff`](review-diff/SKILL.md) | "Review this PR" | Findings ranked by blast radius, a failure scenario per finding, and specific checks for generated code. Reference: `severity.md` |
| [`write-postmortem`](write-postmortem/SKILL.md) | "Something broke last night" | Blameless but not soft: trigger ≠ cause, UTC timeline from artefacts, action items with owner/date/verification. Reference: `template.md` |
| [`api-contract`](api-contract/SKILL.md) | "Add an endpoint" — with clients you cannot upgrade | Which changes break clients, the error envelope, pagination, idempotency, deprecation with a sunset. Reference: `contract-checklist.md` |
| [`bilingual-docs`](bilingual-docs/SKILL.md) | Docs exist in two languages and are drifting | Mirroring rules, bidi and ZWNJ traps, a glossary, a parity check, and the rule that commands are never translated. Reference: `glossary-template.md` |
| [`write-a-skill`](write-a-skill/SKILL.md) | "Add a skill" / "the agent keeps making the same mistake" | The trigger-first structure, what goes to references, and the ten-question rubric. Reference: `rubric.md` |

## Installing

```bash
npx skills@latest add OWNER/hone --skill '*'
npx skills@latest add OWNER/hone --skill debug-connectivity,review-diff
```

Or copy a directory into `~/.claude/skills/`, `.agents/skills/`, or wherever your agent looks. Keep
the frontmatter intact — it is what makes the skill discoverable.

## The anatomy

```
skills/<name>/
├─ SKILL.md            # frontmatter + one page of instructions
└─ references/
   └─ <topic>.md       # lookup tables, templates, worked examples
```

```markdown
---
name: <same as the directory, kebab-case>
description: <symptoms a user would type, 60–600 characters>
license: MIT
---
```

`npm test` enforces the mechanical rules: name matches directory, description length, required
sections, every reference linked, every link resolving, and [`catalog.json`](../catalog.json) in sync.

## Choosing between them

| The situation | The skill | Not |
| --- | --- | --- |
| Nothing works at all | `debug-connectivity` | `diagnose-slow` — a timeout is not a slow path |
| It works, slowly | `diagnose-slow` | `debug-connectivity` |
| The artefact may not contain the app | `release-verify` | `plan-migration` |
| The upgrade will touch a hundred files | `plan-migration` | `release-verify` |
| The change is risky | `review-diff` | a checklist of style rules |
| The change already hurt users | `write-postmortem` | `review-diff` after the fact |
| The API will outlive the client | `api-contract` | `review-diff` on the diff alone |
| A page exists in one language only | `bilingual-docs` | `write-a-skill` |
| You are correcting the agent twice | `write-a-skill` | a longer prompt |
