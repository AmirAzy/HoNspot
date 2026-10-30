# Severity, evidence and phrasing

## The four levels

| Level | Meaning | Examples |
| --- | --- | --- |
| **blocker** | Merging this can lose data, expose data, break production, or silently corrupt state | Unbounded `DELETE`; auth check removed from one path; migration without a default; money computed in floats |
| **major** | Correctness or operability is at risk, but the failure needs a condition (load, retry, a specific input) | No handling of the 3rd-party timeout; N+1 on a hot endpoint; a retry without idempotency; test that cannot fail |
| **minor** | A real improvement that can ship later | Missing log context; duplicated helper; unclear name in a public API |
| **nit** | Taste. Prefix it so it can be ignored without guilt | Bracing, ordering, a comma |

If you cannot name the failure scenario, it is a nit. That rule alone removes most noise from reviews.

## Evidence beats adjectives

| Instead of | Write |
| --- | --- |
| "This could be slow" | "This runs one query per row; the list endpoint returns 500 rows → 500 queries per request" |
| "Not safe" | "The token is compared with `==`, which short-circuits; use a constant-time comparison" |
| "I don't like this abstraction" | "This adds an interface with one implementation; the second one arrives in the same PR or not at all" |
| "Tests are missing" | "No test covers the `already exists` branch — the one users hit after a double submit" |
| "This will break something" | "`full_name` is read by the mobile client in v2.3, which is still in the store; renaming it needs a deprecation window" |

## Phrasing that keeps the review useful

- **Ask when you might be wrong**: "Does `apply()` run inside the same transaction as `validate()`? If
  not, two requests can both pass."
- **Suggest the shape, not the code**: "I would extract the retry into the client and key it by
  request id."
- **Praise what deserves it, briefly**: "The failure path here is the reason this is safe under load."
- **Separate the decision from the person**: "This ordering will deadlock under two workers" — not
  "you ordered these wrong".
- **Say when you are unsure**: "I am not certain about the driver's behaviour here; worth a test."

## Reviewing generated code

Generated diffs fail differently from human ones: they are locally plausible and globally
inconsistent. Check:

1. **Symbols exist.** The imported name, the option, the config key — in the installed version, not in
   the model's memory.
2. **The test can fail.** Delete the behaviour; does the new test go red? If not, the test asserts the
   implementation, not the requirement.
3. **The happy path is not the only path.** Look for the error branch of every new call.
4. **Consistency with the codebase.** Same store, same fetcher, same error shape — or a stated reason.
5. **Scope creep.** Files touched that the description does not mention are the usual place where a
   refactor smuggles in a behaviour change.
6. **Concurrency and cleanup.** Timers, listeners, subscriptions, temp files, open handles.

## What not to comment on

- Anything a linter or formatter decides.
- Naming in code that has no consumers outside the file.
- "You could also…" alternatives that solve nothing present in the diff.
- Existing problems the diff did not introduce. Write them down elsewhere; do not hold this PR hostage.
