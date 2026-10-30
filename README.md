# Hone

**A small, opinionated pack of skills for AI coding agents. Nine skills, zero dependencies, no
install scripts — just text a model can load when it is about to guess.**


**English** · [فارسی](README.fa.md)

An agent with no instructions does the confident thing. Asked why two machines will not connect, it
adds a discovery library. Asked to ship a build, it reports success because a file appeared. Asked to
review a diff, it lists style nits and misses the data-loss bug. These skills exist to interrupt that
specific failure — not to teach an agent a framework, but to make it **check before it claims**.

Each skill is a folder with a `SKILL.md` whose frontmatter says when to load it, plus references it
reads only if it needs them. Nothing executes.

---

## The skills

| Skill | Load it when | Depth |
| --- | --- | --- |
| [`debug-connectivity`](skills/debug-connectivity/SKILL.md) | Two machines, a container and a host, or a client and a server cannot talk | 2 references |
| [`diagnose-slow`](skills/diagnose-slow/SKILL.md) | Something is "slow" and nobody has measured it yet | 1 reference |
| [`release-verify`](skills/release-verify/SKILL.md) | An artifact is about to be published, or already was | 1 reference |
| [`plan-migration`](skills/plan-migration/SKILL.md) | A framework, runtime or dependency upgrade that touches a lot of files | 1 reference |
| [`review-diff`](skills/review-diff/SKILL.md) | Reviewing a pull request, a patch, or your own work before submitting | 1 reference |
| [`write-postmortem`](skills/write-postmortem/SKILL.md) | After an incident, an outage, or a bad deploy | 1 reference |
| [`api-contract`](skills/api-contract/SKILL.md) | Designing, changing, or consuming an HTTP API | 1 reference |
| [`bilingual-docs`](skills/bilingual-docs/SKILL.md) | Documentation exists in two languages and is drifting | 1 reference |
| [`write-a-skill`](skills/write-a-skill/SKILL.md) | Adding a skill to this pack, or writing one for another agent | 1 reference |

Full descriptions and install paths: [`skills/README.md`](skills/README.md).

## Install

```bash
npx skills@latest add OWNER/hone --skill '*'            # all nine
npx skills@latest add OWNER/hone --skill debug-connectivity
```

Or copy a folder into whatever your agent reads (`~/.claude/skills/`, `.agents/skills/`, a prompt
file). The only requirement is that the frontmatter stays intact — that is what triggers loading.

## Why these nine

They are the moments where an unassisted agent produces something that *looks* finished:

- **It cannot know** whether the connection works, so it declares success from a returned promise.
- **It cannot see** the machine, so it "fixes" a firewall by changing code.
- **It cannot measure**, so it optimises the wrong loop.
- **It cannot feel the risk**, so it reviews formatting and misses the destructive migration.
- **It cannot admit ignorance**, so a release note claims a platform was tested.

Every skill ends with a **definition of done** that includes stating what was *not* verified. That
sentence is the point of the whole pack.

## What makes a skill here

| Rule | Why |
| --- | --- |
| Trigger in the description, in the user's words | The agent matches on symptoms ("it will not connect"), not on module names |
| Facts before procedure | Constants, commands and error strings stop an agent re-deriving them wrongly |
| Anti-patterns section | A list of tempting shortcuts is more useful than a list of best practices |
| One page of instructions, detail in `references/` | An agent that has to read 600 lines before acting will skip them |
| Definition of done, including negatives | "Not verified" is a valid outcome; silence is not |
| No executable content | Skills are text. Nothing here runs, installs or phones home |

The repository enforces the mechanical parts: `npm test` validates frontmatter, name/directory
matching, description length, referenced files, heading structure, and that the generated
[`catalog.json`](catalog.json) matches the pack. See [docs/en/writing-a-skill.md](docs/en/writing-a-skill.md).

## Verification

```bash
npm test          # validates all nine skills + every relative link in the docs
npm run catalog   # regenerates catalog.json after adding or renaming a skill
```

There is no build step and no dependency tree: `node_modules` does not exist in this repository on
purpose. The scripts are plain ESM, Node ≥ 20.19.

**Publishing:** this folder is already a git repository with a readable history — see
[PUBLISH.md](PUBLISH.md) for the two decisions to make before pushing it to your own account.

## Documentation

| English | فارسی | Contents |
| --- | --- | --- |
| [docs/en/writing-a-skill.md](docs/en/writing-a-skill.md) | [docs/fa/writing-a-skill.md](docs/fa/writing-a-skill.md) | Anatomy, the rubric, and the review questions |
| [docs/en/evaluating-a-skill.md](docs/en/evaluating-a-skill.md) | [docs/fa/evaluating-a-skill.md](docs/fa/evaluating-a-skill.md) | How to test whether a skill actually changes behaviour |
| [docs/en/philosophy.md](docs/en/philosophy.md) | [docs/fa/philosophy.md](docs/fa/philosophy.md) | Why "check before claiming" is the whole design |
| [examples/](examples/) | — | A before/after transcript of one skill doing its job |

## License

[MIT](LICENSE) for the text of the skills and the scripts. Use them, fork them, ship them inside your
own agent.
