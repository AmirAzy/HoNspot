# Measuring, layer by layer

Pick the tool that matches where the time goes. Everything below assumes a repeatable workload.

## Phase timing: the cheapest useful instrument

Before reaching for a profiler, put six numbers in a log line:

```text
t0 request_received
t1 after_auth
t2 after_first_query      (+ms)
t3 after_second_query     (+ms)
t4 after_render
t5 response_sent
```

Six timestamps cost minutes and answer "which phase" — the question you cannot skip. Only after that
does a profiler earn its setup cost.

## By layer

| Layer | Tool | What to look for |
| --- | --- | --- |
| HTTP / network | browser devtools waterfall, `curl -w '%{time_starttransfer} %{time_total}'` | Time to first byte vs transfer; DNS and TLS included? |
| Application CPU | `node --cpu-prof`, `py-spy`, `perf record`, `dotnet-trace` | A hot function, or 1 000 cheap ones (allocation churn) |
| Database | `EXPLAIN (ANALYZE, BUFFERS)`, slow query log, `pg_stat_statements` | Sequential scan on a large table, missing index, N+1, lock waits |
| ORM | query count per request | N+1 is usually the whole story |
| Frontend render | React Profiler / devtools performance, layout metrics | Long tasks, layout thrash, re-render storms, huge lists unvirtualised |
| Build / CI | `--profile`, `why-is-node-running`-style timings, dependency graph | One step dominating; cache misses; cold start |
| Mobile / native | platform profiler, `flutter run --profile`, Instruments | Main-thread work, allocation, disk I/O |
| Disk | `iostat`, `fio` | Queue depth, fsync cost |

## Statistics that keep you honest

- **Run at least three times.** Report p50 and the spread. A single sample includes JIT warm-up, cold
  caches and whatever else the machine was doing.
- **Warm up once, then measure.** First-run costs (compilation, connection pools, DNS) are real but
  they are a separate claim; report them separately.
- **Use percentiles for services.** Averages hide the 1 % of requests users call "the app is broken".
  p50/p95/p99, with the request count.
- **Keep the workload identical.** Same rows, same payload, same concurrency. Changing two things
  makes the comparison meaningless.
- **Distinguish cold and warm cache** and say which one you measured.
- **Watch for observer effects.** A profiler can double the runtime of a hot loop; a log in the wrong
  place can dominate.

## Reading a profile

1. Sort by **self time** (time in the function itself), not total.
2. Ignore the top frame if it is the runtime or the profiler harness.
3. Look for a flat profile (many similar frames) — that usually means allocation or I/O, not a hot
   algorithm.
4. Compare two profiles **of the same workload** before and after; the delta is the evidence.

## Reading a query plan

| Plan signal | Meaning | Usual fix |
| --- | --- | --- |
| `Seq Scan` on a large table with a selective filter | No usable index | Add the index the predicate needs, in the right order |
| Estimated rows ≫ actual rows | Stale statistics | `ANALYZE`, or a query the planner can reason about |
| Same query executed N times per request | N+1 | Eager load / batch |
| Sort spilling to disk | Small `work_mem` or an unsortable expression | Index the sort order, or raise the limit for the session |
| Lock wait | Transaction holding a lock | Shorten the transaction; do not add a retry loop |

## Budgets worth writing down

A budget turns "is it fast enough" into a pass/fail check that CI or a reviewer can enforce:

| Thing | Example budget |
| --- | --- |
| API endpoint | p95 < 300 ms at 50 rps, payload < 100 KB |
| List screen | first contentful paint < 1 s, 1 000 rows scroll at 60 fps |
| Query count per request | ≤ 5 |
| Bundle size | < 250 KB gzipped for the initial route |
| Test suite | < 90 s locally, or it stops being run |

A budget without a number that a machine checks is a wish.
