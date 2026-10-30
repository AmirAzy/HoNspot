# Examples

One worked example per skill is worth more than a description of the skill, because it shows the thing
that is hard to convey in a rubric: the moment where the agent would have gone the other way.

| Example | Skill | What it shows |
| --- | --- | --- |
| [debug-connectivity.md](debug-connectivity.md) | `debug-connectivity` | The same model, same prompt: one run adds a retry policy twice, the other runs four commands and finds a loopback bind |

## How these were produced

1. Same model, same tools, fresh sessions.
2. The prompt is what a user actually wrote, not a crafted test case.
3. Only the skill was toggled.
4. The comparison is on the **first three actions** and the final claim — not on tone or length.

The transcripts are edited for length (tool output trimmed, names changed) but not for content: the
wrong-turn in the "without" run is genuine, and it is the reason the skill exists.

## Contributing an example

An example is most valuable when the **wrong** answer is attractive and plausible. If the without-run
makes an obvious mistake nobody would make, the example proves nothing. Open a pull request with:

- the exact prompt,
- both runs, trimmed to the decisions,
- the table of what changed,
- and the model/tooling you used, so the result can be reproduced or contradicted.
