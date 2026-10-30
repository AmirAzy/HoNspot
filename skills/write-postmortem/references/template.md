# Postmortem template

Copy the whole file. Delete the hints once the section is real. Keep it short enough to be read in one
sitting; a thorough postmortem beats a long one.

---

## Title

`2026-04-11 — checkout unavailable for 38 minutes after cache eviction`

Write it as a user would describe it, not as an internal service name.

## Status

`Final` · `Owner: <name>` · `Incident channel: <link>` · `Last updated: <date>`

## Impact

| Question | Answer |
| --- | --- |
| Who was affected | All users in EU-West attempting checkout |
| How long | 38 minutes (from first failing request to full recovery) |
| How bad | ~2 100 failed payments; no data lost; no data exposed |
| Financial / contractual | <if applicable; otherwise "none quantified"> |

## Timeline (UTC, sourced)

| Time | Event | Source |
| --- | --- | --- |
| 09:12 | Deploy `a1b2c3d` starts | CI |
| 09:14 | Deploy completes | CI |
| 09:15 | Error rate rises from 0.2 % to 31 % | metrics dashboard |
| 09:19 | Alert fires (error-rate > 5 % for 4 min) | alerting |
| 09:24 | Engineer acknowledges, checks dashboard | incident channel |
| 09:31 | Suspect identified: cache key changed shape | code diff |
| 09:38 | Rollback starts | CI |
| 09:50 | Error rate back under 0.5 % | metrics dashboard |

**Detection gap**: 4 minutes (first failing request → alert).
**Response gap**: 5 minutes (alert → acknowledged).
Both gaps matter: the first is an observability question, the second is a staffing/runbook question.

## What happened

Plain language, no jargon, in the mechanism's own terms. Two or three paragraphs maximum.

> The deploy changed the cache key from `price:{id}` to `price:{id}:{currency}` but the write path was
> not updated. Reads missed, every request went to the database, the connection pool saturated, and
> requests timed out after 30 s. The retry policy turned each timeout into three more requests, which
> kept the pool saturated even after load dropped.

## Why it was possible

- The key was built in two places, so a change to one was invisible to the other.
- No test asserted that the read and write keys are identical.
- The pool size was configured for the cached path and had never been exercised without the cache.

## Why it was not caught earlier

- The canary sends 1 % of traffic and the error rate in the canary was 1.1 % — below the 5 % alert
  threshold at that volume.
- No test for the cache-miss path, because in development the cache is always cold and the database
  fast enough to hide it.

## What went well

- The rollback was one command and worked on the first try.
- The on-call engineer had the runbook open in under a minute.
- The retry storm was visible in the same dashboard as the errors.

## Action items

| # | Action | Type | Owner | Due | Verified by |
| --- | --- | --- | --- | --- | --- |
| 1 | Build the cache key in one function used by both paths | systemic | @dana | 2026-04-18 | unit test that asserts read key == write key |
| 2 | Load-test the cache-miss path at 10× expected traffic | systemic | @omar | 2026-04-25 | CI job with the threshold recorded |
| 3 | Canary alerting on the canary's own error rate, not just global | detection | @dana | 2026-04-20 | alert rule with a synthetic failing canary |
| 4 | Cap retries with a circuit breaker on the payment client | prevention | @ravi | 2026-05-02 | test that asserts one upstream call under failure |
| 5 | Add the pool-size decision to the runbook | response | @omar | 2026-04-15 | runbook diff linked in the incident |

Rule of thumb: three to six items, at least one of each type (prevention, detection, response). More
than that and they stop shipping.

## Appendices

- Deploy diff: `<link>`
- Dashboard: `<link>`
- Customer reports: `<link>`
- Related postmortem: `<link>`

---

## Notes on writing it

- If a section is empty, delete it rather than write something vague.
- Prefer "the retry policy turned each timeout into three more requests" over "the service was
  overloaded". Mechanism over mood.
- The timeline is the part readers use, so keep it accurate and sourced even when it is unflattering.
- If the action items are all "be careful", the analysis stopped too early.
