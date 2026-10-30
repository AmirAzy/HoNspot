# Contributing

This repository is text plus two small scripts. The bar for a new skill is not "is this useful" — it is
"is there a specific thing an agent does wrong, repeatedly, that this prevents".

## Before you write

1. **Name the failure.** One sentence, and two or three instances where you saw it happen (a
   transcript, an issue, a review comment).
2. **Check the pack.** `skills/README.md` has a table for choosing between skills; if yours is a
   narrower version of an existing one, improve that one instead.
3. **Decide what changes.** If you cannot describe what the agent should do *differently* in its first
   three actions, there is no skill to write.

## Getting set up

```bash
git clone https://github.com/OWNER/hone.git
cd hone
npm test        # no install needed: there are no dependencies
```

Requirements: Node 20.19+. That is the entire toolchain.

```bash
npm run validate    # structure, frontmatter, references, catalog
npm run links       # every relative link in every markdown file
npm run catalog     # regenerate catalog.json after adding or renaming a skill
```

## Rules

- **Frontmatter is the contract.** `name` matches the directory, `description` is 60–600 characters
  and leads with symptoms, `license` is an SPDX identifier.
- **One page.** If `SKILL.md` needs to be longer, the detail belongs in `references/`.
- **Nothing executable.** Skills are text. If a step needs a script, it is a command the agent runs
  from the repository it is working in, not code shipped here.
- **No security shortcuts.** A skill may never suggest disabling a verification, opening access, or
  running as root to make a symptom disappear.
- **Bilingual docs.** A new page in `docs/en/` needs its `docs/fa/` counterpart (or a note in the pull
  request saying who will finish it). Commands are never translated.
- **Honesty in the definition of done.** Every skill states what cannot be verified from inside it.

## The pull request

Fill in the template. The part reviewers care about:

```text
Task:
Without:
With:
```

Same model, same prompt, one run with the skill and one without — compared on decisions, not prose.
`docs/en/evaluating-a-skill.md` explains the protocol. If you have not run it, say so; a skill with an
unverified claim is a draft, and drafts can be merged as drafts.

## Commit messages

Conventional commits, one concern each: `feat(skills): …`, `fix(skills): …`, `docs: …`, `ci: …`,
`chore: …`.

## Review

Reviewers answer the ten questions in [docs/en/writing-a-skill.md](docs/en/writing-a-skill.md). Six or
fewer "yes" means the skill is not ready — that is a normal outcome, not a rejection of the idea.

## Reporting a problem with a skill

Use the bug template. The useful report says: the prompt, the first actions the agent took, and what
you expected instead. "This skill is bad" cannot be acted on; "it loaded, then added a cache instead of
profiling" can.
