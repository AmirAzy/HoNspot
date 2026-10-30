# Example: "the API is unreachable from staging"

A composite of three real reports, condensed. Same model, same tools, same prompt — one run without
the skill, one with it. The interesting part is not the fix; it is the five minutes before the fix.

---

## Without the skill

> **User:** When staging calls our API it times out. Everything is green in CI. Can you fix it?

> **Agent:** The most likely cause is that the connection is being dropped due to transient network
> issues. I've added a retry policy with exponential backoff to the client (`src/api/client.ts`), plus
> a 60-second timeout so slow responses do not fail early. This should make the calls resilient.

> **User:** It still times out.

> **Agent:** The retry may be exhausting the budget. I'll increase the timeout to 120 seconds and add
> a circuit breaker that falls back to the cache, so callers get a stale response instead of an error.
> Also, consider adding service discovery so the client does not depend on a fixed address.

Two code changes, both in the wrong layer. Nothing in either response contains a command, an address,
or a measurement. The retry policy now multiplies the load on a service that is not there.

---

## With `debug-connectivity` loaded

> **Agent:** Before changing anything, one sentence of symptom and four checks from the failing side.
> You said *staging* calls *our API*; I'll treat staging as the client host.

```bash
# 1. name
$ getent hosts api.internal
10.31.4.9        api.internal

# 2. route (from the staging box)
$ ip route get 10.31.4.9
10.31.4.9 via 10.31.0.1 dev eth0 src 10.31.4.20

# 3. port
$ nc -vz 10.31.4.9 8080
nc: connect to 10.31.4.9 port 8080 (tcp) failed: Connection timed out

# 4. the server's own view
$ ss -ltnp | grep 8080
LISTEN 0 511 127.0.0.1:8080 0.0.0.0:* users:(("node",pid=812,fd=21))
```

> **Agent:** Layer: **port**. The name resolves, the route exists, and the listener is not on the
> network at all — it is bound to `127.0.0.1:8080`, so it only accepts connections from inside that
> container. The timeout (rather than a refusal) is a second, separate thing: the platform's firewall
> drops packets to unpublished ports silently.
>
> Cause: the process reads `HOST` from the environment, and the staging manifest never sets it, so it
> falls back to the loopback default in `src/server.ts:41`.
>
> Fix: bind `0.0.0.0` in staging (`HOST=0.0.0.0`), and make the default fail loudly in production
> instead of quietly binding to loopback.
>
> No client change. The retry policy would have hidden this for a few minutes and tripled the load.

> **Verified:** from the staging box, `nc -vz 10.31.4.9 8080` → `succeeded!`, and `GET /health` returns
> `200` with the expected build id.
>
> **Not verified:** I did not test the same path from the second staging node, and I cannot see the
> platform firewall rules — I inferred the drop from the timeout and the bound address.

---

## What changed between the two runs

| | Without | With |
| --- | --- | --- |
| First action | Edit the client's retry policy | `getent hosts` |
| Wrong layer touched | Yes — twice | No |
| Evidence quoted | None | The `ss` line showing `127.0.0.1:8080` |
| Claim | "This should make the calls resilient" | A cause, a fix, and what was not checked |
| Cost of being wrong | A retry storm against a service that is not listening | Five commands |

The skill did not make the model smarter about networking. It changed the **order**: measure, name the
layer, then act — and it made "not verified" an acceptable sentence to write.
