---
name: review-diff
description: Review a pull request, a patch or an agent's own work with findings ranked by risk instead of listed by line. Use when asked to review a diff, when a change touches data, auth, money, migrations or concurrency, when reviewing generated code that looks plausible, or when a review is turning into a style debate the linter should have settled.
license: MIT
---

# Review a diff

A review is a risk assessment, not a reading exercise. The question is never "is this code nice" but
"what can this change break, and would we find out before a user does".

## When to use

- Any pull request larger than a trivial rename.
- Changes touching data, authentication, payments, permissions, migrations, concurrency or public API.
- Reviewing code you (or an agent) generated — plausible code is exactly the code that slips through.
- A review with 40 comments about formatting and none about the transaction boundary.

## Ground rules

1. **Read the intent before the diff.** If the description does not state what changes and why, ask;
   a diff without intent cannot be judged, only re-litigated.
2. **Rank by consequence.** Blockers are things that break correctness, security, data or users. A
   naming preference is not in the top ten and often not in the review at all.
3. **Style is the linter's job.** If a machine can decide it, do not spend a human comment on it —
   configure the machine instead.
4. **Every finding needs a concrete failure scenario.** "This feels fragile" is not reviewable; "two
   concurrent requests both pass the check and both insert" is.
5. **Test the tests.** A new test that passes before the change proves nothing; say so.
6. **Approve honestly.** Approval means "I have seen what this can break". If you did not read part of
   it, say which part.

## Procedure

1. **Read the description, the linked issue, and the test changes first** — in that order. Then the
   source. Tests tell you the author's model of the change, which is where the misunderstanding shows.

2. **Identify the blast radius** and review in this order, which is roughly the order things hurt:

   | Area | Question |
   | --- | --- |
   | Data | Can this lose, corrupt or duplicate data? Is it reversible? |
   | Auth / permissions | Any path that skips a check? Any new trust in client input? |
   | Concurrency | Two of these at once — still correct? |
   | Error paths | What happens when the third-party call fails, times out or returns garbage? |
   | Migration / deploy | Can it ship while old code runs? Can it roll back? |
   | Public contract | Does this break a consumer who is not in this diff? |
   | Performance | New loop, query or payload on a hot path? |
   | Readability | Would the next person understand *why*, given a year? |

3. **Look for what is absent, not only what is present.** No error handling, no test for the new
   branch, no cleanup of the temporary file, no removal of the old path, no migration for the new
   column, no version bump.

4. **For generated code, run the plausibility checks**: does the imported symbol exist in the
   installed version; does the function signature match the call; does the test actually fail when the
   behaviour is removed; is the "happy path" the only path.

5. **Write findings with severity, evidence and a question** — `[blocker]`, `[major]`, `[minor]`,
   `[nit]`. Each with file:line, the scenario, and what you suggest. A question invites the answer
   that might prove you wrong, which is often the correct outcome.

6. **Summarise with a verdict**: approve, approve with follow-ups, or request changes, plus the one
   or two things that actually matter. Nobody reads 30 comments in order of appearance.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Commenting on 40 lines of formatting | Buries the one real finding; linters exist |
| "Can we make this more readable?" with no target | Unactionable; propose the shape you want |
| Approving because CI is green | CI checks what someone remembered to assert |
| Reviewing only the added lines | Deletions and unchanged callers are where breakage hides |
| Rewriting the PR in the comments | Review the change or propose your own, not both |
| Blocking on preference | Turns the review into a negotiation and teaches people to avoid review |

## Definition of done

- [ ] The blast-radius table was actually walked, in that order.
- [ ] Every finding has severity, location, failure scenario and a suggestion.
- [ ] New tests were checked for the "would it fail before the fix" property.
- [ ] The verdict is explicit, with the top one or two concerns named.
- [ ] Style findings were moved to a linter or dropped, not counted.
- [ ] Anything you did not review is named ("I did not evaluate the SQL plan").

## Report format

```
Verdict:  approve | approve with follow-ups | request changes

Blockers
  [file:line] <failure scenario in one sentence> → <suggestion>

Major
  ...

Minor / nits (optional, ignorable)
  ...

Tests:     <do they fail before the fix? what is not covered?>
Not reviewed: <parts you skipped, and why>
```

Severity definitions and the phrasing that keeps a review useful rather than adversarial are in
[references/severity.md](references/severity.md).
