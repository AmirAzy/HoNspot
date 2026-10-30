---
name: write-a-skill
description: Write a new skill for this pack or for any agent: choosing the trigger, structuring the instructions, deciding what belongs in references, and testing whether the skill actually changes behaviour. Use when adding a skill, when an existing skill is not being loaded or is being ignored, or when turning a repeated correction into something an agent will apply by itself.
license: MIT
---

# Write a skill

A skill is not documentation. Documentation is read by a person who wants to understand; a skill is
loaded by an agent that is about to act. That difference decides every choice below — the trigger, the
length, the order of the sections, and what gets left out.

## When to use

- Adding a skill to this pack.
- An agent keeps making the same mistake and you have corrected it twice.
- A skill exists but never gets loaded — the trigger is wrong, not the content.
- A skill gets loaded but ignored — it is too long, or it starts with background instead of a rule.

## Ground rules

1. **The description is the product.** It is the only part an agent reads before deciding to load the
   file. Write the user's symptoms, not the module's name.
2. **One page of instructions, details on demand.** If the body needs scrolling to find the first
   action, the agent acts on the first thing it saw.
3. **Facts before procedure.** Numbers, commands and error strings that the agent would otherwise
   invent belong near the top, in a table.
4. **Every rule must be checkable.** "Be careful" is not a rule; "run `ss -ltnp` before editing code"
   is.
5. **Say what not to do.** The anti-pattern section is the most valuable part for a capable model: it
   knows the general good practice and needs to be told which shortcut is a trap here.
6. **End with a definition of done**, including admitting what was not verified.
7. **Nothing executes.** A skill is text. If it needs a script, the script is a tool, and it belongs
   somewhere a reviewer can see and test it.

## Procedure

1. **Name the failure first.** Write one sentence: what does an agent do *without* this skill, that is
   wrong? If you cannot, there is no skill — there is a note.

2. **Collect three real instances.** Your own corrections, a bug report, a review comment. Skills
   written from a single anecdote overfit to it; three show the pattern.

3. **Write the description as a trigger sentence** in the user's words, 60–600 characters, including
   the symptoms ("times out", "was never launched", "docs in two languages drift") and the contexts
   ("before publishing", "when reviewing generated code"). Test it by asking: if a user said only this,
   would loading be right?

4. **Draft the body in this order**, which is the order that survives a model with a short attention
   budget:

   ```
   # Title
   One paragraph: what goes wrong without this.
   ## When to use          (and what it is NOT for)
   ## Ground rules         (numbered, 4–7, each checkable)
   ## Procedure            (numbered steps, one action each)
   ## Anti-patterns        (table: tempting move → why it is wrong)
   ## Definition of done   (checkboxes, including negatives)
   ## Report format        (a skeleton the agent can fill)
   ```

5. **Move the lookup tables out.** Commands per platform, templates, worked examples, glossaries — all
   of that goes in `references/` and is linked by name, at the point where it is needed. In this
   repository every reference must be linked, and the validator enforces it.

6. **Keep the vocabulary literal.** Name the commands, files and fields. An agent cannot follow "check
   the usual logs" but can follow `docker logs <container> --since 10m`.

7. **Write the negative case**: what the skill should *not* be used for, and where to go instead. This
   prevents the most common misuse, which is loading the wrong skill with confidence.

8. **Test it.** See `docs/en/evaluating-a-skill.md`: run the same task with and without the skill, and
   compare the *decisions*, not the prose. A skill that changes nothing is a blog post.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Starting with background and philosophy | The agent acts on the first 200 tokens; put the rules there |
| Writing 800 lines "for completeness" | It will be truncated or skimmed; move the detail to references |
| Copying a framework tutorial | The model already knows the tutorial; it does not know your constraint |
| Vague verbs ("ensure", "consider", "be mindful") | Nothing to do, nothing to check |
| No definition of done | The agent stops when the output looks plausible, not when it is verified |
| Trigger naming the technology | Users report symptoms, not modules: they say "it will not connect", not "tcp" |
| A skill per file of the codebase | That is documentation with a top hat; skills are for decisions |

## Definition of done

- [ ] One sentence exists describing the failure the skill prevents, with three real instances behind it.
- [ ] The description triggers on symptoms a user would actually type, in 60–600 characters.
- [ ] `## When to use`, ground rules, procedure, anti-patterns, definition of done, report format.
- [ ] Rules are checkable commands or explicit conditions, not adjectives.
- [ ] Lookup material is in `references/`, linked, and no reference is orphaned.
- [ ] The validator passes: `npm test`.
- [ ] Tested with and without the skill on a real task, and the difference is written down.
- [ ] Anything the skill cannot guarantee is stated as a limit inside the skill.

## Report format

```
Skill:       <name>
Prevents:    <the failure, in one sentence>
Instances:   <three real cases>
Trigger:     <the description, verbatim>
Structure:   <sections, and what went to references>
Tested:      <task, with vs without, what changed>
Not covered: <situations this skill does not handle>
```

The rubric this repository applies in review — and what would make a skill be rejected — is in
[references/rubric.md](references/rubric.md).
