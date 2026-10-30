# Why "check before claiming"

Every skill in this pack is an answer to the same failure: a capable model producing something that
looks finished. It is not a knowledge problem — modern models know what a firewall is, what an
idempotency key is, and how a postmortem should be structured. The gap is between knowing and
*doing it here, now, with the evidence in front of you*.

## The four failures this pack targets

**1. Claiming without observing.**
A `connect()` that returns a promise is treated as a connection. A build that exits zero is treated as
a working artefact. A test suite that runs is treated as coverage. The model is not lying; it has no
access to the world, so it reports the strongest thing its inputs support. The fix is procedural: name
the command that would show the truth, run it, and quote its output.

**2. Fixing the wrong layer.**
An unreachable service "fixed" by adding retries. A slow endpoint "fixed" by switching frameworks. A
missing artefact "fixed" by rebuilding. In each case the intervention is in a layer that was never
measured. The fix is a mandatory ordering: name, route, port, protocol; measure, then narrow; identity
chain before content.

**3. Confident generalities.**
"Ensure the configuration is correct." "Consider adding tests." Advice that cannot be wrong cannot
help. Every rule in this pack is written so that a reader could disagree with it in public:
`Run ss -ltnp before editing code` is checkable; `be careful with networking` is not.

**4. Silence about what was not verified.**
The most damaging sentence an agent can produce is an unqualified one. "Tested on iOS" when the
build never ran; "works on Windows" from a packaging script's exit code. Every skill here ends with a
definition of done that includes the negative: state what you could not check. It is a cheap sentence
that prevents an expensive discovery.

## Why text, and not a tool

A tool is code: it must be trusted, installed, versioned, and it fails in ways the agent cannot see. A
skill is text: it is reviewed like prose, it cannot execute anything, and it degrades gracefully — a
model that half-understands a skill still gets the ordering right.

The cost is that text can be ignored. That is why the mechanical parts (frontmatter, section
structure, references, links, the catalog) are validated, and the judgement parts are not.

## Why so few skills

Each skill is a place where an agent's default behaviour is *specifically* wrong, not generally weak.
Collecting forty checklists would produce a repository that reads well and loads nothing: an agent has
no attention for material it cannot tell apart.

Nine is the current answer to "which decisions, if made wrong, cannot be recovered by rereading the
code". If a tenth appears that meets that bar — with a real failure behind it, a checkable procedure,
and a definition of done — it belongs here. If it is a topic someone finds interesting, it belongs in
a blog post.

## What is deliberately absent

- **No prompt engineering advice.** This is about what to do, not how to phrase it.
- **No model-specific tuning.** The skills avoid assuming a context window, a tool set, or a vendor.
- **No mandatory scripts.** Three of the nine would benefit from tooling (a checksum verifier, a link
  checker, a parity checker), and each of those tools is a command the agent can run directly.
- **No claims about effectiveness.** We can show a skill changes the first three actions on a given
  task (`evaluating-a-skill.md`); we cannot claim an aggregate improvement across all models and tasks,
  and will not.
