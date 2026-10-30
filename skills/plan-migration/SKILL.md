---
name: plan-migration
description: Plan a framework, runtime, dependency or schema upgrade that touches many files, without a big-bang rewrite. Use when asked to upgrade to a new major version, replace a library, split a monolith, move a package between repos, or when a previous migration stalled half-finished and left two ways of doing the same thing.
license: MIT
---

# Plan a migration that can be abandoned halfway

The danger in a migration is not the change; it is the state you are in when it stops. A plan is only
as good as the point it can be safely paused at, reverted from, or finished by someone who is not you.

## When to use

- A major version bump, a runtime upgrade, a library replacement, or a monolith split.
- A previous migration left the codebase with two conventions and nobody remembers which is current.
- Someone proposes "we'll just rewrite it" for anything larger than a day of work.

Not for: a mechanical rename in three files, or a single dependency patch.

## Ground rules

1. **Inventory before you plan.** You cannot schedule work whose size you have not counted, and you
   cannot claim "it is nearly done" without a denominator.
2. **Every step leaves the project working and shippable.** If a step cannot be shipped, it is not a
   step, it is a branch.
3. **Codemods over hand-editing**, and a reviewable diff over a heroic one.
4. **Two ways of doing something is a temporary state with an end date**, written down, or it becomes
   permanent — the fixture that never gets deleted.
5. **The compatibility matrix is the plan.** Old and new versions, and which combinations are legal,
   decide the ordering more than anything else.
6. **Know the abort point.** What exactly would make you stop, and what does the tree look like when
   you do.

## Procedure

1. **Inventory the surface.** Count the call sites, the files, the packages and the APIs in play, with
   a command, not an impression:

   ```bash
   rg -l 'oldApiName' | wc -l            # files to touch
   rg -c 'oldApiName' | sort -t: -k2 -nr | head   # where the weight is
   npm ls old-package                     # who depends on it, directly and transitively
   ```

2. **Read the upgrade guide and write the breaking changes as a checklist**, in your own words, each
   with a detection command. Anything you cannot detect, you cannot verify.

3. **Build the compatibility matrix**: which versions of the toolchain, runtime and dependencies may
   coexist. This usually dictates a strict ordering (runtime first, or the framework first) that saves
   days of dead ends.

4. **Choose the strategy and say why**:

   | Strategy | Use when | Cost |
   | --- | --- | --- |
   | Incremental with a compatibility layer | Many call sites, live product | Extra abstraction to remove later |
   | Strangler (new path alongside old, switch by flag or route) | Behaviour change, need gradual rollout | Two paths running at once; needs an end date |
   | Codemod then manual review | Purely mechanical API rename | Nothing, if the codemod is verifiable |
   | Big-bang rewrite | Small surface, no users mid-flight, strong test suite | All the risk lands at once |

5. **Order the steps by "what unblocks the most" and "what is reversible"**. Put the reversible,
   high-leverage work first; leave irreversible data migrations for last, behind a backup.

6. **Add the verification before the change.** A test, a type check, a golden file or a snapshot that
   fails for the old behaviour makes the migration mechanical. If the suite is too thin to catch a
   regression, that is the first task, not an excuse.

7. **Run the steps as separate pull requests**, each with: what changed, what proves it, what is still
   on the old path, and the remaining count (`63 / 214 call sites`). Visible progress is what keeps a
   migration from stalling.

8. **Remove the scaffolding deliberately.** When the last old path is gone: delete the compatibility
   layer, the flag, the deprecated module and the TODO, in one final, celebrated commit.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| A branch that lives for weeks | It merges as a conflict generator, and nobody can review it |
| "We'll fix the warnings later" | Later is a second migration, on top of this one |
| Keeping the old and new API both "for safety" | That is not safety, that is two products |
| Migrating and refactoring in the same commit | When it breaks, you cannot tell which change did it |
| Rewriting tests to match new behaviour mid-migration | You have deleted the evidence that the behaviour was meant to stay |
| No inventory, so "80 % done" for a month | Without a denominator, progress is unmeasurable and morale collapses |

## Definition of done

- [ ] Inventory with a command and a number; the number is at zero.
- [ ] Compatibility constraints were written down and respected.
- [ ] Every step shipped independently and left the project working.
- [ ] The old path, flag and compatibility layer are **deleted**, not deprecated.
- [ ] The test suite proves the behaviour survived; any behaviour that changed on purpose is listed.
- [ ] Documentation and examples updated — a migration that leaves the docs on the old API is half done.
- [ ] The rollback story is gone on purpose: you can roll back the deployment, not the change.

## Report format

```
Goal:        <old → new, and why now>
Surface:     <count> call sites in <count> files, <count> packages
Strategy:    <incremental | strangler | codemod | big-bang>, because <one sentence>
Order:       <the steps, in order, with the reason for the order>
Risk:        <the irreversible part, and its backup>
Progress:    <n / total>, and what is left
Abort point: <what would stop this, and the tree state if it does>
```

A worked template, including the compatibility matrix and the per-PR description, is in
[references/migration-template.md](references/migration-template.md).
