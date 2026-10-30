---
name: diagnose-slow
description: Find out what is actually slow before changing any code. Use when a page, endpoint, query, build, test suite or device feels slow, when someone proposes a cache, an index, an async rewrite or a faster library without a measurement, or when a performance problem keeps coming back after a previous "fix".
license: MIT
---

# Diagnose slow before optimising

"Slow" is not a diagnosis. A number is. Until you know whether the time is spent in the database, the
network, the renderer, or a `sleep`, every optimisation is a guess with a maintenance cost attached.

## When to use

- "The app is slow", "this endpoint is slow", "the build takes forever".
- A performance change is proposed without a profile, a timing breakdown, or a baseline number.
- A previous optimisation did not help — which usually means it targeted the wrong layer.
- Before deliberately trading correctness or complexity for speed.

Not for: a hang that never completes (see `debug-connectivity`), or an outage.

## Ground rules

1. **Measure the whole path first**, then narrow. A stopwatch around the outer call is enough to start;
   a profile is what you need second.
2. **One number, one environment, one workload.** "Faster" without a repeatable input is an opinion.
3. **Record the baseline before touching anything** — in the report, with the command that produced it.
4. **Optimise the biggest term, not the easiest one.** A 90 % win on 5 % of the time is noise.
5. **Amdahl's law is not optional.** If one step is 60 % of the time, halving everything else caps you
   at a 20 % improvement.
6. **Distinguish latency from throughput.** A single slow request and a saturated service have
   different causes and different fixes.

## Procedure

1. **Write the user-visible claim with a number.** "The list page takes 4.2 s to first row on a
   laptop with a warm cache" — not "it is slow". If nobody can state the symptom numerically, that is
   the first task.

2. **Time the phases.** Put a stopwatch around each boundary you can see: request → handler →
   query → serialise → render. Even coarse instrumenting (six timestamps in a log line) turns
   "everything is slow" into "one step is 80 %".

3. **Reproduce with a fixed workload.** Same input size, same machine, same cache state, same
   concurrency. Record the exact command. A measurement you cannot repeat is a rumour.

4. **Profile the dominant phase.** CPU profile for CPU-bound work, a query log / `EXPLAIN (ANALYZE)`
   for databases, a network waterfall for HTTP, a trace for UI. The tool depends on the phase; do not
   profile everything.

5. **Look for the usual suspects before the exotic ones** — N+1 queries, a missing index, a
   synchronous call in a loop, serialisation of a large object graph, a layout thrash in a list, an
   unbounded cache, a cold start that re-does work on every request.

6. **Change one thing, re-measure with the same command, and report the delta.** If the delta is
   inside the noise of your measurement, you have not learned anything — measure better or accept the
   result.

7. **Decide when to stop.** State the target ("p95 under 300 ms for 1 000 rows"), and whether it was
   met. Shipping 20 % and pretending it is done is how a slow feature becomes folklore.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Adding a cache first | It hides the cost and adds a correctness problem (invalidation) you will debug for months |
| Rewriting in a "faster" language or library | The bottleneck is usually I/O or an algorithm, both of which follow you |
| Parallelism as the first fix | If the work is 90 % serial, threads add load and change nothing |
| Optimising the build while the app is slow | Two different problems; pick the one the user feels |
| Micro-benchmarks of a function that runs once | Measure the system, not the snippet |
| Quoting a single run | One sample is not a measurement; run it three times and report the spread |

## Definition of done

- [ ] A baseline number exists, with the exact command and environment that produced it.
- [ ] The dominant phase is named, with evidence (profile, query plan, trace, timing breakdown).
- [ ] The change addresses that phase; the delta is measured with the same command.
- [ ] Correctness is unchanged, or the trade-off is stated explicitly.
- [ ] A regression guard exists if practical: a benchmark, a query-count assertion, a budget in CI.
- [ ] What remains slow, and why it was left alone, is written down.

## Report format

```
Claim:      <user-visible symptom with a number>
Baseline:   <command> → <p50 / p95 / total>, <environment>, <input size>
Dominant:   <phase> — <% of total>, evidence: <profile/plan/trace>
Change:     <one sentence>
After:      <same command> → <new number>, <delta %>, <spread over runs>
Trade-off:  <what got worse, if anything>
Left alone: <what is still slow and why>
```

See [references/measurement.md](references/measurement.md) for the tooling table per layer, plus the
statistics that stop a measurement from lying to you.
