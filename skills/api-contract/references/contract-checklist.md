# Contract checklist

Use this to review an endpoint that already exists, or to sanity-check a new one before it ships.

## Compatibility rules

| Change | Breaking? | Notes |
| --- | --- | --- |
| Add an optional request field | No | Server must tolerate its absence forever |
| Add a response field | No | Provided clients ignore unknown fields (most do; verify) |
| Add a new enum value | **Usually yes** | A client with an exhaustive switch will fail on the unknown value |
| Remove a response field | Yes | Even if "nobody uses it" — you cannot see every client |
| Rename a field | Yes | Add the new one, dual-write, deprecate the old, remove after a window |
| Change a type (`string` → `number`, `null` → absent) | Yes | `null` and "absent" are different in most languages |
| Make an optional field required | Yes | Existing callers omit it |
| Tighten validation | Yes | Previously accepted input becomes a 400 |
| Change a default | Yes, quietly | Every caller that omitted the field behaves differently |
| Change a status code | Yes | Clients branch on it |
| Change pagination shape | Yes | Cursors vs offsets cannot be swapped silently |
| Add a required header | Yes | Omit a default and every client breaks at once |
| Reduce a rate limit | Usually yes | Effective availability change |

## Response shape

```jsonc
// Good: extensible, obvious, list-shaped for lists
{ "items": [ { "id": "ord_8f2", "total": 1299, "currency": "EUR" } ],
  "next": "c3RvcmVk…" }

// Avoid: no room to grow, no place for metadata
[ { "id": 8321, "total": 12.99 } ]
```

Rules:

- **Identifiers are opaque strings.** `id`, not `id` plus `database_id`. Never expose sequential
  integers for resources that are public.
- **Money** in minor units as integers, with an explicit currency code. Never floats for money.
- **Time** in RFC 3339 with an explicit offset, UTC by default (`2026-04-11T09:12:00Z`).
- **Null vs absent**: pick one convention and document it. "Absent means unchanged" and "null means
  clear the value" cannot both be true without a rule.
- **Enums**: document that new values may appear, and consider returning a `type` discriminator for
  anything polymorphic.

## Errors

```jsonc
{ "error": {
    "code": "payment_declined",
    "message": "The card was declined by the issuer.",
    "details": { "issuer_reason": "insufficient_funds" },
    "request_id": "req_9f3a"
  } }
```

| Status | Use for |
| --- | --- |
| 400 | Malformed body, wrong types — the client's request is invalid |
| 401 | Missing or invalid credentials |
| 403 | Authenticated, not allowed |
| 404 | Does not exist, or does not exist *for you* (do not leak existence) |
| 409 | Conflict: state changed, duplicate, version mismatch |
| 422 | Semantically invalid (business rule), body parses |
| 429 | Rate limited — include `Retry-After` |
| 5xx | Your fault. Never use it for validation errors |

Rules: one envelope everywhere, a stable machine-readable `code` that never changes meaning, a human
`message` that can change freely, and a `request_id` echoed in the logs so support can find the request.

## Pagination

| Style | Use when | Watch out |
| --- | --- | --- |
| Cursor (`next` token) | Data changes during traversal | Opaque token, never expose the underlying SQL |
| Offset (`page`, `limit`) | Static or small datasets | Shifting rows cause duplicates and gaps |
| Keyset (`after_id`) | Large, ordered, append-only | Needs a stable sort key |

Always: a documented maximum page size, a stable total order, and the same tie-breaker every time.

## Idempotency

- Accept `Idempotency-Key` on every non-idempotent write.
- Store key → (status, body) with a TTL longer than any plausible retry window (24 h is common).
- On repeat with the same key and same payload: replay the stored response.
- On repeat with the same key and a **different** payload: `409`, never a silent overwrite.
- Scope the key per authenticated client, not globally.

## Deprecation

```http
Deprecation: true
Sunset: Wed, 11 Nov 2026 23:59:59 GMT
Link: <https://docs.example.com/migrate-v1>; rel="deprecation"
```

Plus: an announcement with a date, a migration guide with before/after examples, a way to **measure**
remaining usage (per-key, per-client-version), and a removal scheduled only after that number is zero
or the date has passed with notice.

## Before shipping a new endpoint

- [ ] Named in the OpenAPI file (generated from code, or tested against it).
- [ ] Auth and permissions stated per endpoint, including the "not yours" case.
- [ ] Request validated with the same rules on the server that the schema claims.
- [ ] Errors use the shared envelope; no stack traces or internal ids leak.
- [ ] Pagination, filters and sort order defined with caps.
- [ ] Write paths are idempotent or documented as unsafe.
- [ ] Rate limit and payload size cap chosen, not left at "unlimited".
- [ ] A client can tell what to do next from the response alone — retry, fix input, or give up.
