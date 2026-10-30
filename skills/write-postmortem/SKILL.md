---
name: write-postmortem
description: Write a blameless postmortem after an outage, a bad deploy, a data loss or a near miss. Use when an incident needs a written record, when the only finding so far is "human error", when action items keep recurring without owners, or when a team needs a timeline that survives being read six months later.
license: MIT
---

# Write a postmortem people will actually use

The document has one job: make the next instance of this failure cheaper to prevent, detect or
recover from. Blame makes it worse, because people stop telling the truth, and the truth is the only
input that matters.

## When to use

- After any incident with user impact, data loss, or a paged engineer.
- After a near miss that only luck prevented.
- When an incident review produces "be more careful" as the action item.

## Ground rules

1. **Blameless is not soft.** You can describe exactly what a person did and still not blame them; the
   question is always *what made that action look correct at the time*.
2. **Timeline in UTC, with evidence.** Log timestamps and commit hashes, not reconstructed memory.
   "Around 3" is not a time.
3. **"Human error" is the beginning of the analysis, not the end.** Behind it there is a missing
   guard, an ambiguous alert, a runbook that said the wrong thing, or a system that allowed the
   mistake to be one keystroke wide.
4. **Separate the trigger from the cause.** The trigger is the change that started it; the cause is
   why it was possible and why it hurt. Fixing only the trigger guarantees a sequel.
5. **Every action item needs an owner, a date and a way to verify it.** A list of good intentions is
   how the same incident happens twice.
6. **Publish it.** Internal or public, a postmortem nobody can read is folklore with a title.

## Procedure

1. **Write the impact first**: who was affected, for how long, how badly, and how much data (if any)
   was lost or exposed. Numbers, not adjectives.

2. **Build the timeline from artefacts**: deploy records, alert timestamps, chat logs, the first
   customer report, the moment the rollback finished. Mark each entry's source. Include the
   *detection* gap and the *response* gap as first-class facts.

3. **Answer three questions separately**:
   - **What happened** (the mechanism, in plain language).
   - **Why it was possible** (missing check, wrong default, unclear ownership, an abstraction that
     hid the risk).
   - **Why it was not caught earlier** (alerting, testing, review, canary).

4. **Separate triggers, contributing factors and root cause.** Root cause is not a synonym for "the
   thing we will fix"; list the factors that had to co-occur, because that is what makes a fix real.

5. **Count what went well.** Fast detection, a rollback that worked, an engineer who noticed. The good
   path is also a system property worth keeping.

6. **Turn each finding into an action item**: a verb, an owner, a date, and a check that proves it
   shipped. Prefer systemic fixes (a default that cannot be wrong, a test, a guard) over "remind the
   team".

7. **Review it with the people named in it before publishing.** If someone is uncomfortable with how
   they are described, the description is wrong.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| "Root cause: engineer ran the wrong script" | Then the system is the cause: a script that can run against production without a guard |
| Timeline from memory | It will quietly reorganise itself to make the response look faster |
| Action items with no owner | Nobody's job is nobody's work |
| A postmortem that never ships | Waiting for "the full picture" guarantees it is never read |
| Fixing only the trigger | The next unrelated trigger finds the same missing guard |
| Naming individuals as the cause | Everyone else learns to hide their mistakes, and you lose your best sensor |

## Definition of done

- [ ] Impact is quantified: users, duration, data.
- [ ] Timeline is in UTC with sources, including detection and response gaps.
- [ ] Trigger, contributing factors and root cause are distinguished.
- [ ] At least one "what went well" is recorded.
- [ ] Every action item has an owner, a date and a verification method.
- [ ] The people named have read it and are comfortable with the wording.
- [ ] It is published where the team can find it, and linked from the incident.

## Report format

```
Title:      <what broke, in the words a user would use>
Impact:     <who, how long, how bad, data>
Detected:   <when, by what>     Recovered: <when, by what>
Timeline:   <UTC, sourced>
Cause:      <trigger | contributing factors | why it hurt>
Went well:  <what limited the damage>
Actions:    <#1 owner, date, verification> …
```

A filled-in template, with a realistic example of the timeline and action table, is in
[references/template.md](references/template.md).
