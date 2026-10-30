# Security policy

## The short version

This repository contains **text and two Node scripts**. It has no dependencies, no install hooks, no
build step and no network access. `npm test` reads files and prints a report; that is all it does.

The scripts are:

| File | Reads | Writes |
| --- | --- | --- |
| `scripts/validate-skills.mjs` | `skills/**/SKILL.md`, `references/**` | `catalog.json` (only with `--write`) |
| `scripts/check-links.mjs` | every `*.md` in the repository | nothing |

Neither spawns a process, opens a socket, or evaluates content from a file it reads.

## What is still worth reporting

- **Advice that is dangerous.** A skill that tells an agent to disable TLS verification, open a
  firewall, run as root, or delete data to make a symptom go away. That is the most serious defect
  this project can ship, and it is a security report rather than a bug.
- **A script that writes outside the repository**, follows a symlink out of the tree, or can be made
  to output unescaped content from a file it does not own.
- **A dependency appearing** in `package.json` without review — the zero-dependency property is part of
  the trust model, not an accident.
- **A prompt-injection payload embedded in a skill** (instructions aimed at the agent rather than at the
  reader, hidden text, invisible characters).

## Reporting

Open a private report through GitHub's *Security → Report a vulnerability* tab, or email the maintainer
address on the repository profile. Include the file and the smallest reproduction. You can expect an
acknowledgement within a few days, and a coordinated disclosure if the issue affects anyone who has
installed the pack.

## Out of scope

- The behaviour of the agent or model that loads these skills. A skill is an instruction; a model that
  ignores or misapplies it is not a vulnerability in the text.
- Findings produced by security scanners on the markdown itself (long lines, HTML in code fences).
- Anything requiring write access to the repository.
