---
name: api-contract
description: Design, change or consume an HTTP API without breaking the clients you cannot see. Use when adding endpoints, changing a response shape, introducing versioning, pagination, idempotency or error codes, when a mobile client will lag behind the server, or when a "small" response change has to stay compatible with old builds.
license: MIT
---

# HTTP API contracts

Every field you remove is a client you break at a moment you do not control. An API contract is an
agreement with software you cannot upgrade — old mobile builds, partner integrations, a script someone
wrote in 2021 — and it deserves the same care as a database schema you can no longer migrate.

## When to use

- Adding or changing any endpoint a client consumes.
- Adding versioning, deprecation, pagination, filtering, idempotency or rate limits.
- A mobile app ships in weeks but the server deploys in minutes — the version skew is the design
  constraint.
- Someone proposes renaming a field, changing a status code, or "just returning an array instead".

## Ground rules

1. **Additive changes are safe; everything else is a breaking change.** New optional field, new
   endpoint, new enum value for a client that tolerates unknowns: safe. Rename, removal, type change,
   tighter validation, new required field, changed default, changed status code: breaking.
2. **The client you must not break is the one you cannot update.** Assume at least one client is six
   months old.
3. **Errors are part of the contract.** A stable machine-readable `code` plus a human message, the
   same shape on every endpoint, and a status code that matches the category.
4. **Money, time and identifiers have rules.** Minor units for money, RFC 3339 UTC for time, opaque
   string ids (never expose autoincrement).
5. **Every write that can be retried needs an idempotency key** — retries happen inside load
   balancers, SDKs and mobile networks whether you planned for them or not.
6. **The document and the server must agree.** An OpenAPI file that is hand-maintained and stale is
   worse than none; generate it or test it.

## Procedure

1. **Write the contract before the code**: method, path, request, response, errors, and what the other
   side does next. If you cannot describe the client's behaviour after the call, the design is
   incomplete.

2. **Classify the change** against the breaking list in rule 1, and say which bucket it is in, in the
   pull request.

3. **Shape the response for growth**: an object at the top level (never a bare array), a stable
   envelope for lists (`items`, plus pagination fields), and every new field optional in the schema
   until all known clients ignore its absence safely.

4. **Design errors once.** One envelope: `error.code` (stable, machine-readable), `error.message`
   (human), `error.details` (structured, optional), plus a request id the support person can quote.

5. **Make writes safe to repeat**: `Idempotency-Key` on creation and payment paths, stored with the
   response, replayed on repeat, and rejected if the payload differs under the same key.

6. **Paginate from the first version**, with a cursor rather than an offset if the data changes
   underneath. Decide the page-size cap and enforce it.

7. **Version only when you must**, in the path (`/v2`) or via a header — but choose one and never
   both. Prefer evolution (additive) over versions, and when you deprecate: announce, keep both
   running, return the sunset in headers, and set a date.

8. **Prove it**: contract tests for the response shape, a test that old fixtures still parse, and a
   check that the published schema is generated from the code.

## Anti-patterns

| Tempting move | Why it is wrong |
| --- | --- |
| Returning a bare array | No room to add pagination or metadata without a breaking change |
| `200 OK` with `{ "success": false }` | The status code stops meaning anything; every client grows a special case |
| Exposing database ids and column names | Couples your storage to the public contract forever |
| Silent default changes | A new default is a breaking change wearing a disguise |
| "We will version it later" | Later is after the first partner integrates |
| Deprecating without observation | You have no evidence anyone stopped using the old path, so you keep it forever |

## Definition of done

- [ ] The change is classified breaking or additive, in writing.
- [ ] Response shape can grow: object at the top level, list envelope with pagination.
- [ ] Errors use the shared envelope with a stable code; status codes match categories.
- [ ] Retryable writes have idempotency keys, with a test for the duplicate case.
- [ ] Time, money and identifiers follow the stated formats.
- [ ] The schema is generated or tested against the implementation; old fixtures still parse.
- [ ] If deprecating: sunset header, announcement, date, and a way to observe remaining usage.

## Report format

```
Change:     <method path> — <what is different>
Class:      additive | breaking (and why)
Client impact: <what an old build does after this ships>
Errors:     <codes added or changed>
Pagination: <shape, cap, cursor vs offset>
Idempotency: <key header, storage, replay behaviour>
Verified:   <contract test, old-fixture test, generated schema>
Deprecation: <none, or sunset date + how usage is measured>
```

The checklist that turns this into a review of an existing API, and the exact rules for compatibility,
are in [references/contract-checklist.md](references/contract-checklist.md).
