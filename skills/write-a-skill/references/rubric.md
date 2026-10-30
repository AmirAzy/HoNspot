# Review rubric

Ten questions, applied to every skill before it is merged. Six or fewer "yes" answers means the skill
is not ready, regardless of how good the writing is.

| # | Question | Fails when |
| --- | --- | --- |
| 1 | Does the description name a **symptom** a user would type? | It names a module, a library or an abstraction ("handles IPC") |
| 2 | Is there a **specific failure** the skill prevents, with a real instance behind it? | It is a summary of general good practice |
| 3 | Are the facts (numbers, commands, error strings) **stated**, not implied? | The agent would still have to guess a port, a flag or a filename |
| 4 | Is every ground rule **checkable**? | It contains "ensure", "consider", "be careful", "as needed" |
| 5 | Does the procedure have **one action per step**? | A step contains "and then also" |
| 6 | Is there an **anti-patterns** section naming the tempting shortcut? | It only lists what to do |
| 7 | Does it end with a **definition of done** that includes **what cannot be verified**? | It ends with "done!" or a summary |
| 8 | Is the body under ~1 500 words with detail in `references/`? | Reading it takes longer than doing the task |
| 9 | Is the **scope boundary** written (`when not to use`, and which skill to use instead)? | Every task looks like a nail |
| 10 | Has it been **tested** with and without, on a real task? | Nobody has observed the behaviour it is supposed to change |

## Automatic rejection

- Contains executable instructions to install, fetch or run something unreviewed.
- Tells the agent to disable a security control to make a symptom go away.
- Claims verification that did not happen ("this has been tested on iOS").
- Duplicates an existing skill without replacing or linking it.
- Frontmatter `name` does not match the directory — the loader will not find it.

## Automatic acceptance

None. A skill is merged on judgement, with the ten questions answered in the pull request.

## Writing style, briefly

| Do | Do not |
| --- | --- |
| Imperative, second person: "Run `ss -ltnp` before editing code" | "It is recommended that the engineer…" |
| Concrete nouns: the exact file, flag, header, error string | "the relevant configuration" |
| Short sentences, one idea each | Sentences with four clauses and two caveats |
| Tables for facts, numbered lists for order | Paragraphs that hide a five-step procedure |
| State the limits plainly | Hedge everything until it means nothing |

## The test that matters

Take a task the skill is meant to influence, run it twice — once with the skill loaded, once without —
and compare the **first three actions** the agent takes. If they are identical, the skill has not
changed the decision, only the vocabulary. Fix the top of the file, not the bottom.

Write the result down in the pull request:

```text
Task: "the API is unreachable from staging"
Without: agent edited the client's retry policy (wrong layer, wasted 20 minutes)
With:    agent ran dig → ip route → nc, reported "listener bound to 127.0.0.1"
         and stopped before touching code
```
