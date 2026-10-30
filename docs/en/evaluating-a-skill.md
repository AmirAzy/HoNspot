# Evaluating a skill

A skill is a hypothesis: *with this text loaded, an agent will make a better decision.* Hypotheses are
tested, and the test is cheap — two runs of the same task, one with the skill and one without, compared
on the decisions rather than the prose.

## What to measure

| Signal | How to read it |
| --- | --- |
| **First three actions** | The most useful signal. Did the agent run a diagnostic command, or edit code? |
| **Wrong-layer attempts** | Count of interventions in a layer that was never measured |
| **Claims vs evidence** | Did it say "works" where it should have said "the command exited 0"? |
| **Unverified statements** | Did it name what it did not check? |
| **Length** | A skill that doubles the response without changing the decision is noise |
| **Refusals** | Did it stop when it should (missing access, wrong skill)? |

Not worth measuring: tone, formatting, how "helpful" it feels.

## The A/B protocol

1. **Pick a real task** of the kind the skill targets — not a toy. Use a scenario with a wrong answer
   that is attractive.
2. **Write the prompt a user would actually send**, without hints: "the API is unreachable from
   staging" rather than "check whether the listener is bound to localhost".
3. **Run it without the skill.** Record the first three actions and the final claim.
4. **Run it with the skill loaded.** Same prompt, same model, same tools, a fresh session.
5. **Compare the decisions**, and write the comparison down in the pull request.
6. If the actions are identical, the skill did not work — change the top of the file (trigger and
   ground rules), not the middle.

Example of a useful result:

```text
Task: "the API is unreachable from staging"
Without: edited the client's retry policy; concluded "deployed, should work now"
With:    dig → ip route get → nc -vz; found listener on 127.0.0.1;
         made no code change; reported the bind address as the cause
```

## Good test scenarios per skill

| Skill | A scenario with an attractive wrong answer |
| --- | --- |
| `debug-connectivity` | Service bound to `127.0.0.1` behind a "firewall problem" report |
| `diagnose-slow` | An endpoint that is slow because of one N+1 query; the temptation is a cache |
| `release-verify` | A build that "succeeded" but packaged the previous version |
| `plan-migration` | A major upgrade where the runtime must move first; the temptation is the framework |
| `review-diff` | A PR with mostly formatting plus one transaction boundary bug |
| `write-postmortem` | An incident whose only finding so far is "engineer ran the wrong script" |
| `api-contract` | Adding a field by renaming it, "since nobody uses the old one" |
| `bilingual-docs` | A Persian page that translated a command and now does not run |
| `write-a-skill` | A skill draft that starts with three paragraphs of background |

## What a passing result looks like

- The skill is loaded (the agent's first action changes).
- The wrong layer is not attempted.
- The definition of done is used as a checklist, including the negative item.
- The output contains a command and its evidence, not only a conclusion.

## What a failing result looks like

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Not loaded at all | Description names a technology, not a symptom | Rewrite the description from the user's words |
| Loaded, ignored | First 200 tokens are background | Move rules to the top |
| Followed halfway | Too long, or the procedure has multi-action steps | Split into references, one action per step |
| Followed literally into a wall | No boundary section | Add "when not to use" and the alternative |
| Used on everything | Trigger too broad | Narrow the description, add explicit non-goals |

## Honest limits of this evaluation

One A/B run is an anecdote, not a benchmark. Model behaviour varies with temperature, context and
tooling; a skill that helps one model may be ignored by another. This pack therefore makes no aggregate
claims: each skill documents the failure it addresses, and each pull request documents the run that
justified it. Anybody claiming their prompt pack "improves performance by X %" should be asked for the
task set, the model, and the runs — and, in the absence of those, for a smaller claim.
